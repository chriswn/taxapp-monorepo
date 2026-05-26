import { Calculator, ShieldCheck, Sparkles } from 'lucide-react';
import TaxWizard from './components/TaxWizard';

function App() {
  return (
    <div className="min-h-screen text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Tax deduction workspace
              </span>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                A conversational tax engine that routes forms through one guarded flow.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Start with filing status and module triage, then reveal only the forms you need and post through the shared schema contract.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Fast', 'Wizard-driven onboarding with instant reload'],
                  ['Safe', 'Shared Zod contract across the monorepo'],
                  ['Precise', 'Decimal-backed calculations from the backend'],
                ].map(([title, detail]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="mb-1 text-sm font-semibold text-white">{title}</div>
                    <div className="text-sm text-slate-300">{detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/20 bg-slate-950/50 p-4 text-sm text-slate-200">
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
                Frontend API contract
              </div>
              <div className="mt-3 space-y-2">
                <div><span className="text-slate-400">Backend:</span> http://localhost:3001</div>
                <div><span className="text-slate-400">Route:</span> /api/v1/evaluate-deduction</div>
                <div><span className="text-slate-400">Payload:</span> wizard triage + module inputs</div>
                <div><span className="text-slate-400">Token:</span> VITE_API_TOKEN</div>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
                <Calculator className="mb-2 h-4 w-4 text-cyan-300" />
                The wizard below routes users into only the relevant modules and preserves the backend trace.
              </div>
            </div>
          </div>
        </section>

        <section>
          <TaxWizard />
        </section>
      </main>
    </div>
  );
}

export default App;
