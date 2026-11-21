import React, { useState, useMemo } from 'react';
import { Entrepreneur, Order, Review } from '../../types';
import { Check, X, Shield, Star, Ban, UserCheck, AlertCircle, TrendingUp, DollarSign, Store } from 'lucide-react';

interface DeliveryAdminProps {
  entrepreneurs: Entrepreneur[];
  orders: Order[];
  onApprove: (entrId: string) => void;
  onReject: (entrId: string) => void;
  onToggleBlock: (entrId: string) => void;
  onClose: () => void;
}

export default function DeliveryAdmin({
  entrepreneurs,
  orders,
  onApprove,
  onReject,
  onToggleBlock,
  onClose
}: DeliveryAdminProps) {
  // Subtabs: 'applications' | 'all' | 'stats'
  const [adminTab, setAdminTab] = useState<'applications' | 'all' | 'stats'>('applications');

  // Pending applications
  const pendingApps = useMemo(() => {
    return entrepreneurs.filter(e => e.moderationStatus === 'pending');
  }, [entrepreneurs]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalVolume = orders.reduce((sum, o) => sum + o.total, 0);
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const completedVolume = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const approvedSellers = entrepreneurs.filter(e => e.moderationStatus === 'approved');

    return {
      totalVolume,
      completedOrdersCount: completedOrders.length,
      completedVolume,
      approvedSellersCount: approvedSellers.length,
      pendingAppsCount: pendingApps.length
    };
  }, [orders, entrepreneurs, pendingApps]);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto" id="delivery_admin">
      {/* Admin header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Shield className="text-rose-600 shrink-0" size={22} />
          <div>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              Администрирование раздела доставки
            </h2>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
              Модерируйте заявки предпринимателей и контролируйте товарооборот района
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-xl text-xs transition-all cursor-pointer"
        >
          Закрыть
        </button>
      </div>

      {/* Admin subtabs */}
      <div className="flex border-b border-slate-200 mb-5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAdminTab('applications')}
          className={`py-2 px-4 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            adminTab === 'applications'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🆕 Заявки на модерацию ({pendingApps.length})
        </button>

        <button
          onClick={() => setAdminTab('all')}
          className={`py-2 px-4 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            adminTab === 'all'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🏪 Все предприниматели ({entrepreneurs.length})
        </button>

        <button
          onClick={() => setAdminTab('stats')}
          className={`py-2 px-4 text-xs font-black transition-all cursor-pointer border-b-2 shrink-0 ${
            adminTab === 'stats'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📊 Общая статистика района
        </button>
      </div>

      {/* TAB 1: MODERATION APPLICATIONS */}
      {adminTab === 'applications' && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
            Новые заявки на вступление в Продуктовый подвоз
          </h3>

          {pendingApps.length > 0 ? (
            <div className="space-y-4">
              {pendingApps.map(app => (
                <div key={app.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 text-xs font-bold">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{app.businessName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Телефон: {app.contactPhone}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-[9px] font-black px-2 py-0.5 rounded border border-yellow-200 uppercase">На модерации</span>
                  </div>

                  {/* Radius and schedule summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-slate-500 font-bold bg-slate-50 p-3 rounded-xl">
                    <div>
                      📍 <strong>Радиус охвата:</strong> {app.serviceRadius} км
                    </div>
                    <div>
                      📅 <strong>Дни доставки:</strong> {Object.keys(app.deliverySchedule).filter(day => app.deliverySchedule[day]?.length > 0).map(day => {
                        const daysNames: Record<string, string> = {
                          monday: 'Пн', tuesday: 'Вт', wednesday: 'Ср', thursday: 'Чт', friday: 'Пт', saturday: 'Сб', sunday: 'Вс'
                        };
                        return daysNames[day];
                      }).join(', ') || 'Не настроены'}
                    </div>
                  </div>

                  {/* Price list items preview */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Прайс-лист товаров ({app.priceList.length}):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {app.priceList.map((p, i) => (
                        <span key={i} className="bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-[10px] text-slate-600">
                          {p.item} — {p.price} ₽/{p.unit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Moderate action buttons */}
                  <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => onReject(app.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-650 font-black px-4 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 border border-red-200"
                    >
                      <X size={12} />
                      <span>Отклонить заявку</span>
                    </button>

                    <button
                      onClick={() => onApprove(app.id)}
                      className="bg-emerald-650 hover:bg-emerald-700 text-white font-black px-5 py-2 rounded-xl text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Check size={12} className="stroke-[3]" />
                      <span>Одобрить и выпустить</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-white p-12 rounded-2xl border border-slate-100 text-slate-400 text-xs font-bold space-y-2">
              <UserCheck className="mx-auto text-slate-300" size={32} />
              <p>Очередь модерации пуста!</p>
              <p className="text-[10px] font-medium text-slate-400">Все заявки предпринимателей успешно проверены.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL REGISTERED SELLERS LIST */}
      {adminTab === 'all' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
            Каталог зарегистрированных предпринимателей
          </h3>

          <div className="space-y-2">
            {entrepreneurs.map(seller => (
              <div key={seller.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex justify-between items-center gap-4 text-xs font-bold">
                <div>
                  <h4 className="font-black text-slate-800">{seller.businessName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Телефон: {seller.contactPhone} | Статус модерации: <span className="uppercase text-brand-medium">{seller.moderationStatus}</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-amber-500 font-extrabold flex items-center gap-0.5">
                    ★ {seller.rating.average}
                  </span>

                  <button
                    onClick={() => onToggleBlock(seller.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                      seller.isActive
                        ? 'bg-red-50 hover:bg-red-100 text-red-650 border border-red-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    <Ban size={11} />
                    <span>{seller.isActive ? 'Заблокировать' : 'Разблокировать'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS OVERVIEW */}
      {adminTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Общий оборот заказов</p>
                <p className="text-lg font-black text-slate-800 mt-1">{stats.totalVolume} ₽</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Выполненных доставок</p>
                <p className="text-lg font-black text-slate-800 mt-1">{stats.completedOrdersCount} подвозов</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Store size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Активных ИП в районе</p>
                <p className="text-lg font-black text-slate-800 mt-1">{stats.approvedSellersCount} ИП</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <AlertCircle size={14} className="text-brand-medium" />
              <span>Финансовые показатели раздела</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal font-bold">
              Объем завершенных сделок в Устьянском районе составляет <strong>{stats.completedVolume} ₽</strong>. Процент успешной реализации доставок составляет <strong>{stats.completedOrdersCount > 0 ? Math.round((stats.completedOrdersCount / orders.length) * 100) : 100}%</strong> от всех оформленных в приложении заказов.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
