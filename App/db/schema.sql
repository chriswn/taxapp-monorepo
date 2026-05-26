CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS legal_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citation VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(50) NOT NULL,
    tax_year INT NOT NULL,
    node_type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    text_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (citation, jurisdiction, tax_year)
);

CREATE INDEX IF NOT EXISTS idx_legal_nodes_lookup
    ON legal_nodes (citation, jurisdiction, tax_year);

CREATE TABLE IF NOT EXISTS legal_edges (
    source_node_id UUID REFERENCES legal_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES legal_nodes(id) ON DELETE CASCADE,
    edge_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (source_node_id, target_node_id)
);
