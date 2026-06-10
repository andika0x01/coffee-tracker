"use client";

import { Terminal, Robot, Warning } from "@phosphor-icons/react";
import { formatDateTime } from "@/lib/utils";

interface AiAnalysisProps {
  analysis?: string;
  updatedAt?: string;
}

export default function AiAnalysis({ analysis, updatedAt }: AiAnalysisProps) {
  if (!analysis) return null;

  return (
    <div className="glass-panel p-6 md:p-8 rounded-sm border-accent/20 bg-accent/5 relative overflow-hidden group">
      {/* Decorative scanner line animation */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-accent/20 animate-[scan_3s_linear_infinite]" />

      <div className="flex items-start gap-4 mb-6">
        <div className="p-2 rounded bg-accent/10 border border-accent/30">
          <Robot size={20} className="text-accent animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-accent">
            <Terminal size={14} />
            Health_Analysis_Report
          </div>
          <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Module: Dr. AI Health Monitor // Status: Active</div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-accent/10" />
        <p className="text-sm md:text-base font-mono leading-relaxed text-white/90 italic">"{analysis}"</p>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span className="text-[8px] font-mono uppercase text-accent/60 tracking-tighter">Live_Telemetry</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2 text-[8px] font-mono uppercase text-white/20 tracking-tighter">
            <Warning size={10} />
            Health_Protocol_Priority: High
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[8px] font-mono text-white/10 uppercase">Ver: 1.0-HEALTH-MD</div>
          {updatedAt && <div className="text-[8px] font-mono text-white/30 uppercase tracking-tighter">Last Updated: {formatDateTime(updatedAt)}</div>}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(200px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
