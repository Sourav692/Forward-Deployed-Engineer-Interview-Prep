# Level 2: Enterprise Data Processing for AI

Problems 11 to 20: clean, compare, protect and monitor the enterprise data that feeds a GenAI system.

| Notebook | Problems | Theory file | What it trains |
| --- | --- | --- | --- |
| [01_prepare_documents_for_rag.ipynb](01_prepare_documents_for_rag.ipynb) | 11 Chunk Documents with Overlap; 19 Partial Document Ingestion; 20 PII Redaction Validation | [01_prepare_documents_for_rag_THEORY.md](01_prepare_documents_for_rag_THEORY.md) | Getting documents into a RAG index safely: chunk them, keep good pages, and check redaction. |
| [02_compare_and_match_records.ipynb](02_compare_and_match_records.ipynb) | 13 Reconcile CRM and Data Warehouse Records; 18 Data Connector Sync Conflict Detection; 15 Duplicate Support Ticket Detection | [02_compare_and_match_records_THEORY.md](02_compare_and_match_records_THEORY.md) | Finding where records disagree or repeat, with clean keys and a stable report. |
| [03_access_control_and_audit.ipynb](03_access_control_and_audit.ipynb) | 12 Filter RAG Chunks by User Permissions; 17 Audit Log Generation | [03_access_control_and_audit_THEORY.md](03_access_control_and_audit_THEORY.md) | Keeping tenants apart, failing closed, and logging tool calls without leaking secrets. |
| [04_support_and_ops_signals.ipynb](04_support_and_ops_signals.ipynb) | 14 Parse Logs and Detect Slow Tenants; 16 Customer Escalation Detection | [04_support_and_ops_signals_THEORY.md](04_support_and_ops_signals_THEORY.md) | Turning messy logs and messages into clear, explainable signals for support teams. |
