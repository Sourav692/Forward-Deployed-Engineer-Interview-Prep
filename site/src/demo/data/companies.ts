/**
 * Sample company packs for the /demo prototype. All three companies, their loops and
 * every sourced claim are fictional, written to show how a company pack is laid out.
 */
import type { CompanyPack } from '../types'

export const COMPANY_PACKS: CompanyPack[] = [
  {
    id: 'acme-ai-labs',
    name: 'Acme AI Labs',
    tagline:
      'Fictional example: a frontier-model lab whose applied team deploys models with enterprise customers.',
    sources: [
      {
        claim: 'The applied team embeds engineers with strategic customers for six to twelve weeks at a time.',
        source: 'Recruiter call notes (fictional)',
        confidence: 'high',
      },
      {
        claim: 'The loop includes a customer simulation round played by a member of the solutions team.',
        source: 'Recruiter call notes (fictional)',
        confidence: 'high',
      },
      {
        claim: 'Candidates may use AI assistants in the coding round if they narrate how they use them.',
        source: 'Public careers page (fictional)',
        confidence: 'medium',
      },
      {
        claim: 'Most current deployments are retrieval and agent workloads in financial services and law.',
        source: 'Engineering blog post (fictional)',
        confidence: 'medium',
      },
      {
        claim: 'The team is expected to double within the year.',
        source: 'Forum thread from a former candidate (fictional)',
        confidence: 'low',
      },
    ],
    loop: [
      {
        round: 'Recruiter screen',
        format: 'Conversation about background, motivation and logistics',
        minutes: 30,
        aiPolicy: 'Not applicable',
      },
      {
        round: 'Technical screen',
        format: 'Shared-editor coding on a small data-processing task',
        minutes: 60,
        aiPolicy: 'AI assistants allowed; explain your prompts and check every suggestion',
      },
      {
        round: 'AI system design',
        format: 'Whiteboard design of an LLM application for a named industry',
        minutes: 60,
        aiPolicy: 'No AI assistants',
      },
      {
        round: 'Customer simulation',
        format: 'Role-play with a sceptical stakeholder who brings a vague request',
        minutes: 45,
        aiPolicy: 'No AI assistants',
      },
      {
        round: 'Behavioural and values',
        format: 'Structured questions on ownership, ambiguity and conflict',
        minutes: 45,
        aiPolicy: 'Not applicable',
      },
    ],
    coverage: [
      {
        area: 'Retrieval system design',
        covered: true,
        note: 'Core of the design round: expect permission-aware retrieval and evaluation questions.',
        moduleIds: ['t2-2', 't2-4', 't4-1'],
      },
      {
        area: 'Agents and tool use',
        covered: true,
        note: 'Likely follow-up in design: bounded tools, step budgets, side-effect safety.',
        moduleIds: ['t3-1', 't3-5'],
      },
      {
        area: 'Evaluation and release gates',
        covered: true,
        note: 'Interviewers probe how you would know a change is safe to ship.',
        moduleIds: ['t4-2'],
      },
      {
        area: 'Customer discovery and scoping',
        covered: true,
        note: 'Tested directly in the customer simulation round.',
        moduleIds: ['t6-1', 't6-2'],
      },
      {
        area: 'Practical coding',
        covered: true,
        note: 'Data wrangling and small API work rather than puzzle algorithms.',
        moduleIds: ['t8-6'],
      },
      {
        area: 'Model training internals',
        covered: false,
        note: 'Not tested for this role according to the recruiter. Skim only.',
        moduleIds: [],
      },
      {
        area: 'Executive communication',
        covered: true,
        note: 'Assessed informally at the end of the simulation round.',
        moduleIds: ['t7-5'],
      },
    ],
    readingOrder: [
      {
        phase: 'Week 1: foundations',
        items: ['RAG from first principles', 'Retrieval: hybrid, rerank, query transformation', 'Agent tool-calling loop'],
        doneWhen: 'You can sketch a permission-aware RAG design and an agent loop from memory in ten minutes.',
      },
      {
        phase: 'Week 2: production depth',
        items: ['Evaluation and release gates', 'Security, tenancy and prompt injection', 'Robust agents'],
        doneWhen: 'You can name three release gates and two injection defences for any design you draw.',
      },
      {
        phase: 'Week 3: customer rounds',
        items: ['Customer discovery', 'Scoping', 'Executive communication'],
        doneWhen: 'You have run two timed customer simulations and scored yourself on the rubric.',
      },
      {
        phase: 'Final days: rehearsal',
        items: ['Mock interviews', 'Telling the build story', 'Company loops'],
        doneWhen: 'Each loop round has a rehearsed opening and two stories mapped to it.',
      },
    ],
    brief: [
      'Fictional lab that trains its own large models and sells API access to enterprises.',
      'The applied team of about forty engineers turns pilots into production deployments.',
      'Typical customers are banks, insurers and law firms with strict data controls.',
      'Engineers own the full path from discovery call to production launch.',
      'The team values written design notes and measurable evaluation over demos.',
      'Travel to customer sites is expected roughly one week in four.',
    ],
    roundGuides: [
      {
        round: 'Recruiter screen',
        guidance:
          'Have a two-minute story of why applied work suits you, and confirm round order, interviewers\' roles and the AI policy for each round.',
        moduleIds: ['t8-5'],
      },
      {
        round: 'Technical screen',
        guidance:
          'Talk while you code, write a small test early, and when you use an assistant say what you asked it and how you checked the result.',
        moduleIds: ['t8-6'],
      },
      {
        round: 'AI system design',
        guidance:
          'Start with requirements and users, then retrieval, permissions and evaluation. Leave ten minutes for failure modes and cost.',
        moduleIds: ['t5-1', 't5-3', 't4-2'],
      },
      {
        round: 'Customer simulation',
        guidance:
          'Ask before proposing. Find the business outcome, the users and the constraints, then agree a narrow first milestone with a success measure.',
        moduleIds: ['t6-1', 't6-2'],
      },
      {
        round: 'Behavioural and values',
        guidance:
          'Use STAR with concrete numbers. Prepare stories on shipping under ambiguity, disagreeing with a customer and recovering from a mistake.',
        moduleIds: ['t7-1'],
      },
    ],
    practiceBank: [
      { prompt: 'Design an enterprise knowledge assistant for a law firm.', questionId: 'q-sd-01' },
      { prompt: 'A bank says "we want AI for our claims team". Run the first call.', questionId: 'q-fde-01' },
      { prompt: 'Your pilot works for one business unit and fails for another. What do you do?', questionId: 'q-fde-07' },
      { prompt: 'Answer quality dropped overnight with no code change. Walk through your diagnosis.', questionId: 'q-ai-11' },
      { prompt: 'Explain to a chief risk officer why the assistant sometimes refuses to answer.' },
      { prompt: 'Write a function that deduplicates near-identical documents before indexing.' },
    ],
    questionsToAsk: [
      'How does the applied team decide which customer pilots to take on?',
      'What does a typical first month look like for a new engineer?',
      'How is feedback from deployments fed back to the model teams?',
      'What does success look like for this role after six months?',
      'How do you balance custom work for one customer against reusable tooling?',
      'Which part of the loop do strong candidates most often find hardest?',
    ],
    fillIn: [
      'Your recruiter\'s name and the confirmed round order',
      'The names and roles of your interviewers, once shared',
      'The AI tool policy for each round, confirmed in writing',
      'Two stories from your own work mapped to each behavioural theme',
      'The industry the design round is likely to use, if hinted',
    ],
    checklist: [
      'Confirm the loop and AI policy with the recruiter by email.',
      'Rehearse a permission-aware RAG design end to end within 35 minutes.',
      'Complete at least two customer simulation mocks.',
      'Prepare five STAR stories with measurable outcomes.',
      'Test your camera, microphone and shared editor the day before.',
      'Write down three questions to ask each interviewer.',
      'Review the cheat sheets for enterprise assistant and support agent cases.',
    ],
  },
  {
    id: 'northwind-cloud',
    name: 'Northwind Cloud',
    tagline:
      'Fictional example: a cloud provider whose AI solutions engineers help customers build on its managed model services.',
    sources: [
      {
        claim: 'AI solutions engineers are aligned to industry verticals rather than to products.',
        source: 'Recruiter call notes (fictional)',
        confidence: 'high',
      },
      {
        claim: 'The loop has a presentation round where candidates present a past project to a panel.',
        source: 'Interview invitation email (fictional)',
        confidence: 'high',
      },
      {
        claim: 'Design interviews favour managed services but reward clear trade-offs over brand loyalty.',
        source: 'Former employee conversation (fictional)',
        confidence: 'medium',
      },
      {
        claim: 'The role carries a target for customer workloads reaching production.',
        source: 'Public careers page (fictional)',
        confidence: 'medium',
      },
      {
        claim: 'Coding is assessed lightly compared with design and communication.',
        source: 'Forum thread from a former candidate (fictional)',
        confidence: 'low',
      },
    ],
    loop: [
      {
        round: 'Hiring manager screen',
        format: 'Conversation on background and a short technical discussion',
        minutes: 45,
        aiPolicy: 'Not applicable',
      },
      {
        round: 'Project presentation',
        format: 'Twenty-minute talk on a past project, then panel questions',
        minutes: 60,
        aiPolicy: 'AI tools allowed for preparing slides; disclose if used',
      },
      {
        round: 'Solution architecture',
        format: 'Design a production AI workload on cloud services for a customer brief',
        minutes: 60,
        aiPolicy: 'No AI assistants',
      },
      {
        round: 'Troubleshooting scenario',
        format: 'Diagnose a failing customer deployment from logs and metrics',
        minutes: 45,
        aiPolicy: 'AI assistants allowed; explain your prompts',
      },
      {
        round: 'Leadership principles',
        format: 'Behavioural questions with deep follow-ups',
        minutes: 45,
        aiPolicy: 'Not applicable',
      },
    ],
    coverage: [
      {
        area: 'Architecture patterns on managed services',
        covered: true,
        note: 'Central to the solution architecture round.',
        moduleIds: ['t5-3', 't4-1'],
      },
      {
        area: 'Scaling and reliability',
        covered: true,
        note: 'Expect questions on quotas, regional failover and degradation.',
        moduleIds: ['t4-6'],
      },
      {
        area: 'Cost and latency',
        covered: true,
        note: 'Customers care about cost per request, so interviewers do too.',
        moduleIds: ['t4-5'],
      },
      {
        area: 'Observability and debugging',
        covered: true,
        note: 'Tested in the troubleshooting scenario.',
        moduleIds: ['t4-3', 't6-6'],
      },
      {
        area: 'Presenting technical work',
        covered: true,
        note: 'The presentation round scores clarity and audience awareness.',
        moduleIds: ['t7-1', 't7-5'],
      },
      {
        area: 'Algorithmic coding',
        covered: false,
        note: 'No dedicated coding round in this loop. Keep basic fluency only.',
        moduleIds: ['t8-6'],
      },
      {
        area: 'Agent design',
        covered: false,
        note: 'Not mentioned by the recruiter, but may appear as a design follow-up.',
        moduleIds: ['t3-1'],
      },
    ],
    readingOrder: [
      {
        phase: 'Phase 1: architecture',
        items: ['Design framework', 'Architecture patterns', 'Enterprise RAG in production'],
        doneWhen: 'You can draw a reference architecture with ingestion, retrieval, serving and monitoring.',
      },
      {
        phase: 'Phase 2: operations',
        items: ['Scaling and reliability', 'Cost and latency', 'Observability'],
        doneWhen: 'You can state SLOs and a degradation ladder for any design you draw.',
      },
      {
        phase: 'Phase 3: presentation and debugging',
        items: ['Telling the build story', 'Debugging in the customer\'s environment', 'Mock interviews'],
        doneWhen: 'Your project talk runs under twenty minutes and survives a practice panel.',
      },
    ],
    brief: [
      'Fictional public cloud provider with managed model hosting and vector search services.',
      'AI solutions engineers sit in vertical teams such as retail, health and public sector.',
      'Engineers lead technical workshops and build proofs of concept with customer teams.',
      'Success is measured by customer workloads reaching production, not by pilots started.',
      'The company publishes reference architectures that interviewers expect candidates to critique.',
    ],
    roundGuides: [
      {
        round: 'Hiring manager screen',
        guidance:
          'Show you understand the vertical model. Bring one example of moving a customer from pilot to production.',
        moduleIds: ['t8-5', 't6-3'],
      },
      {
        round: 'Project presentation',
        guidance:
          'Lead with the business problem and result, then architecture, then what you would change. Keep slides sparse and rehearse timing twice.',
        moduleIds: ['t7-1', 't7-5'],
      },
      {
        round: 'Solution architecture',
        guidance:
          'Clarify the customer brief, then design for reliability and cost explicitly. Name quotas, regions and failure handling without being asked.',
        moduleIds: ['t5-1', 't5-3', 't4-6'],
      },
      {
        round: 'Troubleshooting scenario',
        guidance:
          'Form a hypothesis, choose the cheapest check, and narrate. Separate customer environment issues from service issues early.',
        moduleIds: ['t6-6', 't4-3'],
      },
      {
        round: 'Leadership principles',
        guidance:
          'Expect three or four follow-ups per story. Know the details: dates, numbers, your exact role and what you would do differently.',
        moduleIds: ['t7-1'],
      },
    ],
    practiceBank: [
      { prompt: 'Design a multi-region document question answering service for a retailer.', questionId: 'q-sd-01' },
      { prompt: 'The customer says the deployment works in your demo account but fails in theirs.', questionId: 'q-fde-07' },
      { prompt: 'Latency doubled after the customer moved to a new region. Diagnose it.' },
      { prompt: 'Quality dropped overnight for one customer only. What do you check first?', questionId: 'q-ai-11' },
      { prompt: 'Present a past project in five minutes to a non-technical executive.' },
      { prompt: 'Estimate the monthly cost of serving 2 million questions with retrieval.' },
      { prompt: 'Tell me about a time you pushed back on a customer request.', questionId: 'q-beh-01' },
    ],
    questionsToAsk: [
      'How do solutions engineers split time between workshops and hands-on building?',
      'How does feedback from customers reach the product teams?',
      'What makes a workload count as reaching production?',
      'How are verticals assigned, and can engineers move between them?',
      'What tooling does the team share across customers?',
    ],
    fillIn: [
      'Your recruiter\'s name and the confirmed round order',
      'Which vertical the role sits in',
      'The project you will present and its three key numbers',
      'The AI policy for each round, confirmed in writing',
      'The leadership principles you will map stories to',
    ],
    checklist: [
      'Confirm the vertical and the panel make-up for the presentation.',
      'Build and rehearse the project talk twice with a timer.',
      'Practise one architecture design with explicit SLOs and costs.',
      'Run a timed troubleshooting mock from logs and metrics.',
      'Prepare six stories with detail for deep follow-ups.',
      'Prepare a short cost estimate method you can do aloud.',
    ],
  },
  {
    id: 'globex-analytics',
    name: 'Globex Analytics',
    tagline:
      'Fictional example: an analytics and data platform company hiring forward deployed engineers for its AI features.',
    sources: [
      {
        claim: 'Forward deployed engineers own customer rollouts of the natural-language query feature.',
        source: 'Recruiter call notes (fictional)',
        confidence: 'high',
      },
      {
        claim: 'The loop includes a take-home problem decomposition exercise reviewed live.',
        source: 'Interview invitation email (fictional)',
        confidence: 'high',
      },
      {
        claim: 'Strong SQL and data modelling are expected in addition to LLM application skills.',
        source: 'Public careers page (fictional)',
        confidence: 'high',
      },
      {
        claim: 'Customers are mostly mid-size retail and logistics firms.',
        source: 'Product webinar (fictional)',
        confidence: 'medium',
      },
      {
        claim: 'Engineers may be based near major customers rather than at headquarters.',
        source: 'Forum thread from a former candidate (fictional)',
        confidence: 'low',
      },
      {
        claim: 'The take-home allows AI assistants but requires a short note on how they were used.',
        source: 'Interview invitation email (fictional)',
        confidence: 'medium',
      },
    ],
    loop: [
      {
        round: 'Recruiter screen',
        format: 'Background, motivation and logistics',
        minutes: 30,
        aiPolicy: 'Not applicable',
      },
      {
        round: 'Take-home decomposition review',
        format: 'Walk through a written breakdown of a vague customer problem',
        minutes: 60,
        aiPolicy: 'AI assistants allowed for the take-home; disclose and explain your prompts',
      },
      {
        round: 'Data and SQL',
        format: 'Live SQL and data modelling on a sample schema',
        minutes: 60,
        aiPolicy: 'No AI assistants',
      },
      {
        round: 'AI feature design',
        format: 'Design a text-to-SQL or analytics assistant for a customer',
        minutes: 60,
        aiPolicy: 'No AI assistants',
      },
      {
        round: 'Incident review',
        format: 'Talk through how you would handle a live customer incident',
        minutes: 45,
        aiPolicy: 'Not applicable',
      },
      {
        round: 'Behavioural',
        format: 'Questions on ownership, customer conflict and learning',
        minutes: 45,
        aiPolicy: 'Not applicable',
      },
    ],
    coverage: [
      {
        area: 'Problem decomposition',
        covered: true,
        note: 'Tested by the take-home and its live review.',
        moduleIds: ['t6-2', 't6-1'],
      },
      {
        area: 'SQL and data modelling',
        covered: true,
        note: 'A full round. Practise joins, window functions and grain.',
        moduleIds: ['t8-6'],
      },
      {
        area: 'Text-to-SQL design',
        covered: true,
        note: 'The most likely design prompt given the product.',
        moduleIds: ['t2-4', 't4-2', 't5-4'],
      },
      {
        area: 'Security and row-level access',
        covered: true,
        note: 'Expect follow-ups on executing as the end user.',
        moduleIds: ['t4-4'],
      },
      {
        area: 'Incident handling',
        covered: true,
        note: 'Covers communication as much as diagnosis.',
        moduleIds: ['t6-6', 't7-5'],
      },
      {
        area: 'Agents and multi-step tools',
        covered: false,
        note: 'Not a focus for this role at present.',
        moduleIds: ['t3-1'],
      },
      {
        area: 'Delivery and rollout',
        covered: true,
        note: 'Interviewers ask how you would phase a customer rollout.',
        moduleIds: ['t6-3'],
      },
      {
        area: 'Fine-tuning',
        covered: false,
        note: 'Not tested. Understand when it would and would not help.',
        moduleIds: [],
      },
    ],
    readingOrder: [
      {
        phase: 'Phase 1: decomposition',
        items: ['Customer discovery', 'Scoping', 'Delivery'],
        doneWhen: 'You can turn a one-line request into goals, constraints, milestones and a success measure.',
      },
      {
        phase: 'Phase 2: data and design',
        items: ['Retrieval: hybrid, rerank, query transformation', 'Evaluation and release gates', 'Casebook'],
        doneWhen: 'You can design a text-to-SQL assistant and explain execution-based evaluation.',
      },
      {
        phase: 'Phase 3: incidents',
        items: ['Debugging in the customer\'s environment', 'Executive communication'],
        doneWhen: 'You can run an incident update that covers impact, cause, action and next update time.',
      },
      {
        phase: 'Phase 4: rehearsal',
        items: ['Coding round practice', 'Mock interviews', 'Company loops'],
        doneWhen: 'You have completed one timed SQL session and one full mock loop.',
      },
    ],
    brief: [
      'Fictional analytics platform used by mid-size retail and logistics companies.',
      'Its natural-language query feature lets business users ask questions of their data.',
      'Forward deployed engineers configure semantic models and roll the feature out per customer.',
      'The company prizes accurate numbers over clever answers, given finance users.',
      'Engineers work closely with customer data teams and their governance rules.',
      'The FDE team is small, so engineers cover discovery, build and support.',
    ],
    roundGuides: [
      {
        round: 'Recruiter screen',
        guidance: 'Signal comfort with SQL and customers in equal measure. Confirm take-home timing and AI rules.',
        moduleIds: ['t8-5'],
      },
      {
        round: 'Take-home decomposition review',
        guidance:
          'State assumptions explicitly, rank unknowns by risk, and propose a smallest useful first milestone. Be ready to defend each cut.',
        moduleIds: ['t6-1', 't6-2'],
      },
      {
        round: 'Data and SQL',
        guidance: 'Clarify grain before writing joins. Check results with a quick sanity query and explain trade-offs aloud.',
        moduleIds: ['t8-6'],
      },
      {
        round: 'AI feature design',
        guidance:
          'Ground on a semantic layer, validate SQL before execution, run as the end user, and evaluate by comparing result sets.',
        moduleIds: ['t5-1', 't5-4', 't4-2'],
      },
      {
        round: 'Incident review',
        guidance:
          'Stabilise first, communicate early and on a schedule, then diagnose. Close with prevention and what you would tell the customer.',
        moduleIds: ['t6-6', 't7-5'],
      },
      {
        round: 'Behavioural',
        guidance: 'Use STAR. Include one story where a data mistake reached a customer and how you handled it.',
        moduleIds: ['t7-1'],
      },
    ],
    practiceBank: [
      { prompt: 'Design a text-to-SQL assistant for a logistics company.', questionId: 'q-sd-01' },
      { prompt: 'A customer says "we want AI for our reporting team". Decompose the request.', questionId: 'q-fde-01' },
      { prompt: 'Numbers from the assistant disagree with the official dashboard. Investigate.' },
      { prompt: 'Accuracy dropped overnight for one customer after a schema change.', questionId: 'q-ai-11' },
      { prompt: 'Write SQL for the top three products by revenue per region each month.' },
      { prompt: 'The feature works in your test tenant but fails for the customer.', questionId: 'q-fde-07' },
      { prompt: 'Explain a failed rollout to the customer\'s head of finance.' },
      { prompt: 'Describe a time you learned a new domain quickly for a customer.', questionId: 'q-beh-03' },
    ],
    questionsToAsk: [
      'How do you measure whether a customer rollout succeeded?',
      'Who owns the semantic model for each customer after rollout?',
      'How are customer escalations shared between FDEs and product engineers?',
      'What does the on-call or support expectation look like?',
      'Which customer problem is the team most excited about this year?',
      'How much of the role is building reusable tooling versus customer-specific work?',
      'How do you handle customers with very messy data?',
    ],
    fillIn: [
      'Your recruiter\'s name and the confirmed round order',
      'The take-home deadline and submission format',
      'The SQL dialect used in the data round',
      'The AI policy for each round, confirmed in writing',
      'Two incident stories from your own work',
      'Any customer industries the hiring manager mentioned',
    ],
    checklist: [
      'Confirm take-home timing, format and AI disclosure rules.',
      'Practise SQL with window functions and grain checks under time.',
      'Rehearse the text-to-SQL case design within 35 minutes.',
      'Prepare an incident update template you can deliver aloud.',
      'Prepare five STAR stories, including one on a data error.',
      'Review the text-to-SQL and document AI case cheat sheets.',
      'Write down three questions for each interviewer.',
      'Test your setup and shared editor the day before.',
    ],
  },
]
