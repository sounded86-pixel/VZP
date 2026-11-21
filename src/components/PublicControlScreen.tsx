import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, AlertTriangle, FileText, CheckCircle2, XCircle, Plus, Search, 
  MessageSquare, ThumbsUp, ThumbsDown, Clock, User, Image, Send, 
  Info, Scale, ArrowRight, Filter, AlertCircle, Trash2, CheckCircle
} from 'lucide-react';
import { UserProfile, Complaint } from '../types';

// Let's declare our custom interfaces for this screen
export interface PublicPenalty {
  id: string;
  userId: string;
  userName: string;
  complaintId: string;
  type: 'warning' | 'fine' | 'block' | 'permanent';
  amount?: number;
  reason: string;
  status: 'active' | 'completed' | 'appealed';
  createdAt: string;
  expiresAt?: string;
}

export interface PublicAppeal {
  id: string;
  penaltyId: string;
  complaintId: string;
  userId: string;
  userName: string;
  reason: string; // user's justification
  votesYes: number; // votes to pardon/remove penalty
  votesNo: number; // votes to uphold penalty
  voters: Record<string, 'yes' | 'no'>; // userId -> vote
  status: 'open' | 'resolved_pardon' | 'resolved_uphold';
  createdAt: string;
  comments: {
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
    isModerator?: boolean;
  }[];
}

interface PublicControlScreenProps {
  currentUser: UserProfile;
  users: UserProfile[];
  complaints: Complaint[];
  onUpdateUser: (updatedUser: UserProfile) => void;
  onCreateComplaint: (complaint: Complaint) => void;
  onUpdateComplaint: (complaintId: string, updates: Partial<Complaint>) => void;
}

