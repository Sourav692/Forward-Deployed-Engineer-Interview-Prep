from .data import DOCUMENTS

SUSPICIOUS_PATTERNS = ["ignore previous instructions", "reveal payroll", "developer mode", "bypass approval", "api keys"]

def detect_attack(text: str):
    lower = text.lower()
    return [p for p in SUSPICIOUS_PATTERNS if p in lower]

def retrieve(question: str, tenant: str, role: str, k: int = 3):
    q = set(question.lower().replace('?', '').split())
    scored = []
    for doc in DOCUMENTS:
        if doc['tenant'] != tenant:
            continue
        if role not in doc['roles']:
            continue
        tokens = set(doc['text'].lower().replace(':','').replace('.','').split())
        score = len(q & tokens)
        if score > 0:
            scored.append((score, doc))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [d for _, d in scored[:k]]

def answer_question(question: str, tenant: str, role: str):
    signals = detect_attack(question)
    docs = retrieve(question, tenant, role)
    for d in docs:
        signals.extend([f"retrieved_doc_contains:{s}" for s in detect_attack(d['text'])])
    if signals:
        return {
            'answer': 'I cannot follow instructions that request secret, cross-tenant, or unsafe behavior. I can answer using approved policy documents only.',
            'citations': [d['id'] for d in docs if not detect_attack(d['text'])],
            'safe': False,
            'detection_signals': signals,
        }
    if not docs:
        return {'answer':'I do not have enough permitted context to answer safely.', 'citations':[], 'safe': True, 'detection_signals':[]}
    summary = ' '.join(d['text'] for d in docs)
    return {'answer': f'Based on permitted context: {summary}', 'citations':[d['id'] for d in docs], 'safe': True, 'detection_signals':[]}
