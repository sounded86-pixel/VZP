import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getUserRoleAndTariff } from '../hooks/useUserRole';
import { 
  Heart, Target, BarChart3, HelpCircle, Trophy, MessageSquare, 
  Share2, Send, Star, CheckCircle, MapPin, Users, Shield, 
  ArrowLeft, Activity, Info, Sparkles, Building2, Phone, User,
  Coins, TrendingUp, FileText, Wallet, Calendar, ArrowUpRight, Lock, RefreshCw,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';
import { UserProfile, ProjectStats, ProjectReview, Partner, License, Contract } from '../types';
import { 
  dbCreateProjectReview,
  dbSubscribePartners,
  dbCreatePartner,
  dbUpdatePartner,
  dbSubscribeLicenses,
  dbCreateLicense,
  dbUpdateLicense,
  dbSubscribeContracts,
  dbCreateContract,
  dbUpdateContract
} from '../firebaseSync';
import BrandLogo from './BrandLogo';

interface AboutProjectScreenProps {
  currentUser: UserProfile;
  onBack: () => void;
  isOffline: boolean;
  onNavigate?: (screen: string) => void;
}

export default function AboutProjectScreen({
  currentUser,
  onBack,
  isOffline,
  onNavigate
}: AboutProjectScreenProps) {
  const [activeTab, setActiveTab] = useState<'mission' | 'goals' | 'stats' | 'how_it_works' | 'achievements' | 'reviews' | 'scaling' | 'finance' | 'join_team'>('mission');

  // Real-time states
  const [stats, setStats] = useState<ProjectStats>({
    id: 'district_stats',
    totalUsers: 127,
    activeUsers: 4,
    totalHelpRequests: 58,
    totalHelpProvided: 45,
    totalMasters: 12,
    totalEntrepreneurs: 8,
    totalChildren: 3,
    totalElderly: 20,
    totalReviews: 67,
    totalEcoEvents: 5,
    totalDeliveries: 15,
    updatedAt: new Date().toISOString()
  });

  const [reviews, setReviews] = useState<ProjectReview[]>([]);
  
  // Form states
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState('');

  const [scalingDistrict, setScalingDistrict] = useState('');
  const [scalingContactName, setScalingContactName] = useState(currentUser.name || '');
  const [scalingContactPhone, setScalingContactPhone] = useState(currentUser.phone || '');
  const [scalingComments, setScalingComments] = useState('');
  const [scalingSubmitSuccess, setScalingSubmitSuccess] = useState(false);
  const [scalingSubmitError, setScalingSubmitError] = useState('');

  // Financial Model states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitSuccess, setFeedbackSubmitSuccess] = useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState('');
  const [hoveredExpense, setHoveredExpense] = useState<number | null>(null);

  // Partners, Licenses, Contracts states
  const [partners, setPartners] = useState<Partner[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // Interactive Franchise form state
  const [selectedFranchisePackage, setSelectedFranchisePackage] = useState<'start' | 'business' | 'government'>('start');
  const [scalingStep, setScalingStep] = useState<'package' | 'form' | 'agreement' | 'completed'>('package');
  const [signatureName, setSignatureName] = useState('');
  const [viewingContractType, setViewingContractType] = useState<'offer' | 'license' | 'entrepreneur' | 'nda' | null>(null);

  // New Franchise compare and lead submission states
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Lead form states
  const [leadOrg, setLeadOrg] = useState('');
  const [leadRegion, setLeadRegion] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPackage, setLeadPackage] = useState<'start' | 'business' | 'government'>('start');
  const [leadComment, setLeadComment] = useState('');
  const [leadConsent, setLeadConsent] = useState(false);
  const [leadSubmitSuccess, setLeadSubmitSuccess] = useState(false);
  const [leadSubmitError, setLeadSubmitError] = useState('');

  // Join the team states
  const [isJoinTeamModalOpen, setIsJoinTeamModalOpen] = useState(false);
  const [joinTeamText, setJoinTeamText] = useState('');
  const [joinTeamContact, setJoinTeamContact] = useState(currentUser.phone || '');
  const [joinTeamName, setJoinTeamName] = useState(currentUser.name || '');
  const [joinTeamSubmitSuccess, setJoinTeamSubmitSuccess] = useState(false);
  const [joinTeamSubmitError, setJoinTeamSubmitError] = useState('');

  // Subscribe to Partners, Licenses, Contracts
  useEffect(() => {
    const { role, isAdmin, isDeveloper, isPartner } = getUserRoleAndTariff(currentUser);
    const hasAccess = isAdmin || isDeveloper || isPartner || role === 'partner';

    if (isOffline || !hasAccess) {
      setPartners([
        {
          id: 'part_ustian',
          districtName: 'Устьянский район (Архангельская область)',
          contactName: 'Евгений Шарапов',
          contactPhone: '+7 (921) 244-11-22',
          selectedPackage: 'partner',
          royaltyModel: 'percent',
          royaltyPercentage: 3,
          status: 'approved',
          signedAgreement: true,
          createdAt: '2026-04-01T12:00:00.000Z',
          comments: 'активен'
        },
        {
          id: 'part_velsk',
          districtName: 'Вельский район',
          contactName: 'Андрей Ковалев',
          contactPhone: '+7 (921) 472-12-88',
          selectedPackage: 'regional',
          royaltyModel: 'percent',
          royaltyPercentage: 5,
          status: 'pending',
          signedAgreement: true,
          createdAt: '2026-05-10T14:30:00.000Z',
          comments: 'внедрение (июль 2026)'
        },
        {
          id: 'part_krasnobor',
          districtName: 'Красноборский район',
          contactName: 'Ирина Соболева',
          contactPhone: '+7 (911) 588-44-55',
          selectedPackage: 'local',
          royaltyModel: 'percent',
          royaltyPercentage: 5,
          status: 'pending',
          signedAgreement: true,
          createdAt: '2026-06-15T09:00:00.000Z',
          comments: 'внедрение (август 2026)'
        }
      ]);
      setLicenses([
        {
          id: 'lic_ustian',
          partnerId: 'part_ustian',
          districtName: 'Устьянский район (Архангельская область)',
          licenseType: 'partner',
          validFrom: '2026-04-01T12:00:00.000Z',
          validUntil: '2027-04-01T12:00:00.000Z',
          isActive: true,
          paymentStatus: 'paid',
          createdAt: '2026-04-01T12:00:00.000Z'
        },
        {
          id: 'lic_velsk',
          partnerId: 'part_velsk',
          districtName: 'Вельский район',
          licenseType: 'regional',
          validFrom: '2026-05-10T14:30:00.000Z',
          validUntil: '2027-05-10T14:30:00.000Z',
          isActive: true,
          paymentStatus: 'pending',
          createdAt: '2026-05-10T14:30:00.000Z'
        },
        {
          id: 'lic_krasnobor',
          partnerId: 'part_krasnobor',
          districtName: 'Красноборский район',
          licenseType: 'local',
          validFrom: '2026-06-15T09:00:00.000Z',
          validUntil: '2027-06-15T09:00:00.000Z',
          isActive: true,
          paymentStatus: 'pending',
          createdAt: '2026-06-15T09:00:00.000Z'
        }
      ]);
      setContracts([]);
      return;
    }

    const unsubPartners = dbSubscribePartners((list) => {
      if (list.length === 0) {
        setPartners([
          {
            id: 'part_ustian',
            districtName: 'Устьянский район (Архангельская область)',
            contactName: 'Евгений Шарапов',
            contactPhone: '+7 (921) 244-11-22',
            selectedPackage: 'partner',
            royaltyModel: 'percent',
            royaltyPercentage: 3,
            status: 'approved',
            signedAgreement: true,
            createdAt: '2026-04-01T12:00:00.000Z',
            comments: 'активен'
          },
          {
            id: 'part_velsk',
            districtName: 'Вельский район',
            contactName: 'Андрей Ковалев',
            contactPhone: '+7 (921) 472-12-88',
            selectedPackage: 'regional',
            royaltyModel: 'percent',
            royaltyPercentage: 5,
            status: 'pending',
            signedAgreement: true,
            createdAt: '2026-05-10T14:30:00.000Z',
            comments: 'внедрение (июль 2026)'
          },
          {
            id: 'part_krasnobor',
            districtName: 'Красноборский район',
            contactName: 'Ирина Соболева',
            contactPhone: '+7 (911) 588-44-55',
            selectedPackage: 'local',
            royaltyModel: 'percent',
            royaltyPercentage: 5,
            status: 'pending',
            signedAgreement: true,
            createdAt: '2026-06-15T09:00:00.000Z',
            comments: 'внедрение (август 2026)'
          }
        ]);
      } else {
        setPartners(list);
      }
    });

    const unsubLicenses = dbSubscribeLicenses((list) => {
      if (list.length === 0) {
        setLicenses([
          {
            id: 'lic_ustian',
            partnerId: 'part_ustian',
            districtName: 'Устьянский район (Архангельская область)',
            licenseType: 'partner',
            validFrom: '2026-04-01T12:00:00.000Z',
            validUntil: '2027-04-01T12:00:00.000Z',
            isActive: true,
            paymentStatus: 'paid',
            createdAt: '2026-04-01T12:00:00.000Z'
          },
          {
            id: 'lic_velsk',
            partnerId: 'part_velsk',
            districtName: 'Вельский район',
            licenseType: 'regional',
            validFrom: '2026-05-10T14:30:00.000Z',
            validUntil: '2027-05-10T14:30:00.000Z',
            isActive: true,
            paymentStatus: 'pending',
            createdAt: '2026-05-10T14:30:00.000Z'
          },
          {
            id: 'lic_krasnobor',
            partnerId: 'part_krasnobor',
            districtName: 'Красноборский район',
            licenseType: 'local',
            validFrom: '2026-06-15T09:00:00.000Z',
            validUntil: '2027-06-15T09:00:00.000Z',
            isActive: true,
            paymentStatus: 'pending',
            createdAt: '2026-06-15T09:00:00.000Z'
          }
        ]);
      } else {
        setLicenses(list);
      }
    });

    const unsubContracts = dbSubscribeContracts(setContracts);

    return () => {
      unsubPartners();
      unsubLicenses();
      unsubContracts();
    };
  }, [isOffline]);

  // 1. Subscribe to Project Stats
  useEffect(() => {
    if (isOffline) return;
    const unsub = onSnapshot(doc(db, 'project_stats', 'district_stats'), (docSnap) => {
      if (docSnap.exists()) {
        setStats(docSnap.data() as ProjectStats);
      }
    }, (error) => {
      console.error("Error subscribing to project stats:", error);
    });
    return () => unsub();
  }, [isOffline]);

  // 2. Subscribe to Project Reviews
  useEffect(() => {
    if (isOffline) return;
    const unsub = onSnapshot(collection(db, 'project_reviews'), (snapshot) => {
      const list: ProjectReview[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as ProjectReview;
        if (data.isPublic) {
          list.push(data);
        }
      });
      // Sort by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(list);
    }, (error) => {
      console.error("Error subscribing to project reviews:", error);
    });
    return () => unsub();
  }, [isOffline]);

  // Handle Review Submission
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setReviewSubmitError('');
    setReviewSubmitSuccess(false);

    const reviewId = `review_${Date.now()}`;
    const newReview: ProjectReview = {
      id: reviewId,
      userId: currentUser.id,
      userName: currentUser.name || 'Анонимный житель',
      userVillage: currentUser.village || 'Наш регион',
      rating: newReviewRating,
      text: newReviewText,
      isPublic: true,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save review to Firestore
      await setDoc(doc(db, 'project_reviews', reviewId), newReview);
      
      // 2. Increment stats count in Firestore
      const statsRef = doc(db, 'project_stats', 'district_stats');
      await updateDoc(statsRef, {
        totalReviews: increment(1),
        updatedAt: new Date().toISOString()
      });

      setNewReviewText('');
      setNewReviewRating(5);
      setReviewSubmitSuccess(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => setReviewSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      setReviewSubmitError(err.message || 'Ошибка отправки отзыва');
    }
  };

  // Handle Scaling Request and Partner Franchise Signing Submission
  const handleAddScalingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scalingDistrict.trim() || !scalingContactName.trim() || !scalingContactPhone.trim()) {
      setScalingSubmitError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setScalingSubmitError('');
    setScalingSubmitSuccess(false);

    const partnerId = `part_${Date.now()}`;
    const newPartner: Partner = {
      id: partnerId,
      districtName: scalingDistrict,
      contactName: scalingContactName,
      contactPhone: scalingContactPhone,
      selectedPackage: selectedFranchisePackage,
      royaltyModel: 'percent',
      royaltyPercentage: selectedFranchisePackage === 'start' ? 0 : selectedFranchisePackage === 'business' ? 5 : 3,
      status: 'approved',
      signedAgreement: true,
      createdAt: new Date().toISOString(),
      comments: scalingComments || 'Заявка через интерактивный кабинет',
      userId: currentUser.id
    };

    const licenseId = `lic_${Date.now()}`;
    const newLicense: License = {
      id: licenseId,
      partnerId: partnerId,
      districtName: scalingDistrict,
      licenseType: selectedFranchisePackage,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      isActive: true,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    const contractId = `cont_${Date.now()}`;
    const packageLabel = selectedFranchisePackage === 'start' ? 'СТАРТ' : selectedFranchisePackage === 'business' ? 'БИЗНЕС' : 'ГОСУДАРСТВО';
    const newContract: Contract = {
      id: contractId,
      userId: currentUser.id,
      userName: scalingContactName,
      type: 'license',
      status: 'signed',
      signedAt: new Date().toISOString(),
      ipAddress: '192.168.1.101',
      content: `Лицензионный договор на франшизу «Взаимопомощь». Пакет: ${packageLabel}. Район масштабирования: ${scalingDistrict}. Лицензиат: ${scalingContactName}. Цифровая подпись принята в системе «Взаимопомощь». IP подписанта: 192.168.1.101.`
    };

    try {
      if (!isOffline) {
        await dbCreatePartner(newPartner);
        await dbCreateLicense(newLicense);
        await dbCreateContract(newContract);
      } else {
        setPartners(prev => [newPartner, ...prev]);
        setLicenses(prev => [newLicense, ...prev]);
        setContracts(prev => [newContract, ...prev]);
      }

      setScalingDistrict('');
      setScalingComments('');
      setSignatureName('');
      setScalingSubmitSuccess(true);
      setScalingStep('completed');

      // Clear success message after 5 seconds
      setTimeout(() => setScalingSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error("Failed to submit scaling request:", err);
      setScalingSubmitError(err.message || 'Ошибка отправки заявки');
    }
  };

  // Handle Lead Form Submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadOrg.trim() || !leadRegion.trim() || !leadContact.trim() || !leadPhone.trim() || !leadEmail.trim() || !leadConsent) {
      setLeadSubmitError('Пожалуйста, заполните все обязательные поля и подтвердите согласие');
      return;
    }

    setLeadSubmitError('');
    setLeadSubmitSuccess(false);

    const leadId = `lead_${Date.now()}`;
    const newLead = {
      id: leadId,
      orgName: leadOrg,
      regionName: leadRegion,
      contactName: leadContact,
      contactPhone: leadPhone,
      contactEmail: leadEmail,
      selectedPackage: leadPackage,
      comment: leadComment,
      createdAt: new Date().toISOString()
    };

    try {
      if (!isOffline) {
        await setDoc(doc(db, 'franchise_leads', leadId), newLead);
      }
      
      // Add a pending partner entry locally to keep the UI rich
      const partnerId = `part_${Date.now()}`;
      const simulatedPartner: Partner = {
        id: partnerId,
        districtName: leadRegion,
        contactName: leadContact,
        contactPhone: leadPhone,
        selectedPackage: leadPackage,
        royaltyModel: 'percent',
        royaltyPercentage: leadPackage === 'government' ? 3 : leadPackage === 'business' ? 5 : 0,
        status: 'pending',
        signedAgreement: true,
        createdAt: new Date().toISOString(),
        comments: `внедрение (${new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })})`,
        userId: currentUser.id
      };

      setPartners(prev => [simulatedPartner, ...prev]);

      setLeadSubmitSuccess(true);
      
      // Reset fields
      setLeadOrg('');
      setLeadRegion('');
      setLeadContact('');
      setLeadPhone('');
      setLeadEmail('');
      setLeadComment('');
      setLeadConsent(false);

      setTimeout(() => {
        setLeadSubmitSuccess(false);
        setIsLeadModalOpen(false);
      }, 3000);
    } catch (err: any) {
      console.error("Failed to submit franchise lead:", err);
      setLeadSubmitError(err.message || 'Ошибка отправки заявки. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Helper to trigger virtual text file download for legal agreements
  const downloadContractFile = (type: 'offer' | 'license' | 'entrepreneur' | 'nda') => {
    let title = '';
    let content = '';
    if (type === 'offer') {
      title = 'Пользовательское_соглашение_Взаимопомощь.txt';
      content = `ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ ПЛАТФОРМЫ «ВЗАИМОПОМОЩЬ»\n\n` +
        `1. Общие положения: регулирует безвозмездное предоставление сервисов SOS, Ленты взаимопомощи для жителей.\n` +
        `2. Конфиденциальность: Платформа обязуется строго соблюдать ФЗ-152 «О персональных данных».\n` +
        `3. Торговые отношения: все сделки совершаются напрямую между жителями и предпринимателями.`;
    } else if (type === 'license') {
      title = 'Лицензионный_договор_Франшиза.txt';
      content = `ЛИЦЕНЗИОННЫЙ ДОГОВОР НА ИСПОЛЬЗОВАНИЕ ПЛАТФОРМЫ «ВЗАИМОПОМОЩЬ»\n\n` +
        `1. Предмет договора: предоставление ограниченного неисключительного права работы под брендом «Взаимопомощь».\n` +
        `2. Роялти: ЛОКАЛЬНЫЙ (5% от оборота), РЕГИОНАЛЬНЫЙ (5% от оборота), ПАРТНЁРСКИЙ (3% от оборота).\n` +
        `3. Техподдержка: сопровождение серверов на весь период действия оплаченной поддержки.`;
    } else if (type === 'entrepreneur') {
      title = 'Договор_оказания_услуг_предпринимателям.txt';
      content = `ДОГОВОР ОКАЗАНИЯ УСЛУГ И РАЗМЕЩЕНИЯ ТОВАРОВ ДЛЯ ПРЕДПРИНИМАТЕЛЕЙ\n\n` +
        `1. Предмет договора: предоставление цифровой витрины для размещения фермерских и локальных товаров.\n` +
        `2. Комиссия: базовая комиссия сервиса составляет 7% с каждого доставленного заказа.\n` +
        `3. Качество: продавец несет полную ответственность за соответствие стандартам качества РФ.`;
    } else if (type === 'nda') {
      title = 'NDA_Соглашение_о_неразглашении.txt';
      content = `СОГЛАШЕНИЕ О НЕРАЗГЛАШЕНИИ КОНФИДЕНЦИАЛЬНЫХ ДАННЫХ (NDA)\n\n` +
        `1. Определение конфиденциальности: исходный код, схемы СУБД, ПДн жителей и финансовая отчетность.\n` +
        `2. Обязанности сторон: принимать разумные меры для предотвращения утечки или копирования кода.\n` +
        `3. Ответственность: штраф в размере 500 000 рублей за каждый установленный факт нарушения.`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', title);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Join Team Application Submission
  const handleJoinTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinTeamText.trim()) return;

    setJoinTeamSubmitError('');
    setJoinTeamSubmitSuccess(false);

    const feedbackId = `join_team_${Date.now()}`;
    const newFeedback: ProjectReview = {
      id: feedbackId,
      userId: currentUser.id,
      userName: joinTeamName || currentUser.name || 'Анонимный соратник',
      userVillage: currentUser.village || 'Наш регион',
      rating: 5,
      text: `[ПРИСОЕДИНЯЙСЯ К КОМАНДЕ / ЗАЯВКА]:\nКонтакты: ${joinTeamContact}\nСообщение: ${joinTeamText}`,
      isPublic: false, // Not public
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'project_reviews', feedbackId), newFeedback);
      setJoinTeamText('');
      setJoinTeamSubmitSuccess(true);
      setTimeout(() => {
        setJoinTeamSubmitSuccess(false);
        setIsJoinTeamModalOpen(false);
      }, 3000);
    } catch (err: any) {
      console.error("Failed to submit join team application:", err);
      setJoinTeamSubmitError(err.message || 'Ошибка отправки сообщения');
    }
  };

  // Handle Feedback Submission (Financial Transparency)
  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setFeedbackSubmitError('');
    setFeedbackSubmitSuccess(false);

    const feedbackId = `feedback_${Date.now()}`;
    const newFeedback: ProjectReview = {
      id: feedbackId,
      userId: currentUser.id,
      userName: currentUser.name || 'Анонимный житель',
      userVillage: currentUser.village || 'Наш регион',
      rating: 5,
      text: `[ФИНАНСЫ / ОБРАТНАЯ СВЯЗЬ]: ${feedbackText}`,
      isPublic: false, // NOT PUBLIC, so it won't show in the public reviews list
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'project_reviews', feedbackId), newFeedback);
      setFeedbackText('');
      setFeedbackSubmitSuccess(true);
      setTimeout(() => setFeedbackSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error("Failed to submit feedback:", err);
      setFeedbackSubmitError(err.message || 'Ошибка отправки сообщения');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" id="about_project_screen">
      {/* Header back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            id="btn_about_back"
            title="Назад"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight animate-fadeIn" id="about_title" style={{ fontFamily: '"Nexa Bold", "Inter", sans-serif' }}>
              О проекте
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Цифровая экосистема добрососедства
            </p>
          </div>
        </div>
        <div className="self-start sm:self-center shrink-0">
          <BrandLogo variant="badge" />
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 mb-6" id="about_tabs_list">
        {[
          { id: 'mission', label: 'Миссия', icon: Heart },
          { id: 'goals', label: 'Цели и задачи', icon: Target },
          { id: 'stats', label: 'Статистика', icon: BarChart3 },
          { id: 'how_it_works', label: 'Как это работает', icon: HelpCircle },
          { id: 'achievements', label: 'Достижения', icon: Trophy },
          { id: 'reviews', label: 'Отзывы жителей', icon: MessageSquare },
          { id: 'scaling', label: 'Масштабирование', icon: Share2 },
          { id: 'finance', label: 'Финансовая модель', icon: Coins },
          { id: 'join_team', label: 'Присоединяйся к команде', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer rounded-xl ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
              id={`tab_about_${tab.id}`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content tabs screen */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-100"
          id={`about_content_${activeTab}`}
        >
          {/* TAB 1: MISSION */}
          {activeTab === 'mission' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={12} /> Наша миссия
                  </div>

                  {/* Official RuStore Description Card */}
                  <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🤝</span>
                      <span className="text-xs font-black tracking-widest text-emerald-300 uppercase">
                        Официальная версия для RuStore
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      «Взаимопомощь» — простое и бесплатное приложение для жителей сёл и деревень
                    </h2>
                    <p className="text-sm text-emerald-100 font-medium leading-relaxed">
                      Помогайте соседям: подвезите до райцентра, поделитесь рассадой, помогите починить забор или просто поговорите.
                    </p>
                    <div className="bg-white/10 rounded-2xl p-4 space-y-2 text-xs sm:text-sm font-semibold text-emerald-50">
                      <div className="font-black text-white uppercase text-[11px] tracking-wider mb-1">В приложении:</div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-300">✔</span> Взаимная помощь (просьбы и предложения)
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-300">✔</span> Поиск попуток между деревнями
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-300">✔</span> Пункты приёма батареек
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-300">✔</span> Уроки по использованию смартфона для старшего поколения
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-xs font-black text-emerald-200 text-center">
                      Никакой рекламы. Никаких платных функций. Всё бесплатно и для людей.
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/10 p-3.5 rounded-2xl">
                      <span className="text-xs text-emerald-100 font-medium text-center sm:text-left">
                        Готовы собрать APK и выгрузить приложение в каталог RuStore?
                      </span>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('rustore_publish')}
                          className="w-full sm:w-auto px-4 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                          🚀 Мастер сборки APK
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-slate-800 leading-relaxed text-lg font-medium">
                      «Взаимопомощь» — это приложение, которое мы создаём для всех, кто верит в силу добрососедства.
                    </p>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6 space-y-3">
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <span>Сегодня мы:</span>
                      </h3>
                      <ul className="space-y-3 text-slate-700 text-sm">
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 font-black text-base leading-none select-none">—</span>
                          <span>Тестируем приложение в Устьянском районе</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 font-black text-base leading-none select-none">—</span>
                          <span>Собираем отзывы жителей</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 font-black text-base leading-none select-none">—</span>
                          <span>Дорабатываем функции</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-emerald-500 font-black text-base leading-none select-none">—</span>
                          <span>Готовимся к запуску в других регионах</span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-slate-800 font-bold leading-relaxed text-base pt-2">
                      Мы не продаём обещания. Мы создаём решение вместе с вами.
                    </p>

                    <p className="text-slate-600 leading-relaxed text-sm">
                      Хотите помочь? Установите приложение, попробуйте, напишите свои идеи. Вместе мы сделаем «Взаимопомощь» лучшим приложением для каждого региона России.
                    </p>

                    <p className="text-slate-900 font-extrabold text-base pt-3 flex items-center gap-2">
                      ❤️ Спасибо, что вы с нами!
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-80 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between aspect-square md:aspect-auto md:h-80 shrink-0">
                  <div className="space-y-4">
                    <Heart size={40} className="fill-white/20 animate-pulse text-white" />
                    <h3 className="text-xl font-bold">Главный принцип:</h3>
                    <p className="text-emerald-50 text-sm leading-relaxed">
                      "Понятно каждому жителю, вдохновляет на добрые дела и укрепляет веру в будущее нашей страны."
                    </p>
                  </div>
                  <div className="text-xs text-emerald-200/80 font-mono mt-4">
                    Экосистема Взаимопомощи • 2026
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Наши цели и задачи</h2>
                <p className="text-slate-500 text-sm">
                  Мы ставим перед собой амбициозные, но конкретные задачи для всесторонней поддержки жителей всех регионов.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {[
                  {
                    num: '01',
                    title: 'Развитие культуры взаимопомощи',
                    desc: 'Создать удобный инструмент для оперативного решения бытовых проблем жителей силами отзывчивых соседей и добровольных помощников.',
                    icon: Heart,
                    color: 'text-rose-600 bg-rose-50'
                  },
                  {
                    num: '02',
                    title: 'Поддержка семей и старшего поколения',
                    desc: 'Облегчить жизнь пожилым людям и детям через адаптированные интерфейсы, семейную привязку аккаунтов и быстрое реагирование на SOS.',
                    icon: Users,
                    color: 'text-indigo-600 bg-indigo-50'
                  },
                  {
                    num: '03',
                    title: 'Развитие локального предпринимательства',
                    desc: 'Предоставить бесплатную витрину для местных ремесленников, фермеров и мастеров услуг с прозрачным рейтингом и защитой сделок.',
                    icon: Trophy,
                    color: 'text-amber-600 bg-amber-50'
                  },
                  {
                    num: '04',
                    title: 'Сохранение природы и экологии',
                    desc: 'Вовлекать жителей в экологические инициативы, совместную посадку деревьев, расчистку лесов от свалок и цивилизованный сбор батареек.',
                    icon: Sparkles,
                    color: 'text-emerald-600 bg-emerald-50'
                  },
                  {
                    num: '05',
                    title: 'Стирание границ между населенными пунктами',
                    desc: 'Решить проблему транспортной доступности через совместные поездки на попутках и информирование о качестве и состоянии дорог.',
                    icon: MapPin,
                    color: 'text-teal-600 bg-teal-50'
                  }
                ].map((goal, idx) => {
                  const GoalIcon = goal.icon;
                  return (
                    <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xs transition-shadow">
                      <div className={`p-4 rounded-xl flex items-center justify-center self-start ${goal.color}`}>
                        <GoalIcon size={24} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">{goal.num}</span>
                          <h3 className="font-bold text-slate-900 text-lg leading-snug">{goal.title}</h3>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{goal.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Цифры нашего района</h2>
                  <p className="text-slate-500 text-sm">
                    Каждое доброе дело и новое подключение отображается в нашей статистике в реальном времени.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Обновляется из Firestore
                </div>
              </div>

              {/* Real-time stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { label: 'Жителей в сети', value: stats.activeUsers, icon: Activity, color: 'from-emerald-500 to-teal-600' },
                  { label: 'Всего зарегистрировано', value: stats.totalUsers, icon: Users, color: 'from-indigo-500 to-blue-600' },
                  { label: 'Добрых дел сделано', value: stats.totalHelpProvided, icon: Heart, color: 'from-rose-500 to-pink-600' },
                  { label: 'Активных мастеров', value: stats.totalMasters, icon: Trophy, color: 'from-amber-500 to-orange-600' },
                  { label: 'Предпринимателей', value: stats.totalEntrepreneurs, icon: Building2, color: 'from-violet-500 to-purple-600' },
                  { label: 'Детей в безопасном режиме', value: stats.totalChildren, icon: Shield, color: 'from-sky-500 to-blue-600' },
                  { label: 'Пожилых в обучении', value: stats.totalElderly, icon: Info, color: 'from-emerald-400 to-emerald-600' },
                  { label: 'Отзывов получено', value: stats.totalReviews, icon: MessageSquare, color: 'from-fuchsia-500 to-pink-600' },
                  { label: 'Экологических акций', value: stats.totalEcoEvents, icon: Sparkles, color: 'from-green-500 to-emerald-600' },
                  { label: 'Доставок продуктов', value: stats.totalDeliveries, icon: Share2, color: 'from-cyan-500 to-teal-600' }
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between gap-4">
                      <div className="flex justify-between items-start">
                        <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{item.label}</div>
                        <ItemIcon size={18} className="text-slate-400" />
                      </div>
                      <div className="font-mono text-3xl font-extrabold text-slate-800 tracking-tight">
                        {item.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 font-medium flex justify-between items-center mt-4">
                <span>Последнее обновление БД: {new Date(stats.updatedAt).toLocaleString('ru-RU')}</span>
                <span>Статус сети: {isOffline ? '⚠️ Автономный режим' : '🟢 В сети'}</span>
              </div>
            </div>
          )}

          {/* TAB 4: HOW IT WORKS */}
          {activeTab === 'how_it_works' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Как это работает? 5 простых шагов</h2>
              
              <div className="relative border-l-2 border-emerald-100 ml-4 pl-8 space-y-8 py-2">
                {[
                  {
                    step: '1',
                    title: 'Быстрая регистрация по номеру',
                    desc: 'Зарегистрируйтесь за 30 секунд. Укажите ваше реальное имя, номер телефона и укажите населенный пункт вашего проживания.'
                  },
                  {
                    step: '2',
                    title: 'Выберите вашу роль на платформе',
                    desc: 'Обычный житель, квалифицированный мастер, фермер-предприниматель или настройте семейный аккаунт для пожилых родителей и детей.'
                  },
                  {
                    step: '3',
                    title: 'Разместите заявку или предложение',
                    desc: 'Если вам нужна помощь — нажмите «Помогите!» и создайте заявку. Если вы мастер или хотите помочь — откликнитесь в общей Ленте взаимопомощи.'
                  },
                  {
                    step: '4',
                    title: 'Помогайте соседям и повышайте рейтинг',
                    desc: 'За каждое успешно выполненное дело получайте искренние «спасибо» от соседей, увеличивающие ваш авторитет в районе.'
                  },
                  {
                    step: '5',
                    title: 'Пользуйтесь безопасными эко-сервисами',
                    desc: 'Участвуйте в совместных поездках, сообщайте о состоянии дорог, собирайте батарейки и делайте наш общий устьянский дом чище.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Step indicator circle */}
                    <span className="absolute -left-14 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-600 text-white font-extrabold font-mono text-sm shadow-xs">
                      {item.step}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ banner */}
              {onNavigate && (
                <div className="mt-8 p-5 bg-teal-50 border-2 border-teal-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-sm">
                      Остались вопросы о правилах и возможностях?
                    </h4>
                    <p className="text-xs text-slate-600">
                      Откройте подробный справочник жителя с ответами на частые вопросы.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('faq')}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
                  >
                    ❓ Открыть раздел «Помощь и FAQ»
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Наши достижения</h2>
              <p className="text-slate-500 text-sm mb-6">
                Маленькие шаги, которые приводят к большим изменениям в качестве жизни в наших регионах.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: '🏆 Народный проект',
                    metric: 'Топ-1',
                    desc: 'Платформа признана лучшей локальной инициативой года по развитию добрососедства и взаимопомощи.'
                  },
                  {
                    title: '🌿 Эко-Прорыв',
                    metric: '135 кг',
                    desc: 'Собрано и безопасно утилизировано батареек жителями района через наши партнерские эко-пункты.'
                  },
                  {
                    title: '👵 Безопасность старших',
                    metric: '20+',
                    desc: 'Пожилых жителей района прошли бесплатное обучение работе с платформой и успешно пользуются ею.'
                  },
                  {
                    title: '🚗 Быстрый отклик',
                    metric: '15 мин',
                    desc: 'Среднее время отклика соседей на критически важные заявки помощи по дому в зимний период.'
                  },
                  {
                    title: '🚜 Чистые дороги',
                    metric: '30+',
                    desc: 'Своевременных отчетов о завалах на дорогах отправлено дорожным службам благодаря активности водителей.'
                  },
                  {
                    title: '🍎 Поддержка фермеров',
                    metric: '100%',
                    desc: 'Все продовольственные сделки осуществляются напрямую без посредников, сохраняя низкие цены.'
                  }
                ].map((ach, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-lg">{ach.title}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{ach.desc}</p>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-600 font-mono self-end">
                      {ach.metric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Reviews List */}
                <div className="lg:col-span-7 space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-emerald-600" /> Отзывы жителей ({reviews.length})
                  </h2>

                  {reviews.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 text-sm">Здесь пока нет отзывов. Будьте первыми, кто оставит свой отзыв!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{rev.userName}</div>
                              <div className="text-slate-500 text-xs">{rev.userVillage}</div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  className={i < rev.rating ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-300'} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed italic">
                            "{rev.text}"
                          </p>
                          <div className="text-[10px] text-slate-400 text-right">
                            {new Date(rev.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form to Add Review */}
                <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-100 self-start">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star size={18} className="text-emerald-600" /> Написать отзыв о проекте
                  </h3>
                  
                  <form onSubmit={handleAddReview} className="space-y-4">
                    {reviewSubmitSuccess && (
                      <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in flex items-center gap-2">
                        <CheckCircle size={14} /> Отзыв успешно опубликован!
                      </div>
                    )}
                    
                    {reviewSubmitError && (
                      <div className="p-3 bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl animate-fade-in">
                        {reviewSubmitError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 block">Ваша оценка проекту</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                            title={`${star} звезд`}
                          >
                            <Star 
                              size={28} 
                              className={star <= newReviewRating ? 'fill-amber-400 stroke-amber-400' : 'stroke-slate-300'} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">Текст отзыва</label>
                      <textarea
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Пожалуйста, расскажите, как наше приложение помогло вам или вашим близким..."
                        className="w-full h-32 p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isOffline || !newReviewText.trim()}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      Отправить отзыв
                    </button>
                    {isOffline && (
                      <p className="text-[10px] text-slate-500 text-center">Отправка отзывов недоступна в автономном режиме</p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SCALING */}
          {/* TAB 7: SCALING */}
          {activeTab === 'scaling' && (
            <div className="space-y-8 animate-fadeIn" id="about_scaling_section">
              {/* Main Headline */}
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Share2 size={12} /> Масштабирование
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Как мы растем
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                  Мы строим приложение для всей страны. Но начинаем с малого — с родного района.
                </p>
              </div>

              {/* Current stage card */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                <div className="md:col-span-3 space-y-6">
                  <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                      <Sparkles className="text-indigo-600 animate-pulse" size={20} />
                      <span>Сегодня мы на этапе:</span>
                    </h3>
                    <ul className="space-y-3.5 text-slate-700 text-sm md:text-base font-medium">
                      <li className="flex items-start gap-3">
                        <span className="text-indigo-600 font-extrabold text-lg leading-none select-none">•</span>
                        <span>Тестирования базовых функций</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-indigo-600 font-extrabold text-lg leading-none select-none">•</span>
                        <span>Сбора отзывов от первых пользователей</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-indigo-600 font-extrabold text-lg leading-none select-none">•</span>
                        <span>Доработки интерфейса</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-indigo-600 font-extrabold text-lg leading-none select-none">•</span>
                        <span>Подготовки к внедрению в соседние районы</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 md:p-8 space-y-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-lg font-extrabold text-indigo-950">
                        Хотите внедрить «Взаимопомощь» в своём районе?
                      </h4>
                      <p className="text-indigo-800 text-sm leading-relaxed font-semibold">
                        Мы открыты к диалогу.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsLeadModalOpen(true)}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transform hover:-translate-y-0.5"
                    >
                      <Send className="animate-pulse" size={16} />
                      <span>Связаться с разработчиком</span>
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between h-full aspect-square md:aspect-auto md:min-h-[340px]">
                  <div className="space-y-4">
                    <Share2 size={40} className="fill-white/10 text-white" />
                    <h3 className="text-xl font-bold">Строим вместе</h3>
                    <p className="text-indigo-50 text-sm leading-relaxed">
                      Цифровое решение должно приносить реальную пользу. Каждый отзыв и предложение помогают нам делать платформу надежнее и проще для жителей.
                    </p>
                  </div>
                  <div className="text-xs text-indigo-200/80 font-mono mt-4">
                    Экосистема Масштабирования • 2026
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: FINANCE (FINANCIAL MODEL & SUSTAINABILITY) */}
          {activeTab === 'finance' && (
            <div className="space-y-8" id="about_finance_section">
              {/* Main Headline */}
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Coins size={12} /> Прозрачность и устойчивость
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Как устроена финансовая модель проекта «Взаимопомощь»
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                  Прозрачность — основа доверия. Мы не берём денег с жителей за базовые функции взаимопомощи, но у нас есть устойчивая модель, которая позволяет приложению жить, оплачивать сервера и развиваться.
                </p>
              </div>

              {/* SECTION 1: ALWAYS FREE FOR RESIDENTS */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                      <Heart className="text-emerald-600 fill-emerald-100" size={24} />
                      💚 Для жителей — всегда БЕСПЛАТНО
                    </h3>
                    <p className="text-emerald-800/80 text-sm mt-1">
                      Мы создаём приложение для людей, а не для извлечения сверхприбыли. Это наш главный и неизменный принцип.
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xs shrink-0">
                    БЕЗ ОГРАНИЧЕНИЙ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { title: 'Помощь соседям', desc: 'Размещение заявок и предложений' },
                    { title: 'Чат и общение', desc: 'Обсуждение деталей, договоренности' },
                    { title: 'SOS 112', desc: 'Экстренный вызов служб спасения' },
                    { title: 'Обучение пожилых', desc: 'Школа цифровой грамотности в деревнях' },
                    { title: 'Детский режим', desc: 'Безопасная экосистема для детей' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                        <h4 className="font-bold text-emerald-950 text-xs sm:text-sm leading-tight">{item.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-emerald-900/60 font-semibold italic text-center border-t border-emerald-100/50 pt-4">
                  🤝 Никто из жителей никогда не заплатит за использование приложения «Взаимопомощь».
                </p>
              </div>

              {/* SECTION 2: REVENUE & EXPENSES SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                
                {/* Income Sources (7 col) */}
                <div className="lg:col-span-6 space-y-6">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-600" />
                    Откуда берутся деньги на существование?
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Source 1 */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex gap-4 hover:shadow-2xs transition-all">
                      <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 text-emerald-600">
                        <Building2 size={24} />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-1">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">1. Комиссия с заказов (7%)</h4>
                          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">~15 000 ₽ / мес</span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Когда житель заказывает свежие продукты или изделия у местных фермеров и предпринимателей через витрину, платформа удерживает небольшую комиссию в размере 7%. Это существенно меньше, чем комиссии любых крупных маркетплейсов (до 25%).
                        </p>
                      </div>
                    </div>

                    {/* Source 2 */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex gap-4 hover:shadow-2xs transition-all">
                      <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 text-indigo-600">
                        <Trophy size={24} />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-1">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">2. Подписка для предпринимателей</h4>
                          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">~25 000 ₽ / мес</span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Для мастеров услуг и фермеров, желающих размещать расширенный каталог товаров и получать приоритетное отображение:
                        </p>
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className="bg-white border border-slate-150 p-2 rounded-xl text-center">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Базовый</span>
                            <span className="font-mono text-xs font-bold text-emerald-600">500 ₽</span>
                            <span className="block text-[8px] text-slate-400 mt-0.5">До 20 тов.</span>
                          </div>
                          <div className="bg-indigo-50/50 border border-indigo-100 p-2 rounded-xl text-center">
                            <span className="block text-[10px] font-bold text-indigo-500 uppercase">PRO</span>
                            <span className="font-mono text-xs font-bold text-indigo-600">1 500 ₽</span>
                            <span className="block text-[8px] text-indigo-400 mt-0.5">Безлимит</span>
                          </div>
                          <div className="bg-amber-50/50 border border-amber-100 p-2 rounded-xl text-center animate-pulse">
                            <span className="block text-[10px] font-bold text-amber-600 uppercase">VIP</span>
                            <span className="font-mono text-xs font-bold text-amber-700">5 000 ₽</span>
                            <span className="block text-[8px] text-amber-500 mt-0.5">В ТОП-3</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Source 3 */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 flex gap-4 hover:shadow-2xs transition-all">
                      <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 text-amber-600">
                        <Sparkles size={24} />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start flex-wrap gap-1">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">3. Гранты и господдержка</h4>
                          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">~10 000 ₽ / мес</span>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Команда регулярно участвует в грантовых конкурсах социально значимых инициатив: <strong>Президентский фонд культурных инициатив</strong>, <strong>Гранты губернатора Архангельской области</strong> и <strong>Фонд поддержки социальных проектов</strong> (в среднем около 120 000 ₽ в год).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white flex justify-between items-center shadow-md">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-100">Итого стабильный бюджет</div>
                      <div className="text-sm font-semibold text-emerald-100/90 mt-0.5">Среднемесячные сборы проекта</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-2xl md:text-3xl font-black">~50 000 ₽</span>
                      <span className="block text-[10px] text-emerald-100 font-mono">в месяц</span>
                    </div>
                  </div>
                </div>

                {/* Expense Breakdown with interactive SVG Donut Chart (5 col) */}
                <div className="lg:col-span-6 space-y-6">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <BarChart3 size={20} className="text-indigo-600" />
                    Куда распределяются средства?
                  </h3>

                  {/* Donut section */}
                  <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col sm:flex-row items-center gap-6 justify-center">
                    
                    {/* SVG Donut */}
                    <div className="relative w-[150px] h-[150px] shrink-0">
                      <svg width="150" height="150" className="transform rotate-0">
                        <circle
                          cx="75"
                          cy="75"
                          r="55"
                          fill="transparent"
                          stroke="#f1f5f9"
                          strokeWidth="14"
                        />
                        {(() => {
                          const expenseCategoriesList = [
                            { percentage: 40, color: '#10b981', hoverColor: '#059669' }, // Развитие
                            { percentage: 25, color: '#0ea5e9', hoverColor: '#0284c7' }, // Инфраструктура
                            { percentage: 20, color: '#6366f1', hoverColor: '#4f46e5' }, // Поддержка
                            { percentage: 10, color: '#f59e0b', hoverColor: '#d97706' }, // Продвижение
                            { percentage: 5, color: '#64748b', hoverColor: '#475569' }   // Резерв
                          ];
                          const radius = 55;
                          const circumference = 2 * Math.PI * radius; // ~345.57
                          let runningSum = 0;
                          
                          return expenseCategoriesList.map((cat, idx) => {
                            const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                            const strokeDashoffset = -((runningSum / 100) * circumference);
                            runningSum += cat.percentage;
                            const isHovered = hoveredExpense === idx;
                            
                            return (
                              <circle
                                key={idx}
                                cx="75"
                                cy="75"
                                r={radius}
                                fill="transparent"
                                stroke={isHovered ? cat.hoverColor : cat.color}
                                strokeWidth={isHovered ? 16 : 14}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                onMouseEnter={() => setHoveredExpense(idx)}
                                onMouseLeave={() => setHoveredExpense(null)}
                                className="transition-all duration-200 cursor-pointer origin-center -rotate-90"
                                style={{ transformOrigin: '75px 75px' }}
                              />
                            );
                          });
                        })()}
                      </svg>
                      {/* Text in the Center */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        {hoveredExpense !== null ? (
                          <>
                            <span className="text-lg font-black font-mono text-slate-800 leading-none">
                              {
                                hoveredExpense === 0 ? '40%' :
                                hoveredExpense === 1 ? '25%' :
                                hoveredExpense === 2 ? '20%' :
                                hoveredExpense === 3 ? '10%' : '5%'
                              }
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                              {
                                hoveredExpense === 0 ? '20 000 ₽' :
                                hoveredExpense === 1 ? '12 500 ₽' :
                                hoveredExpense === 2 ? '10 000 ₽' :
                                hoveredExpense === 3 ? '5 000 ₽' : '2 500 ₽'
                              }
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Итого</span>
                            <span className="text-xl font-extrabold font-mono text-slate-800 leading-tight">50k ₽</span>
                            <span className="text-[8px] font-medium text-slate-400">100% / Мес</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-1.5 flex-1 w-full">
                      {[
                        { name: 'Развитие и обновления (40%)', amount: '20 000 ₽', color: 'bg-emerald-500' },
                        { name: 'Инфраструктура и SMS (25%)', amount: '12 500 ₽', color: 'bg-sky-500' },
                        { name: 'Поддержка и SOS (20%)', amount: '10 000 ₽', color: 'bg-indigo-500' },
                        { name: 'Продвижение в селах (10%)', amount: '5 000 ₽', color: 'bg-amber-500' },
                        { name: 'Страховой резерв (5%)', amount: '2 500 ₽', color: 'bg-slate-500' }
                      ].map((item, idx) => (
                        <div 
                          key={idx} 
                          onMouseEnter={() => setHoveredExpense(idx)}
                          onMouseLeave={() => setHoveredExpense(null)}
                          className={`flex justify-between items-center px-2 py-1 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                            hoveredExpense === idx ? 'bg-slate-200/50 text-slate-900' : 'text-slate-600 hover:bg-slate-100/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-mono text-slate-800 text-[11px] font-bold">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hover explanation info box */}
                  <div className="h-20 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center text-center">
                    {hoveredExpense !== null ? (
                      <div className="animate-fade-in space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">
                          {
                            hoveredExpense === 0 ? '💻 Развитие и программные обновления' :
                            hoveredExpense === 1 ? '☁️ Техническая инфраструктура' :
                            hoveredExpense === 2 ? '🤝 Круглосуточная поддержка и SOS' :
                            hoveredExpense === 3 ? '📣 Локальное информирование' :
                            hoveredExpense === 4 ? '🛠️ Страховой резерв проекта' : ''
                          }
                        </h4>
                        <p className="text-[10.5px] text-slate-500 leading-tight">
                          {
                            hoveredExpense === 0 ? 'Регулярная разработка новых функций, устранение критических багов и поддержка совместимости.' :
                            hoveredExpense === 1 ? 'Оплата хостинга базы данных Firestore, облачных функций и SMS-шлюзов подтверждения входа жителей.' :
                            hoveredExpense === 2 ? 'Модерация объявлений, круглосуточная обработка сигналов SOS-112 и обучение жителей.' :
                            hoveredExpense === 3 ? 'Печать информационных брошюр для деревень, выезды в сельсоветы для презентаций.' :
                            hoveredExpense === 4 ? 'Резервные средства на покрытие непредвиденных скачков трафика или форс-мажоров.' : ''
                          }
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Наведите курсор на сегмент диаграммы или строку легенды, чтобы узнать подробнее о расходах</span>
                    )}
                  </div>
                </div>
              </div>

              {/* FRANCHISE MODEL FOR FUTURE SCALING */}
              <div className="pt-6 border-t border-slate-100 space-y-6" id="about_franchise_model_section">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Share2 size={12} /> Франчайзинговая модель
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                    Потенциал расширения и масштабирования
                  </h3>
                  
                  {/* Disclaimer for the future */}
                  <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex gap-3 text-slate-700 text-xs md:text-sm font-medium leading-relaxed">
                    <span className="text-xl shrink-0">⏳</span>
                    <p>
                      <strong>Планы на будущее:</strong> Франчайзинговая модель пока разрабатывается на будущее, когда приложение будет интересно предпринимателям и оценено по достоинству администрацией районов и областей при территориальном расширении.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Plan 1: Base */}
                  <div className="bg-white border border-slate-200 hover:border-emerald-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-sm transition-all relative overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Base</span>
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">На будущее</span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-mono text-3xl font-black text-slate-900">49 000 ₽</div>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Для регионов, которым нужна только основная часть приложения.
                        </p>
                      </div>
                      
                      <div className="border-t border-slate-100 pt-4">
                        <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span>Основная система взаимопомощи</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span>Экстренное оповещение (SOS 112)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span>Базовая техническая поддержка</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Plan 2: Pro */}
                  <div className="bg-gradient-to-b from-white to-emerald-50/10 border-2 border-emerald-500 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                      Рекомендуемый
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">Pro</span>
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">На будущее</span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-mono text-3xl font-black text-emerald-950">149 000 ₽</div>
                        <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                          Для тех, кто хочет получить расширенный пакет модулей.
                        </p>
                      </div>
                      
                      <div className="border-t border-emerald-100 pt-4">
                        <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span className="font-bold">Все возможности тарифа Base</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span>Расширенный пакет сервисных модулей</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span>Панель аналитики района</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Plan 3: VIP */}
                  <div className="bg-white border border-slate-200 hover:border-amber-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-sm transition-all relative overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">VIP</span>
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">На будущее</span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-mono text-3xl font-black text-slate-900">349 000 ₽</div>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                          Для тех, кто хочет настроить всё под свой регион, включая расширения для маркетплейсового модуля.
                        </p>
                      </div>
                      
                      <div className="border-t border-slate-100 pt-4">
                        <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span className="font-bold">Полный пакет кастомизации</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span className="font-bold text-amber-700">Расширения для маркетплейса</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                            <span>Индивидуальный брендбук региона</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION FOR ENTREPRENEURS WITH EXACT CALCULATION */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-4 shadow-lg border border-slate-800" id="entrepreneur_calculation_block">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp size={16} /> Для предпринимателей — Финансовый расчёт франшизы
                  </div>
                  
                  <h4 className="text-lg md:text-xl font-black text-white">
                    Применение тарифа Pro (149 000 ₽):
                  </h4>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 md:p-6 space-y-3 font-sans">
                    <div className="space-y-2 text-xs md:text-sm text-slate-200 font-medium">
                      <p className="flex justify-between border-b border-slate-700/80 pb-2">
                        <span>— Подключение 10 мастеров:</span>
                        <strong className="font-mono text-amber-300">10 х 500 ₽ = 5 000 ₽/мес</strong>
                      </p>
                      <p className="flex justify-between border-b border-slate-700/80 pb-2">
                        <span>— Подключение 5 предпринимателей:</span>
                        <strong className="font-mono text-amber-300">5 х 1 500 ₽ = 7 500 ₽/мес</strong>
                      </p>
                      <p className="flex justify-between border-b border-slate-700/80 pb-2">
                        <span>— Продажи в маркетплейсе:</span>
                        <strong className="font-mono text-amber-300">15 000 ₽/мес</strong>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-2 text-sm md:text-base font-extrabold border-t border-slate-600">
                      <span className="text-emerald-400">Итого доход:</span>
                      <span className="font-mono text-lg text-emerald-400">27 500 ₽/мес</span>
                    </div>

                    <div className="bg-emerald-950/90 border border-emerald-500/40 rounded-xl p-3 text-xs md:text-sm font-bold text-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <span>Окупаемость:</span>
                      <span className="font-mono text-sm md:text-base text-amber-300">149 000 / 27 500 = 5,4 месяца (около 5–6 месяцев).</span>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 text-xs md:text-sm font-semibold text-amber-200 leading-relaxed">
                    «Данный финансовый расчет показывает реальную окупаемость франшизы при минимальной активности в районе. Это отличная возможность для местных предпринимателей не только заработать, но и развить экономику своего региона!»
                  </div>
                </div>
              </div>

              {/* SECTION 3: WHY SUSTAINABILITY IS IMPORTANT */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Target size={20} className="text-emerald-600" />
                  Почему важна финансовая устойчивость?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {[
                    { title: '🔒 Стабильность', desc: 'Приложение не закроется через месяц из-за долгов за сервер. Мы планируем работу на годы вперед.' },
                    { title: '💎 Качество', desc: 'Мы можем привлекать квалифицированных разработчиков, дизайнеров и модераторов, а не работать на голом энтузиазме.' },
                    { title: '🚀 Развитие', desc: 'Постоянно выпускаются обновления, адаптируемые под реальные запросы жителей и пожелания представителей локальных сообществ.' },
                    { title: '🌍 Масштаб', desc: 'Мы создаем гибкое и надёжное ядро, которое можно легко адаптировать для любого города, района или региона.' },
                    { title: '🛡️ Независимость', desc: 'Мы не зависим от воли одного спонсора или разового гранта. Экосистема самодостаточна.' }
                  ].map((why, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1 hover:-translate-y-0.5 transition-transform">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{why.title}</h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal">{why.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: TRANSPARENCY TOOLS & FEEDBACK */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 border-t border-slate-100">
                
                {/* Transparency Tools (7 col) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Shield size={20} className="text-emerald-600" />
                    Инструменты открытости
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Public Reports card */}
                    <div className="border border-slate-150 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:shadow-2xs transition-all bg-white">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <FileText size={18} />
                          <h4 className="font-bold text-slate-900 text-sm">Публичная отчетность</h4>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Один раз в три месяца мы сводим финансовый баланс и публикуем детальную ведомость доходов и расходов проекта.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                      >
                        📊 Смотреть отчет за Q1 2026
                        <ArrowUpRight size={14} />
                      </button>
                    </div>

                    {/* Roadmap card */}
                    <div className="border border-slate-150 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:shadow-2xs transition-all bg-white">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-700">
                          <Calendar size={18} />
                          <h4 className="font-bold text-slate-900 text-sm">Цели и дорожная карта</h4>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Показываем, на какие новые социальные и экологические модули мы собираем средства и каков текущий статус разработки.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsRoadmapModalOpen(true)}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                      >
                        📋 Дорожная карта развития
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feedback Form (5 col) */}
                <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-100 self-start space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare size={16} className="text-emerald-600" />
                    Задать вопрос о финансах проекта
                  </h3>

                  <form onSubmit={handleAddFeedback} className="space-y-3">
                    {feedbackSubmitSuccess && (
                      <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in flex items-center gap-1.5">
                        <CheckCircle size={14} /> Вопрос отправлен разработчикам!
                      </div>
                    )}
                    
                    {feedbackSubmitError && (
                      <div className="p-3 bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl animate-fade-in">
                        {feedbackSubmitError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Если у вас есть предложение по монетизации или вопрос о расходовании грантов — напишите нам..."
                        className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isOffline || !feedbackText.trim()}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send size={12} />
                      Отправить вопрос
                    </button>
                    {isOffline && (
                      <p className="text-[10px] text-slate-500 text-center">Форма обратной связи недоступна офлайн</p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: JOIN TEAM */}
          {activeTab === 'join_team' && (
            <div className="space-y-8" id="about_join_team_section">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Users size={12} /> Поиск единомышленников
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A3A2A] tracking-tight leading-tight">
                  Присоединяйся к нашей команде
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                  Мы объединяем разработчиков, дизайнеров, тестировщиков и общественных активистов ради создания удобной экосистемы взаимопомощи.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Text description (7 cols) */}
                <div className="lg:col-span-7 space-y-6 bg-slate-50/50 border border-slate-100 p-6 md:p-8 rounded-3xl">
                  <p className="text-slate-800 font-bold text-lg leading-relaxed">
                    Проект «Взаимопомощь» создаётся сообществом энтузиастов и неравнодушных людей.
                  </p>
                  
                  <div className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed font-medium font-sans">
                    <p>
                      Мы верим, что современные цифровые технологии могут служить живому человеческому общению, заботе и взаимовыручке. В нашей команде объединяются люди с самым разным опытом: программисты, дизайнеры, модераторы и активные жители.
                    </p>
                    <p>
                      Мы отлично понимаем потребности тех, кто нуждается в поддержке: пожилых граждан, многодетных семей, маломобильных жителей и тех, кто проживает в небольших сёл и деревнях.
                    </p>
                    <p className="font-extrabold text-[#1A3A2A]">
                      Наша цель — сделать доступное, понятное и по-настоящему полезное приложение для каждого региона.
                    </p>
                    <p>
                      Платформа активно развиваются и тестируется. Мы с радостью приглашаем соратников, готовых подключаться к проектированию, написанию кода, бета-тестированию функций или развитию проекта в своём городе.
                    </p>
                  </div>

                  <div className="border-t border-slate-200/60 pt-6 space-y-4">
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                      Мы приглашаем тех, кто:
                    </h4>
                    <ul className="space-y-3">
                      {[
                        'хочет помогать людям и делать реальные добрые дела',
                        'готов участвовать в разработке, тестировании и улучшении функционала',
                        'верит, что объединение жителей делает любой район теплее и безопаснее',
                        'стремится развивать уникальную социальную экосистему вместе с нами'
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                          <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                          <span>— {item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-slate-800 font-bold text-sm md:text-base pt-2">
                    Присоединяйтесь к нашей команде! Вместе мы сможем построить проект, который изменит жизнь тысяч людей к лучшему.
                  </p>

                  <div className="pt-4">
                    <button
                      onClick={() => setIsJoinTeamModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-[#1A3A2A] text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer"
                      id="btn_write_to_developer"
                    >
                      <Users size={16} />
                      Присоединиться к команде
                    </button>
                  </div>
                </div>

                {/* Aesthetic Sidebar decoration (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 to-[#1A3A2A] text-white p-6 md:p-8 rounded-3xl border border-emerald-900/45 shadow-sm space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Sparkles size={24} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-black text-lg tracking-tight">Вместе мы создаём будущее</h3>
                    <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                      Каждая функция, каждый модуль и каждый интерфейс разрабатываются с мыслью о реальных людях. Мы строим уникальную экосистему поддержки, где каждый участник вносит ценный вклад.
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-emerald-900/60 pt-4 text-xs font-mono text-emerald-300">
                    <div className="flex justify-between">
                      <span>Статус проекта:</span>
                      <span className="font-bold text-white">Разработка и тестирование</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Формат участия:</span>
                      <span className="font-bold text-white">Команда / Тестирование / Добрые дела</span>
                    </div>
                    <div className="flex justify-between">
                      <span>География:</span>
                      <span className="font-bold text-white">Все регионы России</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* FINAL CONCLUSION BLOCK FOR ENTIRE ABOUT PROJECT SCREEN */}
      <div className="mt-10 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-4 shadow-xl border border-emerald-800/60 font-sans" id="about_final_conclusion_block">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
          <Sparkles size={16} /> Итоговое заключение проекта
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white leading-snug">
          «Взаимопомощь» — Единство, Забота и Цифровая Экосистема Будущего
        </h3>
        <p className="text-emerald-100/90 text-xs md:text-sm leading-relaxed">
          Проект «Взаимопомощь» — это больше, чем мобильное приложение. Это современная цифровая экосистема, связывающая жителей, мастеров, предпринимателей и социальные службы района. Мы создаем прозрачный, устойчивый и безопасный сервис, в котором каждый человек может быстро получить помощь или протянуть руку поддержки соседям.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-center">
            <span className="block text-[10px] font-bold text-emerald-300 uppercase">100% Бесплатно</span>
            <span className="text-xs font-bold text-white">Для всех жителей</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-center">
            <span className="block text-[10px] font-bold text-emerald-300 uppercase">Забота 60+</span>
            <span className="text-xs font-bold text-white">Упрощенный режим</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-center">
            <span className="block text-[10px] font-bold text-emerald-300 uppercase">Перспектива роста</span>
            <span className="text-xs font-bold text-white">Масштабирование регионов</span>
          </div>
        </div>
      </div>

      {/* MODAL 1: PUBLIC DETAILED FINANCIAL REPORT */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" id="financial_report_modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Финансовая ведомость проекта</h3>
                  <p className="text-xs text-slate-500 font-medium">Открытый баланс доходов и расходов • I Квартал 2026 года</p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Total figures */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Всего Доходов</span>
                  <span className="text-emerald-600 text-base md:text-lg font-black font-mono">150 000 ₽</span>
                </div>
                <div className="text-center border-x border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Всего Расходов</span>
                  <span className="text-rose-600 text-base md:text-lg font-black font-mono">142 500 ₽</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Чистый Остаток</span>
                  <span className="text-indigo-600 text-base md:text-lg font-black font-mono">7 500 ₽</span>
                </div>
              </div>

              {/* Transaction Ledger Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Журнал операций (Леджер)</h4>
                <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-50 p-3 font-bold text-slate-600 border-b border-slate-200">
                    <div className="col-span-2">Дата</div>
                    <div className="col-span-5">Назначение / Статья</div>
                    <div className="col-span-3 text-right">Сумма</div>
                    <div className="col-span-2 text-right">Тип</div>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto scrollbar-thin">
                    {[
                      { date: '28.03.2026', title: 'Оплата хостинга Firebase', val: '-12 500 ₽', type: 'Расход', tCol: 'text-rose-600' },
                      { date: '25.03.2026', title: 'Комиссия с торговых заказов фермеров', val: '+15 280 ₽', type: 'Доход', tCol: 'text-emerald-600' },
                      { date: '15.03.2026', title: 'Поступления от подписок PRO/VIP', val: '+24 800 ₽', type: 'Доход', tCol: 'text-emerald-600' },
                      { date: '10.03.2026', title: 'SMS-верификация (шлюз авторизации)', val: '-4 800 ₽', type: 'Расход', tCol: 'text-rose-600' },
                      { date: '05.03.2026', title: 'Грантовая субсидия Правительства области', val: '+109 920 ₽', type: 'Доход', tCol: 'text-emerald-600' },
                      { date: '01.03.2026', title: 'Оплата услуг модераторов за февраль', val: '-30 000 ₽', type: 'Расход', tCol: 'text-rose-600' },
                      { date: '25.02.2026', title: 'Разработка модуля «Экология»', val: '-60 000 ₽', type: 'Расход', tCol: 'text-rose-600' },
                      { date: '20.02.2026', title: 'Печать плакатов и листовок SOS', val: '-5 200 ₽', type: 'Расход', tCol: 'text-rose-600' }
                    ].map((tx, idx) => (
                      <div key={idx} className="grid grid-cols-12 p-3 font-medium text-slate-700 hover:bg-slate-50/50">
                        <div className="col-span-2 text-slate-400 font-mono text-[11px]">{tx.date}</div>
                        <div className="col-span-5 text-slate-800 font-semibold">{tx.title}</div>
                        <div className="col-span-3 text-right font-bold font-mono">{tx.val}</div>
                        <div className={`col-span-2 text-right font-bold ${tx.tCol}`}>{tx.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10.5px] text-slate-500 border-t border-slate-100 pt-4">
                <span className="flex items-center gap-1">
                  <Lock size={12} className="text-emerald-600" />
                  Данные подтверждены смарт-аккаунтом банка
                </span>
                <span className="font-mono">Обновлено: 11.07.2026</span>
              </div>

              <button
                onClick={() => setIsReportModalOpen(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Закрыть ведомость
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INTERACTIVE DEVELOPMENT ROADMAP */}
      <AnimatePresence>
        {isRoadmapModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" id="roadmap_modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Дорожная карта развития «Взаимопомощь»</h3>
                  <p className="text-xs text-slate-500 font-medium">Инвестиционные приоритеты и планы разработки на 2026 год</p>
                </div>
                <button
                  onClick={() => setIsRoadmapModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Roadmap Milestones list */}
              <div className="space-y-6 relative border-l border-slate-200 ml-4 pl-6 py-2">
                
                {/* Milestone 1 */}
                <div className="relative">
                  <span className="absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-600 text-xs font-black">
                    ✓
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="font-bold text-slate-900 text-sm">Этап 1: Интеграция системы SOS-112</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">Завершено</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Подключение экстренных сигналов пожилых жителей в общую систему взаимовыручки района. Финансирование полностью закрыто за счет субсидии Губернаторского фонда Архангельской области.
                    </p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[100%]" />
                    </div>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="relative">
                  <span className="absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 border-2 border-indigo-600 text-xs font-black animate-pulse">
                    2
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="font-bold text-slate-900 text-sm">Этап 2: Масштабирование на соседние районы</h4>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase">В работе</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Создание гибкого шаблона приложения для мгновенного переноса базы данных на Вельский и Котласский районы. Финансируется за счет подписок коммерческих PRO/VIP тарифов.
                    </p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[60%]" />
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold font-mono">Выполнено на 60%</span>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="relative">
                  <span className="absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-800 border-2 border-amber-600 text-xs font-black">
                    3
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="font-bold text-slate-900 text-sm">Этап 3: Голосовой ввод SOS и чатов для пожилых</h4>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Планируется</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Разработка алгоритмов искусственного интеллекта на сервере для распознавания устной речи бабушек и дедушек, превращения ее в текст объявлений. Сбор заявок на гранты.
                    </p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full w-[15%]" />
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold font-mono">Накопление средств: 15%</span>
                  </div>
                </div>

                {/* Milestone 4 */}
                <div className="relative">
                  <span className="absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-800 border-2 border-slate-400 text-xs font-black">
                    4
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="font-bold text-slate-900 text-sm">Этап 4: Эко-мониторинг чистоты рек Устья и Кокшеньга</h4>
                      <span className="text-[10px] bg-slate-150 text-slate-600 font-bold px-2 py-0.5 rounded-full uppercase">Ожидает</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Интеграция интерактивной тепловой карты загрязнений водных артерий района, позволяющей рыбакам прикреплять фотографии нарушений. Проектирование архитектуры.
                    </p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-350 h-full w-[0%]" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold font-mono">Ожидает финансирования (0%)</span>
                  </div>
                </div>

              </div>

              <button
                onClick={() => setIsRoadmapModalOpen(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Закрыть дорожную карту
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: LEGAL AGREEMENT READER WITH SIDE-BY-SIDE HUMAN TRANSLATION */}
      <AnimatePresence>
        {viewingContractType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" id="legal_contract_modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex justify-between items-start gap-4 border-b border-slate-150 pb-4">
                <div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    ЮРИДИЧЕСКИЙ ЦЕНТР С ОПИСАНИЕМ ДЛЯ ЛЮДЕЙ
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                    {viewingContractType === 'offer' && '📄 Пользовательское соглашение и правила платформы'}
                    {viewingContractType === 'license' && '📄 Лицензионный договор о франшизе'}
                    {viewingContractType === 'entrepreneur' && '📄 Договор об оказании услуг и размещении товаров'}
                    {viewingContractType === 'nda' && '📄 Соглашение о конфиденциальности и неразглашении (NDA)'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Слева представлен юридически значимый оригинал документа, справа — перевод каждого пункта на понятный русский язык.
                  </p>
                </div>
                <button
                  onClick={() => setViewingContractType(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Side-by-side split */}
              <div className="space-y-6 divide-y divide-slate-150 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                {/* Clause 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 first:pt-0">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase font-mono tracking-wider">Пункт 1. Юридический текст</h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-mono">
                      {viewingContractType === 'offer' && '1.1. Настоящее пользовательское соглашение регулирует безвозмездное предоставление информационных сервисов SOS-оповещения, Ленты взаимопомощи и Чатов для физических лиц в некоммерческих целях.'}
                      {viewingContractType === 'license' && '1.1. Лицензиар предоставляет Лицензиату ограниченное, неисключительное право использования программного комплекса «Взаимопомощь» и товарного знака на Территории выбранного муниципального района.'}
                      {viewingContractType === 'entrepreneur' && '1.1. Настоящий договор регулирует условия размещения коммерческих предложений на электронной витрине, а также порядок осуществления расчетных и логистических операций доставки.'}
                      {viewingContractType === 'nda' && '1.1. Раскрывающая Сторона обязуется передавать Получающей Стороне конфиденциальную информацию, включая программный код платформы, схемы СУБД, персональные данные жителей и финансовые показатели, исключительно в рамках исполнения Лицензионного договора.'}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1.5">
                    <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                      💬 Понятным языком:
                    </h4>
                    <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                      {viewingContractType === 'offer' && 'Все функции взаимопомощи, SOS-кнопка и общение с соседями в приложении всегда бесплатны для жителей. Никаких скрытых условий или платных подписок.'}
                      {viewingContractType === 'license' && 'Вы получаете эксклюзивное право запустить Взаимопомощь в своем районе под нашим брендом и развивать там локальное сообщество на платной основе.'}
                      {viewingContractType === 'entrepreneur' && 'Мы даем вам полноценную цифровую витрину для продажи ваших товаров жителям района напрямую, без посредников.'}
                      {viewingContractType === 'nda' && 'Вся передаваемая техническая и деловая информация, включая код и базы данных приложения, является строго секретной. Никакие детали нельзя раскрывать третьим лицам.'}
                    </p>
                  </div>
                </div>

                {/* Clause 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase font-mono tracking-wider">Пункт 2. Юридический текст</h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-mono">
                      {viewingContractType === 'offer' && '2.1. Платформа обязуется соблюдать требования Федерального закона ФЗ-152 «О персональных данных» в отношении сбора, хранения и обработки конфиденциальной информации пользователей.'}
                      {viewingContractType === 'license' && '2.1. Лицензиат обязуется своевременно осуществлять выплату роялти согласно условиям выбранной франшизы: ЛОКАЛЬНЫЙ (5% от оборота), РЕГИОНАЛЬНЫЙ (5% от оборота), ПАРТНЁРСКИЙ (3% от оборота).'}
                      {viewingContractType === 'entrepreneur' && '2.1. Исполнитель взимает базовую сервисную комиссию в размере 7% с каждого успешно доставленного заказа. На тарифах PRO и VIP комиссионная ставка снижается.'}
                      {viewingContractType === 'nda' && '2.1. Получающая сторона обязуется обеспечивать уровень защиты конфиденциальной информации не ниже разумного, предотвращать несанкционированный доступ, копирование программного кода или утечку персональных данных.'}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1.5">
                    <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                      💬 Понятным языком:
                    </h4>
                    <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                      {viewingContractType === 'offer' && 'Ваши телефоны и имена хранятся на серверах в России и полностью защищены от спама и утечек. Мы никогда не продаем ваши личные данные.'}
                      {viewingContractType === 'license' && 'Оплата роялти зависит от вашего тарифа. Для локального и регионального пакетов она составляет 5% от коммерческого оборота, а для крупного партнёрского пакета снижена до 3%.'}
                      {viewingContractType === 'entrepreneur' && 'Комиссия 7% берется только с выполненных заказов. Нет продаж — нет комиссий. Вы также можете переходить на тарифы с фиксированной оплатой.'}
                      {viewingContractType === 'nda' && 'Вы обязуетесь бережно защищать технические секреты платформы, не выгружать исходный код в открытые репозитории (GitHub и т.д.) и не допускать утечек данных пользователей.'}
                    </p>
                  </div>
                </div>

                {/* Clause 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-indigo-900 uppercase font-mono tracking-wider">Пункт 3. Юридический текст</h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-mono">
                      {viewingContractType === 'offer' && '3.1. Торговые отношения и услуги продуктового подвоза осуществляются на основании прямых сделок купли-продажи между жителями и верифицированными предпринимателями.'}
                      {viewingContractType === 'license' && '3.1. Лицензиар берет на себя обязательства по технической поддержке облачной инфраструктуры, баз данных и регулярному автоматическому обновлению ПО в течение оплаченного периода поддержки.'}
                      {viewingContractType === 'entrepreneur' && '3.1. Продавец гарантирует соответствие товаров стандартам качества РФ и несет полную ответственность за свежесть продуктов. Модератор выступает независимым арбитром в спорах.'}
                      {viewingContractType === 'nda' && '3.1. В случае нарушения Получающей Стороной обязательств о конфиденциальности или несанкционированной передаче исходного кода третьим лицам, Получающая Сторона выплачивает штраф в размере 500 000 рублей за каждый факт нарушения и несет уголовную ответственность по ст. 183 УК РФ.'}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-1.5">
                    <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                      💬 Понятным языком:
                    </h4>
                    <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                      {viewingContractType === 'offer' && 'Заказ еды и товаров идет напрямую у проверенных местных фермеров и магазинов. Платформа лишь помогает им удобно встретиться.'}
                      {viewingContractType === 'license' && 'Мы берем на себя техническую часть: следим за серверами, исправляем ошибки и выпускаем обновления на протяжении всего периода действия приобретенной поддержки.'}
                      {viewingContractType === 'entrepreneur' && 'Вы обязуетесь поставлять только качественные и свежие продукты. Если возникнет спорный вопрос, модератор поможет честно его решить.'}
                      {viewingContractType === 'nda' && 'Передача исходного кода, логики работы или баз данных третьим лицам строго наказывается штрафом в полмиллиона рублей и преследуется по уголовному кодексу РФ за коммерческий шпионаж.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-150 pt-4">
                <button
                  onClick={() => setViewingContractType(null)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  Ознакомлен и согласен
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: FRANCHISE COMPARE PACKAGES */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" id="franchise_compare_modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">📊 Таблица сравнения франшизных пакетов</h3>
                  <p className="text-xs text-slate-500 font-medium">Сравните условия и выберите оптимальный формат масштабирования для вашего региона</p>
                </div>
                <button
                  onClick={() => setIsCompareModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Responsive Table wrapper */}
              <div className="border border-slate-150 rounded-2xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150">
                      <th className="p-3.5 font-bold text-slate-700">Функция</th>
                      <th className="p-3.5 font-bold text-indigo-700">Base</th>
                      <th className="p-3.5 font-bold text-indigo-700">Pro</th>
                      <th className="p-3.5 font-bold text-rose-700">VIP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-medium text-slate-600">
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Стоимость</td>
                      <td className="p-3.5 text-indigo-600 font-mono font-black">49 000 ₽</td>
                      <td className="p-3.5 text-indigo-600 font-mono font-black">149 000 ₽</td>
                      <td className="p-3.5 text-rose-600 font-mono font-black">349 000 ₽</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Роялти</td>
                      <td className="p-3.5 font-mono">5%</td>
                      <td className="p-3.5 font-mono">5%</td>
                      <td className="p-3.5 font-mono text-rose-600 font-bold">3% (пониженная ставка)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Мобильное приложение</td>
                      <td className="p-3.5 text-emerald-600 font-bold">✅ Да</td>
                      <td className="p-3.5 text-emerald-600 font-bold">✅ Да</td>
                      <td className="p-3.5 text-emerald-600 font-bold">✅ Да</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Админ-панель</td>
                      <td className="p-3.5 text-emerald-600 font-bold">✅ Да</td>
                      <td className="p-3.5 text-emerald-600 font-bold">✅ Да</td>
                      <td className="p-3.5 text-emerald-600 font-bold">✅ Да</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Система тарифов</td>
                      <td className="p-3.5">Базовый</td>
                      <td className="p-3.5 font-bold text-slate-800">Полный</td>
                      <td className="p-3.5 font-bold text-indigo-600">Гибкий (настройка под себя)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Антифрод-система</td>
                      <td className="p-3.5">Базовый</td>
                      <td className="p-3.5 font-bold text-slate-800">Автоматический</td>
                      <td className="p-3.5 font-bold text-rose-600">С верификацией по паспорту</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Документация</td>
                      <td className="p-3.5">Стартап-регламент</td>
                      <td className="p-3.5">Полный пакет инструкций</td>
                      <td className="p-3.5 font-bold text-indigo-600">Эксклюзивные шаблоны и регламенты</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Техподдержка и ведение</td>
                      <td className="p-3.5 font-mono">1 месяц</td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">3 месяца</td>
                      <td className="p-3.5 font-mono font-bold text-rose-600">6 месяцев (SLA 24/7)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">White-Label (свой бренд)</td>
                      <td className="p-3.5 text-slate-400">❌ Нет</td>
                      <td className="p-3.5 text-slate-400">❌ Нет</td>
                      <td className="p-3.5 text-emerald-600 font-bold">✅ Да (полная кастомизация)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-slate-900">Эксклюзив на регион</td>
                      <td className="p-3.5 text-slate-400">❌ Нет</td>
                      <td className="p-3.5 text-slate-400">❌ Нет</td>
                      <td className="p-3.5 text-emerald-600 font-bold">✅ Да (гарантированная монополия)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCompareModalOpen(false);
                    setIsLeadModalOpen(true);
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  Оставить заявку на внедрение
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: FRANCHISE LEAD FORM */}
      <AnimatePresence>
        {isLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" id="franchise_lead_modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">📩 Подать заявку на внедрение франшизы</h3>
                  <p className="text-xs text-slate-500 font-medium">Заполните анкету для открытия платформы «Взаимопомощь» в вашем районе</p>
                </div>
                <button
                  onClick={() => setIsLeadModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {leadSubmitSuccess ? (
                <div className="py-8 text-center space-y-4 animate-fade-in">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={36} />
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-900">Заявка успешно отправлена!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Мы получили ваши контакты и уже готовим расчет лицензии для региона. В течение 24 часов наш куратор свяжется с вами для согласования договора.
                  </p>
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-150 text-[11px] font-bold">
                    Ваш регион временно внесен в реестр в статусе «Внедрение»
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {leadSubmitError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold">
                      ⚠️ {leadSubmitError}
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {/* Organization name field */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Building2 size={12} className="text-indigo-600" />
                        Название организации <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={leadOrg}
                        onChange={(e) => setLeadOrg(e.target.value)}
                        placeholder="Например, Сообщество 'Добрые Дела'"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      />
                    </div>

                    {/* Region field */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <MapPin size={12} className="text-indigo-600" />
                        Регион / Район внедрения <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={leadRegion}
                        onChange={(e) => setLeadRegion(e.target.value)}
                        placeholder="Например, Вельский район"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      />
                    </div>

                    {/* Contact person name field */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <User size={12} className="text-indigo-600" />
                        Контактное лицо (ФИО) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={leadContact}
                        onChange={(e) => setLeadContact(e.target.value)}
                        placeholder="Иванов Александр Сергеевич"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                      />
                    </div>

                    {/* Phone and Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Phone size={12} className="text-indigo-600" />
                          Телефон <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          placeholder="+7 (900) 123-4567"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Send size={12} className="text-indigo-600" />
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          placeholder="partner@example.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Package type selection field */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Coins size={12} className="text-indigo-600" />
                        Выбранный пакет франшизы <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={leadPackage}
                        onChange={(e) => setLeadPackage(e.target.value as any)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none cursor-pointer"
                      >
                        <option value="start">Base — 49 000 ₽ (основная часть приложения, роялти 5%)</option>
                        <option value="business">Pro — 149 000 ₽ (расширенный пакет модулей, роялти 5%)</option>
                        <option value="government">VIP — 349 000 ₽ (настройка под регион + маркетплейс, роялти 3%)</option>
                      </select>
                    </div>

                    {/* Comment input field */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                        Комментарий
                      </label>
                      <textarea
                        value={leadComment}
                        onChange={(e) => setLeadComment(e.target.value)}
                        placeholder="Опишите особенности вашего региона, потребности или вопросы..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none resize-none"
                      />
                    </div>

                    {/* Consent agreement check field */}
                    <div className="flex items-start gap-2.5 pt-2">
                      <input
                        type="checkbox"
                        required
                        id="leadConsentCheckbox"
                        checked={leadConsent}
                        onChange={(e) => setLeadConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 text-indigo-600 border-slate-200 rounded-md focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="leadConsentCheckbox" className="text-[10px] leading-relaxed text-slate-500 font-medium select-none cursor-pointer">
                        Я подтверждаю достоверность указанных данных и даю согласие на обработку персональных данных в соответствии с ФЗ-152 «О персональных данных» и <button type="button" onClick={() => { setIsLeadModalOpen(false); setViewingContractType('offer'); }} className="text-indigo-600 hover:underline font-bold">Пользовательским соглашением</button>. <span className="text-rose-500">*</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit and Cancel actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Отправить заявку
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLeadModalOpen(false)}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: JOIN TEAM FEEDBACK FORM */}
      <AnimatePresence>
        {isJoinTeamModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" id="join_team_modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Обратная связь
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">Присоединиться к команде</h3>
                  <p className="text-xs text-slate-500 font-medium">Ваш отклик поможет развить проект «Взаимопомощь»</p>
                </div>
                <button
                  onClick={() => setIsJoinTeamModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {joinTeamSubmitSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3" id="join_team_success_msg">
                  <CheckCircle className="mx-auto text-emerald-600 stroke-[3]" size={40} />
                  <h4 className="font-extrabold text-slate-900 text-base">Сообщение отправлено!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Спасибо за поддержку и желание помочь! Мы обязательно прочитаем ваше сообщение и свяжемся с вами.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoinTeamSubmit} className="space-y-4">
                  {joinTeamSubmitError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl animate-fade-in">
                      {joinTeamSubmitError}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <User size={12} className="text-emerald-600" />
                        Ваше имя <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={joinTeamName}
                        onChange={(e) => setJoinTeamName(e.target.value)}
                        placeholder="Как к вам обращаться?"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>

                    {/* Contacts */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Send size={12} className="text-emerald-600" />
                        Как с вами связаться (Телефон / Telegram / Email) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={joinTeamContact}
                        onChange={(e) => setJoinTeamContact(e.target.value)}
                        placeholder="Например: +7 (900) 123-4567 или @telegram"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                        Ваше сообщение <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        value={joinTeamText}
                        onChange={(e) => setJoinTeamText(e.target.value)}
                        placeholder="Расскажите о себе, чем бы вы хотели помочь или какие идеи у вас есть..."
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 transition-all outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isOffline || !joinTeamText.trim() || !joinTeamContact.trim()}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-[#1A3A2A] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5 animate-pulse-subtle"
                    >
                      <Send size={14} />
                      Отправить отклик
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsJoinTeamModalOpen(false)}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Отмена
                    </button>
                  </div>
                  {isOffline && (
                    <p className="text-[10px] text-slate-500 text-center">Форма обратной связи недоступна в офлайн-режиме</p>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
