# AI Powered Recruiting Platform Design

*Design case: full reference write-up*

The prompt: build a recruiting platform where AI supports the recruiter at every stage. It screens resumes, matches candidates to job descriptions, drafts interview questions, scores candidates, books interviews and helps hiring managers decide. The scope covers the full journey, from the first resume upload to the hiring decision.

`thousands of resumes an hour` · `ranking you can explain` · `a human makes the call` · `EEOC and GDPR controls`

---

## 1 · Define the problem space

**From first resume to final hire.**

A recruiter posts a job description, a flood of resumes follows, and the platform has to rank the applicants, draft questions and scorecards, book interviews and offer a hiring suggestion. Through all of it, the recruiter keeps the final say. That requirement sets the boundary for the whole design: the platform assists the people who hire and never hires by itself.

Below are the clarifying questions, with the answers this case takes as given. In a real interview, check each one before you build on it.

> First, who buys it: an enterprise hiring team or a staffing agency? The answer changes how many tenants and how much volume you plan for. Second, does matching run live or in batches? Bulk intake runs in batches, while a recruiter's search should feel close to live. Third, can a recruiter overrule the AI? Always, so human review is a core requirement from day one, not a late addition. Fourth, does the system decide, or help a person decide? It helps, and that pushes every later choice towards explainability. Fifth, do GDPR or EEOC rules apply? They do, so fairness monitoring and audit logs cannot be dropped.

**Functional.** The jobs the platform has to do:

- Accept a Job Description (JD)
- Accept resumes as PDF or DOCX
- Turn each resume into structured candidate data
- Order candidates by how well they fit the role
- Search profiles by meaning
- Draft interview questions
- Draft interview scorecards
- Suggest a hiring decision
- Book interviews
- Summarise what interviewers said
- Give recruiters a chatbot
- Improve using past hiring decisions

**Non-functional.** The qualities a production system needs:

- Handle thousands of resumes every hour
- Match with high accuracy
- Keep hallucinations rare
- Handle PII securely
- Scale out with ease
- Explain every candidate ranking
- Meet enterprise compliance standards
- Keep running costs in check

---

## 2 · High-level architecture

**Two intake lanes that merge into a single ranking pipeline.**

Resumes and job descriptions arrive on separate upload lanes, and each lane has its own parser. Both lanes feed one structured extraction service. After that, a single pipeline builds candidate profiles, embeds them and ranks candidates by similarity. Ranking feeds interview question drafting, and once the interview or assessment is over, the AI judge scores it. The evaluation pipeline then combines those scores with the rest of the evidence. A human recruiter reviews its output, and only then do scheduling and candidate messages go out.

```
Recruiter Portal
│
Authentication Service
│
API Gateway / Load Balancer
┌──────────────┴──────────────┐
Resume Upload          Job Description Upload
│                              │
OCR / Document Parser         JD Parser
└──────────────┬──────────────┘
     Structured Extraction Service
                │
       Candidate Profile Builder
                │
       Embedding Generation Service
                │
       Vector Database
       (candidate & JD embeddings)
                │
       Similarity Search Engine
                │
          Candidate Ranking
                │
     Interview Question Generator
                │
          AI Judge Scoring
                │
         Evaluation Pipeline
                │
        Human Recruiter Review
                │
         Interview Scheduler
                │
          Candidate Portal
```

Think of structured extraction as the line between documents and data. On one side the system handles PDFs and loose text. On the other it handles candidate profiles with a shared shape, which can be compared and ranked.

---

## 3 · Step-by-step request flow

**How a job posting becomes a booked interview.**

1. **The recruiter uploads a job description.** Take a Senior AI Engineer role that asks for Python, LLMs, LangGraph, vector databases and AWS. The parser pulls out must-have skills, nice-to-have skills, years of experience, education, certifications, location and salary band.
2. **The candidate submits a resume.** It can arrive as a PDF, a DOCX file, a LinkedIn profile or a record already held in the ATS.
3. **Structured extraction.** Rather than keep the resume as raw text, the AI pulls out structured fields. Search and ranking are far more reliable over fields than over free text.
4. **Embedding generation.** The system creates embeddings for the job description, the candidate profile, and the skills, projects, experience and certifications inside it. These vectors capture meaning, so matching does not hinge on exact keywords.
5. **Similarity search.** The engine returns candidates whose profiles sit close in meaning to the JD. A search for "LLM Engineer" can bring back people who list Generative AI, RAG, Prompt Engineering or Agentic AI, even though none of them used that exact title.
6. **Candidate ranking.** The ranker weighs several signals together. The output is an ordered list with reasons attached, not a yes-or-no verdict.
7. **Interview question generation.** The LLM drafts questions for this role and this person. It works from the JD, the candidate's background, the skills they lack and their past projects, and it can produce coding, system design, behavioural or domain questions.
8. **AI judge evaluation.** When an interview or coding test is done, the AI judge rates technical accuracy, clarity of communication, the approach to the problem and fit with the job. It returns structured feedback and a provisional score.
9. **Human recruiter review.** A recruiter or hiring manager reads the ranking, the AI scores, the interview summaries and the suggestion, and then makes the hiring decision. This step adds accountability and a human check on bias. Both vanish if the reviewer approves whatever the AI ranked, so the reviewer must have real power to overrule it.
10. **Interview scheduling.** Once the recruiter approves a candidate for interview, the platform checks when interviewers are free, picks suitable slots, sends calendar invites, tells the candidate and updates the ATS. Nothing is booked before that approval.

