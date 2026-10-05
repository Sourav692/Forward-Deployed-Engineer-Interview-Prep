# Ingestion and Preprocessing

*Careful parsing and cleaning make every later stage better, but each extra check is pipeline work that must keep running as the documents change.*

◷ 7 min

Retrieval quality is decided before the first query, because garbage in means garbage out. Build ingestion as a resilient pipeline and clean text for the search it will face. Record enough about every chunk to trace an answer back, following the offline flow in [The RAG Pipeline End to End](02_The_RAG_Pipeline_End_to_End.md).

**Objectives:**

- design an ingestion pipeline that survives millions of documents, duplicates and bad files;
- choose a parser per file type and the metadata every chunk must carry;
- decide how much to clean, normalise or preserve for a given domain and search style;
- detect drift in what arrives and respond before retrieval degrades.

---

## Build Ingestion as a Queue With Workers

Ingestion collects documents from every place they live and brings them in to be searched later. At scale, treat it like a busy post office. Source connectors pull documents from places like S3, SharePoint, databases or web crawlers. A message queue such as Kafka or SQS holds incoming documents like a waiting line, so a sudden rush does not crash anything. Never process directly from the source.

Parallel workers take documents from the queue and parse, chunk, embed and store them. More speed means more workers. Two safety mechanisms keep the pipeline honest. Idempotency means fingerprinting every document with a hash and skipping any already seen, so a re-run never creates duplicates. A dead-letter queue is a problem box for failed documents, so one bad file never blocks the rest.

The simple flow is source, then queue, then workers, then vector store.

## Parse Each File Type With Its Own Reader

Every file type needs its own parser. The GenAI Engineering guide's choices are below.

| File type | Parser approach |
|---|---|
| PDF | PyMuPDF or pdfplumber; for scanned PDFs, fall back to optical character recognition (OCR) such as Tesseract or AWS Textract |
| DOCX | python-docx, keeping heading levels and table structure |
| HTML | BeautifulSoup or Trafilatura, stripping menus, ads and boilerplate |
| Scanned images | An OCR pipeline; for medical or legal content, OCR models fine-tuned for that field |

The interview tutorial adds the same rule from the delivery side. Pick the loader per source type up front, rather than forcing one loader to handle everything. Then normalise everything to one common document shape before chunking.

## Give Every Chunk an ID Card

Save metadata with each document, because it enables filtering later, such as "only legal documents from the last 6 months". Record the source URL or file path, title, author and creation date. Add document type, language, page or section, and a content hash for deduplication.

Each chunk then carries a metadata envelope: `source_url`, `document_id`, `chunk_id`, page number or section heading, and `ingestion_timestamp`. When the model answers, the envelopes come along. The answer can cite "Source: HR Policy v2.pdf, Page 4" and the user can click through. Also log which chunks were retrieved for every query. That log helps debug wrong answers and supports audits in regulated industries.

In an enterprise the envelope also carries permissions. The FDE Handbook's ingestion flow validates access-control lists before chunking and refuses anything without usable permissions.

## Catch Duplicates, Broken Files, and Low Quality

Bad documents are cheaper to stop at the door than to debug in an answer.

| Problem | How to catch it |
|---|---|
| Exact duplicates | A SHA-256 hash of the content, stored in Redis; same hash, skip it |
| Near duplicates, such as a policy with only a new date (90%+ similar) | MinHash or SimHash |
| Corrupted files | Zero-byte files, decoding errors or replacement characters, and sanity checks such as a 50-page PDF that yields only a few characters |
| Low quality | Low text density, low-confidence language detection, and a high repetition score |

## Clean for the Search, Keep Structure for the Domain

Preprocessing cleans raw text before it is chunked and embedded. The core steps are extracting clean text, fixing encoding problems such as smart quotes, collapsing extra whitespace, and removing repeated headers, footers and boilerplate. Detect language and send other languages to a separate pipeline. Preserve heading hierarchy and table markers, because hierarchical chunking needs them later.

