import Decimal from "decimal.js";
import { AuditTrace } from "./auditTrace";
import { HomeOfficeInputs, UserProfile } from "./types";

export interface HomeOfficeDecision {
  eligible: boolean;
  deduction: Decimal;
  trace: AuditTrace["steps"];
}

const SIMPLIFIED_RATE = new Decimal(5);
const MAX_SQ_FT = 300;
const CITATION = "26-USC-280A-simplified";
const ACTUAL_EXPENSE_CITATION = "26-USC-280A-actual";

export function evaluateHomeOffice(
  profile: UserProfile,
  inputs: HomeOfficeInputs,
  trace: AuditTrace = new AuditTrace()
): HomeOfficeDecision {
  if (inputs.deductionMethod === "actual") {
    return evaluateActualExpenseMethod(profile, inputs, trace);
  }

  if (profile.employmentType !== "1099") {
    trace.logStep(CITATION, false, new Decimal(0), "User is not a 1099 independent contractor.");
    return { eligible: false, deduction: new Decimal(0), trace: trace.steps };
  }

  if (!inputs.principalPlaceOfBusiness) {
    trace.logStep(CITATION, false, new Decimal(0), "Space is not documented as the principal place of business.");
    return { eligible: false, deduction: new Decimal(0), trace: trace.steps };
  }

  if (inputs.homeOfficeSquareFootage <= 0) {
    trace.logStep(CITATION, false, new Decimal(0), "Square footage must be greater than zero.");
    return { eligible: false, deduction: new Decimal(0), trace: trace.steps };
  }

  const allowedSqFt = Math.min(inputs.homeOfficeSquareFootage, MAX_SQ_FT);
  const deduction = new Decimal(allowedSqFt).mul(SIMPLIFIED_RATE);

  trace.logStep(
    CITATION,
    true,
    deduction,
    `Approved. Computed ${allowedSqFt} sq ft at $5.00/sq ft standard rate.`
  );

  return { eligible: true, deduction, trace: trace.steps };
}

function evaluateActualExpenseMethod(
  profile: UserProfile,
  inputs: HomeOfficeInputs,
  trace: AuditTrace
): HomeOfficeDecision {
  if (profile.employmentType !== "1099") {
    trace.logStep(ACTUAL_EXPENSE_CITATION, false, new Decimal(0), "User is not a 1099 independent contractor.");
    return { eligible: false, deduction: new Decimal(0), trace: trace.steps };
  }

  if (!inputs.principalPlaceOfBusiness) {
    trace.logStep(
      ACTUAL_EXPENSE_CITATION,
      false,
      new Decimal(0),
      "Space is not documented as the principal place of business."
    );
    return { eligible: false, deduction: new Decimal(0), trace: trace.steps };
  }

  if (!inputs.totalHomeSquareFootage || inputs.totalHomeSquareFootage <= 0) {
    trace.logStep(
      ACTUAL_EXPENSE_CITATION,
      false,
      new Decimal(0),
      "Total home square footage must be greater than zero for the actual expense method."
    );
    return { eligible: false, deduction: new Decimal(0), trace: trace.steps };
  }

  if (!inputs.actualExpenseCosts) {
    trace.logStep(
      ACTUAL_EXPENSE_CITATION,
      false,
      new Decimal(0),
      "Actual expense cost inputs are required for the actual expense method."
    );
    return { eligible: false, deduction: new Decimal(0), trace: trace.steps };
  }

  const businessUsePercentage = new Decimal(
    Math.min(inputs.homeOfficeSquareFootage / inputs.totalHomeSquareFootage, 1)
  );

  const expenseTotal = new Decimal(inputs.actualExpenseCosts.mortgageInterest)
    .plus(inputs.actualExpenseCosts.rent)
    .plus(inputs.actualExpenseCosts.utilities)
    .plus(inputs.actualExpenseCosts.internet)
    .plus(inputs.actualExpenseCosts.repairs)
    .plus(inputs.actualExpenseCosts.insurance)
    .plus(inputs.actualExpenseCosts.depreciation);

  const deduction = expenseTotal.mul(businessUsePercentage);

  trace.logStep(
    ACTUAL_EXPENSE_CITATION,
    true,
    deduction,
    `Approved actual expense method. Applied ${businessUsePercentage.mul(100).toFixed(2)}% business use ratio to annual home expenses.`
  );

  return { eligible: true, deduction, trace: trace.steps };
}
