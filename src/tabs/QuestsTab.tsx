import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useMoney } from '../lib/useMoney';
import Modal from '../components/Modal';
import QuestPlan from '../components/QuestPlan';
import { Button } from '../components/ui';
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
                  className="accent-accent-400"
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
        {detail && <QuestPlan quest={detail} />}
      </Modal>
    </div>
  );
}
