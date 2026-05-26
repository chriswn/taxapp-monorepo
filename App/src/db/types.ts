export interface LegalNode {
  id: string;
  citation: string;
  jurisdiction: string;
  taxYear: number;
  nodeType: string;
  title: string | null;
  textContent: string;
}
