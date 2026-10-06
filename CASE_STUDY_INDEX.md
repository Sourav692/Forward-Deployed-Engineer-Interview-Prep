# Case Study Index

Every case study, customer story and FDE scenario in this repository, grouped by what the case is about. Each row is one case, with a one-line summary and the file to open.

How to read the paths:

- **Scenario packs (G01–G20)** each have four files in the same folder: the unchanged source (`Gxx_<Name>.md`), the interview guide (`_Main.md`), a deep dive (`_Deep_Dive.md`) and a cheat sheet (`_Cheat_Sheet.md`). The table points at the interview guide.
- **Long-form tutorials** exist in `Version_1/` (prose) and `Version_2/` (bullet cram format, `_v2.md`). The table points at Version 2.
- **Worksheets** have a matching answer key in the sibling `answer_keys/` folder (`<name>_answer_key.md`).
- **Decomposition prompts** (last section) live in one question bank file. `08_Company_Specific_Prep/OpenAI_Applied/Sample_Questions/OpenAI Applied_Engineer_Problem_Decomposition_Questions.md` mirrors the same 23 prompts.

Folder prefixes used below: `02_SD` = `02_System_Design_Case_Studies`, `03_PW` = `03_Practice_Worksheets_and_Keys`, `01_CT` = `01_Concept_Tutorials`.

