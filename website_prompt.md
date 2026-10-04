
# Design an Applied AI and Forward Deployed Engineering Interview Preparation Platform

You are working inside the current GitHub repository.

I want to transform whol repo into a full-fledged, extensible learning platform focused on:

- Applied AI Engineering
- Forward Deployed Engineering
- AI/ML systems design
- Production-grade software and data engineering
- Real-world AI application development
- Technical interview preparation
- Customer-facing solution delivery
- Technical communication and stakeholder management

The platform should help learners progress from foundational knowledge to advanced, interview-ready capabilities. It should be designed as a structured learning product, not merely a collection of articles or interview questions.

---

## 1. Inspect the Repository and Skill Files First

Before making any recommendations or modifying files, inspect the current project thoroughly.

Review:

- `README` files
- Project documentation
- Markdown files
- Existing source code
- Notebooks
- Examples
- Configuration files
- Existing website or application structure
- Curriculum-related folders
- Interview-preparation content
- AI/ML engineering content
- Project and case-study files
- All relevant documentation and reference material

Also inspect both user-level and project-level Claude Code instructions and skill files, where accessible.

Check locations such as:

```text
~/.claude/
~/.claude/skills/
.claude/
.claude/skills/
CLAUDE.md
```

Also inspect any additional user-level or project-level skill-file locations that are configured or referenced by the environment.

Follow the applicable instructions from these files throughout the task. Do not ignore project-specific conventions, coding standards, content guidelines, or workflow requirements.

If instructions conflict, follow the highest-priority applicable instruction according to the Claude Code environment.

Do not modify any files yet. Start with analysis and recommendations only.

---

## 2. Analyze the Existing Content

Create a structured inventory of the repository content.

For each major file, folder, or content group, identify:

- Primary purpose
- Main topics covered
- Target audience
- Difficulty level
- Prerequisites
- Whether it is foundational or advanced
- Whether it is theoretical or practical
- Whether it is suitable as a lesson, module, exercise, project, case study, or assessment
- Interview relevance
- Dependencies on other content
- Duplicate or overlapping topics
- Missing context
- Recommended location in the new platform

Clearly distinguish between:

1. Content directly found in the repository
2. Content inferred from the repository
3. New content recommended to complete the platform

Do not invent repository-derived content. When making a recommendation based on existing material, reference the relevant file or folder path wherever possible.

---

## 3. Identify Duplication and Define Canonical Locations

The final platform must avoid unnecessary duplication.

If the same concept appears in multiple places:

- Identify the overlap.
- Select one canonical location where the concept should be taught.
- Move or consolidate the concept conceptually into that location.
- Use references from other modules instead of repeating the lesson.
- Explain why the selected location is the canonical source.

Each section and module must have a clear scope and should be independently understandable without duplicating the full content of another module.

---

# Required Deliverables

## 4. Recommend the Website Name

Suggest:

- One primary website name
- Five to ten alternative names
- A tagline for each
- The reasoning behind the recommended name

The name should communicate:

- Practical AI engineering
- Production readiness
- Real-world problem solving
- Technical depth
- Interview preparation
- Forward Deployed Engineering

Avoid names that are too generic, overly academic, or limited only to machine learning theory.

---

## 5. Define the Product Positioning

Provide:

- One concise positioning statement
- Target users
- Learner personas
- Learner pain points
- Core value proposition
- Differentiation from generic AI courses
- Expected learner outcomes
- Recommended difficulty levels

Consider personas such as:

- Software engineers transitioning into AI
- Data engineers moving into Applied AI
- ML engineers preparing for production roles
- Solution architects and consultants
- Candidates preparing for Forward Deployed Engineer roles
- Senior and staff-level engineering candidates

---

## 6. Design the Website Information Architecture

Propose a scalable website structure with clear top-level navigation.

Consider areas such as:

- Home
- Learning paths
- Curriculum
- Projects
- System design
- Interview preparation
- Assessments
- Reference library
- Progress dashboard
- Portfolio
- Profile
- Community or discussion features
- Administration and content management

For every top-level area, define:

- Purpose
- Target audience
- Main sections
- Content types
- Dependencies
- Completion criteria
- Connections to other areas

The structure must support future expansion with new technologies, interview formats, projects, and learning tracks.

---

