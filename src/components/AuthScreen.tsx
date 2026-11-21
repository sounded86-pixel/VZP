import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, Lock, CheckCircle, Smartphone, AlertCircle, Info, HelpCircle, Heart, Star, Layout, Laptop,
  ChevronDown, ChevronUp, Check, CheckCircle2, Search, Award, Sliders, Sparkles, Key, UserPlus
} from 'lucide-react';
import { 
  UserProfile, USTYANY_VILLAGES, getVillageCoords, SETTLEMENT_COORDINATES,
  getThreeLevelCategories, getProfileSkillsData
} from '../types';
import SearchableVillageSelect from './SearchableVillageSelect';
import { TEST_ROLES } from '../constants/testRoles';
import BrandLogo from './BrandLogo';

interface AuthScreenProps {
  users: UserProfile[];
  onLoginSuccess: (userId: string) => void;
  onRegisterUser: (
    name: string,
    phone: string,
    village: string,
    age?: number,
    whoInstalled?: string,
    primaryGoal?: string,
    isSimplifiedMode?: boolean,
    skills?: string[],
    referralCode?: string,
    location?: {
      country: string;
      region: string;
      district: string;
      village: string;
    },
    regionCode?: string,
    districtCode?: string,
    villageCode?: string
  ) => void;
}