## 1. Enterprise knowledge, search and RAG

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G01 Enterprise Knowledge Assistant | Permission-aware RAG over enterprise documents, where retrieval must respect each user's access rights. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G01_Enterprise_Knowledge_Assistant/G01_Enterprise_Knowledge_Assistant_Main.md` |
| Enterprise Knowledge Assistant with RAG (Ch 1) | Long-form walkthrough of designing a RAG assistant from ingestion to evaluation. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-1-enterprise-knowledge-assistant-rag-tutorial_v2.md` |
| Enterprise Knowledge Assistant with RAG | Fill-in system design worksheet for the RAG assistant case. | Worksheet + key | `03_PW/System_Design_Worksheets/01_enterprise_knowledge_assistant_rag.md` |
| Internal Knowledge Assistant for Enterprise Support | Customer-discovery worksheet: scope a support team's internal knowledge assistant. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/01_internal_knowledge_assistant.md` |
| Internal Knowledge Assistant (full mock) | Full timed mock interview on the internal knowledge assistant. | Mock interview | `03_PW/Mock_Interviews/Full_Mock_Interviews/01_internal_knowledge_assistant_full_mock.md` |
| Internal Knowledge Assistant (short mock) | Short practice mock on the same case. | Mock interview | `03_PW/Mock_Interviews/Short_Practice_Mocks/01_internal_knowledge_assistant_mock.md` |
| Case 1: Enterprise AI Assistant over 100+ Applications | One assistant that reaches into 100+ enterprise apps through layered integrations. | Casebook | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/01_Enterprise_AI_Assistant.md` |
| Enterprise AI Assistant Design | Course version of the 100+ application enterprise assistant. | Course walkthrough | `02_SD/Classic_Design_Walkthroughs/System_Design_Course/5. Enterprise AI Assistant Design.md` |
| Enterprise AI Assistant: Integration Layers at Scale | Published lesson version of Case 1, focused on the integration layers. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/01_Enterprise_AI_Assistant_Integration_Layers_at_Scale.md` |
| Whiteboard: Enterprise RAG with Access Control | Spoken whiteboard script for access-controlled enterprise RAG. | Whiteboard script | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/whiteboard_scripts/01_Enterprise_RAG_With_Access_Control.md` |
| Whiteboard: Enterprise RAG on Databricks | The same access-controlled RAG design, mapped onto Databricks services. | Whiteboard script | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/whiteboard_scripts/02_Enterprise_RAG_On_Databricks.md` |
| Access-Controlled Enterprise RAG | Lesson version of the access-controlled RAG whiteboard. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/06_Access_Controlled_Enterprise_RAG.md` |
| Access-Controlled RAG on Databricks | Lesson version of the Databricks RAG whiteboard. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/07_Access_Controlled_RAG_on_Databricks.md` |
| Enterprise Chatbot Platform, "Our Own ChatGPT" (Ch 21) | An internal ChatGPT-style platform for a whole company: models, data, guardrails, cost. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-21-enterprise-chatbot-platform-tutorial-condensed_v2.md` (copy: `02_SD/Standalone_Designs/26_Enterprise_Chatbot_Platform/3_Tutorial_V2.md`) |
| Enterprise Chatbot Platform | Fill-in worksheet for the internal chatbot platform. | Worksheet + key | `03_PW/System_Design_Worksheets/21_enterprise_chatbot_platform.md` |

## 2. Customer support and service

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G02 Customer Support Automation | Support automation as a routed decision pipeline: deflect, assist or escalate each ticket. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G02_Customer_Support_Automation/G02_Customer_Support_Automation_Main.md` |
| AI Customer-Support Automation (Ch 4) | Long-form design of an AI system that resolves support tickets end to end. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-4-ai-customer-support-automation-tutorial_v2.md` |
| AI Customer-Support Automation | Fill-in worksheet for the support automation case. | Worksheet + key | `03_PW/System_Design_Worksheets/04_ai_customer_support_automation.md` |
| Case 2: Customer Support AI Assistant | Support assistant that answers from knowledge, takes actions and asks for approval. | Casebook | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/02_Customer_Support_Assistant.md` |
| Customer Support AI Assistant Design | Course version of the customer support assistant. | Course walkthrough | `02_SD/Classic_Design_Walkthroughs/System_Design_Course/6. Customer Support AI Assistant Design.md` |
| Customer Support Assistant: Knowledge, Actions, and Approval | Lesson version of Case 2. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/02_Customer_Support_Assistant_Knowledge_Actions_and_Approval.md` |
| Multi-Tenant SaaS Support Assistant | Discovery worksheet: one support assistant serving many SaaS tenants without data leaks. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/07_multi_tenant_saas_support.md` |
| Multi-Tenant SaaS Assistant (full mock) | Full timed mock on the multi-tenant support assistant. | Mock interview | `03_PW/Mock_Interviews/Full_Mock_Interviews/05_multi_tenant_saas_full_mock.md` |
| Multi-Tenant SaaS Assistant (short mock) | Short practice mock on the same case. | Mock interview | `03_PW/Mock_Interviews/Short_Practice_Mocks/05_multi_tenant_saas_mock.md` |
| Agentic Support Workflow (full mock) | Full timed mock on a support workflow where agents take actions. | Mock interview | `03_PW/Mock_Interviews/Full_Mock_Interviews/02_agentic_support_workflow_full_mock.md` |
| Agentic Support Workflow (short mock) | Short practice mock on the same case. | Mock interview | `03_PW/Mock_Interviews/Short_Practice_Mocks/02_agentic_support_workflow_mock.md` |
| ServiceNow Ticket Automation Agent | Discovery worksheet: an agent that triages and updates ServiceNow tickets. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/09_service_now_ticket_agent.md` |
| G16 Real-Time Call Assistant | Live assistant for sales and service calls under tight streaming latency. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G16_Real_Time_Call_Assistant/G16_Real_Time_Call_Assistant_Main.md` |

