const { Pool } = require("pg");

function buildDbConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error("Set DATABASE_URL or DB_HOST/DB_USER/DB_NAME environment variables.");
  }

  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
  if (Number.isNaN(port)) {
    throw new Error("Invalid DB_PORT value");
  }

  return {
    host,
    port,
    user,
    password: process.env.DB_PASSWORD,
    database
  };
}

async function seedHomeOfficeRule() {
  const pool = new Pool(buildDbConfig());
  const insertNodeQuery = `
    INSERT INTO legal_nodes (citation, jurisdiction, tax_year, node_type, title, text_content)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (citation, jurisdiction, tax_year)
    DO UPDATE SET
      node_type = EXCLUDED.node_type,
      title = EXCLUDED.title,
      text_content = EXCLUDED.text_content
    RETURNING id;
  `;

  const rules = [
    {
      citation: "26-USC-280A-simplified",
      title: "Simplified Home Office",
      textContent:
        "Simplified Home Office Deduction: Allows a standard deduction of $5 per square foot " +
        "for the business use of a home, up to a maximum statutory limit of 300 square feet " +
        "($1,500 maximum total deduction). Must be the principal place of business for a 1099 worker."
    },
    {
      citation: "26-USC-280A-actual",
      title: "Actual Expense Home Office",
      textContent:
        "Actual Expense Home Office Deduction: Allows deduction of the business-use portion " +
        "of eligible annual home expenses, including mortgage interest, rent, utilities, internet, " +
        "repairs, insurance, and depreciation, multiplied by the verified home office business-use ratio."
    }
  ];

  try {
    for (const rule of rules) {
      const result = await pool.query(insertNodeQuery, [
        rule.citation,
        "FEDERAL",
        2026,
        "CLAUSE",
        rule.title,
        rule.textContent
      ]);
      console.log(`Successfully seeded legal node with ID: ${result.rows[0].id}`);
    }
  } finally {
    await pool.end();
  }
}

seedHomeOfficeRule().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Failed to seed core rules:", message || "(no error message)");
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
