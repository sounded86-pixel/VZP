import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Search, Compass, Share2, Star, Check, Plus, MessageSquare, 
  Map, Phone, Globe, Clock, Shield, Trash2, ArrowLeft, X, Landmark, 
  History, Eye, Hammer, Award, Leaf, Trees, GraduationCap, Mountain, BookOpen, Send, Sparkles
} from 'lucide-react';
import { UserProfile, Place, PlaceReview, PlaceCategory } from '../types';
import { 
  dbSubscribePlaces, dbCreatePlace, dbUpdatePlace, dbDeletePlace, 
  dbSubscribePlaceReviews, dbCreatePlaceReview 
} from '../firebaseSync';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { RUSSIAN_REGIONS } from '../data/regionsData';

// Federal Districts for the All-Russia map
export const FEDERAL_DISTRICTS = [
  { 
    id: 'NW', 
    name: 'Северо-Западный ФО', 
    color: 'fill-emerald-600/20 hover:fill-emerald-600/35', 
    activeColor: 'fill-emerald-600/40', 
    stroke: 'stroke-emerald-800', 
    badge: '🌟 Колыбель и Флагман', 
    regions: ['RU-ARK', 'RU-LEN', 'RU-VLG', 'RU-MUR', 'RU-PSK', 'RU-NGR', 'RU-KGD', 'RU-KO', 'RU-KR', 'RU-NEN', 'RU-LED'] 
  },
  { 
    id: 'CEN', 
    name: 'Центральный ФО', 
    color: 'fill-sky-600/20 hover:fill-sky-600/35', 
    activeColor: 'fill-sky-600/40', 
    stroke: 'stroke-sky-800', 
    badge: '⏳ Интеграция', 
    regions: ['RU-MOS', 'RU-MOW', 'RU-BEL', 'RU-BRY', 'RU-VLA', 'RU-VOR', 'RU-IVA', 'RU-KLU', 'RU-KOS', 'RU-KRS', 'RU-LIP', 'RU-ORL', 'RU-PNZ', 'RU-RYA', 'RU-SMO', 'RU-TAM', 'RU-TVE', 'RU-TUL', 'RU-YAR'] 
  },
  { 
    id: 'VOLG', 
    name: 'Приволжский ФО', 
    color: 'fill-amber-600/20 hover:fill-amber-600/35', 
    activeColor: 'fill-amber-600/40', 
    stroke: 'stroke-amber-800', 
    badge: '⏳ Интеграция', 
    regions: ['RU-TA', 'RU-BA', 'RU-UD', 'RU-ME', 'RU-MO', 'RU-CU', 'RU-PER', 'RU-KIR', 'RU-NGR', 'RU-ORE', 'RU-PEN', 'RU-SAM', 'RU-SAR', 'RU-ULY', 'RU-NIZ', 'RU-SAM', 'RU-SAR', 'RU-ULY', 'RU-PNZ'] 
  },
  { 
    id: 'SOU', 
    name: 'Южный и Кавказский ФО', 
    color: 'fill-rose-600/20 hover:fill-rose-600/35', 
    activeColor: 'fill-rose-600/40', 
    stroke: 'stroke-rose-800', 
    badge: '⏳ Интеграция', 
    regions: ['RU-ROS', 'RU-KDA', 'RU-STA', 'RU-CR', 'RU-AD', 'RU-AL', 'RU-DA', 'RU-IN', 'RU-KB', 'RU-KC', 'RU-SE', 'RU-CE', 'RU-AST', 'RU-VGG', 'RU-KL'] 
  },
  { 
    id: 'URL', 
    name: 'Уральский ФО', 
    color: 'fill-indigo-600/20 hover:fill-indigo-600/35', 
    activeColor: 'fill-indigo-600/40', 
    stroke: 'stroke-indigo-800', 
    badge: '⏳ Интеграция', 
    regions: ['RU-SVE', 'RU-TYU', 'RU-KUG', 'RU-CHE', 'RU-KHM', 'RU-YAN'] 
  },
  { 
    id: 'SIB', 
    name: 'Сибирский ФО', 
    color: 'fill-purple-600/20 hover:fill-purple-600/35', 
    activeColor: 'fill-purple-600/40', 
    stroke: 'stroke-purple-800', 
    badge: '⏳ Интеграция', 
    regions: ['RU-KYA', 'RU-ALT', 'RU-IRK', 'RU-KEM', 'RU-NVS', 'RU-OMS', 'RU-TOM', 'RU-TY', 'RU-KK', 'RU-ZAB'] 
  },
  { 
    id: 'FE', 
    name: 'Дальневосточный ФО', 
    color: 'fill-orange-600/20 hover:fill-orange-600/35', 
    activeColor: 'fill-orange-600/40', 
    stroke: 'stroke-orange-800', 
    badge: '⏳ Интеграция', 
    regions: ['RU-SA', 'RU-PRI', 'RU-KHA', 'RU-AMU', 'RU-KAM', 'RU-MAG', 'RU-SAH', 'RU-CHU', 'RU-YEV'] 
  }
];

function getRegionDistrict(regionCode: string) {
  const district = FEDERAL_DISTRICTS.find(d => d.regions.includes(regionCode));
  return district ? district.name : 'Территории РФ';
}

