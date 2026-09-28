def sync_permissions(connector, item_id: str):
    return connector.fetch_permissions(item_id)