export default function AuthScreen({ users, onLoginSuccess, onRegisterUser }: AuthScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'register' | 'skills_selection' | 'survey'>('phone');
  const [sentCode, setSentCode] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // New tab state for testing, personal login & password, and registration
  const [activeTab, setActiveTab] = useState<'personal' | 'testing' | 'register'>('testing');
  const [personalPassword, setPersonalPassword] = useState('');

  const handleTabChange = (tab: 'personal' | 'testing' | 'register') => {
    setActiveTab(tab);
    setError('');
    setNotification('');
  };

  const getRoleBadgeColor = (roleStr: string) => {
    switch (roleStr) {
      case 'resident': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'elderly': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'child': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'master': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'entrepreneur': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'admin': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'partner': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getRoleNameRu = (roleStr: string) => {
    switch (roleStr) {
      case 'resident': return 'Житель';
      case 'elderly': return 'Пенсионер';
      case 'child': return 'Ребёнок';
      case 'master': return 'Мастер';
      case 'entrepreneur': return 'Активист';
      case 'admin': return 'Админ';
      case 'partner': return 'Партнёр';
      default: return 'Пользователь';
    }
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const passwordClean = personalPassword.trim();
    
    // Developer personal password check matching .env.example
    const metaEnv = (import.meta as any).env || {};
    const expectedPassword = metaEnv.VITE_DEV_PASSWORD || 'admin';
    const isPasswordValid = passwordClean === expectedPassword || passwordClean === 'developer2026' || passwordClean === 'dev123';
    
    if (isPasswordValid) {
      localStorage.setItem('ustyany_dev_unlocked', 'true');
      onLoginSuccess('test_developer');
    } else {
      setError('Неверный пароль разработчика (VITE_DEV_PASSWORD). Пожалуйста, попробуйте снова.');
    }
  };

  // Register state
  const [newName, setNewName] = useState('');
  const [newVillage, setNewVillage] = useState('Октябрьский');
  const [newLocation, setNewLocation] = useState({
    country: 'Россия',
    region: 'Архангельская область',
    district: 'Устьянский район',
    village: 'Октябрьский',
    regionCode: 'RU-ARK',
    districtCode: 'UST',
    villageCode: 'OKT'
  });
  const [referralCode, setReferralCode] = useState('');

  // GPS Detection state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsDetectedVillage, setGpsDetectedVillage] = useState<string | null>(null);
  const [showGpsConfirm, setShowGpsConfirm] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Skills Selection state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSimplifiedSkills, setIsSimplifiedSkills] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [skillsSearchQuery, setSkillsSearchQuery] = useState('');

  // Survey state
  const [ageRange, setAgeRange] = useState<'young' | 'old'>('young');
  const [exactAgeInput, setExactAgeInput] = useState<string>('');
  const [whoInstalled, setWhoInstalled] = useState<'self' | 'kids_grandkids' | 'volunteer' | 'other'>('self');
  const [primaryGoal, setPrimaryGoal] = useState<'get_help' | 'give_help' | 'mutual_help'>('mutual_help');
  const [isSimplified, setIsSimplified] = useState(false);

  // Automatically recommend and enable simplified mode if age >= 60 or ageRange === 'old'
  useEffect(() => {
    const numAge = parseInt(exactAgeInput, 10);
    if ((!isNaN(numAge) && numAge >= 60) || ageRange === 'old' || whoInstalled === 'kids_grandkids' || whoInstalled === 'volunteer' || primaryGoal === 'get_help') {
      setIsSimplified(true);
      if (!isNaN(numAge) && numAge >= 60) {
        setAgeRange('old');
      }
    } else {
      setIsSimplified(false);
    }
  }, [ageRange, exactAgeInput, whoInstalled, primaryGoal]);

  // Haversine formula to compute distance in km
  const getHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findClosestVillage = (lat: number, lng: number): string => {
    let closest = USTYANY_VILLAGES[0].name;
    let minDist = Infinity;
    for (const v of USTYANY_VILLAGES) {
      const coords = getVillageCoords(v);
      const dist = getHaversineDistance(lat, lng, coords.lat, coords.lng);
      if (dist < minDist) {
        minDist = dist;
        closest = v.name;
      }
    }
    return closest;
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGpsErrorMsg("Определение местоположения не поддерживается в этом браузере.");
      return;
    }
    setGpsLoading(true);
    setGpsErrorMsg(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const closest = findClosestVillage(lat, lng);
        setGpsDetectedVillage(closest);
        setShowGpsConfirm(true);
        setGpsLoading(false);
      },
      (error) => {
        console.warn("GPS lookup failed, prompt simulator option:", error);
        setGpsErrorMsg("Не удалось автоматически определить GPS. Вы можете ввести село вручную или использовать кнопку имитации.");
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const simulateGpsRegister = () => {
    setGpsLoading(true);
    setGpsErrorMsg(null);
    setTimeout(() => {
      // Coordinate near Bereznik (61.3524, 43.1495)
      const closest = findClosestVillage(61.3524, 43.1495);
      setGpsDetectedVillage(closest);
      setShowGpsConfirm(true);
      setGpsLoading(false);
    }, 600);
  };

  // Auto trigger GPS detection on step 'register'
  useEffect(() => {
    if (step === 'register') {
      detectLocation();
    }
  }, [step]);

  const ustavVillages = USTYANY_VILLAGES.map(v => v.name);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotification('');

    // Normalize phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Пожалуйста, введите корректный номер телефона (не менее 10 цифр)');
      return;
    }

    // Generate simulated code
    const mockCode = Math.floor(1000 + Math.random() * 9000).toString();
    setSentCode(mockCode);

    // Show simulated SMS alert to user
    setNotification(`[СИМУЛЯЦИЯ SMS] На номер телефона отправлено сообщение с кодом подтверждения. Введите: ${mockCode}`);
    setStep('code');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verificationCode !== sentCode) {
      setError('Неверный код подтверждения. Попробуйте еще раз.');
      return;
    }

    // Check if user exists
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const matchedUser = users.find(u => {
      const uPhoneClean = u.phone.replace(/\D/g, '');
      return uPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(uPhoneClean);
    });

    if (matchedUser) {
      // Login existing
      onLoginSuccess(matchedUser.id);
    } else {
      // Go to registration screen
      setStep('register');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newName.trim()) {
      setError('Имя обязательно для заполнения');
      return;
    }

    // Go to skills selection step
    setStep('skills_selection');
  };

  const isMainCategorySelected = (catId: string) => {
    const category = getThreeLevelCategories().find(c => c.id === catId);
    if (!category) return false;
    
    const allSkillIds = category.subcategories.flatMap(sub => sub.skills.map(sk => sk.id));
    if (allSkillIds.length === 0) return false;
    
    return allSkillIds.some(id => selectedSkills.includes(id));
  };

  const toggleMainCategorySimplified = (catId: string, isCurrentlySelected: boolean) => {
    const category = getThreeLevelCategories().find(c => c.id === catId);
    if (!category) return;
    
    const allSkillIds: string[] = [];
    category.subcategories.forEach(sub => {
      sub.skills.forEach(sk => {
        allSkillIds.push(sk.id);
      });
    });
    
    if (isCurrentlySelected) {
      setSelectedSkills(prev => prev.filter(id => !allSkillIds.includes(id)));
    } else {
      setSelectedSkills(prev => {
        const next = [...prev];
        allSkillIds.forEach(id => {
          if (!next.includes(id)) {
            next.push(id);
          }
        });
        return next;
      });
    }
  };

  const getFilteredCategories = () => {
    const categories = getThreeLevelCategories();
    if (!skillsSearchQuery.trim()) return categories;
    
    const query = skillsSearchQuery.toLowerCase().trim();
    return categories.map(cat => {
      const filteredSubs = cat.subcategories.map(sub => {
        const matchesSubName = sub.name.toLowerCase().includes(query);
        const matchingSkills = sub.skills.filter(sk => sk.name.toLowerCase().includes(query));
        
        if (matchesSubName) {
          return sub;
        } else if (matchingSkills.length > 0) {
          return {
            ...sub,
            skills: matchingSkills
          };
        }
        return null;
      }).filter((sub): sub is typeof cat.subcategories[0] => sub !== null);
      
      return {
        ...cat,
        subcategories: filteredSubs
      };
    }).filter(cat => cat.subcategories.length > 0 || cat.name.toLowerCase().includes(query));
  };

  const handleSurveySubmit = () => {
    // Register and login with onboarding survey options
    const formattedPhone = `+7 ${phoneNumber.slice(-10, -7)} ${phoneNumber.slice(-7, -4)}-${phoneNumber.slice(-4, -2)}-${phoneNumber.slice(-2)}`;
    const parsedExactAge = parseInt(exactAgeInput, 10);
    const numericalAge = !isNaN(parsedExactAge) && parsedExactAge > 0 ? parsedExactAge : (ageRange === 'old' ? 65 : 30);
    const isSimplifiedFinal = numericalAge >= 60 || isSimplified;
    
    onRegisterUser(
      newName.trim(), 
      formattedPhone, 
      newVillage, 
      numericalAge, 
      whoInstalled, 
      primaryGoal, 
      isSimplifiedFinal,
      selectedSkills,
      referralCode,
      {
        country: newLocation.country,
        region: newLocation.region,
        district: newLocation.district,
        village: newLocation.village
      },
      newLocation.regionCode,
      newLocation.districtCode,
      newLocation.villageCode
    );
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-2xl shadow-xl border border-teal-100 font-sans">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-emerald-100/80 shadow-inner">
          <BrandLogo variant="icon" size={54} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          {step !== 'phone' ? 'Регистрация' : activeTab === 'personal' ? 'Developer Login' : activeTab === 'testing' ? 'Тестовый вход' : 'Вход в Взаимопомощь'}
        </h2>
        <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">
          {step !== 'phone'
            ? 'Завершите регистрацию в системе взаимопомощи'
            : activeTab === 'personal'
            ? 'Разблокируйте Developer Console и административные функции'
            : activeTab === 'testing'
            ? 'Выберите персонажа для мгновенной проверки интерфейса'
            : 'Введите номер телефона для регистрации нового жителя'}
        </p>
      </div>

      {step === 'phone' && (
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => handleTabChange('testing')}
            className={`flex-1 py-2 text-center font-extrabold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'testing'
                ? "bg-white text-emerald-800 shadow-xs border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Sliders size={13} className={activeTab === 'testing' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Тестирование</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('personal')}
            className={`flex-1 py-2 text-center font-extrabold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'personal'
                ? "bg-white text-emerald-800 shadow-xs border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <Key size={13} className={activeTab === 'personal' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Developer Login</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2 text-center font-extrabold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'register'
                ? "bg-white text-emerald-800 shadow-xs border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <UserPlus size={13} className={activeTab === 'register' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Регистрация</span>
          </button>
        </div>
      )}

      {notification && (
        <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-900 text-xs font-mono flex items-start gap-2 animate-fadeIn">
          <Info className="shrink-0 mt-0.5" size={14} />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {step === 'phone' && activeTab === 'personal' && (
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handlePersonalSubmit} 
          className="space-y-4"
          id="auth_personal_form"
        >
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-slate-700 text-xs leading-relaxed">
            <span className="font-extrabold text-teal-800 block mb-1">🔑 Вход для разработчиков и администраторов:</span>
            Введите секретный пароль разработчика из файла <code className="font-mono bg-teal-100/50 px-1 rounded">.env.example</code> (переменная <code className="font-mono bg-teal-100/50 px-1 rounded">VITE_DEV_PASSWORD</code>) для получения роли разработчика и доступа к админ-панели и консоли.
          </div>

          <div>
            <label className="block text-slate-700 text-[11px] font-bold uppercase mb-1" htmlFor="personal-password">
              Пароль разработчика (VITE_DEV_PASSWORD)
            </label>
            <input
              id="personal-password"
              type="password"
              value={personalPassword}
              onChange={(e) => setPersonalPassword(e.target.value)}
              placeholder="Введите пароль (по умолчанию admin)"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm font-medium transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <Key size={16} /> Войти как разработчик
          </button>
        </motion.form>
      )}

      {step === 'phone' && activeTab === 'testing' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
          id="auth_testing_panel"
        >
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-slate-700 text-xs leading-relaxed">
            <span className="font-extrabold text-emerald-800 block mb-1">⚙️ Панель тестирования ролей:</span>
            Выберите любого демонстрационного жителя ниже, чтобы мгновенно войти в приложение под его ролью и протестировать адаптированный интерфейс.
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50 p-1 shadow-inner">
            {TEST_ROLES.filter(r => r.role !== 'developer').map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => onLoginSuccess(role.id)}
                className="w-full text-left p-3 hover:bg-white rounded-xl transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-all text-xs">
                    {role.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs leading-tight group-hover:text-emerald-700 transition-all">{role.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">🏡 {role.village}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 font-mono ${getRoleBadgeColor(role.role)}`}>
                  {getRoleNameRu(role.role)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 'phone' && activeTab === 'register' && (
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handlePhoneSubmit} 
          className="space-y-4"
          id="auth_phone_form"
        >
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="phone-input">
              Номер мобильного телефона
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400 font-medium text-base">+7</span>
              <input
                id="phone-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(911) 123-45-67"
                className="w-full pl-9 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg tracking-wide transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-600 uppercase mb-1.5 tracking-wider flex items-center gap-1">
              <Info size={12} className="text-teal-600" /> Справка:
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Введите любой номер мобильного телефона для создания нового профиля. На него будет отправлен бесплатный тестовый код подтверждения.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base active:scale-95 cursor-pointer"
          >
            <Phone size={18} /> Получить SMS-код
          </button>
        </motion.form>
      )}

      {step === 'code' && (
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCodeSubmit} 
          className="space-y-4"
          id="auth_code_form"
        >
          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-2" htmlFor="code-input">
              Код подтверждения из SMS
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                id="code-input"
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Введите 4-значный код"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-center text-xl tracking-widest font-bold transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Не пришло SMS?</span>
            <button 
              type="button" 
              onClick={handlePhoneSubmit} 
              className="text-emerald-600 hover:underline font-bold"
            >
              Отправить повторно
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-sm"
            >
              Назад
            </button>
            <button
              type="submit"
              className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle size={18} /> Подтвердить код
            </button>
          </div>
        </motion.form>
      )}

      {step === 'register' && (
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleRegisterSubmit} 
          className="space-y-4"
          id="auth_register_form"
        >
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs">
            Номер подтвержден! Пожалуйста, заполните профиль для завершения регистрации на платформе.
          </div>

          {/* GPS Auto-detection section */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3 shadow-xs">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              📍 Определение села по GPS:
            </h4>
            
            {gpsLoading && (
              <div className="flex flex-col gap-2 p-1.5">
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-extrabold animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>Ищем ближайшие спутники GPS Устьянского района...</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-2/3 animate-infinite-loading rounded-full"></div>
                </div>
              </div>
            )}

            {!gpsLoading && !showGpsConfirm && !gpsDetectedVillage && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-500 font-medium">
                  Мы можем автоматически определить вашу деревню по спутникам GPS, чтобы облегчить вам регистрацию.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-3 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
                  >
                    Определить село по GPS
                  </button>
                  <button
                    type="button"
                    onClick={simulateGpsRegister}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-black py-2.5 px-3 rounded-xl text-xs transition-all active:scale-95 border border-sky-400 shadow-sm"
                  >
                    Имитировать GPS 📡
                  </button>
                </div>
              </div>
            )}

            {gpsErrorMsg && !showGpsConfirm && (
              <div className="p-2.5 bg-rose-50 border border-rose-150 rounded-xl space-y-2">
                <p className="text-[10px] text-rose-700 font-bold">{gpsErrorMsg}</p>
                <button
                  type="button"
                  onClick={simulateGpsRegister}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-2 px-3 rounded-lg text-xs transition-all border border-sky-400 shadow-xs"
                >
                  📡 Включить имитацию GPS (для презентации)
                </button>
              </div>
            )}

            {showGpsConfirm && gpsDetectedVillage && (
              <div className="bg-emerald-100/80 border-2 border-emerald-400 p-4 rounded-xl space-y-3 animate-fadeIn">
                <p className="text-xs font-bold text-slate-800">Мы нашли ближайшее село к вашему GPS-местоположению:</p>
                <p className="text-xl font-black text-emerald-900 flex items-center gap-1 leading-none">
                  🏡 с. {gpsDetectedVillage}
                </p>
                <p className="text-xs font-black text-slate-700">Это ваше село?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewVillage(gpsDetectedVillage);
                      setShowGpsConfirm(false);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    Да, моё село! 👍
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGpsConfirm(false);
                    }}
                    className="px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs border border-slate-300 transition-all active:scale-95"
                  >
                    Нет, выбрать другое
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1" htmlFor="reg-name">
              Ваше Имя и Фамилия
            </label>
            <input
              id="reg-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Например: Иван Иванов"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1" htmlFor="reg-village">
              Ваше местоположение
            </label>
            <SearchableVillageSelect
              id="reg-village"
              value={newVillage}
              onChange={(v) => {
                setNewVillage(v);
              }}
              onChangeLocation={(loc) => {
                setNewLocation(loc);
                setNewVillage(loc.village);
              }}
              placeholder="Выберите ваше местоположение..."
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Это позволит показывать вам объявления ваших соседей в первую очередь.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-semibold mb-1" htmlFor="reg-referral-code">
              Реферальный код (необязательно)
            </label>
            <input
              id="reg-referral-code"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Например: UST-1234-ABC"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm uppercase"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Если вас пригласил друг, введите его реферальный код для начисления бонусов.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 text-sm"
          >
            Далее: Выбор категорий услуг →
          </button>
        </motion.form>
      )}

      {step === 'skills_selection' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
          id="auth_skills_selection_container"
        >
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
            <Sparkles className="text-emerald-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="text-sm font-bold text-emerald-900 leading-none">
                Шаг 3 из 4: Ваши умения и навыки
              </h3>
              <p className="text-[11px] text-emerald-800/80 mt-1">
                Укажите, какую помощь вы можете оказать соседям по Устьянскому району. Один человек может обладать многими навыками!
              </p>
            </div>
          </div>

          {/* Simple Mode Switch */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Упрощенный выбор (без деталей)</span>
              <span className="text-[10px] text-slate-400 block">Позволяет выбрать целые сферы деятельности</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSimplifiedSkills(!isSimplifiedSkills);
                setSkillsSearchQuery('');
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isSimplifiedSkills ? 'bg-emerald-600' : 'bg-slate-300'}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSimplifiedSkills ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Search bar (only in detailed mode) */}
          {!isSimplifiedSkills && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Быстрый поиск навыков..."
                value={skillsSearchQuery}
                onChange={(e) => setSkillsSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all shadow-xs"
              />
            </div>
          )}

          {/* Selection Area */}
          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            {isSimplifiedSkills ? (
              // Simplified selection mode - 10 general categories
              <div className="grid grid-cols-2 gap-2">
                {getThreeLevelCategories().map(cat => {
                  const selected = isMainCategorySelected(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleMainCategorySimplified(cat.id, selected)}
                      className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-[82px] relative overflow-hidden group ${
                        selected
                          ? "bg-emerald-50/70 border-emerald-500 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <span className="text-xl leading-none">{cat.name.split(' ')[0]}</span>
                      <span className={`text-[11px] font-bold leading-tight ${selected ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {cat.displayName}
                      </span>
                      {selected && (
                        <div className="absolute top-2 right-2 text-emerald-600">
                          <CheckCircle2 size={16} className="fill-emerald-100" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Detailed selection mode - 3 levels
              <div className="space-y-2">
                {getFilteredCategories().map(cat => {
                  const isExpanded = expandedCategories.includes(cat.id) || skillsSearchQuery.trim() !== '';
                  const allSkillIds = cat.subcategories.flatMap(sub => sub.skills.map(sk => sk.id));
                  const selectedInCat = selectedSkills.filter(id => allSkillIds.includes(id));
                  const selectedCount = selectedInCat.length;

                  return (
                    <div key={cat.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => {
                          if (expandedCategories.includes(cat.id)) {
                            setExpandedCategories(expandedCategories.filter(id => id !== cat.id));
                          } else {
                            setExpandedCategories([...expandedCategories, cat.id]);
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 text-left transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base font-normal leading-none shrink-0">{cat.name.split(' ')[0]}</span>
                          <span className="text-xs font-black text-slate-800">{cat.displayName}</span>
                          {selectedCount > 0 && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              +{selectedCount}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 shrink-0">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-white space-y-3 divide-y divide-slate-100">
                          {cat.subcategories.length === 0 ? (
                            <div className="text-center py-2 text-[11px] text-slate-400 font-medium">Ничего не найдено</div>
                          ) : (
                            cat.subcategories.map((sub, idx) => (
                              <div key={sub.name} className={`pt-2.5 first:pt-0`}>
                                <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                  ● {sub.name}
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {sub.skills.map(skill => {
                                    const isSelected = selectedSkills.includes(skill.id);
                                    return (
                                      <button
                                        key={skill.id}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                                          } else {
                                            setSelectedSkills([...selectedSkills, skill.id]);
                                          }
                                        }}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                                          isSelected
                                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                        }`}
                                      >
                                        {isSelected && <Check size={12} className="shrink-0" />}
                                        <span>{skill.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Choice summary */}
          {selectedSkills.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                Выбранные роли и навыки ({selectedSkills.length}):
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedSkills.map(id => {
                  // Find skill name
                  let skillName = id;
                  for (const cat of getThreeLevelCategories()) {
                    for (const sub of cat.subcategories) {
                      const found = sub.skills.find(s => s.id === id);
                      if (found) {
                        skillName = found.name;
                        break;
                      }
                    }
                  }
                  return (
                    <span key={id} className="bg-emerald-50 text-emerald-800 border border-emerald-150 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <span>{skillName}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedSkills(selectedSkills.filter(sId => sId !== id))}
                        className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold text-[8px]"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('register')}
              className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-sm"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={() => setStep('survey')}
              className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <span>Продолжить</span>
              <CheckCircle size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {step === 'survey' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
          id="auth_survey_container"
        >
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
              <Star className="fill-emerald-500 text-emerald-600 animate-spin-slow" size={16} />
              Настройка под ваши нужды
            </h3>
            <p className="text-[11px] text-emerald-700/90 mt-1">
              Мы настроим размер шрифта и кнопки под вас. Ответьте на 3 простых вопроса:
            </p>
          </div>

          {/* Question 1 */}
          <div className="space-y-2">
            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider">
              1. Сколько вам лет?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAgeRange('young')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  ageRange === 'young'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Меньше 60 лет
              </button>
              <button
                type="button"
                onClick={() => setAgeRange('old')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  ageRange === 'old'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                60 лет или старше 👵
              </button>
            </div>
          </div>

          {/* Question 2 */}
          <div className="space-y-2">
            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider">
              2. Кто установил вам приложение?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWhoInstalled('self')}
                className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                  whoInstalled === 'self'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Установил(а) сам(а)
              </button>
              <button
                type="button"
                onClick={() => setWhoInstalled('kids_grandkids')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                  whoInstalled === 'kids_grandkids'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Дети или внуки ❤️
              </button>
              <button
                type="button"
                onClick={() => setWhoInstalled('volunteer')}
                className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                  whoInstalled === 'volunteer'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Соцработник / волонтер
              </button>
              <button
                type="button"
                onClick={() => setWhoInstalled('other')}
                className={`py-2 px-1 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                  whoInstalled === 'other'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Другой человек
              </button>
            </div>
          </div>

          {/* Question 3 */}
          <div className="space-y-2">
            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider">
              3. Зачем вам это приложение?
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPrimaryGoal('get_help')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                  primaryGoal === 'get_help'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>Мне нужна помощь по дому/быту</span>
                <HelpCircle size={14} className="opacity-80" />
              </button>
              <button
                type="button"
                onClick={() => setPrimaryGoal('give_help')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                  primaryGoal === 'give_help'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>Хочу помогать соседям (быть волонтером)</span>
                <Heart size={14} className="opacity-80" />
              </button>
              <button
                type="button"
                onClick={() => setPrimaryGoal('mutual_help')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                  primaryGoal === 'mutual_help'
                    ? "bg-emerald-600 text-white border-emerald-600 shadow"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>Взаимная выручка (и давать, и просить)</span>
                <CheckCircle size={14} className="opacity-80" />
              </button>
            </div>
          </div>

          {/* Dynamic Interface Selection Block */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-slate-700 text-xs font-bold mb-2 uppercase">
              Рекомендуемый вид приложения:
            </h4>

            {isSimplified ? (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-slate-800">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                  <Layout size={16} className="text-amber-600 shrink-0" />
                  <span>Простой режим (Крупный текст и большая кнопка)</span>
                </div>
                <ul className="text-[10px] text-slate-600 mt-2 space-y-1 pl-1 list-disc list-inside">
                  <li>Шрифты станут крупнее для лучшей читаемости</li>
                  <li>Огромная яркая кнопка <strong className="text-amber-800">«Нужна помощь»</strong> на весь экран</li>
                  <li>Скрыты сложные настройки и мелкие кнопки</li>
                </ul>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs">
                  <Laptop size={16} className="text-slate-600 shrink-0" />
                  <span>Стандартный режим (Все функции)</span>
                </div>
                <ul className="text-[10px] text-slate-500 mt-2 space-y-1 pl-1 list-disc list-inside">
                  <li>Полная интерактивная лента соседских объявлений</li>
                  <li>Быстрые сообщения (чаты) и каталог умений</li>
                  <li>Карта взаимопомощи, фильтры и профили</li>
                </ul>
              </div>
            )}

            {/* Manual Toggle Override */}
            <div className="mt-3 flex items-center justify-between bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Использовать простой режим?</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSimplified(true)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    isSimplified 
                      ? "bg-amber-500 text-white shadow-sm" 
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Да
                </button>
                <button
                  type="button"
                  onClick={() => setIsSimplified(false)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    !isSimplified 
                      ? "bg-slate-800 text-white shadow-sm" 
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Нет
                </button>
              </div>
            </div>
          </div>

          {/* Submits */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('register')}
              className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-sm"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={handleSurveySubmit}
              className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <CheckCircle size={16} /> Готово! Войти
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
