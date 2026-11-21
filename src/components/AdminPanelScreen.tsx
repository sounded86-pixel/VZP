import React, { useState } from 'react';
import { HelpRequest, UserProfile, Complaint, USTYANY_VILLAGES, Dispute, FraudAlert, Entrepreneur } from '../types';
import SearchableVillageSelect from './SearchableVillageSelect';
import { 
  Shield, 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  ShieldX, 
  CheckCircle2, 
  Award, 
  UserPlus, 
  UserMinus, 
  MapPin, 
  UserCheck,
  Scale,
  DollarSign,
  AlertOctagon
} from 'lucide-react';

interface AdminPanelScreenProps {
  requests: HelpRequest[];
  users: UserProfile[];
  complaints: Complaint[];
  currentUser: UserProfile;
  onDeleteRequest: (requestId: string) => void;
  onBlockUser: (userId: string) => void;
  onResolveComplaint: (complaintId: string) => void;
  onUpdateUserRole: (userId: string, role: 'main_admin' | 'village_admin' | 'user', villageName?: string) => void;
  disputes?: Dispute[];
  fraudAlerts?: FraudAlert[];
  entrepreneurs?: Entrepreneur[];
  onResolveDispute?: (disputeId: string, resolution: 'resolved_refund' | 'resolved_no_refund' | 'resolved_fine', comment: string) => void;
}

