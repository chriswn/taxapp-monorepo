import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../src/index";

describe("Deduction Evaluation API Integration Tests", () => {
  const validToken = "test_automation_token_999";

  beforeAll(() => {
    process.env.AUTH_TOKEN = validToken;
    process.env.NODE_ENV = "test";
    process.env.USE_MOCK_LEGAL = "1";
  });

  afterAll(() => {
    delete process.env.AUTH_TOKEN;
    delete process.env.NODE_ENV;
    delete process.env.USE_MOCK_LEGAL;
  });

  it("rejects requests missing a valid Bearer token with 401", async () => {
    const response = await request(app)
      .post("/api/v1/evaluate-deduction")
      .send({
        citation: "26-USC-280A-simplified",
        jurisdiction: "FEDERAL"
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("accepts a valid schema and calculates correct math", async () => {
    const response = await request(app)
      .post("/api/v1/evaluate-deduction")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        citation: "26-USC-280A-simplified",
        jurisdiction: "FEDERAL",
        profile: {
          userId: "test-automation-user",
          employmentType: "1099",
          state: "MN",
          taxYear: 2026
        },
        inputs: {
          deductionMethod: "simplified",
          homeOfficeSquareFootage: 250,
          principalPlaceOfBusiness: true
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.eligible).toBe(true);
    expect(response.body.deduction).toBe("1250.00");
  });

  it("calculates actual expense deductions using business-use ratio", async () => {
    const response = await request(app)
      .post("/api/v1/evaluate-deduction")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        citation: "26-USC-280A-actual",
        jurisdiction: "FEDERAL",
        profile: {
          userId: "test-automation-user",
          employmentType: "1099",
          state: "MN",
          taxYear: 2026
        },
        inputs: {
          deductionMethod: "actual",
          homeOfficeSquareFootage: 250,
          totalHomeSquareFootage: 1000,
          principalPlaceOfBusiness: true,
          actualExpenseCosts: {
            mortgageInterest: 6000,
            rent: 1200,
            utilities: 600,
            internet: 300,
            repairs: 200,
            insurance: 400,
            depreciation: 1300
          }
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.eligible).toBe(true);
    expect(response.body.deduction).toBe("2500.00");
    expect(response.body.legal.citation).toBe("26-USC-280A-actual");
  });
});