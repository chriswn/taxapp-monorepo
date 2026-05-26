import axios from 'axios';
import type { EvaluateDeductionRequestInput } from '@taxapp/shared';

export type EvaluateDeductionResponse = {
  eligible: boolean;
  deduction: string;
  trace?: Array<{ section: string; eligible: boolean; calculatedValue: string; reasoning: string }>;
  legal?: { citation?: string; title?: string; textContent?: string };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';
const apiToken = import.meta.env.VITE_API_TOKEN ?? '';

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function evaluateDeduction(payload: EvaluateDeductionRequestInput) {
  const headers = apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined;
  const response = await client.post<EvaluateDeductionResponse>('/api/v1/evaluate-deduction', payload, { headers });
  return response.data;
}

export { apiBaseUrl };