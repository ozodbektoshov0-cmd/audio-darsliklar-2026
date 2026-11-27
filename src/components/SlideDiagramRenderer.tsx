import { ArrowRight, GitBranch, Layers } from "lucide-react";

export interface SlideDiagramData {
  kind: "steps" | "cycle" | "comparison" | "concept" | "timeline" | string;
  caption: string;
  items: Array<{ label: string; detail: string }>;
}

const ACCENTS = [
  "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
  "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300",
];

export default function SlideDiagramRenderer({
  diagram,
  heroImage,
  slideTitle,
}: {
  diagram?: SlideDiagramData;
  heroImage?: string;
  slideTitle: string;
}) {
  return (
    <div className="space-y-4">
      {heroImage && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 sm:h-52">
          <img src={heroImage} alt={slideTitle} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <Layers size={13} />
              <span>{diagram?.caption || slideTitle}</span>
            </span>
          </div>
        </div>
      )}

      {diagram && Array.isArray(diagram.items) && diagram.items.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <GitBranch size={13} className="text-brand-primary" />
            <span>{diagram.caption}</span>
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {diagram.items.slice(0, 4).map((item, idx) => (
              <div key={idx} className={`p-3 rounded-xl border relative ${ACCENTS[idx % ACCENTS.length]}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tabular-nums opacity-75">0{idx + 1}</span>
                  {idx < Math.min(diagram.items.length, 4) - 1 && (
                    <ArrowRight size={12} className="opacity-50 hidden lg:inline" />
                  )}
                </div>
                <p className="font-black text-xs text-slate-900 dark:text-white leading-snug mb-1">{item.label}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
