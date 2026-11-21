import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, MASTER_CATEGORIES, Master, PortfolioItem, ServiceOrder, MasterReview } from '../types';
import { getDistanceBetweenVillages } from '../mockData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, MapPin, Star, MessageSquare, Search, Hammer, Tractor, Home, 
  Truck, HeartPulse, FileText, Sparkles, Plus, Trash2, Edit, Check, X, 
  Calendar, DollarSign, Briefcase, Clock, Phone, User, CheckCircle, AlertCircle,
  HelpCircle, ChevronRight, MessageCircle, StarOff, Info, ThumbsUp,
  Landmark, Palette, Laptop, GraduationCap
} from 'lucide-react';

import {
  dbCreateMaster,
  dbUpdateMaster,
  dbDeleteMaster,
  dbCreatePortfolioItem,
  dbUpdatePortfolioItem,
  dbDeletePortfolioItem,
  dbCreateServiceOrder,
  dbUpdateServiceOrder,
  dbCreateMasterReview,
  dbUpdateMasterReview
} from '../firebaseSync';

interface SkillsCatalogScreenProps {
  currentUserId: string;
  currentUser: UserProfile;
  users: UserProfile[];
  masters: Master[];
  portfolioItems: PortfolioItem[];
  serviceOrders: ServiceOrder[];
  masterReviews: MasterReview[];
  onStartDirectChat: (helper: UserProfile) => void;
  isOffline: boolean;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  professional: Award,
  craftsman: Hammer,
  worker: User,
  government: Landmark,
  agriculture: Tractor,
  art: Palette,
  logistics: Truck,
  health: HeartPulse,
  education: GraduationCap,
  digital: Laptop,
  other: HelpCircle
};

