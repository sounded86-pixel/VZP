import React, { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { requestPushPermission, dismissPushPrompt } from '../pwaService';

interface PushBannerProps {
  selectedVillage: string;
  onSubscribed: () => void;
}

export const PushBanner: React.FC<PushBannerProps> = ({ selectedVillage, onSubscribed }) => {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleEnable = async () => {
    setLoading(true);
    const success = await requestPushPermission(selectedVillage !== 'all' ? selectedVillage : undefined);
    setLoading(false);
    if (success) {
      onSubscribed();
      setDismissed(true);
    } else {
      // If user denied or error, close banner
      setDismissed(true);
      dismissPushPrompt();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    dismissPushPrompt();
  };

  const villageLabel = selectedVillage !== 'all' ? `в селе ${selectedVillage}` : 'в вашем селе';

  return (
    <div className="bg-emerald-900 text-white px-3 py-2.5 border-b border-emerald-950/20 shadow-xs">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-emerald-300 animate-bounce" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white leading-tight">
              Включить уведомления о новых просьбах {villageLabel}?
            </p>
            <p className="text-[11px] text-emerald-200 leading-tight mt-0.5 hidden xs:block">
              Узнавайте, если соседям срочно нужны лекарства или попутка.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-950 font-black text-xs px-3 py-1.5 rounded-md shadow-xs transition-colors shrink-0"
          >
            {loading ? 'Включение...' : 'Включить'}
          </button>
          <button
            onClick={handleDismiss}
            className="text-emerald-300 hover:text-white p-1 rounded-md transition-colors"
            title="Позже"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