## 7. Design the Curriculum and Learning Tracks

Create a progressive curriculum from beginner to advanced level.

Use the repository analysis to determine the final structure, but consider tracks such as:

1. Foundations
2. Software Engineering for AI
3. Data Engineering and Retrieval Systems
4. Machine Learning and LLM Fundamentals
5. Applied AI Application Development
6. Production AI Systems
7. AI Systems Design
8. Forward Deployed Engineering
9. Customer and Stakeholder Delivery
10. Interview Preparation
11. Capstone and Portfolio Development

For every track, define:

- Objective
- Target learner
- Prerequisites
- Mandatory modules
- Optional modules
- Recommended sequence
- Hands-on exercises
- Projects
- Assessments
- Interview relevance
- Estimated completion time
- Exit competencies
- Completion criteria

Clearly identify which tracks are mandatory and which are optional.

---

## 8. Define Sections, Modules, and Lessons

For every section, provide:

- Section name
- Purpose
- Why it matters
- Prerequisites
- Learning outcomes
- Modules included
- Practical project or exercise
- Assessment method
- Interview relevance
- Completion criteria

For every module, provide:

- Module name
- Objective
- Scope
- Concepts covered
- Lessons included
- Prerequisites
- Hands-on activities
- Expected deliverables
- Common mistakes
- Related modules
- References to canonical concepts
- Interview questions covered
- Assessment method
- Estimated effort

Each module must have measurable learning outcomes and a clear boundary.

---

## 9. Create a Dependency-Aware Learning Path

Define the recommended order in which learners should progress.

Include separate paths for:

- Beginners
- Experienced software engineers
- Data engineers
- ML engineers
- Solution architects and consultants
- Forward Deployed Engineers
- Learners focused primarily on interview revision

For each path, specify:

- Required modules
- Optional modules
- Prerequisites
- Recommended sequence
- Skip criteria
- Checkpoint assessments
- Required projects
- Interview-readiness criteria

The learner should always know:

- Where they are
- What to study next
- Why the next module matters
- What they must complete before progressing
- Which skills they have demonstrated
- Which skills require revision

---

## 10. Design the Interview Preparation Framework

Create a dedicated interview-preparation area covering:

### Technical Foundations

- Python and software engineering
- Data structures and algorithms
- SQL
- APIs and backend engineering
- Distributed systems
- Cloud fundamentals
- Containers and deployment

### AI and Machine Learning

- Machine learning fundamentals
- Model evaluation
- Embeddings
- Vector search
- Retrieval-augmented generation
- Prompt engineering
- Agentic systems
- Fine-tuning and model adaptation
- Inference optimization
- AI safety and reliability
- AI evaluation and observability

### AI Systems Design

- End-to-end AI architecture
- Data ingestion and processing
- Feature and embedding pipelines
- Model serving
- Batch and real-time inference
- Scalability
- Reliability
- Security and governance
- Cost optimization
- Monitoring
- Rollback and failure handling

### Forward Deployed Engineering

- Customer discovery
- Requirement clarification
- Ambiguous problem solving
- Rapid prototyping
- Technical workshops
- Production deployment
- Customer-environment debugging
- Stakeholder communication
- Trade-off analysis
- Adoption and change management
- Measuring business impact

### Behavioral and Communication Skills

- Project storytelling
- Handling ambiguity
- Conflict resolution
- Explaining technical trade-offs
- Incident management
- Influencing without authority
- Executive communication
- Communicating with non-technical stakeholders
- Explaining complex systems clearly

For every interview topic, include:

- Concept review
- Example questions
- Expected answer structure
- Evaluation rubric
- Common weak answers
- Follow-up questions
- Practice exercises
- Mock interview format
- Related curriculum modules

Keep learning content separate from interview practice. Reference curriculum modules instead of copying their content.

---

## 11. Define Practical Projects and Capstones

Recommend a progressive project portfolio.

Projects should reflect realistic Applied AI and Forward Deployed Engineering scenarios rather than isolated toy examples.

For every project, define:

- Project title
- Business problem
- Target user
- Functional requirements
- Non-functional requirements
- Suggested architecture
- Data requirements
- AI/ML components
- Deployment expectations
- Observability requirements
- Security considerations
- Cost considerations
- Evaluation strategy
- Expected deliverables
- Stretch goals
- Interview questions generated from the project
- Portfolio presentation guidance
- Completion rubric