## 3. Agents, tools and workflow automation

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G03 Tool-Using Agent with Safety Controls | An agent that calls real tools, with permissions, approvals and blast-radius limits. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G03_Tool_Using_Agent_With_Safety_Controls/G03_Tool_Using_Agent_With_Safety_Controls_Main.md` |
| Tool-Using AI Agent with Safety Controls (Ch 11) | Long-form design of the safe tool-using agent. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-11-tool-using-ai-agent-with-safety-controls-tutorial_v2.md` |
| Tool-Using AI Agent with Safety Controls | Fill-in worksheet for the safe tool-using agent. | Worksheet + key | `03_PW/System_Design_Worksheets/11_tool_using_ai_agent_with_safety_controls.md` |
| G15 Agent Platform for Non-Technical Users | A platform where business users build agents without breaking production systems. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G15_Agent_Platform_For_Non_Technical_Users/G15_Agent_Platform_For_Non_Technical_Users_Main.md` |
| Whiteboard: Agent Platform for Non-Technical Users | Spoken whiteboard script for the non-technical agent platform. | Whiteboard script | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/whiteboard_scripts/03_Agent_Platform_For_Non_Technical_Users.md` |
| Safe Workflow Automation for Non-Technical Users | Lesson version of the agent platform whiteboard. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/08_Safe_Workflow_Automation_for_Non_Technical_Users.md` |
| Reliable Workflow Orchestration System (Ch 13) | Durable multi-step workflows with retries, idempotency and recovery. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-13-reliable-workflow-orchestration-system-tutorial_v2.md` (copy: `02_SD/Standalone_Designs/23_Reliable_Workflow_Orchestration/3_Tutorial_V2.md`) |
| Reliable Workflow Orchestration System | Fill-in worksheet for workflow orchestration. | Worksheet + key | `03_PW/System_Design_Worksheets/13_reliable_workflow_orchestration_system.md` |
| Configurable Platform for Customer-Specific Workflows (Ch 17) | One platform that each customer configures into its own workflow without forking code. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-17-configurable-platform-customer-specific-workflows-tutorial_v2.md` (copy: `02_SD/Standalone_Designs/25_Configurable_Platform_Customer_Workflows/3_Tutorial_V2.md`) |
| Configurable Platform for Customer-Specific Workflows | Fill-in worksheet for the configurable platform. | Worksheet + key | `03_PW/System_Design_Worksheets/17_configurable_platform_customer_specific_workflows.md` |
| G11 Deep Research Agent | A consumer-scale agent that plans, searches and writes long research reports. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G11_Deep_Research_Agent/G11_Deep_Research_Agent_Main.md` |
| Case Study: Research Platform | A deployed multi-agent research-report system on AWS, walked layer by layer. | Handbook case study | `01_CT/FDE_Handbook/07_Multi_Agent_Systems/04_Case_Study_Research_Platform.md` |
| Case Study: Supervisor to Deep Agent | A governed data assistant for a life insurer, told as its evolution from monolith to supervisor to deep agent. | Handbook case study | `01_CT/FDE_Handbook/07_Multi_Agent_Systems/05_Case_Study_Supervisor_To_Deep_Agent.md` |
| Self-Adapting Agent | An agent that changes its own behaviour for new tasks, and how to stop each change becoming an unreviewed regression. | Standalone design | `02_SD/Standalone_Designs/80_Self_Adapting_Agent/80_Self_Adapting_Agent.md` (template: `02_SD/Standalone_Designs/80_Self_Adapting_Agent/self_adapting_agent_fde_interview_template.md`) |
| Personal Assistant with Memory | An assistant that remembers enough to feel personal and forgets enough to stay fast and private. | Standalone design | `02_SD/Standalone_Designs/98_Personal_Assistant_With_Memory/98_Personal_Assistant_With_Memory.md` |
| Worked Example: The Travel Agent | Multi-region agentic travel assistant; a reviewer corrects five structural mistakes in its reference diagram. | Worked example | `02_SD/Standalone_Designs/14_Travel_Agent_Worked_Example/1_Handbook_Worked_Example_Travel_Agent.md` (source: `02_SD/Standalone_Designs/14_Travel_Agent_Worked_Example/2_FDE_System_Design_Overview_source.md`; handbook copy: `01_CT/FDE_Handbook/02_System_Design_Fundamentals/04_Worked_Example_Travel_Agent.md`) |

