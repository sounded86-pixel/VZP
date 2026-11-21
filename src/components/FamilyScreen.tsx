import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Heart, Plus, Trash2, CheckCircle2, Award, 
  Smartphone, Bell, Clock, Shield, Star, PlusCircle, 
  PhoneCall, Check, X, ShieldAlert, BookOpen, UserPlus, Zap
} from 'lucide-react';
import { UserProfile } from '../types';

interface FamilyScreenProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onUpdateUser: (userId: string, updated: Partial<UserProfile>) => void;
  onNavigate: (screen: string) => void;
}

export default function FamilyScreen({
  currentUser,
  users,
  onUpdateUser,
  onNavigate
}: FamilyScreenProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [relationType, setRelationType] = useState<'child' | 'grandparent' | 'parent' | 'grandchild'>('child');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  // Custom mock addition states
  const [customName, setCustomName] = useState('');
  const [customAge, setCustomAge] = useState(6);
  const [customPhone, setCustomPhone] = useState('');
  const [isCreatingMock, setIsCreatingMock] = useState(false);

  // Calling simulation state
  const [activeCall, setActiveCall] = useState<{
    targetName: string;
    avatar: string;
    status: 'ringing' | 'connected' | 'ended';
  } | null>(null);

  // New task form state for parents
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskReward, setNewTaskReward] = useState(5);
  const [selectedChildForTask, setSelectedChildForTask] = useState<string>('');

  // Extract family arrays safely
  const familyState = useMemo(() => {
    return currentUser.family || { children: [], parents: [], grandparents: [], grandchildren: [] };
  }, [currentUser.family]);

  // Find related users
  const linkedChildren = useMemo(() => {
    return users.filter(u => familyState.children?.includes(u.id));
  }, [users, familyState.children]);

  const linkedParents = useMemo(() => {
    return users.filter(u => familyState.parents?.includes(u.id));
  }, [users, familyState.parents]);

  const linkedGrandparents = useMemo(() => {
    return users.filter(u => familyState.grandparents?.includes(u.id));
  }, [users, familyState.grandparents]);

  const linkedGrandchildren = useMemo(() => {
    return users.filter(u => familyState.grandchildren?.includes(u.id));
  }, [users, familyState.grandchildren]);

  // Candidates for adding
  const candidates = useMemo(() => {
    const alreadyLinked = [
      currentUser.id,
      ...(familyState.children || []),
      ...(familyState.parents || []),
      ...(familyState.grandparents || []),
      ...(familyState.grandchildren || [])
    ];
    return users.filter(u => !alreadyLinked.includes(u.id));
  }, [users, currentUser.id, familyState]);

  // Handle call simulation
  const startCallSimulation = (name: string) => {
    setActiveCall({
      targetName: name,
      avatar: name[0].toUpperCase(),
      status: 'ringing'
    });

    // Ringing sound synthesis / Speak alert
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Вызов родственника: ${name}`);
      msg.lang = 'ru-RU';
      window.speechSynthesis.speak(msg);
    }

    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 2500);
  };

  const endCall = () => {
    setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
    setTimeout(() => setActiveCall(null), 1000);
  };

  // Add family member
  const handleAddFamilyMember = () => {
    let targetId = selectedUserId;

    // Create a new mock user if requested
    if (isCreatingMock) {
      if (!customName) {
        alert('Пожалуйста, введите имя');
        return;
      }
      const randomId = `mock_family_${Date.now()}`;
      const defaultChildProfile = {
        childName: customName,
        childAge: Number(customAge),
        level: 1,
        stars: 5,
        dobriks: 10,
        achievements: ['Первый шаг 🐾'],
        completedTopics: [],
        completedEcoTasks: [],
        friends: [],
        settings: { bedtime: '21:00', geoRadius: 500, chatEnabled: true, timeLimit: 60 },
        tasks: [
          { id: 't1', description: 'Почистить зубы утром и вечером', reward: 3, isCompleted: false, isApproved: false, createdAt: new Date().toISOString() },
          { id: 't2', description: 'Собрать свои игрушки в коробку', reward: 5, isCompleted: false, isApproved: false, createdAt: new Date().toISOString() }
        ],
        drawings: [],
        calendarEvents: [],
        diaryEntries: [],
        messages: []
      };

      const defaultElderlyProfile = {
        fullName: customName,
        level: 1,
        completedLessons: [],
        stars: 3,
        achievements: ['Добро пожаловать 🌿'],
        volunteerContact: 'Марина Соколова',
        phoneContacts: [{ name: currentUser.name, phone: currentUser.phone, role: 'grandson' as const }],
        learningProgress: [],
        settings: { fontSize: 22, highContrast: false, voiceGuidance: true, audioVolume: 80 }
      };

      const newMockUser: UserProfile = {
        id: randomId,
        name: customName,
        phone: customPhone || `+7-900-${Math.floor(1000000 + Math.random() * 9000000)}`,
        village: currentUser.village,
        skills: [],
        thanksCount: 0,
        createdCount: 0,
        resolvedCount: 0,
        blocked: false,
        reportsCount: 0,
        profileType: relationType === 'child' ? 'child' : relationType === 'grandparent' ? 'pensioner' : 'regular',
        role: relationType === 'child' ? 'child' : relationType === 'grandparent' ? 'grandparent' : 'resident',
        childProfile: relationType === 'child' ? defaultChildProfile : undefined,
        elderlyProfile: relationType === 'grandparent' ? defaultElderlyProfile : undefined,
        family: {
          children: [],
          parents: relationType === 'child' ? [currentUser.id] : [],
          grandparents: [],
          grandchildren: relationType === 'grandparent' ? [currentUser.id] : []
        }
      };

      onUpdateUser(randomId, newMockUser);
      targetId = randomId;
    }

    if (!targetId) {
      alert('Пожалуйста, выберите пользователя');
      return;
    }

    // Bidirectional links update
    const myUpdatedFamily = { ...familyState };
    const relativeUpdate: Partial<UserProfile> = {};

    if (relationType === 'child') {
      myUpdatedFamily.children = [...(myUpdatedFamily.children || []), targetId];
      relativeUpdate.family = {
        children: [],
        parents: [...(users.find(u => u.id === targetId)?.family?.parents || []), currentUser.id],
        grandparents: [],
        grandchildren: []
      };
      relativeUpdate.profileType = 'child';
    } else if (relationType === 'grandparent') {
      myUpdatedFamily.grandparents = [...(myUpdatedFamily.grandparents || []), targetId];
      relativeUpdate.family = {
        children: [],
        parents: [],
        grandparents: [],
        grandchildren: [...(users.find(u => u.id === targetId)?.family?.grandchildren || []), currentUser.id]
      };
      relativeUpdate.profileType = 'pensioner';
    } else if (relationType === 'parent') {
      myUpdatedFamily.parents = [...(myUpdatedFamily.parents || []), targetId];
      relativeUpdate.family = {
        children: [...(users.find(u => u.id === targetId)?.family?.children || []), currentUser.id],
        parents: [],
        grandparents: [],
        grandchildren: []
      };
    } else if (relationType === 'grandchild') {
      myUpdatedFamily.grandchildren = [...(myUpdatedFamily.grandchildren || []), targetId];
      relativeUpdate.family = {
        children: [],
        parents: [],
        grandparents: [...(users.find(u => u.id === targetId)?.family?.grandparents || []), currentUser.id],
        grandchildren: []
      };
    }

    // Update current user
    onUpdateUser(currentUser.id, { family: myUpdatedFamily });
    
    // Update target user
    if (!isCreatingMock) {
      onUpdateUser(targetId, relativeUpdate);
    }

    // Reset states
    setShowAddModal(false);
    setSelectedUserId('');
    setCustomName('');
    setCustomPhone('');
    setIsCreatingMock(false);
  };

  // Delete family bond
  const handleRemoveFamilyMember = (targetId: string, type: 'child' | 'grandparent' | 'parent' | 'grandchild') => {
    if (!confirm('Вы действительно хотите удалить связь с этим родственником?')) return;

    const myUpdatedFamily = { ...familyState };
    const relativeUpdate: Partial<UserProfile> = {};

    if (type === 'child') {
      myUpdatedFamily.children = (myUpdatedFamily.children || []).filter(id => id !== targetId);
      relativeUpdate.family = {
        ...(users.find(u => u.id === targetId)?.family || { children: [], parents: [], grandparents: [], grandchildren: [] }),
        parents: (users.find(u => u.id === targetId)?.family?.parents || []).filter(id => id !== currentUser.id)
      };
    } else if (type === 'grandparent') {
      myUpdatedFamily.grandparents = (myUpdatedFamily.grandparents || []).filter(id => id !== targetId);
      relativeUpdate.family = {
        ...(users.find(u => u.id === targetId)?.family || { children: [], parents: [], grandparents: [], grandchildren: [] }),
        grandchildren: (users.find(u => u.id === targetId)?.family?.grandchildren || []).filter(id => id !== currentUser.id)
      };
    } else if (type === 'parent') {
      myUpdatedFamily.parents = (myUpdatedFamily.parents || []).filter(id => id !== targetId);
      relativeUpdate.family = {
        ...(users.find(u => u.id === targetId)?.family || { children: [], parents: [], grandparents: [], grandchildren: [] }),
        children: (users.find(u => u.id === targetId)?.family?.children || []).filter(id => id !== currentUser.id)
      };
    } else if (type === 'grandchild') {
      myUpdatedFamily.grandchildren = (myUpdatedFamily.grandchildren || []).filter(id => id !== targetId);
      relativeUpdate.family = {
        ...(users.find(u => u.id === targetId)?.family || { children: [], parents: [], grandparents: [], grandchildren: [] }),
        grandparents: (users.find(u => u.id === targetId)?.family?.grandparents || []).filter(id => id !== currentUser.id)
      };
    }

    onUpdateUser(currentUser.id, { family: myUpdatedFamily });
    onUpdateUser(targetId, relativeUpdate);
  };

  // Parent task assignment
  const handleAssignTask = (childId: string) => {
    if (!newTaskText.trim()) return;
    const targetChild = users.find(u => u.id === childId);
    if (!targetChild || !targetChild.childProfile) return;

    const existingTasks = targetChild.childProfile.tasks || [];
    const newTask = {
      id: `task_${Date.now()}`,
      description: newTaskText,
      reward: Number(newTaskReward),
      isCompleted: false,
      isApproved: false,
      createdAt: new Date().toISOString()
    };

    onUpdateUser(childId, {
      childProfile: {
        ...targetChild.childProfile,
        tasks: [...existingTasks, newTask]
      }
    });

    setNewTaskText('');
    setSelectedChildForTask('');
    alert('Задание успешно отправлено ребенку! Он увидит его на своем планшете.');
  };

  // Parent approves child task
  const handleApproveTask = (childId: string, taskId: string) => {
    const targetChild = users.find(u => u.id === childId);
    if (!targetChild || !targetChild.childProfile) return;

    const updatedTasks = (targetChild.childProfile.tasks || []).map(t => {
      if (t.id === taskId) {
        return { ...t, isApproved: true };
      }
      return t;
    });

    const rewardAmount = (targetChild.childProfile.tasks || []).find(t => t.id === taskId)?.reward || 0;

    onUpdateUser(childId, {
      childProfile: {
        ...targetChild.childProfile,
        dobriks: (targetChild.childProfile.dobriks || 0) + rewardAmount,
        stars: (targetChild.childProfile.stars || 0) + 1,
        tasks: updatedTasks
      }
    });

    alert(`Задание одобрено! Начислено: +${rewardAmount} Добриков 🪙`);
  };

  // Child completes task
  const handleCompleteTaskChild = (taskId: string) => {
    const updatedTasks = (currentUser.childProfile?.tasks || []).map(t => {
      if (t.id === taskId) {
        return { ...t, isCompleted: true };
      }
      return t;
    });

    onUpdateUser(currentUser.id, {
      childProfile: {
        ...currentUser.childProfile!,
        tasks: updatedTasks
      }
    });

    alert('Задание выполнено! Родителям отправлено уведомление для проверки.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans select-none" id="family_screen">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">👪 Семейный Контроль</h1>
            <p className="text-xs text-slate-400">Сквозное управление связями, достижениями и заданиями в Устьянах</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Plus size={16} /> Добавить связь
        </button>
      </div>

      {/* CALL SIMULATION ALERT POPUP */}
      <AnimatePresence>
        {activeCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-800 text-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl border border-slate-700"
            >
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-indigo-600 text-3xl font-black flex items-center justify-center mx-auto border-4 border-slate-700 shadow-xl animate-bounce">
                  {activeCall.avatar}
                </div>
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-2 border-slate-800 animate-ping">
                  <PhoneCall size={12} className="text-white" />
                </span>
              </div>

              <h3 className="text-xl font-extrabold">{activeCall.targetName}</h3>
              <p className="text-sm text-slate-400 mt-1 uppercase font-black tracking-widest text-[10px] animate-pulse">
                {activeCall.status === 'ringing' ? '📞 ИДЕТ ЗВОНОК...' : '🟢 В СЕТИ / РАЗГОВОР'}
              </p>

              {activeCall.status === 'connected' && (
                <div className="my-6 p-4 bg-slate-700/50 rounded-2xl text-xs font-semibold text-emerald-400 border border-emerald-500/10">
                  🎙️ Эмулируется голосовая связь через WebRTC <br/> Без расхода трафика в Устьянском районе!
                </div>
              )}

              <button
                onClick={endCall}
                className="mt-6 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm px-6 py-3 rounded-2xl w-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <X size={16} /> Повесить трубку
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHILDREN AND JUNIOR INTERFACES */}
      {currentUser.profileType === 'child' && currentUser.childProfile ? (
        /* ================= CHILD MODE INTERFACE ================= */
        <div className="space-y-6">
          <div className="bg-amber-100 border-4 border-amber-300 rounded-[32px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-4 flex-col sm:flex-row text-center sm:text-left">
              <span className="text-6xl animate-bounce">🧸</span>
              <div>
                <h2 className="text-2xl font-black text-amber-950">Привет, {currentUser.childProfile.childName}!</h2>
                <p className="text-sm font-bold text-amber-800">Твой детский кабинет взаимопомощи Устьяны 🌟</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white/85 p-4 rounded-2xl border-3 border-amber-200 shadow-sm">
                <span className="text-3xl block">🦊</span>
                <span className="text-xl font-black text-amber-950 block">Уровень {currentUser.childProfile.level}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Твой ранг</span>
              </div>
              <div className="bg-white/85 p-4 rounded-2xl border-3 border-amber-200 shadow-sm">
                <span className="text-3xl block">🍵</span>
                <span className="text-xl font-black text-amber-950 block">{currentUser.childProfile.dobriks} Чашек чая</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">На карманные расходы</span>
              </div>
              <div className="bg-white/85 p-4 rounded-2xl border-3 border-amber-200 shadow-sm col-span-2 sm:col-span-1">
                <span className="text-3xl block">⭐</span>
                <span className="text-xl font-black text-amber-950 block">{currentUser.childProfile.stars} Звёздочек</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">За успехи</span>
              </div>
            </div>
          </div>

          {/* Quick Call Parents */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-1.5">
              📞 Позвонить родителям
            </h3>
            {linkedParents.length === 0 ? (
              <p className="text-xs text-slate-400">Родители пока не привязали твой профиль. Попроси маму или папу добавить тебя!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {linkedParents.map(parent => (
                  <button
                    key={parent.id}
                    onClick={() => startCallSimulation(parent.name)}
                    className="bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-800 p-4 rounded-2xl font-black text-sm flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span>👨👩👧👦 Связаться с: {parent.name}</span>
                    <PhoneCall size={18} className="text-emerald-600 animate-pulse" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Child tasks list */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-4">📝 Мои важные задания от родителей:</h3>
            <div className="space-y-3">
              {(currentUser.childProfile.tasks || []).map(task => (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${
                    task.isApproved 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : task.isCompleted 
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div>
                    <p className={`font-bold text-sm ${task.isApproved ? 'line-through opacity-60' : ''}`}>{task.description}</p>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wide mt-1 block flex items-center gap-1.5">
                      Награда: <span className="text-yellow-600 font-bold">🪙 {task.reward} Добриков</span>
                    </span>
                  </div>

                  {task.isApproved ? (
                    <span className="bg-emerald-150 text-emerald-700 font-extrabold text-[10px] px-3 py-1 rounded-full border border-emerald-300">
                      ✅ Одобрено родителем
                    </span>
                  ) : task.isCompleted ? (
                    <span className="bg-yellow-150 text-yellow-700 font-extrabold text-[10px] px-3 py-1 rounded-full border border-yellow-300 animate-pulse">
                      ⏳ На проверке у мамы/папы
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCompleteTaskChild(task.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      👍 Сделал!
                    </button>
                  )}
                </div>
              ))}
              {(currentUser.childProfile.tasks || []).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">У тебя пока нет заданий от родителей. Время отдыхать! 🎉</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= GENERAL & PARENT ADAPTIVE INTERFACE ================= */
        <div className="space-y-6">
          
          {/* PARENTAL / GRANDPARENT SUMMARY BLOCK */}
          {familyState.children?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="text-indigo-600" /> Панель контроля заданий для родителей
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Quick Task Assignment form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wide text-slate-500 mb-3">
                    ➕ Новое задание ребенку
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Ребенок-получатель:</label>
                      <select
                        value={selectedChildForTask}
                        onChange={(e) => setSelectedChildForTask(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold"
                      >
                        <option value="">-- Выберите ребенка --</option>
                        {linkedChildren.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.childProfile?.childAge} лет)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Что нужно сделать:</label>
                      <input
                        type="text"
                        placeholder="Например: Сложить дрова в дровяник"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Награда (Добрики):</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newTaskReward}
                        onChange={(e) => setNewTaskReward(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold"
                      />
                    </div>

                    <button
                      onClick={() => handleAssignTask(selectedChildForTask)}
                      disabled={!selectedChildForTask || !newTaskText.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Отправить задание
                    </button>
                  </div>
                </div>

                {/* 2. Tasks verification queue */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wide text-slate-500 mb-3">
                    🔍 Ожидают проверки
                  </h4>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {linkedChildren.flatMap(child => 
                      (child.childProfile?.tasks || [])
                        .filter(t => t.isCompleted && !t.isApproved)
                        .map(task => (
                          <div key={task.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-xs">
                            <div>
                              <p className="font-bold text-slate-800">{task.description}</p>
                              <p className="text-[10px] text-indigo-500 mt-0.5">
                                Исполнитель: <strong>{child.name}</strong> · Награда: <span className="font-bold">🪙 {task.reward}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => handleApproveTask(child.id, task.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <Check size={12} /> Одобрить
                            </button>
                          </div>
                        ))
                    )}
                    {linkedChildren.every(c => !(c.childProfile?.tasks || []).some(t => t.isCompleted && !t.isApproved)) && (
                      <p className="text-xs text-slate-400 text-center py-8">Нет заданий, ожидающих вашего одобрения. Все отлично! 👍</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAMILY GROUPS DISPLAY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. CHILDREN SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span>🧸</span> Мои Дети (детский режим)
              </h3>

              <div className="space-y-3">
                {linkedChildren.map(child => (
                  <div key={child.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 font-bold flex items-center justify-center text-amber-800">
                          👶
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-800">{child.name} ({child.childProfile?.childAge} лет)</h4>
                          <p className="text-[10px] text-slate-400">Активность: онлайн сегодня · Уровень: {child.childProfile?.level || 1}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFamilyMember(child.id, 'child')}
                        className="text-red-500 hover:text-red-700 transition-all p-1"
                        title="Удалить семейную связь"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[11px] bg-white p-2 rounded-lg border border-slate-100 font-bold">
                      <div>
                        <span className="text-slate-400">Чашки чая:</span> <span className="text-yellow-600">🍵 {child.childProfile?.dobriks || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Звездочки:</span> <span className="text-indigo-600">★ {child.childProfile?.stars || 0}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startCallSimulation(child.name)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black py-1.5 rounded-lg border border-emerald-200 cursor-pointer text-center"
                      >
                        📞 Позвонить
                      </button>
                      <button
                        onClick={() => {
                          setSelectedChildForTask(child.id);
                          alert(`Введите описание задания в панели выше, чтобы привязать его к ${child.name}`);
                        }}
                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-black py-1.5 rounded-lg border border-indigo-200 cursor-pointer text-center"
                      >
                        📋 Задание
                      </button>
                    </div>
                  </div>
                ))}

                {linkedChildren.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">Связи с детьми отсутствуют. Вы можете добавить ребенка из списка.</p>
                )}
              </div>
            </div>

            {/* 2. ELDERLY / GRANDPARENTS SECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span>👵</span> Пожилые родственники (Бабушки / дедушки)
              </h3>

              <div className="space-y-3">
                {linkedGrandparents.map(gp => (
                  <div key={gp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 font-bold flex items-center justify-center text-emerald-800">
                          👵
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-800">{gp.name}</h4>
                          <p className="text-[10px] text-slate-400">Школа цифровой грамотности: уровень {gp.elderlyProfile?.level || 1}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFamilyMember(gp.id, 'grandparent')}
                        className="text-red-500 hover:text-red-700 transition-all p-1"
                        title="Удалить семейную связь"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* School tracker progress */}
                    <div className="bg-white p-3 rounded-lg border border-slate-100 text-[11px] space-y-1.5 font-semibold">
                      <div className="flex justify-between text-slate-500">
                        <span>Пройдено уроков цифровой грамоты:</span>
                        <span className="text-emerald-700 font-bold">{(gp.elderlyProfile?.completedLessons || []).length} из 20</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (((gp.elderlyProfile?.completedLessons || []).length) / 20) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startCallSimulation(gp.name)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-black py-1.5 rounded-lg border border-emerald-200 cursor-pointer text-center"
                      >
                        📞 Позвонить бабушке
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          alert('Прогресс цифровой грамотности детально доступен в учебном плане школы пенсионеров!');
                        }}
                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-black py-1.5 rounded-lg border border-indigo-200 cursor-pointer text-center"
                      >
                        🎓 Помочь учиться
                      </button>
                    </div>
                  </div>
                ))}

                {linkedGrandparents.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">Связи с бабушками/дедушками отсутствуют. Вы можете добавить пожилого родственника.</p>
                )}
              </div>
            </div>

            {/* 3. PARENTS SECTION (FOR CHILDREN VIEWING THEIR ELDERS) */}
            {familyState.parents?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span>👨👩</span> Мои Родители / Кураторы
                </h3>

                <div className="space-y-2">
                  {linkedParents.map(parent => (
                    <div key={parent.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👨</span>
                        <div>
                          <p className="font-extrabold text-xs text-slate-800">{parent.name}</p>
                          <p className="text-[10px] text-slate-400">Родитель · Телефон: {parent.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startCallSimulation(parent.name)}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-2 rounded-lg cursor-pointer"
                        >
                          <PhoneCall size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveFamilyMember(parent.id, 'parent')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. GRANDCHILDREN SECTION (FOR ELDERLY VIEWING THEIR KIDS) */}
            {familyState.grandchildren?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <span>👧👦</span> Мои Внуки (обучающие кураторы)
                </h3>

                <div className="space-y-2">
                  {linkedGrandchildren.map(gc => (
                    <div key={gc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👦</span>
                        <div>
                          <p className="font-extrabold text-xs text-slate-800">{gc.name}</p>
                          <p className="text-[10px] text-slate-400">Внук/Внучка · Село: {gc.village}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startCallSimulation(gc.name)}
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 p-2 rounded-lg cursor-pointer"
                        >
                          <PhoneCall size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveFamilyMember(gc.id, 'grandchild')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD RELATIVE MODAL DIALOG */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md text-slate-800 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-800 text-base flex items-center gap-1.5">
                  <UserPlus size={18} className="text-indigo-600" /> Связать семейные аккаунты
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* 1. Select Relationship type */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Кто этот родственник для вас?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRelationType('child');
                        setSelectedUserId('');
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-1 ${
                        relationType === 'child' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      🧸 Мой ребёнок
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRelationType('grandparent');
                        setSelectedUserId('');
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-1 ${
                        relationType === 'grandparent' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      👵 Мой дедушка/бабушка
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRelationType('parent');
                        setSelectedUserId('');
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-1 ${
                        relationType === 'parent' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      👨👩 Мой родитель
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRelationType('grandchild');
                        setSelectedUserId('');
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center gap-1 ${
                        relationType === 'grandchild' 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      👦👧 Мой внук/внучка
                    </button>
                  </div>
                </div>

                {/* Toggle between existing or creating mock */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setIsCreatingMock(false)}
                    className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg ${!isCreatingMock ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Выбрать из списка
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingMock(true)}
                    className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg ${isCreatingMock ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Создать виртуального
                  </button>
                </div>

                {!isCreatingMock ? (
                  /* 2A. SELECT EXISTING USER */
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Выберите пользователя из села {currentUser.village}:</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="">-- Выберите жителя --</option>
                      {candidates
                        .filter(c => c.village === currentUser.village)
                        .map(cand => (
                          <option key={cand.id} value={cand.id}>
                            {cand.name} ({cand.phone})
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  /* 2B. CREATE MOCK DIGITAL FAMILY MEMBER */
                  <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-150">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Имя / ФИО:</label>
                      <input
                        type="text"
                        placeholder="Например: Миша или Баба Маша"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                    {relationType === 'child' && (
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Возраст ребенка (лет):</label>
                        <input
                          type="number"
                          min="1"
                          max="16"
                          value={customAge}
                          onChange={(e) => setCustomAge(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Номер телефона (необязательно):</label>
                      <input
                        type="text"
                        placeholder="+7-921-123-4567"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFamilyMember}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Привязать родственника
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
