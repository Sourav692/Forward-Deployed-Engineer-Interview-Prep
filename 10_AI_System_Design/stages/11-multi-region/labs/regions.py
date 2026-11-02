"""Pure recovery/capacity worksheet. No DNS, network, replica, or cloud runs."""
from dataclasses import dataclass
import math


@dataclass(frozen=True)
class Recovery:
    destination: str
    allowed_regions: tuple
    fence_confirmed: bool
    policy_current: bool
    audit_ready: bool
    bundle_ready: bool
    copy_lag_seconds: int
    rpo_seconds: int = 60
    detection_seconds: int = 60
    fence_seconds: int = 30
    restore_seconds: int = 180
    route_seconds: int = 30
    validate_seconds: int = 60


def recover(plan):
    times = [plan.copy_lag_seconds, plan.rpo_seconds, plan.detection_seconds,
             plan.fence_seconds, plan.restore_seconds, plan.route_seconds, plan.validate_seconds]
    if any(type(t) is not int or t < 0 for t in times):
        raise ValueError('nonnegative integer seconds required')
    reasons = []
    if plan.destination not in plan.allowed_regions: reasons.append('residency')
    if not plan.fence_confirmed: reasons.append('writer not fenced')
    if not plan.policy_current: reasons.append('current policy unavailable')
    if not plan.audit_ready: reasons.append('audit unavailable')
    if not plan.bundle_ready: reasons.append('bundle unavailable')
    if plan.copy_lag_seconds > plan.rpo_seconds: reasons.append('RPO exceeded')
    return {'eligible': not reasons, 'reasons': reasons,
            'planned_rto_seconds': sum(times[2:]), 'possible_loss_seconds': plan.copy_lag_seconds}


def capacity(rps, tokens_per_request, slot_seconds, unit_rps=20, target_utilisation=.7):
    if any(not math.isfinite(x) for x in (rps,tokens_per_request,slot_seconds,unit_rps,target_utilisation)):
        raise ValueError('finite values required')
    if min(rps,tokens_per_request,slot_seconds) < 0 or unit_rps <= 0 or not 0 < target_utilisation < 1:
        raise ValueError('invalid capacity input')
    return dict(replicas=math.ceil(rps/(unit_rps*target_utilisation)),
                provider_tpm=math.ceil(rps*tokens_per_request*60),
                in_flight=math.ceil(rps*slot_seconds))


class Ledger:
    """Deduplicate billing evidence by original operation identity, never request count."""
    def __init__(self): self.entries = {}

    def record(self, tenant, operation, region, cost_microusd, success):
        if not tenant or not operation or not region or type(cost_microusd) is not int or cost_microusd < 0 or type(success) is not bool:
            raise ValueError('invalid usage')
        key=(tenant,operation);value=(region,cost_microusd,success)
        if key in self.entries and self.entries[key] != value:
            raise ValueError('conflicting usage evidence')
        self.entries[key]=value

    def economics(self, fixed_microusd):
        if type(fixed_microusd) is not int or fixed_microusd < 0: raise ValueError('invalid fixed cost')
        total=fixed_microusd+sum(v[1] for v in self.entries.values())
        successes=sum(v[2] for v in self.entries.values())
        return dict(total_microusd=total,successes=successes,
                    per_success_microusd=total/successes if successes else None)
