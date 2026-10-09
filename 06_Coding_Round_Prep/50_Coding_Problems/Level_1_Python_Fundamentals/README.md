# Level 1: Python Fundamentals in GenAI Context

Ten short Python problems that clean, check and plumb the data around a model call, each set in a real enterprise AI workflow.

| Notebook | Problems | Theory file | What it trains |
|----------|----------|-------------|----------------|
| [01_clean_connector_data.ipynb](01_clean_connector_data.ipynb) | 1. Deduplicate Webhook Events; 2. Normalize Messy CRM Records | [01_clean_connector_data_THEORY.md](01_clean_connector_data_THEORY.md) | Cleaning untrusted connector data into one safe, predictable shape |
| [02_validate_before_running.ipynb](02_validate_before_running.ipynb) | 3. Validate JSON Tool-Call Arguments; 6. Prompt Template Variable Validation | [02_validate_before_running_THEORY.md](02_validate_before_running_THEORY.md) | Checking model and customer text against an allow list before it runs |
| [03_text_safety_filters.ipynb](03_text_safety_filters.ipynb) | 4. Sanitize PII from Documents; 5. Detect Prompt Injection Patterns; 9. Safe Output Filtering | [03_text_safety_filters_THEORY.md](03_text_safety_filters_THEORY.md) | Simple text guardrails, and explaining what each one misses |
| [04_model_call_plumbing.ipynb](04_model_call_plumbing.ipynb) | 7. Conversation Memory Trimming; 8. Merge Streaming Partial Responses; 10. Calculate Token Cost per Customer | [04_model_call_plumbing_THEORY.md](04_model_call_plumbing_THEORY.md) | Handling what goes into a model call, what comes out, and what it costs |
