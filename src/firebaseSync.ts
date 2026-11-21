import { 
  collection, doc, setDoc, getDocs, updateDoc, deleteDoc, onSnapshot, getDoc, query, orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './firebase';
import { UserProfile, HelpRequest, Chat, Message, Complaint, Entrepreneur, Order, Review, BusRoute, RideOffer, RideRequest, RoadReport, RideReview, Dispute, FraudAlert, Master, PortfolioItem, ServiceOrder, MasterReview, Page, PageHistory, PageTemplate, EcoPoint, EcoReport, EcoEvent, EcoStats, Appeal, AppealVote, AppealComment, ProjectStats, ProjectReview, Partner, License, Contract, FranchiseLead, Place, PlaceReview, Region, InteractiveVillage, VillageHouse, VillageResident, VillageFamilyTree } from './types';
import { INITIAL_USERS, INITIAL_REQUESTS, INITIAL_ENTREPRENEURS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_ROUTES, INITIAL_RIDE_OFFERS, INITIAL_RIDE_REQUESTS, INITIAL_ROAD_REPORTS, INITIAL_RIDE_REVIEWS, INITIAL_MASTERS, INITIAL_PORTFOLIO_ITEMS, INITIAL_MASTER_REVIEWS } from './mockData';
import { INITIAL_VILLAGES, INITIAL_HOUSES, INITIAL_RESIDENTS, INITIAL_FAMILY_TREES } from './data/villageArchiveData';
import { TEST_ROLES } from './constants/testRoles';

// Seeding logic to populate Firestore database on first run
export async function seedDatabaseIfEmpty() {
  try {
    const pagesSnap = await getDocs(collection(db, 'pages'));
    if (pagesSnap.empty) {
      console.log('Seeding initial Custom Pages to Firestore...');
      const initialPages: Page[] = [
        {
          id: 'page_about',
          title: 'О проекте',
          path: '/about',
          order: 1,
          isActive: true,
          isHome: false,
          settings: {
            backgroundType: 'color',
            backgroundColor: '#f8fafc',
            paddingTop: 24,
            paddingBottom: 24
          },
          widgets: [
            {
              id: 'widget_about_header',
              type: 'header',
              order: 0,
              content: {
                text: 'Добро пожаловать в Взаимопомощь!',
                fontSize: 'h1',
                color: '#0f172a',
                alignment: 'center'
              },
              style: { paddingTop: 10, paddingBottom: 10 }
            },
            {
              id: 'widget_about_text',
              type: 'text',
              order: 1,
              content: {
                text: 'Это единое цифровое пространство для взаимопомощи жителей.\n\nЗдесь вы можете попросить соседей о посильной помощи, предложить свои услуги в качестве мастера, заказать доставку свежих фермерских продуктов или узнать расписание автобусов.',
                alignment: 'left'
              },
              style: { paddingTop: 10, paddingBottom: 15, textColor: '#334155' }
            },
            {
              id: 'widget_about_stats',
              type: 'stats',
              order: 2,
              content: {
                statsType: 'users',
                statsLabel: 'Жителей в сети',
                statsValue: '142'
              },
              style: { paddingTop: 10, paddingBottom: 10 }
            },
            {
              id: 'widget_about_divider',
              type: 'divider',
              order: 3,
              content: {
                dividerThickness: 2,
                dividerColor: '#e2e8f0',
                dividerStyle: 'solid'
              },
              style: { paddingTop: 10, paddingBottom: 10 }
            },
            {
              id: 'widget_about_btn',
              type: 'button',
              order: 4,
              content: {
                text: 'Перейти в Ленту',
                color: '#059669',
                alignment: 'center'
              },
              style: { paddingTop: 10, paddingBottom: 10 },
              action: {
                type: 'navigate',
                target: 'lenta'
              }
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1
        },
        {
          id: 'page_contacts',
          title: 'Система Спасибо',
          path: '/thanks',
          order: 2,
          isActive: true,
          isHome: false,
          settings: {
            backgroundType: 'color',
            backgroundColor: '#f8fafc',
            paddingTop: 24,
            paddingBottom: 24
          },
          widgets: [
            {
              id: 'widget_thanks_header',
              type: 'header',
              order: 0,
              content: {
                text: '💰 СИСТЕМА БАЛЛОВ «СПАСИБО»',
                fontSize: 'h1',
                color: '#10b981',
                alignment: 'center'
              },
              style: { paddingTop: 10, paddingBottom: 10 }
            },
            {
              id: 'widget_thanks_intro',
              type: 'text',
              order: 1,
              content: {
                text: 'Как это работает (объяснение для жителей):',
                alignment: 'center'
              },
              style: { paddingTop: 5, paddingBottom: 10, textColor: '#4b5563' }
            },
            {
              id: 'widget_thanks_explanation',
              type: 'text',
              order: 2,
              content: {
                text: '«Что такое баллы «Спасибо» и зачем они нужны? Каждый раз, когда вы помогаете соседу или получаете благодарность, вам начисляются баллы «Спасибо». Это наш способ сказать, что мы ценим вашу доброту и активность.\n\nПочему баллы важны?\nВ будущем, когда приложение станет популярным и начнёт приносить реальный доход, каждый балл «Спасибо» будет равен 1 рублю. Это значит, что вы сможете обменять накопленные баллы на реальные деньги или услуги.\n\nКогда это произойдёт?\nКогда количество установок приложения достигнет 10 000 (или другой порог), мы запустим программу обмена баллов на реальные деньги. До этого момента баллы копятся и не сгорают.\n\nПочему мы не платим сейчас?\nПотому что пока приложение не приносит дохода, мы не можем платить из своего кармана. Но как только приложение станет популярным — мы запустим обмен.\n\nЧто делать сейчас?\nУстанавливайте приложение, проходите обучение, помогайте соседям и копите баллы. У вас есть реальный шанс быть первыми, кто заработает на этом приложении!»',
                alignment: 'left'
              },
              style: { paddingTop: 15, paddingBottom: 15, textColor: '#1f2937' }
            },
            {
              id: 'widget_thanks_divider',
              type: 'divider',
              order: 3,
              content: {
                dividerThickness: 2,
                dividerColor: '#e2e8f0',
                dividerStyle: 'dashed'
              },
              style: { paddingTop: 10, paddingBottom: 10 }
            },
            {
              id: 'widget_thanks_why_header',
              type: 'header',
              order: 4,
              content: {
                text: '🏆 «Почему мы не платим прямо сейчас?»',
                fontSize: 'h2',
                color: '#0f172a',
                alignment: 'center'
              },
              style: { paddingTop: 10, paddingBottom: 10 }
            },
            {
              id: 'widget_thanks_why_details',
              type: 'text',
              order: 5,
              content: {
                text: 'Многие спрашивают: «Почему вы не даёте деньги за «Спасибо» сразу?»\n\nОтвет прост:\nМы — разработчики, а не спонсоры. Мы создали приложение, чтобы помочь жителям всей страны наладить добрососедские отношения. Мы не получаем прибыль от приложения, пока оно не станет популярным.\n\nКогда мы начнём платить?\nКогда количество установок достигнет 10 000. Это покажет, что приложение действительно нужно людям, и мы сможем привлекать рекламодателей и партнёров, которые готовы платить за развитие.\n\nЧто делать сейчас?\n1. Установи приложение\n2. Пройди «Цифровую грамотность»\n3. Помогай соседям\n4. Копи «Спасибо»\n\nТы — первопроходец. У тебя есть реальный шанс заработать, пока другие ещё не знают о приложении. 🚀',
                alignment: 'left'
              },
              style: { paddingTop: 15, paddingBottom: 25, textColor: '#1f2937' }
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 2
        }
      ];
      for (const p of initialPages) {
        await setDoc(doc(db, 'pages', p.id), p);
      }
    } else {
      // Force update page_contacts to Sistema Spasibo page so it propagates live
      const thanksPage: Page = {
        id: 'page_contacts',
        title: 'Система Спасибо',
        path: '/thanks',
        order: 2,
        isActive: true,
        isHome: false,
        settings: {
          backgroundType: 'color',
          backgroundColor: '#f8fafc',
          paddingTop: 24,
          paddingBottom: 24
        },
        widgets: [
          {
            id: 'widget_thanks_header',
            type: 'header',
            order: 0,
            content: {
              text: '💰 СИСТЕМА БАЛЛОВ «СПАСИБО»',
              fontSize: 'h1',
              color: '#10b981',
              alignment: 'center'
            },
            style: { paddingTop: 10, paddingBottom: 10 }
          },
          {
            id: 'widget_thanks_intro',
            type: 'text',
            order: 1,
            content: {
              text: 'Как это работает (объяснение для жителей):',
              alignment: 'center'
            },
            style: { paddingTop: 5, paddingBottom: 10, textColor: '#4b5563' }
          },
          {
            id: 'widget_thanks_explanation',
            type: 'text',
            order: 2,
            content: {
              text: '«Что такое баллы «Спасибо» и зачем они нужны? Каждый раз, когда вы помогаете соседу или получаете благодарность, вам начисляются баллы «Спасибо». Это наш способ сказать, что мы ценим вашу доброту и активность.\n\nПочему баллы важны?\nВ будущем, когда приложение станет популярным и начнёт приносить реальный доход, каждый балл «Спасибо» будет равен 1 рублю. Это значит, что вы сможете обменять накопленные баллы на реальные деньги или услуги.\n\nКогда это произойдёт?\nКогда количество установок приложения достигнет 10 000 (или другой порог), мы запустим программу обмена баллов на реальные деньги. До этого момента баллы копятся и не сгорают.\n\nПочему мы не платим сейчас?\nПотому что пока приложение не приносит дохода, мы не можем платить из своего кармана. Но как только приложение станет популярным — мы запустим обмен.\n\nЧто делать сейчас?\nУстанавливайте приложение, проходите обучение, помогайте соседям и копите баллы. У вас есть реальный шанс быть первыми, кто заработает на этом приложении!»',
              alignment: 'left'
            },
            style: { paddingTop: 15, paddingBottom: 15, textColor: '#1f2937' }
          },
          {
            id: 'widget_thanks_divider',
            type: 'divider',
            order: 3,
            content: {
              dividerThickness: 2,
              dividerColor: '#e2e8f0',
              dividerStyle: 'dashed'
            },
            style: { paddingTop: 10, paddingBottom: 10 }
          },
          {
            id: 'widget_thanks_why_header',
            type: 'header',
            order: 4,
            content: {
              text: '🏆 «Почему мы не платим прямо сейчас?»',
              fontSize: 'h2',
              color: '#0f172a',
              alignment: 'center'
            },
            style: { paddingTop: 10, paddingBottom: 10 }
          },
          {
            id: 'widget_thanks_why_details',
            type: 'text',
            order: 5,
            content: {
              text: 'Многие спрашивают: «Почему вы не даёте деньги за «Спасибо» сразу?»\n\nОтвет прост:\nМы — разработчики, а не спонсоры. Мы создали приложение, чтобы помочь жителям всей страны наладить добрососедские отношения. Мы не получаем прибыль от приложения, пока оно не станет популярным.\n\nКогда мы начнём платить?\nКогда количество установок достигнет 10 000. Это покажет, что приложение действительно нужно людям, и мы сможем привлекать рекламодателей и партнёров, которые готовы платить за развитие.\n\nЧто делать сейчас?\n1. Установи приложение\n2. Пройди «Цифровую грамотность»\n3. Помогай соседям\n4. Копи «Спасибо»\n\nТы — первопроходец. У тебя есть реальный шанс заработать, пока другие ещё не знают о приложении. 🚀',
              alignment: 'left'
            },
            style: { paddingTop: 15, paddingBottom: 25, textColor: '#1f2937' }
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 2
      };
      await setDoc(doc(db, 'pages', 'page_contacts'), thanksPage);
    }

    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      console.log('Seeding initial users to Firestore...');
      for (const u of INITIAL_USERS) {
        await setDoc(doc(db, 'users', u.id), u);
      }
    } else {
      // Ensure the administrative account specifically exists and is restored to main_admin role
      const adminUserDoc = await getDoc(doc(db, 'users', 'user_admin'));
      if (!adminUserDoc.exists()) {
        console.log('Restoring administrative account user_admin to Firestore...');
        const adminUser = INITIAL_USERS.find(u => u.id === 'user_admin');
        if (adminUser) {
          await setDoc(doc(db, 'users', 'user_admin'), adminUser);
        }
      } else {
        const data = adminUserDoc.data();
        if (data && (data.role !== 'main_admin' || data.blocked === true)) {
          console.log('Correcting role and status for user_admin in Firestore...');
          await updateDoc(doc(db, 'users', 'user_admin'), { role: 'main_admin', blocked: false });
        }
      }
    }

    // Ensure all test roles exist in the database so updates to them don't fail
    for (const r of TEST_ROLES) {
      const docRef = doc(db, 'users', r.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.log(`Seeding test role ${r.id} to Firestore...`);
        await setDoc(docRef, r);
      }
    }

    const requestsSnap = await getDocs(collection(db, 'requests'));
    if (requestsSnap.empty) {
      console.log('Seeding initial requests to Firestore...');
      for (const r of INITIAL_REQUESTS) {
        await setDoc(doc(db, 'requests', r.id), r);
      }
    }

    const entrepreneursSnap = await getDocs(collection(db, 'entrepreneurs'));
    if (entrepreneursSnap.empty) {
      console.log('Seeding initial entrepreneurs to Firestore...');
      for (const e of INITIAL_ENTREPRENEURS) {
        await setDoc(doc(db, 'entrepreneurs', e.id), e);
      }
    }

    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (ordersSnap.empty) {
      console.log('Seeding initial orders to Firestore...');
      for (const o of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', o.id), o);
      }
    }

    const reviewsSnap = await getDocs(collection(db, 'reviews'));
    if (reviewsSnap.empty) {
      console.log('Seeding initial reviews to Firestore...');
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, 'reviews', rev.id), rev);
      }
    }

    const routesSnap = await getDocs(collection(db, 'routes'));
    if (routesSnap.empty) {
      console.log('Seeding initial routes to Firestore...');
      for (const rt of INITIAL_ROUTES) {
        await setDoc(doc(db, 'routes', rt.id), rt);
      }
    }

    const rideOffersSnap = await getDocs(collection(db, 'ride_offers'));
    if (rideOffersSnap.empty) {
      console.log('Seeding initial ride offers to Firestore...');
      for (const ro of INITIAL_RIDE_OFFERS) {
        await setDoc(doc(db, 'ride_offers', ro.id), ro);
      }
    }

    const rideRequestsSnap = await getDocs(collection(db, 'ride_requests'));
    if (rideRequestsSnap.empty) {
      console.log('Seeding initial ride requests to Firestore...');
      for (const rr of INITIAL_RIDE_REQUESTS) {
        await setDoc(doc(db, 'ride_requests', rr.id), rr);
      }
    }

    const roadReportsSnap = await getDocs(collection(db, 'road_reports'));
    if (roadReportsSnap.empty) {
      console.log('Seeding initial road reports to Firestore...');
      for (const rep of INITIAL_ROAD_REPORTS) {
        await setDoc(doc(db, 'road_reports', rep.id), rep);
      }
    }

    const rideReviewsSnap = await getDocs(collection(db, 'ride_reviews'));
    if (rideReviewsSnap.empty) {
      console.log('Seeding initial ride reviews to Firestore...');
      for (const rev of INITIAL_RIDE_REVIEWS) {
        await setDoc(doc(db, 'ride_reviews', rev.id), rev);
      }
    }

    // Seeding Eco Points
    const ecoPointsSnap = await getDocs(collection(db, 'eco_points'));
    if (ecoPointsSnap.empty) {
      console.log('Seeding initial eco points...');
      const initialPoints: EcoPoint[] = [
        {
          id: 'point_bereznik',
          name: 'Березник',
          address: 'ул. Советская, д. 12',
          village: 'Березник',
          lat: 61.162,
          lng: 43.197,
          phone: '+7-999-123-45-67',
          schedule: 'Пн-Пт: 09:00-18:00',
          accepts: ['батарейки', 'аккумуляторы', 'ртутные лампы'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'point_oktyabrsky',
          name: 'Октябрьский',
          address: 'ул. Ленина, д. 5 (администрация)',
          village: 'Октябрьский',
          lat: 61.085,
          lng: 43.158,
          phone: '+7-999-234-56-78',
          schedule: 'Пн-Пт: 08:00-17:00',
          accepts: ['батарейки', 'аккумуляторы', 'лампы', 'градусники'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'point_shangaly',
          name: 'Шангалы',
          address: 'ул. Центральная, д. 8',
          village: 'Шангалы',
          lat: 61.127,
          lng: 43.238,
          phone: '+7-999-345-67-89',
          schedule: 'Пн-Сб: 10:00-19:00',
          accepts: ['батарейки', 'аккумуляторы', 'ртутные лампы'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'point_ileza',
          name: 'Илеза',
          address: 'ул. Железнодорожная, д. 3',
          village: 'Илеза',
          lat: 61.050,
          lng: 44.110,
          phone: '+7-999-456-78-90',
          schedule: 'Временно закрыто',
          accepts: ['батарейки', 'лампы'],
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'point_kizema',
          name: 'Кизема',
          address: 'ул. Таежная, д. 14',
          village: 'Кизема',
          lat: 61.112,
          lng: 44.825,
          phone: '+7-999-567-89-01',
          schedule: 'Не работает',
          accepts: ['батарейки'],
          isActive: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      for (const p of initialPoints) {
        await setDoc(doc(db, 'eco_points', p.id), p);
      }
    }

    // Seeding Eco Events
    const ecoEventsSnap = await getDocs(collection(db, 'eco_events'));
    if (ecoEventsSnap.empty) {
      console.log('Seeding initial eco events...');
      const initialEvents: EcoEvent[] = [
        {
          id: 'event_bereznik_subbotnik',
          title: '🌿 Субботник в Березнике',
          description: 'Сбор мусора вдоль красивой набережной реки Вага. Весь необходимый инвентарь (мешки, перчатки) выдаем на месте.',
          village: 'Березник',
          address: 'Администрация Березника',
          date: '2026-07-15',
          time: '10:00',
          organizer: 'Администрация поселения',
          participants: 12,
          maxParticipants: 30,
          isActive: true,
          photos: [],
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          participantUserIds: ['mock_u1', 'mock_u2', 'mock_u3']
        },
        {
          id: 'event_oktyabrsky_collect',
          title: '🔋 День сбора батареек в Октябрьском',
          description: 'Приносите старые батарейки и аккумуляторы и получайте памятные подарки! За каждые 10 сданных батареек дарим стильную эко-сумку или блокнот из вторичной бумаги.',
          village: 'Октябрьский',
          address: 'Площадь у администрации',
          date: '2026-07-16',
          time: '14:00',
          organizer: 'Эко-активисты Устьян',
          participants: 24,
          maxParticipants: 100,
          isActive: true,
          photos: [],
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          participantUserIds: ['mock_u2', 'mock_u4']
        },
        {
          id: 'event_shangaly_trees',
          title: '🌳 Посадка деревьев в Шангалах',
          description: 'Озеленение парковой зоны у дома культуры. Будем сажать молодые саженцы лип и берез. Приглашаем семьи с детьми!',
          village: 'Шангалы',
          address: 'Парк у ДК',
          date: '2026-07-20',
          time: '09:00',
          organizer: 'Молодежный совет',
          participants: 8,
          maxParticipants: 20,
          isActive: true,
          photos: [],
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          participantUserIds: []
        }
      ];
      for (const ev of initialEvents) {
        await setDoc(doc(db, 'eco_events', ev.id), ev);
      }
    }

    // Seeding Eco Stats
    const ecoStatsSnap = await getDoc(doc(db, 'eco_stats', 'district_stats'));
    if (!ecoStatsSnap.exists()) {
      console.log('Seeding initial eco stats...');
      const initialStats: EcoStats = {
        id: 'district_stats',
        totalBatteriesCollected: 135,
        totalEvents: 12,
        totalParticipants: 48,
        totalDumpsCleared: 7,
        byVillage: {
          'Березник': { batteriesCollected: 45, eventsParticipated: 3, dumpsCleared: 2 },
          'Октябрьский': { batteriesCollected: 32, eventsParticipated: 4, dumpsCleared: 3 },
          'Шангалы': { batteriesCollected: 28, eventsParticipated: 2, dumpsCleared: 1 },
          'Илеза': { batteriesCollected: 15, eventsParticipated: 2, dumpsCleared: 1 },
          'Кизема': { batteriesCollected: 15, eventsParticipated: 1, dumpsCleared: 0 }
        },
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'eco_stats', 'district_stats'), initialStats);
    }

    // Seeding Masters
    const mastersSnap = await getDocs(collection(db, 'masters'));
    if (mastersSnap.empty) {
      console.log('Seeding initial masters to Firestore...');
      for (const m of INITIAL_MASTERS) {
        await setDoc(doc(db, 'masters', m.id), m);
      }
    }

    // Seeding Portfolio Items
    const portfolioSnap = await getDocs(collection(db, 'portfolio_items'));
    if (portfolioSnap.empty) {
      console.log('Seeding initial portfolio items to Firestore...');
      for (const pi of INITIAL_PORTFOLIO_ITEMS) {
        await setDoc(doc(db, 'portfolio_items', pi.id), pi);
      }
    }

    // Seeding Master Reviews
    const masterReviewsSnap = await getDocs(collection(db, 'master_reviews'));
    if (masterReviewsSnap.empty) {
      console.log('Seeding initial master reviews to Firestore...');
      for (const mr of INITIAL_MASTER_REVIEWS) {
        await setDoc(doc(db, 'master_reviews', mr.id), mr);
      }
    }

    // Seeding Project Stats (About Project)
    const projectStatsSnap = await getDoc(doc(db, 'project_stats', 'district_stats'));
    if (!projectStatsSnap.exists()) {
      console.log('Seeding initial project stats...');
      const initialProjectStats: ProjectStats = {
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
      };
      await setDoc(doc(db, 'project_stats', 'district_stats'), initialProjectStats);
    }

    // Seeding Project Reviews (About Project reviews)
    const projectReviewsSnap = await getDocs(collection(db, 'project_reviews'));
    if (projectReviewsSnap.empty) {
      console.log('Seeding initial project reviews...');
      const initialProjectReviews: ProjectReview[] = [
        {
          id: 'review_1',
          userId: 'mock_user_p1',
          userName: 'Анна Петровна',
          userVillage: 'Березник',
          rating: 5,
          text: 'Спасибо соседям! Привезли лекарства, когда я не могла выйти из дома.',
          isPublic: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'review_2',
          userId: 'mock_user_m1',
          userName: 'Иван Иванович',
          userVillage: 'Шангалы',
          rating: 5,
          text: 'Я плотник. Раньше сидел без заказов, а теперь работа есть каждый день.',
          isPublic: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'review_3',
          userId: 'mock_user_e1',
          userName: 'Мария Васильевна',
          userVillage: 'Октябрьский',
          rating: 5,
          text: 'Внук научил меня пользоваться приложением. Теперь я сама заказываю продукты!',
          isPublic: true,
          createdAt: new Date().toISOString()
        }
      ];
      for (const pr of initialProjectReviews) {
        await setDoc(doc(db, 'project_reviews', pr.id), pr);
      }
    }

    // Seeding Places
    const placesSnap = await getDocs(collection(db, 'places'));
    if (placesSnap.empty) {
      console.log('Seeding initial places to Firestore...');
      const initialPlaces: Place[] = [
        {
          id: "place_museum",
          name: "Устьянский краеведческий музей",
          category: "historical",
          description: "Устьянский краеведческий музей — хранитель истории и культурного наследия Устьянского края. В музее представлены экспозиции, посвященные традиционному быту северных крестьян, истории Устьянских погостов, а также экспонаты времен Великой Отечественной войны. Посетители могут увидеть уникальные предметы старинной одежды, берестяную утварь и архивные фотографии.",
          history: "Музей был основан в 1984 году группой местных краеведов во главе с М. И. Романовым. За сорок лет существования фонды музея выросли с нескольких десятков экспонатов до более чем десяти тысяч уникальных единиц хранения, представляющих огромную историческую ценность.",
          location: {
            village: "Шангалы",
            address: "ул. Ленина, д. 10",
            lat: 61.1215,
            lng: 43.1850
          },
          images: ["https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800"],
          opens: "Вторник - Воскресенье с 10:00 до 18:00, Пн - выходной",
          contacts: {
            phone: "+7 (81855) 5-15-45",
            website: "http://ustyany-museum.ru",
            schedule: "10:00 - 18:00"
          },
          rating: { average: 4.8, total: 5 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_nalichniki",
          name: "Усадьба резных наличников",
          category: "architecture",
          description: "Уникальный памятник деревянного зодчества Русского Севера. Старинный крестьянский дом, украшенный ажурной сквозной резьбой и объемными наличниками, выполненными устьянскими мастерами. Фасад здания отражает традиционные солярные знаки, обереги и символы плодородия.",
          history: "Дом был построен в 1889 году зажиточным крестьянином-мастером Семеном Кононовым. Все элементы резьбы выполнялись вручную с использованием топоров и специальных резцов. Усадьба выдержала годы революции и Великой Отечественной войны и сегодня бережно охраняется наследниками.",
          location: {
            village: "Кононовская",
            address: "ул. Набережная, д. 5",
            lat: 61.1110,
            lng: 43.2010
          },
          images: ["https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=800"],
          opens: "Круглосуточно (осмотр фасада)",
          contacts: {
            phone: "",
            website: "",
            schedule: "Круглосуточно"
          },
          rating: { average: 4.7, total: 3 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_ustya_river",
          name: "Река Устья и набережная",
          category: "nature",
          description: "Живописная водная артерия района, воспетая в местных легендах. Чистейшая река с песчаными косами, окруженная вековыми хвойными лесами. Прекрасное место для летнего отдыха, семейных пикников, байдарочных сплавов и традиционной рыбалки на хариуса и щуку.",
          history: "Река Устья испокон веков служила главным транспортным путем и источником жизни для жителей района. На ее берегах основывались первые поселения устьянцев, селившихся на высоких холмах (погостах) для защиты от паводков.",
          location: {
            village: "Октябрьский",
            address: "Центральная набережная",
            lat: 61.0850,
            lng: 43.1550
          },
          images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800"],
          opens: "Круглосуточно",
          contacts: {
            phone: "",
            website: "",
            schedule: "Круглосуточно"
          },
          rating: { average: 4.9, total: 8 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_folk_center",
          name: "Центр Устьянской народной культуры",
          category: "culture",
          description: "Центр сохранения традиций Русского Севера. Здесь проводятся фольклорные праздники, выставки ремесел, мастер-классы по народной кукле, ткачеству, выпечке традиционных устьянских пирогов и северной росписи. На базе центра действует знаменитый Устьянский народный хор.",
          history: "Центр был создан на волне возрождения интереса к поморским и северным крестьянским традициям в 1990-х годах. С тех пор он стал главным методическим центром района по сохранению нематериального культурного наследия.",
          location: {
            village: "Шангалы",
            address: "ул. Советская, д. 25",
            lat: 61.1225,
            lng: 43.1890
          },
          images: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800"],
          opens: "Понедельник - Суббота с 09:00 до 17:00",
          contacts: {
            phone: "+7 (81855) 5-21-31",
            website: "http://ustyany-folk.ru",
            schedule: "09:00 - 17:00"
          },
          rating: { average: 5.0, total: 4 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_shangaly_school",
          name: "Шангальская средняя школа им. А.И. Семенова",
          category: "education",
          description: "Старейшее образовательное учреждение Устьян, известное своими инновационными педагогическими традициями и прекрасным музеем истории школы, где собраны материалы о выдающихся выпускниках и учителях района.",
          history: "Основана в конце XIX века как церковно-приходская школа. В советское время была преобразована в среднюю школу. Носит имя легендарного директора А. И. Семенова, руководившего школой более 30 лет и заложившего основы устьянского краеведческого образования.",
          location: {
            village: "Шангалы",
            address: "ул. Октябрьская, д. 12",
            lat: 61.1200,
            lng: 43.1800
          },
          images: ["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800"],
          opens: "Понедельник - Пятница с 08:00 до 17:00",
          contacts: {
            phone: "+7 (81855) 5-11-22",
            website: "http://shangaly-school.ru",
            schedule: "08:00 - 17:00"
          },
          rating: { average: 4.6, total: 2 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_crafts_house",
          name: "Дом-усадьба Устьянских ремёсел",
          category: "craft",
          description: "Живой музей кустарных промыслов Устьи. Мастера центра возрождают уникальные техники плетения из бересты, северного ручного ткачества на кроснах, лепки из глины, резьбы по дереву и ковки. Здесь можно приобрести оригинальные аутентичные сувениры и пройти индивидуальный мастер-класс.",
          history: "Основан в 2005 году с целью поддержки устьянских народных умельцев и сохранения исчезающих технологий северного ручного труда. Расположен в реконструированном купеческом доме начала XX века.",
          location: {
            village: "Бережная",
            address: "д. 42",
            lat: 61.1400,
            lng: 43.2200
          },
          images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800"],
          opens: "Среда - Воскресенье с 11:00 до 19:00",
          contacts: {
            phone: "+7 (921) 470-34-55",
            website: "http://ustyany-crafts.ru",
            schedule: "11:00 - 19:00"
          },
          rating: { average: 4.9, total: 6 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_dmitry_church",
          name: "Церковь Дмитрия Солунского",
          category: "religious",
          description: "Действующий православный храм в живописном месте района. Великолепная каменная архитектура начала ХХ века с сохранившейся кирпичной кладкой и элементами старого иконостаса. Место умиротворения и духовной силы.",
          history: "Храм был возведен в период с 1902 по 1910 год на средства устьянских прихожан и благотворителей. В советские годы здание использовалось как склад зерна, что позволило спасти его от полного разрушения. С 1990-х годов силами жителей началось восстановление святыни.",
          location: {
            village: "Заячерицкий Погост",
            address: "ул. Церковная, д. 1",
            lat: 61.1000,
            lng: 43.2500
          },
          images: ["https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=800"],
          opens: "Суббота, Воскресенье с 09:00 до 14:00 (а также во время праздничных служб)",
          contacts: {
            phone: "",
            website: "",
            schedule: "09:00 - 14:00"
          },
          rating: { average: 4.8, total: 4 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_malinovka",
          name: "Горнолыжный и лыжный комплекс «Малиновка»",
          category: "recreation",
          description: "Спортивно-туристический центр всероссийского масштаба. Здесь проложены великолепные лыжные трассы высшей категории, оборудованы горнолыжные склоны, работает прокат инвентаря, кафе и гостевые коттеджи. Отличное место для активного отдыха всей семейной.",
          history: "Комплекс начал развиваться в начале 2000-х годов благодаря уникальному рельефу Устьянских холмов и раннему снегу, который лежит с ноября по апрель. Сегодня «Малиновка» регулярно принимает Чемпионаты России по лыжным гонкам.",
          location: {
            village: "Кононовская",
            address: "ул. Спортивная, д. 1",
            lat: 61.1050,
            lng: 43.2080
          },
          images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=800"],
          opens: "Ежедневно с 09:00 до 21:00",
          contacts: {
            phone: "+7 (911) 570-10-10",
            website: "http://malinovka29.ru",
            schedule: "09:00 - 21:00"
          },
          rating: { average: 4.9, total: 12 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_ww2_memorial",
          name: "Мемориал памяти павших в годы Великой Отечественной войны",
          category: "memorial",
          description: "Мемориальный комплекс в центре поселка Октябрьский. Вечный огонь, памятник Воину-Освободителю и плиты с именами жителей района, отдавших жизнь за защиту Родины в 1941-1945 годах. Место проведения торжественных парадов и митингов памяти.",
          history: "Памятник был установлен к 30-летию Победы в 1975 году. Все плиты с именами солдат были отлиты на пожертвования местных предприятий и самих жителей Устьян. В 2015 году проведена масштабная реконструкция мемориала.",
          location: {
            village: "Октябрьский",
            address: "Площадь Победы",
            lat: 61.0880,
            lng: 43.1600
          },
          images: ["https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=800"],
          opens: "Круглосуточно",
          contacts: {
            phone: "",
            website: "",
            schedule: "Круглосуточно"
          },
          rating: { average: 5.0, total: 10 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "place_eco_trail",
          name: "Экологическая тропа «Тайны Устьянской тайги»",
          category: "ecotrail",
          description: "Обустроенный пешеходный маршрут длиной 5 километров в глубине векового северного леса. Маршрут оборудован деревянными настилами, информационными стендами, местами для отдыха и чистейшим лесным родником. Отличная прогулка для изучения местной флоры и фауны.",
          history: "Проект был разработан юными лесоводами Бестужевской школы в 2018 году. Школьники самостоятельно убирали валежник, размечали тропу и писали тексты для познавательных аншлагов, рассказывающих о птицах, зверях и редких растениях Устьян.",
          location: {
            village: "Бестужево",
            address: "ул. Лесная, начало у окраины леса",
            lat: 61.2200,
            lng: 43.0500
          },
          images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800"],
          opens: "Круглосуточно (рекомендуется в светлое время суток)",
          contacts: {
            phone: "",
            website: "",
            schedule: "Круглосуточно"
          },
          rating: { average: 4.8, total: 5 },
          is_verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      for (const pl of initialPlaces) {
        await setDoc(doc(db, 'places', pl.id), pl);
      }
    }

    // Migrate existing users to include location object if missing
    console.log('Running user location migration check...');
    const allUsersSnap = await getDocs(collection(db, 'users'));
    for (const d of allUsersSnap.docs) {
      const uData = d.data() as UserProfile;
      if (!uData.location || !uData.regionCode) {
        console.log(`Migrating user ${d.id} to new location format...`);
        const legacyVillage = uData.village || 'Березник';
        await updateDoc(doc(db, 'users', d.id), {
          location: {
            country: 'Россия',
            region: 'Архангельская область',
            district: 'Устьянский район',
            village: legacyVillage
          },
          regionCode: 'RU-ARK',
          districtCode: 'UST',
          villageCode: 'OKT'
        } as any);
      }
    }

    // Seeding Regions for Package-Based Module Gating
    const regionsSnap = await getDocs(collection(db, 'regions'));
    if (regionsSnap.empty) {
      console.log('Seeding initial regions for package-based module gating...');
      const { RUSSIAN_REGIONS } = await import('./data/regionsData');
      const { getModulesForPackages } = await import('./config/modules');

      for (const r of RUSSIAN_REGIONS) {
        // Pilot region RU-ARK is configured with 'start' package
        const packages: ('start' | 'business' | 'government')[] = r.code === 'RU-ARK'
          ? ['start']
          : ['start', 'business', 'government'];

        const regionDoc: Region = {
          id: r.code,
          name: r.name,
          packages: packages,
          modules: getModulesForPackages(packages)
        };

        await setDoc(doc(db, 'regions', r.code), regionDoc);
      }
      console.log('Seeded all 89 regions successfully.');
    }

    // --- SEED INTERACTIVE VILLAGE ARCHIVE ---
    const villagesSnap = await getDocs(collection(db, 'villages'));
    if (villagesSnap.empty) {
      console.log('Seeding initial Interactive Villages to Firestore...');
      for (const v of INITIAL_VILLAGES) {
        await setDoc(doc(db, 'villages', v.id), v);
      }
      for (const h of INITIAL_HOUSES) {
        await setDoc(doc(db, 'houses', h.id), h);
      }
      for (const res of INITIAL_RESIDENTS) {
        await setDoc(doc(db, 'residents', res.id), res);
      }
      for (const tree of INITIAL_FAMILY_TREES) {
        await setDoc(doc(db, 'family_trees', tree.id), tree);
      }
      console.log('Seeded Interactive Village digital archives successfully.');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

// Project About Page operations
export async function dbCreateProjectReview(review: ProjectReview) {
  const path = `project_reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'project_reviews', review.id), review);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateProjectStats(stats: Partial<ProjectStats>) {
  const path = `project_stats/district_stats`;
  try {
    await updateDoc(doc(db, 'project_stats', 'district_stats'), stats);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// User operations
export async function dbCreateUserProfile(user: UserProfile) {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Request operations
export async function dbCreateHelpRequest(req: HelpRequest) {
  const path = `requests/${req.id}`;
  try {
    await setDoc(doc(db, 'requests', req.id), req);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateHelpRequest(reqId: string, updates: Partial<HelpRequest>) {
  const path = `requests/${reqId}`;
  try {
    await updateDoc(doc(db, 'requests', reqId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteHelpRequest(reqId: string) {
  const path = `requests/${reqId}`;
  try {
    await deleteDoc(doc(db, 'requests', reqId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Chat operations
export async function dbCreateChat(chat: Chat) {
  const path = `chats/${chat.id}`;
  try {
    await setDoc(doc(db, 'chats', chat.id), chat);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateChat(chatId: string, updates: Partial<Chat>) {
  const path = `chats/${chatId}`;
  try {
    await updateDoc(doc(db, 'chats', chatId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Message operations
export async function dbSendMessage(chatId: string, msg: Message) {
  const path = `chats/${chatId}/messages/${msg.id}`;
  try {
    await setDoc(doc(db, 'chats', chatId, 'messages', msg.id), msg);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Complaint operations
export async function dbCreateComplaint(complaint: Complaint) {
  const path = `complaints/${complaint.id}`;
  try {
    await setDoc(doc(db, 'complaints', complaint.id), complaint);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateComplaint(complaintId: string, updates: Partial<Complaint>) {
  const path = `complaints/${complaintId}`;
  try {
    await updateDoc(doc(db, 'complaints', complaintId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Entrepreneur operations
export async function dbCreateEntrepreneur(entr: Entrepreneur) {
  const path = `entrepreneurs/${entr.id}`;
  try {
    await setDoc(doc(db, 'entrepreneurs', entr.id), entr);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateEntrepreneur(entrId: string, updates: Partial<Entrepreneur>) {
  const path = `entrepreneurs/${entrId}`;
  try {
    await updateDoc(doc(db, 'entrepreneurs', entrId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Order operations
export async function dbCreateOrder(order: Order) {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateOrder(orderId: string, updates: Partial<Order>) {
  const path = `orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'orders', orderId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Review operations
export async function dbCreateReview(review: Review) {
  const path = `reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'reviews', review.id), review);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateReview(reviewId: string, updates: Partial<Review>) {
  const path = `reviews/${reviewId}`;
  try {
    await updateDoc(doc(db, 'reviews', reviewId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Route operations
export async function dbCreateRoute(route: BusRoute) {
  const path = `routes/${route.id}`;
  try {
    await setDoc(doc(db, 'routes', route.id), route);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateRoute(routeId: string, updates: Partial<BusRoute>) {
  const path = `routes/${routeId}`;
  try {
    await updateDoc(doc(db, 'routes', routeId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteRoute(routeId: string) {
  const path = `routes/${routeId}`;
  try {
    await deleteDoc(doc(db, 'routes', routeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Ride Offer operations
export async function dbCreateRideOffer(offer: RideOffer) {
  const path = `ride_offers/${offer.id}`;
  try {
    await setDoc(doc(db, 'ride_offers', offer.id), offer);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateRideOffer(offerId: string, updates: Partial<RideOffer>) {
  const path = `ride_offers/${offerId}`;
  try {
    await updateDoc(doc(db, 'ride_offers', offerId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteRideOffer(offerId: string) {
  const path = `ride_offers/${offerId}`;
  try {
    await deleteDoc(doc(db, 'ride_offers', offerId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Ride Request operations
export async function dbCreateRideRequest(request: RideRequest) {
  const path = `ride_requests/${request.id}`;
  try {
    await setDoc(doc(db, 'ride_requests', request.id), request);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateRideRequest(requestId: string, updates: Partial<RideRequest>) {
  const path = `ride_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'ride_requests', requestId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteRideRequest(requestId: string) {
  const path = `ride_requests/${requestId}`;
  try {
    await deleteDoc(doc(db, 'ride_requests', requestId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Road Report operations
export async function dbCreateRoadReport(report: RoadReport) {
  const path = `road_reports/${report.id}`;
  try {
    await setDoc(doc(db, 'road_reports', report.id), report);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateRoadReport(reportId: string, updates: Partial<RoadReport>) {
  const path = `road_reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'road_reports', reportId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteRoadReport(reportId: string) {
  const path = `road_reports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'road_reports', reportId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Ride Review operations
export async function dbCreateRideReview(review: RideReview) {
  const path = `ride_reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'ride_reviews', review.id), review);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Dispute operations
export async function dbCreateDispute(dispute: Dispute) {
  const path = `disputes/${dispute.id}`;
  try {
    await setDoc(doc(db, 'disputes', dispute.id), dispute);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateDispute(disputeId: string, updates: Partial<Dispute>) {
  const path = `disputes/${disputeId}`;
  try {
    await updateDoc(doc(db, 'disputes', disputeId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Fraud Alert operations
export async function dbCreateFraudAlert(alert: FraudAlert) {
  const path = `fraud_alerts/${alert.id}`;
  try {
    await setDoc(doc(db, 'fraud_alerts', alert.id), alert);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// Master operations
export async function dbCreateMaster(master: Master) {
  const path = `masters/${master.id}`;
  try {
    await setDoc(doc(db, 'masters', master.id), master);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateMaster(masterId: string, updates: Partial<Master>) {
  const path = `masters/${masterId}`;
  try {
    await updateDoc(doc(db, 'masters', masterId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteMaster(masterId: string) {
  const path = `masters/${masterId}`;
  try {
    await deleteDoc(doc(db, 'masters', masterId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Portfolio Item operations
export async function dbCreatePortfolioItem(item: PortfolioItem) {
  const path = `portfolio_items/${item.id}`;
  try {
    await setDoc(doc(db, 'portfolio_items', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdatePortfolioItem(itemId: string, updates: Partial<PortfolioItem>) {
  const path = `portfolio_items/${itemId}`;
  try {
    await updateDoc(doc(db, 'portfolio_items', itemId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeletePortfolioItem(itemId: string) {
  const path = `portfolio_items/${itemId}`;
  try {
    await deleteDoc(doc(db, 'portfolio_items', itemId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Service Order operations
export async function dbCreateServiceOrder(order: ServiceOrder) {
  const path = `service_orders/${order.id}`;
  try {
    await setDoc(doc(db, 'service_orders', order.id), order);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateServiceOrder(orderId: string, updates: Partial<ServiceOrder>) {
  const path = `service_orders/${orderId}`;
  try {
    await updateDoc(doc(db, 'service_orders', orderId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Master Review operations
export async function dbCreateMasterReview(review: MasterReview) {
  const path = `master_reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'master_reviews', review.id), review);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateMasterReview(reviewId: string, updates: Partial<MasterReview>) {
  const path = `master_reviews/${reviewId}`;
  try {
    await updateDoc(doc(db, 'master_reviews', reviewId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Page Builder operations
export function dbSubscribePages(onUpdate: (pages: Page[]) => void) {
  const q = query(collection(db, 'pages'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const list: Page[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Page);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching pages:', err);
  });
}

export async function dbCreatePage(page: Page) {
  const path = `pages/${page.id}`;
  try {
    await setDoc(doc(db, 'pages', page.id), page);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdatePage(pageId: string, updates: Partial<Page>) {
  const path = `pages/${pageId}`;
  try {
    await updateDoc(doc(db, 'pages', pageId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeletePage(pageId: string) {
  const path = `pages/${pageId}`;
  try {
    await deleteDoc(doc(db, 'pages', pageId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function dbCreatePageHistory(history: PageHistory) {
  const path = `page_history/${history.id}`;
  try {
    await setDoc(doc(db, 'page_history', history.id), history);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export function dbSubscribePageHistory(pageId: string, onUpdate: (history: PageHistory[]) => void) {
  const q = query(collection(db, 'page_history'));
  return onSnapshot(q, (snapshot) => {
    const list: PageHistory[] = [];
    snapshot.forEach((doc) => {
      const h = doc.data() as PageHistory;
      if (h.pageId === pageId) {
        list.push(h);
      }
    });
    list.sort((a, b) => b.version - a.version);
    onUpdate(list);
  });
}

// --- ENVIRONMENTAL SAFETY COLLECTIONS OPERATIONS ---

function withAuthSubscription(subscribeFn: () => () => void): () => void {
  let unsubListener: (() => void) | null = null;
  
  const setup = (user: any) => {
    if (unsubListener) {
      unsubListener();
      unsubListener = null;
    }
    if (user) {
      unsubListener = subscribeFn();
    }
  };

  const unsubAuth = auth.onAuthStateChanged((user) => {
    setup(user);
  });

  return () => {
    unsubAuth();
    if (unsubListener) {
      unsubListener();
    }
  };
}

// EcoPoints
export function dbSubscribeEcoPoints(onUpdate: (points: EcoPoint[]) => void) {
  return withAuthSubscription(() => {
    return onSnapshot(collection(db, 'eco_points'), (snapshot) => {
      const list: EcoPoint[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as EcoPoint);
      });
      onUpdate(list);
    }, (err) => {
      console.error('Error fetching eco points:', err);
    });
  });
}

export async function dbCreateEcoPoint(point: EcoPoint) {
  const path = `eco_points/${point.id}`;
  try {
    await setDoc(doc(db, 'eco_points', point.id), point);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateEcoPoint(pointId: string, updates: Partial<EcoPoint>) {
  const path = `eco_points/${pointId}`;
  try {
    await updateDoc(doc(db, 'eco_points', pointId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteEcoPoint(pointId: string) {
  const path = `eco_points/${pointId}`;
  try {
    await deleteDoc(doc(db, 'eco_points', pointId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// EcoReports
export function dbSubscribeEcoReports(onUpdate: (reports: EcoReport[]) => void) {
  return withAuthSubscription(() => {
    return onSnapshot(collection(db, 'eco_reports'), (snapshot) => {
      const list: EcoReport[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as EcoReport);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    }, (err) => {
      console.error('Error fetching eco reports:', err);
    });
  });
}

export async function dbCreateEcoReport(report: EcoReport) {
  const path = `eco_reports/${report.id}`;
  try {
    await setDoc(doc(db, 'eco_reports', report.id), report);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateEcoReport(reportId: string, updates: Partial<EcoReport>) {
  const path = `eco_reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'eco_reports', reportId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteEcoReport(reportId: string) {
  const path = `eco_reports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'eco_reports', reportId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// EcoEvents
export function dbSubscribeEcoEvents(onUpdate: (events: EcoEvent[]) => void) {
  return withAuthSubscription(() => {
    return onSnapshot(collection(db, 'eco_events'), (snapshot) => {
      const list: EcoEvent[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as EcoEvent);
      });
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      onUpdate(list);
    }, (err) => {
      console.error('Error fetching eco events:', err);
    });
  });
}

export async function dbCreateEcoEvent(event: EcoEvent) {
  const path = `eco_events/${event.id}`;
  try {
    await setDoc(doc(db, 'eco_events', event.id), event);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateEcoEvent(eventId: string, updates: Partial<EcoEvent>) {
  const path = `eco_events/${eventId}`;
  try {
    await updateDoc(doc(db, 'eco_events', eventId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteEcoEvent(eventId: string) {
  const path = `eco_events/${eventId}`;
  try {
    await deleteDoc(doc(db, 'eco_events', eventId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// EcoStats
export function dbSubscribeEcoStats(onUpdate: (stats: EcoStats | null) => void) {
  return withAuthSubscription(() => {
    return onSnapshot(doc(db, 'eco_stats', 'district_stats'), (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as EcoStats);
      } else {
        onUpdate(null);
      }
    }, (err) => {
      console.error('Error fetching eco stats:', err);
    });
  });
}

export async function dbUpdateEcoStats(stats: EcoStats) {
  const path = `eco_stats/district_stats`;
  try {
    await setDoc(doc(db, 'eco_stats', 'district_stats'), stats);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --- GOVERNMENT LIAISON (APPEALS) HELPERS ---

export function dbSubscribeAppeals(onUpdate: (appeals: Appeal[]) => void) {
  return withAuthSubscription(() => {
    return onSnapshot(collection(db, 'appeals'), (snapshot) => {
      const list: Appeal[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Appeal);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    }, (err) => {
      console.error('Error fetching appeals:', err);
    });
  });
}

export function dbSubscribeAppealVotes(appealId: string, onUpdate: (votes: AppealVote[]) => void) {
  return withAuthSubscription(() => {
    return onSnapshot(collection(db, 'appeal_votes'), (snapshot) => {
      const list: AppealVote[] = [];
      snapshot.forEach((doc) => {
        const v = doc.data() as AppealVote;
        if (v.appealId === appealId) {
          list.push(v);
        }
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    }, (err) => {
      console.error(`Error fetching votes for appeal ${appealId}:`, err);
    });
  });
}

export function dbSubscribeAppealComments(appealId: string, onUpdate: (comments: AppealComment[]) => void) {
  return withAuthSubscription(() => {
    return onSnapshot(collection(db, 'appeal_comments'), (snapshot) => {
      const list: AppealComment[] = [];
      snapshot.forEach((doc) => {
        const c = doc.data() as AppealComment;
        if (c.appealId === appealId) {
          list.push(c);
        }
      });
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      onUpdate(list);
    }, (err) => {
      console.error(`Error fetching comments for appeal ${appealId}:`, err);
    });
  });
}

export async function dbCreateAppeal(appeal: Appeal) {
  const path = `appeals/${appeal.id}`;
  try {
    await setDoc(doc(db, 'appeals', appeal.id), appeal);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateAppeal(appealId: string, updates: Partial<Appeal>) {
  const path = `appeals/${appealId}`;
  try {
    await updateDoc(doc(db, 'appeals', appealId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteAppeal(appealId: string) {
  const path = `appeals/${appealId}`;
  try {
    await deleteDoc(doc(db, 'appeals', appealId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function dbCastAppealVote(vote: AppealVote) {
  const path = `appeal_votes/${vote.id}`;
  try {
    await setDoc(doc(db, 'appeal_votes', vote.id), vote);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbAddAppealComment(comment: AppealComment) {
  const path = `appeal_comments/${comment.id}`;
  try {
    await setDoc(doc(db, 'appeal_comments', comment.id), comment);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// --- PARTNERS / FRANCHISES HELPER FUNCTIONS ---
export function dbSubscribePartners(onUpdate: (partners: Partner[]) => void) {
  return onSnapshot(collection(db, 'partners'), (snapshot) => {
    const list: Partner[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Partner);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching partners:', err);
  });
}

export async function dbCreatePartner(partner: Partner) {
  const path = `partners/${partner.id}`;
  try {
    await setDoc(doc(db, 'partners', partner.id), partner);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdatePartner(partnerId: string, updates: Partial<Partner>) {
  const path = `partners/${partnerId}`;
  try {
    await updateDoc(doc(db, 'partners', partnerId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --- LICENSES HELPER FUNCTIONS ---
export function dbSubscribeLicenses(onUpdate: (licenses: License[]) => void) {
  return onSnapshot(collection(db, 'licenses'), (snapshot) => {
    const list: License[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as License);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching licenses:', err);
  });
}

export async function dbCreateLicense(license: License) {
  const path = `licenses/${license.id}`;
  try {
    await setDoc(doc(db, 'licenses', license.id), license);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateLicense(licenseId: string, updates: Partial<License>) {
  const path = `licenses/${licenseId}`;
  try {
    await updateDoc(doc(db, 'licenses', licenseId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --- CONTRACTS HELPER FUNCTIONS ---
export function dbSubscribeContracts(onUpdate: (contracts: Contract[]) => void) {
  return onSnapshot(collection(db, 'contracts'), (snapshot) => {
    const list: Contract[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Contract);
    });
    list.sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime());
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching contracts:', err);
  });
}

export async function dbCreateContract(contract: Contract) {
  const path = `contracts/${contract.id}`;
  try {
    await setDoc(doc(db, 'contracts', contract.id), contract);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateContract(contractId: string, updates: Partial<Contract>) {
  const path = `contracts/${contractId}`;
  try {
    await updateDoc(doc(db, 'contracts', contractId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --- FRANCHISE LEADS HELPER FUNCTIONS ---
export function dbSubscribeFranchiseLeads(onUpdate: (leads: FranchiseLead[]) => void) {
  return onSnapshot(collection(db, 'franchise_leads'), (snapshot) => {
    const list: FranchiseLead[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as FranchiseLead);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching franchise leads:', err);
  });
}

export async function dbCreateFranchiseLead(lead: FranchiseLead) {
  const path = `franchise_leads/${lead.id}`;
  try {
    await setDoc(doc(db, 'franchise_leads', lead.id), lead);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbCreateThanksQRCode(qr: any) {
  const path = `thanks_qrcodes/${qr.id}`;
  try {
    await setDoc(doc(db, 'thanks_qrcodes', qr.id), qr);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateThanksQRCode(qrId: string, updates: any) {
  const path = `thanks_qrcodes/${qrId}`;
  try {
    await updateDoc(doc(db, 'thanks_qrcodes', qrId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// --- PLACES AND LANDMARKS HELPERS ---
export function dbSubscribePlaces(onUpdate: (places: Place[]) => void) {
  return onSnapshot(collection(db, 'places'), (snapshot) => {
    const list: Place[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Place);
    });
    // Sort verified first, then by rating average
    list.sort((a, b) => {
      if (a.is_verified && !b.is_verified) return -1;
      if (!a.is_verified && b.is_verified) return 1;
      return b.rating.average - a.rating.average;
    });
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching places:', err);
  });
}

export async function dbCreatePlace(place: Place) {
  const path = `places/${place.id}`;
  try {
    await setDoc(doc(db, 'places', place.id), place);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdatePlace(placeId: string, updates: Partial<Place>) {
  const path = `places/${placeId}`;
  try {
    await updateDoc(doc(db, 'places', placeId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeletePlace(placeId: string) {
  const path = `places/${placeId}`;
  try {
    await deleteDoc(doc(db, 'places', placeId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --- PLACE REVIEWS HELPERS ---
export function dbSubscribePlaceReviews(placeId: string, onUpdate: (reviews: PlaceReview[]) => void) {
  return onSnapshot(collection(db, 'place_reviews'), (snapshot) => {
    const list: PlaceReview[] = [];
    snapshot.forEach((doc) => {
      const review = doc.data() as PlaceReview;
      if (review.placeId === placeId) {
        list.push(review);
      }
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching place reviews:', err);
  });
}

export async function dbCreatePlaceReview(review: PlaceReview) {
  const path = `place_reviews/${review.id}`;
  try {
    await setDoc(doc(db, 'place_reviews', review.id), review);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// ==========================================
// 🏡 INTERACTIVE VILLAGE ARCHIVE (FIRESTORE)
// ==========================================

// 1. Villages
export function dbSubscribeVillages(onUpdate: (villages: InteractiveVillage[]) => void) {
  return onSnapshot(collection(db, 'villages'), (snapshot) => {
    const list: InteractiveVillage[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as InteractiveVillage);
    });
    list.sort((a, b) => (b.housesCount || 0) - (a.housesCount || 0));
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching villages from Firestore:', err);
  });
}

export async function dbCreateVillage(village: InteractiveVillage) {
  const path = `villages/${village.id}`;
  try {
    await setDoc(doc(db, 'villages', village.id), village);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateVillage(villageId: string, updates: Partial<InteractiveVillage>) {
  const path = `villages/${villageId}`;
  try {
    await updateDoc(doc(db, 'villages', villageId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteVillage(villageId: string) {
  const path = `villages/${villageId}`;
  try {
    await deleteDoc(doc(db, 'villages', villageId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 2. Houses
export function dbSubscribeHouses(onUpdate: (houses: VillageHouse[]) => void) {
  return onSnapshot(collection(db, 'houses'), (snapshot) => {
    const list: VillageHouse[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as VillageHouse);
    });
    list.sort((a, b) => a.address.localeCompare(b.address, 'ru'));
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching houses from Firestore:', err);
  });
}

export async function dbCreateHouse(house: VillageHouse) {
  const path = `houses/${house.id}`;
  try {
    await setDoc(doc(db, 'houses', house.id), house);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateHouse(houseId: string, updates: Partial<VillageHouse>) {
  const path = `houses/${houseId}`;
  try {
    await updateDoc(doc(db, 'houses', houseId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteHouse(houseId: string) {
  const path = `houses/${houseId}`;
  try {
    await deleteDoc(doc(db, 'houses', houseId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 3. Residents
export function dbSubscribeResidents(onUpdate: (residents: VillageResident[]) => void) {
  return onSnapshot(collection(db, 'residents'), (snapshot) => {
    const list: VillageResident[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as VillageResident);
    });
    list.sort((a, b) => a.birthYear - b.birthYear);
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching residents from Firestore:', err);
  });
}

export async function dbCreateResident(resident: VillageResident) {
  const path = `residents/${resident.id}`;
  try {
    await setDoc(doc(db, 'residents', resident.id), resident);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateResident(residentId: string, updates: Partial<VillageResident>) {
  const path = `residents/${residentId}`;
  try {
    await updateDoc(doc(db, 'residents', residentId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function dbDeleteResident(residentId: string) {
  const path = `residents/${residentId}`;
  try {
    await deleteDoc(doc(db, 'residents', residentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 4. Family Trees
export function dbSubscribeFamilyTrees(onUpdate: (trees: VillageFamilyTree[]) => void) {
  return onSnapshot(collection(db, 'family_trees'), (snapshot) => {
    const list: VillageFamilyTree[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as VillageFamilyTree);
    });
    onUpdate(list);
  }, (err) => {
    console.error('Error fetching family trees from Firestore:', err);
  });
}

export async function dbCreateFamilyTree(tree: VillageFamilyTree) {
  const path = `family_trees/${tree.id}`;
  try {
    await setDoc(doc(db, 'family_trees', tree.id), tree);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function dbUpdateFamilyTree(treeId: string, updates: Partial<VillageFamilyTree>) {
  const path = `family_trees/${treeId}`;
  try {
    await updateDoc(doc(db, 'family_trees', treeId), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}