---

## 4 · Explainable candidate ranking

**Weighted signals you can inspect, not a hidden pass or fail.**

A single similarity number is not enough to rank people. The engine blends several signals: semantic similarity, the match on required skills, level of experience, domain knowledge, location, certifications, availability and, where it applies, past hiring success. An explicit weight per signal lets a recruiter understand the ranking and an auditor inspect it; one opaque model score allows neither. The weights do not by themselves establish fairness or job relevance.

Here is a weighting I would open with. It is my own starting point, not an industry norm: semantic similarity ~30% · skills match ~25% · experience level ~20% · domain expertise ~15% · other signals (location, certifications, availability) ~10%. With the weights on show, a recruiter can see the reasons behind each candidate's place, not only the place itself.

---

## 5 · Major components

**Sixteen services, one job apiece.**

| # | Component | Responsibility |
|---|---|---|
| 01 | Recruiter Portal | Where recruiters post JDs, review candidates and run hiring |
| 02 | Candidate Portal | Where candidates submit resumes and follow their application |
| 03 | Authentication Service | Controls sign-in and assigns roles |
| 04 | Resume Parser | Pulls the text out of each resume |
| 05 | JD Parser | Turns a job description into structured requirements |
| 06 | Structured Extraction Service | Reshapes loose documents into structured profiles |
| 07 | Embedding Service | Produces vectors that capture meaning |
| 08 | Vector Database | Holds the candidate and JD embeddings |
| 09 | Similarity Search Engine | Finds the closest-matching candidates |
| 10 | Ranking Engine | Orders candidates on several signals |
| 11 | Prompt Builder | Assembles prompts for question drafting and evaluation |
| 12 | LLM Inference Service | Writes interview questions and summaries |
| 13 | AI Judge | Scores interviews and coding tests |
| 14 | Evaluation Pipeline | Combines AI scores, feedback and confidence |
| 15 | Human Review Dashboard | Lets recruiters check results and overrule them |
| 16 | Scheduler | Books interviews against calendars |

---

## 6 · AI-specific design considerations

**What interviewers are listening for.**

**Structured extraction.** No two resumes share a layout. An LLM reshapes each one into a profile with the same fields, which keeps matching accurate and lets later steps run on their own.

**Embeddings.** Skills, experience, projects, job descriptions and certifications all get a vector form. That lets the system match on meaning instead of on keywords alone.

**Similarity search.** Semantic search spots experience that transfers, where exact keyword matching would miss it. A resume that says "Agentic AI" can still match a role that asks for "Multi-Agent Systems."

**Prompt management.** Separate prompt templates cover resume extraction, candidate summaries, question drafting, evaluation and recommendations. Version every template, so you can improve them over time and still keep output consistent.

**AI Judge.** The judge assesses coding tasks, technical and behavioural interviews, and communication. It applies a standard rubric and explains each score. It never makes the hiring decision.

**Evaluation pipeline.** It brings together the similarity score, how complete the resume is, AI Judge scores, interview feedback, recruiter feedback and the hiring manager's view. Confidence thresholds decide when a person must review the case.

---

## 7 · Scalability considerations

**Keeping up with thousands of resumes an hour.**

**Stateless application servers.** The API servers sit behind load balancers, so both ingestion and search scale out as demand grows.

**Asynchronous document processing.** Parsing and embedding happen in background jobs. The upload request returns without waiting for them.

**Distributed vector databases.** Candidate and JD embeddings are split across shards, which keeps similarity search quick as the candidate pool grows.

**GPU-backed LLM inference clusters.** GPU clusters autoscale to absorb spikes. One new job posting can kick off thousands of resume comparisons at the same moment.

**Event-driven workflows.** Events drive resume ingestion, so upload is decoupled from parsing, extraction, embedding and ranking.

**Multi-region deployment.** Running in several regions cuts latency and helps keep candidate PII inside the region where it has to stay.

