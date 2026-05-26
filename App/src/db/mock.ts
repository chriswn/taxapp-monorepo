import { LegalNode } from "./types";

const mockLegalNodes: Record<string, LegalNode> = {
  "26-USC-280A-simplified:FEDERAL:2026": {
    id: "550e8400-e29b-41d4-a716-446655440000",
    citation: "26-USC-280A-simplified",
    jurisdiction: "FEDERAL",
    taxYear: 2026,
    nodeType: "CLAUSE",
    title: "Simplified Home Office",
    textContent:
      "Simplified Home Office Deduction: Allows a standard deduction of $5 per square foot " +
      "for the business use of a home, up to a maximum statutory limit of 300 square feet " +
      "($1,500 maximum total deduction). Must be the principal place of business for a 1099 worker."
  },
  "26-USC-280A-actual:FEDERAL:2026": {
    id: "550e8400-e29b-41d4-a716-446655440001",
    citation: "26-USC-280A-actual",
    jurisdiction: "FEDERAL",
    taxYear: 2026,
    nodeType: "CLAUSE",
    title: "Actual Expense Home Office",
    textContent:
      "Actual Expense Home Office Deduction: Allows deduction of the business-use portion " +
      "of eligible annual home expenses, including mortgage interest, rent, utilities, internet, " +
      "repairs, insurance, and depreciation, multiplied by the verified home office business-use ratio."
  }
};

export async function getMockLegalNode(
  citation: string,
  jurisdiction: string,
  taxYear: number
): Promise<LegalNode | null> {
  const key = `${citation}:${jurisdiction}:${taxYear}`;
  return mockLegalNodes[key] ?? null;
}
