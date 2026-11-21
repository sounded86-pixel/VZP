import React from 'react';
import { HelpType, HelpCategory, CATEGORY_LABELS } from '../types';
import { Car, Pill, Wrench, Layers } from 'lucide-react';

interface CategoryFilterProps {
  activeTab: HelpType;
  onChangeTab: (tab: HelpType) => void;
  selectedCategory: HelpCategory | 'all';
  onSelectCategory: (category: HelpCategory | 'all') => void;
  requestCount: number;
  offerCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeTab,
  onChangeTab,
  selectedCategory,
  onSelectCategory,
  requestCount,
  offerCount
}) => {
  return (
    <div className="bg-white border-b border-slate-200">
      {/* 2 MAIN TABS: "Нужна помощь" & "Могу помочь" */}
      <div className="max-w-2xl mx-auto px-3 pt-2">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {/* TAB 1: НУЖНА ПОМОЩЬ */}
          <button
            onClick={() => onChangeTab('request')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-black text-sm transition-all ${
              activeTab === 'request'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🆘 Нужна помощь</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'request'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {requestCount}
            </span>
          </button>

          {/* TAB 2: МОГУ ПОМОЧЬ */}
          <button
            onClick={() => onChangeTab('offer')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-black text-sm transition-all ${
              activeTab === 'offer'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>🤝 Могу помочь</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'offer'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {offerCount}
            </span>
          </button>
        </div>
      </div>

      {/* CATEGORY TAGS SCROLLER */}
      <div className="max-w-2xl mx-auto px-3 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {/* ALL TAG */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Все категории</span>
        </button>

        {/* 1. TRANSPORT */}
        <button
          onClick={() => onSelectCategory('transport')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
            selectedCategory === 'transport'
              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>🚗</span>
          <span>Транспорт / Поездки</span>
        </button>

        {/* 2. MEDICINE / GROCERIES */}
        <button
          onClick={() => onSelectCategory('medicine')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
            selectedCategory === 'medicine'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>💊</span>
          <span>Закупки / Лекарства</span>
        </button>

        {/* 3. HOUSEHOLD */}
        <button
          onClick={() => onSelectCategory('household')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
            selectedCategory === 'household'
              ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}
        >
          <span>🛠️</span>
          <span>Быт / Срочно</span>
        </button>
      </div>
    </div>
  );
};