export default function PublicControlScreen({
  currentUser,
  users,
  complaints: rawComplaints,
  onUpdateUser,
  onCreateComplaint,
  onUpdateComplaint
}: PublicControlScreenProps) {
  // Safe cast existing complaints to rich complaints
  const complaints = useMemo(() => {
    return rawComplaints.map(c => ({
      ...c,
      category: c.category || 'insult',
      status: c.status || (c.resolved ? 'approved' : 'new'),
      description: c.description || c.reason || '',
      evidence: c.evidence || [],
      penalty: c.penalty || undefined,
      moderatorId: c.moderatorId || '',
      resolution: c.resolution || '',
      resolvedAt: c.resolvedAt || (c.resolved ? c.createdAt : undefined),
      authorId: c.authorId || c.reporterId,
      authorName: c.authorName || c.reporterName,
      targetName: c.targetName || (users.find(u => u.id === c.targetId)?.name || 'Неизвестный житель')
    })) as unknown as (Complaint & {
      authorId: string;
      authorName: string;
      targetName: string;
      category: 'insult' | 'spam' | 'fake' | 'obligation' | 'vandalism' | 'bullying' | 'other';
      description: string;
      evidence: string[];
      status: 'new' | 'moderation' | 'approved' | 'rejected';
      penalty?: {
        type: 'warning' | 'fine' | 'block' | 'permanent';
        amount?: number;
        duration?: number;
      };
      moderatorId?: string;
      resolution?: string;
      resolvedAt?: string;
    })[];
  }, [rawComplaints, users]);

  // Load penalties and appeals from localStorage or create initial mock ones
  const [penalties, setPenalties] = useState<PublicPenalty[]>(() => {
    const saved = localStorage.getItem('ustyany_public_penalties');
    if (saved) return JSON.parse(saved);
    
    // Initial mock penalties
    const mock: PublicPenalty[] = [
      {
        id: 'pen_1',
        userId: 'user_ivanov',
        userName: 'Иван Иванов',
        complaintId: 'complaint_mock_1',
        type: 'warning',
        reason: 'Мелкий флуд в чате взаимопомощи Березника',
        status: 'completed',
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'pen_2',
        userId: 'user_petrov',
        userName: 'Петр Петров',
        complaintId: 'complaint_mock_2',
        type: 'fine',
        amount: 10,
        reason: 'Нецензурная лексика в комментариях к добрым вестям',
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      }
    ];
    localStorage.setItem('ustyany_public_penalties', JSON.stringify(mock));
    return mock;
  });

  const [appeals, setAppeals] = useState<PublicAppeal[]>(() => {
    const saved = localStorage.getItem('ustyany_public_appeals');
    if (saved) return JSON.parse(saved);

    const mock: PublicAppeal[] = [
      {
        id: 'appeal_1',
        penaltyId: 'pen_2',
        complaintId: 'complaint_mock_2',
        userId: 'user_petrov',
        userName: 'Петр Петров',
        reason: 'Я признаю, что погорячился в комментариях, но это было в ответ на грубость. Прошу простить на первый раз и вернуть 10 Спасибо. С правилами ознакомился, больше не буду.',
        votesYes: 4,
        votesNo: 2,
        voters: { 'user_ivanov': 'yes', 'user_semenova': 'yes' },
        status: 'open',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        comments: [
          {
            id: 'c_1',
            userId: 'user_ivanov',
            userName: 'Иван Иванов',
            text: 'Петрович мужик надежный, всегда на тракторе помогает. Думаю, можно простить на первый раз.',
            createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
          },
          {
            id: 'c_2',
            userId: 'user_semenova',
            userName: 'Анна Семенова',
            text: 'Давайте заменим штраф простым предупреждением. Нам важна атмосфера доверия.',
            createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
          }
        ]
      }
    ];
    localStorage.setItem('ustyany_public_appeals', JSON.stringify(mock));
    return mock;
  });

  const savePenalties = (newPenalties: PublicPenalty[]) => {
    setPenalties(newPenalties);
    localStorage.setItem('ustyany_public_penalties', JSON.stringify(newPenalties));
  };

  const saveAppeals = (newAppeals: PublicAppeal[]) => {
    setAppeals(newAppeals);
    localStorage.setItem('ustyany_public_appeals', JSON.stringify(newAppeals));
  };

  // State managers
  const [activeTab, setActiveTab] = useState<'stats' | 'feed' | 'submit' | 'appeals' | 'mod_panel'>('stats');
  const [feedFilter, setFeedFilter] = useState<'all' | 'new' | 'resolved' | 'mine'>('all');
  
  // Create complaint states
  const [targetId, setTargetId] = useState('');
  const [category, setCategory] = useState<'insult' | 'spam' | 'fake' | 'obligation' | 'vandalism' | 'bullying'>('insult');
  const [description, setDescription] = useState('');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [evidenceList, setEvidenceList] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Administrative / Moderation states
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [modResolution, setModResolution] = useState('');
  const [penaltyType, setPenaltyType] = useState<'warning' | 'fine' | 'block' | 'permanent'>('warning');
  const [penaltyAmount, setPenaltyAmount] = useState(10);
  const [penaltyDuration, setPenaltyDuration] = useState(7);

  // Appeal Submission state
  const [appealReason, setAppealReason] = useState('');
  const [submittingAppealForPenaltyId, setSubmittingAppealForPenaltyId] = useState<string | null>(null);

  // Comment state for appeals
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});

  // Auth / Role permissions
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'developer' || currentUser.role === 'main_admin';
  const hasAccess = currentUser.thanksCount >= 10 || isAdmin;

  // Category map in Russian
  const categoryNames = {
    insult: 'Оскорбление / Грубость',
    spam: 'Спам / Реклама / Флуд',
    fake: 'Фейки / Клевета',
    obligation: 'Срыв обязательств',
    vandalism: 'Вредительство',
    bullying: 'Травля / Буллинг',
    other: 'Другое нарушение'
  };

  const categoryDescriptions = {
    insult: 'Грубые высказывания, оскорбления личности в чатах взаимопомощи',
    spam: 'Массовая рассылка нерелевантной информации, рекламы, бессмысленных сообщений',
    fake: 'Распространение недостоверной информации о событиях района или жителях',
    obligation: 'Систематическое невыполнение взятых на себя обязательств по помощи соседям',
    vandalism: 'Порча общественного имущества, экологический вред или вандализм',
    bullying: 'Групповая травля, систематические нападки и преследование жителя'
  };

  const statusNames = {
    new: 'Новая',
    moderation: 'На рассмотрении',
    approved: 'Подтверждено',
    rejected: 'Отклонено'
  };

  const penaltyTypeNames = {
    warning: 'Предупреждение ⚠️',
    fine: 'Вычет баллов 🪙',
    block: 'Временный бан ⏳',
    permanent: 'Вечный бан 🛑'
  };

  // Calculated statistics
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'new' || c.status === 'moderation').length;
    const approved = complaints.filter(c => c.status === 'approved').length;
    const totalFinePoints = penalties
      .filter(p => p.type === 'fine' && p.amount)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Group complaints by village of the reporter/author
    const byCategory = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, pending, approved, totalFinePoints, byCategory };
  }, [complaints, penalties]);

  // Handlers
  const handleAddEvidence = () => {
    if (!evidenceInput.trim()) return;
    setEvidenceList(prev => [...prev, evidenceInput.trim()]);
    setEvidenceInput('');
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!targetId) {
      setFormError('Пожалуйста, выберите нарушителя из списка жителей.');
      return;
    }
    if (targetId === currentUser.id) {
      setFormError('Вы не можете отправить жалобу на самого себя.');
      return;
    }
    if (!description.trim() || description.length < 15) {
      setFormError('Описание инцидента должно быть подробным (минимум 15 символов).');
      return;
    }

    const targetUser = users.find(u => u.id === targetId);
    if (!targetUser) {
      setFormError('Выбранный житель не найден.');
      return;
    }

    const newComplaint: Complaint = {
      id: 'complaint_' + Date.now(),
      targetId: targetId,
      targetType: 'user',
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reason: description,
      createdAt: new Date().toISOString(),
      resolved: false,
      // Extra fields for rich module:
      authorId: currentUser.id,
      authorName: currentUser.name,
      targetName: targetUser.name,
      category: category,
      description: description,
      evidence: evidenceList,
      status: 'new'
    } as any;

    onCreateComplaint(newComplaint);
    
    // Increment reporter reportsCount
    onUpdateUser({
      ...currentUser,
      createdCount: (currentUser.createdCount || 0) + 1
    });

    setFormSuccess(true);
    setTargetId('');
    setDescription('');
    setEvidenceList([]);
    
    // Automatically switch back to feed to see submission
    setTimeout(() => {
      setActiveTab('feed');
      setFormSuccess(false);
    }, 2000);
  };

  // Moderator review action
  const handleStartReview = (complaintId: string) => {
    onUpdateComplaint(complaintId, { status: 'moderation' } as any);
  };

  // Approve complaint & issue penalty
  const handleApproveComplaint = (complaintId: string) => {
    const comp = complaints.find(c => c.id === complaintId);
    if (!comp) return;

    if (!modResolution.trim()) {
      alert('Пожалуйста, введите официальное решение/урок для жителя.');
      return;
    }

    // 1. Prepare penalty object inside complaint
    const finalPenalty = {
      type: penaltyType,
      amount: penaltyType === 'fine' ? penaltyAmount : undefined,
      duration: penaltyType === 'block' ? penaltyDuration : undefined
    };

    onUpdateComplaint(complaintId, {
      status: 'approved',
      resolved: true,
      moderatorId: currentUser.id,
      resolution: modResolution,
      resolvedAt: new Date().toISOString(),
      penalty: finalPenalty
    } as any);

    // 2. Apply consequences to the target user profile
    const targetUser = users.find(u => u.id === comp.targetId);
    if (targetUser) {
      const updatedUser = { ...targetUser };
      
      if (penaltyType === 'fine') {
        // Deduct points
        const originalThanks = targetUser.thanksCount || 0;
        updatedUser.thanksCount = Math.max(0, originalThanks - penaltyAmount);
      } else if (penaltyType === 'block' || penaltyType === 'permanent') {
        // Block user
        updatedUser.blocked = true;
      }
      
      // Increment complaints against this user
      updatedUser.reportsCount = (targetUser.reportsCount || 0) + 1;
      onUpdateUser(updatedUser);
    }

    // 3. Create a public record in penalties collection
    const newPenaltyRecord: PublicPenalty = {
      id: 'pen_' + Date.now(),
      userId: comp.targetId,
      userName: comp.targetName,
      complaintId: comp.id,
      type: penaltyType,
      amount: penaltyType === 'fine' ? penaltyAmount : undefined,
      reason: `${categoryNames[comp.category]}: ${modResolution}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: penaltyType === 'block' ? new Date(Date.now() + penaltyDuration * 24 * 3600 * 1000).toISOString() : undefined
    };

    savePenalties([newPenaltyRecord, ...penalties]);

    // Clean up states
    setSelectedComplaintId(null);
    setModResolution('');
    setPenaltyType('warning');
    alert('Жалоба одобрена. Нарушителю вынесено взыскание в воспитательных целях!');
  };

  // Reject complaint
  const handleRejectComplaint = (complaintId: string) => {
    if (!modResolution.trim()) {
      alert('Пожалуйста, укажите причину отклонения жалобы.');
      return;
    }

    onUpdateComplaint(complaintId, {
      status: 'rejected',
      resolved: true,
      moderatorId: currentUser.id,
      resolution: modResolution,
      resolvedAt: new Date().toISOString()
    } as any);

    setSelectedComplaintId(null);
    setModResolution('');
    alert('Жалоба отклонена.');
  };

  // Create Appeal
  const handleCreateAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAppealForPenaltyId || !appealReason.trim() || appealReason.length < 15) {
      alert('Пожалуйста, напишите развернутое обоснование (не менее 15 символов).');
      return;
    }

    const penalty = penalties.find(p => p.id === submittingAppealForPenaltyId);
    if (!penalty) return;

    const newAppeal: PublicAppeal = {
      id: 'appeal_' + Date.now(),
      penaltyId: penalty.id,
      complaintId: penalty.complaintId,
      userId: currentUser.id,
      userName: currentUser.name,
      reason: appealReason,
      votesYes: 1, // Author automatically votes "Yes" to pardon
      votesNo: 0,
      voters: { [currentUser.id]: 'yes' },
      status: 'open',
      createdAt: new Date().toISOString(),
      comments: []
    };

    // Mark the penalty status as appealed
    savePenalties(penalties.map(p => p.id === penalty.id ? { ...p, status: 'appealed' } : p));
    saveAppeals([newAppeal, ...appeals]);

    setAppealReason('');
    setSubmittingAppealForPenaltyId(null);
    setActiveTab('appeals');
    alert('Ваша апелляция принята общественным судом. Ожидайте голосов соседей!');
  };

  // Vote on Appeal
  const handleVoteOnAppeal = (appealId: string, vote: 'yes' | 'no') => {
    if (currentUser.thanksCount < 10 && !isAdmin) {
      alert('Голосовать в общинном суде могут только жители с рейтингом Спасибо 10+.');
      return;
    }

    const appeal = appeals.find(a => a.id === appealId);
    if (!appeal) return;

    if (appeal.voters[currentUser.id]) {
      alert('Вы уже проголосовали в этой апелляции.');
      return;
    }

    const updatedVoters = { ...appeal.voters, [currentUser.id]: vote };
    const yesCount = Object.values(updatedVoters).filter(v => v === 'yes').length;
    const noCount = Object.values(updatedVoters).filter(v => v === 'no').length;

    const updatedAppeals = appeals.map(a => {
      if (a.id === appealId) {
        return {
          ...a,
          votesYes: yesCount,
          votesNo: noCount,
          voters: updatedVoters
        };
      }
      return a;
    });

    saveAppeals(updatedAppeals);
  };

  // Submit comment on Appeal
  const handleCommentOnAppeal = (appealId: string) => {
    const commentText = newCommentTexts[appealId];
    if (!commentText || !commentText.trim()) return;

    const updatedAppeals = appeals.map(a => {
      if (a.id === appealId) {
        return {
          ...a,
          comments: [
            ...a.comments,
            {
              id: 'c_' + Date.now(),
              userId: currentUser.id,
              userName: currentUser.name,
              text: commentText.trim(),
              createdAt: new Date().toISOString(),
              isModerator: isAdmin
            }
          ]
        };
      }
      return a;
    });

    saveAppeals(updatedAppeals);
    setNewCommentTexts(prev => ({ ...prev, [appealId]: '' }));
  };

  // Moderator resolve Appeal
  const handleResolveAppeal = (appealId: string, action: 'pardon' | 'uphold') => {
    const appeal = appeals.find(a => a.id === appealId);
    if (!appeal) return;

    // 1. Update appeal status
    const updatedAppeals = appeals.map(a => {
      if (a.id === appealId) {
        return {
          ...a,
          status: action === 'pardon' ? 'resolved_pardon' : 'resolved_uphold'
        };
      }
      return a;
    }) as any[];
    saveAppeals(updatedAppeals);

    // 2. Update penalty status
    const penalty = penalties.find(p => p.id === appeal.penaltyId);
    if (penalty) {
      savePenalties(penalties.map(p => p.id === penalty.id ? { ...p, status: action === 'pardon' ? 'completed' : 'active' } : p));
      
      // 3. If pardoned, restore target user points or lift block
      if (action === 'pardon') {
        const targetUser = users.find(u => u.id === penalty.userId);
        if (targetUser) {
          const updatedUser = { ...targetUser };
          if (penalty.type === 'fine' && penalty.amount) {
            // Give points back
            updatedUser.thanksCount = (targetUser.thanksCount || 0) + penalty.amount;
          } else if (penalty.type === 'block' || penalty.type === 'permanent') {
            // Unblock
            updatedUser.blocked = false;
          }
          onUpdateUser(updatedUser);
        }
      }
    }

    alert(action === 'pardon' ? 'Житель помилован общиной! Баллы/доступ возвращены.' : 'Решение суда: наказание оставлено в силе.');
  };

  // Filter complaints feed
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (feedFilter === 'new') return c.status === 'new' || c.status === 'moderation';
      if (feedFilter === 'resolved') return c.status === 'approved' || c.status === 'rejected';
      if (feedFilter === 'mine') return c.authorId === currentUser.id || c.targetId === currentUser.id;
      return true; // 'all'
    });
  }, [complaints, feedFilter, currentUser.id]);

  // If user doesn't have access (thanksCount < 10) and is not admin
  if (!hasAccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center" id="public_control_no_access">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl max-w-lg mx-auto">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Shield size={36} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 font-display">Общественный контроль района</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Доступ к разделу гражданской модерации и общинному суду ограничен. <br />
            Для обеспечения объективности этот модуль открывается только сознательным жителям с уровнем доверия (рейтингом Спасибо) <strong className="text-emerald-600">10 и выше</strong>.
          </p>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Ваш текущий баланс:</span>
            <span className="text-3xl font-black text-amber-600">★ {currentUser.thanksCount} "Спасибо"</span>
            <span className="text-xs text-slate-400 block mt-1 font-medium">Вам не хватает еще {10 - currentUser.thanksCount} баллов.</span>
          </div>

          <blockquote className="text-xs text-slate-400 italic mb-6 border-l-2 border-emerald-500 pl-4 text-left">
            "Наш принцип: не опозорить человека перед всеми, а дать ему справедливый урок, чтобы он стал полезной частью устьянского общества."
          </blockquote>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-md"
          >
            Обновить статус
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans select-none" id="public_control_screen">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 mb-6 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
          <Scale size={160} className="stroke-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block">Народная Совесть Устьян</span>
            <h1 className="text-2xl font-black text-white font-display flex items-center gap-2">
              ⚖️ Общественный контроль
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Модуль цивилизованного урегулирования споров, предотвращения спама и мелкого вредительства в районе. Действуем по принципу: <strong className="text-emerald-300">«Не наказание, а исправление. Не позор, а урок»</strong>.
            </p>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl font-bold self-start md:self-center">
            Доверенный наблюдатель (★ {currentUser.thanksCount})
          </span>
        </div>
      </div>

      {/* HORIZONTAL NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-3 mb-6">
        <button
          onClick={() => { setActiveTab('stats'); setSelectedComplaintId(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stats' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          📈 Сводка нарушений
        </button>
        <button
          onClick={() => { setActiveTab('feed'); setSelectedComplaintId(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'feed' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          📁 База жалоб ({complaints.length})
        </button>
        <button
          onClick={() => { setActiveTab('submit'); setSelectedComplaintId(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'submit' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          ➕ Сообщить о нарушении
        </button>
        <button
          onClick={() => { setActiveTab('appeals'); setSelectedComplaintId(null); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'appeals' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <span>⚖️ Общинный суд (Апелляции)</span>
          {appeals.filter(a => a.status === 'open').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          )}
        </button>

        {isAdmin && (
          <button
            onClick={() => { setActiveTab('mod_panel'); setSelectedComplaintId(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-200 ${
              activeTab === 'mod_panel' 
                ? 'bg-red-700 text-white shadow-xs' 
                : 'bg-red-50 hover:bg-red-100 text-red-700'
            }`}
          >
            🛡️ Рассмотрение дел ({complaints.filter(c => c.status === 'new' || c.status === 'moderation').length})
          </button>
        )}
      </div>

      {/* SCREEN VIEWS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: STATISTICS DASHBOARD */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Scoreboard Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Dynamic counters card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Поступило сигналов</span>
                  <span className="text-3xl font-black text-slate-800 block mt-1">{stats.total}</span>
                  <span className="text-[10px] text-slate-500 block mt-1 font-medium">Всего жалоб в системе</span>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">На модерации</span>
                  <span className="text-3xl font-black text-amber-700 block mt-1">{stats.pending}</span>
                  <span className="text-[10px] text-amber-600 block mt-1 font-medium">Ожидают решения правления</span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Одобрено взысканий</span>
                  <span className="text-3xl font-black text-emerald-700 block mt-1">{stats.approved}</span>
                  <span className="text-[10px] text-emerald-600 block mt-1 font-medium">Нарушения подтвердились</span>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                  <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Списано штрафных Спасибо</span>
                  <span className="text-3xl font-black text-rose-700 block mt-1">-{stats.totalFinePoints}</span>
                  <span className="text-[10px] text-rose-600 block mt-1 font-medium">Пошли на пользу фонда района</span>
                </div>
              </div>

              {/* Penalty rules table */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5">
                  <Shield size={16} className="text-slate-700" /> Сетка воспитательных воздействий
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Уровень 1. Предупреждение (Warning)</span>
                    <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-md font-bold">Официальное ⚠️</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Уровень 2. Штраф (Level 2 fine)</span>
                    <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 rounded-md font-bold">-10 "Спасибо" 🪙</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Уровень 3. Крупный штраф (Level 3 fine)</span>
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-md font-bold">-50 "Спасибо" 🪙</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Уровень 4. Временный блок (Level 4 block)</span>
                    <span className="px-2.5 py-0.5 bg-red-200 text-red-900 rounded-md font-bold">Бан на 7 дней ⏳</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-bold text-slate-700">Уровень 5. Перманентный блок (Level 5 permanent)</span>
                    <span className="px-2.5 py-0.5 bg-red-950 text-red-100 rounded-md font-bold">Вечная блокировка 🛑</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              {/* Category distribution widget */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Нарушения по категориям</h3>
                <div className="space-y-3">
                  {Object.entries(categoryNames).map(([key, name]) => {
                    const count = stats.byCategory[key] || 0;
                    const max = Math.max(...(Object.values(stats.byCategory) as number[]), 1);
                    const percent = Math.round((count / max) * 100);

                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600 truncate">{name}</span>
                          <span className="font-black text-slate-800">{count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-700 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active penalties list */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Действующие взыскания</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {penalties.filter(p => p.status === 'active' || p.status === 'appealed').length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Действующих наказаний нет. В районе мир и порядок! 🕊️
                    </div>
                  ) : (
                    penalties.filter(p => p.status === 'active' || p.status === 'appealed').map(p => (
                      <div key={p.id} className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800 text-xs truncate max-w-[130px]">{p.userName}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                            p.status === 'appealed' ? 'bg-amber-100 text-amber-800' : 'bg-red-50 text-red-700'
                          }`}>
                            {p.status === 'appealed' ? 'Апелляция' : 'Штраф'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 font-medium">{p.reason}</p>
                        <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400">
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          {p.userId === currentUser.id && p.status === 'active' && (
                            <button
                              onClick={() => {
                                setSubmittingAppealForPenaltyId(p.id);
                                setActiveTab('submit');
                              }}
                              className="text-indigo-600 hover:underline font-bold"
                            >
                              Оспорить (Подать апелляцию)
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: COMPLAINTS FEED */}
        {activeTab === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Filter buttons bar */}
            <div className="bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-slate-400" />
                <span className="text-xs text-slate-500 font-bold mr-2">Фильтр:</span>
                <button
                  onClick={() => setFeedFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    feedFilter === 'all' ? 'bg-slate-950 text-white' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Все ({complaints.length})
                </button>
                <button
                  onClick={() => setFeedFilter('new')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    feedFilter === 'new' ? 'bg-slate-950 text-white' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Новые ({complaints.filter(c => c.status === 'new' || c.status === 'moderation').length})
                </button>
                <button
                  onClick={() => setFeedFilter('resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    feedFilter === 'resolved' ? 'bg-slate-950 text-white' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Рассмотренные ({complaints.filter(c => c.status === 'approved' || c.status === 'rejected').length})
                </button>
                <button
                  onClick={() => setFeedFilter('mine')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    feedFilter === 'mine' ? 'bg-slate-950 text-white' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  С моим участием
                </button>
              </div>
            </div>

            {/* List of complaints */}
            {filteredComplaints.length === 0 ? (
              <div className="bg-white border border-slate-200/85 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Ничего не найдено</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  По выбранному фильтру нарушения не обнаружены. У нас сознательный край!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredComplaints.map(comp => (
                  <div key={comp.id} className="bg-white border border-slate-200/85 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Top status bar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            Житель: <strong className="text-rose-600">{comp.targetName}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                            {categoryNames[comp.category] || comp.category}
                          </span>
                        </div>
                        
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                          comp.status === 'new' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          comp.status === 'moderation' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          comp.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {statusNames[comp.status]}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {comp.description}
                      </p>

                      {/* Evidence attached */}
                      {comp.evidence && comp.evidence.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 items-center">
                          <span className="text-[10px] text-slate-400 font-bold">Скриншоты / Доказательства:</span>
                          {comp.evidence.map((url, idx) => (
                            <a 
                              key={idx} 
                              href="#" 
                              onClick={(e) => { e.preventDefault(); alert(`Ссылка на доказательство: ${url}`); }}
                              className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                            >
                              <Image size={10} /> Док. {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer / Resolution */}
                    <div className="border-t border-slate-100 pt-3 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-slate-400 font-medium">
                        Подано заявителем: <span className="text-slate-600 font-bold">{comp.authorName}</span> • {new Date(comp.createdAt).toLocaleDateString()}
                      </div>

                      {/* Resolution details */}
                      {comp.status === 'approved' && comp.penalty && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-[11px] text-rose-900 w-full sm:w-auto max-w-md font-semibold">
                          <div className="font-extrabold flex items-center gap-1">
                            <Scale size={12} className="text-rose-700" /> Вердикт: {penaltyTypeNames[comp.penalty.type]}
                          </div>
                          <p className="mt-1 font-medium italic text-rose-800">"{comp.resolution}"</p>
                        </div>
                      )}

                      {comp.status === 'rejected' && (
                        <div className="bg-slate-100 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 w-full sm:w-auto max-w-md font-semibold">
                          <div className="font-extrabold">Отклонено модератором</div>
                          <p className="mt-1 font-medium">Причина: {comp.resolution}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: SUBMIT COMPLAINT FORM */}
        {activeTab === 'submit' && (
          <motion.div
            key="submit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="max-w-xl mx-auto"
          >
            {/* If user is appealing an existing penalty, render appeal form first! */}
            {submittingAppealForPenaltyId ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-indigo-600 mb-4 font-bold text-xs cursor-pointer" onClick={() => setSubmittingAppealForPenaltyId(null)}>
                  &larr; Назад к взысканиям
                </div>
                <h2 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-1.5">
                  ⚖️ Подача апелляции в общинный суд
                </h2>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Если вы считаете наказание чрезмерным, неверным или несправедливым, вы можете представить свое обоснование. Ваше дело будет вынесено на открытое голосование жителей района!
                </p>

                <form onSubmit={handleCreateAppeal} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">По какому взысканию:</label>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <strong className="text-slate-800 block">
                        {penalties.find(p => p.id === submittingAppealForPenaltyId)?.reason}
                      </strong>
                      <span className="text-slate-400 block mt-0.5">
                        Выдано: {new Date(penalties.find(p => p.id === submittingAppealForPenaltyId)?.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Обоснование апелляции (признание ошибки или аргумент невиновности):</label>
                    <textarea
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      placeholder="Опишите, почему община должна пересмотреть данное решение..."
                      rows={5}
                      className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    Передать на суд общины <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            ) : (
              // Standard complaint form
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                <h2 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={18} className="text-amber-500" /> Сигнал о нарушении правил
                </h2>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Пожалуйста, отправляйте жалобу только в случае реального нарушения правил взаимопомощи, оскорблений или спама. Ложные сообщения порицаются.
                </p>

                {formSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Ваша жалоба отправлена в правление района. Перенаправляем...
                  </div>
                )}

                {formError && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 text-red-800 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} /> {formError}
                  </div>
                )}

                <form onSubmit={handleCreateComplaintSubmit} className="space-y-4">
                  {/* Select violator */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Кто нарушил правила:</label>
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:outline-none bg-white"
                    >
                      <option value="">-- Выберите жителя района --</option>
                      {users
                        .filter(u => u.id !== currentUser.id && u.role !== 'admin' && u.role !== 'developer')
                        .map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} (с. {u.village} • рейтинг {u.thanksCount})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Category of violation */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Категория нарушения:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(categoryDescriptions).map(([key, desc]) => (
                        <div 
                          key={key}
                          onClick={() => setCategory(key as any)}
                          className={`p-3 border rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between ${
                            category === key 
                              ? 'border-slate-800 bg-slate-50 shadow-xs' 
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">{categoryNames[key as keyof typeof categoryNames]}</span>
                          <span className="text-[10px] text-slate-400 font-medium leading-tight mt-1">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Подробное описание инцидента:</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Опишите, что произошло, когда, в каком чате или посте. Предоставьте факты."
                      rows={4}
                      className="w-full text-xs font-semibold p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  {/* Evidence inputs */}
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Доказательства (ссылки на сообщения, скриншоты или файлы):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={evidenceInput}
                        onChange={(e) => setEvidenceInput(e.target.value)}
                        placeholder="Вставьте ссылку на скриншот/сообщение..."
                        className="flex-1 text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddEvidence}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Добавить
                      </button>
                    </div>

                    {evidenceList.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {evidenceList.map((url, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-medium">
                            <span className="truncate max-w-[250px] text-slate-600">{url}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEvidence(idx)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              Удалить
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Отправить жалобу <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: APPEALS (COMMUNITY COURT) */}
        {activeTab === 'appeals' && (
          <motion.div
            key="appeals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3">
              <Scale size={24} className="text-slate-800 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Общинный мирный суд Устьян</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
                  Любой оштрафованный житель может вынести свое дело на обсуждение соседей. Другие пользователи с рейтингом Спасибо 10+ голосуют за смягчение наказания или поддержание вердикта модераторов. Наше общество стремится помогать исправляться!
                </p>
              </div>
            </div>

            {appeals.length === 0 ? (
              <div className="bg-white border border-slate-200/85 rounded-3xl p-12 text-center shadow-xs">
                <Scale size={32} className="text-slate-400 mx-auto mb-3" />
                <h3 className="text-xs font-black text-slate-700">Активных апелляций нет</h3>
                <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">Все жители согласны со своими воспитательными мерами или не нарушают устав.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appeals.map(app => {
                  const hasVoted = app.voters[currentUser.id] !== undefined;
                  const totalVotes = app.votesYes + app.votesNo;
                  const yesPercent = totalVotes > 0 ? Math.round((app.votesYes / totalVotes) * 100) : 0;
                  const noPercent = totalVotes > 0 ? Math.round((app.votesNo / totalVotes) * 100) : 0;

                  return (
                    <div key={app.id} className="bg-white border border-slate-200/85 rounded-3xl p-5 shadow-xs">
                      {/* Appeal top */}
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <span className="text-xs text-slate-400 font-bold uppercase">Апелляция гражданина:</span>
                          <h3 className="text-sm font-black text-slate-800 mt-0.5">{app.userName}</h3>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                          app.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status === 'open' ? 'Идет голосование' : 
                           app.status === 'resolved_pardon' ? 'Помилован общиной' : 'Взыскание подтверждено'}
                        </span>
                      </div>

                      {/* Explanation */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 mb-4 leading-relaxed">
                        <strong className="text-slate-800 block mb-1">Аргумент жителя:</strong>
                        "{app.reason}"
                      </div>

                      {/* Vote statistics & action */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Мнения общины:</span>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-[11px] font-bold mb-0.5">
                                <span className="text-emerald-700">Помиловать ({app.votesYes})</span>
                                <span className="text-rose-700">Оставить штраф ({app.votesNo})</span>
                              </div>
                              <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden flex">
                                <div className="h-full bg-emerald-500" style={{ width: `${yesPercent}%` }} />
                                <div className="h-full bg-rose-500" style={{ width: `${noPercent}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {app.status === 'open' && (
                          <div className="flex items-center justify-end gap-2">
                            {hasVoted ? (
                              <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                                <CheckCircle size={14} className="text-emerald-600" /> Голос учтен!
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleVoteOnAppeal(app.id, 'yes')}
                                  className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <ThumbsUp size={11} /> Помиловать
                                </button>
                                <button
                                  onClick={() => handleVoteOnAppeal(app.id, 'no')}
                                  className="px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <ThumbsDown size={11} /> Оставить штраф
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Comments inside appeal */}
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Обсуждение соседей ({app.comments.length}):</span>
                        
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {app.comments.map(c => (
                            <div key={c.id} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs">
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1">
                                <span className={c.isModerator ? 'text-red-700' : 'text-slate-600'}>
                                  {c.userName} {c.isModerator && '(Модератор)'}
                                </span>
                                <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                              </div>
                              <p className="font-semibold text-slate-600 leading-relaxed">"{c.text}"</p>
                            </div>
                          ))}
                        </div>

                        {app.status === 'open' && (
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              value={newCommentTexts[app.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewCommentTexts(prev => ({ ...prev, [app.id]: val }));
                              }}
                              placeholder="Напишите свое мнение..."
                              className="flex-1 text-xs font-semibold p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 bg-white"
                            />
                            <button
                              onClick={() => handleCommentOnAppeal(app.id)}
                              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl cursor-pointer"
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Admin close button */}
                      {isAdmin && app.status === 'open' && (
                        <div className="mt-4 border-t border-slate-100 pt-3 flex gap-2 justify-end">
                          <button
                            onClick={() => handleResolveAppeal(app.id, 'pardon')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            🏛️ Закрыть апелляцию: Помиловать жителя
                          </button>
                          <button
                            onClick={() => handleResolveAppeal(app.id, 'uphold')}
                            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            🏛️ Закрыть апелляцию: Подтвердить штраф
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 5: MODERATOR PANEL */}
        {activeTab === 'mod_panel' && isAdmin && (
          <motion.div
            key="mod_panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Left/Middle Column: Complaints List */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-base font-black text-slate-800 mb-2">🛡️ Входящие жалобы в работе</h2>
              {complaints.filter(c => c.status === 'new' || c.status === 'moderation').length === 0 ? (
                <div className="bg-white border border-slate-200/85 rounded-3xl p-8 text-center text-slate-400 text-xs">
                  Все жалобы обработаны. Отличная работа! 🌟
                </div>
              ) : (
                <div className="space-y-3">
                  {complaints
                    .filter(c => c.status === 'new' || c.status === 'moderation')
                    .map(comp => (
                      <div 
                        key={comp.id} 
                        onClick={() => setSelectedComplaintId(comp.id)}
                        className={`bg-white border p-4 rounded-2xl cursor-pointer transition-all ${
                          selectedComplaintId === comp.id 
                            ? 'border-red-500 bg-red-50/15 ring-1 ring-red-500' 
                            : 'border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800 text-xs">
                            Нарушитель: <strong className="text-red-700">{comp.targetName}</strong>
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            comp.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {statusNames[comp.status]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-semibold mt-1">"{comp.description}"</p>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400">
                          <span>Категория: {categoryNames[comp.category]}</span>
                          <span>Заявитель: {comp.authorName}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Right Column: Case Details & Resolution Panel */}
            <div>
              <h2 className="text-base font-black text-slate-800 mb-2">📜 Решение по выбранному делу</h2>
              {selectedComplaintId ? (
                (() => {
                  const comp = complaints.find(c => c.id === selectedComplaintId);
                  if (!comp) return null;

                  return (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Дело:</span>
                        <strong className="text-slate-800 text-xs block mt-0.5">{comp.id}</strong>
                        <span className="text-xs text-slate-600 block mt-1 font-semibold leading-relaxed">
                          "{comp.description}"
                        </span>
                      </div>

                      {comp.status === 'new' && (
                        <button
                          onClick={() => handleStartReview(comp.id)}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                        >
                          Взять на рассмотрение
                        </button>
                      )}

                      {comp.status === 'moderation' && (
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                          {/* Penalty type selector */}
                          <div>
                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Меры воспитательного воздействия:</label>
                            <select
                              value={penaltyType}
                              onChange={(e) => setPenaltyType(e.target.value as any)}
                              className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none"
                            >
                              <option value="warning">Уровень 1: Официальное предупреждение</option>
                              <option value="fine">Уровень 2/3: Вычет "Спасибо"</option>
                              <option value="block">Уровень 4: Бан (Блокировка доступа)</option>
                              <option value="permanent">Уровень 5: Перманентная блокировка</option>
                            </select>
                          </div>

                          {/* Level 2/3: points amount */}
                          {penaltyType === 'fine' && (
                            <div>
                              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Количество списываемых "Спасибо":</label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPenaltyAmount(10)}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${
                                    penaltyAmount === 10 ? 'bg-orange-100 border-orange-300 text-orange-950' : 'border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  -10 (Level 2)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPenaltyAmount(50)}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${
                                    penaltyAmount === 50 ? 'bg-red-100 border-red-300 text-red-950' : 'border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  -50 (Level 3)
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Level 4: block duration */}
                          {penaltyType === 'block' && (
                            <div>
                              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Дни блокировки:</label>
                              <input
                                type="number"
                                min={1}
                                max={30}
                                value={penaltyDuration}
                                onChange={(e) => setPenaltyDuration(Number(e.target.value))}
                                className="w-full text-xs font-bold p-2.5 border border-slate-200 rounded-xl"
                              />
                            </div>
                          )}

                          {/* Resolution / Lesson text */}
                          <div>
                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Официальное решение (урок и предписание):</label>
                            <textarea
                              value={modResolution}
                              onChange={(e) => setModResolution(e.target.value)}
                              placeholder="Напишите развернутый воспитательный текст. Чему учит этот инцидент и как жителю исправиться..."
                              rows={3}
                              className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveComplaint(comp.id)}
                              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                            >
                              Применить взыскание
                            </button>
                            <button
                              onClick={() => handleRejectComplaint(comp.id)}
                              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
                            >
                              Отклонить
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border border-slate-200/85 rounded-2xl p-6 text-center text-slate-400 text-xs">
                  Выберите жалоба из левой панели для ведения модераторского процесса.
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
