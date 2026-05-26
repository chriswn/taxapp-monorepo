import express from "express";
import { EvaluateDeductionRequestSchema, HomeOfficeRequestSchema } from "@taxapp/shared";
import { TaxRulesEngine } from "./engine/rulesEngine";
import { getLegalNodeByCitation } from "./db/legalNodes";
import { checkDbConnection } from "./db/health";
import { isDbConfigured } from "./db/pool";
import { getMockLegalNode } from "./db/mock";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

function requireBearerToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const requiredToken = process.env.API_BEARER_TOKEN ?? process.env.AUTH_TOKEN;
  if (!requiredToken) {
    return next();
  }

  const authorizationHeader = req.header("authorization");
  const token = authorizationHeader?.startsWith("Bearer ") ? authorizationHeader.slice(7) : undefined;
  if (!token || token !== requiredToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  if (process.env.USE_MOCK_LEGAL === "1") {
    return res.json({ status: "mock" });
  }

  if (!isDbConfigured()) {
    return res.status(503).json({ status: "not_configured" });
  }

  try {
    await checkDbConnection();
    return res.json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed", error);
    return res.status(503).json({ status: "error" });
  }
});

app.post("/v1/deductions/home-office", requireBearerToken, (req, res) => {
  const parsed = HomeOfficeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten()
    });
  }

  const { profile, inputs } = parsed.data;
  const engine = new TaxRulesEngine(profile);
  const decision = engine.evaluateHomeOffice(inputs);

  return res.json({
    eligible: decision.eligible,
    deduction: decision.deduction.toFixed(2),
    trace: decision.trace
  });
});

app.post("/api/v1/evaluate-deduction", requireBearerToken, async (req, res) => {
  const parsed = EvaluateDeductionRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten()
    });
  }

  const { profile, inputs, citation, jurisdiction } = parsed.data;
  let legalNode;
  if (process.env.USE_MOCK_LEGAL === "1") {
    legalNode = await getMockLegalNode(citation, jurisdiction, profile.taxYear);
  } else {
    if (!isDbConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    try {
      legalNode = await getLegalNodeByCitation(citation, jurisdiction, profile.taxYear);
    } catch (error) {
      console.error("Database query failed", error);
      return res.status(500).json({ error: "Database query failed" });
    }
  }

  if (!legalNode) {
    return res.status(404).json({ error: "Legal citation not found" });
  }

  const engine = new TaxRulesEngine(profile);
  const decision = engine.evaluateHomeOffice(inputs);

  return res.json({
    eligible: decision.eligible,
    deduction: decision.deduction.toFixed(2),
    trace: decision.trace,
    legal: legalNode
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  console.error("Unhandled error", err);

  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({ error: "An internal processing error occurred." });
  }

  return res.status(500).json({
    error: err.message,
    stack: err.stack
  });
});

export default app;

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`Tax MVP backend listening on ${port}`);
  });
}
