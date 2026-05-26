export type EmploymentType = "1099" | "W2" | "OTHER";
export type DeductionMethod = "simplified" | "actual";

export interface ActualExpenseCosts {
  mortgageInterest: number;
  rent: number;
  utilities: number;
  internet: number;
  repairs: number;
  insurance: number;
  depreciation: number;
}

export interface UserProfile {
  userId: string;
  employmentType: EmploymentType;
  state: string;
  taxYear: number;
}

export interface HomeOfficeInputs {
  deductionMethod: DeductionMethod;
  homeOfficeSquareFootage: number;
  principalPlaceOfBusiness: boolean;
  totalHomeSquareFootage?: number;
  actualExpenseCosts?: ActualExpenseCosts;
}

export interface AuditStep {
  section: string;
  eligible: boolean;
  calculatedValue: string;
  reasoning: string;
}