## 4. Coding assistants

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G09 Enterprise Coding Assistant | Code completion and chat over a large codebase within a 300 ms budget. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G09_Enterprise_Coding_Assistant/G09_Enterprise_Coding_Assistant_Main.md` |
| Case 3: AI-Powered Coding Assistant | Casebook design of an IDE coding assistant. | Casebook | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/03_Coding_Assistant.md` |
| AI Powered Coding Assistant Design | Course version of the coding assistant. | Course walkthrough | `02_SD/Classic_Design_Walkthroughs/System_Design_Course/7. AI Powered Coding Assistant Design.md` |
| Coding Assistant: Context Engineering Under 300 ms | Lesson version of Case 3, focused on picking context fast. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/03_Coding_Assistant_Context_Engineering_Under_300_ms.md` |

## 5. Data, analytics and batch processing

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G06 Natural Language over Governed Data | Let business users ask questions of governed data without bypassing its controls. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G06_NL_Over_Governed_Data/G06_NL_Over_Governed_Data_Main.md` |
| Natural-Language-to-SQL Analytics Assistant (Ch 3) | Long-form design of a text-to-SQL assistant with validation and safe execution. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-3-natural-language-to-sql-analytics-assistant-tutorial_v2.md` |
| Natural-Language-to-SQL Analytics Assistant | Fill-in worksheet for the text-to-SQL case. | Worksheet + key | `03_PW/System_Design_Worksheets/03_natural_language_to_sql_analytics_assistant.md` |
| Retail Demand Forecast Explanation Assistant | Discovery worksheet: explain demand forecasts to retail planners in plain language. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/08_retail_demand_explainer.md` |
| Executive Dashboard Copilot | Discovery worksheet: a copilot that answers executives' questions about their dashboards. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/10_executive_dashboard_copilot.md` |
| G10 High-Volume Batch Pipeline | Batch inference and document pipelines processing millions of items cheaply and reliably. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G10_High_Volume_Batch_Pipeline/G10_High_Volume_Batch_Pipeline_Main.md` |
| High-Volume Batch Inference System (Ch 10) | Long-form design of the batch inference system. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-10-high-volume-batch-inference-system-tutorial_v2.md` |
| High-Volume Batch Inference System | Fill-in worksheet for batch inference. | Worksheet + key | `03_PW/System_Design_Worksheets/10_high_volume_batch_inference_system.md` |

