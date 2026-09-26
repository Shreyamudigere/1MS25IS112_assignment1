import React, { useState } from 'react';
import { Search, Link as LinkIcon, Sparkles, FileText, ChevronDown, ChevronUp, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { CURATED_PAPERS } from '../data/curatedPapers';
import { CuratedPaper } from '../types/paper';

interface PaperInputProps {
  onAnalyze: (payload: { url?: string; query?: string; pastedText?: string }) => void;
  onSelectCurated: (paper: CuratedPaper) => void;
  isLoading: boolean;
  selectedCuratedId?: string;
}

export const PaperInput: React.FC<PaperInputProps> = ({
  onAnalyze,
  onSelectCurated,
  isLoading,
  selectedCuratedId,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [showPastedText, setShowPastedText] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const isArxiv = /(?:arxiv\.org|arxiv:|[0-9]{4}\.[0-9]{4,5})/i.test(urlInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() && !pastedText.trim()) return;

    // Check if input looks like a URL or a title query
    const isUrl = urlInput.trim().startsWith('http') || isArxiv;
    onAnalyze({
      url: isUrl ? urlInput.trim() : undefined,
      query: !isUrl && urlInput.trim() ? urlInput.trim() : undefined,
      pastedText: pastedText.trim() || undefined,
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-6">
      {/* Title & Instructions */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-bold">
              1
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
              Input Academic Paper or URL
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Token-efficient ingestion (&lt; 25,000 tokens)
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Provide an arXiv link, conference/PDF URL, paper title, or select from curated seminal papers below.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            {urlInput.startsWith('http') || isArxiv ? (
              <LinkIcon className="h-4 w-4 text-cyan-400" />
            ) : (
              <Search className="h-4 w-4 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="e.g. https://arxiv.org/abs/2312.00752 or 'FlashAttention' or paper title"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3.5 pl-10 pr-28 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:pr-36"
            disabled={isLoading}
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {isArxiv && (
              <span className="hidden rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 sm:inline">
                arXiv API
              </span>
            )}
            <button
              type="submit"
              disabled={isLoading || (!urlInput.trim() && !pastedText.trim())}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Manual Text Excerpt Option */}
        <div>
          <button
            type="button"
            onClick={() => setShowPastedText(!showPastedText)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {showPastedText ? 'Hide manual abstract / excerpt input' : '+ Paste custom abstract or excerpt (optional)'}
            </span>
            {showPastedText ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showPastedText && (
            <div className="mt-2">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the abstract, methodology section, or preprint notes here..."
                rows={4}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </form>

      {/* Curated Seminal Papers Gallery */}
      <div className="mt-5 border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-400" />
            Seminal Benchmark Papers (Instant Load)
          </span>
          <span className="text-[11px] text-slate-500">Click to inspect</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {CURATED_PAPERS.map((paper) => {
            const isSelected = selectedCuratedId === paper.id;
            return (
              <button
                key={paper.id}
                onClick={() => {
                  setUrlInput(paper.url);
                  onSelectCurated(paper);
                }}
                disabled={isLoading}
                className={`group flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? 'border-indigo-500/80 bg-indigo-950/40 shadow-md shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400">
                    {paper.tag}
                  </span>
                  <span className="text-[10px] text-slate-400">{paper.year}</span>
                </div>
                <h4 className="mt-1.5 line-clamp-1 text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition">
                  {paper.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-400 leading-snug">
                  {paper.abstractSnippet}
                </p>
                {isSelected && (
                  <span className="mt-2 flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Loaded Analysis
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
