import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useMoney } from '../lib/useMoney';
import Modal from '../components/Modal';
import { Button, TipCallout } from '../components/ui';
import type { SideQuest } from '../types';

export default function QuestsTab() {
  const quests = useStore((s) => s.sideQuests);
  const toggleBudget = useStore((s) => s.toggleQuestBudget);
  const money = useMoney();
  const [detail, setDetail] = useState<SideQuest | null>(null);

  const included = quests.filter((q) => q.includedInBudget);
  const total = included.reduce((a, q) => a + q.totalCost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Side quests</h2>
        <p className="text-sm text-slate-400 mt-1">
          {included.length} de {quests.length} en el presupuesto · {money(total)} en total.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {quests.map((q) => (
          <div
            key={q.id}
            className={`rounded-2xl border p-5 transition ${
              q.includedInBudget ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/50 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-white leading-tight">{q.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {q.dateLabel ? `${q.dateLabel} · ` : ''}
                  {q.days} {q.days === 1 ? 'día' : 'días'}
                </p>
              </div>
              <span className="shrink-0 text-lg font-extrabold text-emerald-300 tabular-nums">
                {money(q.totalCost)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {Object.entries(q.details).map(([k, v]) => (
                <span
                  key={k}
                  className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
                >
                  {k}: {money(v)}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Button
                onClick={() => setDetail(q)}>
                <i className="fa-solid fa-list-check mr-1.5" />
                Ver plan ({q.itinerary.length})
              </Button>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={q.includedInBudget}
                  onChange={() => toggleBudget(q.id)}
                  className="accent-indigo-500"
                />
                En el presupuesto
              </label>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title ?? ''}
        subtitle={detail ? `${detail.days} días · ${money(detail.totalCost)}` : undefined}
      >
        {detail && (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Plan
              </h4>
              <ol className="space-y-3">
                {detail.itinerary.map((it, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 text-[11px] font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-900/50 rounded-lg px-2 py-1 h-fit tabular-nums">
                      {it.day}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">{it.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{it.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {detail.hacks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Hacks
                </h4>
                <ul className="space-y-2">
                  {detail.hacks.map((h, i) => (
                    <li key={i}>
                      <TipCallout>{h}</TipCallout>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
