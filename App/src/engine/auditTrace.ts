import Decimal from "decimal.js";
import { AuditStep } from "./types";

export class AuditTrace {
  public readonly steps: AuditStep[] = [];

  logStep(section: string, eligible: boolean, calculatedValue: Decimal, reasoning: string) {
    this.steps.push({
      section,
      eligible,
      calculatedValue: calculatedValue.toFixed(2),
      reasoning
    });
  }
}
