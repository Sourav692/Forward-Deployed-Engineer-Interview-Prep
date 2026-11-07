/**
 * RAG course labs and lesson figures whose URL changed with the course's v2 layout (2026-11-08),
 * as old public path -> new public path. redirects.ts sends each old URL to the new one.
 *
 * Generated once, from data: every file under public/labs/rag/ and public/learn-assets/rag/ on
 * main before the v2 import (commit d74f4801), mapped through the course's curriculum.yaml
 * (v1 at rag-agents-engineering d42fdee; v2 modules' previous_num and lessons' previous) to
 * the file the v2 import vendors. Every one of them still exists. The old URLs are history,
 * so the table is never regenerated: when a file moves again, update its value here.
 */
export const RAG_ASSET_MOVES: Record<string, string> = {
  '/labs/rag/m04_fine_tuning_fundamentals/truncation-padding-lab.html': '/labs/rag/m45_fine_tuning_model_adaptation/truncation-padding-lab.html',
  '/labs/rag/m05_prompt_engineering_patterns/self-consistency-vote-lab.html': '/labs/rag/m04_prompt_engineering_patterns/self-consistency-vote-lab.html',
  '/labs/rag/m06_multimodal_prompting/frame-sampling-lab.html': '/labs/rag/m05_multimodal_prompting/frame-sampling-lab.html',
  '/labs/rag/m07_langchain_core/parser-bench-lab.html': '/labs/rag/m06_langchain_core/parser-bench-lab.html',
  '/labs/rag/m08_lcel_runnables_and_chains/summarise-strategy-lab.html': '/labs/rag/m07_lcel_runnables_and_chains/summarise-strategy-lab.html',
  '/labs/rag/m09_langgraph_core/reducer-lab.html': '/labs/rag/m08_langgraph_core/reducer-lab.html',
  '/labs/rag/m10_langgraph_runtime/resume-side-effects-lab.html': '/labs/rag/m09_langgraph_runtime/resume-side-effects-lab.html',
  '/labs/rag/m11_rag_lifecycle/top-k-retrieval-lab.html': '/labs/rag/m10_rag_lifecycle/top-k-retrieval-lab.html',
  '/labs/rag/m12_document_ingestion/pdf-parsers-lab.html': '/labs/rag/m11_document_ingestion/pdf-parsers-lab.html',
  '/labs/rag/m13_chunking/chunk-size-overlap-lab.html': '/labs/rag/m12_chunking/chunk-size-overlap-lab.html',
  '/labs/rag/m14_embeddings/similarity-metrics-lab.html': '/labs/rag/m13_embeddings/similarity-metrics-lab.html',
  '/labs/rag/m15_vector_stores/record-manager-lab.html': '/labs/rag/m14_vector_stores/record-manager-lab.html',
  '/labs/rag/m16_advanced_indexing/search-small-return-large-lab.html': '/labs/rag/m15_advanced_indexing/search-small-return-large-lab.html',
  '/labs/rag/m17_retrievers_hybrid_search/hybrid-fusion-lab.html': '/labs/rag/m16_retrievers_hybrid_search/hybrid-fusion-lab.html',
  '/labs/rag/m18_query_transformation/query-variant-fusion-lab.html': '/labs/rag/m17_query_transformation/query-variant-fusion-lab.html',
  '/labs/rag/m19_reranking_post_retrieval/rerank-precision-lab.html': '/labs/rag/m18_reranking_post_retrieval/rerank-precision-lab.html',
  '/labs/rag/m20_end_to_end_rag_systems/sample-or-population-lab.html': '/labs/rag/m19_end_to_end_rag_systems/sample-or-population-lab.html',
  '/labs/rag/m21_multimodal_rag/chart-retrieval-lab.html': '/labs/rag/m20_multimodal_rag/chart-retrieval-lab.html',
  '/labs/rag/m22_llamaindex/sentence-window-lab.html': '/labs/rag/m21_llamaindex/sentence-window-lab.html',
  '/labs/rag/m23_agent_loop_and_tools/tool-error-routing-lab.html': '/labs/rag/m22_agent_loop_and_tools/tool-error-routing-lab.html',
  '/labs/rag/m24_react_agents/react-loop-lab.html': '/labs/rag/m23_react_agents/react-loop-lab.html',
  '/labs/rag/m25_agentic_workflow_patterns/fan-out-lab.html': '/labs/rag/m24_agentic_workflow_patterns/fan-out-lab.html',
  '/labs/rag/m26_planning_reflection_reasoning/plan-or-react-lab.html': '/labs/rag/m25_planning_reflection_reasoning/plan-or-react-lab.html',
  '/labs/rag/m33_conversational_memory_rag/follow-up-retrieval-lab.html': '/labs/rag/m33_short_term_memory_conversation_state/follow-up-retrieval-lab.html',
  '/labs/rag/m37_multi_agent_builds_deep_agents/router-test-bench-lab.html': '/labs/rag/m37_multi_agent_applied_builds/router-test-bench-lab.html',
  '/labs/rag/m45_architecture_synthesis/architecture-picker-lab.html': '/labs/rag/m46_architecture_synthesis/architecture-picker-lab.html',
  '/learn-assets/rag/m05_prompt_engineering_patterns/02_reasoning_prompts_chain_of_thought_self_consistency_least_to_most_react/diagrams/vote-accuracy.svg': '/learn-assets/rag/m04_prompt_engineering_patterns/02_reasoning_prompts_chain_of_thought_self_consistency_least_to_most_react/diagrams/vote-accuracy.svg',
  '/learn-assets/rag/m06_multimodal_prompting/02_multimodal_prompting_with_gpt_4o/diagrams/image-tiles.svg': '/learn-assets/rag/m05_multimodal_prompting/02_multimodal_prompting_with_gpt_4o/diagrams/image-tiles.svg',
  '/learn-assets/rag/m12_document_ingestion/04_pdf_and_word_parser_comparison_and_element_level_parsing/diagrams/page-to-elements.svg': '/learn-assets/rag/m11_document_ingestion/04_pdf_and_word_parser_comparison_and_element_level_parsing/diagrams/page-to-elements.svg',
  '/learn-assets/rag/m13_chunking/01_splitter_fundamentals_character_recursive_token_and_structure_aware/diagrams/size-and-overlap.svg': '/learn-assets/rag/m12_chunking/01_splitter_fundamentals_character_recursive_token_and_structure_aware/diagrams/size-and-overlap.svg',
  '/learn-assets/rag/m13_chunking/02_semantic_chunking_breakpoints_on_embedding_distance/diagrams/breakpoints.svg': '/learn-assets/rag/m12_chunking/02_semantic_chunking_breakpoints_on_embedding_distance/diagrams/breakpoints.svg',
  '/learn-assets/rag/m14_embeddings/01_embedding_fundamentals_similarity_metrics_and_model_selection/diagrams/three-metrics.svg': '/learn-assets/rag/m13_embeddings/01_embedding_fundamentals_similarity_metrics_and_model_selection/diagrams/three-metrics.svg',
  '/learn-assets/rag/m15_vector_stores/02_embedded_stores_chroma_and_faiss/diagrams/hnsw-layers.svg': '/learn-assets/rag/m14_vector_stores/02_embedded_stores_chroma_and_faiss/diagrams/hnsw-layers.svg',
  '/learn-assets/rag/m16_advanced_indexing/05_context_aware_chunks_contextual_headers_and_contextual_retrieval/diagrams/kite-results.svg': '/learn-assets/rag/m15_advanced_indexing/05_context_aware_chunks_contextual_headers_and_contextual_retrieval/diagrams/kite-results.svg',
  '/learn-assets/rag/m17_retrievers_hybrid_search/02_dense_sparse_hybrid_retrieval_with_bm25_and_ensembleretriever/diagrams/bm25-saturation.svg': '/learn-assets/rag/m16_retrievers_hybrid_search/02_dense_sparse_hybrid_retrieval_with_bm25_and_ensembleretriever/diagrams/bm25-saturation.svg',
  '/learn-assets/rag/m17_retrievers_hybrid_search/03_fusion_retrieval_score_normalisation_vs_rank_fusion/diagrams/rrf-k.svg': '/learn-assets/rag/m16_retrievers_hybrid_search/03_fusion_retrieval_score_normalisation_vs_rank_fusion/diagrams/rrf-k.svg',
  '/learn-assets/rag/m19_reranking_post_retrieval/05_context_enrichment_windows/diagrams/enrichment-window.svg': '/learn-assets/rag/m18_reranking_post_retrieval/05_context_enrichment_windows/diagrams/enrichment-window.svg',
  '/learn-assets/rag/m19_reranking_post_retrieval/06_relevant_segment_extraction/diagrams/best-segment.svg': '/learn-assets/rag/m18_reranking_post_retrieval/06_relevant_segment_extraction/diagrams/best-segment.svg',
  '/learn-assets/rag/m21_multimodal_rag/01_shared_text_image_embedding_space_with_clip/diagrams/modality-gap.svg': '/learn-assets/rag/m20_multimodal_rag/01_shared_text_image_embedding_space_with_clip/diagrams/modality-gap.svg',
  '/learn-assets/rag/m26_planning_reflection_reasoning/01_plan_and_execute_vs_react_decompose_execute_replan/diagrams/tokens-by-lookups.svg': '/learn-assets/rag/m25_planning_reflection_reasoning/01_plan_and_execute_vs_react_decompose_execute_replan/diagrams/tokens-by-lookups.svg',
  '/learn-assets/rag/m45_architecture_synthesis/01_the_agentic_rag_architecture_map/diagrams/counted-calls.svg': '/learn-assets/rag/m46_architecture_synthesis/01_the_agentic_rag_architecture_map/diagrams/counted-calls.svg',
}