How far to normalise depends on the search and the content. Remove stopwords, the little words like "the" and "is", only for keyword search such as BM25, where word counts matter. Dense embedding models understand context and do not need it. Lowercasing, stemming and lemmatisation work for general content. In medical or legal text they can destroy meaning: stemming "proceedings" to "proceed" loses it. Preserve raw structure for code documentation, legal contracts and financial reports, where indentation, bullet levels and tables carry meaning. The rule of thumb is that the more specialised the domain, the more structure to keep.

Turn tables and images into text that keeps the meaning. Extract tables as structured data, then rewrite each as a sentence ("Q1 revenue was 5M, Q2 was 6M") or store it as a markdown table; sentences embed better than raw HTML tables. For images, have a vision model write a caption and store the caption as the chunk text with a link to the original. For charts, ask for the key insight, not just "a bar chart".

> **Warning: scanned text is wrong in quiet ways.** OCR misreads "rn" as "m" and breaks words across hyphenated lines. Use post-OCR correction with a tool such as SymSpell or a custom dictionary, and regex clean-up for garbled characters. Score confidence per word and re-process low-confidence parts. Prefer layout-aware OCR for columns and tables. At scale, track average OCR confidence per batch and alert when it drops.

## Watch for Drift in What Arrives

Data drift means the documents arriving today slowly differ from what the system was built for, in topic, format or language. Detect it by tracking the vocabulary distribution, average document length, language mix and format ratios weekly. Alert when embedding similarity between new and old batches falls below a threshold. Preprocessing has its own signals: rising token counts, new vocabulary, falling OCR confidence, and a sudden shift such as 40% of files arriving in a new format.

Respond in stages. Build preprocessing as modular steps, so one can be swapped without rebuilding the rest. A/B test new settings on a small batch first. Run a fixed sample of golden documents regularly to confirm output quality has not dropped. When drift metrics cross a threshold, alert and route to human review. Then re-embed affected documents, update parsers, adjust chunking, and keep version logs of ingested batches so any batch can be rolled back or reprocessed.

## Worked Example: A Customer's 40GB of Mixed Documents

A customer hands over 40GB of unstructured PDFs and scanned images. The interview tutorial's answer for the first two weeks is a narrow slice first. In week one, take one document type through loading, chunking, embedding and retrieval end to end, with a rough evaluation. In week two, expand coverage and add the loaders and OCR the real corpus needs, guided by what broke in week one.

Apply this lesson to that slice. Queue the files and process them with workers. Hash each one to skip duplicates and send unreadable files to the dead-letter queue. Parse PDFs normally and route scans to layout-aware OCR, tracking confidence per batch. Rewrite tables as sentences. Attach a metadata envelope to every chunk so each answer can cite its page.

The pipeline is what makes the slice repeatable. Week two adds file types to a pipeline that already handles failure, rather than to a script that assumed none.

---

## Key Takeaways

- Run ingestion as source, queue, workers and store, with idempotent hashing and a dead-letter queue.
- Choose a parser per file type and normalise to one document shape before chunking.
- Give every chunk a metadata envelope so answers can cite and audits can trace.
- Stop duplicates, corrupted files and low-quality text at ingestion.
- Clean for the search style, and keep more structure the more specialised the domain.
- Watch for drift in what arrives, and respond with modular steps, golden documents and re-processing.

## Check Yourself

1. **Why should ingestion never process documents directly from the source?**
   A queue absorbs sudden rushes and lets parallel workers scale. Processing straight from the source lets one spike or one bad file stall the whole pipeline.

2. **When should you remove stopwords?**
   Only for keyword search such as BM25, where word counts matter. Dense embedding models use context and do not need it.

3. **What must every chunk carry for an answer to be traceable?**
   A metadata envelope with source URL, document ID, chunk ID, page or section, and ingestion timestamp, plus a log of which chunks each query retrieved.

## References

**Sources:** `Module_01_RAG_Fundamentals_Core_Components.md` (GenAI Engineering guide): Topic 1 "Data Ingestion" (all five questions) and Topic 2 "Data Preprocessing" (all five questions). `01_What_RAG_Actually_Is.md` (FDE Handbook): "Ingestion — runs on a schedule". `04_rag_and_retrieval_INTERVIEW_TUTORIAL.md`: §5.3 questions on a 40GB corpus and on loader strategy for mixed formats.
