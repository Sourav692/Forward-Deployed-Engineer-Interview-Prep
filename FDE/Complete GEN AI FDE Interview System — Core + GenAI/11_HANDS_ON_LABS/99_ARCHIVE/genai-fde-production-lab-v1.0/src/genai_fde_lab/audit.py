import time, uuid

def audit_event(event_type: str, tenant: str, role: str, status: str):
    return {'request_id': str(uuid.uuid4()), 'ts': str(int(time.time())), 'event_type': event_type, 'tenant': tenant, 'role': role, 'status': status}
