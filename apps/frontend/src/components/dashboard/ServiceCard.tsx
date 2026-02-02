import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export function ServiceCard({ icon: Icon, title, description, onClick }: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-lg border-2 border-green-200 hover:border-green-400 p-6 text-left transition-all hover:shadow-lg hover:scale-105 active:scale-95"
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
        <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
          ✅ Ready
        </span>
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-4 text-green-600 font-semibold text-sm flex items-center gap-1">
        Click to start →
      </div>
    </button>
  );
}

interface DisabledServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  comingSoon: string; // e.g., "Q2 2026"
}

export function DisabledServiceCard({ icon: Icon, title, description, comingSoon }: DisabledServiceCardProps) {
  return (
    <div className="group bg-white rounded-lg border-2 border-gray-200 p-6 text-left opacity-60 cursor-not-allowed">
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-8 h-8 text-gray-400" />
        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">
          ⏳ {comingSoon}
        </span>
      </div>
      <h3 className="font-bold text-gray-600 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="mt-4 text-gray-400 font-semibold text-sm">
        Coming Soon
      </div>
      {/* Hover Tooltip */}
      <div className="invisible group-hover:visible absolute bg-gray-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap mt-2 z-10">
        Available in {comingSoon}
      </div>
    </div>
  );
}
