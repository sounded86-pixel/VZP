import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, HelpRequest, Chat, Message, Complaint,
  USTYANY_VILLAGES, REQUEST_CATEGORIES, SKILLS_LIST,
  Entrepreneur, Order, Review, BusRoute, RideOffer, RideRequest, RoadReport, RideReview,
  Dispute, FraudAlert, Master, PortfolioItem, ServiceOrder, MasterReview, Page,
  getProfileSkillsData, Region
} from './types';
import { 
  initializeStorage, getStoredUsers, saveStoredUsers,
  getStoredRequests, saveStoredRequests, getStoredChats, saveStoredChats,
  getStoredMessages, saveStoredMessages, getStoredComplaints, saveStoredComplaints,
  getStoredEntrepreneurs, saveStoredEntrepreneurs, getStoredOrders, saveStoredOrders, getStoredReviews, saveStoredReviews,
  getStoredCurrentUserId, saveStoredCurrentUserId, getStoredOfflineQueue, saveStoredOfflineQueue,
  getStoredRoutes, saveStoredRoutes, getStoredRideOffers, saveStoredRideOffers,
  getStoredRideRequests, saveStoredRideRequests, getStoredRoadReports, saveStoredRoadReports,
  getStoredRideReviews, saveStoredRideReviews,
  getStoredMasters, saveStoredMasters,
  getStoredPortfolioItems, saveStoredPortfolioItems,
  getStoredServiceOrders, saveStoredServiceOrders,
  getStoredMasterReviews, saveStoredMasterReviews,
  OfflineAction
} from './mockData';

import { processReferralAwards } from './utils/referralEngine';
import { getModulesForPackages } from './config/modules';

// Firebase imports
import { db, handleFirestoreError, OperationType } from './firebase';
import { onSnapshot, collection, query, orderBy, disableNetwork, enableNetwork, or, where } from 'firebase/firestore';
import {
  seedDatabaseIfEmpty,
  dbCreateUserProfile,
  dbUpdateUserProfile,
  dbCreateHelpRequest,
  dbUpdateHelpRequest,
  dbDeleteHelpRequest,
  dbCreateChat,
  dbUpdateChat,
  dbSendMessage,
  dbCreateComplaint,
  dbUpdateComplaint,
  dbCreateEntrepreneur,
  dbUpdateEntrepreneur,
  dbCreateOrder,
  dbUpdateOrder,
  dbCreateReview,
  dbCreateRoute,
  dbUpdateRoute,
  dbDeleteRoute,
  dbCreateRideOffer,
  dbUpdateRideOffer,
  dbDeleteRideOffer,
  dbCreateRideRequest,
  dbUpdateRideRequest,
  dbDeleteRideRequest,
  dbCreateRoadReport,
  dbCreateRideReview,
  dbCreateDispute,
  dbUpdateDispute,
  dbCreateFraudAlert,
  dbCreateMaster,
  dbUpdateMaster,
  dbDeleteMaster,
  dbCreatePortfolioItem,
  dbUpdatePortfolioItem,
  dbDeletePortfolioItem,
  dbCreateServiceOrder,
  dbUpdateServiceOrder,
  dbCreateMasterReview,
  dbSubscribePages
} from './firebaseSync';

// Screens
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import ProfileScreen from './components/ProfileScreen';
import LentaScreen from './components/LentaScreen';
import { GoodDeedsScreen } from './components/GoodDeedsScreen';
import CreateRequestScreen from './components/CreateRequestScreen';
import ChatScreen from './components/ChatScreen';
import SkillsCatalogScreen from './components/SkillsCatalogScreen';
import AdminPanelScreen from './components/AdminPanelScreen';
import SimplifiedDashboard from './components/SimplifiedDashboard';
import KeepNotesScreen from './components/KeepNotesScreen';
import CalendarScreen from './components/CalendarScreen';
import DeliveryScreen from './components/DeliveryScreen';
import TransportScreen from './components/TransportScreen';
import DashboardScreen from './components/DashboardScreen';
import DistrictScreen from './components/DistrictScreen';
import DeveloperConsole from './components/DeveloperConsole';
import ExportToGitHubScreen from './components/ExportToGitHubScreen';
import EcologyScreen from './components/EcologyScreen';
import SheetsScreen from './components/SheetsScreen';
import GovSupportScreen from './components/GovSupportScreen';
import FamilyScreen from './components/FamilyScreen';
import AboutProjectScreen from './components/AboutProjectScreen';
import FaqScreen from './components/FaqScreen';
import ReviewsScreen from './components/ReviewsScreen';
import { HelpNearbyScreen, HelpNearbyTab } from './components/HelpNearbyScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import { CustomPageRenderer } from './components/CustomPageRenderer';
import PartnerCabinet from './components/PartnerCabinet';
import DeepSeekScreen from './components/DeepSeekScreen';
import DigitalLiteracyScreen from './components/DigitalLiteracyScreen';
import ReferralsScreen from './components/ReferralsScreen';
import PlacesScreen from './components/PlacesScreen';
import PublicControlScreen from './components/PublicControlScreen';
import BusinessCenterScreen from './components/BusinessCenterScreen';
import GatedModulePlaceholder from './components/GatedModulePlaceholder';
import { InteractiveVillageScreen } from './components/InteractiveVillageScreen';
import RuStorePublishModal from './components/RuStorePublishModal';
import { useTheme } from './hooks/useTheme';
import { getUserRoleAndTariff } from './hooks/useUserRole';
import { TEST_ROLES } from './constants/testRoles';
import { RoleContext } from './context/RoleContext';


const ALLOWED_SCREENS_BY_ROLE: Record<string, string[]> = {
  child: ['auth', 'home', 'help_nearby', 'good_deeds', 'chat', 'profile', 'page_about', 'faq', 'digital_literacy', 'interactive_village', 'village_archive'],
  elderly: ['auth', 'home', 'help_nearby', 'good_deeds', 'lenta', 'create', 'skills', 'chat', 'digital_literacy', 'profile', 'page_about', 'faq', 'transport', 'ecology', 'interactive_village', 'village_archive'],
  master: ['auth', 'home', 'help_nearby', 'good_deeds', 'lenta', 'create', 'skills', 'chat', 'digital_literacy', 'profile', 'page_about', 'faq', 'transport', 'ecology', 'interactive_village', 'village_archive'],
  entrepreneur: ['auth', 'home', 'help_nearby', 'good_deeds', 'lenta', 'create', 'skills', 'chat', 'digital_literacy', 'profile', 'page_about', 'faq', 'transport', 'ecology', 'interactive_village', 'village_archive'],
  admin: ['auth', 'home', 'help_nearby', 'good_deeds', 'lenta', 'create', 'skills', 'chat', 'digital_literacy', 'profile', 'page_about', 'faq', 'admin', 'transport', 'ecology', 'interactive_village', 'village_archive'],
  developer: ['auth', 'home', 'help_nearby', 'good_deeds', 'lenta', 'create', 'skills', 'chat', 'digital_literacy', 'profile', 'page_about', 'faq', 'admin', 'dev_console', 'transport', 'ecology', 'interactive_village', 'village_archive'],
  partner: ['auth', 'home', 'help_nearby', 'good_deeds', 'lenta', 'create', 'skills', 'chat', 'digital_literacy', 'profile', 'page_about', 'faq', 'transport', 'ecology', 'interactive_village', 'village_archive'],
  resident: ['auth', 'home', 'help_nearby', 'good_deeds', 'lenta', 'create', 'skills', 'chat', 'digital_literacy', 'profile', 'page_about', 'faq', 'transport', 'ecology', 'interactive_village', 'village_archive']
};

// Navigation Icons
import { ClipboardList, PlusCircle, MessageSquare, Award, User, Shield, Flame, BellRing, Smartphone, Wifi, WifiOff, StickyNote, Calendar, Truck, Bus, Home, Users, Briefcase, Terminal, Lock, Mail, Phone, MapPin, Building2, Sparkles, CheckCircle, TrendingUp, AlertTriangle, ArrowLeft, HandHeart, BookOpen } from 'lucide-react';

import { PwaApp } from './pwa/PwaApp';

