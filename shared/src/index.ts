import { z } from "zod";

export const EmploymentTypeSchema = z.enum(["1099", "W2", "OTHER"]);
export const DeductionMethodSchema = z.enum(["simplified", "actual"]);
export const FilingStatusSchema = z.enum(["single", "hoh", "mfj", "mfs", "qss"]);
export const TaxModuleSchema = z.enum(["w2", "homeOffice", "investments"]);

export const UserProfileSchema = z
  .object({
    userId: z.string().min(1),
    employmentType: EmploymentTypeSchema,
    state: z
      .string()
      .length(2)
      .transform((value) => value.toUpperCase()),
    taxYear: z.number().int().min(2000).max(2100)
  })
  .strict();

export const ActualExpenseCostsSchema = z
  .object({
    mortgageInterest: z.number().min(0),
    rent: z.number().min(0),
    utilities: z.number().min(0),
    internet: z.number().min(0),
    repairs: z.number().min(0),
    insurance: z.number().min(0),
    depreciation: z.number().min(0)
  })
  .strict();

export const HomeOfficeInputsSchema = z
  .object({
    deductionMethod: DeductionMethodSchema.default("simplified"),
    homeOfficeSquareFootage: z.number().int().min(0),
    principalPlaceOfBusiness: z.boolean(),
    totalHomeSquareFootage: z.number().int().min(0).optional(),
    actualExpenseCosts: ActualExpenseCostsSchema.optional()
  })
  .strict();

export const HomeOfficeRequestSchema = z
  .object({
    profile: UserProfileSchema,
    inputs: HomeOfficeInputsSchema
  })
  .strict();

export const W2DataSchema = z
  .object({
    box1Wages: z.number().min(0).default(0)
  })
  .strict();

export const TaxWizardProfileSchema = z
  .object({
    filingStatus: FilingStatusSchema,
    taxYear: z.literal(2025),
    enabledModules: z.array(TaxModuleSchema).min(1)
  })
  .strict();

export const TaxWizardPayloadSchema = z
  .object({
    profile: TaxWizardProfileSchema,
    w2Data: W2DataSchema.optional(),
    homeOfficeData: HomeOfficeInputsSchema.optional()
  })
  .strict();

export const EvaluateDeductionRequestSchema = HomeOfficeRequestSchema.extend({
  citation: z.string().min(1).default("26-USC-280A-actual"),
  jurisdiction: z
    .string()
    .min(2)
    .max(50)
    .default("FEDERAL")
    .transform((value) => value.toUpperCase())
}).strict();

export type EmploymentType = z.infer<typeof EmploymentTypeSchema>;
export type DeductionMethod = z.infer<typeof DeductionMethodSchema>;
export type FilingStatus = z.infer<typeof FilingStatusSchema>;
export type TaxModule = z.infer<typeof TaxModuleSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ActualExpenseCosts = z.infer<typeof ActualExpenseCostsSchema>;
export type HomeOfficeInputs = z.infer<typeof HomeOfficeInputsSchema>;
export type HomeOfficeRequest = z.infer<typeof HomeOfficeRequestSchema>;
export type W2Data = z.infer<typeof W2DataSchema>;
export type TaxWizardProfile = z.infer<typeof TaxWizardProfileSchema>;
export type TaxWizardPayload = z.infer<typeof TaxWizardPayloadSchema>;
export type EvaluateDeductionRequest = z.infer<typeof EvaluateDeductionRequestSchema>;

// Input types are useful at API boundaries before defaults/transforms are applied.
export type HomeOfficeRequestInput = z.input<typeof HomeOfficeRequestSchema>;
export type TaxWizardPayloadInput = z.input<typeof TaxWizardPayloadSchema>;
export type EvaluateDeductionRequestInput = z.input<typeof EvaluateDeductionRequestSchema>;