When a popular posting brings a surge of applications, two things keep the system responsive: cached embeddings and generated outputs, and queues that soak up the load in peak hiring seasons.

---

## 8 · Security & fairness

**Candidate data is sensitive, and hiring decisions have legal consequences.**

- Encrypt resumes and all candidate data, both stored and in transit.
- Safeguard Personally Identifiable Information (PII).
- Apply role-based access control to recruiters and hiring managers.
- Keep an audit log of every AI recommendation and every hiring action.
- Agree with the privacy and legal owners which GDPR, CCPA and EEOC requirements apply. These controls support compliance; they do not certify it.
- Let candidates ask for their data to be deleted.
- Track model fairness and bias across protected groups.

```
AI Ranking & Scores
        │
Human Recruiter Review
        │
Approve or Override
        │
Final Hiring Decision

  Continuous bias & fairness monitoring
```

No AI ranking or score goes straight to a decision. A recruiter approves it or overrules it first, and fairness monitoring covers the entire path all the time, not as a check done once.

---

## 9 · Tradeoffs

**Six choices, and the price of each.**

| Decision | Pros | Cons |
|---|---|---|
| Keyword matching | Quick and easy to build | Misses people who describe the same skill in other words |
| Embedding-based search | Surfaces more good candidates | Costs more compute |
| Fully automated hiring | Decisions come sooner | Greater legal and ethical exposure |
| Human-in-the-loop | Stronger oversight and fairness | The process takes longer |
| Large reasoning model | Better summaries and questions | More latency and higher cost |
| Smaller model | Quicker and cheaper | Weaker at reasoning |

---

## 10 · Common follow-up questions

**Three questions that come up again and again.**

**How do you reduce bias in AI hiring?**

- Hide or mask sensitive demographic details where that makes sense.
- Use varied datasets for both training and evaluation.
- Track fairness metrics on an ongoing basis.
- Keep human sign-off on every hiring decision.
- Explain every ranking openly.
- Audit the models on a schedule for bias that nobody intended.

**How do you improve candidate matching accuracy?**

- Never match on keywords alone. Evaluate lexical and semantic matching on a labelled set first, and expect a hybrid of the two to win.
- Blend several ranking signals: skills, experience, projects and certifications.
- Feed recruiter feedback into the ranking models.
- Keep measuring precision and recall against past hiring outcomes.
- Adjust prompts and retrieval based on what recruiters tell you.

**How would you personalise recommendations for different recruiters?**

- Learn what each recruiter prefers from their earlier hiring decisions.
- Raise candidates who resemble past successful hires, while checking that step for bias.
- Set question difficulty by how senior the role is.
- Shape the ranking around the skills and projects a given team needs.
- Let recruiters set weighting factors such as skills, location or experience.

---

## 11 · Final design summary

**AI across the whole workflow, with a person at the point of decision.**

Strong answers treat recruiting as a single AI workflow. Structured extraction, semantic matching, explainable ranking and AI-judged evaluation run in sequence, while a human keeps control of the final decision. Fairness, PII protection and compliance apply at every step. From resume parsing to interview scheduling, AI assists at every stage and decides at none.

Scale comes from stateless application servers, asynchronous document processing, sharded vector databases, GPU-backed inference clusters, event-driven ingestion and deployment across regions. Security and fairness come from encryption, RBAC, audit logs, data handling that respects GDPR and EEOC, and bias monitoring that never stops. Treat them as design constraints that shape the ranking and evaluation pipeline from day one, not compliance boxes to tick.

> The design shows you can build one AI workflow from resume intake to hire. It uses embeddings and semantic search to match candidates well, pulls structured data out of messy documents, and balances automation against human oversight so that people can trust the hiring decisions it supports.

---

## Sources (checked 27 Sep 2026)

- [GDPR Article 22: automated individual decision-making](https://gdpr-info.eu/art-22-gdpr/): right not to be subject to solely automated decisions with significant effects, which is why hiring stays human-assisted
- [GDPR Article 17: right to erasure](https://gdpr-info.eu/art-17-gdpr/): candidates can request deletion of their data
- [CCPA, California Attorney General](https://oag.ca.gov/privacy/ccpa): right to delete; applicant and employee data covered since 1 Jan 2023
- [Prohibited employment policies and practices (EEOC)](https://www.eeoc.gov/prohibited-employment-policiespractices): hiring discrimination and neutral practices with disparate impact, the basis for fairness monitoring across protected groups
- [EU AI Act, Annex III](https://artificialintelligenceact.eu/annex/3/): AI used to filter applications and evaluate candidates is classed as high-risk
- [EU AI Act, Article 14: human oversight](https://artificialintelligenceact.eu/article/14/): overseers must guard against automation bias
