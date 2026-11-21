import React, { useState } from 'react';
import { HelpItem, CATEGORY_LABELS } from '../types';
import { Phone, MessageCircle, Share2, CheckCircle2, MapPin, Clock, User, Check } from 'lucide-react';
import { shareHelpItem } from '../pwaService';

interface ItemCardProps {
  item: HelpItem;
  onToggleStatus: (id: string, newStatus: 'active' | 'completed') => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onToggleStatus }) => {
  const [copied, setCopied] = useState(false);
  const cat = CATEGORY_LABELS[item.category];

  // Clean phone string for tel: and sms:
  const cleanPhone = item.phone.replace(/[^0-9+]/g, '');

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days === 1) return 'Вчера';
    return `${days} дн назад`;
  };

  const handleShare = async () => {
    const res = await shareHelpItem(item);
    if (res.method === 'clipboard' && res.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Build messenger URL (Telegram, WhatsApp, or direct SMS)
  const getMessengerUrl = () => {
    if (item.telegram) {
      const cleanTg = item.telegram.replace('@', '').trim();
      return `https://t.me/${cleanTg}`;
    }
    if (item.whatsapp) {
      const cleanWa = item.whatsapp.replace(/[^0-9]/g, '');
      return `https://wa.me/${cleanWa}?text=${encodeURIComponent('Здравствуйте! Я по объявлению из приложения Взаимопомощь.')}`;
    }
    // Default fallback: direct SMS
    return `sms:${cleanPhone}?body=${encodeURIComponent('Здравствуйте! Я по объявлению из приложения Взаимопомощь.')}`;
  };

  const isCompleted = item.status === 'completed';

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all p-3.5 sm:p-4 shadow-xs ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/70 opacity-75'
          : item.type === 'request'
          ? 'border-rose-100 hover:border-rose-300'
          : 'border-emerald-100 hover:border-emerald-300'
      }`}
    >
      {/* Header of Card */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {/* Category badge */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-md ${
              item.category === 'transport'
                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                : item.category === 'medicine'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.short}</span>
          </span>

          {/* Village pin */}
          <span className="inline-flex items-center gap-1 text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 max-w-[220px] truncate" title={`${item.settlement}${item.region ? `, ${item.region}` : ''}`}>
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{item.settlement}</span>
            {item.region && (
              <span className="text-[10px] text-slate-500 font-medium truncate hidden xs:inline">
                • {item.region.split(' ')[0]}
              </span>
            )}
          </span>
        </div>

        {/* Time */}
        <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" />
          <span>{formatTime(item.createdAt)}</span>
        </span>
      </div>

      {/* Description - Large legible high-contrast text */}
      <p
        className={`text-slate-900 text-sm sm:text-base font-semibold leading-relaxed mb-3 ${
          isCompleted ? 'line-through text-slate-500' : ''
        }`}
      >
        {item.description}
      </p>

      {/* Author and Contacts info */}
      <div className="flex items-center justify-between text-xs text-slate-600 mb-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-600" />
          <span>{item.author}</span>
        </div>
        <div className="font-mono text-slate-700 font-bold">
          {item.phone}
        </div>
      </div>

      {/* DIRECT ACTION BUTTONS (CALL / MESSAGE / SHARE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* 1. ПОЗВОНИТЬ (Direct Native Call) */}
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs sm:text-sm py-2.5 px-3 rounded-lg shadow-xs transition-colors"
        >
          <Phone className="w-4 h-4 fill-white" />
          <span>Позвонить</span>
        </a>

        {/* 2. НАПИСАТЬ (Telegram / WhatsApp / SMS) */}
        <a
          href={getMessengerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs sm:text-sm py-2.5 px-3 rounded-lg shadow-xs transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{item.telegram ? 'Telegram' : 'Написать'}</span>
        </a>

        {/* 3. ПОДЕЛИТЬСЯ (Share to village chat / Viber / WhatsApp) */}
        <button
          onClick={handleShare}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs py-2 px-3 rounded-lg border border-slate-200 transition-colors"
          title="Поделиться в чате села"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
          <span>{copied ? 'Скопировано!' : 'В чат села'}</span>
        </button>
      </div>

      {/* Status control */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        {isCompleted ? (
          <span className="text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Вопрос решён
          </span>
        ) : (
          <span className="text-slate-600 font-medium">
            Объявление актуально
          </span>
        )}

        <button
          onClick={() => onToggleStatus(item.id, isCompleted ? 'active' : 'completed')}
          className="text-slate-600 hover:text-slate-900 font-bold underline transition-colors"
        >
          {isCompleted ? 'Вернуть в активные' : 'Отметить как решено'}
        </button>
      </div>
    </div>
  );
};
