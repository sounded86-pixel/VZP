import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, MapPin, Calendar, Clock, DollarSign, Plus, Trash2, Edit2, User, 
  Search, Star, Check, Phone, ArrowRight, AlertTriangle, MessageSquare, 
  ThumbsUp, Navigation, X, Shield, RefreshCw
} from 'lucide-react';
import { 
  UserProfile, BusRoute, RideOffer, RideRequest, RoadReport, RideReview, USTYANY_VILLAGES 
} from '../types';

interface TransportScreenProps {
  currentUser: UserProfile;
  routes: BusRoute[];
  rideOffers: RideOffer[];
  rideRequests: RideRequest[];
  roadReports: RoadReport[];
  rideReviews: RideReview[];
  users: UserProfile[];
  isOffline: boolean;
  onBack: () => void;
  dbCreateRouteHook: (route: BusRoute) => void;
  dbUpdateRouteHook: (routeId: string, updates: Partial<BusRoute>) => void;
  dbDeleteRouteHook: (routeId: string) => void;
  dbCreateRideOfferHook: (offer: RideOffer) => void;
  dbUpdateRideOfferHook: (offerId: string, updates: Partial<RideOffer>) => void;
  dbDeleteRideOfferHook: (offerId: string) => void;
  dbCreateRideRequestHook: (request: RideRequest) => void;
  dbUpdateRideRequestHook: (requestId: string, updates: Partial<RideRequest>) => void;
  dbDeleteRideRequestHook: (requestId: string) => void;
  dbCreateRoadReportHook: (report: RoadReport) => void;
  dbCreateRideReviewHook: (review: RideReview) => void;
}

type ActiveTab = 'rides' | 'roads';
type RideSubTab = 'offers' | 'requests';

const WEEKDAYS = [
  { key: 'monday', label: 'Пн' },
  { key: 'tuesday', label: 'Вт' },
  { key: 'wednesday', label: 'Ср' },
  { key: 'thursday', label: 'Чт' },
  { key: 'friday', label: 'Пт' },
  { key: 'saturday', label: 'Сб' },
  { key: 'sunday', label: 'Вс' }
];

const WEEKDAY_RU: { [key: string]: string } = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье'
};

// Safe dialog helpers to prevent crashes in sandboxed iframe environments
const safeAlert = (msg: string) => {
  try {
    alert(msg);
  } catch (e) {
    console.warn("Alert blocked in sandbox environment:", msg);
  }
};

const safeConfirm = (msg: string): boolean => {
  try {
    return confirm(msg);
  } catch (e) {
    console.warn("Confirm blocked in sandbox environment, auto-approving:", msg);
    return true;
  }
};

