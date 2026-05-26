import { CheckCircle2, ChevronRight, Calculator, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import HomeOfficeForm from './HomeOfficeForm';
import {
  TaxWizardPayloadSchema,
  type FilingStatus,
  type TaxModule,
  type TaxWizardPayload,
} from '@taxapp/shared';

const filingStatusOptions: Array<{ value: FilingStatus; label: string; description: string }> = [
  { value: 'single', label: 'Single', description: 'One filer with the baseline standard deduction path' },
  { value: 'hoh', label: 'Head of Household', description: 'Household-supporting filing profile' },
  { value: 'mfj', label: 'Married Filing Jointly', description: 'Joint household return routing' },
  { value: 'mfs', label: 'Married Filing Separately', description: 'Separated filing track' },
  { value: 'qss', label: 'Qualifying Surviving Spouse', description: 'Special filing category' },
];

const moduleOptions: Array<{ value: TaxModule; label: string; description: string }> = [
  { value: 'w2', label: 'W-2 Income', description: 'Box 1 wages and payroll routing' },
  { value: 'homeOffice', label: 'Home Office', description: 'Simplified or actual expense deduction flow' },
  { value: 'investments', label: 'Investments', description: 'Future capital gains / dividends module' },
];

function toggleModule(current: TaxModule[], module: TaxModule) {
  return current.includes(module) ? current.filter((value) => value !== module) : [...current, module];
}

export default function TaxWizard() {
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [enabledModules, setEnabledModules] = useState<TaxModule[]>(['w2', 'homeOffice']);
  const [box1Wages, setBox1Wages] = useState('78000');

  const wizardPayload = useMemo<TaxWizardPayload>(() => {
    const payload: TaxWizardPayload = {
      profile: {
        filingStatus,
        taxYear: 2025,
        enabledModules,
      },
    };

    if (enabledModules.includes('w2')) {
      payload.w2Data = { box1Wages: Number(box1Wages) || 0 };
    }

    return payload;
  }, [box1Wages, enabledModules, filingStatus]);

  const wizardValidation = useMemo(() => TaxWizardPayloadSchema.safeParse(wizardPayload), [wizardPayload]);
  const selectedCount = enabledModules.length;
  const projectedIncome = enabledModules.includes('w2') ? Number(box1Wages) || 0 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/30 backdrop-blur">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Conversational triage</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Tax Wizard</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            Shared schema enabled
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <ChevronRight className="h-4 w-4 text-cyan-300" />
              Step 1: Filing status and modules
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filingStatusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilingStatus(option.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    filingStatus === option.value
                      ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="mt-1 text-sm text-slate-400">{option.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {moduleOptions.map((option) => {
                const active = enabledModules.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEnabledModules((current) => toggleModule(current, option.value))}
                    className={`rounded-2xl border p-4 text-left transition ${
                      active
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{option.label}</div>
                      <div className={`text-xs font-semibold ${active ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {active ? 'Selected' : 'Optional'}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-slate-400">{option.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {enabledModules.includes('w2') && (
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                <Calculator className="h-4 w-4 text-cyan-300" />
                Step 2a: W-2 income input
              </div>

              <label className="space-y-2 text-sm text-slate-300">
                <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Box 1 wages
                </span>
                <input
                  value={box1Wages}
                  onChange={(event) => setBox1Wages(event.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                />
              </label>
            </div>
          )}

          {enabledModules.includes('homeOffice') && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Step 2b: Home office deduction module
              </div>
              <HomeOfficeForm />
            </div>
          )}

          {enabledModules.includes('investments') && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="font-medium text-white">Investments module</div>
              <p className="mt-2 leading-6 text-slate-400">
                This slot is reserved for future capital gains and dividends routing. The wizard keeps it cloaked until the
                module is implemented.
              </p>
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-950/20 backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Projection Ledger</h3>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step 3: Global payload + preview</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {selectedCount} module{selectedCount === 1 ? '' : 's'} active
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Payload snapshot</div>
            <pre className="mt-3 overflow-auto text-xs leading-6 text-slate-200">
{JSON.stringify(wizardPayload, null, 2)}
            </pre>
          </div>

          <div className={`rounded-2xl border p-4 ${wizardValidation.success ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-rose-400/30 bg-rose-400/10'}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <CheckCircle2 className={`h-4 w-4 ${wizardValidation.success ? 'text-emerald-300' : 'text-rose-300'}`} />
              {wizardValidation.success ? 'Wizard payload validates' : 'Wizard payload needs attention'}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {wizardValidation.success
                ? 'The selected filing status, tax year, and enabled modules match the shared onboarding contract.'
                : wizardValidation.error.issues[0]?.message ?? 'One or more fields are invalid.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">AGI ingest gate</div>
              <div className="mt-2 text-2xl font-semibold text-white">2025</div>
              <div className="mt-1 text-sm text-slate-400">Tax year locked to the 2025 form surface</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Taxable income preview</div>
              <div className="mt-2 text-2xl font-semibold text-white">${Math.max(projectedIncome, 0).toLocaleString()}</div>
              <div className="mt-1 text-sm text-slate-400">
                Simplified preview from W-2 wages before deductions are applied
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}