export function compressImage(file: File, maxWidth = 1024, maxHeight = 1024, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

const PORTFOLIO_PRESET_IMAGES = [
  { name: "Сруб бани и дома", url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=600" },
  { name: "Колка и укладка дров", url: "https://images.unsplash.com/photo-1542397284385-6010176424d2?auto=format&fit=crop&q=80&w=600" },
  { name: "Вспашка огорода трактором", url: "https://images.unsplash.com/photo-1594913785162-e67853119ac0?auto=format&fit=crop&q=80&w=600" },
  { name: "Генеральная уборка комнат", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600" },
  { name: "Ремонт покосившегося забора", url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600" },
  { name: "Замена крыльца и ступеней", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600" },
  { name: "Резьба по дереву (наличники)", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600" },
  { name: "Шитье, текстиль, чехлы", url: "https://images.unsplash.com/photo-1524295981997-ec4f4e3042e2?auto=format&fit=crop&q=80&w=600" },
  { name: "Ремонт электропроводки", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600" },
  { name: "Установка сантехники, труб", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600" }
];

export default function SkillsCatalogScreen({
  currentUserId,
  currentUser,
  users,
  masters,
  portfolioItems,
  serviceOrders,
  masterReviews,
  onStartDirectChat,
  isOffline
}: SkillsCatalogScreenProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'cabinet'>('catalog');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Master detail view modal
  const [viewingMaster, setViewingMaster] = useState<Master | null>(null);
  const [masterDetailTab, setMasterDetailTab] = useState<'info' | 'portfolio' | 'reviews'>('info');

  // Booking Service order modal states
  const [bookingMaster, setBookingMaster] = useState<Master | null>(null);
  const [orderDesc, setOrderDesc] = useState('');
  const [orderCategory, setOrderCategory] = useState('');
  const [orderDate, setOrderDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [orderAddress, setOrderAddress] = useState(currentUser.village || '');
  const [orderBudget, setOrderBudget] = useState<number>(0);
  const [orderPhone, setOrderPhone] = useState(currentUser.phone || '');

  // Reviewing Master modal states
  const [reviewingOrder, setReviewingOrder] = useState<ServiceOrder | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAnonymous, setReviewAnonymous] = useState(false);
  const [ratingQuality, setRatingQuality] = useState(5);
  const [ratingTimeliness, setRatingTimeliness] = useState(5);
  const [ratingPoliteness, setRatingPoliteness] = useState(5);
  const [ratingPriceQuality, setRatingPriceQuality] = useState(5);

  // My Master panel states
  const isRegisteredAsMaster = useMemo(() => masters.some(m => m.userId === currentUserId), [masters, currentUserId]);
  const currentMyMasterProfile = useMemo(() => masters.find(m => m.userId === currentUserId), [masters, currentUserId]);

  const [registering, setRegistering] = useState(false);
  const [masterDesc, setMasterDesc] = useState('');
  const [masterExperience, setMasterExperience] = useState('');
  const [masterEducation, setMasterEducation] = useState('');
  const [masterWorkingHours, setMasterWorkingHours] = useState('Пн-Пт 09:00 - 18:00');
  const [masterPriceFrom, setMasterPriceFrom] = useState<number>(500);
  const [masterPriceDesc, setMasterPriceDesc] = useState('зависит от сложности и объема работ');
  const [masterCats, setMasterCats] = useState<string[]>([]);
  const [masterActive, setMasterActive] = useState(true);
  const [registerSkillSearch, setRegisterSkillSearch] = useState('');
  const [editSkillSearch, setEditSkillSearch] = useState('');

  // Master Portfolio adding states
  const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portCategory, setPortCategory] = useState('');
  const [portPrice, setPortPrice] = useState<number>(0);
  const [portPhotos, setPortPhotos] = useState<string[]>([]);
  const [portLocation, setPortLocation] = useState(currentUser.village || '');
  const [portCustomPhoto, setPortCustomPhoto] = useState('');

  // Advanced Master Cabinet States
  const [cabinetTab, setCabinetTab] = useState<'info' | 'portfolio' | 'prices' | 'orders' | 'reviews'>('info');
  const [masterPhotoUrl, setMasterPhotoUrl] = useState('');
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
  const [editPortTitle, setEditPortTitle] = useState('');
  const [editPortDesc, setEditPortDesc] = useState('');
  const [editPortCategory, setEditPortCategory] = useState('');
  const [editPortPrice, setEditPortPrice] = useState<number>(0);
  const [editPortPhotos, setEditPortPhotos] = useState<string[]>([]);
  const [editPortLocation, setEditPortLocation] = useState('');

  const [editingService, setEditingService] = useState<{ id: string; name: string; description: string; price: number; unit: string } | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [servicePrice, setServicePrice] = useState<number>(0);
  const [serviceUnit, setServiceUnit] = useState('шт');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState('');

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Simulated Phone Dialer for Simplified Mode
  const [simplifiedSelectedCategory, setSimplifiedSelectedCategory] = useState<string | null>(null);
  const [dialingMaster, setDialingMaster] = useState<{ name: string; phone: string; village: string } | null>(null);
  const [simulatedCallState, setSimulatedCallState] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');

  // Load My Master states when tab opens
  useEffect(() => {
    if (currentMyMasterProfile) {
      setMasterDesc(currentMyMasterProfile.description);
      setMasterExperience(currentMyMasterProfile.experience);
      setMasterEducation(currentMyMasterProfile.education);
      setMasterWorkingHours(currentMyMasterProfile.workingHours);
      setMasterPriceFrom(currentMyMasterProfile.priceFrom);
      setMasterPriceDesc(currentMyMasterProfile.priceDescription);
      setMasterCats(currentMyMasterProfile.categories);
      setMasterActive(currentMyMasterProfile.isActive);
      setMasterPhotoUrl(currentMyMasterProfile.photoUrl || '');
    }
  }, [currentMyMasterProfile, activeTab]);

  // Master profiles list including calculated distance and name details
  const activeMastersList = useMemo(() => {
    return masters
      .filter(m => m.isActive || m.userId === currentUserId) // always show self for preview
      .map(m => {
        const linkedUser = users.find(u => u.id === m.userId);
        const name = linkedUser ? linkedUser.name : (m.userName || "Мастер взаимопомощи");
        const phone = linkedUser ? linkedUser.phone : (m.userPhone || "+7 900 123-45-67");
        const village = linkedUser ? linkedUser.village : (m.userVillage || "Октябрьский");
        const avatarUrl = linkedUser ? linkedUser.avatarUrl : (m.userAvatar || "");
        const dist = getDistanceBetweenVillages(currentUser.village, village);
        
        // Calculate dynamic real rating based on actual reviews in database
        const relativeReviews = masterReviews.filter(r => r.masterId === m.id);
        const calcAvg = relativeReviews.length > 0 
          ? Number((relativeReviews.reduce((sum, r) => sum + r.rating, 0) / relativeReviews.length).toFixed(1))
          : m.rating?.average || 5.0;
        const calcTotal = relativeReviews.length > 0 ? relativeReviews.length : m.rating?.total || 0;

        return {
          ...m,
          userName: name,
          userPhone: phone,
          userVillage: village,
          userAvatar: avatarUrl,
          calculatedDistance: dist,
          rating: {
            average: calcAvg,
            total: calcTotal
          }
        };
      })
      .filter(m => {
        // Intelligent automated search matching name, skills, village, rating, price, reviews
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          
          // 1. Match by name
          const matchesName = m.userName?.toLowerCase().includes(q);
          
          // 2. Match by village
          const matchesVillage = m.userVillage?.toLowerCase().includes(q);
          
          // 3. Match by description, experience, education, or specialization
          const matchesDesc = m.description.toLowerCase().includes(q) || 
                              m.experience.toLowerCase().includes(q) || 
                              m.education.toLowerCase().includes(q) ||
                              (m.specialization && m.specialization.toLowerCase().includes(q));

          // 4. Match by categories and subcategories names
          const masterCatNames: string[] = [];
          m.categories.forEach(catId => {
            const parentCat = MASTER_CATEGORIES.find(c => c.id === catId);
            if (parentCat) {
              masterCatNames.push(parentCat.name.toLowerCase());
            }
            MASTER_CATEGORIES.forEach(c => {
              const sub = c.subcategories.find(s => s.id === catId);
              if (sub) {
                masterCatNames.push(sub.name.toLowerCase());
                masterCatNames.push(c.name.toLowerCase());
              }
            });
          });
          // Include custom testing fields
          if (m.category) masterCatNames.push(m.category.toLowerCase());
          if (m.subcategory) masterCatNames.push(m.subcategory.toLowerCase());
          if (m.type) masterCatNames.push(m.type.toLowerCase());

          const matchesCategory = masterCatNames.some(name => name.includes(q));

          // 5. Match by reviews
          const relativeReviews = masterReviews.filter(r => r.masterId === m.id);
          const matchesReviews = relativeReviews.some(r => r.comment.toLowerCase().includes(q));

          // 6. Match by price keywords or numeric values
          let matchesPrice = false;
          if (q.includes("дешев") || q.includes("недорог") || q.includes("бюджетн") || q.includes("выгодн") || q.includes("бесплатн")) {
            matchesPrice = (m.priceFrom <= 500) || (m.priceFrom === 0);
          } else if (q.includes("дорог") || q.includes("премиум") || q.includes("люкс")) {
            matchesPrice = m.priceFrom > 2000;
          } else {
            const matchToPrice = q.match(/(?:до|меньше|дешевле)\s*(\d+)/);
            if (matchToPrice) {
              const maxPrice = parseInt(matchToPrice[1], 10);
              matchesPrice = m.priceFrom <= maxPrice;
            }
          }

          // 7. Match by rating keywords or numbers
          let matchesRating = false;
          if (q.includes("лучш") || q.includes("отличн") || q.includes("топ") || q.includes("высок") || q.includes("рейтинг")) {
            matchesRating = m.rating.average >= 4.5;
            const matchRatingNum = q.match(/(?:рейтинг|>|>=)\s*(\d+(?:[.,]\d+)?)/);
            if (matchRatingNum) {
              const minRating = parseFloat(matchRatingNum[1].replace(",", "."));
              matchesRating = m.rating.average >= minRating;
            }
          } else {
            const parsedNum = parseFloat(q);
            if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 5) {
              matchesRating = m.rating.average >= parsedNum;
            }
          }

          if (!matchesName && !matchesVillage && !matchesDesc && !matchesCategory && !matchesReviews && !matchesPrice && !matchesRating) {
            return false;
          }
        }

        // Category matching
        if (selectedCategoryId !== 'all') {
          const categoryObj = MASTER_CATEGORIES.find(c => c.id === selectedCategoryId);
          const subIds = categoryObj ? categoryObj.subcategories.map(s => s.id) : [];
          const hasCategory = m.categories.some(catId => catId === selectedCategoryId || subIds.includes(catId)) ||
                              m.type === selectedCategoryId ||
                              (m.category && categoryObj && categoryObj.name.toLowerCase().includes(m.category.toLowerCase()));
          if (!hasCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Put self first in editing, then nearest masters, then highest rating
        if (a.userId === currentUserId) return -1;
        if (b.userId === currentUserId) return 1;
        
        if (a.calculatedDistance !== b.calculatedDistance) {
          return a.calculatedDistance - b.calculatedDistance;
        }
        return b.rating.average - a.rating.average;
      });
  }, [masters, users, masterReviews, currentUser.village, searchQuery, selectedCategoryId, currentUserId]);

  // Master Portfolio items list for a selected master
  const activeMasterPortfolio = useMemo(() => {
    if (!viewingMaster) return [];
    return portfolioItems.filter(item => item.masterId === viewingMaster.id);
  }, [portfolioItems, viewingMaster]);

  // Master Reviews list for a selected master
  const activeMasterReviews = useMemo(() => {
    if (!viewingMaster) return [];
    return masterReviews
      .filter(rev => rev.masterId === viewingMaster.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [masterReviews, viewingMaster]);

  // Orders made by the current user
  const myClientOrders = useMemo(() => {
    return serviceOrders
      .filter(o => o.clientId === currentUserId)
      .map(o => {
        const targetMaster = masters.find(m => m.id === o.masterId);
        const linkedUser = targetMaster ? users.find(u => u.id === targetMaster.userId) : null;
        return {
          ...o,
          masterName: linkedUser ? linkedUser.name : (o.masterName || "Мастер Устьяны"),
          masterPhone: linkedUser ? linkedUser.phone : (o.masterPhone || "+7 921 555-55-55")
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [serviceOrders, masters, users, currentUserId]);

  // Orders received by current user (if they are a master)
  const myMasterOrders = useMemo(() => {
    if (!currentMyMasterProfile) return [];
    return serviceOrders
      .filter(o => o.masterId === currentMyMasterProfile.id)
      .map(o => {
        const clientUser = users.find(u => u.id === o.clientId);
        return {
          ...o,
          clientName: clientUser ? clientUser.name : (o.clientName || "Клиент"),
          clientPhone: clientUser ? clientUser.phone : (o.clientPhone || "+7 900 123-45-67")
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [serviceOrders, currentMyMasterProfile, users]);

  // Handle registering as a master
  const handleRegisterMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (masterCats.length === 0) {
      alert("Пожалуйста, выберите хотя бы одно умение или категорию!");
      return;
    }

    const newMasterId = `master_${currentUserId}`;
    const newMaster: Master = {
      id: newMasterId,
      userId: currentUserId,
      categories: masterCats,
      description: masterDesc || "Опытный специалист, готов помочь жителям Устьяны.",
      experience: masterExperience || "1 год",
      education: masterEducation || "Самоучка",
      priceFrom: masterPriceFrom || 0,
      priceDescription: masterPriceDesc || "договорная",
      workingHours: masterWorkingHours || "Пн-Пт 9:00 - 18:00",
      rating: {
        average: 5.0,
        total: 0
      },
      statistics: {
        totalOrders: 0,
        completedOrders: 0,
        onTimePercentage: 100
      },
      isActive: masterActive,
      photoUrl: masterPhotoUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update locally and online
    if (!isOffline) {
      await dbCreateMaster(newMaster);
    }
    setRegistering(false);
    alert("Вы успешно зарегистрировались в каталоге мастеров!");
  };

  // Handle saving master profile changes
  const handleSaveMasterProfile = async () => {
    if (!currentMyMasterProfile) return;
    if (masterCats.length === 0) {
      alert("Выберите хотя бы одно умение!");
      return;
    }

    const updates = {
      description: masterDesc,
      experience: masterExperience,
      education: masterEducation,
      workingHours: masterWorkingHours,
      priceFrom: masterPriceFrom,
      priceDescription: masterPriceDesc,
      categories: masterCats,
      isActive: masterActive,
      photoUrl: masterPhotoUrl,
      updatedAt: new Date().toISOString()
    };

    if (!isOffline) {
      await dbUpdateMaster(currentMyMasterProfile.id, updates);
    }
    alert("Профиль мастера успешно обновлен!");
  };

  // Add Portfolio item
  const handleAddPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMyMasterProfile) return;
    if (!portTitle || !portDesc) {
      alert("Заполните заголовок и описание работы!");
      return;
    }

    const finalPhotos = portPhotos.length > 0 
      ? portPhotos 
      : (portCustomPhoto ? [portCustomPhoto] : [PORTFOLIO_PRESET_IMAGES[0].url]);

    const newItem: PortfolioItem = {
      id: `portfolio_${Date.now()}`,
      masterId: currentMyMasterProfile.id,
      title: portTitle,
      description: portDesc,
      category: portCategory || masterCats[0] || "other",
      photos: finalPhotos,
      location: portLocation || currentUser.village,
      price: portPrice > 0 ? portPrice : undefined,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    if (!isOffline) {
      await dbCreatePortfolioItem(newItem);
    }

    // Reset Form
    setPortTitle('');
    setPortDesc('');
    setPortCategory('');
    setPortPrice(0);
    setPortPhotos([]);
    setPortCustomPhoto('');
    setShowAddPortfolioModal(false);
    alert("Работа добавлена в портфолио!");
  };

  // Delete Portfolio item
  const handleDeletePortfolioItem = async (itemId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту работу из портфолио?")) return;
    if (!isOffline) {
      await dbDeletePortfolioItem(itemId);
    }
    alert("Работа успешно удалена!");
  };

  // Save edited Portfolio item
  const handleSavePortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPortfolioItem) return;
    if (!editPortTitle || !editPortDesc) {
      alert("Заполните заголовок и описание работы!");
      return;
    }

    const finalPhotos = editPortPhotos.length > 0 ? editPortPhotos : [PORTFOLIO_PRESET_IMAGES[0].url];

    const updates: Partial<PortfolioItem> = {
      title: editPortTitle,
      description: editPortDesc,
      category: editPortCategory || masterCats[0] || "other",
      photos: finalPhotos,
      location: editPortLocation || currentUser.village,
      price: editPortPrice > 0 ? editPortPrice : undefined,
    };

    if (!isOffline) {
      await dbUpdatePortfolioItem(editingPortfolioItem.id, updates);
    }
    setEditingPortfolioItem(null);
    alert("Работа в портфолио обновлена!");
  };

  // Add a Service/Price to Master priceList/services
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMyMasterProfile) return;
    if (!serviceName.trim()) {
      alert("Укажите название услуги!");
      return;
    }

    const currentServices = currentMyMasterProfile.services || [];
    const newService = {
      id: `service_${Date.now()}`,
      name: serviceName,
      description: serviceDesc,
      price: servicePrice,
      unit: serviceUnit
    };

    const updatedServices = [...currentServices, newService];

    if (!isOffline) {
      await dbUpdateMaster(currentMyMasterProfile.id, { services: updatedServices });
    }

    // Reset Form
    setServiceName('');
    setServiceDesc('');
    setServicePrice(0);
    setServiceUnit('шт');
    setShowAddServiceModal(false);
    alert("Услуга добавлена в прайс-лист!");
  };

  // Save Edited Service/Price
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMyMasterProfile || !editingService) return;
    if (!serviceName.trim()) {
      alert("Укажите название услуги!");
      return;
    }

    const currentServices = currentMyMasterProfile.services || [];
    const updatedServices = currentServices.map(s => {
      if (s.id === editingService.id) {
        return {
          ...s,
          name: serviceName,
          description: serviceDesc,
          price: servicePrice,
          unit: serviceUnit
        };
      }
      return s;
    });

    if (!isOffline) {
      await dbUpdateMaster(currentMyMasterProfile.id, { services: updatedServices });
    }

    setEditingService(null);
    setServiceName('');
    setServiceDesc('');
    setServicePrice(0);
    setServiceUnit('шт');
    alert("Услуга успешно обновлена!");
  };

  // Delete Service/Price
  const handleDeleteService = async (serviceId: string) => {
    if (!currentMyMasterProfile) return;
    if (!window.confirm("Вы уверены, что хотите удалить эту услугу?")) return;

    const currentServices = currentMyMasterProfile.services || [];
    const updatedServices = currentServices.filter(s => s.id !== serviceId);

    if (!isOffline) {
      await dbUpdateMaster(currentMyMasterProfile.id, { services: updatedServices });
    }
    alert("Услуга удалена из прайс-листа!");
  };

  // Handle Review Reply
  const handleReplyToReview = async (reviewId: string) => {
    if (!reviewReplyText.trim()) {
      alert("Введите текст ответа!");
      return;
    }

    const updates = {
      reply: reviewReplyText,
      replyCreatedAt: new Date().toISOString()
    };

    if (!isOffline) {
      await dbUpdateMasterReview(reviewId, updates);
    }

    setReplyingToReviewId(null);
    setReviewReplyText('');
    alert("Ответ на отзыв опубликован!");
  };

  // Delete Review Reply
  const handleDeleteReviewReply = async (reviewId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить ваш ответ?")) return;

    if (!isOffline) {
      await dbUpdateMasterReview(reviewId, {
        reply: "",
        replyCreatedAt: ""
      });
    }
    alert("Ответ удален!");
  };

  // Book a service
  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMaster) return;
    if (!orderDesc.trim()) {
      alert("Опишите, какую задачу необходимо выполнить!");
      return;
    }

    const newOrderId = `order_${Date.now()}`;
    const budgetValue = orderBudget > 0 ? orderBudget : 0;
    const newOrder: ServiceOrder = {
      id: newOrderId,
      masterId: bookingMaster.id,
      masterName: bookingMaster.userName,
      masterPhone: bookingMaster.userPhone,
      clientId: currentUserId,
      clientName: currentUser.name,
      clientPhone: orderPhone || currentUser.phone || "",
      description: orderDesc,
      category: orderCategory || bookingMaster.categories[0] || "other",
      address: orderAddress,
      budget: budgetValue,
      preferredDate: orderDate,
      photos: [],
      status: 'new',
      commission: Math.round(budgetValue * 0.05), // 5% commission
      commissionPaid: false,
      createdAt: new Date().toISOString()
    };

    if (!isOffline) {
      await dbCreateServiceOrder(newOrder);
    }

    // Notify master and create chat if master is not self
    if (bookingMaster.userId !== currentUserId) {
      const linkedUser = users.find(u => u.id === bookingMaster.userId) || {
        id: bookingMaster.userId || `user_${Date.now()}`,
        name: bookingMaster.userName || "Мастер",
        phone: bookingMaster.userPhone || "",
        village: bookingMaster.userVillage || "Октябрьский",
        skills: bookingMaster.categories || [],
        thanksCount: bookingMaster.rating?.average || 0,
        createdCount: 0,
        resolvedCount: 0,
        blocked: false,
        reportsCount: 0
      };
      // Automate chat message
      onStartDirectChat(linkedUser);
    }

    // Reset booking forms
    setBookingMaster(null);
    setOrderDesc('');
    setOrderBudget(0);
    alert("Заказ успешно отправлен! Чат с мастером открыт автоматически.");
    setActiveTab('orders');
  };

  // Update Service Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'accepted' | 'in_progress' | 'completed' | 'cancelled') => {
    const updates: Partial<ServiceOrder> = {
      status: newStatus,
      ...(newStatus === 'completed' ? { completedAt: new Date().toISOString() } : {})
    };

    if (!isOffline) {
      await dbUpdateServiceOrder(orderId, updates);
    }

    if (newStatus === 'completed') {
      alert("Заказ выполнен! Клиенту отправлено предложение оставить отзыв.");
    } else {
      alert(`Статус заказа успешно обновлен!`);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingOrder) return;

    const reviewId = `mreview_${Date.now()}`;
    const avgRating = Number(((ratingQuality + ratingTimeliness + ratingPoliteness + ratingPriceQuality) / 4).toFixed(1));

    const newReview: MasterReview = {
      id: reviewId,
      orderId: reviewingOrder.id,
      masterId: reviewingOrder.masterId,
      clientId: currentUserId,
      clientName: reviewAnonymous ? "Анонимный житель" : currentUser.name,
      rating: avgRating,
      categories: {
        quality: ratingQuality,
        timeliness: ratingTimeliness,
        politeness: ratingPoliteness,
        priceQuality: ratingPriceQuality
      },
      comment: reviewComment || "Отличная работа мастера!",
      photos: [],
      isAnonymous: reviewAnonymous,
      createdAt: new Date().toISOString()
    };

    if (!isOffline) {
      await dbCreateMasterReview(newReview);
      await dbUpdateServiceOrder(reviewingOrder.id, { reviewId });
    }

    // Update master overall stats
    const linkedMaster = masters.find(m => m.id === reviewingOrder.masterId);
    if (linkedMaster) {
      const relativeReviews = masterReviews.filter(r => r.masterId === linkedMaster.id);
      const totalReviewsCount = relativeReviews.length + 1;
      const totalSum = relativeReviews.reduce((sum, r) => sum + r.rating, 0) + avgRating;
      const newAverage = Number((totalSum / totalReviewsCount).toFixed(1));

      if (!isOffline) {
        await dbUpdateMaster(linkedMaster.id, {
          rating: {
            average: newAverage,
            total: totalReviewsCount
          },
          statistics: {
            totalOrders: (linkedMaster.statistics?.totalOrders || 0) + 1,
            completedOrders: (linkedMaster.statistics?.completedOrders || 0) + 1,
            onTimePercentage: 100
          }
        });
      }
    }

    setReviewingOrder(null);
    setReviewComment('');
    alert("Спасибо! Ваш подробный отзыв успешно опубликован.");
  };

  // Simulated calling for Simplified mode
  const startSimulatedCall = (master: { name: string; phone: string; village: string }) => {
    setDialingMaster(master);
    setSimulatedCallState('calling');
    setTimeout(() => {
      setSimulatedCallState('connected');
    }, 2000);
  };

  // Simplified mode helper selection
  const SIMPLIFIED_SERVICES = [
    { id: "wood_water", label: "🪵 Дрова и Вода", emoji: "🪵", categoryId: "agriculture" },
    { id: "tractor_mowing", label: "🚜 Трактор / Покос", emoji: "🚜", categoryId: "agriculture" },
    { id: "fence_roof", label: "🔨 Починить крыльцо / Забор", emoji: "🔨", categoryId: "construction" },
    { id: "cleaning_cooking", label: "🧹 Уборка и быт", emoji: "🧹", categoryId: "household_services" },
    { id: "nursing_care", label: "🩺 Медик / Сиделка", emoji: "🩺", categoryId: "health_beauty" },
    { id: "transport_freight", label: "🚚 Привезти груз / вещи", emoji: "🚚", categoryId: "transportation" },
    { id: "other_help", label: "❓ Другое доброе дело", emoji: "❓", categoryId: "all" }
  ];

  // If Simplified Mode is active, render the elderly-friendly simplified interface
  if (currentUser.isSimplifiedMode) {
    const currentSimplifiedCategory = SIMPLIFIED_SERVICES.find(s => s.id === simplifiedSelectedCategory);
    
    // Filter masters based on selected category in simplified mode
    const simplifiedMasters = activeMastersList.filter(m => {
      if (!simplifiedSelectedCategory || simplifiedSelectedCategory === "other_help") return true;
      const serviceObj = SIMPLIFIED_SERVICES.find(s => s.id === simplifiedSelectedCategory);
      return serviceObj ? m.categories.includes(serviceObj.categoryId) || m.categories.some(catId => {
        const catObj = MASTER_CATEGORIES.find(c => c.id === serviceObj.categoryId);
        return catObj ? catObj.subcategories.some(sc => sc.id === catId) : false;
      }) : true;
    });

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 font-sans text-slate-900 bg-slate-50 min-h-screen">
        
        {/* Simplified Header */}
        <div className="bg-amber-500 text-white rounded-3xl p-6 text-center shadow-md border-4 border-amber-600 mb-8">
          <h2 className="text-3xl font-black tracking-tight">🪵 КАТАЛОГ МАСТЕРОВ</h2>
          <p className="text-lg font-bold mt-2 text-amber-950">
            Здесь вы можете найти надежного помощника в Устьянском районе и сразу позвонить ему!
          </p>
        </div>

        {/* Back navigation */}
        {simplifiedSelectedCategory && (
          <button
            onClick={() => setSimplifiedSelectedCategory(null)}
            className="mb-6 w-full text-center bg-white hover:bg-slate-100 border-4 border-slate-300 rounded-2xl py-4 text-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <ChevronRight className="rotate-180 text-slate-500" size={24} />
            <span>Вернуться к выбору услуг</span>
          </button>
        )}

        {/* Step 1: Select Category */}
        {!simplifiedSelectedCategory ? (
          <div>
            <div className="bg-white border-4 border-amber-200 rounded-3xl p-6 mb-6 shadow-sm text-center">
              <h3 className="text-2xl font-extrabold text-slate-800">Что вам необходимо сделать?</h3>
              <p className="text-base font-semibold text-slate-500 mt-1">
                Выберите один из разделов ниже, нажав большую кнопку:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SIMPLIFIED_SERVICES.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSimplifiedSelectedCategory(service.id)}
                  className="bg-white hover:bg-amber-50/50 border-4 border-slate-200 active:border-amber-400 focus:border-amber-400 rounded-3xl p-6 text-left transition-all shadow-md hover:shadow-lg flex items-center gap-5"
                >
                  <span className="text-5xl shrink-0 p-3 bg-amber-100 rounded-2xl border border-amber-200">
                    {service.emoji}
                  </span>
                  <div>
                    <h4 className="text-2xl font-black text-slate-800">{service.label}</h4>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      Нажмите, чтобы открыть список мастеров
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Step 2: List Masters in selected category
          <div className="space-y-6">
            <div className="bg-amber-50 border-4 border-amber-400 rounded-3xl p-5 text-center shadow-xs">
              <span className="text-4xl">{currentSimplifiedCategory?.emoji}</span>
              <h3 className="text-2xl font-black text-amber-950 mt-1">
                Выбран раздел: {currentSimplifiedCategory?.label}
              </h3>
              <p className="text-sm font-bold text-amber-900 mt-0.5">
                Найдено мастеров поблизости: {simplifiedMasters.length} чел.
              </p>
            </div>

            {simplifiedMasters.length === 0 ? (
              <div className="bg-white border-4 border-slate-200 rounded-3xl p-12 text-center shadow-md">
                <StarOff size={64} className="text-slate-300 mx-auto mb-4" />
                <h4 className="text-2xl font-extrabold text-slate-700">Мастеров пока нет</h4>
                <p className="text-lg text-slate-500 mt-2 font-medium">
                  К сожалению, в этой категории сейчас никто не зарегистрирован в вашем районе.
                </p>
                <div className="mt-6 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 font-bold">
                  Вы можете попросить соседей или близких создать обычную заявку "Помогите!" на главном экране.
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {simplifiedMasters.map(master => {
                  const dist = master.calculatedDistance;
                  const isLocal = dist === 0;

                  return (
                    <div 
                      key={master.id}
                      className="bg-white border-4 border-slate-200 hover:border-amber-400 rounded-3xl p-6 shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-amber-100 border-2 border-amber-300 rounded-full flex items-center justify-center font-black text-2xl text-amber-950 shrink-0">
                            {master.userName ? master.userName.charAt(0) : "М"}
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-slate-800">{master.userName}</h4>
                            <p className="text-base text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                              <Star size={18} className="fill-amber-500 text-amber-500" />
                              <span>Отличный мастер (Рейтинг {master.rating.average})</span>
                            </p>
                          </div>
                        </div>

                        <span className={`px-4 py-2 text-lg font-black rounded-full border-2 self-start md:self-auto ${
                          isLocal 
                            ? "bg-emerald-100 text-emerald-950 border-emerald-300" 
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}>
                          {isLocal ? "В вашей деревне!" : `Рядом: ~${dist} км`}
                        </span>
                      </div>

                      <div className="py-4 space-y-3">
                        <p className="text-lg font-bold text-slate-700 flex items-center gap-2">
                          <MapPin size={22} className="text-amber-500 shrink-0" />
                          <span>Живет в: <strong className="text-slate-900 font-extrabold">{master.userVillage}</strong></span>
                        </p>
                        
                        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-semibold text-slate-700 leading-relaxed">
                          <p className="font-extrabold text-slate-900 text-lg mb-1">О мастере:</p>
                          {master.description}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-base">
                          <div className="bg-slate-100/60 p-3 rounded-xl font-bold text-slate-700">
                            💼 Опыт работы: <span className="text-slate-900 font-black">{master.experience}</span>
                          </div>
                          <div className="bg-slate-100/60 p-3 rounded-xl font-bold text-slate-700">
                            💵 Стоимость: <span className="text-emerald-700 font-black">от {master.priceFrom} ₽</span>
                          </div>
                        </div>
                      </div>

                      {/* Giant Call Button */}
                      <div className="pt-4 border-t-2 border-slate-100 flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => startSimulatedCall({ name: master.userName || "", phone: master.userPhone || "", village: master.userVillage || "" })}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl py-4 px-6 rounded-2xl border-b-4 border-emerald-800 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <Phone size={24} className="animate-bounce" />
                          <span>ПОЗВОНИТЬ МАСТЕРУ</span>
                        </button>

                        <button
                          onClick={() => {
                            const linkedUser = users.find(u => u.id === master.userId) || {
                              id: master.userId || `user_${Date.now()}`,
                              name: master.userName || "Мастер",
                              phone: master.userPhone || "",
                              village: master.userVillage || "Октябрьский",
                              skills: master.categories || [],
                              thanksCount: master.rating?.average || 0,
                              createdCount: 0,
                              resolvedCount: 0,
                              blocked: false,
                              reportsCount: 0
                            };
                            onStartDirectChat(linkedUser);
                          }}
                          className="bg-white hover:bg-slate-50 border-4 border-slate-300 text-slate-800 font-black text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
                        >
                          <MessageSquare size={20} />
                          <span>Написать сообщение</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Simulated Phone Dialer Dialog */}
        {dialingMaster && (
          <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border-4 border-slate-700 rounded-3xl w-full max-w-sm p-6 text-center text-white relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => {
                    setDialingMaster(null);
                    setSimulatedCallState('idle');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 p-2 rounded-full text-white border border-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="pt-8 pb-4 space-y-4">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-5xl font-black text-white shadow-lg border-4 border-white animate-pulse">
                  📞
                </div>

                <div>
                  <h3 className="text-2xl font-black">{dialingMaster.name}</h3>
                  <p className="text-slate-400 font-bold mt-1">из деревни {dialingMaster.village}</p>
                  <p className="text-xl font-mono text-emerald-400 tracking-wider mt-3 font-bold">{dialingMaster.phone}</p>
                </div>

                <div className="py-4 font-bold text-base">
                  {simulatedCallState === 'calling' && (
                    <span className="text-amber-400 animate-pulse">Идёт набор номера... Пожалуйста, подождите</span>
                  )}
                  {simulatedCallState === 'connected' && (
                    <span className="text-emerald-400">Соединение установлено! Идет симуляция разговора...</span>
                  )}
                </div>

                {simulatedCallState === 'connected' ? (
                  <button
                    onClick={() => {
                      setSimulatedCallState('ended');
                      setTimeout(() => setDialingMaster(null), 1000);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl text-xl shadow-md border-b-4 border-red-800"
                  >
                    Завершить вызов
                  </button>
                ) : (
                  <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <p className="text-xs text-slate-300 font-bold">
                      В реальной мобильной версии это действие откроет стандартный набор номера на вашем телефоне.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STANDARD MODE INTERFACE
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans text-slate-800">
      
      {/* Title block */}
      <div className="bg-linear-to-r from-brand-dark to-brand-medium text-white p-6 rounded-3xl shadow-md border border-brand-medium/30 mb-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6 translate-x-6">
          <Award size={200} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black flex items-center gap-2">
              <Award className="text-amber-300 animate-pulse" size={28} />
              Каталог умений и портфолио мастеров
            </h3>
            <p className="text-xs text-brand-light font-medium mt-1">
              Профессиональный поиск мастеров, столяров, плотников и умельцев в Устьянском районе. Просматривайте фото работ, отзывы и заказывайте напрямую.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                activeTab === 'catalog' 
                  ? "bg-white text-brand-dark border-white shadow-sm" 
                  : "bg-brand-medium/50 text-white border-brand-medium/70 hover:bg-brand-medium/75"
              }`}
            >
              🔍 Найти мастера
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                activeTab === 'orders' 
                  ? "bg-white text-brand-dark border-white shadow-sm" 
                  : "bg-brand-medium/50 text-white border-brand-medium/70 hover:bg-brand-medium/75"
              }`}
            >
              📋 Заказы ({myClientOrders.length + (isRegisteredAsMaster ? myMasterOrders.length : 0)})
            </button>
            <button
              onClick={() => setActiveTab('cabinet')}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                activeTab === 'cabinet' 
                  ? "bg-white text-brand-dark border-white shadow-sm" 
                  : "bg-brand-medium/50 text-white border-brand-medium/70 hover:bg-brand-medium/75"
              }`}
            >
              💼 Кабинет мастера
            </button>
          </div>
        </div>
      </div>

      {/* RENDER TAB: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                Категории услуг
              </h4>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center justify-between ${
                    selectedCategoryId === 'all'
                      ? "bg-brand-medium text-white border-brand-medium shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award size={14} />
                    <span>Все направления</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${selectedCategoryId === 'all' ? "bg-white text-brand-dark" : "bg-slate-200"}`}>
                    {masters.length}
                  </span>
                </button>

                {MASTER_CATEGORIES.map(category => {
                  const IconComponent = CATEGORY_ICONS[category.id] || HelpCircle;
                  const isActive = selectedCategoryId === category.id;
                  
                  // Count masters belonging to this category robustly
                  const catMastersCount = masters.filter(m => {
                    const subIds = category.subcategories.map(s => s.id);
                    const matchesCategoryName = m.category && category.name.toLowerCase().includes(m.category.toLowerCase());
                    return m.categories.includes(category.id) || 
                           m.categories.some(catId => subIds.includes(catId)) ||
                           m.type === category.id ||
                           matchesCategoryName;
                  }).length;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center justify-between ${
                        isActive
                          ? "bg-brand-medium text-white border-brand-medium shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent size={14} />
                        <span>{category.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isActive ? "bg-white text-brand-dark" : "bg-slate-200"}`}>
                        {catMastersCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Offline Alert */}
            {isOffline && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-2.5 text-amber-900">
                <AlertCircle className="shrink-0 text-amber-600" size={18} />
                <div>
                  <h5 className="text-xs font-black">Автономный режим</h5>
                  <p className="text-[10px] font-medium leading-relaxed mt-0.5">
                    Вы просматриваете сохраненные данные. Создание заказов и отзывов будет синхронизировано при подключении к сети.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Masters grid list */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Search filter row */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Поиск мастера по имени, ключевым навыкам или населенному пункту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-2xl text-xs transition-all shadow-xs"
              />
            </div>

            {/* Result display info */}
            {activeMastersList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
                <StarOff size={48} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-black text-slate-700">Никого не найдено</h4>
                <p className="text-xs text-slate-400 mt-1">
                  По вашему запросу или выбранной категории мастера не зарегистрированы. Попробуйте сбросить фильтры.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMastersList.map(master => {
                  const linkedUser = users.find(u => u.id === master.userId);
                  const isLocal = master.calculatedDistance === 0;

                  return (
                    <div
                      key={master.id}
                      className={`bg-white border rounded-3xl p-4 shadow-xs transition-all flex flex-col justify-between ${
                        isLocal 
                          ? "border-brand-medium bg-brand-light/5" 
                          : "border-slate-200 hover:border-brand-medium/55"
                      }`}
                    >
                      <div>
                        {/* Header card info */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-11 h-11 bg-brand-light/30 rounded-full flex items-center justify-center font-black text-sm text-brand-dark border border-brand-light/40 shrink-0 overflow-hidden">
                              {master.userAvatar ? (
                                <img src={master.userAvatar} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span>{master.userName?.charAt(0) || "M"}</span>
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-slate-800 flex items-center gap-1">
                                {master.userName}
                                {master.userId === currentUserId && (
                                  <span className="px-1.5 py-0.5 bg-brand-medium text-white text-[9px] font-bold rounded">ВЫ</span>
                                )}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                                  <Star size={10} className="fill-amber-500 text-amber-500" />
                                  <span>{master.rating.average}</span>
                                </p>
                                <span className="text-slate-300 text-[10px]">•</span>
                                <p className="text-[10px] text-slate-500 font-medium">Отзывов: {master.rating.total}</p>
                              </div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-full border ${
                            isLocal 
                              ? "bg-emerald-500 text-white border-emerald-500" 
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                            {isLocal ? "В вашей деревне" : `~ ${master.calculatedDistance} км`}
                          </span>
                        </div>

                        {/* Location / Village */}
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono mb-2">
                          <MapPin size={11} className="text-slate-400 shrink-0" />
                          <span>Расположение: <strong className="text-slate-700 font-bold">{master.userVillage}</strong></span>
                        </p>

                        {/* Description snippet */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl mb-3 border border-slate-100">
                          {master.description}
                        </p>

                        {/* Quick Skills badges */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {master.categories.slice(0, 3).map(catId => {
                            // Find category label
                            let label = catId;
                            for (const c of MASTER_CATEGORIES) {
                              if (c.id === catId) { label = c.name; break; }
                              const sub = c.subcategories.find(s => s.id === catId);
                              if (sub) { label = sub.name; break; }
                            }
                            return (
                              <span key={catId} className="px-2 py-0.5 bg-slate-100 border border-slate-200/50 text-[9px] font-black rounded text-slate-600">
                                {label}
                              </span>
                            );
                          })}
                          {master.categories.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-brand-light/20 text-[9px] font-bold rounded text-brand-dark">
                              +{master.categories.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Experience and Pricing */}
                        <div className="flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100 mb-2">
                          <span className="text-[10px] font-bold text-slate-500">Опыт: <strong className="text-slate-800">{master.experience}</strong></span>
                          <span className="text-[10px] font-bold text-slate-500">Услуги: <strong className="text-emerald-600">от {master.priceFrom} ₽</strong></span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="border-t border-slate-100 pt-3 mt-2 flex justify-between items-center gap-2">
                        <button
                          onClick={() => {
                            setViewingMaster(master);
                            setMasterDetailTab('info');
                          }}
                          className="text-[10px] font-black text-brand-medium hover:text-brand-dark px-2 py-1 rounded-lg hover:bg-slate-100"
                        >
                          Портфолио и отзывы →
                        </button>

                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              const linkedUser = users.find(u => u.id === master.userId) || {
                                id: master.userId || `user_${Date.now()}`,
                                name: master.userName || "Мастер",
                                phone: master.userPhone || "",
                                village: master.userVillage || "Октябрьский",
                                skills: master.categories || [],
                                thanksCount: master.rating?.average || 0,
                                createdCount: 0,
                                resolvedCount: 0,
                                blocked: false,
                                reportsCount: 0
                              };
                              onStartDirectChat(linkedUser);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 p-2 text-slate-600 rounded-xl transition-all"
                            title="Написать сообщение"
                          >
                            <MessageSquare size={13} />
                          </button>

                          {master.userId !== currentUserId && (
                            <button
                              onClick={() => {
                                setBookingMaster(master);
                                setOrderCategory(master.categories[0] || 'other');
                              }}
                              className="bg-brand-medium hover:bg-brand-dark text-white font-black py-1.5 px-3 rounded-xl text-[10px] transition-all shadow-xs flex items-center gap-1"
                            >
                              <Plus size={10} />
                              Заказать услугу
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* RENDER TAB: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Sub-section: Orders I requested as client */}
          <div>
            <h4 className="text-sm font-black text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <Calendar className="text-brand-medium" size={18} />
              Мои заказы мастеров (Я клиент)
            </h4>

            {myClientOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                Вы ещё не заказывали услуги у мастеров через каталог.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myClientOrders.map(order => {
                  let statusColor = "bg-slate-100 text-slate-600";
                  let statusText = "Новый";
                  if (order.status === 'accepted') { statusColor = "bg-sky-100 text-sky-800"; statusText = "Принят мастером"; }
                  if (order.status === 'in_progress') { statusColor = "bg-amber-100 text-amber-800 animate-pulse"; statusText = "В работе"; }
                  if (order.status === 'completed') { statusColor = "bg-emerald-100 text-emerald-800"; statusText = "Выполнен"; }
                  if (order.status === 'cancelled') { statusColor = "bg-rose-100 text-rose-800"; statusText = "Отменен"; }

                  return (
                    <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs relative">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h5 className="text-xs font-black text-slate-800">Мастер: {order.masterName}</h5>
                          <p className="text-[10px] text-slate-400 font-medium">Создан: {new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-3 leading-relaxed mb-3">
                        {order.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-3 border-b border-slate-50 pb-2.5">
                        <div>📅 Срок: <strong className="text-slate-800 font-bold">{order.preferredDate}</strong></div>
                        <div>💰 Бюджет: <strong className="text-emerald-600 font-bold">{order.budget ? `${order.budget} ₽` : "Договорная"}</strong></div>
                        <div>📍 Адрес доставки: <strong className="text-slate-800 font-bold">{order.address}</strong></div>
                        <div>📞 Телефон: <strong className="text-slate-800 font-bold">{order.clientPhone}</strong></div>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        {order.status === 'completed' && !order.reviewId && (
                          <button
                            onClick={() => {
                              setReviewingOrder(order);
                              setReviewRating(5);
                              setReviewComment('');
                              setReviewAnonymous(false);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-black py-1.5 px-3 rounded-xl text-[10px] flex items-center gap-1 shadow-xs"
                          >
                            <Star size={11} className="fill-white" />
                            Оставить отзыв
                          </button>
                        )}
                        {order.reviewId && (
                          <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                            <Check size={12} /> Отзыв оставлен
                          </span>
                        )}

                        <div className="flex gap-1 ml-auto">
                          <button
                            onClick={() => {
                              const linkedMaster = masters.find(m => m.id === order.masterId);
                              const linkedUser = (linkedMaster ? users.find(u => u.id === linkedMaster.userId) : null) || {
                                id: linkedMaster?.userId || `user_${Date.now()}`,
                                name: order.masterName || "Мастер",
                                phone: linkedMaster?.userPhone || "",
                                village: linkedMaster?.userVillage || "Октябрьский",
                                skills: linkedMaster?.categories || [],
                                thanksCount: linkedMaster?.rating?.average || 0,
                                createdCount: 0,
                                resolvedCount: 0,
                                blocked: false,
                                reportsCount: 0
                              };
                              onStartDirectChat(linkedUser);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-3 rounded-xl text-[10px] font-black flex items-center gap-1"
                          >
                            <MessageSquare size={11} />
                            Чат с мастером
                          </button>
                          
                          {['new', 'accepted'].includes(order.status) && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 px-3 rounded-xl text-[10px] font-black border border-rose-200/50"
                            >
                              Отменить
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sub-section: Orders received as master */}
          {isRegisteredAsMaster && (
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-black text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                <Briefcase className="text-brand-medium" size={18} />
                Полученные заявки (Я мастер)
              </h4>

              {myMasterOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                  Пока нет входящих заявок.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myMasterOrders.map(order => {
                    let statusColor = "bg-slate-100 text-slate-600";
                    let statusText = "Новый";
                    if (order.status === 'accepted') { statusColor = "bg-sky-100 text-sky-800"; statusText = "Вы приняли"; }
                    if (order.status === 'in_progress') { statusColor = "bg-amber-100 text-amber-800"; statusText = "В работе"; }
                    if (order.status === 'completed') { statusColor = "bg-emerald-100 text-emerald-800"; statusText = "Выполнен"; }
                    if (order.status === 'cancelled') { statusColor = "bg-rose-100 text-rose-800"; statusText = "Отклонен"; }

                    return (
                      <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <h5 className="text-xs font-black text-slate-800">Заказчик: {order.clientName}</h5>
                            <p className="text-[10px] text-slate-400 font-medium">Создан: {new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-3 leading-relaxed mb-3">
                          {order.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-3 border-b border-slate-50 pb-2.5">
                          <div>📅 Срок: <strong className="text-slate-800 font-bold">{order.preferredDate}</strong></div>
                          <div>💰 Бюджет: <strong className="text-emerald-600 font-bold">{order.budget ? `${order.budget} ₽` : "Не указан"}</strong></div>
                          <div>📍 Адрес клиента: <strong className="text-slate-800 font-bold">{order.address}</strong></div>
                          <div>📞 Телефон: <strong className="text-slate-800 font-bold">{order.clientPhone}</strong></div>
                        </div>

                        {/* Commission calculator */}
                        {order.budget ? (
                          <div className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-100 p-2 rounded-xl mb-3">
                            Комиссия за заказ (5%): {order.commission} ₽ {order.commissionPaid ? "(Оплачена)" : "(Оплачивается после завершения)"}
                          </div>
                        ) : null}

                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const linkedUser = users.find(u => u.id === order.clientId) || {
                                id: order.clientId || `user_${Date.now()}`,
                                name: order.clientName || "Клиент",
                                phone: order.clientPhone || "",
                                village: "Октябрьский",
                                skills: [],
                                thanksCount: 0,
                                createdCount: 0,
                                resolvedCount: 0,
                                blocked: false,
                                reportsCount: 0
                              };
                              onStartDirectChat(linkedUser);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-3 rounded-xl text-[10px] font-black flex items-center gap-1"
                          >
                            <MessageSquare size={11} />
                            Обсудить в чате
                          </button>

                          {order.status === 'new' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-1.5 px-3 rounded-xl text-[10px]"
                              >
                                Принять заказ
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 py-1.5 px-3 rounded-xl text-[10px] font-black"
                              >
                                Отклонить
                              </button>
                            </>
                          )}

                          {order.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}
                              className="bg-amber-500 hover:bg-amber-600 text-white font-black py-1.5 px-3 rounded-xl text-[10px]"
                            >
                              Начать работу
                            </button>
                          )}

                          {order.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-1.5 px-3 rounded-xl text-[10px]"
                            >
                              Завершить работу
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* RENDER TAB: CABINET */}
      {activeTab === 'cabinet' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          {!isRegisteredAsMaster ? (
            // Form to register
            <div className="max-w-2xl mx-auto py-4 text-center space-y-6">
              <Award className="mx-auto text-brand-medium animate-bounce" size={56} />
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-800">Станьте зарегистрированным мастером Устьяны!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Расскажите о своих умениях (строительство, ремонт, парикмахерские услуги, вспашка огорода и другие), покажите свои работы жителям и получайте заказы с полной поддержкой связи через платформу!
                </p>
              </div>

              {!registering ? (
                <button
                  onClick={() => {
                    setRegistering(true);
                    setMasterCats([]);
                  }}
                  className="bg-brand-medium hover:bg-brand-dark text-white font-black py-3 px-8 rounded-2xl text-xs transition-all shadow-md"
                >
                  🚀 Заполнить анкету мастера
                </button>
              ) : (
                <form onSubmit={handleRegisterMaster} className="text-left bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                  <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 mb-3">
                    Анкета мастера взаимопомощи
                  </h5>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Выберите ваши навыки / умения:</label>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {masterCats.length} выбрано
                      </span>
                    </div>
                    
                    {/* Search field for skills */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Быстрый поиск услуг (например: терапевт, электрик)..."
                        value={registerSkillSearch}
                        onChange={(e) => setRegisterSkillSearch(e.target.value)}
                        className="w-full border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-xs py-1.5 px-3 mb-2 bg-white"
                      />
                      {registerSkillSearch && (
                        <button
                          type="button"
                          onClick={() => setRegisterSkillSearch('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-2xl max-h-56 overflow-y-auto space-y-4">
                      {MASTER_CATEGORIES.map(cat => {
                        // Filter subcategories by search text
                        const filteredSubs = cat.subcategories.filter(sub =>
                          sub.name.toLowerCase().includes(registerSkillSearch.toLowerCase()) ||
                          cat.name.toLowerCase().includes(registerSkillSearch.toLowerCase())
                        );

                        if (filteredSubs.length === 0) return null;

                        return (
                          <div key={cat.id} className="space-y-1.5">
                            <p className="text-[10px] font-black text-brand-medium border-b border-slate-100 pb-1 flex items-center justify-between">
                              <span>{cat.name}</span>
                              <span className="text-[9px] text-slate-400 font-normal">({filteredSubs.length})</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1">
                              {filteredSubs.map(sub => (
                                <label key={sub.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer hover:text-slate-800 py-0.5">
                                  <input
                                    type="checkbox"
                                    checked={masterCats.includes(sub.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setMasterCats([...masterCats, sub.id]);
                                      } else {
                                        setMasterCats(masterCats.filter(id => id !== sub.id));
                                      }
                                    }}
                                    className="rounded text-brand-medium focus:ring-brand-medium"
                                  />
                                  <span>{sub.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {MASTER_CATEGORIES.every(cat => 
                        cat.subcategories.filter(sub =>
                          sub.name.toLowerCase().includes(registerSkillSearch.toLowerCase()) ||
                          cat.name.toLowerCase().includes(registerSkillSearch.toLowerCase())
                        ).length === 0
                      ) && (
                        <div className="text-center py-4 text-xs text-slate-400">
                          Услуги с таким названием не найдены
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Расскажите о себе (Ваш профиль):</label>
                    <textarea
                      value={masterDesc}
                      onChange={(e) => setMasterDesc(e.target.value)}
                      placeholder="Опишите, какие виды работ выполняете, какие материалы используете, гарантия на работу и т.д."
                      className="w-full border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-2xl text-xs p-2.5 bg-white h-24"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Опыт работы:</label>
                      <input
                        type="text"
                        value={masterExperience}
                        onChange={(e) => setMasterExperience(e.target.value)}
                        placeholder="Например: 5 лет, более 10 лет"
                        className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Обучение / сертификаты:</label>
                      <input
                        type="text"
                        value={masterEducation}
                        onChange={(e) => setMasterEducation(e.target.value)}
                        placeholder="Например: Самоучка, Диплом ПТУ №12"
                        className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Начальная цена за работу (от, ₽):</label>
                      <input
                        type="number"
                        value={masterPriceFrom}
                        onChange={(e) => setMasterPriceFrom(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase">Уточнение цены:</label>
                      <input
                        type="text"
                        value={masterPriceDesc}
                        onChange={(e) => setMasterPriceDesc(e.target.value)}
                        placeholder="Например: в час, за смену, договорная"
                        className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">График и часы работы:</label>
                    <input
                      type="text"
                      value={masterWorkingHours}
                      onChange={(e) => setMasterWorkingHours(e.target.value)}
                      placeholder="Например: Пн-Пт 9:00 - 18:00, Без выходных"
                      className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRegistering(false)}
                      className="bg-white border border-slate-300 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-medium hover:bg-brand-dark text-white font-black px-6 py-2 rounded-xl text-xs"
                    >
                      Зарегистрироваться
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            // Registered Master Panel
            <div className="space-y-6">
              {/* Dashboard Header */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                      <Briefcase size={18} />
                    </span>
                    <h4 className="text-base font-black text-slate-800">Личный кабинет мастера</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Управляйте анкетой, портфолио, ценами, заказами и общайтесь с клиентами.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-600">Статус в каталоге:</span>
                    <button
                      onClick={() => {
                        setMasterActive(!masterActive);
                        if (currentMyMasterProfile && !isOffline) {
                          dbUpdateMaster(currentMyMasterProfile.id, { isActive: !masterActive });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                        masterActive 
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-xs" 
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {masterActive ? "🟢 Активен (Виден всем)" : "🔴 Отключен (Скрыт)"}
                    </button>
                  </div>
                </div>
              </div>

              {/* 5 Tabs Navigation Bar */}
              <div className="flex overflow-x-auto gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 scrollbar-none">
                <button
                  onClick={() => setCabinetTab('info')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    cabinetTab === 'info'
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <User size={14} />
                  О себе
                </button>
                <button
                  onClick={() => setCabinetTab('portfolio')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    cabinetTab === 'portfolio'
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Sparkles size={14} />
                  Портфолио
                  <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                    {portfolioItems.filter(p => p.masterId === currentMyMasterProfile.id).length}
                  </span>
                </button>
                <button
                  onClick={() => setCabinetTab('prices')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    cabinetTab === 'prices'
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <DollarSign size={14} />
                  Прайс-лист
                  <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                    {currentMyMasterProfile.services?.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => setCabinetTab('orders')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    cabinetTab === 'orders'
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Calendar size={14} />
                  Заказы
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                    {myMasterOrders.length}
                  </span>
                </button>
                <button
                  onClick={() => setCabinetTab('reviews')}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    cabinetTab === 'reviews'
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  Отзывы
                  <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                    {masterReviews.filter(r => r.masterId === currentMyMasterProfile.id).length}
                  </span>
                </button>
              </div>

              {/* Sub-panels container */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                
                {/* TAB 1: INFO ("О СЕБЕ") */}
                {cabinetTab === 'info' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h5 className="text-sm font-black text-slate-800">Анкета специалиста</h5>
                      <p className="text-[11px] text-slate-400">Данные поля отображаются в общем каталоге мастеров для клиентов.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left side: Avatar & Category Picker */}
                      <div className="space-y-5">
                        {/* Profile Photo Block with Compression and Drag-and-Drop */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-3 text-left">Фото профиля:</label>
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                              {masterPhotoUrl ? (
                                <>
                                  <img src={masterPhotoUrl} alt="master photo" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => setMasterPhotoUrl('')}
                                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-white font-bold text-[10px] flex items-center justify-center transition-all"
                                  >
                                    Удалить
                                  </button>
                                </>
                              ) : (
                                <User className="text-slate-300" size={32} />
                              )}

                              {isUploadingPhoto && (
                                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-2">
                                  <span className="text-[9px] font-black text-slate-600 animate-pulse">Сжатие...</span>
                                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${uploadProgress}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="w-full">
                              <label className="cursor-pointer bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-black py-1.5 px-3 rounded-xl shadow-xs transition-all block text-center">
                                {masterPhotoUrl ? "Сменить фото" : "Загрузить фото"}
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/webp"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 5 * 1024 * 1024) {
                                        alert("Файл превышает 5 МБ!");
                                        return;
                                      }
                                      setIsUploadingPhoto(true);
                                      setUploadProgress(20);
                                      try {
                                        const compressed = await compressImage(file, 1024, 1024, 0.75);
                                        setUploadProgress(70);
                                        setMasterPhotoUrl(compressed);
                                        setUploadProgress(100);
                                      } catch (err) {
                                        alert("Ошибка загрузки!");
                                      } finally {
                                        setTimeout(() => {
                                          setIsUploadingPhoto(false);
                                          setUploadProgress(0);
                                        }, 300);
                                      }
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-[9px] text-slate-400 mt-1.5">JPG, PNG или WEBP до 5 МБ. Сжимается автоматически.</p>
                            </div>

                            <div className="w-full">
                              <input
                                type="url"
                                value={masterPhotoUrl}
                                onChange={(e) => setMasterPhotoUrl(e.target.value)}
                                placeholder="Или укажите прямую URL-ссылку"
                                className="w-full border border-slate-200 rounded-xl text-[10px] p-2 bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Specializations (Up to 10 checkboxes with search) */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase block">Услуги в каталоге (до 10):</label>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {masterCats.length} выбрано
                            </span>
                          </div>

                          {/* Search field for skills */}
                          <div className="relative mb-2">
                            <input
                              type="text"
                              placeholder="Быстрый поиск услуг..."
                              value={editSkillSearch}
                              onChange={(e) => setEditSkillSearch(e.target.value)}
                              className="w-full border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-xl text-xs py-1.5 px-3 bg-white"
                            />
                            {editSkillSearch && (
                              <button
                                type="button"
                                onClick={() => setEditSkillSearch('')}
                                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          <div className="p-2.5 bg-white border border-slate-200 rounded-xl max-h-72 overflow-y-auto space-y-4">
                            {MASTER_CATEGORIES.map(cat => {
                              const filteredSubs = cat.subcategories.filter(sub =>
                                sub.name.toLowerCase().includes(editSkillSearch.toLowerCase()) ||
                                cat.name.toLowerCase().includes(editSkillSearch.toLowerCase())
                              );

                              if (filteredSubs.length === 0) return null;

                              return (
                                <div key={cat.id} className="space-y-1.5">
                                  <p className="text-[10px] font-black text-brand-medium border-b border-slate-100 pb-1 flex items-center justify-between">
                                    <span>{cat.name}</span>
                                    <span className="text-[9px] text-slate-400 font-normal">({filteredSubs.length})</span>
                                  </p>
                                  <div className="grid grid-cols-1 gap-1.5 pl-1">
                                    {filteredSubs.map(sub => (
                                      <label key={sub.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer hover:text-slate-800 py-0.5">
                                        <input
                                          type="checkbox"
                                          checked={masterCats.includes(sub.id)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              if (masterCats.length >= 10) {
                                                alert("Можно выбрать максимум 10 специализаций!");
                                                return;
                                              }
                                              setMasterCats([...masterCats, sub.id]);
                                            } else {
                                              setMasterCats(masterCats.filter(id => id !== sub.id));
                                            }
                                          }}
                                          className="rounded text-brand-medium focus:ring-brand-medium"
                                        />
                                        <span>{sub.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                            {MASTER_CATEGORIES.every(cat => 
                              cat.subcategories.filter(sub =>
                                sub.name.toLowerCase().includes(editSkillSearch.toLowerCase()) ||
                                cat.name.toLowerCase().includes(editSkillSearch.toLowerCase())
                              ).length === 0
                            ) && (
                              <div className="text-center py-4 text-xs text-slate-400">
                                Услуги с таким названием не найдены
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Inputs fields */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase">Рассказ о себе и опыте:</label>
                          <textarea
                            value={masterDesc}
                            onChange={(e) => setMasterDesc(e.target.value)}
                            placeholder="Опишите ваши навыки, как вы работаете, какие материалы используете..."
                            className="w-full border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-2xl text-xs p-3 bg-white h-32 leading-relaxed"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Опыт работы (лет/месяцев):</label>
                            <input
                              type="text"
                              value={masterExperience}
                              onChange={(e) => setMasterExperience(e.target.value)}
                              placeholder="Например: 5 лет"
                              className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Обучение / Сертификаты:</label>
                            <input
                              type="text"
                              value={masterEducation}
                              onChange={(e) => setMasterEducation(e.target.value)}
                              placeholder="Диплом ПТУ, курсы или самоучка"
                              className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Минимальный заказ (от, ₽):</label>
                            <input
                              type="number"
                              value={masterPriceFrom}
                              onChange={(e) => setMasterPriceFrom(Number(e.target.value))}
                              className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Пояснение к прайсу:</label>
                            <input
                              type="text"
                              value={masterPriceDesc}
                              onChange={(e) => setMasterPriceDesc(e.target.value)}
                              placeholder="за точку, за выезд, зависит от сложности"
                              className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase">График и часы работы:</label>
                          <input
                            type="text"
                            value={masterWorkingHours}
                            onChange={(e) => setMasterWorkingHours(e.target.value)}
                            placeholder="Пн-Сб 09:00 - 20:00, Вс - выходной"
                            className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold"
                          />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                          <button
                            type="button"
                            onClick={handleSaveMasterProfile}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-6 rounded-2xl text-xs shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <Check size={14} />
                            Сохранить профиль
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 2: PORTFOLIO */}
                {cabinetTab === 'portfolio' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="text-sm font-black text-slate-800">Портфолио работ</h5>
                        <p className="text-[11px] text-slate-400">Показывайте жителям примеры завершенных заказов. Максимум 10 работ по 5 фото.</p>
                      </div>
                      {!editingPortfolioItem && (
                        <button
                          onClick={() => {
                            setPortTitle('');
                            setPortDesc('');
                            setPortCategory(masterCats[0] || '');
                            setPortPrice(0);
                            setPortPhotos([]);
                            setPortCustomPhoto('');
                            setShowAddPortfolioModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
                        >
                          <Plus size={14} />
                          Добавить работу
                        </button>
                      )}
                    </div>

                    {/* Edit Work form inline if selected */}
                    {editingPortfolioItem && (
                      <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                          <h6 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                            <Edit size={14} /> Редактировать работу в портфолио
                          </h6>
                          <button onClick={() => setEditingPortfolioItem(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                          </button>
                        </div>

                        <form onSubmit={handleSavePortfolioItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase">Название работы:</label>
                              <input
                                type="text"
                                value={editPortTitle}
                                onChange={(e) => setEditPortTitle(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl text-xs p-2 bg-white font-bold"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase">Описание:</label>
                              <textarea
                                value={editPortDesc}
                                onChange={(e) => setEditPortDesc(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl text-xs p-2 bg-white h-20"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Категория:</label>
                                <select
                                  value={editPortCategory}
                                  onChange={(e) => setEditPortCategory(e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl text-xs p-2 bg-white"
                                >
                                  {masterCats.map(id => {
                                    const match = MASTER_CATEGORIES.flatMap(c => [c, ...c.subcategories]).find(x => x.id === id);
                                    return <option key={id} value={id}>{match?.name || id}</option>;
                                  })}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase">Стоимость (₽):</label>
                                <input
                                  type="number"
                                  value={editPortPrice}
                                  onChange={(e) => setEditPortPrice(Number(e.target.value))}
                                  className="w-full border border-slate-200 rounded-xl text-xs p-2 bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase block">Фото работы (до 5):</label>
                              
                              <div className="flex flex-wrap gap-2 p-2 bg-slate-100 rounded-xl">
                                {editPortPhotos.map((url, i) => (
                                  <div key={i} className="relative w-12 h-12 bg-white rounded-lg overflow-hidden border border-slate-200">
                                    <img src={url} alt="portfolio" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setEditPortPhotos(editPortPhotos.filter((_, idx) => idx !== i))}
                                      className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5"
                                    >
                                      <X size={8} />
                                    </button>
                                  </div>
                                ))}

                                {editPortPhotos.length < 5 && (
                                  <label className="w-12 h-12 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                                    <Plus size={14} className="text-slate-400" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            const compressed = await compressImage(file, 1024, 1024, 0.75);
                                            setEditPortPhotos([...editPortPhotos, compressed]);
                                          } catch (err) {
                                            alert("Ошибка!");
                                          }
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase">Локация:</label>
                              <input
                                type="text"
                                value={editPortLocation}
                                onChange={(e) => setEditPortLocation(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl text-xs p-2 bg-white"
                              />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPortfolioItem(null)}
                                className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-lg"
                              >
                                Отмена
                              </button>
                              <button
                                type="submit"
                                className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg"
                              >
                                Сохранить
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Works Grid */}
                    {portfolioItems.filter(p => p.masterId === currentMyMasterProfile.id).length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-400">
                        У вас ещё нет добавленных работ. Покажите клиентам, на что вы способны!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolioItems
                          .filter(p => p.masterId === currentMyMasterProfile.id)
                          .map(item => (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between group">
                              <div className="relative h-44 bg-slate-100">
                                <img src={item.photos[0] || PORTFOLIO_PRESET_IMAGES[0].url} alt="work" className="w-full h-full object-cover" />
                                
                                {/* Overlay Actions */}
                                <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingPortfolioItem(item);
                                      setEditPortTitle(item.title);
                                      setEditPortDesc(item.description);
                                      setEditPortCategory(item.category);
                                      setEditPortPrice(item.price || 0);
                                      setEditPortPhotos(item.photos);
                                      setEditPortLocation(item.location || '');
                                    }}
                                    className="bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-xs"
                                    title="Редактировать работу"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePortfolioItem(item.id)}
                                    className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-xs"
                                    title="Удалить из портфолио"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <div className="absolute bottom-2.5 left-2.5 bg-black/55 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <MapPin size={9} /> {item.location}
                                </div>
                              </div>

                              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                  <h6 className="text-xs font-black text-slate-800 leading-tight line-clamp-1">{item.title}</h6>
                                  <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">{item.description}</p>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase">
                                    {masterCats.includes(item.category) 
                                      ? (MASTER_CATEGORIES.flatMap(c => [c, ...c.subcategories]).find(x => x.id === item.category)?.name || item.category)
                                      : item.category
                                    }
                                  </span>
                                  {item.price ? (
                                    <span className="text-xs text-emerald-600 font-black">{item.price} ₽</span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold">цена договорная</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: PRICE LIST */}
                {cabinetTab === 'prices' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="text-sm font-black text-slate-800">Прайс-лист услуг</h5>
                        <p className="text-[11px] text-slate-400">Сформируйте список услуг для прозрачного ценообразования.</p>
                      </div>
                      {!editingService && !showAddServiceModal && (
                        <button
                          onClick={() => {
                            setServiceName('');
                            setServiceDesc('');
                            setServicePrice(0);
                            setServiceUnit('шт');
                            setShowAddServiceModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all animate-bounce"
                        >
                          <Plus size={14} />
                          Добавить услугу
                        </button>
                      )}
                    </div>

                    {/* Add/Edit service form block */}
                    {(showAddServiceModal || editingService) && (
                      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                        <h6 className="text-xs font-black text-slate-700 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                          {editingService ? "✏️ Редактировать услугу" : "➕ Добавить новую услугу"}
                        </h6>
                        <form onSubmit={editingService ? handleSaveService : handleAddService} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Название услуги:</label>
                            <input
                              type="text"
                              value={serviceName}
                              onChange={(e) => setServiceName(e.target.value)}
                              placeholder="Например: Монтаж розетки / Выключателя"
                              className="w-full border border-slate-200 rounded-xl text-xs p-2.5 bg-white font-bold"
                              required
                            />
                          </div>

                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Описание услуги (не обязательно):</label>
                            <input
                              type="text"
                              value={serviceDesc}
                              onChange={(e) => setServiceDesc(e.target.value)}
                              placeholder="Включает штробление, укладку кабеля и установку подрозетника"
                              className="w-full border border-slate-200 rounded-xl text-xs p-2.5 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Стоимость (₽):</label>
                            <input
                              type="number"
                              value={servicePrice}
                              onChange={(e) => setServicePrice(Number(e.target.value))}
                              className="w-full border border-slate-200 rounded-xl text-xs p-2.5 bg-white font-bold text-emerald-600"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase">Единица измерения:</label>
                            <select
                              value={serviceUnit}
                              onChange={(e) => setServiceUnit(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl text-xs p-2.5 bg-white font-bold text-slate-700"
                            >
                              <option value="шт">за штуку (шт)</option>
                              <option value="час">за час работы (час)</option>
                              <option value="м²">за кв. метр (м²)</option>
                              <option value="пог. м">за пог. метр (пог. м)</option>
                              <option value="услуга">за услугу целиком</option>
                              <option value="куб. м">за куб. метр (м³)</option>
                            </select>
                          </div>

                          <div className="flex items-end justify-end gap-2 pt-2 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddServiceModal(false);
                                setEditingService(null);
                              }}
                              className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold"
                            >
                              Отмена
                            </button>
                            <button
                              type="submit"
                              className="bg-emerald-600 text-white font-black px-6 py-2 rounded-xl text-xs"
                            >
                              Сохранить
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Services table */}
                    {(!currentMyMasterProfile.services || currentMyMasterProfile.services.length === 0) ? (
                      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-400">
                        Ваш прайс-лист пока пуст. Заполните его, чтобы клиенты сразу видели стоимость ваших услуг.
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                              <th className="p-3.5">Услуга</th>
                              <th className="p-3.5">Описание</th>
                              <th className="p-3.5 text-right">Стоимость</th>
                              <th className="p-3.5 text-center">Действие</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                            {currentMyMasterProfile.services.map(s => (
                              <tr key={s.id} className="hover:bg-slate-50/55 transition-colors">
                                <td className="p-3.5 text-slate-950 font-black">{s.name}</td>
                                <td className="p-3.5 text-slate-500 font-medium">{s.description || "—"}</td>
                                <td className="p-3.5 text-right text-emerald-600 font-black text-sm">
                                  {s.price} ₽ <span className="text-[10px] text-slate-400 font-medium">/ {s.unit}</span>
                                </td>
                                <td className="p-3.5 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingService(s);
                                        setServiceName(s.name);
                                        setServiceDesc(s.description || '');
                                        setServicePrice(s.price);
                                        setServiceUnit(s.unit);
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                                      title="Редактировать"
                                    >
                                      <Edit size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteService(s.id)}
                                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                                      title="Удалить"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: ORDERS */}
                {cabinetTab === 'orders' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h5 className="text-sm font-black text-slate-800">Заявки от клиентов</h5>
                      <p className="text-[11px] text-slate-400">Управляйте полученными заявками и вовремя переводите их на нужные этапы.</p>
                    </div>

                    {myMasterOrders.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-400">
                        У вас пока нет входящих заявок.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myMasterOrders.map(order => {
                          let statusColor = "bg-slate-100 text-slate-600";
                          let statusText = "Новый";
                          if (order.status === 'accepted') { statusColor = "bg-sky-100 text-sky-800"; statusText = "Вы приняли"; }
                          if (order.status === 'in_progress') { statusColor = "bg-amber-100 text-amber-800"; statusText = "В работе"; }
                          if (order.status === 'completed') { statusColor = "bg-emerald-100 text-emerald-800"; statusText = "Выполнен"; }
                          if (order.status === 'cancelled') { statusColor = "bg-rose-100 text-rose-800"; statusText = "Отклонен"; }

                          return (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <div>
                                    <h5 className="text-xs font-black text-slate-800">Заказчик: {order.clientName}</h5>
                                    <p className="text-[9px] text-slate-400 font-medium">Создан: {new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                                    {statusText}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed mb-3">
                                  {order.description}
                                </p>

                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-3 border-b border-slate-50 pb-2.5">
                                  <div>📅 Срок: <strong className="text-slate-800 font-bold">{order.preferredDate}</strong></div>
                                  <div>💰 Бюджет: <strong className="text-emerald-600 font-bold">{order.budget ? `${order.budget} ₽` : "Не указан"}</strong></div>
                                  <div>📍 Адрес клиента: <strong className="text-slate-800 font-bold">{order.address}</strong></div>
                                  <div>📞 Телефон: <strong className="text-slate-800 font-bold">{order.clientPhone}</strong></div>
                                </div>

                                {order.budget ? (
                                  <div className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-100 p-2 rounded-xl mb-3">
                                    Комиссия за заказ (5%): {order.commission} ₽ {order.commissionPaid ? "(Оплачена)" : "(Оплачивается после завершения)"}
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-50">
                                <button
                                  onClick={() => {
                                    const linkedUser = users.find(u => u.id === order.clientId) || {
                                      id: order.clientId || `user_${Date.now()}`,
                                      name: order.clientName || "Клиент",
                                      phone: order.clientPhone || "",
                                      village: "Октябрьский",
                                      skills: [],
                                      thanksCount: 0,
                                      createdCount: 0,
                                      resolvedCount: 0,
                                      blocked: false,
                                      reportsCount: 0
                                    };
                                    onStartDirectChat(linkedUser);
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-3 rounded-xl text-[10px] font-black flex items-center gap-1.5"
                                >
                                  <MessageSquare size={11} />
                                  Чат с клиентом
                                </button>

                                <div className="flex gap-1.5">
                                  {order.status === 'new' && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-1.5 px-3 rounded-xl text-[10px]"
                                      >
                                        Принять заказ
                                      </button>
                                      <button
                                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 py-1.5 px-3 rounded-xl text-[10px] font-black"
                                      >
                                        Отклонить
                                      </button>
                                    </>
                                  )}

                                  {order.status === 'accepted' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'in_progress')}
                                      className="bg-amber-500 hover:bg-amber-600 text-white font-black py-1.5 px-3 rounded-xl text-[10px]"
                                    >
                                      Начать работу
                                    </button>
                                  )}

                                  {order.status === 'in_progress' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-1.5 px-3 rounded-xl text-[10px]"
                                    >
                                      Завершить работу
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: REVIEWS */}
                {cabinetTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h5 className="text-sm font-black text-slate-800">Отзывы клиентов</h5>
                      <p className="text-[11px] text-slate-400">Здесь собраны оценки вашей работы. Отвечайте вежливо на любые комментарии.</p>
                    </div>

                    {masterReviews.filter(r => r.masterId === currentMyMasterProfile.id).length === 0 ? (
                      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-12 text-center text-slate-400">
                        О вас пока нет отзывов.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {masterReviews
                          .filter(r => r.masterId === currentMyMasterProfile.id)
                          .map(rev => (
                            <div key={rev.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-black text-xs">
                                    {rev.isAnonymous ? "А" : (rev.clientName?.charAt(0) || "К")}
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-black text-slate-800">
                                      {rev.isAnonymous ? "Анонимный отзыв" : rev.clientName}
                                    </h6>
                                    <span className="text-[9px] text-slate-400 block font-medium">
                                      {new Date(rev.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                    {rev.rating}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 bg-white p-3 rounded-2xl border border-slate-100 leading-relaxed font-bold">
                                {rev.comment}
                              </p>

                              {/* Categorized ratings block */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/50 border border-slate-200/50 p-2.5 rounded-xl text-[10px] text-slate-500 font-bold">
                                <div>Качество: <strong className="text-slate-800">{rev.categories.quality}/5</strong></div>
                                <div>Сроки: <strong className="text-slate-800">{rev.categories.timeliness}/5</strong></div>
                                <div>Вежливость: <strong className="text-slate-800">{rev.categories.politeness}/5</strong></div>
                                <div>Цена/Качество: <strong className="text-slate-800">{rev.categories.priceQuality}/5</strong></div>
                              </div>

                              {/* Master Reply section */}
                              <div className="border-t border-slate-200/60 pt-3 space-y-2">
                                {rev.reply ? (
                                  <div className="bg-emerald-50/55 border border-emerald-100 p-3.5 rounded-2xl">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                                        💬 Ваш ответ:
                                      </span>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => {
                                            setReplyingToReviewId(rev.id);
                                            setReviewReplyText(rev.reply || '');
                                          }}
                                          className="text-[9px] font-black text-slate-500 hover:text-slate-800"
                                        >
                                          Изменить
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReviewReply(rev.id)}
                                          className="text-[9px] font-black text-rose-600 hover:text-rose-800 ml-1.5"
                                        >
                                          Удалить
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-xs text-slate-700 leading-relaxed font-bold">{rev.reply}</p>
                                    <span className="text-[8px] text-slate-400 block mt-1">
                                      Отвечено: {new Date(rev.replyCreatedAt || '').toLocaleDateString('ru-RU')}
                                    </span>
                                  </div>
                                ) : replyingToReviewId === rev.id ? (
                                  <div className="space-y-2 bg-slate-100 p-3 rounded-2xl">
                                    <label className="text-[10px] font-black text-slate-500 uppercase block">Ваш ответ:</label>
                                    <textarea
                                      value={reviewReplyText}
                                      onChange={(e) => setReviewReplyText(e.target.value)}
                                      placeholder="Спасибо за оценку! Рад был помочь..."
                                      className="w-full border border-slate-200 rounded-xl text-xs p-2.5 bg-white h-16 leading-relaxed"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        onClick={() => setReplyingToReviewId(null)}
                                        className="bg-white text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200"
                                      >
                                        Отмена
                                      </button>
                                      <button
                                        onClick={() => handleReplyToReview(rev.id)}
                                        className="bg-emerald-600 text-white text-[10px] font-black px-4 py-1.5 rounded-lg"
                                      >
                                        Опубликовать ответ
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setReplyingToReviewId(rev.id);
                                      setReviewReplyText('');
                                    }}
                                    className="text-[10px] font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                                  >
                                    💬 Написать ответ клиенту
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}

      {/* DIALOG 1: MASTER DETAIL MODAL */}
      <AnimatePresence>
        {viewingMaster && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              
              {/* Modal Banner */}
              <div className="bg-linear-to-r from-brand-dark to-brand-medium text-white p-5 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-black text-lg text-white border border-white/30 shrink-0 overflow-hidden">
                    {viewingMaster.userAvatar ? (
                      <img src={viewingMaster.userAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{viewingMaster.userName?.charAt(0) || "M"}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{viewingMaster.userName}</h3>
                    <p className="text-xs text-brand-light flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {viewingMaster.userVillage} (~ {viewingMaster.calculatedDistance} км)
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setViewingMaster(null)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Detail Tabs */}
              <div className="flex border-b border-slate-100 bg-slate-50 px-5 py-2">
                <button
                  onClick={() => setMasterDetailTab('info')}
                  className={`px-4 py-2 font-black text-xs border-b-2 transition-all ${
                    masterDetailTab === 'info' 
                      ? "border-brand-medium text-brand-dark" 
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  ℹ️ Информация
                </button>
                <button
                  onClick={() => setMasterDetailTab('portfolio')}
                  className={`px-4 py-2 font-black text-xs border-b-2 transition-all ${
                    masterDetailTab === 'portfolio' 
                      ? "border-brand-medium text-brand-dark" 
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🖼️ Примеры работ ({activeMasterPortfolio.length})
                </button>
                <button
                  onClick={() => setMasterDetailTab('reviews')}
                  className={`px-4 py-2 font-black text-xs border-b-2 transition-all ${
                    masterDetailTab === 'reviews' 
                      ? "border-brand-medium text-brand-dark" 
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  ⭐ Отзывы ({activeMasterReviews.length})
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                
                {/* Info Tab */}
                {masterDetailTab === 'info' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                      <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">О мастере</h5>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{viewingMaster.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-2">
                        <h6 className="text-[10px] font-black text-slate-400 uppercase">Опыт и образование</h6>
                        <p className="text-xs text-slate-700">💼 Опыт работы: <strong className="font-bold">{viewingMaster.experience}</strong></p>
                        <p className="text-xs text-slate-700">🎓 Квалификация: <strong className="font-bold">{viewingMaster.education || "Самоучка"}</strong></p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-2">
                        <h6 className="text-[10px] font-black text-slate-400 uppercase">Стоимость и время</h6>
                        <p className="text-xs text-slate-700">💵 Начальная цена: <strong className="text-emerald-600 font-extrabold">{viewingMaster.priceFrom} ₽</strong></p>
                        <p className="text-xs text-slate-700">📝 Комментарий: <strong className="font-bold text-slate-600">{viewingMaster.priceDescription}</strong></p>
                        <p className="text-xs text-slate-700">⏰ Режим работы: <strong className="font-bold text-slate-600">{viewingMaster.workingHours}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Portfolio Tab */}
                {masterDetailTab === 'portfolio' && (
                  <div>
                    {activeMasterPortfolio.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        Мастер пока не добавил фотографии работ в портфолио.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeMasterPortfolio.map(item => (
                          <div key={item.id} className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                            <div className="h-40 bg-slate-100">
                              <img src={item.photos[0]} alt="portfolio work" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4 space-y-1">
                              <span className="text-[9px] font-black text-brand-medium uppercase tracking-wider bg-brand-light/25 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                              <h5 className="text-xs font-black text-slate-800 mt-1">{item.title}</h5>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{item.description}</p>
                              {item.price && (
                                <p className="text-xs text-emerald-600 font-black pt-1">Цена: {item.price} ₽</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab */}
                {masterDetailTab === 'reviews' && (
                  <div className="space-y-4">
                    
                    {/* Overall Rating Breakdown */}
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                      <div className="text-center">
                        <span className="text-4xl font-black text-slate-800">{viewingMaster.rating.average}</span>
                        <div className="flex justify-center mt-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={star <= Math.round(viewingMaster.rating.average) ? "fill-amber-500 text-amber-500" : "text-slate-300"} 
                            />
                          ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">На основе {viewingMaster.rating.total} отзывов</p>
                      </div>

                      <div className="flex-1 w-full space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Качество работы:</span>
                          <span className="font-extrabold text-slate-800">5.0 / 5.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Соблюдение сроков:</span>
                          <span className="font-extrabold text-slate-800">4.9 / 5.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Вежливость и общение:</span>
                          <span className="font-extrabold text-slate-800">5.0 / 5.0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Соотношение цена/качество:</span>
                          <span className="font-extrabold text-slate-800">4.8 / 5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Review Lists */}
                    {activeMasterReviews.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        У мастера пока нет письменных отзывов от жителей. Будьте первыми!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeMasterReviews.map(rev => (
                          <div key={rev.id} className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                            <div className="flex justify-between items-center mb-1.5">
                              <h6 className="text-xs font-black text-slate-800">{rev.clientName || "Житель района"}</h6>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={10} className={s <= rev.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} />
                                ))}
                                <span className="text-[10px] font-bold text-slate-500 font-mono ml-1">{rev.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{rev.comment}</p>
                            <span className="text-[9px] text-slate-400 font-bold block mt-2">{new Date(rev.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 bg-slate-50 p-4 flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => {
                    const linkedUser = users.find(u => u.id === viewingMaster.userId) || {
                      id: viewingMaster.userId || `user_${Date.now()}`,
                      name: viewingMaster.userName || "Мастер",
                      phone: viewingMaster.userPhone || "",
                      village: viewingMaster.userVillage || "Октябрьский",
                      skills: viewingMaster.categories || [],
                      thanksCount: viewingMaster.rating?.average || 0,
                      createdCount: 0,
                      resolvedCount: 0,
                      blocked: false,
                      reportsCount: 0
                    };
                    onStartDirectChat(linkedUser);
                  }}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5"
                >
                  <MessageSquare size={13} />
                  Чат с мастером
                </button>

                {viewingMaster.userId !== currentUserId && (
                  <button
                    onClick={() => {
                      setBookingMaster(viewingMaster);
                      setOrderCategory(viewingMaster.categories[0] || 'other');
                      setViewingMaster(null);
                    }}
                    className="bg-brand-medium hover:bg-brand-dark text-white px-6 py-2 rounded-2xl text-xs font-black flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Заказать услугу
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 2: BOOKING SERVICE ORDER MODAL */}
      <AnimatePresence>
        {bookingMaster && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden"
            >
              <div className="bg-brand-dark text-white p-5 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black">Оформить заказ услуги напрямую</h4>
                  <p className="text-[11px] text-brand-light mt-0.5">Укажите требования для мастера {bookingMaster.userName}</p>
                </div>
                <button onClick={() => setBookingMaster(null)} className="text-white/80 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBookService} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Категория выполняемой работы:</label>
                  <select
                    value={orderCategory}
                    onChange={(e) => setOrderCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold text-slate-700 focus:outline-none focus:border-brand-medium"
                  >
                    {bookingMaster.categories.map(catId => {
                      let label = catId;
                      for (const c of MASTER_CATEGORIES) {
                        if (c.id === catId) { label = c.name; break; }
                        const sub = c.subcategories.find(s => s.id === catId);
                        if (sub) { label = sub.name; break; }
                      }
                      return <option key={catId} value={catId}>{label}</option>;
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Опишите вашу задачу подробно:</label>
                  <textarea
                    value={orderDesc}
                    onChange={(e) => setOrderDesc(e.target.value)}
                    placeholder="Например: Нужно расколоть около 3 кубов берёзовых дров во дворе и сложить их под навес."
                    className="w-full border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-2xl text-xs p-2.5 bg-white h-24"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Желаемая дата:</label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold text-slate-700"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Ваш бюджет (₽, 0 - договорная):</label>
                    <input
                      type="number"
                      value={orderBudget}
                      onChange={(e) => setOrderBudget(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Адрес выполнения:</label>
                    <input
                      type="text"
                      value={orderAddress}
                      onChange={(e) => setOrderAddress(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Контактный телефон:</label>
                    <input
                      type="tel"
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex gap-2 text-amber-900">
                  <Info size={16} className="shrink-0 text-amber-600" />
                  <p className="text-[9px] font-medium leading-relaxed">
                    После подтверждения заявки в системе автоматически откроется чат с мастером, где вы сможете договориться о времени, инструментах и окончательной цене.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingMaster(null)}
                    className="bg-white border border-slate-300 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-medium hover:bg-brand-dark text-white font-black px-6 py-2 rounded-xl text-xs shadow-xs"
                  >
                    🚀 Отправить заказ мастеру
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 3: REVIEW MASTER MODAL */}
      <AnimatePresence>
        {reviewingOrder && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden"
            >
              <div className="bg-amber-500 text-white p-5 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-black">Оцените качество работы мастера!</h4>
                  <p className="text-[11px] text-amber-100 mt-0.5">Ваш отзыв поможет другим жителям выбрать лучшего специалиста</p>
                </div>
                <button onClick={() => setReviewingOrder(null)} className="text-white hover:text-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="p-5 space-y-4">
                
                {/* Star rating selector */}
                <div className="text-center py-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Общая оценка</span>
                  <div className="flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setReviewRating(star);
                          setRatingQuality(star);
                          setRatingTimeliness(star);
                          setRatingPoliteness(star);
                          setRatingPriceQuality(star);
                        }}
                        className="transition-all hover:scale-110"
                      >
                        <Star 
                          size={28} 
                          className={star <= reviewRating ? "fill-amber-500 text-amber-500" : "text-slate-200"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategories rating sliders */}
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <h6 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Детализированная оценка (1-5):</h6>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Качество выполненной работы:</span>
                      <span className="text-brand-medium">{ratingQuality} из 5</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" value={ratingQuality} 
                      onChange={(e) => setRatingQuality(Number(e.target.value))}
                      className="w-full accent-brand-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Соблюдение оговоренных сроков:</span>
                      <span className="text-brand-medium">{ratingTimeliness} из 5</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" value={ratingTimeliness} 
                      onChange={(e) => setRatingTimeliness(Number(e.target.value))}
                      className="w-full accent-brand-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Вежливость и общение:</span>
                      <span className="text-brand-medium">{ratingPoliteness} из 5</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" value={ratingPoliteness} 
                      onChange={(e) => setRatingPoliteness(Number(e.target.value))}
                      className="w-full accent-brand-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Соответствие цене/качеству:</span>
                      <span className="text-brand-medium">{ratingPriceQuality} из 5</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" value={ratingPriceQuality} 
                      onChange={(e) => setRatingPriceQuality(Number(e.target.value))}
                      className="w-full accent-brand-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Ваш отзыв / комментарий:</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Напишите, что именно понравилось: качество выполнения, пунктуальность, аккуратность, вежливость."
                    className="w-full border border-slate-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none rounded-2xl text-xs p-2.5 bg-white h-20"
                    required
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewAnonymous}
                    onChange={(e) => setReviewAnonymous(e.target.checked)}
                    className="rounded text-brand-medium focus:ring-brand-medium"
                  />
                  <span>Опубликовать отзыв анонимно</span>
                </label>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewingOrder(null)}
                    className="bg-white border border-slate-300 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-black px-6 py-2 rounded-xl text-xs shadow-xs"
                  >
                    💾 Опубликовать отзыв
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 4: ADD PORTFOLIO WORK MODAL */}
      <AnimatePresence>
        {showAddPortfolioModal && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="bg-emerald-600 text-white p-5 flex justify-between items-center shrink-0">
                <div>
                  <h4 className="text-sm font-black">Добавить работу в портфолио</h4>
                  <p className="text-[11px] text-emerald-100 mt-0.5">Покажите завершенные дела другим жителям</p>
                </div>
                <button onClick={() => setShowAddPortfolioModal(false)} className="text-white hover:text-emerald-50">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddPortfolioItem} className="p-5 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Название выполненной работы:</label>
                  <input
                    type="text"
                    value={portTitle}
                    onChange={(e) => setPortTitle(e.target.value)}
                    placeholder="Например: Сруб бани 6х4 под усадку"
                    className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Описание работы (материалы, объем):</label>
                  <textarea
                    value={portDesc}
                    onChange={(e) => setPortDesc(e.target.value)}
                    placeholder="Расскажите подробнее о процессе, сроках, используемых инструментах..."
                    className="w-full border border-slate-200 focus:border-brand-medium rounded-2xl text-xs p-2.5 bg-white h-20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Категория работы:</label>
                    <select
                      value={portCategory}
                      onChange={(e) => setPortCategory(e.target.value)}
                      className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold text-slate-700"
                    >
                      <option value="">-- Выберите категорию --</option>
                      {masterCats.map(catId => {
                        let label = catId;
                        for (const c of MASTER_CATEGORIES) {
                          if (c.id === catId) { label = c.name; break; }
                          const sub = c.subcategories.find(s => s.id === catId);
                          if (sub) { label = sub.name; break; }
                        }
                        return <option key={catId} value={catId}>{label}</option>;
                      })}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Стоимость (₽, не обязательно):</label>
                    <input
                      type="number"
                      value={portPrice}
                      onChange={(e) => setPortPrice(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Место выполнения работы:</label>
                  <input
                    type="text"
                    value={portLocation}
                    onChange={(e) => setPortLocation(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white"
                  />
                </div>

                {/* Preset image selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase block">Выберите иллюстрацию к работе:</label>
                  <div className="grid grid-cols-5 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                    {PORTFOLIO_PRESET_IMAGES.map((img, index) => {
                      const isSelected = portPhotos.includes(img.url);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setPortPhotos([img.url])}
                          className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all ${
                            isSelected ? "border-emerald-500 scale-105" : "border-transparent"
                          }`}
                          title={img.name}
                        >
                          <img src={img.url} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Или введите свою ссылку на фото:</label>
                  <input
                    type="url"
                    value={portCustomPhoto}
                    onChange={(e) => {
                      setPortCustomPhoto(e.target.value);
                      if (e.target.value) setPortPhotos([e.target.value]);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-slate-200 rounded-2xl text-xs p-2.5 bg-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddPortfolioModal(false)}
                    className="bg-white border border-slate-300 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2 rounded-xl text-xs shadow-xs"
                  >
                    💾 Опубликовать работу
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