// Category details matching user specification
export const PLACE_CATEGORIES: { id: PlaceCategory; label: string; icon: any; emoji: string; description: string }[] = [
  { 
    id: 'historical', 
    label: 'Исторические места', 
    icon: History, 
    emoji: '🏛️', 
    description: 'Устьянские погосты, старые памятники и исторические руины' 
  },
  { 
    id: 'architecture', 
    label: 'Деревянное зодчество', 
    icon: Hammer, 
    emoji: '🏡', 
    description: 'Резные наличники, вековые крестьянские избы и старинные амбары' 
  },
  { 
    id: 'nature', 
    label: 'Природа Устьян', 
    icon: Trees, 
    emoji: '🌳', 
    description: 'Живописные берега рек Устья и Вага, чистые озера и дремучие боры' 
  },
  { 
    id: 'culture', 
    label: 'Культурные центры', 
    icon: Map, 
    emoji: '🎨', 
    description: 'Центры культуры, библиотеки, дома народного творчества и музеи' 
  },
  { 
    id: 'education', 
    label: 'Образование', 
    icon: GraduationCap, 
    emoji: '🏫', 
    description: 'Школы с историей, краеведческие кружки и лектории' 
  },
  { 
    id: 'craft', 
    label: 'Ремесленные центры', 
    icon: Hammer, 
    emoji: '🛠️', 
    description: 'Мастерские северного ткачества, резьбы по дереву и берестоплетения' 
  },
  { 
    id: 'religious', 
    label: 'Религиозные объекты', 
    icon: Landmark, 
    emoji: '⛪', 
    description: 'Старинные деревянные и каменные часовни, храмы и святые источники' 
  },
  { 
    id: 'recreation', 
    label: 'Места отдыха', 
    icon: Mountain, 
    emoji: '🎪', 
    description: 'Лыжный комплекс Малиновка, парки развлечений и ярмарочные площади' 
  },
  { 
    id: 'memorial', 
    label: 'Памятные места', 
    icon: Award, 
    emoji: '🎖️', 
    description: 'Мемориалы воинской славы, поклонные кресты и памятные знаки' 
  },
  { 
    id: 'ecotrail', 
    label: 'Эко-маршруты', 
    icon: Leaf, 
    emoji: '🌿', 
    description: 'Пешеходные экологические тропы, лесные родники и природные заказники' 
  }
];

// Sample images for fallback when resident suggests a place without image
const PRESET_PLACE_IMAGES = [
  "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800", // Museum / indoor
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=800", // Wood cottage
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800", // River / sunrise
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800", // Forest trail
  "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=800"  // Ancient architecture
];

interface PlacesScreenProps {
  currentUser: UserProfile;
  onBack: () => void;
  isOffline?: boolean;
}

