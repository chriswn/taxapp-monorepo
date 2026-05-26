import { AuditTrace } from "./auditTrace";
import { evaluateHomeOffice, HomeOfficeDecision } from "./homeOffice";
import { HomeOfficeInputs, UserProfile } from "./types";

export class TaxRulesEngine {
  private readonly profile: UserProfile;

  constructor(profile: UserProfile) {
    this.profile = profile;
  }

  evaluateHomeOffice(inputs: HomeOfficeInputs): HomeOfficeDecision {
    const trace = new AuditTrace();
    return evaluateHomeOffice(this.profile, inputs, trace);
  }
}
