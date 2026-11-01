/**
 * Site-only rewrites for pages outside the casebook: the worksheets and answer keys sync
 * copies, and the RAG & Agents Engineering theory pages the import vendors. The site names
 * no vendor platform (owner decision, 2 November 2026), so a line that names Databricks or
 * one of its products gets a rule here, worded vendor-neutrally. The root markdown and the
 * course keep their wording. Case pages have their own rules in case-site-edits.mjs.
 *
 * Keys are repository paths. Each rule is [from, to], with `from` a string (every occurrence
 * is replaced) or a RegExp; a rule that matches nothing fails, so a source edit cannot leave
 * a dead rule behind. After the rules, any surviving `CUT` term fails too.
 */
import { CUT } from './case-site-edits.mjs'

const COURSE = '01_Concept_Tutorials/RAG_Agents_Engineering'
const BEHAVIOURAL = '04_Behavioral_and_Leadership/fde_competencies'

export const SITE_TEXT_EDITS = {
  [`${BEHAVIOURAL}/01_customer_focus_and_discovery.md`]: [
    ["the insurer's Unity Catalog governance rollout", "the insurer's data-governance rollout"],
  ],
  [`${BEHAVIOURAL}/answer_keys/01_customer_focus_and_discovery_answer_key.md`]: [
    ["the insurer's Unity Catalog governance rollout", "the insurer's data-governance rollout"],
  ],
  [`${BEHAVIOURAL}/answer_keys/02_communication_and_influence_answer_key.md`]: [
    ['against Unity Catalog grants', "against the data catalogue's grants"],
    ['compiled into the Vector Search query', 'compiled into the vector search query'],
    ['inside their Unity Catalog', 'inside their governed catalogue'],
  ],
  [`${BEHAVIOURAL}/answer_keys/05_ownership_standards_and_failure_answer_key.md`]: [
    ['Its Vector Search index is a derived copy that does not inherit Unity Catalog row filters.', "Its vector index is a derived copy that does not inherit the catalogue's row filters."],
    ["a Vector Search index — it's called AI Search now — is a derived copy that doesn't inherit Unity Catalog's row filters", "its vector index is a derived copy that doesn't inherit the catalogue's row filters"],
  ],
  [`${BEHAVIOURAL}/06_scale_beyond_yourself.md`]: [['Genie managed text-to-SQL', 'managed text-to-SQL']],
  [`${BEHAVIOURAL}/answer_keys/06_scale_beyond_yourself_answer_key.md`]: [
    ['A second, Databricks-native version documents', 'A second, platform-native version documents'],
    ['a second, Databricks-native version specifically to document the Vector Search / Unity Catalog governance gap', "a second, platform-native version specifically to document the gap between the vector index and the catalogue's governance"],
    ['For analytics, Genie Spaces won.', 'For analytics, a managed text-to-SQL service won.'],
    ['Genie managed text-to-SQL', 'managed text-to-SQL'],
    ['I used Genie Spaces — a managed text-to-SQL service — rather than', 'I used a managed text-to-SQL service rather than'],
  ],
  [`${BEHAVIOURAL}/answer_keys/07_leading_people_answer_key.md`]: [
    ['the evaluation dataset, the Genie Space curation', 'the evaluation dataset, curating the text-to-SQL space'],
  ],
  [`${COURSE}/p05_ingestion_and_indexing/m14_embeddings/03_open_source_embeddings_with_hugging_face.md`]: [
    [
      /The optional lesson \d+ of T[\d.]+ notebook, \[`05a_compare_embedding_models_databricks\.ipynb`\]\([^)]*\), (indexes eight short documents with three open models) in Databricks Vector Search/,
      'An optional notebook in the course $1 in a managed vector index',
    ],
  ],
  [`${COURSE}/p06_retrieval_quality/m17_retrievers_hybrid_search/06_retriever_patterns_compared_hybrid_rerank_on_databricks_vector_search.md`]: [
    [/^(# .*) on Databricks Vector Search$/m, '$1 in a managed vector store'],
    ['`06b` moves hybrid search and reranking into the vector store. On a Databricks Vector Search index it embeds', '`06b`, an optional notebook, moves hybrid search and reranking into a managed vector store. It embeds'],
    ['and `reranker=DatabricksReranker(columns_to_rerank=["text"])`', 'and a `reranker` over the `text` column'],
    ['Notebook 06b says the Databricks reranker', "Notebook 06b says the store's reranker"],
  ],
  [`${COURSE}/p10_memory_and_multi_agent/m37_multi_agent_builds_deep_agents/06_deep_agents_orchestrator_sub_agents_skills_and_long_term_memory.md`]: [
    ['four Databricks Genie tools for', 'four tools over a managed text-to-SQL service for'],
    ['`databricks-claude-opus-4-6`, temperature 0.1', 'Claude Opus 4.6 on a model-serving endpoint, temperature 0.1'],
    ['| A Unity Catalog volume |', '| A governed storage volume |'],
  ],
  [`${COURSE}/p11_agent_protocols/m39_building_mcp_servers_and_clients/05_transports_sse_and_streamable_http.md`]: [
    [/Lesson \d+ of T[\d.]+'s Databricks server ends with `mcp\.run\(\)`\./, 'A server written for local use often ends with `mcp.run()`.'],
  ],
}

/** True when a notebook or link names a vendor platform; such links stay off the site. */
export const namesVendor = (text) => CUT.test(text)

/**
 * `markdown` as the site shows it: the rules for `path` applied, then checked for a surviving
 * vendor name. A link target that ends in `.md` is skipped, because sync turns it into a site
 * URL built from the lesson's slug.
 */
export function siteText(path, markdown) {
  let md = markdown
  for (const [from, to] of SITE_TEXT_EDITS[path] ?? []) {
    const next = typeof from === 'string' ? md.split(from).join(to) : md.replace(from, to)
    if (next === md) throw new Error(`${path}: site text rule matches nothing: ${from}`)
    md = next
  }
  const line = md.split('\n').find((l) => CUT.test(l.replace(/\]\([^)\s]*\.md(?:#[^)\s]*)?\)/g, '](lesson)')))
  if (line) throw new Error(`${path}: names a vendor platform the site leaves out; add a rule in site-text-edits.mjs:\n  ${line.trim()}`)
  return md
}
