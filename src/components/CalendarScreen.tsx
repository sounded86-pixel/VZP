import React, { useState, useEffect } from 'react';
import { UserProfile, HelpRequest, Chat } from '../types';
import { googleSignIn, logout, initAuth } from '../lib/googleAuth';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, RefreshCw, 
  CheckCircle, LogOut, Loader2, CalendarRange, AlertCircle, FileText, 
  ChevronRight, X, CalendarCheck, HelpCircle, Check, MapPinOff
} from 'lucide-react';

interface CalendarScreenProps {
  currentUser: UserProfile;
  requests: HelpRequest[];
  chats: Chat[];
  isOffline: boolean;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
}

export default function CalendarScreen({ currentUser, requests, chats, isOffline }: CalendarScreenProps) {
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [syncingTask, setSyncingTask] = useState<string | null>(null); // request ID currently being synced
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Scheduling Modal State
  const [activeSchedulingTask, setActiveSchedulingTask] = useState<{
    id: string;
    title: string;
    village: string;
    description: string;
    locationDetails?: string;
  } | null>(null);

  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [scheduleDuration, setScheduleDuration] = useState('60'); // minutes
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('');

  // Custom Confirmation Dialog State (mandated by Workspace Integration guidelines)
  const [destructiveConfirm, setDestructiveConfirm] = useState<{
    eventId: string;
    eventTitle: string;
    action: () => Promise<void>;
  } | null>(null);

  // Track which local tasks have been synced (stored in localStorage for persistent badges)
  const [syncedTaskIds, setSyncedTaskIds] = useState<Record<string, { eventId: string; dateTime: string }>>(() => {
    const saved = localStorage.getItem(`synced_calendar_tasks_${currentUser.id}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(`synced_calendar_tasks_${currentUser.id}`, JSON.stringify(syncedTaskIds));
  }, [syncedTaskIds, currentUser.id]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setErrorMsg(null);
        fetchUpcomingEvents(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch upcoming events from Google Calendar
  const fetchUpcomingEvents = async (tokenToUse?: string | null) => {
    const actToken = tokenToUse || accessToken;
    if (!actToken) return;
    if (isOffline) return;

    setLoadingEvents(true);
    setErrorMsg(null);
    try {
      const timeMin = new Date().toISOString();
      // Fetch next 25 events from primary calendar
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&orderBy=startTime&singleEvents=true&maxResults=25`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${actToken}` }
      });

      if (!res.ok) {
        throw new Error(`Ошибка Google API: ${res.status} ${res.statusText}`);
      }

      const data = await res.ok ? await res.json() : null;
      if (data && data.items) {
        setEvents(data.items);
      }
    } catch (err: any) {
      console.error('Failed to fetch calendar events:', err);
      setErrorMsg('Не удалось загрузить события из Google Календаря. Проверьте соединение.');
    } finally {
      setLoadingEvents(false);
    }
  };

  // Google Sign-In Trigger
  const handleSignIn = async () => {
    if (isOffline) {
      alert("Невозможно авторизоваться: вы находитесь в автономном (оффлайн) режиме.");
      return;
    }
    try {
      setErrorMsg(null);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        fetchUpcomingEvents(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ошибка авторизации");
    }
  };

  // Logout Trigger
  const handleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setAccessToken(null);
      setEvents([]);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Filter tasks relating to the current user (either authored or being helped)
  const myActiveCoordinatingTasks = React.useMemo(() => {
    // 1. Help requests authored by current user that are active
    const authored = requests.filter(r => r.authorId === currentUser.id && r.active);

    // 2. Help requests where current user is participating as helper in an active chat
    const helpingRequestIds = chats
      .filter(c => c.responderId === currentUser.id && !c.resolved)
      .map(c => c.postId);
    
    const helping = requests.filter(r => helpingRequestIds.includes(r.id) && r.active);

    // Combine and remove duplicates
    const combined = [...authored];
    helping.forEach(h => {
      if (!combined.some(c => c.id === h.id)) {
        combined.push(h);
      }
    });

    return combined;
  }, [requests, chats, currentUser.id]);

  // Open scheduler dialog for a specific task
  const initiateScheduleTask = (task: typeof myActiveCoordinatingTasks[0]) => {
    setActiveSchedulingTask(task);
    setScheduleTitle(`Взаимопомощь: ${task.title}`);
    
    // Autofill description
    const fullDesc = `Пост взаимопомощи: ${task.title}\n` +
      `Категория: ${task.category}\n` +
      `Описание: ${task.description}\n\n` +
      `Опубликовал(а): ${task.authorName}\n` +
      `Деревня: ${task.village}\n` +
      `Контакты: ${task.authorPhone}\n\n` +
      `Сгенерировано в приложении «Взаимопомощь Устьянского Района»`;
    
    setScheduleDescription(fullDesc);
    setScheduleLocation(`${task.village}, ${task.locationDetails || 'Устьянский район'}`);
    
    // Autofill with today's date (formatted as YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    setScheduleDate(today);
    setScheduleTime('14:00');
    setScheduleDuration('60');
  };

  // Create Google Calendar Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !activeSchedulingTask) return;
    if (isOffline) {
      alert("Невозможно сохранить событие: вы оффлайн.");
      return;
    }

    setSyncingTask(activeSchedulingTask.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Build ISO Date Strings
      const startDateTimeStr = `${scheduleDate}T${scheduleTime}:00`;
      const startDate = new Date(startDateTimeStr);
      
      if (isNaN(startDate.getTime())) {
        throw new Error("Указана неверная дата или время.");
      }

      const durationMinutes = parseInt(scheduleDuration, 10) || 60;
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

      const eventPayload = {
        summary: scheduleTitle,
        description: scheduleDescription,
        location: scheduleLocation,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Europe/Moscow' // Standard for Ustyany district region
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Europe/Moscow'
        }
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      if (!res.ok) {
        throw new Error(`Ошибка записи в календарь: ${res.status}`);
      }

      const eventResult = await res.json();
      
      // Save sync status locally
      setSyncedTaskIds(prev => ({
        ...prev,
        [activeSchedulingTask.id]: {
          eventId: eventResult.id,
          dateTime: startDate.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
        }
      }));

      setSuccessMsg(`Дело «${activeSchedulingTask.title}» успешно запланировано в Google Календарь!`);
      setActiveSchedulingTask(null);
      fetchUpcomingEvents();

      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Не удалось записать событие: ${err.message || err}`);
    } finally {
      setSyncingTask(null);
    }
  };

  // Delete/Cancel event with confirmation dialog
  const handleDeleteEvent = async (eventId: string, eventTitle: string, taskIdToUnlink?: string) => {
    // Mandated confirmation modal setup
    setDestructiveConfirm({
      eventId,
      eventTitle,
      action: async () => {
        if (!accessToken) return;
        setLoadingEvents(true);
        try {
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (!res.ok) {
            throw new Error(`Ошибка удаления: ${res.status}`);
          }

          setSuccessMsg(`Событие «${eventTitle}» успешно удалено из Google Календаря.`);
          
          // Unlink task if provided
          if (taskIdToUnlink) {
            setSyncedTaskIds(prev => {
              const copy = { ...prev };
              delete copy[taskIdToUnlink];
              return copy;
            });
          } else {
            // Find if any synced task matches this event ID
            setSyncedTaskIds(prev => {
              const copy = { ...prev };
              const foundKey = Object.keys(copy).find(k => copy[k].eventId === eventId);
              if (foundKey) delete copy[foundKey];
              return copy;
            });
          }

          fetchUpcomingEvents();
          setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
          console.error(err);
          setErrorMsg(`Не удалось удалить событие: ${err.message}`);
        } finally {
          setLoadingEvents(false);
          setDestructiveConfirm(null);
        }
      }
    });
  };

  // Format helper for calendar event times
  const formatEventTime = (start: CalendarEvent['start'], end: CalendarEvent['end']) => {
    if (!start) return 'Весь день';
    
    if (start.date) {
      const d = new Date(start.date);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ' (Весь день)';
    }

    if (start.dateTime) {
      const s = new Date(start.dateTime);
      const e = end && end.dateTime ? new Date(end.dateTime) : null;
      
      const dateStr = s.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      const timeStr = s.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const endTimeStr = e ? ' - ' + e.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';

      return `${dateStr}, ${timeStr}${endTimeStr}`;
    }

    return 'Неизвестное время';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6" id="google_calendar_screen">
      
      {/* Dynamic Success/Error Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-3 shadow-sm"
          >
            <CheckCircle className="stroke-emerald-600 shrink-0" size={20} />
            <div>{successMsg}</div>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold rounded-xl flex items-center gap-3 shadow-sm"
          >
            <AlertCircle className="stroke-rose-600 shrink-0" size={20} />
            <div>{errorMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center shrink-0">
            <CalendarIcon className="stroke-brand-medium" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Календарь Взаимопомощи</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
              Планируйте добрые дела в Устьянском районе и синхронизируйте их с вашим личным Google Календарем. Всегда будьте на связи и помогайте вовремя.
            </p>
          </div>
        </div>

        {/* Auth status block */}
        {googleUser ? (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2 pl-3 pr-4 rounded-2xl">
            {googleUser.photoURL ? (
              <img 
                src={googleUser.photoURL} 
                alt={googleUser.displayName || ''} 
                className="w-8 h-8 rounded-full border border-brand-medium shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-medium text-white font-bold flex items-center justify-center text-xs shrink-0">
                {googleUser.displayName ? googleUser.displayName[0] : 'U'}
              </div>
            )}
            <div className="text-left shrink-0">
              <div className="text-xs font-bold text-slate-800 line-clamp-1">{googleUser.displayName}</div>
              <div className="text-[10px] text-slate-400 line-clamp-1">{googleUser.email}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 hover:bg-slate-200/80 rounded-xl transition text-slate-400 hover:text-slate-700"
              title="Выйти из аккаунта Google"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center shrink-0">
            <span className="text-xs text-slate-400 mr-3 hidden sm:inline">Синхронизация отключена</span>
          </div>
        )}
      </div>

      {/* Main UI Body */}
      {!googleUser ? (
        // WELCOME SCREEN (UNAUTHENTICATED)
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center max-w-2xl mx-auto shadow-sm my-12">
          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center mx-auto mb-6">
            <CalendarRange className="stroke-brand-medium" size={40} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Подключите Google Календарь</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Вы сможете синхронизировать активные заявки о помощи, просматривать свободные слоты времени и планировать свои поездки и работы без накладок.
          </p>

          <div className="flex flex-col items-center justify-center">
            {/* Standard "Sign in with Google" styled button */}
            <button 
              onClick={handleSignIn}
              className="gsi-material-button transition-all transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              style={{ margin: '0 auto' }}
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Войти через Google</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        // DASHBOARD (AUTHENTICATED)
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: ACTIVE MUTUAL AID TASKS TO SYNC */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-medium"></span>
                  <h2 className="text-base font-bold text-slate-900">Мои Дела и Отклики</h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-light text-brand-medium rounded-full font-bold">
                  {myActiveCoordinatingTasks.length} дел
                </span>
              </div>

              {myActiveCoordinatingTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <HelpCircle size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">У вас пока нет активных просьб или откликов на помощь.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Откликнитесь на заявки в ленте, чтобы запланировать их здесь!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myActiveCoordinatingTasks.map(task => {
                    const isSynced = syncedTaskIds[task.id];
                    return (
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-2xl border transition-all ${
                          isSynced 
                            ? 'bg-emerald-50/40 border-emerald-100' 
                            : 'bg-white hover:bg-slate-50/50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                              {task.category === 'wood' && 'Колка дров'}
                              {task.category === 'tractor' && 'Трактор'}
                              {task.category === 'carpentry' && 'Строительство'}
                              {task.category === 'delivery' && 'Поездка / Доставка'}
                              {task.category === 'medical' && 'Медицина'}
                              {task.category === 'household' && 'Домашний уход'}
                              {task.category === 'other' && 'Другое'}
                            </span>
                            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{task.title}</h3>
                            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                              <MapPin size={12} className="text-slate-400" />
                              <span>д. {task.village} {task.locationDetails ? `(${task.locationDetails})` : ''}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{task.description}</p>
                          </div>

                          <div className="shrink-0 pt-1">
                            {isSynced ? (
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100/60 py-1 px-2.5 rounded-full">
                                  <Check size={12} className="stroke-emerald-600" />
                                  Запланировано
                                </span>
                                <button 
                                  onClick={() => handleDeleteEvent(isSynced.eventId, `Взаимопомощь: ${task.title}`, task.id)}
                                  className="text-[10px] text-red-500 hover:text-red-700 transition font-medium hover:underline flex items-center gap-1"
                                >
                                  <Trash2 size={10} />
                                  Отменить
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => initiateScheduleTask(task)}
                                className="flex items-center gap-1 bg-brand-medium text-white font-bold py-1.5 px-3 rounded-xl hover:bg-brand-dark transition text-xs shadow-sm hover:shadow"
                              >
                                <Plus size={14} />
                                Запланировать
                              </button>
                            )}
                          </div>
                        </div>

                        {isSynced && (
                          <div className="mt-2.5 pt-2 border-t border-emerald-100/60 flex items-center gap-2 text-[11px] text-emerald-800">
                            <Clock size={11} className="text-emerald-600" />
                            <span>Запись: <strong>{isSynced.dateTime}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: GOOGLE CALENDAR AGENDA */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h2 className="text-base font-bold text-slate-900">Календарь Google (События)</h2>
                </div>
                
                <button 
                  onClick={() => fetchUpcomingEvents()}
                  disabled={loadingEvents}
                  className="p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-700 disabled:opacity-50"
                  title="Обновить"
                >
                  <RefreshCw size={14} className={loadingEvents ? "animate-spin" : ""} />
                </button>
              </div>

              {loadingEvents ? (
                <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="animate-spin text-brand-medium mb-2" size={24} />
                  <span className="text-xs">Синхронизация с Google API...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <CalendarIcon size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">На ближайшее время запланированных событий не найдено.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Или у вас пустой календарь в Google.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {events.map(event => {
                    const isSyncedTask = Object.values(syncedTaskIds).some((v: any) => v.eventId === event.id);
                    return (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-left transition ${
                          isSyncedTask 
                            ? 'bg-emerald-50/30 border-emerald-100' 
                            : 'bg-slate-50/60 hover:bg-slate-50 border-slate-100/70'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{event.summary || '(Без названия)'}</h3>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock size={10} className="text-slate-400 shrink-0" />
                            <span>{formatEventTime(event.start, event.end)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 max-w-[200px] line-clamp-1">
                              <MapPin size={10} className="text-slate-400 shrink-0" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => handleDeleteEvent(event.id, event.summary || 'Событие')}
                          className="p-1 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition shrink-0"
                          title="Удалить событие"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SCHEDULE MODAL DIALOG */}
      <AnimatePresence>
        {activeSchedulingTask && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="stroke-brand-medium" size={20} />
                  <h3 className="text-sm font-black text-slate-900">Запланировать в Google Календарь</h3>
                </div>
                <button 
                  onClick={() => setActiveSchedulingTask(null)}
                  className="p-1.5 hover:bg-slate-200/80 rounded-full text-slate-400 hover:text-slate-700 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="bg-brand-light/30 border border-brand-light/70 rounded-2xl p-3 flex items-start gap-2 text-[11px] text-brand-dark">
                  <AlertCircle size={14} className="shrink-0 text-brand-medium mt-0.5" />
                  <p>Данные о задаче автоматически заполнят поля события. Вы можете отредактировать их перед добавлением.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Название события</label>
                  <input 
                    type="text" 
                    required
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-medium outline-none"
                    placeholder="Например: Заготовка дров"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Дата выполнения</label>
                    <input 
                      type="date" 
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-medium outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Время начала (МСК)</label>
                    <input 
                      type="time" 
                      required
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-medium outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Продолжительность (минут)</label>
                  <select 
                    value={scheduleDuration}
                    onChange={(e) => setScheduleDuration(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-medium outline-none"
                  >
                    <option value="30">30 минут</option>
                    <option value="60">1 час</option>
                    <option value="120">2 часа</option>
                    <option value="180">3 часа</option>
                    <option value="240">4 часа</option>
                    <option value="480">8 часов (весь день)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Место встречи</label>
                  <input 
                    type="text" 
                    value={scheduleLocation}
                    onChange={(e) => setScheduleLocation(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-medium outline-none"
                    placeholder="Например: д. Березник, ул. Лесная 12"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Описание события</label>
                  <textarea 
                    rows={4}
                    value={scheduleDescription}
                    onChange={(e) => setScheduleDescription(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-brand-medium outline-none resize-none font-mono text-[10px] leading-relaxed"
                    placeholder="Описание задачи и контактные данные..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setActiveSchedulingTask(null)}
                    className="px-4 py-2 hover:bg-slate-100 text-slate-500 font-bold rounded-xl text-xs transition"
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit" 
                    disabled={syncingTask !== null}
                    className="bg-brand-medium text-white font-black py-2 px-5 rounded-xl hover:bg-brand-dark transition text-xs shadow flex items-center gap-1.5 disabled:opacity-75"
                  >
                    {syncingTask ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Добавление...
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        Добавить событие
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANDATORY DESTRUCTIVE MUTATION CONFIRMATION MODAL */}
      <AnimatePresence>
        {destructiveConfirm && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fadeIn">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-100 shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-5 border-b border-rose-50 flex items-center gap-3 bg-rose-50 text-rose-800">
                <AlertCircle className="stroke-rose-600 shrink-0" size={22} />
                <h3 className="text-xs font-black uppercase tracking-wider">Подтвердите удаление</h3>
              </div>
              
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Вы действительно хотите удалить событие <strong className="text-slate-800">«{destructiveConfirm.eventTitle}»</strong> из вашего Google Календаря?
                </p>
                <p className="text-[10px] text-red-500 bg-red-50 border border-red-100 p-2.5 rounded-xl leading-relaxed">
                  Это действие необратимо и полностью удалит запись с серверов Google Календаря.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setDestructiveConfirm(null)}
                  className="px-3.5 py-1.5 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition"
                >
                  Отмена
                </button>
                <button 
                  onClick={() => destructiveConfirm.action()}
                  className="bg-rose-600 text-white font-black py-1.5 px-4 rounded-xl hover:bg-rose-700 transition text-xs shadow"
                >
                  Удалить навсегда
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