export default function TransportScreen({
  currentUser,
  routes,
  rideOffers,
  rideRequests,
  roadReports,
  rideReviews,
  users,
  isOffline,
  onBack,
  dbCreateRouteHook,
  dbUpdateRouteHook,
  dbDeleteRouteHook,
  dbCreateRideOfferHook,
  dbUpdateRideOfferHook,
  dbDeleteRideOfferHook,
  dbCreateRideRequestHook,
  dbUpdateRideRequestHook,
  dbDeleteRideRequestHook,
  dbCreateRoadReportHook,
  dbCreateRideReviewHook
}: TransportScreenProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rides');
  const [rideSubTab, setRideSubTab] = useState<RideSubTab>('offers');

  // Filter States for Bus Schedule
  const [scheduleWeekday, setScheduleWeekday] = useState<string>(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayIndex = new Date().getDay();
    return days[currentDayIndex] || 'monday';
  });
  const [scheduleFrom, setScheduleFrom] = useState('');
  const [scheduleTo, setScheduleTo] = useState('');

  // Filter States for Ride Sharing
  const [rideFrom, setRideFrom] = useState('');
  const [rideTo, setRideTo] = useState('');
  const [rideDate, setRideDate] = useState('');

  // Modals visibility
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<RideOffer | null>(null);

  const [showRequestModal, setShowRequestModal] = useState(false);

  const [showRoadReportModal, setShowRoadReportModal] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetOfferId, setReviewTargetOfferId] = useState<string>('');
  const [reviewTargetDriverId, setReviewTargetDriverId] = useState<string>('');

  // Forms states
  const [routeForm, setRouteForm] = useState({
    routeNumber: '',
    departureVillage: 'Октябрьский',
    arrivalVillage: 'Березник',
    provider: '',
    price: 100,
    schedule: {
      monday: [] as string[],
      tuesday: [] as string[],
      wednesday: [] as string[],
      thursday: [] as string[],
      friday: [] as string[],
      saturday: [] as string[],
      sunday: [] as string[]
    }
  });

  const [offerForm, setOfferForm] = useState({
    departureVillage: 'Октябрьский',
    arrivalVillage: 'Березник',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '10:00',
    availableSeats: 3,
    price: 150,
    comment: '',
    contactPhone: currentUser.phone || '+7 '
  });

  const [requestForm, setRequestForm] = useState({
    departureVillage: 'Березник',
    arrivalVillage: 'Октябрьский',
    departureDate: new Date().toISOString().split('T')[0],
    passengers: 1,
    comment: '',
    contactPhone: currentUser.phone || '+7 '
  });

  const [roadReportForm, setRoadReportForm] = useState({
    segmentStart: 'Октябрьский',
    segmentEnd: 'Шангалы',
    condition: 'good' as 'good' | 'fair' | 'poor' | 'impassable',
    comment: ''
  });

  const [reviewForm, setReviewForm] = useState({
    punctuality: 5,
    drivingSafety: 5,
    carCleanliness: 5,
    politeness: 5,
    comment: '',
    isAnonymous: false
  });

  // Check if admin
  const isAdmin = currentUser.role === 'main_admin' || currentUser.role === 'village_admin' || currentUser.id === 'user_admin';

  // Computed/filtered lists
  const filteredRoutes = useMemo(() => {
    return routes.filter(r => {
      if (!r.isActive) return false;
      const matchesFrom = !scheduleFrom || r.departureVillage.toLowerCase().includes(scheduleFrom.toLowerCase());
      const matchesTo = !scheduleTo || r.arrivalVillage.toLowerCase().includes(scheduleTo.toLowerCase());
      // Ensure there is some schedule on this day
      const daySchedule = (r.schedule as any)[scheduleWeekday];
      const hasTimes = daySchedule && daySchedule.length > 0;
      return matchesFrom && matchesTo && hasTimes;
    });
  }, [routes, scheduleWeekday, scheduleFrom, scheduleTo]);

  const filteredRideOffers = useMemo(() => {
    return rideOffers.filter(o => {
      const matchesFrom = !rideFrom || o.departureVillage.toLowerCase().includes(rideFrom.toLowerCase());
      const matchesTo = !rideTo || o.arrivalVillage.toLowerCase().includes(rideTo.toLowerCase());
      const matchesDate = !rideDate || o.departureDate === rideDate;
      return matchesFrom && matchesTo && matchesDate;
    });
  }, [rideOffers, rideFrom, rideTo, rideDate]);

  const filteredRideRequests = useMemo(() => {
    return rideRequests.filter(r => {
      const matchesFrom = !rideFrom || r.departureVillage.toLowerCase().includes(rideFrom.toLowerCase());
      const matchesTo = !rideTo || r.arrivalVillage.toLowerCase().includes(rideTo.toLowerCase());
      const matchesDate = !rideDate || r.departureDate === rideDate;
      return matchesFrom && matchesTo && matchesDate;
    });
  }, [rideRequests, rideFrom, rideTo, rideDate]);

  // Handler functions for routes (Admin)
  const handleOpenAddRoute = () => {
    setSelectedRoute(null);
    setRouteForm({
      routeNumber: '',
      departureVillage: 'Октябрьский',
      arrivalVillage: 'Березник',
      provider: 'ООО УстьяныАвто',
      price: 150,
      schedule: {
        monday: ['08:00', '17:00'],
        tuesday: ['08:00', '17:00'],
        wednesday: ['08:00', '17:00'],
        thursday: ['08:00', '17:00'],
        friday: ['08:00', '17:00'],
        saturday: ['09:00'],
        sunday: ['15:00']
      }
    });
    setShowRouteModal(true);
  };

  const handleOpenEditRoute = (route: BusRoute) => {
    setSelectedRoute(route);
    setRouteForm({
      routeNumber: route.routeNumber,
      departureVillage: route.departureVillage,
      arrivalVillage: route.arrivalVillage,
      provider: route.provider,
      price: route.price,
      schedule: { ...route.schedule }
    });
    setShowRouteModal(true);
  };

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.routeNumber || !routeForm.departureVillage || !routeForm.arrivalVillage) {
      safeAlert('Пожалуйста, заполните обязательные поля');
      return;
    }

    if (selectedRoute) {
      dbUpdateRouteHook(selectedRoute.id, {
        routeNumber: routeForm.routeNumber,
        departureVillage: routeForm.departureVillage,
        arrivalVillage: routeForm.arrivalVillage,
        provider: routeForm.provider,
        price: Number(routeForm.price),
        schedule: routeForm.schedule
      });
    } else {
      const newRoute: BusRoute = {
        id: `route_${Date.now()}`,
        routeNumber: routeForm.routeNumber,
        departureVillage: routeForm.departureVillage,
        arrivalVillage: routeForm.arrivalVillage,
        provider: routeForm.provider,
        price: Number(routeForm.price),
        schedule: routeForm.schedule,
        isActive: true
      };
      dbCreateRouteHook(newRoute);
    }
    setShowRouteModal(false);
  };

  const handleDeleteRoute = (routeId: string) => {
    if (safeConfirm('Вы уверены, что хотите удалить этот рейс?')) {
      dbDeleteRouteHook(routeId);
    }
  };

  // Handler functions for ride offers
  const handleCreateRideOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.departureVillage || !offerForm.arrivalVillage || !offerForm.departureDate || !offerForm.departureTime) {
      safeAlert('Заполните обязательные поля');
      return;
    }

    const newOffer: RideOffer = {
      id: `offer_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      departureVillage: offerForm.departureVillage,
      arrivalVillage: offerForm.arrivalVillage,
      departureDate: offerForm.departureDate,
      departureTime: offerForm.departureTime,
      availableSeats: Number(offerForm.availableSeats),
      price: Number(offerForm.price),
      comment: offerForm.comment,
      contactPhone: offerForm.contactPhone,
      status: 'active',
      passengers: [],
      createdAt: new Date().toISOString()
    };

    dbCreateRideOfferHook(newOffer);
    setShowOfferModal(false);
    // Reset
    setOfferForm({
      departureVillage: 'Октябрьский',
      arrivalVillage: 'Березник',
      departureDate: new Date().toISOString().split('T')[0],
      departureTime: '10:00',
      availableSeats: 3,
      price: 150,
      comment: '',
      contactPhone: currentUser.phone || '+7 '
    });
  };

  const handleJoinRide = (offer: RideOffer) => {
    if (offer.userId === currentUser.id) {
      safeAlert('Вы не можете присоединиться к собственной поездке!');
      return;
    }

    const passengersList = offer.passengers || [];
    const alreadyJoined = passengersList.includes(currentUser.id);
    let updatedPassengers = [...passengersList];
    let updatedSeats = offer.availableSeats;

    if (alreadyJoined) {
      if (safeConfirm('Вы действительно хотите отказаться от поездки?')) {
        updatedPassengers = updatedPassengers.filter(p => p !== currentUser.id);
        updatedSeats += 1;
        dbUpdateRideOfferHook(offer.id, {
          passengers: updatedPassengers,
          availableSeats: updatedSeats
        });
      }
    } else {
      if (offer.availableSeats <= 0) {
        safeAlert('К сожалению, свободных мест больше нет.');
        return;
      }
      if (safeConfirm('Подтвердить бронирование места? Водитель свяжется с вами.')) {
        updatedPassengers.push(currentUser.id);
        updatedSeats -= 1;
        dbUpdateRideOfferHook(offer.id, {
          passengers: updatedPassengers,
          availableSeats: updatedSeats
        });
      }
    }
  };

  const handleCancelRideOffer = (offerId: string) => {
    if (safeConfirm('Вы уверены, что хотите отменить это предложение поездки?')) {
      dbUpdateRideOfferHook(offerId, { status: 'cancelled' });
    }
  };

  const handleCompleteRideOffer = (offerId: string) => {
    if (safeConfirm('Пометить поездку как завершенную?')) {
      dbUpdateRideOfferHook(offerId, { status: 'completed' });
    }
  };

  // Handler functions for ride requests
  const handleCreateRideRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.departureVillage || !requestForm.arrivalVillage || !requestForm.departureDate) {
      safeAlert('Заполните обязательные поля');
      return;
    }

    const newRequest: RideRequest = {
      id: `request_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      departureVillage: requestForm.departureVillage,
      arrivalVillage: requestForm.arrivalVillage,
      departureDate: requestForm.departureDate,
      passengers: Number(requestForm.passengers),
      comment: requestForm.comment,
      contactPhone: requestForm.contactPhone,
      status: 'active',
      matchedOfferId: '',
      createdAt: new Date().toISOString()
    };

    dbCreateRideRequestHook(newRequest);
    setShowRequestModal(false);
    // Reset
    setRequestForm({
      departureVillage: 'Березник',
      arrivalVillage: 'Октябрьский',
      departureDate: new Date().toISOString().split('T')[0],
      passengers: 1,
      comment: '',
      contactPhone: currentUser.phone || '+7 '
    });
  };

  const handleCancelRideRequest = (requestId: string) => {
    if (safeConfirm('Вы уверены, что хотите удалить эту заявку?')) {
      dbDeleteRideRequestHook(requestId);
    }
  };

  // Handler functions for road reports
  const handleCreateRoadReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadReportForm.segmentStart || !roadReportForm.segmentEnd) {
      safeAlert('Заполните обязательные поля');
      return;
    }

    const newReport: RoadReport = {
      id: `report_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      segmentStart: roadReportForm.segmentStart,
      segmentEnd: roadReportForm.segmentEnd,
      condition: roadReportForm.condition,
      comment: roadReportForm.comment,
      createdAt: new Date().toISOString()
    };

    dbCreateRoadReportHook(newReport);
    setShowRoadReportModal(false);
    setRoadReportForm({
      segmentStart: 'Октябрьский',
      segmentEnd: 'Шангалы',
      condition: 'good',
      comment: ''
    });
  };

  // Handler functions for reviews
  const handleOpenReview = (offer: RideOffer) => {
    setReviewTargetOfferId(offer.id);
    setReviewTargetDriverId(offer.userId);
    setReviewForm({
      punctuality: 5,
      drivingSafety: 5,
      carCleanliness: 5,
      politeness: 5,
      comment: '',
      isAnonymous: false
    });
    setShowReviewModal(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const avgRating = (reviewForm.punctuality + reviewForm.drivingSafety + reviewForm.carCleanliness + reviewForm.politeness) / 4;
    
    const newReview: RideReview = {
      id: `ride_rev_${Date.now()}`,
      rideOfferId: reviewTargetOfferId,
      reviewerUserId: currentUser.id,
      reviewerName: reviewForm.isAnonymous ? 'Анонимно' : currentUser.name,
      targetUserId: reviewTargetDriverId,
      rating: parseFloat(avgRating.toFixed(1)),
      categories: {
        punctuality: reviewForm.punctuality,
        drivingSafety: reviewForm.drivingSafety,
        carCleanliness: reviewForm.carCleanliness,
        politeness: reviewForm.politeness
      },
      comment: reviewForm.comment,
      isAnonymous: reviewForm.isAnonymous,
      createdAt: new Date().toISOString()
    };

    dbCreateRideReviewHook(newReview);
    setShowReviewModal(false);
    safeAlert('Спасибо! Ваш отзыв опубликован.');
  };

  // Get matching ride offers for a request (Suggestion engine)
  const getMatchesForRequest = (req: RideRequest) => {
    return rideOffers.filter(o => 
      o.status === 'active' &&
      o.departureVillage.toLowerCase() === req.departureVillage.toLowerCase() &&
      o.arrivalVillage.toLowerCase() === req.arrivalVillage.toLowerCase() &&
      o.departureDate === req.departureDate
    );
  };

  // Get driver rating from reviews
  const getDriverRating = (driverId: string) => {
    const driverReviews = rideReviews.filter(r => r.targetUserId === driverId);
    if (driverReviews.length === 0) return { avg: 0, count: 0 };
    const sum = driverReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: (sum / driverReviews.length).toFixed(1),
      count: driverReviews.length
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24" id="transport_screen_container">
      {/* 1. Header Banner */}
      <div className="bg-emerald-800 text-white shadow-md relative overflow-hidden" id="transport_screen_header">
        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
          <Bus size={320} className="stroke-white" />
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <button 
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white transition-all bg-emerald-900/40 py-1.5 px-3 rounded-full mb-2 border border-emerald-700 cursor-pointer"
            >
              <span>← Вернуться назад</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>🚌</span>
              <span>Транспортная доступность</span>
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
              Информация обо всех рейсах района, попутках и текущей ситуации на лесных и асфальтовых дорогах Устьян.
            </p>
          </div>

          <div className="flex flex-col gap-2 items-start md:items-end">
            <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
              isOffline ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30' : 'bg-emerald-900/40 text-emerald-200 border border-emerald-700'
            }`}>
              {isOffline ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Режим оффлайн</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>База синхронизирована</span>
                </>
              )}
            </div>
            
            {isAdmin && (
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold text-white uppercase tracking-wider">
                👑 Режим Администратора
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mode Selector Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="transport_tabs_bar">
        <div className="max-w-4xl mx-auto px-4 flex justify-around">
          <button
            onClick={() => setActiveTab('rides')}
            className={`flex-1 py-4 text-center font-bold text-xs md:text-sm border-b-4 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'rides' 
                ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Navigation size={16} />
            <span>🚗 Попутчики (поездки между жителями)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('roads')}
            className={`flex-1 py-4 text-center font-bold text-xs md:text-sm border-b-4 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'roads' 
                ? 'border-emerald-600 text-emerald-700 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle size={16} />
            <span>Дороги ({roadReports.filter(r => r.condition === 'poor' || r.condition === 'impassable').length})</span>
          </button>
        </div>
      </div>

      {/* 3. Main Dynamic Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-6" id="transport_main_content">
        <AnimatePresence mode="wait">
          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Filter form */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Search size={16} className="text-emerald-600" />
                  <span>Поиск автобусного рейса:</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Пункт отправления:</label>
                    <div className="relative">
                      <select 
                        value={scheduleFrom}
                        onChange={(e) => setScheduleFrom(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
                      >
                        <option value="">-- Все населенные пункты --</option>
                        {Array.from(new Set(routes.map(r => r.departureVillage))).map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <MapPin size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Пункт назначения:</label>
                    <div className="relative">
                      <select 
                        value={scheduleTo}
                        onChange={(e) => setScheduleTo(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
                      >
                        <option value="">-- Все населенные пункты --</option>
                        {Array.from(new Set(routes.map(r => r.arrivalVillage))).map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <MapPin size={16} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Weekday Picker */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">День недели:</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {WEEKDAYS.map(day => (
                      <button
                        key={day.key}
                        onClick={() => setScheduleWeekday(day.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          scheduleWeekday === day.key
                            ? 'bg-emerald-600 text-white shadow-sm scale-105'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Actions Bar */}
              {isAdmin && (
                <div className="flex justify-between items-center bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-bold text-slate-600">Настройки расписания:</span>
                  <button
                    onClick={handleOpenAddRoute}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Добавить рейс</span>
                  </button>
                </div>
              )}

              {/* Bus Routes Listing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-800">
                    Найдено рейсов на {WEEKDAY_RU[scheduleWeekday].toLowerCase()}: ({filteredRoutes.length})
                  </h2>
                </div>

                {filteredRoutes.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-3">
                    <span className="text-4xl block">🚌</span>
                    <p className="text-slate-500 text-sm font-bold">На выбранный день недели и фильтры рейсов не найдено.</p>
                    <p className="text-xs text-slate-400 leading-normal">Попробуйте сбросить фильтры отправления и прибытия или выберите другой день недели.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRoutes.map(route => {
                      const todayTimes: string[] = (route.schedule as any)[scheduleWeekday] || [];
                      return (
                        <div 
                          key={route.id}
                          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            {/* Top Badge Info */}
                            <div className="flex justify-between items-start">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-100">
                                <Bus size={12} />
                                <span>Рейс {route.routeNumber}</span>
                              </span>

                              <span className="text-sm font-black text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                {route.price} ₽
                              </span>
                            </div>

                            {/* Departure -> Arrival */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-emerald-500 h-2 w-2 rounded-full ring-4 ring-emerald-100" />
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Откуда:</span>
                                <span className="text-sm font-black text-slate-800">{route.departureVillage}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-indigo-500 h-2 w-2 rounded-full ring-4 ring-indigo-100" />
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Куда:</span>
                                <span className="text-sm font-black text-slate-800">{route.arrivalVillage}</span>
                              </div>
                            </div>

                            {/* Weekly Times Display */}
                            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-1.5">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock size={11} />
                                <span>Время отправления сегодня:</span>
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {todayTimes.map((time, idx) => (
                                  <span key={idx} className="bg-white text-slate-800 text-xs font-black px-2.5 py-1 rounded-lg border border-slate-200 shadow-3xs">
                                    {time}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-400">
                              Перевозчик: <strong className="text-slate-600">{route.provider}</strong>
                            </span>

                            {isAdmin && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleOpenEditRoute(route)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all cursor-pointer"
                                  title="Редактировать рейс"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRoute(route.id)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer"
                                  title="Удалить рейс"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: RIDE SHARING (ПОПУТКИ) */}
          {activeTab === 'rides' && (
            <motion.div
              key="rides_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Search & Mode Bar */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-4">
                {/* Driver / Passenger Subtabs */}
                <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200/50">
                  <button
                    onClick={() => setRideSubTab('offers')}
                    className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
                      rideSubTab === 'offers'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🚗 Поездки от водителей (Ищу машину)
                  </button>
                  <button
                    onClick={() => setRideSubTab('requests')}
                    className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${
                      rideSubTab === 'requests'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🙋 Заявки от пассажиров (Ищу попутчиков)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Откуда:</label>
                    <select
                      value={rideFrom}
                      onChange={(e) => setRideFrom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
                    >
                      <option value="">-- Все села --</option>
                      {USTYANY_VILLAGES.map(v => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Куда:</label>
                    <select
                      value={rideTo}
                      onChange={(e) => setRideTo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
                    >
                      <option value="">-- Все села --</option>
                      {USTYANY_VILLAGES.map(v => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Дата:</label>
                    <input
                      type="date"
                      value={rideDate}
                      onChange={(e) => setRideDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar based on sub-tab */}
              <div className="flex justify-between items-center bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                <span className="text-xs font-bold text-slate-600">Хотите добавить объявление?</span>
                {rideSubTab === 'offers' ? (
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Предложить поездку (Я водитель)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Оставить заявку (Я пассажир)</span>
                  </button>
                )}
              </div>

              {/* SUB-TAB 1: DRIVER OFFERS */}
              {rideSubTab === 'offers' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Активные поездки от попутных водителей: ({filteredRideOffers.filter(o => o.status === 'active').length})
                  </h3>

                  {filteredRideOffers.filter(o => o.status === 'active').length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-2">
                      <span className="text-4xl block">🚗</span>
                      <p className="text-slate-500 text-sm font-bold">Активных предложений по данным фильтрам не найдено.</p>
                      <button 
                        onClick={() => { setRideFrom(''); setRideTo(''); setRideDate(''); }}
                        className="text-xs text-emerald-600 font-extrabold underline cursor-pointer"
                      >
                        Сбросить фильтры поиска
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRideOffers.map(offer => {
                        const isMyOffer = offer.userId === currentUser.id;
                        const isJoined = (offer.passengers || []).includes(currentUser.id);
                        const ratingInfo = getDriverRating(offer.userId);
                        const offerReviews = rideReviews.filter(rev => rev.rideOfferId === offer.id);

                        return (
                          <div 
                            key={offer.id} 
                            className={`bg-white rounded-3xl p-5 border shadow-xs transition-all flex flex-col md:flex-row justify-between gap-4 ${
                              offer.status !== 'active' ? 'opacity-60' : 'border-slate-200/80 hover:shadow-md'
                            }`}
                          >
                            <div className="space-y-3.5 flex-1">
                              {/* Driver Header */}
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-700 border-2 border-slate-100">
                                  {offer.userName ? offer.userName[0].toUpperCase() : 'B'}
                                </div>
                                <div className="leading-tight">
                                  <p className="text-sm font-black text-slate-800">{offer.userName || 'Водитель'}</p>
                                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
                                    <Star size={12} className="fill-amber-500 stroke-amber-500" />
                                    <span>
                                      {ratingInfo.count > 0 ? `${ratingInfo.avg} (${ratingInfo.count} отз.)` : 'Нет оценок'}
                                    </span>
                                  </div>
                                </div>
                                
                                {isMyOffer && (
                                  <span className="bg-indigo-50 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100">
                                    Моя поездка
                                  </span>
                                )}
                              </div>

                              {/* Direction and Schedule */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span>{offer.departureVillage}</span>
                                  </span>
                                  <ArrowRight size={14} className="text-slate-400" />
                                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span>{offer.arrivalVillage}</span>
                                  </span>
                                </div>

                                <div className="flex gap-4 text-xs font-bold text-slate-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={13} className="text-emerald-600" />
                                    <span>{offer.departureDate}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock size={13} className="text-emerald-600" />
                                    <span>{offer.departureTime}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Comment */}
                              {offer.comment && (
                                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                  "{offer.comment}"
                                </p>
                              )}

                              {/* Confirmed passengers list (Visible to creator and participants) */}
                              {(offer.passengers || []).length > 0 && (
                                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100 text-xs">
                                  <p className="font-extrabold text-emerald-800 mb-1">
                                    🙋 Подтвержденные пассажиры ({(offer.passengers || []).length}):
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(offer.passengers || []).map(pid => {
                                      const u = users.find(usr => usr.id === pid);
                                      return (
                                        <span key={pid} className="bg-white text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                                          {u ? u.name : 'Пассажир'}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Offer pricing, seats, and actions */}
                            <div className="flex flex-col justify-between items-end gap-3 min-w-[160px] border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                              <div className="text-right w-full">
                                <p className="text-xs text-slate-400 font-bold uppercase">Цена места:</p>
                                <p className="text-xl font-black text-slate-800">
                                  {offer.price === 0 ? (
                                    <span className="text-emerald-600">Бесплатно</span>
                                  ) : (
                                    <span>{offer.price} ₽</span>
                                  )}
                                </p>
                                <div className="mt-1 inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-amber-100">
                                  <span>Мест: {offer.availableSeats}</span>
                                </div>
                              </div>

                              {/* Button interaction */}
                              <div className="w-full space-y-2">
                                {offer.status === 'active' && (
                                  <>
                                    {isMyOffer ? (
                                      <div className="space-y-1.5 w-full">
                                        <button
                                          onClick={() => handleCompleteRideOffer(offer.id)}
                                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-2 rounded-xl transition-all cursor-pointer"
                                        >
                                          ✓ Завершить поездку
                                        </button>
                                        <button
                                          onClick={() => handleCancelRideOffer(offer.id)}
                                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[11px] py-2 rounded-xl transition-all border border-rose-200 cursor-pointer"
                                        >
                                          Отменить поездку
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5 w-full">
                                        <button
                                          onClick={() => handleJoinRide(offer)}
                                          className={`w-full font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            isJoined
                                              ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200'
                                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                          }`}
                                        >
                                          {isJoined ? (
                                            <>
                                              <Check size={14} />
                                              <span>Выйти из поездки</span>
                                            </>
                                          ) : (
                                            <>
                                              <span>Присоединиться</span>
                                            </>
                                          )}
                                        </button>

                                        {isJoined && (
                                          <button
                                            onClick={() => handleOpenReview(offer)}
                                            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-[10px] py-1.5 rounded-lg transition-all border border-amber-200 flex items-center justify-center gap-1 cursor-pointer"
                                          >
                                            <Star size={11} className="fill-amber-500 stroke-amber-500" />
                                            <span>Оставить отзыв водителю</span>
                                          </button>
                                        )}

                                        <a
                                          href={`tel:${offer.contactPhone}`}
                                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-2 rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <Phone size={11} />
                                          <span>Позвонить водителю</span>
                                        </a>
                                      </div>
                                    )}
                                  </>
                                )}

                                {offer.status === 'completed' && (
                                  <div className="w-full bg-slate-100 text-slate-500 text-center font-bold text-xs py-2 rounded-xl">
                                    Поездка завершена
                                  </div>
                                )}
                                
                                {offer.status === 'cancelled' && (
                                  <div className="w-full bg-rose-50 text-rose-500 text-center font-bold text-xs py-2 rounded-xl">
                                    Отменено
                                  </div>
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

              {/* SUB-TAB 2: PASSENGER REQUESTS */}
              {rideSubTab === 'requests' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Активные заявки от жителей (Ищут транспорт): ({filteredRideRequests.length})
                  </h3>

                  {filteredRideRequests.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-2">
                      <span className="text-4xl block">🙋</span>
                      <p className="text-slate-500 text-sm font-bold">Активных заявок от пассажиров не найдено.</p>
                      <button 
                        onClick={() => { setRideFrom(''); setRideTo(''); setRideDate(''); }}
                        className="text-xs text-emerald-600 font-extrabold underline cursor-pointer"
                      >
                        Сбросить фильтры поиска
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRideRequests.map(request => {
                        const isMyRequest = request.userId === currentUser.id;
                        const matchingOffers = getMatchesForRequest(request);

                        return (
                          <div 
                            key={request.id}
                            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                              <div className="space-y-3.5 flex-1">
                                {/* Passenger Profile Header */}
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-700 border-2 border-slate-100">
                                    {request.userName ? request.userName[0].toUpperCase() : 'П'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-800">{request.userName || 'Житель Устьян'}</p>
                                    <p className="text-xs text-slate-400 font-semibold">Опубликовано пассажиром</p>
                                  </div>
                                  
                                  {isMyRequest && (
                                    <span className="bg-indigo-50 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100">
                                      Моя заявка
                                    </span>
                                  )}
                                </div>

                                {/* Directions and Info */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                                      <MapPin size={12} />
                                      <span>{request.departureVillage}</span>
                                    </span>
                                    <ArrowRight size={14} className="text-slate-400" />
                                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                                      <MapPin size={12} />
                                      <span>{request.arrivalVillage}</span>
                                    </span>
                                  </div>

                                  <div className="flex gap-4 text-xs font-bold text-slate-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar size={13} className="text-emerald-600" />
                                      <span>{request.departureDate}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User size={13} className="text-emerald-600" />
                                      <span>Пассажиров: {request.passengers}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Comment */}
                                {request.comment && (
                                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    "{request.comment}"
                                  </p>
                                )}
                              </div>

                              {/* Phone / Cancel Request controls */}
                              <div className="flex flex-col justify-end min-w-[160px] md:border-l border-slate-100 md:pl-4 pt-3 md:pt-0">
                                {isMyRequest ? (
                                  <button
                                    onClick={() => handleCancelRideRequest(request.id)}
                                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[11px] py-2 rounded-xl transition-all border border-rose-200 cursor-pointer"
                                  >
                                    Удалить заявку
                                  </button>
                                ) : (
                                  <a
                                    href={`tel:${request.contactPhone}`}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Phone size={12} />
                                    <span>Связаться по телефону</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Intelligent Matching/Suggestions Section */}
                            {matchingOffers.length > 0 && (
                              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 space-y-3">
                                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <span>✨ Помощник AI: Подходящие попутки водителей</span>
                                </h4>
                                <div className="space-y-2">
                                  {matchingOffers.map(mo => (
                                    <div key={mo.id} className="bg-white rounded-xl p-3 border border-emerald-100 shadow-3xs flex justify-between items-center gap-2">
                                      <div>
                                        <p className="text-xs font-extrabold text-slate-800">
                                          🚙 {mo.userName} ({mo.departureTime})
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold">
                                          Свободных мест: {mo.availableSeats} • Цена: {mo.price === 0 ? 'Бесплатно' : `${mo.price} ₽`}
                                        </p>
                                      </div>

                                      <button
                                        onClick={() => handleJoinRide(mo)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                      >
                                        Присоединиться
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: ROADS (ДОРОЖНАЯ ОБСТАНОВКА) */}
          {activeTab === 'roads' && (
            <motion.div
              key="roads_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Introduction Banner on Crowdsourced Roads */}
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-xs flex gap-3">
                <span className="text-3xl">🚧</span>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-amber-800">Дорожный патруль Устьян</h4>
                  <p className="text-xs text-amber-700 leading-normal font-medium">
                    Свежая информация от водителей о состоянии дорог между деревнями, размывах, колеях и гололеде. Делитесь своей информацией, чтобы помочь соседям спланировать безопасный маршрут!
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-between items-center bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                <span className="text-xs font-bold text-slate-600 font-medium">У вас есть новая информация о дороге?</span>
                <button
                  onClick={() => setShowRoadReportModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Сообщить о ситуации</span>
                </button>
              </div>

              {/* Road Reports Listing */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800">
                  Последние отчеты о состоянии дорожных участков:
                </h3>

                {roadReports.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
                    <span className="text-4xl block">✨</span>
                    <p className="text-slate-500 text-sm font-bold mt-2">Нет ни одного сообщения о плохих дорогах.</p>
                    <p className="text-xs text-slate-400 mt-1">Все участки работают в штатном режиме.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {roadReports.map(report => {
                      // Style configurations based on condition
                      let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      let conditionText = 'Отличная';
                      let barColor = 'bg-emerald-500';

                      if (report.condition === 'fair') {
                        badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                        conditionText = 'Удовлетворительная (ямы)';
                        barColor = 'bg-yellow-400';
                      } else if (report.condition === 'poor') {
                        badgeColor = 'bg-orange-100 text-orange-800 border-orange-200';
                        conditionText = 'Плохая (размыв, глубокая колея)';
                        barColor = 'bg-orange-500';
                      } else if (report.condition === 'impassable') {
                        badgeColor = 'bg-red-100 text-red-800 border-red-200';
                        conditionText = 'Непроходимая (завал, паводок)';
                        barColor = 'bg-red-600 animate-pulse';
                      }

                      return (
                        <div 
                          key={report.id}
                          className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex"
                        >
                          {/* Sidebar color strip representing condition level */}
                          <div className={`w-3 shrink-0 ${barColor}`} />

                          <div className="p-5 flex-1 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-bold">
                                  {report.segmentStart}
                                </span>
                                <span className="text-slate-400 font-black text-xs">→</span>
                                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-bold">
                                  {report.segmentEnd}
                                </span>
                              </div>

                              <span className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full border ${badgeColor}`}>
                                <AlertTriangle size={12} />
                                <span>{conditionText}</span>
                              </span>
                            </div>

                            <p className="text-xs md:text-sm font-bold text-slate-700 leading-normal bg-slate-50 p-3 rounded-xl border border-slate-100">
                              "{report.comment}"
                            </p>

                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-1">
                              <span>Автор: <strong className="text-slate-600">{report.userName || 'Анонимно'}</strong></span>
                              <span>{new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. MODAL DIALOGS */}

      {/* MODAL 1: ADD/EDIT BUS ROUTE */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border-2 border-emerald-500"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">
                {selectedRoute ? 'Редактировать автобусный рейс' : 'Создать новый автобусный рейс'}
              </h3>
              <button 
                onClick={() => setShowRouteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Номер маршрута *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: 102 или 105к"
                    value={routeForm.routeNumber}
                    onChange={(e) => setRouteForm({ ...routeForm, routeNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Цена билета (₽) *</label>
                  <input
                    type="number"
                    required
                    value={routeForm.price}
                    onChange={(e) => setRouteForm({ ...routeForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Откуда *</label>
                  <select
                    value={routeForm.departureVillage}
                    onChange={(e) => setRouteForm({ ...routeForm, departureVillage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {USTYANY_VILLAGES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Куда *</label>
                  <select
                    value={routeForm.arrivalVillage}
                    onChange={(e) => setRouteForm({ ...routeForm, arrivalVillage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {USTYANY_VILLAGES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Название перевозчика *</label>
                <input
                  type="text"
                  required
                  placeholder="Например: ООО УстьяныАвто"
                  value={routeForm.provider}
                  onChange={(e) => setRouteForm({ ...routeForm, provider: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              {/* Schedule time builder per day */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <p className="text-[11px] font-extrabold text-slate-500 uppercase">Время рейсов по дням недели:</p>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                  {WEEKDAYS.map(day => (
                    <div key={day.key} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="text-xs font-extrabold text-slate-600 w-8">{day.label}:</span>
                      <input
                        type="text"
                        placeholder="08:00, 14:00, 19:30"
                        value={((routeForm.schedule as any)[day.key] || []).join(', ')}
                        onChange={(e) => {
                          const times = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                          const updatedSchedule = { ...routeForm.schedule };
                          (updatedSchedule as any)[day.key] = times;
                          setRouteForm({ ...routeForm, schedule: updatedSchedule });
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Введите времена через запятую в формате ЧЧ:ММ (например: 07:15, 12:40).</p>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-all cursor-pointer text-sm"
              >
                💾 Сохранить рейс в базе
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: ADD DRIVER SHARE OFFER */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border-2 border-emerald-500"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">Предложить поездку (Водитель)</h3>
              <button 
                onClick={() => setShowOfferModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRideOffer} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Откуда *</label>
                  <select
                    value={offerForm.departureVillage}
                    onChange={(e) => setOfferForm({ ...offerForm, departureVillage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {USTYANY_VILLAGES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Куда *</label>
                  <select
                    value={offerForm.arrivalVillage}
                    onChange={(e) => setOfferForm({ ...offerForm, arrivalVillage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {USTYANY_VILLAGES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Дата выезда *</label>
                  <input
                    type="date"
                    required
                    value={offerForm.departureDate}
                    onChange={(e) => setOfferForm({ ...offerForm, departureDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Время выезда *</label>
                  <input
                    type="time"
                    required
                    value={offerForm.departureTime}
                    onChange={(e) => setOfferForm({ ...offerForm, departureTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Цена с пассажира (₽) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0 - бесплатно"
                    value={offerForm.price}
                    onChange={(e) => setOfferForm({ ...offerForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Свободных мест *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="8"
                    value={offerForm.availableSeats}
                    onChange={(e) => setOfferForm({ ...offerForm, availableSeats: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Номер телефона для связи *</label>
                <input
                  type="text"
                  required
                  placeholder="+7 9xx xxx-xx-xx"
                  value={offerForm.contactPhone}
                  onChange={(e) => setOfferForm({ ...offerForm, contactPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Комментарий водителя (авто, багаж)</label>
                <textarea
                  placeholder="Какая машина, пустой ли багажник, детали встречи..."
                  value={offerForm.comment}
                  onChange={(e) => setOfferForm({ ...offerForm, comment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-all cursor-pointer text-sm"
              >
                🚀 Разместить предложение поездки
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: ADD PASSENGER REQUEST */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border-2 border-emerald-500"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">Разместить заявку (Пассажир)</h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRideRequest} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Откуда *</label>
                  <select
                    value={requestForm.departureVillage}
                    onChange={(e) => setRequestForm({ ...requestForm, departureVillage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {USTYANY_VILLAGES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Куда *</label>
                  <select
                    value={requestForm.arrivalVillage}
                    onChange={(e) => setRequestForm({ ...requestForm, arrivalVillage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {USTYANY_VILLAGES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Желаемая дата поездки *</label>
                  <input
                    type="date"
                    required
                    value={requestForm.departureDate}
                    onChange={(e) => setRequestForm({ ...requestForm, departureDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Кол-во человек *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="6"
                    value={requestForm.passengers}
                    onChange={(e) => setRequestForm({ ...requestForm, passengers: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Номер телефона для связи *</label>
                <input
                  type="text"
                  required
                  placeholder="+7 9xx xxx-xx-xx"
                  value={requestForm.contactPhone}
                  onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Ваш комментарий (багаж, особенности)</label>
                <textarea
                  placeholder="Например: Поедем вдвоем с ребенком, нужна перевозка детской коляски..."
                  value={requestForm.comment}
                  onChange={(e) => setRequestForm({ ...requestForm, comment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-all cursor-pointer text-sm"
              >
                🙋 Разместить заявку на попутку
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 4: REPORT ROAD CONDITION */}
      {showRoadReportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border-2 border-emerald-500"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">Сообщить о ситуации на дороге</h3>
              <button 
                onClick={() => setShowRoadReportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRoadReport} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Участок: Начало *</label>
                  <select
                    value={roadReportForm.segmentStart}
                    onChange={(e) => setRoadReportForm({ ...roadReportForm, segmentStart: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {USTYANY_VILLAGES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Участок: Конец *</label>
                  <select
                    value={roadReportForm.segmentEnd}
                    onChange={(e) => setRoadReportForm({ ...roadReportForm, segmentEnd: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {USTYANY_VILLAGES.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-black">Состояние дороги *</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setRoadReportForm({ ...roadReportForm, condition: 'good' })}
                    className={`p-2.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                      roadReportForm.condition === 'good'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🟢 Отличная
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoadReportForm({ ...roadReportForm, condition: 'fair' })}
                    className={`p-2.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                      roadReportForm.condition === 'fair'
                        ? 'bg-yellow-50 text-yellow-800 border-yellow-500 ring-2 ring-yellow-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🟡 Удовлетворительно
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoadReportForm({ ...roadReportForm, condition: 'poor' })}
                    className={`p-2.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                      roadReportForm.condition === 'poor'
                        ? 'bg-orange-50 text-orange-800 border-orange-500 ring-2 ring-orange-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🟠 Плохая (ямы, колея)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoadReportForm({ ...roadReportForm, condition: 'impassable' })}
                    className={`p-2.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                      roadReportForm.condition === 'impassable'
                        ? 'bg-red-50 text-red-800 border-red-500 ring-2 ring-red-200 animate-pulse'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🔴 Непроходимая
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Подробный комментарий (ямы, лед, занос) *</label>
                <textarea
                  required
                  placeholder="Опишите текущее состояние участка, есть ли наледь, колея, размывы..."
                  value={roadReportForm.comment}
                  onChange={(e) => setRoadReportForm({ ...roadReportForm, comment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-24 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-all cursor-pointer text-sm"
              >
                📢 Опубликовать предупреждение
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 5: DRIVER REVIEW */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border-2 border-emerald-500 animate-fadeIn"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">Оценить поездку с водителем</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="space-y-3">
                {/* Criterion 1: Punctuality */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600 font-bold">⏱️ Пунктуальность водителя:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, punctuality: star })}
                        className="p-0.5 transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star 
                          size={18} 
                          className={star <= reviewForm.punctuality ? 'fill-amber-500 stroke-amber-500' : 'stroke-slate-300'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Criterion 2: Safety */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600 font-bold">🛡️ Безопасность вождения:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, drivingSafety: star })}
                        className="p-0.5 transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star 
                          size={18} 
                          className={star <= reviewForm.drivingSafety ? 'fill-amber-500 stroke-amber-500' : 'stroke-slate-300'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Criterion 3: Cleanliness */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600 font-bold">🧽 Чистота автомобиля:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, carCleanliness: star })}
                        className="p-0.5 transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star 
                          size={18} 
                          className={star <= reviewForm.carCleanliness ? 'fill-amber-500 stroke-amber-500' : 'stroke-slate-300'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Criterion 4: Politeness */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-600 font-bold">💬 Вежливость в поездке:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, politeness: star })}
                        className="p-0.5 transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star 
                          size={18} 
                          className={star <= reviewForm.politeness ? 'fill-amber-500 stroke-amber-500' : 'stroke-slate-300'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text review comment */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Ваш отзыв водителю</label>
                <textarea
                  placeholder="Напишите пару слов о водителе, машине и качестве поездки..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 h-20 resize-none"
                />
              </div>

              {/* Is Anonymous Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="review_anon_chk"
                  checked={reviewForm.isAnonymous}
                  onChange={(e) => setReviewForm({ ...reviewForm, isAnonymous: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 border-slate-200 rounded-md focus:ring-emerald-500"
                />
                <label htmlFor="review_anon_chk" className="text-xs text-slate-600 font-bold cursor-pointer select-none">
                  Опубликовать отзыв анонимно
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl transition-all cursor-pointer text-sm"
              >
                ✓ Отправить отзыв
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
