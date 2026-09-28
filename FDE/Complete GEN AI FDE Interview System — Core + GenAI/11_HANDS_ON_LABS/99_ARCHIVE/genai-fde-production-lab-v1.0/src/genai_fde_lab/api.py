from fastapi import FastAPI
from .models import AskRequest, AskResponse, ToolRequest
from .rag import answer_question
from .tools import evaluate_tool_request
from .audit import audit_event

app = FastAPI(title='GenAI FDE Production Lab')

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/ask', response_model=AskResponse)
def ask(req: AskRequest):
    result = answer_question(req.question, req.tenant, req.role)
    event = audit_event('ask', req.tenant, req.role, 'safe' if result['safe'] else 'blocked_or_constrained')
    return AskResponse(**result, audit_event=event)

@app.post('/tool-request')
def tool_request(req: ToolRequest):
    decision = evaluate_tool_request(req.role, req.tool_name, req.arguments)
    decision['audit_event'] = audit_event('tool_request', req.tenant, req.role, 'approved' if decision['approved'] else 'approval_required')
    return decision
