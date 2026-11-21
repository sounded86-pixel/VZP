import React, { useState } from 'react';
import { 
  HandHeart, Heart, ClipboardList, Sparkles, Plus, Search, MapPin, Gift, CheckCircle
} from 'lucide-react';
import { 
  HelpRequest, UserProfile, Master, PortfolioItem, ServiceOrder, MasterReview 
} from '../types';
import LentaScreen from './LentaScreen';
import SkillsCatalogScreen from './SkillsCatalogScreen';
import { GoodDeedsScreen } from './GoodDeedsScreen';

export type HelpNearbyTab = 'requests' | 'offers' | 'completed';

interface HelpNearbyScreenProps {
  initialTab?: 'requests' | 'services' | 'offers' | 'completed';
  requests: HelpRequest[];
  userVillage: string;
  onRespond: (req: HelpRequest) => void;
  onSubmitReport: (targetId: string, type: 'post' | 'user', reason: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  currentUser: UserProfile;
  users: UserProfile[];
  masters: Master[];
  portfolioItems: PortfolioItem[];
  serviceOrders: ServiceOrder[];
  masterReviews: MasterReview[];
  onStartDirectChat: (helper: UserProfile) => void;
  isOffline: boolean;
  onCreateRequest: (initialCategory?: string) => void;
}

export function HelpNearbyScreen({
  initialTab = 'requests',
  requests,
  userVillage,
  onRespond,
  onSubmitReport,
  searchQuery,
  onSearchQueryChange,
  currentUser,
  users,
  masters,
  portfolioItems,
  serviceOrders,
  masterReviews,
  onStartDirectChat,
  isOffline,
  onCreateRequest
}: HelpNearbyScreenProps) {
  // Map 'services' to 'offers' for backwards compatibility
  const resolvedInitialTab: HelpNearbyTab = initialTab === 'services' ? 'offers' : (initialTab as HelpNearbyTab);
  const [activeTab, setActiveTab] = useState<HelpNearbyTab>(resolvedInitialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 select-none animate-fadeIn" id="help_nearby_screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl mb-6 shadow-lg border border-teal-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
          <HandHeart size={180} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-yellow-300 animate-pulse" />
              <span>Бесплатная взаимовыручка соседей</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
              <span>🤝 Помощь рядом</span>
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 font-medium mt-1 leading-relaxed max-w-xl">
              Просите о помощи или предлагайте свои добрые руки соседям. Всё бескорыстно и по-соседски.
            </p>
          </div>

          {/* Action buttons: Попросить помощи and Предложить помощь */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
            <button
              onClick={() => onCreateRequest('request')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Попросить помощи</span>
            </button>

            <button
              onClick={() => onCreateRequest('offer')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer border border-teal-400/40"
            >
              <Gift size={16} />
              <span>Предложить помощь</span>
            </button>
          </div>
        </div>

        {/* 3 Main Tabs according to ТЗ 3.2 */}
        <div className="grid grid-cols-3 gap-2 mt-6 p-1.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-white text-teal-900 shadow-md scale-[1.02]'
                : 'text-teal-100 hover:bg-white/10'
            }`}
          >
            <ClipboardList size={16} className={activeTab === 'requests' ? 'text-teal-700' : 'text-teal-300'} />
            <span className="truncate">Просьбы о помощи</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-white text-teal-900 shadow-md scale-[1.02]'
                : 'text-teal-100 hover:bg-white/10'
            }`}
          >
            <HandHeart size={16} className={activeTab === 'offers' ? 'text-teal-700' : 'text-teal-300'} />
            <span className="truncate">Предложения помощи</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-900 shadow-md scale-[1.02]'
                : 'text-teal-100 hover:bg-white/10'
            }`}
          >
            <Heart size={16} className={activeTab === 'completed' ? 'text-emerald-600 fill-emerald-600' : 'text-emerald-300'} />
            <span className="truncate">Добрые дела</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Лента просьб о помощи */}
      {activeTab === 'requests' && (
        <LentaScreen
          requests={requests.filter(r => r.active !== false && !r.title.toLowerCase().startsWith('предлагаю') && !r.description.toLowerCase().startsWith('готов помочь'))}
          userVillage={userVillage}
          onRespond={onRespond}
          onSubmitReport={onSubmitReport}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          currentUser={currentUser}
        />
      )}

      {/* Tab 2: Лента предложений помощи */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Жители и мастера вашего села, готовые прийти на выручку:</span>
            <button
              onClick={() => onCreateRequest('offer')}
              className="text-emerald-600 font-black hover:underline"
            >
              + Добавить своё предложение
            </button>
          </div>
          <SkillsCatalogScreen
            currentUserId={currentUser.id}
            currentUser={currentUser}
            users={users}
            masters={masters}
            portfolioItems={portfolioItems}
            serviceOrders={serviceOrders}
            masterReviews={masterReviews}
            onStartDirectChat={onStartDirectChat}
            isOffline={isOffline}
          />
        </div>
      )}

      {/* Tab 3: Лента выполненных добрых дел */}
      {activeTab === 'completed' && (
        <GoodDeedsScreen
          requests={requests}
          currentUser={currentUser}
          onRespond={onRespond}
          onCreateRequest={() => onCreateRequest('request')}
        />
      )}
    </div>
  );
}
