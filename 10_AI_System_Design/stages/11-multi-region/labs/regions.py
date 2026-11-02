"""Pure recovery/capacity/economics worksheet. No DNS, network, replica, quorum, or cloud runs."""
from dataclasses import dataclass
import math


@dataclass(frozen=True)
class Recovery:
    destination: str
    failed_region: str
    allowed_regions: tuple
    authority_quorum: bool      # 2 of 3 EU voters reachable, so a new lease can be granted
    # After installing the new epoch as the minimum in every store the new writer will use,
    # each refused an old-epoch probe. The isolated region's stores are quarantined, not probed.
    old_epoch_rejected: bool
    approval_current: bool      # bundle matches the current approved generation in the authority store
    audit_ready: bool
    bundle_ready: bool
    # Last renewal minus the secondary's watermark, frozen at isolation (not "now minus last applied").
    gap_at_isolation_seconds: int
    # A partitioned live writer may acknowledge until its lease expires, so the loss bound adds
    # the whole lease, not one renewal interval: last renewal + lease - watermark.
    lease_seconds: int = 20
    rpo_seconds: int = 60
    rto_seconds: int = 600
    detection_seconds: int = 60
    fence_seconds: int = 30     # conservative: lease expiry mostly overlaps detection
    restore_seconds: int = 180
    route_seconds: int = 30
    validate_seconds: int = 60


def recover(plan):
    steps = [plan.detection_seconds, plan.fence_seconds, plan.restore_seconds,
             plan.route_seconds, plan.validate_seconds]
    if any(type(t) is not int or t < 0 for t in steps + [plan.gap_at_isolation_seconds, plan.lease_seconds, plan.rpo_seconds, plan.rto_seconds]):
        raise ValueError('nonnegative integer seconds required')
    planned = sum(steps)
    loss_bound = plan.gap_at_isolation_seconds + plan.lease_seconds
    reasons = []
    if plan.destination not in plan.allowed_regions: reasons.append('residency')
    if plan.destination == plan.failed_region: reasons.append('failed region is not a recovery target')
    # Without a quorum no lease can be granted, so fencing cannot even be evaluated.
    if not plan.authority_quorum: reasons.append('authority unavailable')
    elif not plan.old_epoch_rejected: reasons.append('writer not fenced')
    if not plan.approval_current: reasons.append('approval generation not current')
    if not plan.audit_ready: reasons.append('audit unavailable')
    if not plan.bundle_ready: reasons.append('bundle unavailable')
    if loss_bound > plan.rpo_seconds: reasons.append('RPO exceeded')
    # Safety gates decide promotion. A missed RTO is a planning result, reported separately and
    # never relabelled to fit: a safe but late recovery still proceeds.
    return {'eligible': not reasons, 'reasons': reasons, 'meets_rto': planned <= plan.rto_seconds,
            'planned_recovery_seconds': planned, 'loss_bound_seconds': loss_bound}


def capacity(rps, tokens_per_request, slot_seconds, unit_rps=20, target_utilisation=.7):
    if any(not math.isfinite(x) for x in (rps,tokens_per_request,slot_seconds,unit_rps,target_utilisation)):
        raise ValueError('finite values required')
    if min(rps,tokens_per_request,slot_seconds) < 0 or unit_rps <= 0 or not 0 < target_utilisation < 1:
        raise ValueError('invalid capacity input')
    return dict(replicas=math.ceil(rps/(unit_rps*target_utilisation)),
                provider_tpm=math.ceil(rps*tokens_per_request*60),
                in_flight=math.ceil(rps*slot_seconds))


def unit_cost(attempts, tokens_per_attempt, usd_per_million_tokens, fixed_usd, successes):
    """Monthly cost per successful workflow. USD per million tokens equals micro-USD per token."""
    for v in (attempts, tokens_per_attempt, usd_per_million_tokens, fixed_usd, successes):
        if type(v) is not int or v < 0: raise ValueError('nonnegative integers required')
    variable = attempts*tokens_per_attempt*usd_per_million_tokens
    total = variable + fixed_usd*1_000_000
    return dict(variable_microusd=variable, total_microusd=total,
                per_success_microusd=total/successes if successes else None)


class Ledger:
    """Usage evidence keyed by (tenant, operation, attempt): a redelivered attempt counts once,
    a retry attempt (even in another region) is extra spend, and a changed attempt is a conflict."""
    def __init__(self): self.entries = {}

    def record(self, tenant, operation, attempt, region, cost_microusd, success):
        if not tenant or not operation or not attempt or not region or type(cost_microusd) is not int or cost_microusd < 0 or type(success) is not bool:
            raise ValueError('invalid usage')
        key=(tenant,operation,attempt);value=(region,cost_microusd,success)
        if key in self.entries and self.entries[key] != value:
            raise ValueError('conflicting usage evidence')
        self.entries[key]=value

    def economics(self, fixed_microusd):
        if type(fixed_microusd) is not int or fixed_microusd < 0: raise ValueError('invalid fixed cost')
        total=fixed_microusd+sum(v[1] for v in self.entries.values())
        # Success is customer value: one per operation, however many attempts reported it.
        successes=len({k[:2] for k,v in self.entries.items() if v[2]})
        return dict(total_microusd=total,attempts=len(self.entries),successes=successes,
                    per_success_microusd=total/successes if successes else None)
