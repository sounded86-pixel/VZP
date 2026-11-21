import React, { useState, useEffect } from 'react';
import { 
  UserProfile, getThreeLevelCategories, getProfileSkillsData 
} from '../types';
import { 
  User, Phone, MapPin, Award, Star, Save, LogOut, Settings, Palette,
  CheckCircle2, ChevronRight, Check, Search, Smartphone, Heart, Sparkles
} from 'lucide-react';
import SearchableVillageSelect from './SearchableVillageSelect';
import { getUserRankInfo, RANKS } from '../utils/thanksHelper';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onStartDirectChat?: (targetUser: UserProfile) => void;
  onOpenGitHubExport?: () => void;
  onNavigate?: (screen: string) => void;
}

export default function ProfileScreen({ 
  user, 
  onUpdateProfile, 
  onLogout,
  onNavigate
}: ProfileScreenProps) {
  const [name, setName] = useState(user.name);
  const [village, setVillage] = useState(user.village || 'Октябрьский');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user.skills || []);
  const [isSimplifiedMode, setIsSimplifiedMode] = useState(user.isSimplifiedMode || false);
  const [isSaved, setIsSaved] = useState(false);
  const [skillsSearchQuery, setSkillsSearchQuery] = useState('');

  // Active tab: 'profile' (view rating, ranks, info) | 'edit' (settings form)
  const [activeTab, setActiveTab] = useState<'profile' | 'edit'>('profile');

  // Theme Customizer States
  const [themePreference, setThemePreference] = useState<'classic' | 'village' | 'child' | 'dark' | 'minimal' | 'eco' | 'elderly'>(
    (user.preferences?.theme as any) || (localStorage.getItem('theme_preference') as any) || 'classic'
  );

  const thanksCount = user.thanksCount ?? (user.rating?.thanks ?? 0);
  const rankInfo = getUserRankInfo(thanksCount);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsData = getProfileSkillsData(selectedSkills);

    onUpdateProfile({
      name: name.trim() || user.name,
      village: village || user.village,
      skills: selectedSkills,
      roles: skillsData.roles,
      categories: skillsData.categories,
      skillNames: skillsData.skillNames,
      isSimplifiedMode,
      preferences: {
        ...user.preferences,
        theme: themePreference
      }
    });

    localStorage.setItem('theme_preference', themePreference);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setActiveTab('profile');
    }, 1500);
  };

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const categories = getThreeLevelCategories();

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 animate-fadeIn" id="profile_screen">
      {/* Save Toast Notification */}
      {isSaved && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-black text-xs py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>Профиль успешно сохранен!</span>
        </div>
      )}

      {/* Main Profile Header Card according to TZ 3.4 */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-slate-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-3xl font-black flex items-center justify-center shadow-md shrink-0">
            {name ? name.charAt(0).toUpperCase() : "В"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {name || "Житель района"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                {rankInfo.rank}
              </span>
            </div>

            {/* Village & Phone */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs sm:text-sm font-bold text-slate-600">
              <span className="inline-flex items-center gap-1">
                <MapPin size={15} className="text-emerald-600" />
                <span>{village}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 font-mono text-slate-500">
                <Phone size={13} />
                <span>{user.phone || "Телефон не указан"}</span>
              </span>
            </div>

            {/* Free Status */}
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                ✓ Бесплатный аккаунт жителя
              </span>
            </div>
          </div>
        </div>

        {/* Tab switch: Профиль / Настройки */}
        <div className="grid grid-cols-2 gap-2 mt-6 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⭐ Мой рейтинг и звания
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-2 px-3 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚙️ Редактировать профиль
          </button>
        </div>

        {/* Help & FAQ Quick Link */}
        {onNavigate && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500 font-bold">Возник вопрос по работе приложения?</span>
            <button
              type="button"
              onClick={() => onNavigate('faq')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-black transition-all cursor-pointer border border-teal-200"
            >
              <span>❓ Помощь и FAQ</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: RATING & RANKS */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Rating «Спасибо» Banner */}
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-6 shadow-md border border-amber-400/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-100 flex items-center gap-1">
                  <Star size={14} className="fill-amber-200" />
                  Рейтинг добрых дел
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {thanksCount} «Спасибо»
                </div>
                <p className="text-xs text-amber-100 mt-1 max-w-sm">
                  Благодарности начисляются соседями за каждую оказанную помощь и доброе дело.
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center sm:text-right shrink-0">
                <span className="text-[10px] font-bold text-amber-200 uppercase block">Текущий уровень</span>
                <span className="text-base font-black text-white block mt-0.5">{rankInfo.rank}</span>
                {rankInfo.nextRank && (
                  <span className="text-[11px] text-amber-100 block mt-1">
                    До {rankInfo.nextRank.rank}: <strong>{rankInfo.pointsNeeded} «Спасибо»</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar to next rank */}
            {rankInfo.nextRank && (
              <div className="mt-5 pt-4 border-t border-white/20">
                <div className="flex justify-between text-[11px] font-bold text-amber-100 mb-1.5">
                  <span>Прогресс до звания {rankInfo.nextRank.rank}</span>
                  <span>{rankInfo.progressPercent}%</span>
                </div>
                <div className="w-full bg-black/25 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${rankInfo.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* All Titles / Звания list */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Award className="text-emerald-600" size={20} />
              <h3 className="text-base font-black text-slate-900">
                Таблица званий взаимопомощи
              </h3>
            </div>

            <div className="space-y-2.5">
              {RANKS.map((r) => {
                const isCurrent = r.level === rankInfo.level;
                const isPassed = thanksCount >= r.minPoints;

                return (
                  <div
                    key={r.level}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                        : isPassed
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50/60 border-slate-200/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        isCurrent 
                          ? 'bg-amber-500 text-white shadow-sm'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {r.level}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-900">{r.rank}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                              Ваше звание
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {r.maxPoints === Infinity ? `от ${r.minPoints} «Спасибо»` : `от ${r.minPoints} до ${r.maxPoints} «Спасибо»`}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isPassed ? (
                        <span className="text-emerald-600 font-black text-sm">✓ Получено</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">Закрыто</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats on good deeds */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
              <span className="text-2xl font-black text-emerald-700">{user.createdCount || 0}</span>
              <p className="text-xs font-bold text-slate-500 mt-1">Опубликовано просьб</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
              <span className="text-2xl font-black text-teal-700">{user.resolvedCount || 0}</span>
              <p className="text-xs font-bold text-slate-500 mt-1">Решено добрых дел</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EDIT PROFILE SETTINGS */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Settings size={18} className="text-emerald-600" />
              Основные данные жителя
            </h3>

            {/* Name Input */}
            <div>
              <label className="block text-slate-700 text-xs font-black uppercase mb-1.5">
                Ваше Имя и Фамилия
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут?"
                required
                className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm font-bold"
              />
            </div>

            {/* Village Selector */}
            <div>
              <label className="block text-slate-700 text-xs font-black uppercase mb-1.5">
                Населённый пункт (село / деревня)
              </label>
              <SearchableVillageSelect
                value={village}
                onChange={(v) => setVillage(v)}
                placeholder="Выберите ваше село..."
              />
            </div>

            {/* Simplified Mode Toggle */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-amber-950 block">👵 Крупный шрифт и простой вид</span>
                <span className="text-[11px] text-amber-800 block mt-0.5">
                  Увеличивает размер текста и кнопок для удобства чтения пожилыми людьми
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSimplifiedMode(!isSimplifiedMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  isSimplifiedMode
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-300'
                }`}
              >
                {isSimplifiedMode ? 'Включен' : 'Выключен'}
              </button>
            </div>
          </div>

          {/* Skills and help offerings */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Heart size={18} className="text-rose-500" />
                Чем вы можете помочь соседям?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Отметьте ваши умения, чтобы односельчане знали, по каким вопросам к вам можно обратиться по-соседски.
              </p>
            </div>

            {/* Skill categories */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div key={cat.id} className="border border-slate-200 rounded-2xl p-3 bg-slate-50/40">
                  <span className="text-xs font-black text-slate-800 block mb-2">
                    {cat.name}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.flatMap(s => s.skills).map((sk) => {
                      const isSelected = selectedSkills.includes(sk.id);
                      return (
                        <button
                          key={sk.id}
                          type="button"
                          onClick={() => toggleSkill(sk.id)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{sk.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-black text-rose-600 hover:underline flex items-center gap-1 cursor-pointer py-2"
            >
              <LogOut size={14} /> Выйти из аккаунта
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Save size={16} /> Сохранить изменения
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
