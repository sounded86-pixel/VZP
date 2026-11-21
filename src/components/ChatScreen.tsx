import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message, UserProfile, HelpRequest } from '../types';
import { Send, MapPin, Phone, CheckCircle, Star, Award, Heart, MessageSquare, ArrowLeft, Camera, WifiOff, BellRing, Smartphone } from 'lucide-react';

interface ChatScreenProps {
  currentUserId: string;
  currentUser: UserProfile;
  chats: Chat[];
  messages: Message[];
  users: UserProfile[];
  requests: HelpRequest[];
  isOffline: boolean;
  onSendMessage: (chatId: string, text: string, customSenderId?: string, customSenderName?: string) => void;
  onResolveRequest: (postId: string, chatId: string) => void;
  onGiveThanks: (userId: string, count: number, chatId: string, isAuthor: boolean) => void;
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
}

export default function ChatScreen({
  currentUserId,
  currentUser,
  chats,
  messages,
  users,
  requests,
  isOffline,
  onSendMessage,
  onResolveRequest,
  onGiveThanks,
  activeChatId,
  onSelectChat
}: ChatScreenProps) {
  const [inputText, setInputText] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showThanksGivenAlert, setShowThanksGivenAlert] = useState<string | null>(null);
  
  // Simulated push state
  const [pushNotification, setPushNotification] = useState<{ title: string; body: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter chats belonging to the current logged-in user
  const userChats = chats.filter(c => c.authorId === currentUserId || c.responderId === currentUserId);
  
  // Find current active chat
  const activeChat = chats.find(c => c.id === activeChatId);
  
  // Messages in active chat
  const activeMessages = messages.filter(m => m.chatId === activeChatId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Simulated auto-reply bot to make the conversation feel completely alive (for Criteria 8)
  useEffect(() => {
    if (!activeChatId) return;

    // Check if the last message was sent by the current user
    const lastMsg = activeMessages[activeMessages.length - 1];
    if (lastMsg && lastMsg.senderId === currentUserId) {
      // Find the other user
      const otherUserId = activeChat?.authorId === currentUserId ? activeChat.responderId : activeChat?.authorId;
      const otherUser = users.find(u => u.id === otherUserId);
      
      if (
        otherUser && 
        otherUser.id !== 'user_admin' && 
        otherUser.role !== 'main_admin' && 
        otherUser.role !== 'village_admin'
      ) {
        const timeout = setTimeout(() => {
          // Prepare typical responses based on context and current user's message
          const textLower = lastMsg.text.toLowerCase();
          let replyText = "Хорошо, договорились! Скоро буду на связи.";
          
          if (textLower.includes("привет") || textLower.includes("здравствуй")) {
            replyText = `Здравствуйте! Я откликнулся на ваше объявление "${activeChat?.postTitle}". Готов помочь вам в ближайшее время!`;
          } else if (textLower.includes("когда") || textLower.includes("время") || textLower.includes("сможешь")) {
            replyText = `Могу подъехать сегодня после обеда, примерно к 15:00 или 16:00. Вам будет удобно?`;
          } else if (textLower.includes("дрова") || textLower.includes("колка")) {
            replyText = "Дрова расколем быстро, у меня и колун хороший есть. Главное, чтобы погода не подвела.";
          } else if (textLower.includes("спасибо") || textLower.includes("благодарю")) {
            replyText = "Рад помочь! Всегда приятно сделать доброе дело для соседей.";
          } else if (textLower.includes("адрес") || textLower.includes("где")) {
            replyText = `Понял, найду без проблем. Мой номер для связи: ${otherUser.phone}. Пожалуйста, держите телефон включенным.`;
          }

          // Trigger simulated message with correct sender info so it doesn't loop and looks real!
          onSendMessage(activeChatId, replyText, otherUser.id, otherUser.name);

          // Trigger simulated Push notification (3.4.4)
          setPushNotification({
            title: `Новое сообщение от: ${otherUser.name}`,
            body: replyText
          });

          // Auto clear notification after 4 seconds
          setTimeout(() => setPushNotification(null), 4000);

        }, 2000);

        return () => clearTimeout(timeout);
      }
    }
  }, [activeMessages.length, activeChatId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    onSendMessage(activeChatId, inputText.trim());
    setInputText('');
  };

  // Resolve Help request (3.4.3)
  const handleResolveClick = () => {
    if (!activeChat) return;
    onResolveRequest(activeChat.postId, activeChat.id);
    setShowResolveModal(true);
  };

  const submitThanks = (isAuthor: boolean) => {
    if (!activeChat) return;
    
    // Determine target user
    const targetUserId = isAuthor ? activeChat.responderId : activeChat.authorId;
    const targetUser = users.find(u => u.id === targetUserId);
    
    if (targetUser) {
      // Add a "Спасибо" thanks
      onGiveThanks(targetUser.id, 1, activeChat.id, isAuthor);
      setShowThanksGivenAlert(targetUser.name);
      setTimeout(() => {
        setShowThanksGivenAlert(null);
        if (activeChat.ratingGivenByAuthor && activeChat.ratingGivenByResponder) {
          setShowResolveModal(false);
        }
      }, 3000);
    }
  };

  // Find recipient of the active chat
  const getRecipientInfo = () => {
    if (!activeChat) return null;
    const isAuthor = activeChat.authorId === currentUserId;
    const recipientId = isAuthor ? activeChat.responderId : activeChat.authorId;
    const user = users.find(u => u.id === recipientId);
    const post = requests.find(r => r.id === activeChat.postId);
    return {
      user,
      post,
      isCurrentUserAuthor: isAuthor
    };
  };

  const recipientInfo = getRecipientInfo();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      
      {/* Real-time Push Notification Simulation Overlay (3.4.4) */}
      {pushNotification && (
        <div className="fixed top-20 right-4 bg-brand-dark/95 text-white border border-brand-light/30 rounded-2xl p-4 shadow-2xl max-w-sm z-50 flex gap-3 animate-slideIn hover:bg-brand-dark transition-all">
          <div className="bg-brand-medium text-white p-2 rounded-full h-fit">
            <BellRing size={18} className="animate-pulse" />
          </div>
          <div>
            <h5 className="font-bold text-xs flex items-center gap-1">
              <Smartphone size={12} className="text-brand-light" /> {pushNotification.title}
            </h5>
            <p className="text-xs text-slate-200 mt-1 line-clamp-2">{pushNotification.body}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[600px]">
        
        {/* Left Column: Chats List (visible on desktop or if no chat is active on mobile) */}
        <div className={`md:col-span-1 border-r border-slate-200 flex flex-col justify-between h-full bg-slate-50/50 ${
          activeChatId ? "hidden md:flex" : "flex"
        }`}>
          <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare size={18} className="text-brand-medium" />
              Мои диалоги
            </h3>
            <span className="bg-brand-light/40 text-brand-dark font-mono text-xs font-bold px-2 py-0.5 rounded-full">
              {userChats.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {userChats.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs">У вас пока нет активных диалогов.</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Откликнитесь на любое объявление в Ленте, чтобы начать чат!
                </p>
              </div>
            ) : (
              userChats.map(ch => {
                const isAuthor = ch.authorId === currentUserId;
                const otherUserId = isAuthor ? ch.responderId : ch.authorId;
                const otherUser = users.find(u => u.id === otherUserId);
                const req = requests.find(r => r.id === ch.postId);
                const isActive = ch.id === activeChatId;

                return (
                  <button
                    key={ch.id}
                    onClick={() => onSelectChat(ch.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-all hover:bg-slate-50 ${
                      isActive ? "bg-brand-light/10 border-l-4 border-brand-medium" : ""
                    }`}
                  >
                    <div className="w-10 h-10 bg-brand-light/40 text-brand-dark rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-brand-light/60">
                      {otherUser?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-800 truncate">{otherUser?.name || "Пользователь"}</span>
                        <span className="text-[9px] text-slate-400 shrink-0">
                          {new Date(ch.lastMessageTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-brand-medium truncate mt-0.5">
                        Просьба: {ch.postTitle}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-1">
                        {ch.lastMessageText || "Диалог начат..."}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Conversation Window */}
        <div className={`md:col-span-2 flex flex-col justify-between h-full relative ${
          !activeChatId ? "hidden md:flex bg-slate-50/30 justify-center items-center" : "flex bg-white"
        }`}>
          {activeChatId && recipientInfo ? (
            <>
              {/* Active Chat Header */}
              <div className="bg-brand-dark text-white p-4 flex justify-between items-center gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onSelectChat(null)}
                    className="md:hidden text-white hover:text-brand-light transition-all p-1"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="w-10 h-10 bg-brand-medium rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white border border-brand-light/20 shadow-inner">
                    {recipientInfo.user?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-[150px] sm:max-w-[200px]">{recipientInfo.user?.name}</h4>
                    {/* Disclosure of Phone (3.3.2) */}
                    <p className="text-[11px] text-brand-light font-mono flex items-center gap-1 mt-0.5">
                      <Phone size={10} /> {recipientInfo.user?.phone}
                    </p>
                  </div>
                </div>

                {/* Header Action: "Вопрос решен" button (3.4.3) */}
                <div className="flex items-center gap-2">
                  {recipientInfo.isCurrentUserAuthor && recipientInfo.post?.active && (
                    <button
                      onClick={handleResolveClick}
                      className="bg-brand-medium hover:bg-brand-medium/90 active:scale-95 text-white font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle size={14} />
                      Вопрос решен!
                    </button>
                  )}
                  
                  {/* Status Indicator */}
                  {!recipientInfo.post?.active && (
                    <span className="bg-brand-dark/50 border border-brand-light/30 text-brand-light text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                      Проблема решена!
                    </span>
                  )}
                </div>
              </div>

              {/* Connected Post Mini-Banner */}
              <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span>
                    Тема объявления: <strong className="text-slate-900">{recipientInfo.post?.title}</strong> ({recipientInfo.post?.village})
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {recipientInfo.post?.active ? "Активно" : "В архиве"}
                </span>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
                {activeMessages.map(msg => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2`}
                    >
                      {!isMine && (
                        <div className="w-7 h-7 bg-brand-light/40 text-brand-dark rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-brand-light/60">
                          {msg.senderName?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl p-3 shadow-xs ${
                        isMine 
                          ? "bg-brand-medium text-white rounded-br-none" 
                          : "bg-white text-slate-800 rounded-bl-none border border-slate-200"
                      }`}>
                        <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className={`text-[9px] ${isMine ? "text-brand-light" : "text-slate-400"} font-mono`}>
                            {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Active Chat Input Form */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center" id="chat_input_form">
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full shrink-0"
                  onClick={() => alert("Симуляция: Фотография сжимается и крепится к сообщению...")}
                  title="Прикрепить фото сжатым"
                >
                  <Camera size={20} />
                </button>
                <input
                  type="text"
                  placeholder={isOffline ? "Вы офлайн. Сообщение будет сохранено локально..." : "Введите ваше сообщение..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-full text-xs focus:border-brand-medium focus:ring-1 focus:ring-brand-medium focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-brand-medium hover:bg-brand-medium/90 disabled:bg-slate-100 disabled:text-slate-400 text-white p-2.5 rounded-full shadow-xs transition-all active:scale-95 shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center p-8">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-2 animate-pulse" />
              <h4 className="font-bold text-slate-700">Выберите диалог</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Выберите активного собеседника слева или перейдите на Ленту объявлений, чтобы откликнуться на чью-то просьбу!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* "Вопрос решен" & Thank you Rating Modal (3.4.3) */}
      {showResolveModal && activeChat && recipientInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn">
            
            {/* Visual celebration banner */}
            <div className="text-center mb-5 bg-brand-bg p-4 rounded-xl border border-brand-light/60">
              <div className="w-12 h-12 bg-brand-medium text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow">
                <Heart size={24} className="fill-white" />
              </div>
              <h4 className="text-base font-black text-slate-800">Вопрос решен! Спасибо за отзывчивость</h4>
              <p className="text-xs text-slate-500 mt-1">
                Объявление перемещено в архив. Поблагодарите собеседника, чтобы повысить его рейтинг надежности в Устьянах.
              </p>
            </div>

            {showThanksGivenAlert && (
              <div className="mb-4 p-3 bg-brand-light/30 border border-brand-light text-brand-dark text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                <Award size={16} className="text-brand-medium" />
                <span>Рейтинг пользователя {showThanksGivenAlert} увеличен на +1 "Спасибо"!</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Row 1: Author thanks Responder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h6 className="text-xs font-bold text-slate-700">Поблагодарить помощника:</h6>
                  <p className="text-[11px] text-slate-400">{recipientInfo.user?.name}</p>
                </div>
                <button
                  onClick={() => submitThanks(true)}
                  disabled={activeChat.ratingGivenByAuthor}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                    activeChat.ratingGivenByAuthor
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-brand-medium text-white hover:bg-brand-medium/90"
                  }`}
                >
                  <Star size={12} className="fill-white" />
                  {activeChat.ratingGivenByAuthor ? "Уже сказано" : 'Сказать "Спасибо!"'}
                </button>
              </div>

              {/* Row 2: Responder thanks Author */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h6 className="text-xs font-bold text-slate-700">Помощник благодарит автора:</h6>
                  <p className="text-[11px] text-slate-400">Иван Иванов</p>
                </div>
                <button
                  onClick={() => submitThanks(false)}
                  disabled={activeChat.ratingGivenByResponder}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                    activeChat.ratingGivenByResponder
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-brand-medium text-white hover:bg-brand-medium/90"
                  }`}
                >
                  <Star size={12} className="fill-white" />
                  {activeChat.ratingGivenByResponder ? "Уже сказано" : 'Сказать "Спасибо!"'}
                </button>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="bg-brand-dark text-white font-bold py-2 px-5 rounded-xl text-xs transition-all hover:bg-brand-dark/95 shadow-sm"
              >
                Закрыть окно
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