## 6. Industry and domain copilots

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G05 Sales Copilot | A copilot that preps account executives with account research and next steps. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G05_Sales_Copilot/G05_Sales_Copilot_Main.md` |
| Sales Copilot for Account Executives | Discovery worksheet for the sales copilot. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/02_sales_copilot.md` |
| G08 Document Review Copilot | Document review where an LLM drafts findings and a policy check gates them. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G08_Document_Review_Copilot/G08_Document_Review_Copilot_Main.md` |
| Financial Compliance Document Reviewer | Discovery worksheet: review financial documents for compliance issues. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/03_financial_compliance_reviewer.md` |
| Financial Compliance + Red Team (full mock) | Full timed mock on the compliance reviewer, including adversarial testing. | Mock interview | `03_PW/Mock_Interviews/Full_Mock_Interviews/03_financial_red_team_full_mock.md` |
| Financial Compliance + Red Team (short mock) | Short practice mock on the same case. | Mock interview | `03_PW/Mock_Interviews/Short_Practice_Mocks/03_financial_red_team_mock.md` |
| Healthcare Prior Authorization Assistant | Discovery worksheet: speed up insurance prior-authorization requests in healthcare. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/04_healthcare_prior_auth_assistant.md` |
| Legal Contract Review Copilot | Discovery worksheet: a copilot that flags risky clauses for lawyers. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/05_legal_contract_copilot.md` |
| Case 4: AI-Powered Recruiting Platform | Screen, rank and schedule candidates while recruiters keep the final decision. | Casebook | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/04_Recruiting_Platform.md` (copy: `02_SD/Standalone_Designs/04_Recruiting_Platform/1_Handbook_Casebook_Recruiting_Platform.md`) |
| AI Powered Recruiting Platform Design | Long reference design of the recruiting platform. | Course walkthrough | `02_SD/Classic_Design_Walkthroughs/System_Design_Course/8. AI Powered Recruiting Platform Design.md` (long form: `02_SD/Standalone_Designs/04_Recruiting_Platform/2_FDE_Recruiting_Platform_Design_long.md`) |
| Recruiting Platform: Explainable Ranking, Human Decisions | Lesson version of Case 4. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/04_Recruiting_Platform_Explainable_Ranking_Human_Decisions.md` |
| G17 Logistics Exception Handling | An agent that handles shipment exceptions and reroutes deliveries. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G17_Logistics_Exception_Handling/G17_Logistics_Exception_Handling_Main.md` |
| Case 5: AI Logistics Exception-Handling Assistant | Casebook design of the logistics assistant, framed as the FDE round. | Casebook | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/05_Logistics_Exception_Handling.md` |
| AI Logistics Exception-Handling Assistant Design | Course version of the logistics assistant. | Course walkthrough | `02_SD/Classic_Design_Walkthroughs/System_Design_Course/AI Logistics Exception-Handling Assistant Design.md` |
| Mock: AI Exception-Handling Assistant | Mock interview transcript on the logistics case. | Mock interview | `02_SD/Classic_Design_Walkthroughs/System_Design_Course/Mock - AI Exception-Handling Assistant.md` |
| Logistics Exceptions: Designing Around a Policy Gate | Lesson version of Case 5. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/05_Logistics_Exceptions_Designing_Around_a_Policy_Gate.md` |

## 7. Platform, infrastructure and security

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G07 Secure Multi-Tenant AI Platform | A shared AI platform where tenants' data, prompts and costs stay isolated. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G07_Secure_Multi_Tenant_AI_Platform/G07_Secure_Multi_Tenant_AI_Platform_Main.md` |
| Secure Multi-Tenant AI Platform (Ch 2) | Long-form design of the multi-tenant platform. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-2-secure-multi-tenant-ai-platform-tutorial_v2.md` |
| Secure Multi-Tenant AI Platform | Fill-in worksheet for the multi-tenant platform. | Worksheet + key | `03_PW/System_Design_Worksheets/02_secure_multi_tenant_ai_platform.md` |
| AI System for an Air-Gapped Environment (Ch 7) | Run an AI system with no internet: local models, offline updates, strict audit. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-7-ai-system-for-an-air-gapped-environment-tutorial_v2.md` (copy: `02_SD/Standalone_Designs/19_Air_Gapped_AI_System/3_Tutorial_V2.md`) |
| AI System for an Air-Gapped Environment | Fill-in worksheet for the air-gapped case. | Worksheet + key | `03_PW/System_Design_Worksheets/07_ai_system_for_an_air_gapped_environment.md` |
| G18 Consumer-Scale Chat Service | ChatGPT-shaped chat for 100M daily users: streaming, history, admission and GPU cost. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G18_Consumer_Scale_Chat_Service/G18_Consumer_Scale_Chat_Service_Main.md` |
| G19 Model Development and Post-Training | Build a maths-solving model from data through SFT, post-training and evaluation. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G19_Model_Development_And_Post_Training/G19_Model_Development_And_Post_Training_Main.md` |
| G20 LLM Inference Serving | Serve LLMs with batching, routing and failover across GPU fleets. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G20_LLM_Inference_Serving/G20_LLM_Inference_Serving_Main.md` |
| Production LLM Gateway Under Real Constraints | A gateway where safety checks and fallback hops share a three-second budget. | Standalone design | `02_SD/Standalone_Designs/100_Production_LLM_Gateway/100_Production_LLM_Gateway.md` |

## 8. Operations, evaluation and observability

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G04 SRE Incident Response Agent | An agent that helps an SRE team triage and respond to incidents safely. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G04_SRE_Incident_Response_Agent/G04_SRE_Incident_Response_Agent_Main.md` |
| SRE Incident Triage Agent | Discovery worksheet for the SRE triage agent. | Discovery worksheet + key | `03_PW/Customer_Discovery_Worksheets/06_sre_triage_agent.md` |
| SRE Triage Agent (full mock) | Full timed mock on the SRE triage agent. | Mock interview | `03_PW/Mock_Interviews/Full_Mock_Interviews/04_sre_triage_full_mock.md` |
| SRE Triage Agent (short mock) | Short practice mock on the same case. | Mock interview | `03_PW/Mock_Interviews/Short_Practice_Mocks/04_sre_triage_mock.md` |
| G13 Evaluation and Release Gating | Evaluation and release gates for thirty AI applications sharing one platform. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G13_Evaluation_And_Release_Gating/G13_Evaluation_And_Release_Gating_Main.md` |
| LLM Evaluation and Release-Gating Platform (Ch 9) | Long-form design of the evaluation and release-gating platform. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-9-llm-evaluation-and-release-gating-platform-tutorial_v2.md` |
| LLM Evaluation and Release-Gating Platform | Fill-in worksheet for release gating. | Worksheet + key | `03_PW/System_Design_Worksheets/09_llm_evaluation_and_release_gating_platform.md` |
| G14 Observability and Production Diagnosis | Trace, measure and diagnose a customer-facing AI app when quality drops. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G14_Observability_And_Production_Diagnosis/G14_Observability_And_Production_Diagnosis_Main.md` |
| Observability for a Customer-Facing AI Application (Ch 15) | Long-form design of observability for a production AI app. | Long-form tutorial | `02_SD/Scenario_Tutorials_Long_Form/Version_2/chapter-15-observability-customer-facing-ai-application-tutorial_v2.md` |
| Observability for a Customer-Facing AI Application | Fill-in worksheet for observability. | Worksheet + key | `03_PW/System_Design_Worksheets/15_observability_customer_facing_ai_application.md` |

## 9. FDE delivery, scoping and strategy

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| G12 Scoping to Deployed Agent | Take a scoping document to a deployed agent in two weeks. | Scenario pack | `02_SD/Scenario_Packs_G01_G20/G12_Scoping_To_Deployed_Agent/G12_Scoping_To_Deployed_Agent_Main.md` |
| Whiteboard: Scoping Doc to Deployed Agent in Two Weeks | Spoken whiteboard script for the two-week delivery. | Whiteboard script | `02_SD/Classic_Design_Walkthroughs/Handbook_Casebook/whiteboard_scripts/04_Scoping_Doc_To_Deployed_Agent_In_Two_Weeks.md` (also: `05_FDE_Delivery_and_Scoping/Delivery_Framework/INTERVIEW_SCRIPT.md`) |
| Delivering an Agent in Two Weeks with Enforced Gates | Lesson version of the two-week delivery, with role-gated stage gates. | Lesson | `01_CT/Consolidated_Lessons/T5.4_Casebook_Classic_AI_Designs/09_Delivering_an_Agent_in_Two_Weeks_with_Enforced_Gates.md` |
| Prioritise AI Use Cases for a Large Enterprise | Pick the use case that survives the data, the regulator and the users, not the one that impresses. | Standalone design | `02_SD/Standalone_Designs/60_Prioritize_AI_Use_Cases/60_Prioritize_AI_Use_Cases.md` |
| Scale a Prototype to Production | Turn a prototype loved by 100 users into a system that serves 100,000. | Standalone design | `02_SD/Standalone_Designs/61_Scale_Prototype_To_Production/61_Scale_Prototype_To_Production.md` |
| Build When the Customer's Data Is Poor | Deliver value this quarter when the customer's data cannot yet support the ask. | Standalone design | `02_SD/Standalone_Designs/62_Build_When_Customer_Data_Is_Poor/62_Build_When_Customer_Data_Is_Poor.md` |
| Decomposition Classics: 911, Bank Fraud, Medication Errors | Three open-ended mission problems decomposed before choosing any model. | Standalone design | `02_SD/Standalone_Designs/Decomposition_Classics_67_68_69/Decomposition_Classics_67_68_69.md` |

## 10. Customer and build stories (behavioural deep dives)

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| Agent Platform: Deterministic Guardrail and Orchestration Engine | STAR story of building a guardrail and orchestration engine, with a 60-second version and follow-ups. | STAR story | `01_CT/FDE_Handbook/11_Telling_The_Story/stories/STAR_Stories_Technical_Build_Projects.html` |
| Meridian Assist: Enterprise RAG with Attribute-Based Access Control | STAR story of an enterprise RAG build with ABAC, in the same file. | STAR story | `01_CT/FDE_Handbook/11_Telling_The_Story/stories/STAR_Stories_Technical_Build_Projects.html` |
| Enterprise RAG: 15–20 Minute Deep Dive | Timed project deep dive: hook, STAR narrative, governance, deployment, honest limits. | Project deep dive | `01_CT/FDE_Handbook/11_Telling_The_Story/stories/Enterprise_RAG_DeepDive_15-20min.md` |
| Enterprise RAG: Conversational Guide | The same project as reusable story beats for an open-ended conversation. | Project deep dive | `01_CT/FDE_Handbook/11_Telling_The_Story/stories/Enterprise_RAG_Conversational_Guide.md` |

## 11. Company-specific scenarios (Blitzy)

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| Intermittent Failure Triage + Customer Comms | Triage an intermittent production failure and keep the customer informed. | Round 1 scenario | `08_Company_Specific_Prep/Blitzy/04_Incident_Triage_And_Customer_Comms.md` |
| CTO Trust + Exec Vision to Engineering Roadmap | Earn a customer CTO's trust and turn an executive vision into a roadmap. | Round 2 scenario | `08_Company_Specific_Prep/Blitzy/05_CTO_Trust_And_Vision_To_Roadmap.md` |
| Integrating a New Service into an Existing Stack | Brownfield integration of a new service plus its testing strategy. | Round 1 scenario | `08_Company_Specific_Prep/Blitzy/06_Brownfield_Integration_And_Testing.md` |
| Enterprise SDLC, Agile and Cross-Functional Delivery | Deliver inside a customer's enterprise SDLC with cross-functional teams. | Round 2 scenario | `08_Company_Specific_Prep/Blitzy/07_Enterprise_SDLC_Agile_CrossFunctional.md` |
| Traffic Spikes and Graceful Degradation | One-pager on surviving traffic spikes by degrading gracefully. | Round 1 scenario | `08_Company_Specific_Prep/Blitzy/08_Scaling_Spikes_And_Graceful_Degradation.md` |
| Final Round Mock Interview | Full final-round mock with scorecard. | Mock interview | `08_Company_Specific_Prep/Blitzy/Final_Round/04_Final_Round_Mock_Interview.md` |

## 12. Problem decomposition prompts

All rows below are sections of `03_PW/Problem_Decomposition_Bank/FDE_Problem_Decomposition_Question_Bank.md`. Each gives what to discuss and likely follow-ups.

| Case study | One-line summary | Format | File path |
|---|---|---|---|
| 1. Enterprise Knowledge Assistant | Decompose an internal knowledge assistant: sources, access, freshness, evaluation. | Decomposition prompt | `03_PW/Problem_Decomposition_Bank/FDE_Problem_Decomposition_Question_Bank.md` |
| 2. Customer-Support Agent | Break a support agent into workflow steps and trade-offs. | Decomposition prompt | same file |
| 3. Claims-Processing Assistant | Decompose insurance claims intake, checks and decisions. | Decomposition prompt | same file |
| 4. Sales or Account-Research Assistant | Scope a research assistant for sellers and its success metrics. | Decomposition prompt | same file |
| 5. Enterprise Document-Processing Platform | Break a document platform into ingest, extract, validate and review. | Decomposition prompt | same file |
| 6. Agent for Enterprise Workflow Automation | Decompose an agent that runs business workflows safely. | Decomposition prompt | same file |
| 7. Enterprise AI Coding Assistant | Scope a coding assistant for a large engineering org. | Decomposition prompt | same file |
| 8. The Model Got Worse After an Upgrade | Diagnose a quality drop after a model upgrade. | Decomposition prompt | same file |
| 9. Latency Regression in an LLM Application | Split latency into its parts and find the regression. | Decomposition prompt | same file |
| 10. RAG System with Poor Answer Quality | Separate retrieval failures from generation failures. | Decomposition prompt | same file |
| 11. Evaluation Strategy for an AI Application | Design offline, online and human evaluation for one app. | Decomposition prompt | same file |
| 12. Deploying AI in a Highly Regulated Industry | Plan controls, audit and approval for a regulated deployment. | Decomposition prompt | same file |
| 13. AI Search Across Many Enterprise Data Sources | Unify search across many systems with different permissions. | Decomposition prompt | same file |
| 14. Operations or Incident-Response Assistant | Decompose an assistant that helps operators during incidents. | Decomposition prompt | same file |
| 15. Assistant for Sales or Customer-Service Calls | Break a live call assistant into streaming, retrieval and summary. | Decomposition prompt | same file |
| 16. Prioritize AI Use Cases for a Large Enterprise | Rank candidate use cases by value, feasibility and risk. | Decomposition prompt | same file |
| 17. Scale a Successful AI Prototype to Production | List what must change between prototype and production. | Decomposition prompt | same file |
| 18. Build an AI System When the Customer's Data Is Poor | Deliver while fixing or working around weak data. | Decomposition prompt | same file |
| A. Enterprise AI Data Platform | Connect a data platform to the AI workloads it feeds. | Decomposition prompt | same file |
| B. Lakehouse-Powered RAG Platform | Build RAG on top of a lakehouse and its governance. | Decomposition prompt | same file |
| C. Real-Time Fraud or Anomaly-Detection Assistant | Decompose a low-latency fraud or anomaly assistant. | Decomposition prompt | same file |
| D. Enterprise Data Quality Copilot | Scope a copilot that finds and explains data quality issues. | Decomposition prompt | same file |
| E. AI Migration from Prototype to Production | Plan a staged migration of an AI prototype to production. | Decomposition prompt | same file |
