import { TrendingUp, TrendingDown } from 'lucide-react';

export default function SummaryCard({ title, subtitle, value, icon: Icon, iconColor, iconBg, trend }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
      <div className="flex items-start justify-between mb-6">
        <div className={`${iconBg} p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-sm ${
            trend.direction === 'up'
              ? 'bg-green-50 text-green-700 border border-green-100'
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.text || `${Math.abs(trend.value)}%`}</span>
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          {subtitle && <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">{subtitle}</span>}
        </div>
        <p className="text-4xl font-black text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
