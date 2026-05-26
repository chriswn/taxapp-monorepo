import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:3001', headers: { 'Content-Type': 'application/json' } });

async function run() {
  try {
    const simplified = {
      citation: '26-USC-280A-simplified',
      jurisdiction: 'FEDERAL',
      profile: { userId: 'local-dev', employmentType: '1099', state: 'MN', taxYear: 2026 },
      inputs: { method: 'simplified', homeOfficeSquareFootage: 120, principalPlaceOfBusiness: true },
    };

    console.log('--- Simplified payload ---');
    console.log(JSON.stringify(simplified, null, 2));
    const res1 = await client.post('/api/v1/evaluate-deduction', simplified);
    console.log('--- Simplified response ---');
    console.log('status:', res1.status);
    console.log(JSON.stringify(res1.data, null, 2));
  } catch (err) {
    console.error('Simplified request failed:', err.response ? err.response.status : err.message);
    if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
  }

  try {
    const actual = {
      citation: '26-USC-280A-actual',
      jurisdiction: 'FEDERAL',
      profile: { userId: 'local-dev', employmentType: '1099', state: 'MN', taxYear: 2026 },
      inputs: {
        method: 'actual',
        homeOfficeSquareFootage: 120,
        totalHomeSquareFootage: 1200,
        principalPlaceOfBusiness: true,
        rentOrMortgage: 1200,
        utilities: 600,
        internet: 300,
      },
    };

    console.log('--- Actual payload ---');
    console.log(JSON.stringify(actual, null, 2));
    const res2 = await client.post('/api/v1/evaluate-deduction', actual);
    console.log('--- Actual response ---');
    console.log('status:', res2.status);
    console.log(JSON.stringify(res2.data, null, 2));
  } catch (err) {
    console.error('Actual request failed:', err.response ? err.response.status : err.message);
    if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
  }

    // Also test the original frontend shape (deductionMethod + nested actualExpenseCosts)
    try {
      const origSimplified = {
        citation: '26-USC-280A-simplified',
        jurisdiction: 'FEDERAL',
        profile: { userId: 'local-dev', employmentType: '1099', state: 'MN', taxYear: 2026 },
        inputs: {
          deductionMethod: 'simplified',
          homeOfficeSquareFootage: 120,
          principalPlaceOfBusiness: true,
        },
      };

      console.log('--- Original Simplified payload ---');
      console.log(JSON.stringify(origSimplified, null, 2));
      const res3 = await client.post('/api/v1/evaluate-deduction', origSimplified);
      console.log('--- Original Simplified response ---');
      console.log('status:', res3.status);
      console.log(JSON.stringify(res3.data, null, 2));
    } catch (err) {
      console.error('Original simplified request failed:', err.response ? err.response.status : err.message);
      if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
    }

    try {
      const origActual = {
        citation: '26-USC-280A-actual',
        jurisdiction: 'FEDERAL',
        profile: { userId: 'local-dev', employmentType: '1099', state: 'MN', taxYear: 2026 },
        inputs: {
          deductionMethod: 'actual',
          homeOfficeSquareFootage: 120,
          totalHomeSquareFootage: 1200,
          principalPlaceOfBusiness: true,
          actualExpenseCosts: {
            mortgageInterest: 6000,
            rent: 1200,
            utilities: 600,
            internet: 300,
            repairs: 200,
            insurance: 400,
            depreciation: 1300,
          },
        },
      };

      console.log('--- Original Actual payload ---');
      console.log(JSON.stringify(origActual, null, 2));
      const res4 = await client.post('/api/v1/evaluate-deduction', origActual);
      console.log('--- Original Actual response ---');
      console.log('status:', res4.status);
      console.log(JSON.stringify(res4.data, null, 2));
    } catch (err) {
      console.error('Original actual request failed:', err.response ? err.response.status : err.message);
      if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
    }

      // Also try the internal non-citation endpoint
      try {
        console.log('--- POST to /v1/deductions/home-office (simplified) ---');
        const res5 = await client.post('/v1/deductions/home-office', { profile: simplified.profile, inputs: simplified.inputs });
        console.log('status:', res5.status);
        console.log(JSON.stringify(res5.data, null, 2));
      } catch (err) {
        console.error('/v1 simplified failed:', err.response ? err.response.status : err.message);
        if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
      }

      try {
        console.log('--- POST to /v1/deductions/home-office (actual) ---');
        const res6 = await client.post('/v1/deductions/home-office', { profile: actual.profile, inputs: actual.inputs });
        console.log('status:', res6.status);
        console.log(JSON.stringify(res6.data, null, 2));
      } catch (err) {
        console.error('/v1 actual failed:', err.response ? err.response.status : err.message);
        if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
      }
}

run();
