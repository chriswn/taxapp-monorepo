import { getDbPool } from "./pool";
import { LegalNode } from "./types";

interface LegalNodeRow {
  id: string;
  citation: string;
  jurisdiction: string;
  tax_year: number;
  node_type: string;
  title: string | null;
  text_content: string;
}

export async function getLegalNodeByCitation(
  citation: string,
  jurisdiction: string,
  taxYear: number
): Promise<LegalNode | null> {
  const pool = getDbPool();
  const result = await pool.query<LegalNodeRow>(
    `SELECT id, citation, jurisdiction, tax_year, node_type, title, text_content
     FROM legal_nodes
     WHERE citation = $1 AND jurisdiction = $2 AND tax_year = $3
     LIMIT 1`,
    [citation, jurisdiction, taxYear]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    citation: row.citation,
    jurisdiction: row.jurisdiction,
    taxYear: row.tax_year,
    nodeType: row.node_type,
    title: row.title,
    textContent: row.text_content
  };
}
