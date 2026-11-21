import React from 'react';
import { 
  Leaf, MapPin, CheckCircle2, ArrowLeft, Clock, Phone, Battery, ShieldCheck, Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface EcologyScreenProps {
  currentUser: UserProfile;
  onBack: () => void;
  isOffline?: boolean;
}

export default function EcologyScreen({ currentUser, onBack }: EcologyScreenProps) {
  // Static verified battery collection locations in Ustyany district
  const batteryPoints = [
    {
      id: 'point_okt_1',
      title: 'Районный Дворец Культуры (РДК)',
      village: 'п. Октябрьский',
      address: 'ул. Заводская, д. 17 (холл 1 этажа, эко-бокс)',
      hours: 'Пн-Пт 09:00 - 18:00',
      types: ['Пальчиковые батарейки (AA, AAA)', 'Круглые батарейки-таблетки', 'Аккумуляторы от телефонов'],
      phone: '+7 (81855) 5-12-34'
    },
    {
      id: 'point_okt_2',
      title: 'Центральная библиотека Устьян',
      village: 'п. Октябрьский',
      address: 'ул. Комсомольская, д. 24',
      hours: 'Вт-Сб 10:00 - 18:00',
      types: ['Батарейки AA, AAA, C, D', 'Батарейки для часов и слуховых аппаратов'],
      phone: '+7 (81855) 5-21-45'
    },
    {
      id: 'point_shang_1',
      title: 'Сельский Дом Культуры с. Шангалы',
      village: 'с. Шангалы',
      address: 'ул. Ленина, д. 42 (стойка у входа)',
      hours: 'Пн-Пт 10:00 - 17:00',
      types: ['Бытовые батарейки всех типов'],
      phone: '+7 (81855) 4-11-20'
    },
    {
      id: 'point_berez_1',
      title: 'Администрация МО «Березницкое»',
      village: 'с. Березник',
      address: 'ул. Центральная, д. 8 (специальный контейнер)',
      hours: 'Пн-Пт 08:30 - 16:30',
      types: ['Батарейки бытовые', 'Аккумуляторы мелкой электроники'],
      phone: '+7 (81855) 3-15-50'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 animate-fadeIn" id="ecology_screen">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-all font-bold mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Назад на главную</span>
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-emerald-700/50 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 rounded-xl bg-white/10 text-emerald-200">
            <Battery size={24} />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
            Экология и чистота села
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Куда сдать батарейки в районе
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-2 leading-relaxed">
          Одна выброшенная батарейка загрязняет до 20 квадратных метров лесной почвы и около 400 литров грунтовых вод. Сдавайте их в специальные контейнеры!
        </p>
      </div>

      {/* Verified points list */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
          <MapPin size={18} className="text-emerald-600" />
          Действующие пункты сбора батареек:
        </h3>

        {batteryPoints.map((pt) => (
          <div key={pt.id} className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="font-black text-slate-900 text-base">
                {pt.title}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                {pt.village}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>{pt.address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400 shrink-0" />
                <span>{pt.hours}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400 shrink-0" />
                <span>{pt.phone}</span>
              </p>
            </div>

            {/* Types accepted */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Что принимается:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {pt.types.map((type, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200">
                    ✓ {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Helpful reminder card */}
      <div className="mt-6 bg-amber-50 rounded-2xl p-5 border border-amber-200 text-amber-950 space-y-2">
        <h4 className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-amber-700" />
          Памятка для жителей:
        </h4>
        <p className="text-xs leading-relaxed text-amber-900">
          Складывайте использованные батарейки в обычную сухую банку или плотный пакет. Когда поедете в Октябрьский, Шангалы или Березник по делам — захватите их с собой и опустите в специальный эко-бокс. Это бесплатно и сохранит природу нашего края!
        </p>
      </div>
    </div>
  );
}
