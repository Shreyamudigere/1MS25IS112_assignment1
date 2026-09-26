import React from 'react';
import { ExternalLink, FileText, User, Calendar, Tag, Share2, Check } from 'lucide-react';
import { PaperMetadata } from '../types/paper';

interface PaperMetaBannerProps {
  paper: PaperMetadata;
}

export const PaperMetaBanner: React.FC<PaperMetaBannerProps> = ({ paper }) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleShare = () => {
    if (paper.url) {
      navigator.clipboard.writeText(paper.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/30 p-5 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {paper.primaryDomain && (
              <span className="rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                {paper.primaryDomain}
              </span>
            )}
            {paper.year && (
              <span className="flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300">
                <Calendar className="h-3 w-3 text-slate-400" />
                {paper.year}
              </span>
            )}
            {paper.venueOrOrg && (
              <span className="text-[11px] text-slate-400 font-medium">
                • {paper.venueOrOrg}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {paper.title}
          </h2>

          {paper.summaryTagline && (
            <p className="text-sm font-medium text-slate-300">
              {paper.summaryTagline}
            </p>
          )}

          {paper.authors && paper.authors.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span>Authors: {paper.authors.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Paper Link Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
            >
              <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
              <span>Original Paper</span>
            </a>
          )}
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
            >
              <FileText className="h-3.5 w-3.5 text-rose-400" />
              <span>PDF</span>
            </a>
          )}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            title="Copy paper URL"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
