def handle_deleted_documents(connector, cursor=None):
    return {"deleted": connector.fetch_deleted_items(cursor)}
