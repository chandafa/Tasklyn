'use client';

import { CatatanCepatCard } from './_components/catatan-cepat-card';
import { JadwalMingguIniCard } from './_components/jadwal-minggu-ini-card';
import { TaskListCard } from './_components/task-list-card';

export default function ReportsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <JadwalMingguIniCard />
        <CatatanCepatCard />
      </div>
      <div className="lg:col-span-2">
        <TaskListCard />
      </div>
    </div>
  );
}