export default function App() {
  const [viewMode, setViewMode] = useState<'pwa_mvp' | 'legacy'>('pwa_mvp');

  // Application States loaded dynamically
  const [users, setUsers] = useState<UserProfile[]>(() => {
    initializeStorage();
    return getStoredUsers();
  });

  const [requests, setRequests] = useState<HelpRequest[]>(() => getStoredRequests());
  const [chats, setChats] = useState<Chat[]>(() => getStoredChats());
  const [messages, setMessages] = useState<Message[]>(() => getStoredMessages());
  const [complaints, setComplaints] = useState<Complaint[]>(() => getStoredComplaints());
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>(() => getStoredEntrepreneurs());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [reviews, setReviews] = useState<Review[]>(() => getStoredReviews());
  const [currentUserId, setCurrentUserId] = useState<string>(() => getStoredCurrentUserId());

  // Monetization & Fraud System States
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [currentUserIp, setCurrentUserIp] = useState<string>(() => {
    const saved = localStorage.getItem('ustyany_simulated_ip');
    if (saved) return saved;
    const randomIp = `192.168.1.${Math.floor(Math.random() * 200) + 20}`;
    localStorage.setItem('ustyany_simulated_ip', randomIp);
    return randomIp;
  });
  
  // Transport States
  const [routes, setRoutes] = useState<BusRoute[]>(() => getStoredRoutes());
  const [rideOffers, setRideOffers] = useState<RideOffer[]>(() => getStoredRideOffers());
  const [rideRequests, setRideRequests] = useState<RideRequest[]>(() => getStoredRideRequests());
  const [roadReports, setRoadReports] = useState<RoadReport[]>(() => getStoredRoadReports());
  const [rideReviews, setRideReviews] = useState<RideReview[]>(() => getStoredRideReviews());

  // Master Portfolio System States
  const [masters, setMasters] = useState<Master[]>(() => getStoredMasters());
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => getStoredPortfolioItems());
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(() => getStoredServiceOrders());
  const [masterReviews, setMasterReviews] = useState<MasterReview[]>(() => getStoredMasterReviews());
  
  // Page Builder States
  const [pages, setPages] = useState<Page[]>(() => {
    const saved = localStorage.getItem('ustyany_custom_pages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (pages.length > 0) {
      localStorage.setItem('ustyany_custom_pages', JSON.stringify(pages));
    }
  }, [pages]);

  // Interface state
  const [regions, setRegions] = useState<Region[]>([]);
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => getStoredOfflineQueue());
  const [searchQuery, setSearchQuery] = useState('');
  const [showGitHubExport, setShowGitHubExport] = useState(false);
  const [showRuStoreModal, setShowRuStoreModal] = useState(false);
  const [createRequestMode, setCreateRequestMode] = useState<'request' | 'offer'>('request');

  // Cozy Theme State and Handler
  const isCozyTheme = false;
  const handleToggleCozyTheme = (enabled: boolean) => {
    // Disabled as requested
  };

  // Simulation notification banners
  const [systemNotification, setSystemNotification] = useState<{ title: string; text: string } | null>(null);

  // Direct Responder Phone Dialog States
  const [showPhoneResponseModal, setShowPhoneResponseModal] = useState<boolean>(false);
  const [phoneResponseData, setPhoneResponseData] = useState<{ req: HelpRequest; phone: string } | null>(null);
  const [showCounterOfferForm, setShowCounterOfferForm] = useState<boolean>(false);
  const [counterPriceInput, setCounterPriceInput] = useState<string>('');
  const [counterCommentInput, setCounterCommentInput] = useState<string>('');

  // Synchronize component states with localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) saveStoredUsers(users);
  }, [users]);

  useEffect(() => {
    if (requests.length > 0) saveStoredRequests(requests);
  }, [requests]);

  useEffect(() => {
    saveStoredChats(chats);
  }, [chats]);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveStoredComplaints(complaints);
  }, [complaints]);

  useEffect(() => {
    saveStoredEntrepreneurs(entrepreneurs);
  }, [entrepreneurs]);

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    saveStoredRoutes(routes);
  }, [routes]);

  useEffect(() => {
    saveStoredRideOffers(rideOffers);
  }, [rideOffers]);

  useEffect(() => {
    saveStoredRideRequests(rideRequests);
  }, [rideRequests]);

  useEffect(() => {
    saveStoredRoadReports(roadReports);
  }, [roadReports]);

  useEffect(() => {
    saveStoredRideReviews(rideReviews);
  }, [rideReviews]);

  useEffect(() => {
    saveStoredMasters(masters);
  }, [masters]);

  useEffect(() => {
    saveStoredPortfolioItems(portfolioItems);
  }, [portfolioItems]);

  useEffect(() => {
    saveStoredServiceOrders(serviceOrders);
  }, [serviceOrders]);

  useEffect(() => {
    saveStoredMasterReviews(masterReviews);
  }, [masterReviews]);

  useEffect(() => {
    saveStoredOfflineQueue(offlineQueue);
  }, [offlineQueue]);

  // Current logged in user object
  const currentUser = useMemo(() => {
    const found = users.find(u => u.id === currentUserId);
    if (found) return found;
    
    // Fallback to TEST_ROLES if starts with test_
    if (currentUserId?.startsWith('test_')) {
      const testRole = TEST_ROLES.find(t => t.id === currentUserId);
      if (testRole) return testRole;
    }

    return users[0] || {
      id: "unknown",
      name: "Гость",
      phone: "",
      avatarUrl: "",
      village: "Октябрьский",
      skills: [],
      thanksCount: 0,
      createdCount: 0,
      resolvedCount: 0,
      blocked: false,
      reportsCount: 0
    };
  }, [users, currentUserId]);

  // Derived user roles and privileges
  const currentUserRole = useMemo(() => {
    return getUserRoleAndTariff(currentUser);
  }, [currentUser]);

  // Persistent role context using useState as requested
  const [currentRole, setCurrentRole] = useState<string>(() => {
    const id = getStoredCurrentUserId();
    const found = TEST_ROLES.find(t => t.id === id);
    return found?.role || 'resident';
  });

  // Keep state synchronized with active user
  useEffect(() => {
    if (currentUserRole.role) {
      setCurrentRole(currentUserRole.role);
    }
  }, [currentUserRole.role]);

  const role = currentRole;
  const isAdmin = currentRole === 'admin';
  const isDeveloper = currentRole === 'developer';

  // Active region calculation with fallback
  const activeRegion = useMemo(() => {
    const found = regions.find(r => r.id === currentUser?.regionCode);
    if (found) {
      return {
        ...found,
        modules: getModulesForPackages(found.packages)
      };
    }
    // Pilot region is RU-ARK (Arkhangelsk region) starting with 'start' package
    const defaultPackages: ('start' | 'business' | 'government')[] = 
      (currentUser?.regionCode === 'RU-ARK' || !currentUser?.regionCode)
        ? ['start']
        : ['start', 'business', 'government'];

    return {
      id: currentUser?.regionCode || 'RU-ARK',
      name: currentUser?.location?.region || 'Архангельская область',
      packages: defaultPackages,
      modules: getModulesForPackages(defaultPackages)
    };
  }, [regions, currentUser]);

  // All features are accessible and free without restrictions
  const isScreenGated = false;

  // Handle region updates (package/modules toggling)
  const handleUpdateRegion = async (regionId: string, updates: Partial<Region>) => {
    setRegions(prev => prev.map(r => r.id === regionId ? { ...r, ...updates } : r));
    if (!isOffline) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        await updateDoc(doc(db, 'regions', regionId), updates);
      } catch (e) {
        console.error("Error updating region package: ", e);
      }
    }
  };

  const isScreenAllowed = true;

  // Total unread notifications (simulation helper)
  const totalUnreadMessages = useMemo(() => {
    return chats.reduce((acc, c) => {
      if (c.authorId === currentUserId) return acc + c.unreadCountAuthor;
      if (c.responderId === currentUserId) return acc + c.unreadCountResponder;
      return acc;
    }, 0);
  }, [chats, currentUserId]);

  // Initial Seeding and Public Real-time Firestore Sync (Online)
  useEffect(() => {
    if (isOffline) return;

    // Seed database if empty
    seedDatabaseIfEmpty();

    // Public/General Listeners
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList: UserProfile[] = [];
      snapshot.forEach((doc) => uList.push(doc.data() as UserProfile));
      if (uList.length > 0) {
        setUsers(uList);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const rList: HelpRequest[] = [];
      snapshot.forEach((doc) => rList.push(doc.data() as HelpRequest));
      rList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(rList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'requests');
    });

    const unsubEntrepreneurs = onSnapshot(collection(db, 'entrepreneurs'), (snapshot) => {
      const eList: Entrepreneur[] = [];
      snapshot.forEach((doc) => eList.push(doc.data() as Entrepreneur));
      setEntrepreneurs(eList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'entrepreneurs');
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const oList: Order[] = [];
      snapshot.forEach((doc) => oList.push(doc.data() as Order));
      oList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(oList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const revList: Review[] = [];
      snapshot.forEach((doc) => revList.push(doc.data() as Review));
      setReviews(revList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    });

    const unsubRoutes = onSnapshot(collection(db, 'routes'), (snapshot) => {
      const list: BusRoute[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as BusRoute));
      setRoutes(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'routes');
    });

    const unsubRideOffers = onSnapshot(collection(db, 'ride_offers'), (snapshot) => {
      const list: RideOffer[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as RideOffer));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRideOffers(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ride_offers');
    });

    const unsubRideRequests = onSnapshot(collection(db, 'ride_requests'), (snapshot) => {
      const list: RideRequest[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as RideRequest));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRideRequests(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ride_requests');
    });

    const unsubRoadReports = onSnapshot(collection(db, 'road_reports'), (snapshot) => {
      const list: RoadReport[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as RoadReport));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRoadReports(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'road_reports');
    });

    const unsubRideReviews = onSnapshot(collection(db, 'ride_reviews'), (snapshot) => {
      const list: RideReview[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as RideReview));
      setRideReviews(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ride_reviews');
    });

    const unsubMasters = onSnapshot(collection(db, 'masters'), (snapshot) => {
      const list: Master[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as Master));
      setMasters(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'masters');
    });

    const unsubPortfolioItems = onSnapshot(collection(db, 'portfolio_items'), (snapshot) => {
      const list: PortfolioItem[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as PortfolioItem));
      setPortfolioItems(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'portfolio_items');
    });

    const unsubServiceOrders = onSnapshot(collection(db, 'service_orders'), (snapshot) => {
      const list: ServiceOrder[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as ServiceOrder));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setServiceOrders(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'service_orders');
    });

    const unsubMasterReviews = onSnapshot(collection(db, 'master_reviews'), (snapshot) => {
      const list: MasterReview[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as MasterReview));
      setMasterReviews(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'master_reviews');
    });

    const unsubPages = dbSubscribePages((list) => {
      setPages(list);
    });

    const unsubRegions = onSnapshot(collection(db, 'regions'), (snapshot) => {
      const list: Region[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as Region));
      setRegions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'regions');
    });

    return () => {
      unsubUsers();
      unsubRequests();
      unsubEntrepreneurs();
      unsubOrders();
      unsubReviews();
      unsubRoutes();
      unsubRideOffers();
      unsubRideRequests();
      unsubRoadReports();
      unsubRideReviews();
      unsubMasters();
      unsubPortfolioItems();
      unsubServiceOrders();
      unsubMasterReviews();
      unsubPages();
      unsubRegions();
    };
  }, [isOffline]);

  // User-Sensitive Real-time Firestore Sync with Role-based query isolation
  useEffect(() => {
    if (isOffline) return;

    // 1. CHATS: Full access for Admins/Developers; limited OR-query for standard users
    let unsubChats;
    if (isAdmin || isDeveloper) {
      unsubChats = onSnapshot(collection(db, 'chats'), (snapshot) => {
        const cList: Chat[] = [];
        snapshot.forEach((doc) => cList.push(doc.data() as Chat));
        cList.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
        setChats(cList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'chats');
      });
    } else {
      unsubChats = onSnapshot(
        query(
          collection(db, 'chats'),
          or(
            where('authorId', '==', currentUserId),
            where('responderId', '==', currentUserId)
          )
        ),
        (snapshot) => {
          const cList: Chat[] = [];
          snapshot.forEach((doc) => cList.push(doc.data() as Chat));
          cList.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
          setChats(cList);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'chats');
        }
      );
    }

    // 2. DISPUTES: Full access for Admins/Developers; limited OR-query for standard users
    let unsubDisputes;
    if (isAdmin || isDeveloper) {
      unsubDisputes = onSnapshot(collection(db, 'disputes'), (snapshot) => {
        const list: Dispute[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as Dispute));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDisputes(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'disputes');
      });
    } else {
      unsubDisputes = onSnapshot(
        query(
          collection(db, 'disputes'),
          or(
            where('buyerId', '==', currentUserId),
            where('entrepreneurId', '==', currentUserId)
          )
        ),
        (snapshot) => {
          const list: Dispute[] = [];
          snapshot.forEach((doc) => list.push(doc.data() as Dispute));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setDisputes(list);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'disputes');
        }
      );
    }

    // 3. COMPLAINTS: Accessible to all signed-in users
    const unsubComplaints = onSnapshot(collection(db, 'complaints'), (snapshot) => {
      const cpList: Complaint[] = [];
      snapshot.forEach((doc) => cpList.push(doc.data() as Complaint));
      setComplaints(cpList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'complaints');
    });

    // 4. FRAUD ALERTS: Restricted fully to Admins/Developers
    let unsubFraudAlerts = () => {};
    if (isAdmin || isDeveloper) {
      unsubFraudAlerts = onSnapshot(collection(db, 'fraud_alerts'), (snapshot) => {
        const list: FraudAlert[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as FraudAlert));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFraudAlerts(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'fraud_alerts');
      });
    } else {
      setFraudAlerts([]);
    }

    return () => {
      if (unsubChats) unsubChats();
      if (unsubDisputes) unsubDisputes();
      unsubComplaints();
      unsubFraudAlerts();
    };
  }, [isOffline, currentUserId, isAdmin, isDeveloper]);

  // Active Chat Message Sync (Online)
  useEffect(() => {
    if (isOffline || !activeChatId) return;

    const unsubMessages = onSnapshot(
      query(collection(db, 'chats', activeChatId, 'messages'), orderBy('createdAt', 'asc')),
      (snapshot) => {
        const mList: Message[] = [];
        snapshot.forEach((doc) => mList.push(doc.data() as Message));
        setMessages(mList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `chats/${activeChatId}/messages`);
      }
    );

    return () => {
      unsubMessages();
    };
  }, [isOffline, activeChatId]);

  // Handle switching active users (Simulator)
  const handleUserChange = (userId: string) => {
    setCurrentUserId(userId);
    saveStoredCurrentUserId(userId);
    
    // Close active chats on user swap to prevent seeing unauthorized chats
    setActiveChatId(null);

    const testRole = TEST_ROLES.find(t => t.id === userId);
    let newRole = 'resident';
    if (testRole) {
      newRole = testRole.role;
      // Force immediate update to local state so roles change reactively
      setUsers(prev => {
        const exists = prev.some(u => u.id === testRole.id);
        if (exists) {
          return prev.map(u => u.id === testRole.id ? { ...u, ...testRole } : u);
        } else {
          return [...prev, testRole];
        }
      });
      
      // Sync to Firestore if online
      if (!isOffline) {
        dbUpdateUserProfile(testRole.id, testRole);
      }
    } else {
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        newRole = getUserRoleAndTariff(foundUser).role;
      }
    }
    setCurrentRole(newRole);

    // Prompt user swap alert
    const newUser = users.find(u => u.id === userId) || TEST_ROLES.find(t => t.id === userId);
    if (newUser) {
      setSystemNotification({
        title: "Переключение профиля",
        text: `Вы вошли как ${newUser.name} (${newUser.village}). Теперь приложение адаптировано под его ленту и чаты.`
      });
      setTimeout(() => setSystemNotification(null), 3000);
    }
  };

  // Logout action
  const handleLogout = () => {
    setCurrentScreen('auth');
    setActiveChatId(null);
  };

  // Login/Registration Success handler
  const handleLoginSuccess = (userId: string) => {
    setCurrentUserId(userId);
    saveStoredCurrentUserId(userId);
    setCurrentScreen('home');

    const usr = users.find(u => u.id === userId) || TEST_ROLES.find(t => t.id === userId);
    if (usr) {
      setSystemNotification({
        title: "Авторизация пройдена",
        text: `Добро пожаловать в приложение, ${usr.name}! Номер телефона успешно подтвержден.`
      });
      setTimeout(() => setSystemNotification(null), 3500);
    }
  };

  const handleRegisterUser = (
    name: string,
    phone: string,
    village: string,
    age?: number,
    whoInstalled?: string,
    primaryGoal?: string,
    isSimplifiedMode?: boolean,
    skills: string[] = [],
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
  ) => {
    const newId = `user_${Date.now()}`;
    const skillsData = getProfileSkillsData(skills);
    
    let referredById: string | undefined = undefined;
    if (referralCode) {
      const cleaned = referralCode.trim().toUpperCase();
      const referrer = users.find(u => u.referrals?.code?.toUpperCase() === cleaned);
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const newUser: UserProfile = {
      id: newId,
      name,
      phone,
      village,
      location: location || {
        country: 'Россия',
        region: 'Архангельская область',
        district: 'Устьянский район',
        village: village
      },
      regionCode: regionCode || 'RU-ARK',
      districtCode: districtCode || 'UST',
      villageCode: villageCode || 'CUSTOM',
      skills,
      thanksCount: 5,
      createdCount: 0,
      resolvedCount: 0,
      blocked: false,
      reportsCount: 0,
      age,
      whoInstalled,
      primaryGoal,
      isSimplifiedMode,
      role: 'user',
      roles: skillsData.roles,
      categories: skillsData.categories,
      skillNames: skillsData.skillNames,
      referrals: {
        code: `UST-${Math.floor(1000 + Math.random() * 9000)}-${Array.from({ length: 3 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]).join('')}`,
        referredBy: referredById,
        total: 0,
        totalEarnedPoints: 0,
        history: []
      }
    };

    let updatedUsers = [...users, newUser];
    if (referredById) {
      updatedUsers = processReferralAwards(updatedUsers, newUser);
    }

    setUsers(updatedUsers);
    saveStoredUsers(updatedUsers);

    if (!isOffline) {
      dbCreateUserProfile(newUser);
      if (referredById) {
        const updatedReferrer = updatedUsers.find(u => u.id === referredById);
        if (updatedReferrer) {
          dbUpdateUserProfile(referredById, {
            thanksCount: updatedReferrer.thanksCount,
            referrals: updatedReferrer.referrals
          }).catch(err => console.warn("Error updating referrer in DB:", err));
        }
      }
    }

    handleLoginSuccess(newId);
  };

  // Offline connection toggler
  const handleOfflineToggle = () => {
    const nextOffline = !isOffline;
    setIsOffline(nextOffline);

    // Sync actual Firestore network state with simulated offline state
    if (nextOffline) {
      disableNetwork(db).catch((err) => console.warn("Firestore disableNetwork warning:", err));
    } else {
      enableNetwork(db).catch((err) => console.warn("Firestore enableNetwork warning:", err));
    }

    if (!nextOffline && offlineQueue.length > 0) {
      // Synchronize queue when going online
      setSystemNotification({
        title: "Соединение восстановлено",
        text: `Синхронизация данных: Опубликовано ${offlineQueue.length} накопленных объявлений/сообщений!`
      });

      // Process and merge offline actions
      let updatedRequests = [...requests];
      let updatedChats = [...chats];
      let updatedMessages = [...messages];

      offlineQueue.forEach(action => {
        if (action.type === 'create_request') {
          const reqPayload = action.payload;
          const newRequest: HelpRequest = {
            id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            title: reqPayload.title,
            category: reqPayload.category,
            description: reqPayload.description,
            photos: reqPayload.photos || [],
            authorId: currentUserId,
            authorName: currentUser.name,
            authorPhone: currentUser.phone,
            authorRating: currentUser.thanksCount,
            village: reqPayload.village,
            locationDetails: reqPayload.locationDetails || '',
            createdAt: action.timestamp,
            active: true,
            reportsCount: 0
          };
          updatedRequests.unshift(newRequest);
          
          // Increment created count of user
          setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, createdCount: u.createdCount + 1 } : u));

          // Sync to Firestore
          dbCreateHelpRequest(newRequest);
          dbUpdateUserProfile(currentUserId, { createdCount: currentUser.createdCount + 1 });
        } else if (action.type === 'send_message') {
          const msgPayload = action.payload;
          const newMessage: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            chatId: msgPayload.chatId,
            senderId: currentUserId,
            senderName: currentUser.name,
            text: msgPayload.text,
            createdAt: action.timestamp
          };
          updatedMessages.push(newMessage);

          // Update last message in chat
          updatedChats = updatedChats.map(c => {
            if (c.id === msgPayload.chatId) {
              const updates = {
                lastMessageText: msgPayload.text,
                lastMessageTime: action.timestamp
              };
              dbUpdateChat(msgPayload.chatId, updates);
              return {
                ...c,
                ...updates
              };
            }
            return c;
          });

          // Sync to Firestore
          dbSendMessage(msgPayload.chatId, newMessage);
        }
      });

      setRequests(updatedRequests);
      setChats(updatedChats);
      setMessages(updatedMessages);
      setOfflineQueue([]); // Clear queue

      setTimeout(() => setSystemNotification(null), 4000);
    } else {
      setSystemNotification({
        title: nextOffline ? "Автономный режим активирован" : "Сеть доступна",
        text: nextOffline 
          ? "Все действия будут кэшироваться локально и синхронизируются при появлении связи."
          : "Приложение работает в штатном режиме реального времени."
      });
      setTimeout(() => setSystemNotification(null), 3000);
    }
  };

  // Submit help request
  const handleCreateRequest = (reqData: any) => {
    if (isOffline) {
      // Save to offline queue (4.1)
      const offlineAction: OfflineAction = {
        type: 'create_request',
        payload: reqData,
        timestamp: new Date().toISOString()
      };
      setOfflineQueue([...offlineQueue, offlineAction]);
      return;
    }

    // Normal online publish
    const newRequest: HelpRequest = {
      id: `req_${Date.now()}`,
      title: reqData.title,
      category: reqData.category,
      description: reqData.description,
      photos: reqData.photos || [],
      authorId: currentUserId,
      authorName: currentUser.name,
      authorPhone: currentUser.phone,
      authorRating: currentUser.thanksCount,
      village: reqData.village,
      locationDetails: reqData.locationDetails || '',
      createdAt: new Date().toISOString(),
      active: true,
      reportsCount: 0,
      offeredPrice: reqData.offeredPrice || 'Бесплатно, по-соседски',
      offeredPriceType: reqData.offeredPriceType || 'free',
      counterOffers: []
    };

    setRequests([newRequest, ...requests]);
    
    // Update user stats
    setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, createdCount: u.createdCount + 1 } : u));

    // Firestore writes
    dbCreateHelpRequest(newRequest);
    dbUpdateUserProfile(currentUserId, { createdCount: currentUser.createdCount + 1 });

    setSystemNotification({
      title: "Объявление опубликовано!",
      text: `Ваша просьба "${reqData.title}" добавлена в общую ленту вашего района.`
    });
    setTimeout(() => setSystemNotification(null), 3000);
  };

  // Import requests from Google Sheets (Module 9.6)
  const handleImportRequests = (imported: HelpRequest[]) => {
    if (!isOffline) {
      imported.forEach(req => {
        dbCreateHelpRequest(req);
      });
    } else {
      imported.forEach(req => {
        const offlineAction: OfflineAction = {
          type: 'create_request',
          payload: {
            title: req.title,
            category: req.category,
            description: req.description,
            village: req.village,
            locationDetails: req.locationDetails || ''
          },
          timestamp: req.createdAt
        };
        setOfflineQueue(prev => [...prev, offlineAction]);
      });
    }

    setRequests(prev => [...imported, ...prev]);

    setSystemNotification({
      title: "Импорт завершен!",
      text: `Успешно загружено и создано ${imported.length} новых заявок из Google Таблицы.`
    });
    setTimeout(() => setSystemNotification(null), 4000);
  };

  // Respond to Help Request / Start Chat (Module 4 Core)
  const handleRespondToRequest = (req: HelpRequest) => {
    if (req.authorId === currentUserId) {
      alert("Вы не можете откликнуться на собственное объявление!");
      return;
    }

    const author = users.find(u => u.id === req.authorId);
    const authorPhone = author ? author.phone : "+7 (921) 123-45-67";

    setPhoneResponseData({ req, phone: authorPhone });
    setShowPhoneResponseModal(true);
  };

  // Proactive direct helper chat initiation from Skills Catalog (3.5.2)
  const handleStartDirectChat = (helper: UserProfile) => {
    // Check if direct chat already exists
    let existingDirect = chats.find(c => c.postId === 'direct' && c.authorId === currentUserId && c.responderId === helper.id);
    
    if (!existingDirect) {
      const newChatId = `chat_${Date.now()}`;
      const newChat: Chat = {
        id: newChatId,
        postId: "direct",
        postTitle: `Прямой запрос к мастеру: ${SKILLS_LIST.find(s => helper.skills?.includes(s.id))?.name || "Помощник"}`,
        postCategory: "other",
        authorId: currentUserId,
        responderId: helper.id,
        lastMessageText: "Прямое обращение",
        lastMessageTime: new Date().toISOString(),
        unreadCountAuthor: 0,
        unreadCountResponder: 1,
        resolved: false,
        ratingGivenByAuthor: false,
        ratingGivenByResponder: false
      };

      const firstMsg: Message = {
        id: `msg_${Date.now()}`,
        chatId: newChatId,
        senderId: currentUserId,
        senderName: currentUser.name,
        text: `Здравствуйте, ${helper.name}! Я нашел вас в Каталоге умений как мастера. Нужна ваша профессиональная помощь!`,
        createdAt: new Date().toISOString()
      };

      setChats([newChat, ...chats]);
      setMessages([...messages, firstMsg]);
      setActiveChatId(newChatId);

      // Sync to Firestore
      if (!isOffline) {
        dbCreateChat(newChat);
        dbSendMessage(newChatId, firstMsg);
      }
    } else {
      setActiveChatId(existingDirect.id);
    }
    setCurrentScreen('chat');
  };

  // Send message inside chat
  const handleSendMessage = (chatId: string, text: string, customSenderId?: string, customSenderName?: string) => {
    const senderId = customSenderId || currentUserId;
    const senderName = customSenderName || (currentUser ? currentUser.name : "Пользователь");

    if (isOffline) {
      // Save message to offline queue
      const offlineAction: OfflineAction = {
        type: 'send_message',
        payload: { chatId, text, senderId, senderName },
        timestamp: new Date().toISOString()
      };
      setOfflineQueue([...offlineQueue, offlineAction]);
      
      // Push message into temporary state so they see it instantly in chat
      const tempMsg: Message = {
        id: `msg_temp_${Date.now()}`,
        chatId,
        senderId,
        senderName,
        text: text,
        createdAt: new Date().toISOString()
      };
      setMessages([...messages, tempMsg]);
      return;
    }

    // Normal message send
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId,
      senderName,
      text,
      createdAt: new Date().toISOString()
    };

    setMessages([...messages, newMsg]);

    // Update last message metadata in chats
    const updatedChats = chats.map(c => {
      if (c.id === chatId) {
        const isSenderAuthor = c.authorId === senderId;
        const updates = {
          lastMessageText: text,
          lastMessageTime: new Date().toISOString(),
          unreadCountAuthor: isSenderAuthor ? c.unreadCountAuthor : c.unreadCountAuthor + 1,
          unreadCountResponder: isSenderAuthor ? c.unreadCountResponder + 1 : c.unreadCountResponder
        };
        dbUpdateChat(chatId, updates);
        return {
          ...c,
          ...updates
        };
      }
      return c;
    });
    setChats(updatedChats);

    // Sync to Firestore
    dbSendMessage(chatId, newMsg);
  };

  // Resolve request (3.4.3 / 8)
  const handleResolveRequest = (postId: string, chatId: string) => {
    // 1. Archive the request (deactivate it so it vanishes from the feed)
    setRequests(prev => prev.map(r => r.id === postId ? { ...r, active: false } : r));
    
    // 2. Mark chat resolved
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, resolved: true } : c));

    // 3. Increment resolved stats of active user (Ivanov)
    setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, resolvedCount: u.resolvedCount + 1 } : u));

    // Sync to Firestore
    if (!isOffline) {
      dbUpdateHelpRequest(postId, { active: false });
      dbUpdateChat(chatId, { resolved: true });
      dbUpdateUserProfile(currentUserId, { resolvedCount: currentUser.resolvedCount + 1 });
    }

    setSystemNotification({
      title: "Дело успешно закрыто!",
      text: "Пост перемещен в архив. Выберите 'Спасибо', чтобы поблагодарить друг друга!"
    });
    setTimeout(() => setSystemNotification(null), 3000);
  };

  // Give thanks and award "Спасибо" (3.1.3 / 8)
  const handleGiveThanks = (userId: string, count: number, chatId: string, isAuthor: boolean) => {
    // Update target user's thank-you points
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (!isOffline) {
          dbUpdateUserProfile(userId, { thanksCount: u.thanksCount + count });
        }
        return { ...u, thanksCount: u.thanksCount + count };
      }
      return u;
    }));

    // Update rating flags in Chat metadata
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const updates = {
          ratingGivenByAuthor: isAuthor ? true : c.ratingGivenByAuthor,
          ratingGivenByResponder: !isAuthor ? true : c.ratingGivenByResponder
        };
        if (!isOffline) {
          dbUpdateChat(chatId, updates);
        }
        return {
          ...c,
          ...updates
        };
      }
      return c;
    }));
  };

  // Submit report/complaint (3.6.2)
  const handleReportSubmit = (targetId: string, type: 'post' | 'user', reason: string) => {
    const newComplaint: Complaint = {
      id: `complaint_${Date.now()}`,
      targetId,
      targetType: type,
      reporterId: currentUserId,
      reporterName: currentUser.name,
      reason,
      createdAt: new Date().toISOString(),
      resolved: false
    };

    setComplaints([newComplaint, ...complaints]);

    // Increment reports counts
    if (type === 'post') {
      setRequests(prev => prev.map(r => r.id === targetId ? { ...r, reportsCount: r.reportsCount + 1 } : r));
      if (!isOffline) {
        const trg = requests.find(r => r.id === targetId);
        if (trg) {
          dbUpdateHelpRequest(targetId, { reportsCount: trg.reportsCount + 1 });
        }
      }
    } else {
      setUsers(prev => prev.map(u => u.id === targetId ? { ...u, reportsCount: u.reportsCount + 1 } : u));
      if (!isOffline) {
        const trg = users.find(u => u.id === targetId);
        if (trg) {
          dbUpdateUserProfile(targetId, { reportsCount: trg.reportsCount + 1 });
        }
      }
    }

    if (!isOffline) {
      dbCreateComplaint(newComplaint);
    }
  };

  // Admin action: delete help request (3.6.1)
  const handleDeleteRequest = (requestId: string) => {
    // Remove completely or mark inactive
    setRequests(prev => prev.filter(r => r.id !== requestId));
    if (!isOffline) {
      dbDeleteHelpRequest(requestId);
    }
    setSystemNotification({
      title: "Администрирование",
      text: `Пост с ID ${requestId} успешно удален за нарушения.`
    });
    setTimeout(() => setSystemNotification(null), 3000);
  };

  // Admin action: block user (3.6.1)
  const handleBlockUser = (userId: string) => {
    let nextBlocked = false;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        nextBlocked = !u.blocked;
        if (!isOffline) {
          dbUpdateUserProfile(userId, { blocked: nextBlocked });
        }
        return { ...u, blocked: nextBlocked };
      }
      return u;
    }));

    const updatedUser = users.find(u => u.id === userId);
    const actionText = nextBlocked ? "Заблокирован" : "Разблокирован";
    
    setSystemNotification({
      title: "Администрирование",
      text: `Житель ${updatedUser?.name} был успешно ${actionText.toLowerCase()}.`
    });
    setTimeout(() => setSystemNotification(null), 3000);
  };

  // Admin action: resolve complaint (3.6.1)
  const handleResolveComplaint = (complaintId: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        if (!isOffline) {
          dbUpdateComplaint(complaintId, { resolved: true });
        }
        return { ...c, resolved: true };
      }
      return c;
    }));
  };

  // Admin action: resolve delivery dispute
  const handleResolveDispute = async (disputeId: string, resolution: 'resolved_refund' | 'resolved_no_refund' | 'resolved_fine', comment: string) => {
    await dbUpdateDispute(disputeId, { status: resolution, resolutionComment: comment });
    
    const dispute = disputes.find(d => d.id === disputeId);
    if (!dispute) return;
    
    // update order disputed status flag
    await dbUpdateOrder(dispute.orderId, { isDisputed: true, status: 'cancelled' }); // set to cancelled to simulate refund
    
    if (resolution === 'resolved_fine') {
      const ent = entrepreneurs.find(e => e.id === dispute.entrepreneurId);
      if (ent) {
        const warnings = (ent.warningsCount || 0) + 1;
        const currentFines = (ent.fines || 0) + 1000;
        const newBalance = (ent.balance || 0) - 1000;
        
        let newStatus: 'green' | 'yellow' | 'red' = ent.status || 'green';
        if (warnings >= 3) {
          newStatus = 'red';
          const usr = users.find(u => u.id === ent.userId);
          if (usr) {
            await dbUpdateUserProfile(usr.id, { blocked: true });
            // also trigger state update
            setUsers(prev => prev.map(u => u.id === usr.id ? { ...u, blocked: true } : u));
          }
        } else {
          newStatus = 'yellow';
        }
        
        await dbUpdateEntrepreneur(ent.id, {
          warningsCount: warnings,
          fines: currentFines,
          balance: newBalance,
          status: newStatus
        });
      }
    }
  };

  // Transport operations handlers
  const handleCreateRoute = (route: BusRoute) => {
    setRoutes(prev => [route, ...prev]);
    if (!isOffline) dbCreateRoute(route);
  };

  const handleUpdateRoute = (routeId: string, updates: Partial<BusRoute>) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, ...updates } : r));
    if (!isOffline) dbUpdateRoute(routeId, updates);
  };

  const handleDeleteRoute = (routeId: string) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId));
    if (!isOffline) dbDeleteRoute(routeId);
  };

  const handleCreateRideOffer = (offer: RideOffer) => {
    setRideOffers(prev => [offer, ...prev]);
    if (!isOffline) dbCreateRideOffer(offer);
  };

  const handleUpdateRideOffer = (offerId: string, updates: Partial<RideOffer>) => {
    setRideOffers(prev => prev.map(o => o.id === offerId ? { ...o, ...updates } : o));
    if (!isOffline) dbUpdateRideOffer(offerId, updates);
  };

  const handleDeleteRideOffer = (offerId: string) => {
    setRideOffers(prev => prev.filter(o => o.id !== offerId));
    if (!isOffline) dbDeleteRideOffer(offerId);
  };

  const handleCreateRideRequest = (request: RideRequest) => {
    setRideRequests(prev => [request, ...prev]);
    if (!isOffline) dbCreateRideRequest(request);
  };

  const handleUpdateRideRequest = (requestId: string, updates: Partial<RideRequest>) => {
    setRideRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updates } : r));
    if (!isOffline) dbUpdateRideRequest(requestId, updates);
  };

  const handleDeleteRideRequest = (requestId: string) => {
    setRideRequests(prev => prev.filter(r => r.id !== requestId));
    if (!isOffline) dbDeleteRideRequest(requestId);
  };

  const handleCreateRoadReport = (report: RoadReport) => {
    setRoadReports(prev => [report, ...prev]);
    if (!isOffline) dbCreateRoadReport(report);
  };

  const handleCreateRideReview = (review: RideReview) => {
    setRideReviews(prev => [review, ...prev]);
    if (!isOffline) dbCreateRideReview(review);
  };

  // Admin action: assign / update user roles (Main Admin and Village Admin)
  const handleUpdateUserRole = (userId: string, role: 'main_admin' | 'village_admin' | 'user', villageName?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        if (!isOffline) {
          dbUpdateUserProfile(userId, {
            role: role,
            adminVillage: role === 'village_admin' ? villageName : undefined
          });
        }
        return {
          ...u,
          role: role,
          adminVillage: role === 'village_admin' ? villageName : undefined
        };
      }
      return u;
    }));

    const targetUser = users.find(u => u.id === userId);
    let actionDetail = "";
    if (role === 'main_admin') {
      actionDetail = "назначен Главным администратором района";
    } else if (role === 'village_admin') {
      actionDetail = `назначен Администратором поселения ${villageName}`;
    } else {
      actionDetail = "разжалован (возвращен статус обычного жителя)";
    }

    setSystemNotification({
      title: "Администрирование ролей",
      text: `Житель ${targetUser?.name || 'пользователь'} успешно ${actionDetail}.`
    });
    setTimeout(() => setSystemNotification(null), 4000);
  };

  const handleUpdateUserDev = (userId: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (!isOffline) {
      dbUpdateUserProfile(userId, updates);
    }
  };

  const handleClearCacheDev = () => {
    localStorage.removeItem('ustyany_dev_unlocked');
    setSystemNotification({
      title: "Сброс кэша консоли",
      text: "Кэш разблокировки панели разработчика был успешно сброшен."
    });
    setTimeout(() => setSystemNotification(null), 3000);
    setCurrentScreen('home');
  };

  const handleResetDatabaseDev = () => {
    if (window.confirm("Вы уверены, что хотите полностью сбросить локальную базу и Firestore (симуляцию)? Это сотрет все измененные профили, объявления, чаты и заказы.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Filter requests of blocked users (Module 6 security)
  const visibleRequests = useMemo(() => {
    // Get list of blocked user IDs
    const blockedIds = users.filter(u => u.blocked).map(u => u.id);
    return requests.filter(r => !blockedIds.includes(r.authorId));
  }, [requests, users]);

  const theme = useTheme(currentUser);

  const themeStyles = useMemo(() => {
    return {
      '--brand-dark': theme.primary,
      '--brand-medium': theme.secondary,
      '--brand-light': theme.accent,
      '--brand-bg': theme.background,
      '--brand-accent': theme.accent,
      
      '--color-primary': theme.primary,
      '--color-secondary': theme.secondary,
      '--color-background': theme.background,
      '--color-text': theme.text,
      '--color-card': theme.card,
      '--font-size-base': theme.fontSize || '14px',
      '--font-family': theme.fontFamily || 'Inter, sans-serif',
      '--border-radius': theme.borderRadius || '4px',
      '--shadow-size': theme.shadowSize || '0 1px 3px rgba(0,0,0,0.1)',
    } as React.CSSProperties;
  }, [theme]);

  if (viewMode === 'pwa_mvp') {
    return (
      <div className="relative">
        <PwaApp />
        {/* Discrete switch to legacy laboratory for full review */}
        <div className="fixed bottom-1.5 left-2 z-40">
          <button
            onClick={() => setViewMode('legacy')}
            className="text-[10px] text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs transition-all"
            title="Перейти к расширенному лабораторному стенду со всеми прототипами"
          >
            ⚙️ Лаборатория всех модулей
          </button>
        </div>
      </div>
    );
  }

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, isAdmin, isDeveloper }}>
      <div 
        className={`min-h-screen bg-slate-bg flex flex-col justify-between font-sans text-slate-800 transition-all duration-300 ${theme.themeClass || ''} ${isCozyTheme ? 'theme-cozy' : ''}`}
        style={themeStyles}
        id="app_root_wrapper"
      >
      {/* Return to MVP top banner */}
      <div className="bg-emerald-800 text-white text-xs px-4 py-2 flex items-center justify-between z-50">
        <span className="font-medium">🛠️ Режим расширенной лаборатории (все прототипы)</span>
        <button
          onClick={() => setViewMode('pwa_mvp')}
          className="bg-white text-emerald-950 font-bold px-3 py-1 rounded text-xs hover:bg-emerald-50 transition-colors"
        >
          ← Вернуться в боевое PWA (MVP)
        </button>
      </div>
      
      {/* 1. Header with simulation toolset and offline triggers */}
      {currentScreen !== 'auth' && (
        <Header
          currentUserId={currentUserId}
          users={users}
          onUserChange={handleUserChange}
          isOffline={isOffline}
          onOfflineToggle={handleOfflineToggle}
          pendingQueueCount={offlineQueue.length}
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          unreadCount={totalUnreadMessages}
          onToggleSimplifiedMode={(enabled) => {
            setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, isSimplifiedMode: enabled } : u));
            if (!isOffline) {
              dbUpdateUserProfile(currentUserId, { isSimplifiedMode: enabled });
            }
          }}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          isCozyTheme={isCozyTheme}
          onToggleCozyTheme={handleToggleCozyTheme}
          onOpenRuStorePublish={() => setShowRuStoreModal(true)}
        />
      )}

      {/* Real-time Simulator Toast notifications banner */}
      {systemNotification && (
        <div className="bg-brand-dark border-b border-brand-medium text-brand-bg px-4 py-3 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-medium animate-ping"></span>
          <div>
            <strong className="text-white">{systemNotification.title}:</strong> {systemNotification.text}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-12 bg-slate-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18 }}
          >
            {/* 1. Sign In Phone flow */}
            {currentScreen === 'auth' && (
              <AuthScreen
                users={users}
                onLoginSuccess={handleLoginSuccess}
                onRegisterUser={handleRegisterUser}
              />
            )}

            {currentScreen !== 'auth' && !isScreenAllowed ? (
              <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200/80 rounded-3xl text-center shadow-lg animate-fadeIn">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield size={28} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Доступ ограничен</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                  У вашей текущей роли (<span className="font-extrabold text-slate-800 uppercase">{currentRole}</span>) нет прав для просмотра этого раздела. Используйте меню «Сменить роль» в шапке, чтобы переключить уровень доступа.
                </p>
                <button 
                  onClick={() => setCurrentScreen('home')} 
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all animate-pulse"
                >
                  Вернуться на главную
                </button>
              </div>
            ) : currentScreen !== 'auth' && isScreenGated ? (
              <GatedModulePlaceholder
                currentScreen={currentScreen}
                currentUser={currentUser}
                activeRegion={activeRegion}
                onNavigate={setCurrentScreen}
                onUpdateRegion={(updated) => handleUpdateRegion(updated.id, updated)}
              />
            ) : currentScreen !== 'auth' && currentScreen === 'home' ? (
              <DashboardScreen
                currentUser={currentUser}
                onNavigate={setCurrentScreen}
                onToggleSimplifiedMode={(enabled) => {
                  setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, isSimplifiedMode: enabled } : u));
                  if (!isOffline) {
                    dbUpdateUserProfile(currentUserId, { isSimplifiedMode: enabled });
                  }
                }}
                onLogout={handleLogout}
                unreadCount={totalUnreadMessages}
                pages={pages}
                isCozyTheme={isCozyTheme}
                onUpdateUser={(updatedUser) => {
                  setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                  if (!isOffline) {
                    dbUpdateUserProfile(updatedUser.id, updatedUser);
                  }
                }}
                entrepreneurs={entrepreneurs}
                activeRegion={activeRegion}
                regions={regions}
                onUpdateRegion={(updated) => handleUpdateRegion(updated.id, updated)}
              />
            ) : currentScreen !== 'auth' ? (
              <>
                {/* 2. Unified Help Nearby Screen (Помощь рядом: Просьбы, Услуги, Добрые дела) */}
                {(currentScreen === 'help_nearby' || currentScreen === 'lenta' || currentScreen === 'skills' || currentScreen === 'good_deeds' || currentScreen === 'deepseek') && (
                  <HelpNearbyScreen
                    initialTab={
                      currentScreen === 'skills'
                        ? 'services'
                        : (currentScreen === 'good_deeds' || currentScreen === 'deepseek')
                        ? 'completed'
                        : 'requests'
                    }
                    requests={visibleRequests}
                    userVillage={currentUser.village}
                    onRespond={handleRespondToRequest}
                    onSubmitReport={handleReportSubmit}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    currentUser={currentUser}
                    users={users}
                    masters={masters}
                    portfolioItems={portfolioItems}
                    serviceOrders={serviceOrders}
                    masterReviews={masterReviews}
                    onStartDirectChat={handleStartDirectChat}
                    isOffline={isOffline}
                    onCreateRequest={(initialCategory?: string) => {
                      setCreateRequestMode(initialCategory === 'offer' ? 'offer' : 'request');
                      setCurrentScreen('create');
                    }}
                  />
                )}

                {/* 3. Create Request ("Помогите!" или "Предлагаю помощь") */}
                {currentScreen === 'create' && (
                  <CreateRequestScreen
                    currentUserId={currentUserId}
                    authorName={currentUser.name}
                    authorRating={currentUser.thanksCount}
                    userVillage={currentUser.village}
                    isOffline={isOffline}
                    initialMode={createRequestMode}
                    onSubmit={handleCreateRequest}
                    onNavigateToLenta={() => setCurrentScreen('help_nearby')}
                  />
                )}

                {/* 4. Real-time Chatting Panel */}
                {currentScreen === 'chat' && (
                  <ChatScreen
                    currentUserId={currentUserId}
                    currentUser={currentUser}
                    chats={chats}
                    messages={messages}
                    users={users}
                    requests={requests}
                    isOffline={isOffline}
                    onSendMessage={handleSendMessage}
                    onResolveRequest={handleResolveRequest}
                    onGiveThanks={handleGiveThanks}
                    activeChatId={activeChatId}
                    onSelectChat={setActiveChatId}
                  />
                )}

                {/* 5.5. District and Region stats, leaderboards, notices */}
                {currentScreen === 'district' && (
                  <DistrictScreen
                    currentUser={currentUser}
                    users={users}
                    requests={requests}
                    isOffline={isOffline}
                    onBackToHome={() => setCurrentScreen('home')}
                  />
                )}

                {/* 6. Profile screen */}
                {currentScreen === 'profile' && (
                  <ProfileScreen
                    user={currentUser}
                    onUpdateProfile={(updated) => {
                      setUsers(prev => {
                        const updatedUsers = prev.map(u => u.id === currentUserId ? { ...u, ...updated } : u);
                        const updatedUser = updatedUsers.find(u => u.id === currentUserId);
                        if (!updatedUser) return prev;

                        let finalUsers = updatedUsers;
                        if (updatedUser.referrals?.referredBy) {
                          finalUsers = processReferralAwards(updatedUsers, updatedUser);
                          const referrerId = updatedUser.referrals.referredBy;
                          const finalReferrer = finalUsers.find(u => u.id === referrerId);
                          if (finalReferrer && !isOffline) {
                            dbUpdateUserProfile(referrerId, {
                              thanksCount: finalReferrer.thanksCount,
                              referrals: finalReferrer.referrals
                            }).catch(err => console.warn("Error updating referrer:", err));
                          }
                        }

                        saveStoredUsers(finalUsers);
                        return finalUsers;
                      });

                      if (!isOffline) {
                        dbUpdateUserProfile(currentUserId, updated);
                      }
                      // Update username on active requests too
                      if (updated.name) {
                        setRequests(prev => prev.map(r => r.authorId === currentUserId ? { ...r, authorName: updated.name! } : r));
                      }
                    }}
                    onLogout={handleLogout}
                    onOpenGitHubExport={() => setShowGitHubExport(true)}
                    onNavigate={setCurrentScreen}
                  />
                )}

                {/* 6.5. Google Keep Notes screen */}
                {currentScreen === 'notes' && (
                  <KeepNotesScreen
                    currentUser={currentUser}
                    isOffline={isOffline}
                  />
                )}

                {/* 6.6. Google Calendar Screen */}
                {currentScreen === 'calendar' && (
                  <CalendarScreen
                    currentUser={currentUser}
                    requests={requests}
                    chats={chats}
                    isOffline={isOffline}
                  />
                )}



                {/* 6.7. Food Delivery (Module 7) */}
                {currentScreen === 'delivery' && (
                  <DeliveryScreen
                    currentUser={currentUser}
                    isOffline={isOffline}
                    onUpdateUser={(updated) => {
                      setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, ...updated } : u));
                    }}
                    dbCreateOrderHook={dbCreateOrder}
                    dbUpdateOrderHook={dbUpdateOrder}
                    dbCreateReviewHook={dbCreateReview}
                    dbCreateEntrepreneurHook={dbCreateEntrepreneur}
                    dbUpdateEntrepreneurHook={dbUpdateEntrepreneur}
                    currentUserIp={currentUserIp}
                    setCurrentUserIp={setCurrentUserIp}
                    disputes={disputes}
                    fraudAlerts={fraudAlerts}
                    dbCreateDisputeHook={dbCreateDispute}
                    dbCreateFraudAlertHook={dbCreateFraudAlert}
                    onBack={() => setCurrentScreen(currentUser.isSimplifiedMode ? 'lenta' : 'home')}
                  />
                )}

                {/* 6.75. Reviews & Neighbor Gratitude */}
                {currentScreen === 'reviews' && (
                  <ReviewsScreen
                    currentUser={currentUser}
                    users={users}
                    reviews={reviews}
                    rideReviews={rideReviews}
                    masterReviews={masterReviews}
                    isOffline={isOffline}
                    onBack={() => setCurrentScreen(currentUser.isSimplifiedMode ? 'lenta' : 'home')}
                    dbCreateReviewHook={dbCreateReview}
                    dbCreateMasterReviewHook={dbCreateMasterReview}
                    dbCreateRideReviewHook={dbCreateRideReview}
                    dbUpdateUserProfileHook={async (userId, updates) => {
                      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
                      if (!isOffline) {
                        await dbUpdateUserProfile(userId, updates);
                      }
                    }}
                  />
                )}

                {/* 6.78. Analytics & Advertising (Module 10) */}
                {currentScreen === 'analytics' && (
                  <AnalyticsScreen
                    currentUser={currentUser}
                    isOffline={isOffline}
                    onBack={() => setCurrentScreen('home')}
                  />
                )}

                {/* 6.8. Transport Accessibility (Module 8) */}
                {currentScreen === 'transport' && (
                  <TransportScreen
                    currentUser={currentUser}
                    routes={routes}
                    rideOffers={rideOffers}
                    rideRequests={rideRequests}
                    roadReports={roadReports}
                    rideReviews={rideReviews}
                    users={users}
                    isOffline={isOffline}
                    onBack={() => setCurrentScreen(currentUser.isSimplifiedMode ? 'lenta' : 'home')}
                    dbCreateRouteHook={handleCreateRoute}
                    dbUpdateRouteHook={handleUpdateRoute}
                    dbDeleteRouteHook={handleDeleteRoute}
                    dbCreateRideOfferHook={handleCreateRideOffer}
                    dbUpdateRideOfferHook={handleUpdateRideOffer}
                    dbDeleteRideOfferHook={handleDeleteRideOffer}
                    dbCreateRideRequestHook={handleCreateRideRequest}
                    dbUpdateRideRequestHook={handleUpdateRideRequest}
                    dbDeleteRideRequestHook={handleDeleteRideRequest}
                    dbCreateRoadReportHook={handleCreateRoadReport}
                    dbCreateRideReviewHook={handleCreateRideReview}
                  />
                )}

                {/* 6.9. Environmental Safety (Module 9) */}
                {currentScreen === 'ecology' && (
                  <EcologyScreen
                    currentUser={currentUser}
                    onBack={() => setCurrentScreen(currentUser.isSimplifiedMode ? 'lenta' : 'home')}
                    isOffline={isOffline}
                  />
                )}

                {/* 6.10. Google Sheets Integration (Module 9.6) */}
                {currentScreen === 'sheets' && (
                  <SheetsScreen
                    currentUser={currentUser}
                    requests={requests}
                    onImportRequests={handleImportRequests}
                    onBack={() => setCurrentScreen(currentUser.isSimplifiedMode ? 'lenta' : 'home')}
                    isOffline={isOffline}
                  />
                )}



                {/* 6.12. Family Connections & Screen (Module 4) */}
                {currentScreen === 'family' && (
                  <FamilyScreen
                    currentUser={currentUser}
                    users={users}
                    onUpdateUser={(userId, updated) => {
                      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
                      if (!isOffline) {
                        dbUpdateUserProfile(userId, updated);
                      }
                    }}
                    onNavigate={setCurrentScreen}
                  />
                )}

                {/* 7. Moderator/Admin Dashboard (Module 6) */}
                {currentScreen === 'admin' && (currentRole === 'admin' || currentRole === 'developer') && (
                  <AdminPanelScreen
                    requests={requests}
                    users={users}
                    complaints={complaints}
                    currentUser={currentUser}
                    onDeleteRequest={handleDeleteRequest}
                    onBlockUser={handleBlockUser}
                    onResolveComplaint={handleResolveComplaint}
                    onUpdateUserRole={handleUpdateUserRole}
                    disputes={disputes}
                    fraudAlerts={fraudAlerts}
                    entrepreneurs={entrepreneurs}
                    onResolveDispute={handleResolveDispute}
                  />
                )}

                {/* 8. Developer Console Screen */}
                {currentScreen === 'dev_console' && currentRole === 'developer' && (
                  <DeveloperConsole
                    currentUser={currentUser}
                    users={users}
                    requests={requests}
                    chats={chats}
                    entrepreneurs={entrepreneurs}
                    orders={orders}
                    onUpdateUser={handleUpdateUserDev}
                    onUserChange={handleUserChange}
                    onClose={() => setCurrentScreen('home')}
                    onClearCache={handleClearCacheDev}
                    onResetDatabase={handleResetDatabaseDev}
                    currentUserIp={currentUserIp}
                    setCurrentUserIp={setCurrentUserIp}
                    pages={pages}
                    onNavigate={setCurrentScreen}
                    onOpenGitHubExport={() => setShowGitHubExport(true)}
                  />
                )}

                {/* 8.5. About Project Screen */}
                {currentScreen === 'page_about' && (
                  <AboutProjectScreen
                    currentUser={currentUser}
                    onBack={() => setCurrentScreen('home')}
                    isOffline={isOffline}
                    onNavigate={setCurrentScreen}
                  />
                )}

                {/* 8.6. Help and FAQ Screen */}
                {currentScreen === 'faq' && (
                  <FaqScreen
                    currentUser={currentUser}
                    onBack={() => setCurrentScreen('home')}
                    onNavigate={setCurrentScreen}
                  />
                )}

                {/* Digital Literacy School Screen */}
                {currentScreen === 'digital_literacy' && (
                  <DigitalLiteracyScreen
                    currentUser={currentUser}
                    onBack={() => setCurrentScreen('home')}
                    isCozyTheme={isCozyTheme}
                    onUpdateUser={(updated) => {
                      setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, ...updated } : u));
                    }}
                  />
                )}

                {/* Partner Cabinet Screen */}
                {currentScreen === 'partner_cabinet' && (currentRole === 'partner' || currentRole === 'developer') && (
                  <PartnerCabinet
                    currentUser={currentUser}
                    isOffline={isOffline}
                    onNavigate={setCurrentScreen}
                  />
                )}

                {/* DeepSeek AI Assistant Screen */}
                {currentScreen === 'deepseek' && (
                  <DeepSeekScreen
                    currentUser={currentUser}
                    requests={requests}
                    onNavigateToLenta={() => setCurrentScreen('lenta')}
                    isCozyTheme={isCozyTheme}
                    onNavigateToCreatePost={(title, desc) => {
                      if (title || desc) {
                        localStorage.setItem("ustyany_draft_request", JSON.stringify({
                          title: title || '',
                          category: 'wood',
                          description: desc || '',
                          village: currentUser.village,
                          locationDetails: '',
                          photos: []
                        }));
                      }
                      setCurrentScreen('create');
                    }}
                  />
                )}

                {/* Referrals Screen */}
                {currentScreen === 'referrals' && (
                  <ReferralsScreen
                    currentUser={currentUser}
                    users={users}
                    onBack={() => setCurrentScreen(currentUser.isSimplifiedMode ? 'lenta' : 'home')}
                  />
                )}

                {/* Places / Landmarks Map Screen */}
                {currentScreen === 'places' && (
                  <PlacesScreen
                    currentUser={currentUser}
                    onBack={() => setCurrentScreen(currentUser.isSimplifiedMode ? 'lenta' : 'home')}
                    isOffline={isOffline}
                  />
                )}

                {/* Public Control (Civilized Moderation) Screen */}
                {currentScreen === 'public_control' && (
                  <PublicControlScreen
                    currentUser={currentUser}
                    users={users}
                    complaints={complaints}
                    onUpdateUser={(updatedUser) => {
                      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                    }}
                    onCreateComplaint={async (newComplaint) => {
                      setComplaints(prev => [newComplaint, ...prev]);
                      if (!isOffline) {
                        await dbCreateComplaint(newComplaint);
                      }
                    }}
                    onUpdateComplaint={async (complaintId, updates) => {
                      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, ...updates } : c));
                      if (!isOffline) {
                        await dbUpdateComplaint(complaintId, updates);
                      }
                    }}
                  />
                )}

                {/* 10. Interactive Village Digital Archive Screen */}
                {(currentScreen === 'interactive_village' || currentScreen === 'village_archive') && (
                  <InteractiveVillageScreen
                    currentUser={currentUser}
                    onBack={() => setCurrentScreen(currentUser.isSimplifiedMode ? 'lenta' : 'home')}
                  />
                )}

                {/* 9. Dynamic Custom Page Builder Pages */}
                {pages.some(p => p.id === currentScreen) && currentScreen !== 'page_about' && (
                  <div className="bg-slate-50 min-h-screen p-4 md:p-6" id={`custom_page_container_${currentScreen}`}>
                    <div className="bg-white rounded-3xl shadow-md overflow-hidden max-w-4xl mx-auto border border-slate-200">
                      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-sm font-extrabold text-slate-800">{pages.find(p => p.id === currentScreen)?.title}</h2>
                        <button
                          onClick={() => setCurrentScreen('home')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Назад
                        </button>
                      </div>
                      <CustomPageRenderer
                        page={pages.find(p => p.id === currentScreen)!}
                        isDeveloperMode={false}
                        isEditing={false}
                        users={users}
                        requests={requests}
                        entrepreneurs={entrepreneurs}
                        orders={orders}
                        onNavigate={(screen) => {
                          if (screen === 'home' || screen === 'lenta' || screen === 'create' || screen === 'skills' || screen === 'delivery' || screen === 'transport' || screen === 'chat' || screen === 'profile' || screen === 'sos') {
                            setCurrentScreen(screen);
                          } else {
                            setCurrentScreen(screen);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 2. Beautiful responsive bottom Tab Navigation */}
      {currentScreen !== 'auth' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/90 shadow-lg py-2 px-2 z-40 flex justify-around items-center md:sticky md:bottom-auto md:max-w-2xl md:mx-auto md:my-4 md:border md:rounded-2xl md:shadow-sm">
          {/* 1. Главная (Home) */}
          <button
            onClick={() => setCurrentScreen('home')}
            className={`flex flex-col items-center gap-0.5 transition-all py-1 px-3 rounded-xl cursor-pointer ${
              currentScreen === 'home' ? "text-emerald-700 font-extrabold scale-105" : "text-slate-500 hover:text-slate-800"
            }`}
            id="nav_home"
          >
            <Home size={22} className={currentScreen === 'home' ? "stroke-emerald-700 stroke-[2.5]" : "stroke-slate-500"} />
            <span className="text-[10px] sm:text-xs">Главная</span>
          </button>

          {/* 2. Помощь рядом (Help Nearby) */}
          <button
            onClick={() => setCurrentScreen('help_nearby')}
            className={`flex flex-col items-center gap-0.5 transition-all py-1 px-3 rounded-xl cursor-pointer ${
              (currentScreen === 'help_nearby' || currentScreen === 'lenta' || currentScreen === 'skills' || currentScreen === 'good_deeds' || currentScreen === 'create') ? "text-emerald-700 font-extrabold scale-105" : "text-slate-500 hover:text-slate-800"
            }`}
            id="nav_help_nearby"
          >
            <HandHeart size={22} className={(currentScreen === 'help_nearby' || currentScreen === 'lenta' || currentScreen === 'skills' || currentScreen === 'good_deeds' || currentScreen === 'create') ? "stroke-emerald-700 stroke-[2.5]" : "stroke-slate-500"} />
            <span className="text-[10px] sm:text-xs">Помощь</span>
          </button>

          {/* 3. Сообщения / Чат */}
          <button
            onClick={() => setCurrentScreen('chat')}
            className={`flex flex-col items-center gap-0.5 transition-all py-1 px-3 rounded-xl relative cursor-pointer ${
              currentScreen === 'chat' ? "text-blue-600 font-extrabold scale-105" : "text-slate-500 hover:text-slate-800"
            }`}
            id="nav_chat"
          >
            {totalUnreadMessages > 0 && (
              <span className="absolute top-0 right-2 bg-red-600 text-white font-mono text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                {totalUnreadMessages}
              </span>
            )}
            <MessageSquare size={22} className={currentScreen === 'chat' ? "stroke-blue-600 stroke-[2.5]" : "stroke-slate-500"} />
            <span className="text-[10px] sm:text-xs">Сообщения</span>
          </button>

          {/* 4. Цифровая грамотность */}
          <button
            onClick={() => setCurrentScreen('digital_literacy')}
            className={`flex flex-col items-center gap-0.5 transition-all py-1 px-3 rounded-xl cursor-pointer ${
              currentScreen === 'digital_literacy' ? "text-amber-600 font-extrabold scale-105" : "text-slate-500 hover:text-slate-800"
            }`}
            id="nav_digital_literacy"
          >
            <BookOpen size={22} className={currentScreen === 'digital_literacy' ? "stroke-amber-600 stroke-[2.5]" : "stroke-slate-500"} />
            <span className="text-[10px] sm:text-xs">Грамотность</span>
          </button>

          {/* 5. Профиль */}
          <button
            onClick={() => setCurrentScreen('profile')}
            className={`flex flex-col items-center gap-0.5 transition-all py-1 px-3 rounded-xl cursor-pointer ${
              currentScreen === 'profile' ? "text-purple-600 font-extrabold scale-105" : "text-slate-500 hover:text-slate-800"
            }`}
            id="nav_profile"
          >
            <User size={22} className={currentScreen === 'profile' ? "stroke-purple-600 stroke-[2.5]" : "stroke-slate-500"} />
            <span className="text-[10px] sm:text-xs">Профиль</span>
          </button>
        </nav>
      )}

      {/* Direct Responder Phone Dialog Modal */}
      {showPhoneResponseModal && phoneResponseData && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border-4 border-emerald-500 space-y-5 shadow-2xl text-center my-auto">
            <div>
              <span className="text-4xl">💰</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Отклик на просьбу</h3>
              <p className="text-xs text-slate-500 mt-1">
                Просьба: <strong className="text-slate-700">"{phoneResponseData.req.title}"</strong>
              </p>
            </div>

            {/* Offered Price Header */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                Предложенная цена автором:
              </span>
              <p className="text-base font-black text-emerald-950 flex items-center gap-1.5">
                <span>💰 {phoneResponseData.req.offeredPrice || "Бесплатно, по-соседски"}</span>
              </p>
              <p className="text-[11px] text-slate-600">
                🏡 {phoneResponseData.req.authorName} ({phoneResponseData.req.village}) • <a href={`tel:${phoneResponseData.phone}`} className="text-emerald-700 font-bold underline">{phoneResponseData.phone}</a>
              </p>
            </div>

            {/* Price Actions for Master */}
            <div className="space-y-2 text-left">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Выберите ваше решение по стоимости:
              </p>

              {/* Accept offered price button */}
              <button
                type="button"
                onClick={() => {
                  const req = phoneResponseData.req;
                  setShowPhoneResponseModal(false);

                  // Create or get chat
                  let existingChat = chats.find(c => c.postId === req.id && c.responderId === currentUserId);
                  const msgText = `Здравствуйте! Я согласен с указанной ценой ("${req.offeredPrice || 'Бесплатно, по-соседски'}") и готов выполнить работу по вашей просьбе: "${req.title}".`;
                  
                  if (!existingChat) {
                    const newChatId = `chat_${Date.now()}`;
                    const newChat: Chat = {
                      id: newChatId,
                      postId: req.id,
                      postTitle: req.title,
                      postCategory: req.category,
                      authorId: req.authorId,
                      responderId: currentUserId,
                      lastMessageText: "Согласие с ценой",
                      lastMessageTime: new Date().toISOString(),
                      unreadCountAuthor: 1,
                      unreadCountResponder: 0,
                      resolved: false,
                      ratingGivenByAuthor: false,
                      ratingGivenByResponder: false
                    };
                    const firstMsg: Message = {
                      id: `msg_${Date.now()}`,
                      chatId: newChatId,
                      senderId: currentUserId,
                      senderName: currentUser.name,
                      text: msgText,
                      createdAt: new Date().toISOString()
                    };
                    setChats([newChat, ...chats]);
                    setMessages([...messages, firstMsg]);
                    setActiveChatId(newChatId);
                    if (!isOffline) {
                      dbCreateChat(newChat);
                      dbSendMessage(newChatId, firstMsg);
                    }
                  } else {
                    const firstMsg: Message = {
                      id: `msg_${Date.now()}`,
                      chatId: existingChat.id,
                      senderId: currentUserId,
                      senderName: currentUser.name,
                      text: msgText,
                      createdAt: new Date().toISOString()
                    };
                    setMessages([...messages, firstMsg]);
                    setActiveChatId(existingChat.id);
                    if (!isOffline) dbSendMessage(existingChat.id, firstMsg);
                  }
                  setCurrentScreen('chat');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border border-emerald-500 cursor-pointer"
              >
                <span>✅ Согласиться с ценой ({phoneResponseData.req.offeredPrice || "Бесплатно"})</span>
              </button>

              {/* Toggle counter-offer form */}
              <button
                type="button"
                onClick={() => setShowCounterOfferForm(!showCounterOfferForm)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border border-amber-400 cursor-pointer"
              >
                <span>💬 Предложить свою цену (Контроффер)</span>
              </button>

              {/* Counter-offer form */}
              {showCounterOfferForm && (
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 space-y-2.5 animate-fadeIn mt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">Ваша сумма (в рублях):</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        placeholder="Например: 700"
                        value={counterPriceInput}
                        onChange={(e) => setCounterPriceInput(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold focus:border-amber-600 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-500">₽</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">Комментарий к вашей цене (опционально):</label>
                    <input
                      type="text"
                      placeholder="Например: Учтены расходные материалы и выезд со своим инструментом"
                      value={counterCommentInput}
                      onChange={(e) => setCounterCommentInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!counterPriceInput || parseInt(counterPriceInput, 10) <= 0) {
                        alert("Укажите корректную сумму контрпредложения!");
                        return;
                      }
                      const req = phoneResponseData.req;
                      const customVal = parseInt(counterPriceInput, 10);
                      
                      // Save counter offer on request
                      const newOffer = {
                        id: `offer_${Date.now()}`,
                        masterId: currentUserId,
                        masterName: currentUser.name,
                        price: customVal,
                        comment: counterCommentInput,
                        status: 'pending' as const,
                        createdAt: new Date().toISOString()
                      };
                      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, counterOffers: [...(r.counterOffers || []), newOffer] } : r));

                      setShowPhoneResponseModal(false);
                      setShowCounterOfferForm(false);
                      setCounterPriceInput('');
                      setCounterCommentInput('');

                      const msgText = `Здравствуйте! Я готов помочь по вашей просьбе "${req.title}", но предлагаю свою цену: ${customVal} ₽. ${counterCommentInput ? 'Комментарий: ' + counterCommentInput : ''}`;

                      let existingChat = chats.find(c => c.postId === req.id && c.responderId === currentUserId);
                      if (!existingChat) {
                        const newChatId = `chat_${Date.now()}`;
                        const newChat: Chat = {
                          id: newChatId,
                          postId: req.id,
                          postTitle: req.title,
                          postCategory: req.category,
                          authorId: req.authorId,
                          responderId: currentUserId,
                          lastMessageText: `Предложена цена ${customVal} ₽`,
                          lastMessageTime: new Date().toISOString(),
                          unreadCountAuthor: 1,
                          unreadCountResponder: 0,
                          resolved: false,
                          ratingGivenByAuthor: false,
                          ratingGivenByResponder: false
                        };
                        const firstMsg: Message = {
                          id: `msg_${Date.now()}`,
                          chatId: newChatId,
                          senderId: currentUserId,
                          senderName: currentUser.name,
                          text: msgText,
                          createdAt: new Date().toISOString()
                        };
                        setChats([newChat, ...chats]);
                        setMessages([...messages, firstMsg]);
                        setActiveChatId(newChatId);
                        if (!isOffline) {
                          dbCreateChat(newChat);
                          dbSendMessage(newChatId, firstMsg);
                        }
                      } else {
                        const firstMsg: Message = {
                          id: `msg_${Date.now()}`,
                          chatId: existingChat.id,
                          senderId: currentUserId,
                          senderName: currentUser.name,
                          text: msgText,
                          createdAt: new Date().toISOString()
                        };
                        setMessages([...messages, firstMsg]);
                        setActiveChatId(existingChat.id);
                        if (!isOffline) dbSendMessage(existingChat.id, firstMsg);
                      }
                      setCurrentScreen('chat');
                    }}
                    className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-black transition-all"
                  >
                    Отправить контрпредложение
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {/* Giant Direct Call Button */}
              <a
                href={`tel:${phoneResponseData.phone}`}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-200"
              >
                <span>📞 Позвонить по сотовой связи ({phoneResponseData.phone})</span>
              </a>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowPhoneResponseModal(false);
                  setShowCounterOfferForm(false);
                }}
                className="w-full text-slate-400 hover:text-slate-600 font-bold text-xs py-1 transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Export Modal Component */}
      {showGitHubExport && (
        <ExportToGitHubScreen
          currentUser={currentUser}
          onClose={() => setShowGitHubExport(false)}
        />
      )}

      {/* RuStore Publish Modal Component */}
      <RuStorePublishModal
        isOpen={showRuStoreModal || currentScreen === 'rustore_publish'}
        onClose={() => {
          setShowRuStoreModal(false);
          if (currentScreen === 'rustore_publish') {
            setCurrentScreen('home');
          }
        }}
        currentUser={currentUser}
      />
    </div>
  </RoleContext.Provider>
  );
}
