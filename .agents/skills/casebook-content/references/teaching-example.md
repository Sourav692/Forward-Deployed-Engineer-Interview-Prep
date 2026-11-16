# Teaching example from the independent transfer pilot

Source: [Prioritise AI Use Cases for a Large Enterprise](https://forwarddeployedprep.com/design/prioritize-ai-use-cases). This is a corrected representative section, not a completed rewrite of the whole case. Its source comparison is recorded in `teaching-example-coverage.json`. It demonstrates connected explanation, distinct gate failure paths, and an example traced through the decisions.

### 2. Make comparable cards and apply gates {#walkthrough-gates}

“Use AI for fraud” names a broad business area. “Summarise call notes” names a specific workflow step. To compare them, ask each sponsor to describe the same eleven fields. The card below makes missing evidence visible before the team spends time assigning scores.

| Card field | What to record and why |
| --- | --- |
| User and workflow step | Name the person and the step that will change. For call wrap-up, identify the contact-centre agent and the work after each call. “The business” does not identify a user. |
| Outcome metric and current baseline | Write the result to improve and its current value. Without a baseline, the team cannot demonstrate a change. |
| Volume and frequency | Record how often the step happens, including annual volume. A small saving repeated across many calls may justify more investment than a rare task. |
| Decision type | State whether the system informs, recommends, drafts for approval, or acts. Increasing authority changes the consequence of an error and the review needed. |
| Data sources, owner and access status | Name the data, the person who can grant access, and whether access has been requested or granted. Data that exists but cannot be accessed is still a delivery blocker. |
| Integration points | List the systems the application reads and writes. A write can change a business record and therefore needs more controls than a read. |
| Evaluation plan | Explain how correctness will be judged and who will judge it. A subject-matter expert (SME) knows the workflow and helps label expected results. General user feedback does not define a repeatable test. |
| Risk and regulatory notes | Describe who could be harmed by an incorrect output and which rules need review. |
| Platform dependencies | Identify shared ingestion, retrieval, gateway and evaluation components that must exist before this use case can ship. |
| Business owner and SME | Name the person who signs for the outcome and the expert who labels the test examples. These responsibilities need explicit owners. |
| Kill criteria | Write the observed result that would stop the work. Agree it before the team becomes invested in the pilot. |

The source combines its ten prioritisation criteria, six first-pick properties and delivery intake requirements in this card. It estimates that interviewing owners for thirty cards takes about a week. Treat that duration as a planning assumption. Intake finishes when the required fields can be checked, even if the interviews finish earlier.

A weighted score can conceal a fatal problem. A large expected saving might offset a low risk score numerically while leaving the underlying decision unacceptable. Apply the four gates below before ranking a card. Each gate has a different recovery path.

| Gate | Evidence that lets the card proceed | Response when the evidence is missing |
| --- | --- | --- |
| Measurable outcome | An outcome metric and a baseline someone can produce | Return the card to the sponsor to define and measure them. Keep it out of scoring. |
| Named owner and SME | An owner who will sign the outcome and an expert who will label a test set | Hold the card until both responsibilities are assigned. The source's delivery framework requires SME input at three of its six gates. |
| Permissible decision | A decision scope that permits the proposed customer impact and provides the necessary review | Reshape an unreviewed adverse customer decision into decision support, or reject it. |
| Right tool | A reason to prefer the proposed AI approach over a deterministic rule, an existing statistical model or a purchase | Send a rule-based problem to the rules implementation, an established modelling problem to the existing model team, or a commodity capability to procurement. |

Follow the call-wrap-up idea through these checks. The agent is the user, after-call documentation is the workflow step, and current wrap-up time supplies the baseline. An operations owner signs for the outcome. An SME defines acceptable notes and labels a test set. If the baseline is unavailable or nobody will label examples, the card returns to discovery before any score is assigned.

Now consider auto-sent claim-denial letters. The output can take an adverse action on a customer without review, which fails the permissible-decision gate. Reshape the idea as a draft for an adjuster to approve, then reassess that revised card. The source folds this reviewed drafting work into claims intake summary, item #1. A high value estimate for automatic sending cannot bypass the gate.

The right-tool gate also needs its own decision. If a deterministic rule meets the workflow need, route the work to that implementation rather than funding language-model development. Where a purchase meets the need, compare the procurement path. The source identifies low-value workflows as a cost risk, but supplies no frequency estimate for that claim.

Both the card and the gates expose reasons to pause. Assigning a two-week delivery deadline cannot repair an undefined outcome or replace an unavailable SME. Record the missing evidence, its owner and the next check before committing delivery capacity.
