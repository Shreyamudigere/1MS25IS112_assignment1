import React from 'react';
import { ShieldCheck, Zap, Activity, Info } from 'lucide-react';
import { TokenMetrics } from '../types/paper';

interface TokenBudgetGaugeProps {
  metrics?: TokenMetrics;
}

export const TokenBudgetGauge: React.FC<TokenBudgetGaugeProps> = ({ metrics }) => {
  const totalTokens = metrics?.totalTokens || 0;
  const promptTokens = metrics?.promptTokens || 0;
  const candidateTokens = metrics?.candidatesTokens || 0;
  const budget = metrics?.tokenBudget || 25000;
  const percentUsed = Number(((totalTokens / budget) * 100).toFixed(1));
  const remainingBudget = Math.max(budget - totalTokens, 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Operational Token Constraint Monitor
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-emerald-400 font-mono">
            {totalTokens.toLocaleString()} / {budget.toLocaleString()} tokens
          </span>
          <span className="text-xs text-slate-400">({percentUsed}%)</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            percentUsed < 40
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              : percentUsed < 80
              ? 'bg-gradient-to-r from-amber-500 to-orange-400'
              : 'bg-gradient-to-r from-rose-500 to-red-400'
          }`}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>

      {/* Breakdown chips */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Context / Prompt Tokens: <strong className="text-slate-300 font-mono">{promptTokens.toLocaleString()}</strong>
          </span>
          <span>•</span>
          <span>
            Generation Tokens: <strong className="text-slate-300 font-mono">{candidateTokens.toLocaleString()}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400">
          <Zap className="h-3 w-3" />
          <span>Strict &lt; 25k constraint enforced: {remainingBudget.toLocaleString()} tokens remaining</span>
        </div>
      </div>
    </div>
  );
};