Include:

- Individual implementation projects
- Debugging exercises
- Architecture design exercises
- Customer-case simulations
- Productionization projects
- Timed interview projects
- Final capstone projects

---

## 12. Design the Learning Progress Tracker

Design a progress-tracking system that operates at multiple levels:

- Overall learning journey
- Learning track
- Section
- Module
- Lesson
- Exercise
- Project
- Assessment
- Mock interview
- Individual skill
- Competency area

Use statuses such as:

- Not started
- In progress
- Blocked
- Ready for review
- Completed
- Needs revision
- Mastered

Track, where relevant:

- Completion status
- Time spent
- Last accessed date
- Assessment score
- Number of attempts
- Confidence level
- Notes
- Bookmarks
- Revision history
- Project links
- GitHub repository
- Interview performance
- Skill proficiency
- Recommended next action

Define:

- Module completion rules
- Assessment pass criteria
- Prerequisite validation
- Module unlock rules
- Revision workflows
- Interview-readiness score
- Portfolio-readiness score
- Skill-gap detection

Prioritize meaningful progress over superficial gamification.

---

## 13. Design the Learner Dashboard

Define a dashboard that displays:

- Current learning path
- Overall progress
- Current module
- Recommended next activity
- Upcoming assessments
- Weak areas
- Revision queue
- Active projects
- Interview readiness
- Portfolio readiness
- Recent activity
- Saved references
- Learning history

Provide a sample layout and explain the most important user actions.

---

## 14. Define the Content Model

Recommend a reusable content model containing entities such as:

- Track
- Section
- Module
- Lesson
- Exercise
- Project
- Assessment
- Interview question
- Case study
- Reference
- Skill
- Competency
- User progress
- Attempt
- Review
- Portfolio artifact

For each entity, define:

- Purpose
- Required fields
- Optional fields
- Relationships
- Completion logic
- Reusability rules

The model must support references and reuse without duplicating instructional content.

---

## 15. Define Content Quality Standards

Create standards for future content, including:

- Lesson structure
- Learning objectives
- Technical depth
- Examples
- Diagrams
- Exercises
- Assessments
- Interview questions
- References
- Prerequisites
- Difficulty labels
- Estimated completion time
- Versioning
- Content freshness
- Technology-specific content
- Avoiding duplication
- Handling rapidly changing AI topics

Every lesson must have a clear purpose and measurable outcome.

---

## 16. Define the MVP and Future Roadmap

Separate the product into:

### MVP

Define the minimum content and features required to launch a useful first version.

### Version 2

Define improvements for personalization, feedback, analytics, and engagement.

### Long-Term Roadmap

Consider:

- Personalized learning paths
- AI-generated feedback
- Mock interview evaluation
- Skill-gap analysis
- Portfolio review
- Community features
- Mentor review
- Cohort support
- Certification
- Employer-facing profiles
- Advanced analytics
- Intelligent content recommendations

Prioritize each item and explain its value.

---

# Required Output Structure

Organize your response into the following sections:

1. Executive summary
2. Repository and skill-file analysis
3. Content inventory
4. Duplicate and overlap analysis
5. Recommended website name
6. Alternative names and taglines
7. Product positioning
8. Learner personas
9. Website information architecture
10. Curriculum tracks
11. Detailed sections and modules
12. Dependency-aware learning paths
13. Applied AI interview framework
14. Forward Deployed Engineering interview framework
15. Projects and capstones
16. Progress-tracking system
17. Learner dashboard
18. Content model
19. Content quality standards
20. MVP scope
21. Future roadmap
22. Risks and trade-offs
23. Final recommended structure
24. Next five implementation steps

Use tables wherever they improve clarity.

Make the recommendation opinionated. Do not provide only a vague list of alternatives. Select one recommended structure and explain why it is the best fit for the existing repository and target audience.

For every major recommendation, indicate whether it is based on:

- Existing repository content
- Reorganized repository content
- New recommended content

Do not modify, delete, move, or rename any files unless I explicitly ask you to do so.

At the end, provide a concise final recommendation covering:

- Selected website name
- Top-level navigation
- Recommended learning sequence
- Initial sections to build
- MVP content
- Progress-tracking model
- Next five implementation steps

---
