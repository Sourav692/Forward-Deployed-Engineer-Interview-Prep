from backend.connectors.zendesk_connector import ZendeskConnector
from backend.ingestion_jobs.incremental_sync import run_incremental_sync
if __name__ == "__main__":
    print(run_incremental_sync(ZendeskConnector("tenant_a", "zendesk")))
