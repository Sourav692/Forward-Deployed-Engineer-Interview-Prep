"""A deterministic model-lifecycle design exercise, not a trainer or HTTP server.

Callers supply trusted tenant/role context. In-memory state is deliberate: restart,
concurrent writers, attestation, and object storage are production design work.
"""
from dataclasses import dataclass
from hashlib import sha256
import json


def digest(value):
    return sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


@dataclass(frozen=True)
class Dataset:
    tenant: str
    version: str
    rows: tuple
    checksum: str


def dataset(tenant, version, rows):
    if not tenant or not version or not rows:
        raise ValueError('empty dataset identity or content')
    ids, groups = set(), {}
    frozen = []
    for row in rows:
        if set(row) != {'id', 'group', 'split', 'input', 'target', 'approved'}:
            raise ValueError('dataset schema')
        if not all(isinstance(row[k], str) and row[k] for k in ('id','group','input','target')):
            raise ValueError('empty or invalid example')
        if row['id'] in ids or row['split'] not in ('train','validation','test') or row['approved'] is not True:
            raise ValueError('duplicate, split, or consent')
        if row['group'] in groups and groups[row['group']] != row['split']:
            raise ValueError('supplier group leaks across splits')
        ids.add(row['id']); groups[row['group']] = row['split']
        frozen.append(tuple(sorted(row.items())))
    if {dict(r)['split'] for r in frozen} != {'train','validation','test'}:
        raise ValueError('missing holdout')
    return Dataset(tenant, version, tuple(frozen), digest(frozen))


class Lifecycle:
    def __init__(self):
        self.datasets = {}; self.jobs = {}; self.reports = {}; self.pointer = {}; self.generation = {}

    def register(self, data):
        key = (data.tenant, data.version)
        if key in self.datasets and self.datasets[key] != data:
            raise ValueError('immutable dataset conflict')
        self.datasets[key] = data

    def submit(self, tenant, key, version, base, recipe):
        if (tenant, version) not in self.datasets or not key or not base or not recipe:
            raise ValueError('unknown dataset or incomplete request')
        config = (self.datasets[tenant, version].checksum, base, recipe)
        scoped = (tenant, key)
        if scoped in self.jobs:
            if self.jobs[scoped]['config'] != config:
                raise ValueError('idempotency conflict')
            return self.jobs[scoped]['state']
        self.jobs[scoped] = dict(config=config, state='queued', checkpoint=None, artifact=None)
        return 'queued'

    def checkpoint(self, tenant, key, step, checksum):
        job = self.jobs[tenant, key]
        if job['state'] not in ('queued','training') or type(step) is not int or step <= 0 or not checksum:
            raise ValueError('checkpoint state or identity')
        if job['checkpoint'] and step <= job['checkpoint'][0]:
            raise ValueError('non-monotonic checkpoint')
        job.update(state='training', checkpoint=(step,checksum))

    def complete(self, tenant, key, artifact):
        job = self.jobs[tenant, key]
        if job['state'] != 'training' or not job['checkpoint'] or not artifact:
            raise ValueError('incomplete training evidence')
        job.update(state='candidate', artifact=artifact)

    def evaluate(self, tenant, key, report):
        job = self.jobs[tenant, key]
        expected = {'artifact','dataset','evaluator','schema_pass','safety_failures','n'}
        if job['state'] != 'candidate' or set(report) != expected:
            raise ValueError('report schema or state')
        if report['artifact'] != job['artifact'] or report['dataset'] != job['config'][0] or report['evaluator'] != 'supplier-v1':
            raise ValueError('report identity mismatch')
        if type(report['n']) is not int or report['n'] < 200 or type(report['schema_pass']) is not int or type(report['safety_failures']) is not int:
            raise ValueError('report counts')
        if not 0 <= report['schema_pass'] <= report['n'] or not 0 <= report['safety_failures'] <= report['n']:
            raise ValueError('report bounds')
        # Report counts are trusted fixture evidence, never calibrated model quality.
        self.reports[tenant,key] = dict(report)
        return report['schema_pass'] / report['n'] >= .98 and report['safety_failures'] == 0

    def approve(self, tenant, key, role, generation):
        report = self.reports.get((tenant,key))
        if role != 'release-approver' or not report:
            raise PermissionError('trusted approval required')
        if generation != self.generation.get(tenant,0):
            raise ValueError('stale generation')
        if report['schema_pass']/report['n'] < .98 or report['safety_failures']:
            raise ValueError('quality gate blocked')
        self.pointer[tenant] = (self.jobs[tenant,key]['artifact'],self.jobs[tenant,key]['config'])
        self.generation[tenant] = generation + 1
        return self.pointer[tenant]
