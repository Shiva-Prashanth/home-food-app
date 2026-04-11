import { Flame, Clock, CheckCircle } from 'lucide-react';

export default function StatusBanner({ activeOrdersCount, nextDeliveryMinutes }) {
  let status = 'Free';
  let colorClass = 'bg-green-50 border-green-200 text-green-800';
  let iconBg = 'bg-green-100 text-green-600';
  let Icon = CheckCircle;

  if (activeOrdersCount > 10) {
    status = 'Busy';
    colorClass = 'bg-red-50 border-red-200 text-red-800';
    iconBg = 'bg-red-100 text-red-600';
    Icon = Flame;
  } else if (activeOrdersCount >= 5) {
    status = 'Moderate';
    colorClass = 'bg-orange-50 border-orange-200 text-orange-800';
    iconBg = 'bg-orange-100 text-orange-600';
    Icon = Clock;
  }
  
  return (
    <div className={`mb-8 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border shadow-sm transition-all ${colorClass}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl shadow-inner ${iconBg}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-bold text-lg tracking-tight">
            {status === 'Busy' ? '🔥 Kitchen Busy' : `Kitchen ${status}`}
          </h2>
          <p className="text-sm font-medium opacity-90">
            • {activeOrdersCount} Active Orders • Next delivery in {nextDeliveryMinutes} mins
          </p>
        </div>
      </div>
      <div className="hidden sm:block">
        <div className="px-5 py-2.5 bg-white/60 backdrop-blur-sm rounded-xl font-bold shadow-sm border border-white/50">
          Sync Live 🟢
        </div>
      </div>
    </div>
  );
}
