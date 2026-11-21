import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Heart, ClipboardList, Briefcase, Plus, FileText, 
  MapPin, Phone, Mail, Building2, TrendingUp, CheckCircle2, Clock, AlertCircle,
  Download, ArrowUpRight, ShieldCheck, UserPlus, Trash2, Send
} from 'lucide-react';
import { UserProfile, FranchiseLead } from '../types';
import { dbSubscribeFranchiseLeads, dbCreateFranchiseLead } from '../firebaseSync';

interface PartnerCabinetProps {
  currentUser: UserProfile;
  isOffline: boolean;
  onNavigate: (screen: string) => void;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export default function PartnerCabinet({
  currentUser,
  isOffline,
  onNavigate
}: PartnerCabinetProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'leads' | 'income' | 'contracts' | 'team'>('stats');
  
  // Real-time Franchise Leads
  const [leads, setLeads] = useState<FranchiseLead[]>([]);
  const [leadForm, setLeadForm] = useState({
    orgName: '',
    regionName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    selectedPackage: 'local' as 'local' | 'regional' | 'partner',
    comment: ''
  });
  
  const [leadSubmitSuccess, setLeadSubmitSuccess] = useState(false);
  const [leadSubmitError, setLeadSubmitError] = useState('');
  
  // Local Team Members State
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: 'team_1',
      name: 'Алексей Смирнов',
      role: 'Управляющий франшизой',
      phone: '+7 (921) 456-11-22',
      email: 'smirnov.velsk@ustyany.ru'
    },
    {
      id: 'team_2',
      name: 'Елена Кравцова',
      role: 'Модератор чатов и заявок',
      phone: '+7 (911) 234-55-66',
      email: 'kravtsova.moderator@ustyany.ru'
    },
    {
      id: 'team_3',
      name: 'Дмитрий Попов',
      role: 'Координатор добрых дел',
      phone: '+7 (900) 876-54-32',
      email: 'popov.coordination@ustyany.ru'
    }
  ]);
  
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Координатор добрых дел',
    phone: '',
    email: ''
  });
  const [showAddMember, setShowAddMember] = useState(false);

  // Firestore leads subscription
  useEffect(() => {
    if (isOffline) {
      // Offline mock fallback leads
      setLeads([
        {
          id: 'lead_velsk',
          orgName: 'ООО Вельск Содружество',
          regionName: 'Вельский район',
          contactName: 'Ковалев Андрей Семенович',
          contactPhone: '+7 (921) 472-12-88',
          contactEmail: 'kovalev.velsk@mail.ru',
          selectedPackage: 'regional',
          comment: 'Готовы запустить пилотный проект в Вельске',
          createdAt: '2026-05-10T14:30:00.000Z',
          status: 'approved'
        },
        {
          id: 'lead_krasnobor',
          orgName: 'ИП Соболева',
          regionName: 'Красноборский район',
          contactName: 'Соболева Ирина Михайловна',
          contactPhone: '+7 (911) 588-44-55',
          contactEmail: 'soboleva.krasnobor@yandex.ru',
          selectedPackage: 'local',
          comment: 'Просим предоставить локальный пакет для Шенкурска и Красноборска',
          createdAt: '2026-06-15T09:00:00.000Z',
          status: 'pending'
        }
      ]);
      return;
    }

    const unsub = dbSubscribeFranchiseLeads((list) => {
      if (list.length === 0) {
        // Seed initial leads if Firestore is empty
        const initialLeads: FranchiseLead[] = [
          {
            id: 'lead_velsk',
            orgName: 'ООО Вельск Содружество',
            regionName: 'Вельский район',
            contactName: 'Ковалев Андрей Семенович',
            contactPhone: '+7 (921) 472-12-88',
            contactEmail: 'kovalev.velsk@mail.ru',
            selectedPackage: 'regional',
            comment: 'Готовы запустить пилотный проект в Вельске',
            createdAt: '2026-05-10T14:30:00.000Z',
            status: 'approved'
          },
          {
            id: 'lead_krasnobor',
            orgName: 'ИП Соболева',
            regionName: 'Красноборский район',
            contactName: 'Соболева Ирина Михайловна',
            contactPhone: '+7 (911) 588-44-55',
            contactEmail: 'soboleva.krasnobor@yandex.ru',
            selectedPackage: 'local',
            comment: 'Просим предоставить локальный пакет для Шенкурска и Красноборска',
            createdAt: '2026-06-15T09:00:00.000Z',
            status: 'pending'
          }
        ];
        
        // Save them to database
        initialLeads.forEach(async (lead) => {
          await dbCreateFranchiseLead(lead);
        });
        setLeads(initialLeads);
      } else {
        setLeads(list);
      }
    });

    return () => unsub();
  }, [isOffline]);

  // Handle lead submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitError('');
    setLeadSubmitSuccess(false);

    if (!leadForm.orgName || !leadForm.regionName || !leadForm.contactName || !leadForm.contactPhone || !leadForm.contactEmail) {
      setLeadSubmitError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const newLead: FranchiseLead = {
      id: `lead_${Date.now()}`,
      orgName: leadForm.orgName,
      regionName: leadForm.regionName,
      contactName: leadForm.contactName,
      contactPhone: leadForm.contactPhone,
      contactEmail: leadForm.contactEmail,
      selectedPackage: leadForm.selectedPackage,
      comment: leadForm.comment,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    try {
      if (!isOffline) {
        await dbCreateFranchiseLead(newLead);
      } else {
        // Offline append
        setLeads(prev => [newLead, ...prev]);
      }
      setLeadSubmitSuccess(true);
      setLeadForm({
        orgName: '',
        regionName: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        selectedPackage: 'local',
        comment: ''
      });
      setTimeout(() => setLeadSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setLeadSubmitError(err.message || 'Ошибка при сохранении заявки. Попробуйте еще раз.');
    }
  };

  // Add team member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone || !newMember.email) return;

    const added: TeamMember = {
      id: `team_${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      phone: newMember.phone,
      email: newMember.email
    };

    setTeam(prev => [...prev, added]);
    setNewMember({
      name: '',
      role: 'Координатор добрых дел',
      phone: '',
      email: ''
    });
    setShowAddMember(false);
  };

  // Remove team member
  const handleRemoveMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
  };

  // Request Extension Simulation
  const handleRequestExtension = () => {
    alert("Запрос на продление лицензионного соглашения отправлен в Центральную Администрацию. С вами свяжется куратор.");
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-widest">
              ПАКЕТ PARTNER (ФРАНШИЗА)
            </span>
            {isOffline && (
              <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Автономно
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
            🍇 КАБИНЕТ ПАРТНЁРА-ФРАНЧАЙЗИ
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium">
            Центральное управление региональным хабом взаимопомощи • <span className="text-purple-400 font-semibold">{currentUser.village}</span>
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl transition-all border border-slate-700 hover:border-slate-600 shadow-md flex items-center gap-2 self-start md:self-center"
        >
          НА ГЛАВНУЮ
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'stats'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <BarChart3 size={14} />
          <span>СТАТИСТИКА РАЙОНА</span>
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'leads'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <ClipboardList size={14} />
          <span>ЗАЯВКИ НА ФРАНШИЗУ</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'income'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <TrendingUp size={14} />
          <span>ДОХОДЫ & РОЯЛТИ</span>
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'contracts'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <FileText size={14} />
          <span>ДОГОВОРЫ & ЛИЦЕНЗИИ</span>
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
            activeTab === 'team'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Users size={14} />
          <span>КОМАНДА ПАРТНЁРА</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        
        {/* ================= TAB 1: STATISTICS ================= */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="text-purple-400" /> Аналитика региональной франшизы
              </h2>
              <p className="text-slate-400 text-xs">
                Показатели активности жителей, мастеров и коммерческой эффективности в районе.
              </p>
            </div>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Users size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Пользователи</span>
                <div className="text-3xl font-black text-white">1,240 <span className="text-xs text-slate-500 font-normal">чел.</span></div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400 font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>412 АКТИВНЫ СЕГОДНЯ</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Heart size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Выполнено добрых дел</span>
                <div className="text-3xl font-black text-white">345 <span className="text-xs text-slate-500 font-normal">заявок</span></div>
                <p className="text-[10px] text-slate-500 font-mono font-bold mt-2">
                  БЕЗВОЗМЕЗДНАЯ ПОМОЩЬ СЕМЬЯМ И ПЕНСИОНЕРАМ
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Briefcase size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Заказы предпринимателей</span>
                <div className="text-3xl font-black text-white">512 <span className="text-xs text-slate-500 font-normal">сделок</span></div>
                <p className="text-[10px] text-slate-500 font-mono font-bold mt-2">
                  ТОВАРЫ, ДОСТАВКА И МЕСТНЫЕ УСЛУГИ
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Briefcase size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Активные мастера</span>
                <div className="text-3xl font-black text-white">48 <span className="text-xs text-slate-500 font-normal">профи</span></div>
                <p className="text-[10px] text-slate-500 font-mono font-bold mt-2">
                  ПРОВЕРЕННЫЕ СПЕЦИАЛИСТЫ УСЛУГ
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <TrendingUp size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Доход франшизы всего</span>
                <div className="text-3xl font-black text-white">850,000 ₽</div>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-indigo-400 font-mono font-bold">
                  <ArrowUpRight size={12} />
                  <span>+14.5% К ПРОШЛОМУ МЕСЯЦУ</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Средний рейтинг услуг</span>
                <div className="text-3xl font-black text-white">4.8 <span className="text-xs text-slate-500 font-normal">из 5</span></div>
                <p className="text-[10px] text-slate-500 font-mono font-bold mt-2">
                  ВЕРИФИЦИРОВАНО ЖИТЕЛЯМИ
                </p>
              </div>

            </div>

            {/* Custom Visual Performance Card */}
            <div className="bg-gradient-to-br from-slate-900 to-purple-950/20 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Эффективность социального предпринимательства</h3>
                <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
                  Программа социального франчайзинга «Взаимопомощь» позволяет снизить нагрузку на социальные службы района на 28%, стимулируя развитие легального микробизнеса, мастеров и укрепляя доверие между жителями.
                </p>
              </div>
              <div className="bg-slate-950/50 border border-slate-800/80 px-6 py-4 rounded-2xl shrink-0 text-center">
                <div className="text-purple-400 text-xs font-bold uppercase tracking-widest">СОЦИАЛЬНЫЙ ЭФФЕКТ</div>
                <div className="text-2xl font-black text-white mt-1">ВЫСОКИЙ</div>
                <span className="text-[9px] text-slate-500 font-mono">РЕЙТИНГ А+ ПО СТАНДАРТУ УСХ</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: FRANCHISE LEADS ================= */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ClipboardList className="text-purple-400" /> Заявки на масштабирование франшизы
                </h2>
                <p className="text-slate-400 text-xs">
                  Просмотр входящих заявок из соседних областей и районов. Отправка тестовых заявок с записью в Firestore.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Submission Form */}
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Plus size={14} /> Отправить тестовую заявку
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Заполните форму, чтобы имитировать новую заявку на франшизу. Она моментально запишется в Firestore и отобразится в таблице.
                </p>

                {leadSubmitSuccess && (
                  <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                    <span>Заявка успешно сохранена в Firestore!</span>
                  </div>
                )}

                {leadSubmitError && (
                  <div className="bg-red-950 border border-red-900 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0 text-red-400" />
                    <span>{leadSubmitError}</span>
                  </div>
                )}

                <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Район / Субъект РФ <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Например, Вельский район"
                      value={leadForm.regionName}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, regionName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Название организации <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Например, ИП Ковалев"
                      value={leadForm.orgName}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, orgName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">ФИО представителя <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Например, Ковалев А.С."
                      value={leadForm.contactName}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, contactName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold">Телефон <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="+7 (921) 000-00-00"
                        value={leadForm.contactPhone}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold">Email <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        placeholder="test@mail.ru"
                        value={leadForm.contactEmail}
                        onChange={(e) => setLeadForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Выбранный франшизный пакет</label>
                    <select
                      value={leadForm.selectedPackage}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, selectedPackage: e.target.value as any }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500"
                    >
                      <option value="local">LOCAL (Районный старт)</option>
                      <option value="regional">REGIONAL (Оптимальный)</option>
                      <option value="partner">PARTNER (Бессрочный эксклюзив)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Комментарий</label>
                    <textarea 
                      placeholder="Дополнительные сведения..."
                      value={leadForm.comment}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 h-16 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={12} />
                    <span>ОТПРАВИТЬ В FIRESTORE</span>
                  </button>
                </form>
              </div>

              {/* Leads Live Table */}
              <div className="lg:col-span-2 space-y-4">
                <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Заявитель / Регион</th>
                        <th className="p-3">Контакты</th>
                        <th className="p-3">Пакет</th>
                        <th className="p-3">Дата создания</th>
                        <th className="p-3 text-center">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-white">{lead.orgName}</div>
                            <span className="text-[10px] text-purple-400 flex items-center gap-1 mt-0.5 font-bold">
                              <MapPin size={10} /> {lead.regionName}
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5">
                            <div className="text-[11px] text-slate-200">{lead.contactName}</div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Phone size={10} /> {lead.contactPhone}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Mail size={10} /> {lead.contactEmail}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              lead.selectedPackage === 'partner' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                              lead.selectedPackage === 'regional' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {lead.selectedPackage}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-400 text-[10px]">
                            {new Date(lead.createdAt).toLocaleString('ru-RU')}
                          </td>
                          <td className="p-3 text-center">
                            {lead.status === 'approved' ? (
                              <span className="bg-emerald-950 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full border border-emerald-900 font-bold uppercase">Одобрена</span>
                            ) : lead.status === 'rejected' ? (
                              <span className="bg-red-950 text-red-400 text-[9px] px-2 py-0.5 rounded-full border border-red-900 font-bold uppercase">Отклонена</span>
                            ) : (
                              <span className="bg-amber-950 text-amber-400 text-[9px] px-2 py-0.5 rounded-full border border-amber-900 font-bold uppercase">В ожидании</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {leads.length === 0 && (
                  <div className="text-center py-8 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                    Нет активных заявок. Заполните форму слева для добавления.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 3: INCOME & ROYALTY ================= */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="text-purple-400" /> Начисления доходов и оплата роялти
              </h2>
              <p className="text-slate-400 text-xs">
                Региональные финансовые расчеты, задолженность за текущий период и реестр совершенных транзакций.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Owed Summary */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest">Текущий месяц: Июль 2026</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400 text-xs">Оборот по заказам в районе:</span>
                    <span className="text-white font-bold text-sm">850,000 ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400 text-xs">Ваша лицензионная ставка:</span>
                    <span className="text-purple-400 font-black text-sm">3%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400 text-xs">К оплате роялти (Центр):</span>
                    <span className="text-white font-black text-lg text-purple-400">25,500 ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400 text-xs">Срок внесения роялти:</span>
                    <span className="text-yellow-400 font-bold text-xs flex items-center gap-1">
                      <Clock size={12} /> до 10 августа 2026
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-xl text-[11px] text-purple-300 leading-relaxed">
                  Поскольку вы используете бессрочный эксклюзивный пакет <strong>PARTNER</strong>, ставка роялти зафиксирована на минимальной отметке <strong>3%</strong> (вместо базовых 5% для пакетов Local/Regional).
                </div>
              </div>

              {/* General Financial Status */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Статус взаиморасчетов</span>
                  <div className="text-2xl font-black text-emerald-400 uppercase flex items-center gap-1.5">
                    <ShieldCheck size={24} /> ДОЛГОВ НЕТ
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Все лицензионные платежи и платежные требования перед устьянским головным офисом полностью закрыты. Доступ к системе White-Label и региональной админ-панели активен в штатном режиме.
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-4 mt-6 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono block">ПОСЛЕДНИЙ ПЛАТЕЖ</span>
                    <span className="text-xs text-white font-bold">14,900 ₽ (05.07.2026)</span>
                  </div>
                  <button className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold transition-all">
                    Выгрузить сверку
                  </button>
                </div>
              </div>

            </div>

            {/* Payment History Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">История лицензионных платежей</h3>
              <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Номер счета</th>
                      <th className="p-3">Период платежа</th>
                      <th className="p-3">Сумма роялти</th>
                      <th className="p-3">Дата проведения</th>
                      <th className="p-3 text-center">Статус платежа</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono">
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-bold text-white">INV-2026-06</td>
                      <td className="p-3 text-slate-300">Июнь 2026</td>
                      <td className="p-3 text-white">14,900 ₽</td>
                      <td className="p-3 text-slate-400">05.07.2026 14:12</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-950 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full border border-emerald-900 font-bold uppercase font-sans">Оплачено</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-bold text-white">INV-2026-05</td>
                      <td className="p-3 text-slate-300">Май 2026</td>
                      <td className="p-3 text-white">11,200 ₽</td>
                      <td className="p-3 text-slate-400">04.06.2026 09:30</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-950 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full border border-emerald-900 font-bold uppercase font-sans">Оплачено</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-bold text-white">INV-2026-04</td>
                      <td className="p-3 text-slate-300">Апрель 2026</td>
                      <td className="p-3 text-white">9,500 ₽</td>
                      <td className="p-3 text-slate-400">03.05.2026 11:45</td>
                      <td className="p-3 text-center">
                        <span className="bg-emerald-950 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full border border-emerald-900 font-bold uppercase font-sans">Оплачено</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-900/40 transition-colors text-slate-400">
                      <td className="p-3 font-bold">INV-2026-07</td>
                      <td className="p-3">Июль 2026 (Аванс)</td>
                      <td className="p-3 text-slate-200">25,500 ₽</td>
                      <td className="p-3">-</td>
                      <td className="p-3 text-center">
                        <span className="bg-amber-950 text-amber-400 text-[9px] px-2 py-0.5 rounded-full border border-amber-900 font-bold uppercase font-sans">Ожидает оплаты</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CONTRACTS & LICENSES ================= */}
        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <FileText className="text-purple-400" /> Договоры, лицензии и франшизные соглашения
              </h2>
              <p className="text-slate-400 text-xs">
                Действующие параметры соглашения Вельской франшизы с Головной администрацией Устьян.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">РОЯЛТИ СТАВКА</span>
                <div className="text-3xl font-black text-white">3% <span className="text-xs text-slate-500 font-normal">от оборота</span></div>
                <p className="text-[11px] text-slate-400">Минимально возможный процент зафиксирован бессрочно в рамках соглашения PARTNER.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">WHITE-LABEL ДОСТУП</span>
                <div className="text-3xl font-black text-emerald-400 uppercase">АКТИВЕН</div>
                <p className="text-[11px] text-slate-400">Вам доступно брендирование приложения, отключение логотипов Устьян и установка собственных цветов.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">ЭКСКЛЮЗИВ НА РЕГИОН</span>
                <div className="text-3xl font-black text-emerald-400 uppercase">ВЫДАН</div>
                <p className="text-[11px] text-slate-400">Ни один другой заявитель не может запустить франшизу на территории Вельского района.</p>
              </div>

            </div>

            {/* Contract Details Block */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <FileText size={16} className="text-purple-400" /> Спецификация активного договора франшизы
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">ID Договора:</span>
                    <span className="font-mono text-white font-bold">FRAN-VELSK-2026-04</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Дата заключения:</span>
                    <span className="text-white font-bold">01 апреля 2026</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Срок действия лицензии:</span>
                    <span className="text-white font-bold">до 01 апреля 2027</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Стороны договора:</span>
                    <span className="text-white font-bold">Устьянский Хаб & ИП Ковалев</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Территориальное право:</span>
                    <span className="text-white font-bold">Вельский район полностью</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Статус соглашения:</span>
                    <span className="text-emerald-400 font-extrabold uppercase">АКТИВНО И ОПЛАЧЕНО</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => alert("Шаблон лицензионного договора скачивается в формате PDF...")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-750 hover:border-slate-650 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} /> Скачать шаблон договора (.pdf)
                </button>
                <button 
                  onClick={handleRequestExtension}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs shadow-md shadow-purple-900/20 transition-all cursor-pointer"
                >
                  ОТПРАВИТЬ ЗАПРОС НА ПРОДЛЕНИЕ ЛИЦЕНЗИИ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: TEAM MANAGEMENT ================= */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Users className="text-purple-400" /> Команда управления франшизой
                </h2>
                <p className="text-slate-400 text-xs">
                  Управление персоналом, сотрудниками поддержки, модераторами и кураторами добрых дел в вашем районе.
                </p>
              </div>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-900/20 transition-all cursor-pointer self-start sm:self-center"
              >
                <UserPlus size={14} /> {showAddMember ? 'СКРЫТЬ ФОРМУ' : 'ДОБАВИТЬ СОТРУДНИКА'}
              </button>
            </div>

            {/* Add Member Form inline */}
            {showAddMember && (
              <form onSubmit={handleAddMember} className="bg-slate-900 border border-purple-500/20 p-5 rounded-2xl max-w-xl space-y-3 text-xs">
                <h3 className="font-black text-white uppercase text-[11px] text-purple-400">Новый сотрудник команды</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400">ФИО сотрудника <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="Иван Петров"
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Должность в системе</label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-purple-500"
                    >
                      <option value="Управляющий франшизой">Управляющий франшизой</option>
                      <option value="Модератор чатов и заявок">Модератор чатов и заявок</option>
                      <option value="Координатор добрых дел">Координатор добрых дел</option>
                      <option value="Бухгалтер-аналитик">Бухгалтер-аналитик</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400">Номер телефона <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="+7 (999) 000-00-00"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Email адрес <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      placeholder="employee@mail.ru"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs"
                >
                  СОХРАНИТЬ СОТРУДНИКА
                </button>
              </form>
            )}

            {/* Team Members List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map(member => (
                <div key={member.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 hover:border-purple-500/20 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{member.name}</h3>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mt-0.5">
                        {member.role}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Удалить сотрудника"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-slate-500" />
                      <span className="font-mono">{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-slate-500" />
                      <span className="font-mono">{member.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {team.length === 0 && (
              <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                В команде нет зарегистрированных сотрудников. Нажмите кнопку выше, чтобы добавить.
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