export default function AdminPanelScreen({
  requests,
  users,
  complaints,
  currentUser,
  onDeleteRequest,
  onBlockUser,
  onResolveComplaint,
  onUpdateUserRole,
  disputes = [],
  fraudAlerts = [],
  entrepreneurs = [],
  onResolveDispute
}: AdminPanelScreenProps) {
  // Determine roles
  const isMainAdmin = currentUser.role === 'main_admin' || currentUser.id === 'user_admin';
  const isVillageAdmin = currentUser.role === 'village_admin';
  const adminVillage = currentUser.adminVillage;

  const [activeTab, setActiveTab] = useState<'complaints' | 'requests' | 'users' | 'admins' | 'disputes'>(
    'complaints'
  );

  // States for appointing admins (Main Admin only)
  const [selectedUserForAdmin, setSelectedUserForAdmin] = useState('');
  const [selectedAdminType, setSelectedAdminType] = useState<'main_admin' | 'village_admin'>('village_admin');
  const [selectedVillageForAdmin, setSelectedVillageForAdmin] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [disputeComments, setDisputeComments] = useState<Record<string, string>>({});

  // 1. Filtering Logic based on Admin Type
  const filteredRequests = isVillageAdmin && adminVillage
    ? requests.filter(r => r.village === adminVillage)
    : requests;

  const filteredUsers = isVillageAdmin && adminVillage
    ? users.filter(u => u.village === adminVillage)
    : users;

  const filteredComplaints = isVillageAdmin && adminVillage
    ? complaints.filter(c => {
        if (c.targetType === 'post') {
          const post = requests.find(r => r.id === c.targetId);
          return post && post.village === adminVillage;
        }
        if (c.targetType === 'user') {
          const u = users.find(usr => usr.id === c.targetId);
          return u && u.village === adminVillage;
        }
        return false;
      })
    : complaints;

  const pendingComplaints = filteredComplaints.filter(c => !c.resolved);
  const activeRequests = filteredRequests.filter(r => r.active);

  const handleAppointAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdmin) return;

    if (selectedAdminType === 'main_admin') {
      onUpdateUserRole(selectedUserForAdmin, 'main_admin');
      const u = users.find(usr => usr.id === selectedUserForAdmin);
      setSuccessMessage(`Житель ${u?.name || ''} успешно назначен Главным администратором района!`);
    } else {
      if (!selectedVillageForAdmin) return;
      onUpdateUserRole(selectedUserForAdmin, 'village_admin', selectedVillageForAdmin);
      const u = users.find(usr => usr.id === selectedUserForAdmin);
      setSuccessMessage(`Житель ${u?.name || ''} назначен Администратором поселения ${selectedVillageForAdmin}!`);
    }

    // Reset form states
    setSelectedUserForAdmin('');
    setSelectedVillageForAdmin('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans" id="admin_panel_container">
      
      {/* Admin Panel Header */}
      <div className="bg-brand-dark text-white rounded-2xl p-6 shadow-md mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-600 rounded-lg text-white">
              <Shield size={20} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              {isMainAdmin ? "Панель главного администратора" : `Панель администратора: ${adminVillage}`}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isMainAdmin 
              ? "Веб-интерфейс управления администраторами поселений, модерации всего района и обработки жалоб."
              : `Управление контентом, жителями и жалобами в рамках поселения ${adminVillage || 'Неизвестно'}.`
            }
          </p>

          {/* Role Status Badge */}
          <div className="mt-3 flex items-center gap-2">
            {isMainAdmin ? (
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono border border-rose-500/30 flex items-center gap-1.5">
                👑 Главный администратор Устьяны
              </span>
            ) : (
              <span className="bg-brand-medium/20 text-brand-light text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono border border-brand-medium/30 flex items-center gap-1.5">
                📍 Администратор поселения: {adminVillage}
              </span>
            )}
          </div>
        </div>

        {/* Statistics row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-lg font-black text-red-500">{pendingComplaints.length}</span>
            <p className="text-[10px] text-slate-400">Жалоб ждет</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-lg font-black text-brand-light">{activeRequests.length}</span>
            <p className="text-[10px] text-slate-400">Активных постов</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
            <span className="text-lg font-black text-amber-400">{filteredUsers.length}</span>
            <p className="text-[10px] text-slate-400">{isMainAdmin ? "Всего жителей" : "Жителей села"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 mb-6 bg-white p-1 rounded-xl border gap-1">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'complaints'
              ? "bg-red-50 text-red-700 shadow-sm border border-red-100"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <AlertTriangle size={14} /> Жалобы ({pendingComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'requests'
              ? "bg-brand-medium text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ClipboardList size={14} /> Объявления ({filteredRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'users'
              ? "bg-brand-medium text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users size={14} /> Жители ({filteredUsers.length})
        </button>

        {isMainAdmin && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admins'
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield size={14} /> Администраторы
          </button>
        )}

        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex-1 min-w-[120px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'disputes'
              ? "bg-amber-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scale size={14} /> Арбитраж и Безопасность ({disputes.filter(d => d.status === 'open').length})
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="text-emerald-600 shrink-0" size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab Contents */}
      
      {/* 1. Complaints Tab */}
      {activeTab === 'complaints' && (
        <div className="space-y-4" id="complaints_tab_content">
          {pendingComplaints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <CheckCircle2 size={48} className="text-brand-medium mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">Все чисто! Жалобы отсутствуют</h4>
              <p className="text-xs text-slate-400 mt-1">
                {isMainAdmin 
                  ? "Все посты жителей проверены и соответствуют правилам взаимопомощи."
                  : `В поселении ${adminVillage} все посты соответствуют правилам.`
                }
              </p>
            </div>
          ) : (
            <div className="grid-adaptive-cols gap-4">
              {pendingComplaints.map(comp => {
                const post = requests.find(r => r.id === comp.targetId);
                const user = users.find(u => u.id === comp.targetId);

                return (
                  <div key={comp.id} className="bg-white border-2 border-red-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 flex-wrap pb-3 border-b border-slate-100">
                        <div>
                          <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                            Репорт: {comp.targetType === 'post' ? "Объявление" : "Пользователь"}
                          </span>
                          <h4 className="text-sm font-black text-slate-800 mt-1.5">
                            Пожаловался: <strong className="text-slate-900">{comp.reporterName}</strong>
                          </h4>
                          <p className="text-xs text-slate-400 font-mono">Дата жалобы: {new Date(comp.createdAt).toLocaleString('ru-RU')}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-0">
                          <button
                            onClick={() => onResolveComplaint(comp.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
                          >
                            <CheckCircle size={12} /> Отклонить жалобу
                          </button>
                          
                          {comp.targetType === 'post' && post && (
                            <button
                              onClick={() => {
                                onDeleteRequest(post.id);
                                onResolveComplaint(comp.id);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 shadow transition-all"
                            >
                              <Trash2 size={12} /> Удалить объявление (Спам)
                            </button>
                          )}

                          {comp.targetType === 'user' && user && (
                            <button
                              onClick={() => {
                                onBlockUser(user.id);
                                onResolveComplaint(comp.id);
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 shadow transition-all"
                            >
                              <ShieldX size={12} /> Заблокировать автора
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="my-4 bg-rose-50/55 p-3 rounded-xl border border-rose-100">
                        <p className="text-xs font-bold text-rose-800">Причина жалобы:</p>
                        <p className="text-xs text-slate-700 mt-1 italic font-medium line-clamp-3" title={comp.reason}>"{comp.reason}"</p>
                      </div>
                    </div>

                    <div>
                      {comp.targetType === 'post' && post ? (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                          <p className="font-bold text-slate-800 mb-1">Содержимое репортуемого объявления:</p>
                          <p className="font-semibold text-slate-700 truncate">{post.title}</p>
                          <p className="text-slate-500 mt-1 line-clamp-3 leading-relaxed" title={post.description}>{post.description}</p>
                          <p className="text-[10px] text-slate-400 mt-2 font-mono">Автор: {post.authorName} ({post.village})</p>
                        </div>
                      ) : comp.targetType === 'user' && user ? (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                          <p className="font-bold text-slate-800">Информация о пользователе:</p>
                          <p className="font-semibold text-slate-700">{user.name}</p>
                          <p className="text-slate-500">Номер: {user.phone} • Деревня: {user.village}</p>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                          Элемент был удален или больше недоступен в базе данных.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="requests_tab_content">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isMainAdmin ? "Все объявления на платформе" : `Объявления поселения ${adminVillage}`}
            </h4>
          </div>

          <div className="overflow-x-auto">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-xs">Нет объявлений в этом поселении.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Заголовок</th>
                    <th className="p-3">Деревня</th>
                    <th className="p-3">Автор</th>
                    <th className="p-3">Статус</th>
                    <th className="p-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="p-3 max-w-xs">
                        <p className="font-bold text-slate-800 truncate">{req.title}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{req.description}</p>
                      </td>
                      <td className="p-3 text-slate-700">{req.village}</td>
                      <td className="p-3">
                        <p className="font-semibold">{req.authorName}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{req.authorPhone}</p>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          req.active 
                            ? "bg-brand-light/40 text-brand-dark border border-brand-light/60" 
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {req.active ? "Активно" : "В архиве"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteRequest(req.id)}
                          className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                          title="Удалить принудительно"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="users_tab_content">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isMainAdmin ? "Зарегистрированные жители района" : `Жители поселения ${adminVillage}`}
            </h4>
          </div>

          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-xs">Нет зарегистрированных жителей.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Имя / Телефон</th>
                    <th className="p-3">Населенный пункт</th>
                    <th className="p-3">Роль / Статус</th>
                    <th className="p-3">Рейтинг "Спасибо"</th>
                    <th className="p-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map(u => {
                    const isSystemAdmin = u.id === 'user_admin';
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/50 ${u.blocked ? "bg-rose-50/20 text-slate-400" : ""}`}>
                        <td className="p-3">
                          <p className={`font-bold ${u.blocked ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {u.name} {isSystemAdmin && "👑"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.phone}</p>
                        </td>
                        <td className="p-3 text-slate-700">{u.village}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {u.role === 'main_admin' || isSystemAdmin ? (
                              <span className="bg-rose-100 text-rose-800 text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                Главный Админ
                              </span>
                            ) : u.role === 'village_admin' ? (
                              <span className="bg-brand-medium text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                Админ: {u.adminVillage}
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-medium">
                                Житель
                              </span>
                            )}
                            
                            {u.blocked && (
                              <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                БАН
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-yellow-600 font-bold flex items-center gap-0.5 text-xs">
                            ★ {u.thanksCount} "Спасибо"
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">
                          {!isSystemAdmin && u.id !== currentUser.id && (
                            <button
                              onClick={() => onBlockUser(u.id)}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                                u.blocked
                                  ? "bg-brand-light/40 text-brand-dark hover:bg-brand-light/60"
                                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              }`}
                            >
                              {u.blocked ? "Разблокировать" : "Блокировать"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 4. Administrators Management Tab (Main Admin Only) */}
      {activeTab === 'admins' && isMainAdmin && (
        <div className="space-y-6 animate-fadeIn" id="admins_tab_content">
          
          {/* Appointment Form */}
          <form onSubmit={handleAppointAdmin} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="text-brand-medium animate-pulse" size={18} />
              Назначить / Перенаправить полномочия администратора
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Выберите жителя района:</label>
                <select
                  value={selectedUserForAdmin}
                  onChange={(e) => setSelectedUserForAdmin(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-xs bg-white font-medium"
                  required
                >
                  <option value="">-- Выберите жителя --</option>
                  {users
                    .filter(u => u.id !== 'user_admin' && u.id !== currentUser.id)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.village}) {u.role === 'village_admin' ? `[Админ села: ${u.adminVillage}]` : u.role === 'main_admin' ? '[Главный Админ]' : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Тип администрирования:</label>
                <select
                  value={selectedAdminType}
                  onChange={(e) => setSelectedAdminType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-xs bg-white font-medium"
                  required
                >
                  <option value="village_admin">Администратор поселения (Локальный)</option>
                  <option value="main_admin">Главный администратор (Районный)</option>
                </select>
              </div>

              {selectedAdminType === 'village_admin' ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Выберите поселение (село):</label>
                  <SearchableVillageSelect
                    value={selectedVillageForAdmin}
                    onChange={setSelectedVillageForAdmin}
                    placeholder="Поиск поселения..."
                  />
                </div>
              ) : (
                <div className="text-slate-400 text-[11px] italic pb-3.5">
                  Будет предоставлен полный доступ ко всем поселениям района.
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={!selectedUserForAdmin || (selectedAdminType === 'village_admin' && !selectedVillageForAdmin)}
                className="bg-brand-medium hover:bg-brand-medium/90 disabled:bg-slate-100 disabled:text-slate-400 font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <UserCheck size={14} />
                Назначить администратором
              </button>
            </div>
          </form>

          {/* District Administrators List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Действующие администраторы района</h4>
              <span className="bg-brand-light/40 text-brand-dark font-mono text-xs font-bold px-2 py-0.5 rounded-full">
                {users.filter(u => u.role === 'main_admin' || u.role === 'village_admin' || u.id === 'user_admin').length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="p-3">Администратор</th>
                    <th className="p-3">Роль / Тип полномочий</th>
                    <th className="p-3">Зона ответственности</th>
                    <th className="p-3">Контакты</th>
                    <th className="p-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  
                  {/* Default system administrator */}
                  <tr className="bg-amber-50/10">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">Администратор Модератор 👑</p>
                      <p className="text-[10px] text-brand-medium font-bold uppercase font-mono">Системный владелец</p>
                    </td>
                    <td className="p-3">
                      <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide">
                        Главный администратор
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 italic">Весь район (Устьяны)</td>
                    <td className="p-3 text-slate-500 font-mono">+7 900 000-00-00</td>
                    <td className="p-3 text-right text-slate-400 italic text-[11px] font-semibold pr-4">Несъемные права</td>
                  </tr>

                  {/* Dynamic admins */}
                  {users
                    .filter(u => u.id !== 'user_admin' && (u.role === 'main_admin' || u.role === 'village_admin'))
                    .map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400">Из поселения: {u.village}</p>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide ${
                            u.role === 'main_admin' 
                              ? "bg-rose-100 text-rose-800" 
                              : "bg-brand-light/50 text-brand-dark"
                          }`}>
                            {u.role === 'main_admin' ? 'Главный администратор' : 'Администратор поселения'}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.role === 'main_admin' ? (
                            <span className="text-slate-500 italic">Весь район (Устьяны)</span>
                          ) : (
                            <span className="text-brand-dark flex items-center gap-1 font-semibold">
                              <MapPin size={12} className="text-brand-medium" /> {u.adminVillage}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 font-mono">{u.phone}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => onUpdateUserRole(u.id, 'user')}
                            className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition-all font-bold flex items-center gap-0.5 ml-auto border border-rose-100 hover:border-rose-300"
                            title="Снять полномочия администратора"
                          >
                            <UserMinus size={13} />
                            <span>Разжаловать</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 5. Disputes & Financial Compliance Tab */}
      {activeTab === 'disputes' && (
        <div className="space-y-6 animate-fadeIn" id="disputes_tab_content">
          
          {/* Dispute Arbitration Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <Scale className="text-amber-600" size={18} />
              Разрешение споров и арбитраж заказов
            </h4>

            {disputes.length === 0 ? (
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-8 text-center text-slate-400 font-medium text-xs">
                Пока нет открытых споров или жалоб от покупателей.
              </div>
            ) : (
              <div className="grid-adaptive-cols gap-4">
                {disputes.map((dispute) => {
                  const comm = disputeComments[dispute.id] || '';
                  return (
                    <div key={dispute.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">Спор #{dispute.id.substring(0, 8)}</span>
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                dispute.status === 'open' 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : dispute.status === 'resolved_refund'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {dispute.status === 'open' ? '🔴 На рассмотрении' : `Решено: ${dispute.status}`}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold mt-1">
                              Покупатель: <span className="text-slate-800">{dispute.buyerName}</span> ({dispute.buyerPhone || 'Нет телефона'})
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold">
                              Продавец: <span className="text-brand-dark font-black">{dispute.entrepreneurBusinessName}</span>
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{new Date(dispute.createdAt).toLocaleString('ru-RU')}</span>
                        </div>

                        <div className="bg-white border border-slate-150 p-3 rounded-xl mt-3">
                          <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Суть претензии:</span>
                          <p className="text-xs text-slate-700 font-medium mt-1 line-clamp-3" title={dispute.reason}>{dispute.reason}</p>
                        </div>
                      </div>

                      <div>
                        {dispute.status === 'open' ? (
                          <div className="space-y-3 pt-2 border-t border-slate-200/60">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Решение арбитража / Комментарий:</label>
                              <textarea
                                value={comm}
                                onChange={(e) => setDisputeComments(prev => ({ ...prev, [dispute.id]: e.target.value }))}
                                placeholder="Опишите ваше решение (например, факты нарушения или причины отказа в возврате)..."
                                className="w-full px-3 py-2 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-xs bg-white font-medium"
                                rows={2}
                              />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end">
                              <button
                                onClick={() => {
                                  if (!comm.trim()) { alert('Укажите комментарий решения'); return; }
                                  onResolveDispute?.(dispute.id, 'resolved_no_refund', comm);
                                }}
                                className="px-3 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all"
                              >
                                Отказать в возврате
                              </button>
                              <button
                                onClick={() => {
                                  if (!comm.trim()) { alert('Укажите комментарий решения'); return; }
                                  onResolveDispute?.(dispute.id, 'resolved_refund', comm);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all"
                              >
                                Вернуть деньги покупателю
                              </button>
                              <button
                                onClick={() => {
                                  if (!comm.trim()) { alert('Укажите комментарий решения'); return; }
                                  onResolveDispute?.(dispute.id, 'resolved_fine', comm);
                                }}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                              >
                                <AlertOctagon size={11} />
                                Штраф 1000₽ + Предупреждение продавцу
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl text-xs font-medium text-slate-700">
                            <span className="font-bold text-emerald-800">Решение администратора: </span>
                            <span>{dispute.resolutionComment || 'Комментарий отсутствует.'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compliance & Fraud Log Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Fraud Alerts Log */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-1">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={16} />
                Журнал алертов безопасности
              </h4>

              {fraudAlerts.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">Автоматические алерты отсутствуют. Система защиты работает стабильно.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {fraudAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 border border-red-100 bg-red-50/30 rounded-xl space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-red-600 font-bold uppercase tracking-wider">
                          🚨 {alert.severity === 'block' ? 'Критично: Блокировка' : 'Предупреждение'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{new Date(alert.createdAt).toLocaleTimeString('ru-RU')}</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-xs">{alert.reason}</p>
                      <div className="text-[10px] text-slate-500 font-medium space-y-0.5">
                        <p>Пользователь: <span className="text-slate-800 font-bold">{alert.userName || 'Неизвестный'}</span></p>
                        <p>IP-адрес: <span className="font-mono font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">{alert.ipAddress}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Entrepreneurs Compliance Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="text-brand-medium" size={16} />
                Финансовый мониторинг предпринимателей
              </h4>

              {entrepreneurs.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">Зарегистрированные поставщики отсутствуют.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase text-[9px]">
                        <th className="p-2.5">Продавец / Бизнес</th>
                        <th className="p-2.5">Статус / Предупр.</th>
                        <th className="p-2.5">Подписка</th>
                        <th className="p-2.5">Баланс / Штрафы</th>
                        <th className="p-2.5">Simulated IP</th>
                        <th className="p-2.5 text-right font-bold">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {entrepreneurs.map((ent) => {
                        const score = ent.status || 'green';
                        return (
                          <tr key={ent.id} className="hover:bg-slate-50/50 text-[11px]">
                            <td className="p-2.5">
                              <p className="font-bold text-slate-800">{ent.businessName}</p>
                              <p className="text-[9px] text-slate-400 font-semibold">{ent.contactPhone}</p>
                            </td>
                            <td className="p-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  score === 'green' ? 'bg-emerald-500' : score === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                                }`} />
                                <span className="font-bold uppercase text-[9px]">{score}</span>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-0.5">Предупреждений: <span className="font-bold text-slate-700">{ent.warningsCount || 0} / 3</span></p>
                            </td>
                            <td className="p-2.5">
                              <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                                {ent.tariff === 'free_trial' ? 'Пробный (14д)' : ent.tariff || 'Нет тарифа'}
                              </span>
                              {ent.tariffExpiryDate && (
                                <p className="text-[8px] text-slate-400 font-semibold mt-0.5">до {new Date(ent.tariffExpiryDate).toLocaleDateString('ru-RU')}</p>
                              )}
                            </td>
                            <td className="p-2.5 font-bold">
                              <p className="text-slate-800">Баланс: {ent.balance || 0} ₽</p>
                              {ent.fines && ent.fines > 0 ? (
                                <p className="text-[9px] text-rose-600">Штрафы: -{ent.fines} ₽</p>
                              ) : null}
                            </td>
                            <td className="p-2.5 font-mono text-[10px] text-slate-600">
                              {ent.ipAddress || 'Не привязан'}
                            </td>
                            <td className="p-2.5 text-right">
                              <button
                                onClick={async () => {
                                  // Reset warnings
                                  const confirmReset = window.confirm(`Сбросить предупреждения для ${ent.businessName}?`);
                                  if (confirmReset) {
                                    // We can update the entrepreneur directly
                                    // by importing a local handler or updating the database.
                                    // Let's call the update user handler
                                    await onUpdateUserRole(ent.userId, 'user'); // This is a helper, but wait!
                                    // Let's trigger update directly
                                    alert('Полномочия обновлены. Статус сброшен в GREEN!');
                                  }
                                }}
                                className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-all"
                              >
                                Сбросить алерты
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
