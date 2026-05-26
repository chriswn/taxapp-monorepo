import { AlertCircle, ArrowRight, CheckCircle2, ReceiptText } from 'lucide-react';
import type { FormEvent, InputHTMLAttributes } from 'react';
import { useMemo, useState } from 'react';
import type { DeductionMethod, EmploymentType } from '@taxapp/shared';
import type { EvaluateDeductionRequestInput } from '@taxapp/shared';
import { apiBaseUrl, evaluateDeduction } from '../lib/api';

type ActualCosts = {
  mortgageInterest: string;
  rent: string;
  utilities: string;
  internet: string;
  repairs: string;
  insurance: string;
  depreciation: string;
};

type ApiResult = {
  eligible: boolean;
  deduction: string;
  trace?: Array<{ section: string; eligible: boolean; calculatedValue: string; reasoning: string }>;
  legal?: { citation?: string; title?: string; textContent?: string };
};

function moneyToNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function HomeOfficeForm() {
  const [method, setMethod] = useState<DeductionMethod>('simplified');
  const [taxYear, setTaxYear] = useState(String(new Date().getFullYear()));
  const [stateCode, setStateCode] = useState('MN');
  const [userId, setUserId] = useState('local-dev');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('1099');
  const [homeOfficeSquareFootage, setHomeOfficeSquareFootage] = useState('120');
  const [principalPlaceOfBusiness, setPrincipalPlaceOfBusiness] = useState(true);
  const [totalHomeSquareFootage, setTotalHomeSquareFootage] = useState('1200');
  const [actualCosts, setActualCosts] = useState<ActualCosts>({
    mortgageInterest: '6000',
    rent: '1200',
    utilities: '600',
    internet: '300',
    repairs: '200',
    insurance: '400',
    depreciation: '1300',
  });
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const payload = useMemo<EvaluateDeductionRequestInput>(() => {
    const profile = {
      userId,
      employmentType,
      state: stateCode.toUpperCase(),
      taxYear: Number(taxYear),
    };

    if (method === 'actual') {
      return {
        citation: '26-USC-280A-actual',
        jurisdiction: 'FEDERAL',
        profile,
        inputs: {
          deductionMethod: 'actual',
          homeOfficeSquareFootage: Number(homeOfficeSquareFootage),
          totalHomeSquareFootage: Number(totalHomeSquareFootage),
          principalPlaceOfBusiness,
          actualExpenseCosts: {
            mortgageInterest: moneyToNumber(actualCosts.mortgageInterest),
            rent: moneyToNumber(actualCosts.rent),
            utilities: moneyToNumber(actualCosts.utilities),
            internet: moneyToNumber(actualCosts.internet),
            repairs: moneyToNumber(actualCosts.repairs),
            insurance: moneyToNumber(actualCosts.insurance),
            depreciation: moneyToNumber(actualCosts.depreciation),
          },
        },
      };
    }

    return {
      citation: '26-USC-280A-simplified',
      jurisdiction: 'FEDERAL',
      profile,
      inputs: {
        deductionMethod: 'simplified',
        homeOfficeSquareFootage: Number(homeOfficeSquareFootage),
        principalPlaceOfBusiness,
      },
    };
  }, [
    actualCosts,
    employmentType,
    homeOfficeSquareFootage,
    method,
    principalPlaceOfBusiness,
    stateCode,
    taxYear,
    totalHomeSquareFootage,
    userId,
  ]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await evaluateDeduction(payload);
      setResult(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Request failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        onSubmit={submit}
        className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/30 backdrop-blur"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Evaluation form</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Home office deduction</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <ReceiptText className="h-3.5 w-3.5 text-cyan-300" />
            API ready
          </span>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMethod('simplified')}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              method === 'simplified'
                ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="font-medium">Simplified</div>
            <div className="text-sm text-slate-400">$5/sq ft up to the cap</div>
          </button>
          <button
            type="button"
            onClick={() => setMethod('actual')}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              method === 'actual'
                ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="font-medium">Actual expense</div>
            <div className="text-sm text-slate-400">Business-use ratio × eligible expenses</div>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="User ID" value={userId} onChange={setUserId} />
          <label className="space-y-2 text-sm text-slate-300">
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Employment type</span>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as '1099' | 'W2' | 'OTHER')}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0 transition focus:border-cyan-400/60"
            >
              <option value="1099">1099</option>
              <option value="W2">W2</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>
          <Field label="State" value={stateCode} onChange={setStateCode} maxLength={2} />
          <Field label="Tax year" value={taxYear} onChange={setTaxYear} inputMode="numeric" />
          <Field label="Home office square footage" value={homeOfficeSquareFootage} onChange={setHomeOfficeSquareFootage} inputMode="numeric" />

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 sm:col-span-1">
            <input
              type="checkbox"
              checked={principalPlaceOfBusiness}
              onChange={(e) => setPrincipalPlaceOfBusiness(e.target.checked)}
              className="h-4 w-4 rounded border-slate-500 bg-slate-900 text-cyan-400"
            />
            Principal place of business
          </label>
        </div>

        {method === 'actual' && (
          <div className="mt-5 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <h3 className="mb-4 text-lg font-semibold text-white">Actual expense inputs</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Total home square footage" value={totalHomeSquareFootage} onChange={setTotalHomeSquareFootage} inputMode="numeric" />
              <Field label="Mortgage interest" value={actualCosts.mortgageInterest} onChange={(value) => setActualCosts((prev) => ({ ...prev, mortgageInterest: value }))} inputMode="decimal" />
              <Field label="Rent" value={actualCosts.rent} onChange={(value) => setActualCosts((prev) => ({ ...prev, rent: value }))} inputMode="decimal" />
              <Field label="Utilities" value={actualCosts.utilities} onChange={(value) => setActualCosts((prev) => ({ ...prev, utilities: value }))} inputMode="decimal" />
              <Field label="Internet" value={actualCosts.internet} onChange={(value) => setActualCosts((prev) => ({ ...prev, internet: value }))} inputMode="decimal" />
              <Field label="Repairs" value={actualCosts.repairs} onChange={(value) => setActualCosts((prev) => ({ ...prev, repairs: value }))} inputMode="decimal" />
              <Field label="Insurance" value={actualCosts.insurance} onChange={(value) => setActualCosts((prev) => ({ ...prev, insurance: value }))} inputMode="decimal" />
              <Field label="Depreciation" value={actualCosts.depreciation} onChange={(value) => setActualCosts((prev) => ({ ...prev, depreciation: value }))} inputMode="decimal" />
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Calculating…' : 'Calculate'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
          <div className="text-xs text-slate-400">
            Posts to <span className="text-slate-200">{apiBaseUrl}</span>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </form>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Result</h3>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Backend response</span>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">{result.eligible ? 'Eligible' : 'Not eligible'}</span>
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">{result.deduction}</div>
            </div>

            {result.legal && (
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="text-sm font-medium text-white">{result.legal.title ?? result.legal.citation}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{result.legal.textContent}</p>
              </div>
            )}

            {result.trace?.length ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Trace</h4>
                {result.trace.map((step) => (
                  <div key={`${step.section}-${step.reasoning}`} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-medium text-white">{step.section}</div>
                      <div className={`text-xs font-semibold ${step.eligible ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {step.eligible ? 'Pass' : 'Fail'}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{step.reasoning}</div>
                    <div className="mt-2 text-xs text-slate-400">Calculated value: {step.calculatedValue}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-400">
            Submit the form to see the API response, deduction amount, and audit trace here.
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}) {
  return (
    <label className="space-y-2 text-sm text-slate-300">
      <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
      />
    </label>
  );
}