export default function PlacesScreen({ currentUser, onBack, isOffline = false }: PlacesScreenProps) {
  // States
  const [places, setPlaces] = useState<Place[]>([]);
  const [viewMode, setViewMode] = useState<'ustyany' | 'russia'>('ustyany');
  const [selectedRussiaRegion, setSelectedRussiaRegion] = useState<string>('RU-ARK'); // Defaults to Arkhangelsk region
  const [russiaSearchQuery, setRussiaSearchQuery] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('all');
  
  // Curator application form states
  const [curatorName, setCuratorName] = useState(currentUser.name || '');
  const [curatorPhone, setCuratorPhone] = useState('');
  const [curatorRole, setCuratorRole] = useState('activist');
  const [curatorNotes, setCuratorNotes] = useState('');
  const [curatorSubmitted, setCuratorSubmitted] = useState(false);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'all'>('all');
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'reviews'>('info');

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Suggest Landmark Form States
  const [suggestName, setSuggestName] = useState('');
  const [suggestCategory, setSuggestCategory] = useState<PlaceCategory>('historical');
  const [suggestVillage, setSuggestVillage] = useState(currentUser.village || 'Шангалы');
  const [suggestAddress, setSuggestAddress] = useState('');
  const [suggestLat, setSuggestLat] = useState('61.1215');
  const [suggestLng, setSuggestLng] = useState('43.1850');
  const [suggestDesc, setSuggestDesc] = useState('');
  const [suggestHistory, setSuggestHistory] = useState('');
  const [suggestSchedule, setSuggestSchedule] = useState('Круглосуточно');
  const [suggestPhone, setSuggestPhone] = useState('');
  const [suggestWeb, setSuggestWeb] = useState('');
  const [suggestImageUrl, setSuggestImageUrl] = useState('');

  // Subscribe to Places
  useEffect(() => {
    const unsubscribe = dbSubscribePlaces((fetched) => {
      setPlaces(fetched);
      // Auto select first place if none selected yet
      if (fetched.length > 0 && !selectedPlace) {
        setSelectedPlace(fetched[0]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to reviews when selectedPlace changes
  useEffect(() => {
    if (!selectedPlace) {
      setReviews([]);
      return;
    }
    const unsubscribe = dbSubscribePlaceReviews(selectedPlace.id, (fetchedReviews) => {
      setReviews(fetchedReviews);
    });
    return () => unsubscribe();
  }, [selectedPlace]);

  // Handle sharing
  const handleShare = (place: Place) => {
    const text = `Посети это прекрасное место нашего региона: "${place.name}" (${place.location.village}, ${place.location.address})!`;
    navigator.clipboard.writeText(text);
    setShareToast(`Ссылка на объект "${place.name}" скопирована!`);
    setTimeout(() => setShareToast(null), 3000);
  };

  // Handle submitting review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) return;
    if (!reviewComment.trim()) return;

    const newReview: PlaceReview = {
      id: `review_${Date.now()}`,
      placeId: selectedPlace.id,
      userId: currentUser.id,
      userName: currentUser.name || 'Анонимный житель',
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString()
    };

    // Save review
    await dbCreatePlaceReview(newReview);

    // Calculate new rating
    const currentTotal = selectedPlace.rating.total || 0;
    const currentAverage = selectedPlace.rating.average || 0.0;
    const newTotal = currentTotal + 1;
    const newAverage = parseFloat(((currentAverage * currentTotal + reviewRating) / newTotal).toFixed(1));

    // Update place rating in Firestore
    await dbUpdatePlace(selectedPlace.id, {
      rating: {
        average: newAverage,
        total: newTotal
      },
      updatedAt: new Date().toISOString()
    });

    // Reset review states
    setReviewComment('');
    setReviewRating(5);
    setShowReviewModal(false);
  };

  // Handle proposing a landmark
  const handleSuggestPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName.trim() || !suggestDesc.trim()) return;

    const latVal = parseFloat(suggestLat) || 61.1215;
    const lngVal = parseFloat(suggestLng) || 43.1850;

    // Use selected or random preset image if user didn't specify one
    const placeImage = suggestImageUrl.trim() || PRESET_PLACE_IMAGES[Math.floor(Math.random() * PRESET_PLACE_IMAGES.length)];

    const proposedPlace: Place = {
      id: `place_suggested_${Date.now()}`,
      name: suggestName,
      category: suggestCategory,
      description: suggestDesc,
      history: suggestHistory.trim() ? suggestHistory : undefined,
      location: {
        village: suggestVillage,
        address: suggestAddress || 'Главная улица',
        lat: latVal,
        lng: lngVal
      },
      images: [placeImage],
      opens: suggestSchedule,
      contacts: {
        phone: suggestPhone,
        website: suggestWeb,
        schedule: suggestSchedule
      },
      rating: { average: 5.0, total: 0 },
      is_verified: false,
      suggested_by: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbCreatePlace(proposedPlace);

    // Reset form states
    setSuggestName('');
    setSuggestAddress('');
    setSuggestDesc('');
    setSuggestHistory('');
    setSuggestPhone('');
    setSuggestWeb('');
    setSuggestImageUrl('');
    setShowSuggestModal(false);

    alert('Ваше предложение успешно отправлено администрации района на модерацию! Спасибо за вклад в развитие карты Устьян!');
  };

  // Handle Admin Verification approval
  const handleVerifyPlace = async (place: Place) => {
    try {
      // 1. Update place to is_verified = true
      await dbUpdatePlace(place.id, {
        is_verified: true,
        updatedAt: new Date().toISOString()
      });

      // 2. Award +5 points "Спасибо" to creator if suggested_by exists
      if (place.suggested_by) {
        const creatorDocRef = doc(db, 'users', place.suggested_by);
        const creatorSnap = await getDoc(creatorDocRef);
        if (creatorSnap.exists()) {
          const creatorData = creatorSnap.data();
          const currentPoints = creatorData.thanksCount || 0;
          await updateDoc(creatorDocRef, {
            thanksCount: currentPoints + 5
          });
          console.log(`Awarded +5 thanks points to user ${place.suggested_by}`);
        }
      }

      // Update selected place state
      if (selectedPlace?.id === place.id) {
        setSelectedPlace({ ...place, is_verified: true });
      }

      alert(`Объект "${place.name}" успешно верифицирован! Автору начислено +5 баллов взаимопомощи «Спасибо»!`);
    } catch (err) {
      console.error('Error verifying place:', err);
      alert('Ошибка при верификации объекта.');
    }
  };

  // Handle Admin rejection
  const handleRejectPlace = async (placeId: string) => {
    if (window.confirm('Вы уверены, что хотите отклонить это предложение?')) {
      await dbDeletePlace(placeId);
      if (selectedPlace?.id === placeId) {
        setSelectedPlace(places.find(p => p.id !== placeId) || null);
      }
    }
  };

  // Filtered places list
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Admin sees everything. Regular residents see verified, plus their own unverified suggestions
      const isVisible = place.is_verified || currentUser.id === place.suggested_by || currentUser.role === 'admin';
      if (!isVisible) return false;

      // Category filter
      const matchesCategory = activeCategory === 'all' || place.category === activeCategory;

      // Search match
      const matchesSearch = searchQuery.trim() === '' || 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.location.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [places, activeCategory, searchQuery, currentUser]);

  // Group places for "Рядом с вами" list
  // Sorts by distance (or simulated proximity based on village matching)
  const nearbyPlaces = useMemo(() => {
    return places
      .filter(p => p.is_verified)
      .map(p => {
        // Calculate simulated distance in km: 0 if in the same village, or a random distance between 2 and 45 km based on alphabetical difference
        const distance = p.location.village.toLowerCase() === (currentUser.village || '').toLowerCase() 
          ? 1.2 
          : Math.max(3, Math.abs(p.location.village.charCodeAt(0) - (currentUser.village || 'Шангалы').charCodeAt(0)) % 40 + 4);
        return { ...p, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [places, currentUser]);

  // Counts of verified places in categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    places.forEach(p => {
      if (p.is_verified) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [places]);

  // Filtered Russian regions for all-Russia map view
  const filteredRussiaRegions = useMemo(() => {
    return RUSSIAN_REGIONS.filter(r => {
      // District filter
      if (selectedDistrictFilter !== 'all') {
        const dist = FEDERAL_DISTRICTS.find(d => d.id === selectedDistrictFilter);
        if (!dist || !dist.regions.includes(r.code)) {
          return false;
        }
      }
      
      // Search query
      if (russiaSearchQuery.trim() !== '') {
        const q = russiaSearchQuery.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
      }
      
      return true;
    });
  }, [russiaSearchQuery, selectedDistrictFilter]);

  const handleCuratorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curatorPhone.trim()) return;
    setCuratorSubmitted(true);
    setTimeout(() => {
      setCuratorSubmitted(false);
      setCuratorPhone('');
      setCuratorNotes('');
      alert('Ваша заявка на кураторство успешно отправлена! Администратор свяжется с вами для подтверждения.');
    }, 1200);
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12" id="places_module_root">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#1A3A2A] text-white px-4 py-4 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-white/15 transition-all text-white shrink-0"
            id="places_back_btn"
          >
            <ArrowLeft size={22} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
              🗺️ Культурный навигатор
            </h1>
            <p className="text-[10px] sm:text-xs text-emerald-100/90 font-medium font-mono">
              Всероссийская карта наследия • {places.filter(p => p.is_verified).length} объектов флагмана
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSuggestModal(true)}
          className="flex items-center gap-1 bg-[#F59E0B] hover:bg-amber-600 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl shadow-md transition-all cursor-pointer"
          id="suggest_place_trigger"
        >
          <Plus size={16} className="stroke-[3]" />
          <span className="hidden sm:inline">Предложить место</span>
          <span className="sm:hidden">Создать</span>
        </button>
      </header>

      {/* SHARE TOAST */}
      <AnimatePresence>
        {shareToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white font-bold text-xs px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700"
          >
            <Check size={16} className="text-green-400 stroke-[3]" />
            <span>{shareToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS SWITCHER */}
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setViewMode('ustyany')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'ustyany'
                ? 'bg-[#1A3A2A] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            ⭐ Флагман: Устьянский район ({places.filter(p => p.is_verified).length} мест)
          </button>
          <button
            onClick={() => setViewMode('russia')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'russia'
                ? 'bg-[#1A3A2A] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
            }`}
          >
            🇷🇺 Всероссийская карта (89 регионов РФ)
          </button>
        </div>
      </div>

      {viewMode === 'ustyany' ? (
        <div className="max-w-7xl mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FILTERS, SEARCH AND LISTS (5 COLS) */}
        <section className="lg:col-span-5 space-y-4">
          
          {/* SEARCH BAR */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по названию или селу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-slate-900 placeholder-slate-500 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3A2A]/20 border border-slate-200 font-medium"
              />
              <Search size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* HORIZONTAL CATEGORIES BAR */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Категории объектов
            </h3>
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-slate-300">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeCategory === 'all' 
                    ? 'bg-[#1A3A2A] text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                🌍 Все вместе
              </button>
              {PLACE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === cat.id 
                      ? 'bg-[#1A3A2A] text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className="bg-white/30 text-slate-700 rounded-md px-1.5 text-[10px] font-mono">
                    {categoryCounts[cat.id] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* LIST OF FILTERED SITES */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-base text-slate-800">
                {activeCategory === 'all' ? 'Все достопримечательности' : PLACE_CATEGORIES.find(c => c.id === activeCategory)?.label}
              </h2>
              <span className="bg-[#1A3A2A]/10 text-[#1A3A2A] font-bold text-xs px-2.5 py-0.5 rounded-full font-mono">
                {filteredPlaces.length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredPlaces.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Compass size={40} className="mx-auto mb-2 opacity-40 animate-pulse" />
                  <p className="text-sm font-semibold">Объектов не найдено</p>
                  <p className="text-xs">Попробуйте изменить условия поиска</p>
                </div>
              ) : (
                filteredPlaces.map(place => {
                  const isSelected = selectedPlace?.id === place.id;
                  const catData = PLACE_CATEGORIES.find(c => c.id === place.category);
                  
                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`group p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 relative ${
                        isSelected 
                          ? 'bg-[#1A3A2A]/5 border-[#1A3A2A] shadow-md' 
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Image preview */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                        <img 
                          src={place.images[0]} 
                          alt={place.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/65 text-white font-mono text-[9px] px-1 py-0.2 rounded-md flex items-center gap-0.5">
                          ⭐ {place.rating.average || '0'}
                        </span>
                      </div>

                      {/* Content preview */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
                            {catData?.emoji} {catData?.label}
                          </span>
                          {!place.is_verified && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                              <Shield size={10} /> Модерация
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-[#1A3A2A] transition-all line-clamp-2">
                          {place.name}
                        </h4>

                        <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{place.location.village}, {place.location.address}</span>
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* NEARBY SECTION */}
          {nearbyPlaces.length > 0 && (
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
              <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Compass size={14} className="text-[#1A3A2A]" />
                Ближайшие объекты от вас ({currentUser.village || 'Шангалы'})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {nearbyPlaces.map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlace(p)}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all cursor-pointer text-left space-y-1"
                  >
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1 hover:text-[#1A3A2A]">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {p.location.village} • <span className="font-mono text-[#1A3A2A] font-bold">~{p.distance} км</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>

        {/* RIGHT COLUMN: DETAILED INTERACTIVE LANDMARK VIEW (7 COLS) */}
        <section className="lg:col-span-7">
          {selectedPlace ? (
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 space-y-4">
              
              {/* LANDMARK HERO IMAGE HEADER */}
              <div className="h-64 sm:h-80 bg-slate-100 relative">
                <img 
                  src={selectedPlace.images[0]} 
                  alt={selectedPlace.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual fade layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 flex flex-col justify-between p-4 sm:p-6 text-white">
                  
                  {/* Category badging */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-white/20 backdrop-blur-md text-white font-black text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                      {PLACE_CATEGORIES.find(c => c.id === selectedPlace.category)?.emoji} {PLACE_CATEGORIES.find(c => c.id === selectedPlace.category)?.label}
                    </span>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleShare(selectedPlace)}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/35 text-white border border-white/20 cursor-pointer active:scale-95 transition-all"
                        title="Поделиться"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Name and basic location details */}
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-none text-white drop-shadow-md">
                      {selectedPlace.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-100">
                      <p className="flex items-center gap-1 bg-[#1A3A2A]/70 px-2.5 py-1 rounded-full backdrop-blur-sm shadow">
                        <MapPin size={13} className="text-yellow-400" />
                        <span>{selectedPlace.location.village}, {selectedPlace.location.address}</span>
                      </p>
                      
                      <p className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span>⭐ {selectedPlace.rating.average || '0'} ({selectedPlace.rating.total || 0} отзывов)</span>
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* ACTION LINKS OR ADMINISTRATIVE BUTTONS */}
              {isAdmin && !selectedPlace.is_verified && (
                <div className="bg-amber-50 border-y border-amber-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-amber-600 animate-pulse" />
                    <p className="text-xs text-amber-800 font-bold">
                      Объект предложен жителем. Одобрите для начисления ему +5 баллов.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyPlace(selectedPlace)}
                      className="bg-[#1A3A2A] hover:bg-emerald-900 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow active:scale-95"
                    >
                      ✅ Одобрить и дать +5 баллов
                    </button>
                    <button
                      onClick={() => handleRejectPlace(selectedPlace.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer shadow active:scale-95"
                    >
                      ❌ Отклонить
                    </button>
                  </div>
                </div>
              )}

              {/* TABS SELECTOR */}
              <div className="px-4 border-b border-slate-200 flex gap-4">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`pb-3 text-xs sm:text-sm font-extrabold tracking-wide border-b-2 transition-all cursor-pointer ${
                    activeTab === 'info' 
                      ? 'border-[#1A3A2A] text-[#1A3A2A]' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📄 ОПИСАНИЕ ОБЪЕКТА
                </button>
                {selectedPlace.history && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 text-xs sm:text-sm font-extrabold tracking-wide border-b-2 transition-all cursor-pointer ${
                      activeTab === 'history' 
                        ? 'border-[#1A3A2A] text-[#1A3A2A]' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📜 ИСТОРИЯ
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-xs sm:text-sm font-extrabold tracking-wide border-b-2 transition-all flex items-center gap-1 cursor-pointer ${
                    activeTab === 'reviews' 
                      ? 'border-[#1A3A2A] text-[#1A3A2A]' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ⭐ ОТЗЫВЫ ({reviews.length})
                </button>
              </div>

              {/* TABBED CONTENT */}
              <div className="px-4 py-2 min-h-40">
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    {/* General Text description */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        Об объекте
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        {selectedPlace.description}
                      </p>
                    </div>

                    {/* Meta info & contacts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          Контакты и доступность
                        </h4>
                        <div className="space-y-1.5 text-xs text-slate-600 font-bold">
                          <p className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            <span>Время работы: {selectedPlace.opens || 'Круглосуточно'}</span>
                          </p>
                          {selectedPlace.contacts?.phone && (
                            <p className="flex items-center gap-2">
                              <Phone size={14} className="text-slate-400" />
                              <span>Телефон: <a href={`tel:${selectedPlace.contacts.phone}`} className="hover:underline text-[#1A3A2A]">{selectedPlace.contacts.phone}</a></span>
                            </p>
                          )}
                          {selectedPlace.contacts?.website && (
                            <p className="flex items-center gap-2">
                              <Globe size={14} className="text-slate-400" />
                              <span>Сайт: <a href={selectedPlace.contacts.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#1A3A2A]">{selectedPlace.contacts.website}</a></span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Direction Routing */}
                      <div className="flex flex-col justify-end">
                        <a
                          href={`https://yandex.ru/maps/?rtext=~${selectedPlace.location.lat},${selectedPlace.location.lng}&rtt=auto`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#1A3A2A] hover:bg-emerald-900 text-white font-extrabold text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                        >
                          🗺️ ПОСТРОИТЬ МАРШРУТ В ЯНДЕКС
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      Летопись и Исторические факты
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {selectedPlace.history}
                    </p>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        Отзывы жителей Устьян
                      </h3>
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="bg-slate-100 hover:bg-[#1A3A2A]/5 text-[#1A3A2A] font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-[#1A3A2A]/10"
                      >
                        <MessageSquare size={13} />
                        Оставить отзыв
                      </button>
                    </div>

                    {/* Review List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {reviews.length === 0 ? (
                        <div className="py-10 text-center text-slate-400">
                          <p className="text-sm font-semibold">Пока никто не оставил отзыв</p>
                          <p className="text-xs">Будьте первым, кто поделится своим впечатлением!</p>
                        </div>
                      ) : (
                        reviews.map(review => (
                          <div key={review.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-slate-800">
                                {review.userName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            
                            {/* Stars */}
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={12} 
                                  className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} 
                                />
                              ))}
                            </div>

                            <p className="text-xs sm:text-sm text-slate-600 font-medium">
                              {review.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* INTERACTIVE YANDEX MAP INTEGRATION */}
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#1A3A2A]" />
                    Интерактивная карта Яндекс
                  </h3>
                  
                  <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative bg-slate-100">
                    {!isOffline ? (
                      <iframe 
                        title={`Yandex Map of ${selectedPlace.name}`}
                        src={`https://yandex.ru/map-widget/v1/?ll=${selectedPlace.location.lng},${selectedPlace.location.lat}&z=13&pt=${selectedPlace.location.lng},${selectedPlace.location.lat},pm2rdm&lang=ru_RU`} 
                        width="100%" 
                        height="100%" 
                        frameBorder="0"
                        allowFullScreen={true}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                        <Map size={48} className="stroke-[1.5] animate-pulse" />
                        <h4 className="font-extrabold text-sm text-slate-800 mt-2">Карта недоступна оффлайн</h4>
                        <p className="text-xs max-w-xs mt-1">Подключите интернет, чтобы загрузить настоящую спутниковую карту.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
              <Compass size={48} className="mx-auto mb-3 text-slate-300 animate-spin" />
              <h3 className="font-extrabold text-sm text-slate-800">Выберите объект на карте</h3>
              <p className="text-xs">Нажмите на любой объект слева, чтобы ознакомиться с его деталями.</p>
            </div>
          )}
        </section>

      </div>
      ) : (
        /* ALL-RUSSIA MAP COMPONENT */
        <div className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8" id="russia_map_view_root">
          
          {/* LEFT PANEL: INTERACTIVE MAP & DISTRICT CONTROLS (7 COLS) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* DISTRICT TABS / FILTER RAIL */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-black text-[#1A3A2A] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500 animate-pulse" />
                Интерактивная карта по федеральным округам РФ
              </h3>
              
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedDistrictFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedDistrictFilter === 'all'
                      ? 'bg-[#1A3A2A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Все округа
                </button>
                {FEDERAL_DISTRICTS.map((dist) => (
                  <button
                    key={dist.id}
                    onClick={() => {
                      setSelectedDistrictFilter(dist.id);
                      if (dist.id === 'NW') {
                        setSelectedRussiaRegion('RU-ARK');
                      } else {
                        setSelectedRussiaRegion(dist.regions[0]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      selectedDistrictFilter === dist.id
                        ? 'bg-[#1A3A2A] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{dist.name.replace(' ФО', '')}</span>
                    {dist.id === 'NW' && <span className="text-[10px] bg-amber-400 text-slate-900 px-1 py-0.5 rounded">Флагман</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* INTERACTIVE VECTOR SVG MAP */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Нажмите на любой регион или сектор карты
                </p>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Ecosystem Live
                </span>
              </div>
              
              <div className="w-full">
                <svg viewBox="0 0 800 320" className="w-full h-auto drop-shadow-md select-none rounded-2xl bg-slate-900 p-4 border border-slate-800" id="russia_interactive_svg">
                  {/* Grid accents */}
                  <g className="stroke-slate-800/40 stroke-[0.5]" fill="none">
                    <line x1="100" y1="0" x2="100" y2="320" />
                    <line x1="200" y1="0" x2="200" y2="320" />
                    <line x1="300" y1="0" x2="300" y2="320" />
                    <line x1="400" y1="0" x2="400" y2="320" />
                    <line x1="500" y1="0" x2="500" y2="320" />
                    <line x1="600" y1="0" x2="600" y2="320" />
                    <line x1="700" y1="0" x2="700" y2="320" />
                    <line x1="0" y1="80" x2="800" y2="80" />
                    <line x1="0" y1="160" x2="800" y2="160" />
                    <line x1="0" y1="240" x2="800" y2="240" />
                  </g>

                  {/* Paths for districts */}
                  {FEDERAL_DISTRICTS.map((dist) => {
                    const isSelected = selectedDistrictFilter === dist.id;
                    let pathD = '';
                    let labelCoords = { x: 0, y: 0 };
                    
                    if (dist.id === 'NW') {
                      pathD = 'M 60,30 L 260,20 L 300,100 L 220,120 L 150,110 L 60,50 Z';
                      labelCoords = { x: 170, y: 65 };
                    } else if (dist.id === 'CEN') {
                      pathD = 'M 60,50 L 150,110 L 220,120 L 180,190 L 80,180 Z';
                      labelCoords = { x: 120, y: 140 };
                    } else if (dist.id === 'SOU') {
                      pathD = 'M 80,180 L 180,190 L 190,270 L 110,270 L 60,240 Z';
                      labelCoords = { x: 120, y: 230 };
                    } else if (dist.id === 'VOLG') {
                      pathD = 'M 220,120 L 300,100 L 350,130 L 310,220 L 180,190 Z';
                      labelCoords = { x: 260, y: 160 };
                    } else if (dist.id === 'URL') {
                      pathD = 'M 300,100 L 390,90 L 410,200 L 350,220 L 300,100 Z';
                      labelCoords = { x: 345, y: 150 };
                    } else if (dist.id === 'SIB') {
                      pathD = 'M 390,90 L 590,80 L 550,210 L 410,200 Z';
                      labelCoords = { x: 480, y: 145 };
                    } else if (dist.id === 'FE') {
                      pathD = 'M 590,80 L 770,60 L 740,210 L 550,210 Z';
                      labelCoords = { x: 670, y: 135 };
                    }

                    const hasFlagship = dist.id === 'NW';

                    return (
                      <g 
                        key={dist.id} 
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => {
                          setSelectedDistrictFilter(dist.id);
                          if (dist.id === 'NW') {
                            setSelectedRussiaRegion('RU-ARK');
                          } else {
                            setSelectedRussiaRegion(dist.regions[0]);
                          }
                        }}
                      >
                        <path
                          d={pathD}
                          className={`${
                            isSelected 
                              ? 'fill-emerald-500/50 stroke-emerald-400 stroke-2' 
                              : 'fill-slate-800/70 hover:fill-slate-700/85 stroke-slate-700 hover:stroke-slate-500 stroke-[1.5]'
                          } transition-all duration-300`}
                        />
                        
                        {/* Flagship Star decoration */}
                        {hasFlagship && (
                          <g className="animate-pulse">
                            {/* Pulsing ring */}
                            <circle cx="180" cy="55" r="8" className="fill-amber-400/30 stroke-amber-400 stroke-1" />
                            <circle cx="180" cy="55" r="3" className="fill-amber-400" />
                            <text x="192" y="59" className="fill-amber-400 text-[10px] font-black tracking-tight font-sans">
                              🏆 Устьяны
                            </text>
                          </g>
                        )}

                        <text
                          x={labelCoords.x}
                          y={labelCoords.y}
                          className={`text-[9px] font-bold tracking-tight select-none pointer-events-none ${
                            isSelected ? 'fill-white' : 'fill-slate-400'
                          }`}
                          textAnchor="middle"
                        >
                          {dist.name.replace(' ФО', '')}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* REGION SELECTOR GRID */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Список субъектов РФ ({filteredRussiaRegions.length})
                </h4>
                
                {/* Search in regions */}
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Быстрый поиск региона..."
                    value={russiaSearchQuery}
                    onChange={(e) => setRussiaSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1A3A2A]/40"
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2">
                {filteredRussiaRegions.map((region) => {
                  const isSelected = selectedRussiaRegion === region.code;
                  const isFlagship = region.code === 'RU-ARK';
                  
                  return (
                    <button
                      key={region.code}
                      onClick={() => setSelectedRussiaRegion(region.code)}
                      className={`text-left p-2.5 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A3A2A] border-[#1A3A2A] text-white shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{region.name}</span>
                      {isFlagship ? (
                        <span className="shrink-0 bg-amber-400 text-slate-900 text-[8px] px-1 rounded font-black animate-pulse">
                          🏆 Флагман
                        </span>
                      ) : (
                        <span className="shrink-0 text-[8px] opacity-40 font-mono">
                          {region.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </section>

          {/* RIGHT PANEL: SELECTED REGION & INTERACTIVE ACTIONS (5 COLS) */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* REGION STATUS CARD */}
            {(() => {
              const region = RUSSIAN_REGIONS.find(r => r.code === selectedRussiaRegion) || RUSSIAN_REGIONS[0];
              const isFlagship = region.code === 'RU-ARK';
              
              return (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/85 relative overflow-hidden space-y-5">
                  {/* Decorative glowing background for Flagship */}
                  {isFlagship && (
                    <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl animate-pulse" />
                  )}

                  <div className="space-y-1">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      isFlagship 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isFlagship ? '🏆 Флагманский Пилот' : '⏳ В процессе интеграции'}
                    </span>
                    <h3 className="text-xl font-black text-[#1A3A2A] tracking-tight mt-2">
                      {region.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">
                      Округ: {getRegionDistrict(region.code)}
                    </p>
                  </div>

                  {/* Statistics / Status */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Статус подключения
                      </span>
                      <span className={`text-xs font-black flex items-center gap-1.5 mt-0.5 ${isFlagship ? 'text-green-600' : 'text-slate-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${isFlagship ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                        {isFlagship ? 'Запущен • Активен' : 'Ожидание активации'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Оцифровано мест
                      </span>
                      <span className="text-xs font-black text-[#1A3A2A] block mt-0.5">
                        {isFlagship ? `${places.filter(p => p.is_verified).length} объектов` : '0 мест (сбор заявок)'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Описание регионального проекта
                    </h4>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      {isFlagship 
                        ? 'Устьянский район Архангельской области является флагманской территорией проекта. Здесь собраны вековые деревянные часовни, вековые эко-тропы у рек, музеи крестьянского быта и фольклора. Местные гиды активно наполняют карту и ведут общественные летописи.' 
                        : `Мы собираем инициативную группу жителей из региона ${region.name} для оцифровки исторического наследия, ремесел и эко-туризма на общероссийском "Культурном навигаторе".`
                      }
                    </p>
                  </div>

                  {/* Call to action */}
                  {isFlagship ? (
                    <button
                      onClick={() => setViewMode('ustyany')}
                      className="w-full bg-[#1A3A2A] hover:bg-emerald-800 text-white font-extrabold text-sm py-4 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                    >
                      <Compass size={18} className="animate-spin-slow" />
                      <span>ОТКРЫТЬ КАРТУ УСТЬЯН (ФЛАГМАН)</span>
                    </button>
                  ) : (
                    /* Dynamic Curator Application Form */
                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-[#1A3A2A] uppercase tracking-widest flex items-center gap-1">
                          <Send size={13} className="text-[#1A3A2A]" />
                          Стать куратором в регионе
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Заполните анкету, чтобы запустить "Культурный навигатор" в вашем районе!
                        </p>
                      </div>

                      {curatorSubmitted ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2"
                        >
                          <Check size={32} className="mx-auto text-emerald-500 stroke-[3]" />
                          <h5 className="font-extrabold text-sm text-emerald-800">Заявка отправлена!</h5>
                          <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                            Спасибо, {curatorName || 'активист'}! Ваша кандидатура для региона <strong>{region.name}</strong> успешно зарегистрирована. Наш методист свяжется с вами по телефону.
                          </p>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleCuratorSubmit} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700">Ваше ФИО</label>
                            <input
                              type="text"
                              required
                              placeholder="Иван Петров"
                              value={curatorName}
                              onChange={(e) => setCuratorName(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1A3A2A]/40"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700">Номер телефона *</label>
                            <input
                              type="tel"
                              required
                              placeholder="+7 (999) 000-00-00"
                              value={curatorPhone}
                              onChange={(e) => setCuratorPhone(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1A3A2A]/40"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700">Какова ваша роль?</label>
                            <select
                              value={curatorRole}
                              onChange={(e) => setCuratorRole(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1A3A2A]/40 bg-white"
                            >
                              <option value="activist">Местный активист / Житель</option>
                              <option value="historian">Краевед / Историк</option>
                              <option value="artisan">Ремесленник / Мастер</option>
                              <option value="museum">Сотрудник музея / Библиотекарь</option>
                              <option value="tourism">Гид / Представитель турбизнеса</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700">Комментарий / пожелание (необязательно)</label>
                            <textarea
                              rows={2}
                              placeholder="Расскажите в двух словах о районе..."
                              value={curatorNotes}
                              onChange={(e) => setCuratorNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1A3A2A]/40 resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#1A3A2A] hover:bg-emerald-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Send size={13} />
                            Подать заявку на кураторство
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              );
            })()}
            
          </section>

        </div>
      )}

      {/* MODAL: SUGGEST A LANDMARK */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-[#1A3A2A] flex items-center gap-1.5">
                🗺️ Предложить место
              </h3>
              <button 
                onClick={() => setShowSuggestModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSuggestPlace} className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Название достопримечательности *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Родник Бестужева, Храм..."
                  value={suggestName}
                  onChange={(e) => setSuggestName(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2.5 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A3A2A]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Категория *</label>
                  <select
                    value={suggestCategory}
                    onChange={(e) => setSuggestCategory(e.target.value as PlaceCategory)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2.5 text-sm border border-slate-200 focus:outline-none"
                  >
                    {PLACE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Село / Населенный пункт *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Шангалы, Березник"
                    value={suggestVillage}
                    onChange={(e) => setSuggestVillage(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2.5 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A3A2A]/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Точный адрес или описание проезда *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: ул. Ленина, у школы, или 2 км на северо-восток..."
                  value={suggestAddress}
                  onChange={(e) => setSuggestAddress(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2.5 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A3A2A]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Широта (Latitude)</label>
                  <input
                    type="text"
                    placeholder="61.1215"
                    value={suggestLat}
                    onChange={(e) => setSuggestLat(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2.5 text-sm border border-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Долгота (Longitude)</label>
                  <input
                    type="text"
                    placeholder="43.1850"
                    value={suggestLng}
                    onChange={(e) => setSuggestLng(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2.5 text-sm border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Основное описание места *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Опишите, чем примечательно это место, как добраться, что можно увидеть..."
                  value={suggestDesc}
                  onChange={(e) => setSuggestDesc(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A3A2A]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Историческая справка (необязательно)</label>
                <textarea
                  rows={2}
                  placeholder="Исторические легенды, год создания, связанные знаменитые личности..."
                  value={suggestHistory}
                  onChange={(e) => setSuggestHistory(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2 text-sm border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Расписание / Режим работы</label>
                  <input
                    type="text"
                    placeholder="Круглосуточно, или Вт-Сб 10:00-18:00"
                    value={suggestSchedule}
                    onChange={(e) => setSuggestSchedule(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2.5 text-sm border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ссылка на фотографию (URL)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={suggestImageUrl}
                    onChange={(e) => setSuggestImageUrl(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2.5 text-sm border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A3A2A] hover:bg-emerald-900 text-white font-black text-sm py-3.5 rounded-2xl transition-all cursor-pointer shadow-md active:scale-98"
              >
                Отправить предложение на модерацию
              </button>

            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: SUBMIT REVIEW */}
      {showReviewModal && selectedPlace && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-[#1A3A2A]">
                📝 Оценить место: {selectedPlace.name}
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              
              {/* Rating stars picker */}
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-bold text-slate-700 block">Ваша оценка объекта</label>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setReviewRating(stars)}
                      className="p-1 hover:scale-110 active:scale-95 transition-all text-amber-400 cursor-pointer"
                    >
                      <Star 
                        size={28} 
                        className={stars <= reviewRating ? 'fill-amber-400 stroke-amber-400' : 'text-slate-300 stroke-[1.5]'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Текст вашего отзыва</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Поделитесь вашими личными впечатлениями, посоветуйте, когда лучше приезжать..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl px-3 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1A3A2A]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A3A2A] hover:bg-emerald-900 text-white font-black text-sm py-3 rounded-xl transition-all cursor-pointer shadow active:scale-98"
              >
                Опубликовать отзыв
              </button>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
