import React, { useState, useEffect } from 'react';
import { 
  Page, 
  Widget, 
  WidgetType, 
  UserProfile, 
  HelpRequest, 
  Entrepreneur, 
  Order 
} from '../types';
import { 
  Hammer, 
  Flame, 
  Tractor, 
  Wrench, 
  Truck, 
  HeartPulse, 
  Home, 
  FileText, 
  HelpCircle, 
  MapPin, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  Trash, 
  Edit3, 
  Plus, 
  Image as ImageIcon, 
  List, 
  BarChart3, 
  Calendar as CalendarIcon, 
  Compass, 
  Star, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface CustomPageRendererProps {
  page: Page;
  isDeveloperMode: boolean; // if user is a developer
  isEditing: boolean; // if editing mode is toggled on
  users: UserProfile[];
  requests: HelpRequest[];
  entrepreneurs: Entrepreneur[];
  orders: Order[];
  onNavigate: (screen: string) => void;
  onEditWidget: (widget: Widget) => void;
  onDeleteWidget: (widgetId: string) => void;
  onMoveWidget: (widgetId: string, direction: 'up' | 'down') => void;
  onAddWidget: (order: number) => void;
  onWidgetDrop?: (draggedId: string, targetId: string) => void;
  onOpenDirectChat?: (recipientId: string) => void;
}

export const CustomPageRenderer: React.FC<CustomPageRendererProps> = ({
  page,
  isDeveloperMode,
  isEditing,
  users,
  requests,
  entrepreneurs,
  orders,
  onNavigate,
  onEditWidget,
  onDeleteWidget,
  onMoveWidget,
  onAddWidget,
  onWidgetDrop,
  onOpenDirectChat
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<{ [widgetId: string]: 'idle' | 'success' }>({});
  const [formInputs, setFormInputs] = useState<{ [fieldKey: string]: string }>({});

  // Background style helper
  const getPageBackgroundStyle = () => {
    const { settings } = page;
    if (!settings) return {};

    const style: React.CSSProperties = {
      paddingTop: `${settings.paddingTop || 16}px`,
      paddingBottom: `${settings.paddingBottom || 16}px`,
    };

    if (settings.backgroundType === 'gradient') {
      style.background = settings.backgroundGradient || 'linear-gradient(135deg, #f8fafc, #e2e8f0)';
    } else if (settings.backgroundType === 'image') {
      style.backgroundImage = `url(${settings.backgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundAttachment = 'scroll';
    } else {
      style.backgroundColor = settings.backgroundColor || '#f8fafc';
    }

    return style;
  };

  const handleAction = (widget: Widget) => {
    if (isEditing) return; // Do not execute actions in edit mode

    const action = widget.action;
    if (!action || action.type === 'none') return;

    if (action.type === 'navigate') {
      onNavigate(action.target);
    } else if (action.type === 'url') {
      window.open(action.target, '_blank', 'noopener,noreferrer');
    } else if (action.type === 'function') {
      if (action.target === 'open_chat') {
        onNavigate('chat');
      } else if (action.target === 'create_request') {
        onNavigate('create');
      } else if (action.target === 'open_sos') {
        onNavigate('sos');
      } else if (action.target === 'open_masters') {
        onNavigate('skills');
      } else if (action.target.startsWith('chat_with_')) {
        const userId = action.target.replace('chat_with_', '');
        if (onOpenDirectChat) {
          onOpenDirectChat(userId);
        } else {
          onNavigate('chat');
        }
      } else {
        alert(`Действие "${action.target}" выполнено!`);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent, widgetId: string) => {
    e.preventDefault();
    setFormStatus(prev => ({ ...prev, [widgetId]: 'success' }));
    setTimeout(() => {
      setFormStatus(prev => ({ ...prev, [widgetId]: 'idle' }));
    }, 5000);
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditing) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditing) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!isEditing || !draggedId || draggedId === targetId) return;
    e.preventDefault();
    if (onWidgetDrop) {
      onWidgetDrop(draggedId, targetId);
    }
    setDraggedId(null);
  };

  const renderWidgetContent = (widget: Widget) => {
    const { type, content, action } = widget;
    const isClickable = action && action.type !== 'none' && !isEditing;

    switch (type) {
      case 'header': {
        const Tag = content.fontSize === 'h1' ? 'h1' : content.fontSize === 'h2' ? 'h2' : 'h3';
        const sizeClasses = {
          h1: 'text-3xl md:text-4xl font-extrabold tracking-tight',
          h2: 'text-2xl md:text-3xl font-bold tracking-tight',
          h3: 'text-xl md:text-2xl font-semibold',
        };
        const alignClasses = {
          left: 'text-left',
          center: 'text-center',
          right: 'text-right',
        };

        return (
          <Tag 
            className={`font-sans text-slate-900 ${sizeClasses[content.fontSize || 'h2']} ${alignClasses[content.alignment || 'left']}`}
            style={{ color: content.color }}
          >
            {content.text || 'Новый заголовок'}
          </Tag>
        );
      }

      case 'text': {
        const alignClasses = {
          left: 'text-left',
          center: 'text-center',
          right: 'text-right',
        };

        return (
          <div 
            className={`text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap ${alignClasses[content.alignment || 'left']}`}
            style={{ color: widget.style.textColor }}
          >
            {content.text || 'Введите текст...'}
          </div>
        );
      }

      case 'image': {
        return (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-2xl shadow-md border border-slate-200">
              <img 
                src={content.imageUrl || 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80'} 
                alt={content.caption || 'Изображение'} 
                className={`w-full max-h-96 ${
                  content.crop === 'cover' ? 'object-cover' : content.crop === 'contain' ? 'object-contain' : ''
                }`}
                referrerPolicy="no-referrer"
              />
            </div>
            {content.caption && (
              <p className="text-xs text-center text-slate-500 italic font-medium">
                {content.caption}
              </p>
            )}
          </div>
        );
      }

      case 'button': {
        return (
          <div className={`w-full flex ${
            widget.content.alignment === 'center' ? 'justify-center' : widget.content.alignment === 'right' ? 'justify-end' : 'justify-start'
          }`}>
            <button
              onClick={() => handleAction(widget)}
              className="px-6 py-3 text-sm font-bold text-white transition-all rounded-xl shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: content.color || '#059669' }}
            >
              <span>{content.text || 'Кнопка'}</span>
              {action && action.type !== 'none' && <ArrowRight size={14} />}
            </button>
          </div>
        );
      }

      case 'list': {
        const isNumbered = content.listType === 'numbers';
        const items = content.items || ['Первый пункт', 'Второй пункт', 'Третий пункт'];

        return (
          <div className="space-y-1.5 text-slate-700 text-sm md:text-base">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                {isNumbered ? (
                  <span className="font-bold text-emerald-600 shrink-0 select-none mt-0.5">{idx + 1}.</span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-2"></span>
                )}
                <span>{item}</span>
              </div>
            ))}
          </div>
        );
      }

      case 'stats': {
        let statsLabel = content.statsLabel || 'Пользователи';
        let statsValue = content.statsValue || '0';

        if (content.statsType === 'users') {
          statsLabel = 'Жителей в сети';
          statsValue = String(users.length);
        } else if (content.statsType === 'requests') {
          statsLabel = 'Активных просьб о помощи';
          statsValue = String(requests.filter(r => r.active).length);
        } else if (content.statsType === 'masters') {
          statsLabel = 'Зарегистрированных мастеров';
          statsValue = String(entrepreneurs.length); // or masters.length
        } else if (content.statsType === 'orders') {
          statsLabel = 'Заказов выполнено';
          statsValue = String(orders.length);
        }

        return (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-black tracking-widest text-emerald-100">{statsLabel}</p>
              <h4 className="text-3xl font-black mt-1">{statsValue}</h4>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <BarChart3 size={24} className="text-white" />
            </div>
          </div>
        );
      }

      case 'map': {
        return (
          <div className="bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
            <div className="p-3 bg-slate-200/50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <MapPin size={13} className="text-red-500" />
                <span>Карта Устьянского Района ({content.mapCoords || 'Координаты'})</span>
              </div>
              <span className="text-[10px] bg-slate-300 text-slate-600 px-1.5 py-0.5 rounded font-mono">Zoom: {content.mapZoom || 12}</span>
            </div>
            
            {/* Interactive map visualization */}
            <div className="h-44 bg-slate-300 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Rivers/roads visual mock overlay */}
              <div className="absolute top-1/4 left-0 right-0 h-4 bg-sky-200 transform -rotate-3 blur-xs"></div>
              <div className="absolute top-0 bottom-0 left-1/3 w-6 bg-slate-200/80 transform rotate-12"></div>
              
              {/* Map Marker Pin */}
              <div className="relative z-10 flex flex-col items-center animate-bounce">
                <MapPin size={28} className="text-red-600 fill-red-200" />
                <div className="bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold shadow-lg mt-1 select-none">
                  Устьяны
                </div>
              </div>

              {content.mapMarkers && content.mapMarkers.map((marker, mIdx) => (
                <div key={mIdx} className="absolute text-slate-800 flex flex-col items-center" style={{ top: '30%', left: '70%' }}>
                  <MapPin size={18} className="text-amber-500" />
                  <span className="text-[8px] bg-white px-1 rounded shadow text-slate-700 font-bold">{marker.title}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'form': {
        const fields = content.formFields || [
          { type: 'text', label: 'Ваше имя', required: true },
          { type: 'phone', label: 'Номер телефона', required: true },
          { type: 'textarea', label: 'Сообщение/Заявка', required: false }
        ];

        const isSuccess = formStatus[widget.id] === 'success';

        return (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={15} className="text-brand-medium" />
              <span>{content.text || 'Форма обратной связи'}</span>
            </h4>
            
            {isSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-2 animate-fadeIn">
                <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  ✓
                </div>
                <h5 className="text-xs font-bold text-emerald-800">Заявка успешно отправлена!</h5>
                <p className="text-[11px] text-emerald-600">Мы получили ваши данные и свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form onSubmit={(e) => handleFormSubmit(e, widget.id)} className="space-y-3">
                {fields.map((field, fIdx) => (
                  <div key={fIdx} className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-0.5">
                      <span>{field.label}</span>
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        rows={3}
                        onChange={(e) => setFormInputs(prev => ({ ...prev, [`${widget.id}_${fIdx}`]: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-medium focus:outline-none"
                        placeholder="Напишите тут..."
                      />
                    ) : (
                      <input
                        type={field.type === 'phone' ? 'tel' : 'text'}
                        required={field.required}
                        onChange={(e) => setFormInputs(prev => ({ ...prev, [`${widget.id}_${fIdx}`]: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-medium focus:outline-none"
                        placeholder={field.type === 'phone' ? '+7 (___) ___-__-__' : 'Введите значение'}
                      />
                    )}
                  </div>
                ))}
                
                <button
                  type="submit"
                  disabled={isEditing}
                  className="w-full py-2.5 bg-brand-medium hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {content.formSubmitText || 'Отправить'}
                </button>
              </form>
            )}
          </div>
        );
      }

      case 'link': {
        return (
          <button
            onClick={() => handleAction(widget)}
            className="text-brand-medium hover:text-brand-dark font-bold text-xs inline-flex items-center gap-1 transition-colors border-b border-dashed border-brand-medium/50 hover:border-brand-dark pb-0.5 cursor-pointer"
          >
            {content.text || 'Узнать больше'}
            <ArrowRight size={12} />
          </button>
        );
      }

      case 'gallery': {
        const images = content.galleryUrls && content.galleryUrls.length > 0 
          ? content.galleryUrls 
          : [
              'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
            ];
        
        return (
          <div className="space-y-1">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x">
              {images.map((img, index) => (
                <div key={index} className="w-48 shrink-0 snap-center rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <img src={img} alt={`Слайд ${index+1}`} className="h-32 w-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            {content.caption && (
              <p className="text-[10px] text-center text-slate-400 font-medium italic">{content.caption}</p>
            )}
          </div>
        );
      }

      case 'news': {
        const activeRequests = requests.filter(r => r.active).slice(0, content.newsLimit || 3);
        return (
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={14} className="text-brand-medium animate-pulse" />
              <span>Лента взаимопомощи</span>
            </h4>
            {activeRequests.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Активных объявлений нет.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {activeRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-white border border-slate-150 rounded-2xl shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{req.category}</span>
                      <span className="text-[9px] text-slate-400">{req.village}</span>
                    </div>
                    <h5 className="text-xs font-extrabold text-slate-900 truncate">{req.title}</h5>
                    <p className="text-[10px] text-slate-600 line-clamp-2">{req.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'masters': {
        const approvedEntrepreneurs = entrepreneurs.filter(e => e.isActive && e.moderationStatus === 'approved').slice(0, 3);
        return (
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
              <Hammer size={14} className="text-brand-medium" />
              <span>Наши мастера</span>
            </h4>
            <div className="grid gap-2">
              {approvedEntrepreneurs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Мастера еще не добавлены.</p>
              ) : (
                approvedEntrepreneurs.map((ent) => (
                  <div key={ent.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
                    <div>
                      <h5 className="text-xs font-black text-slate-900">{ent.businessName}</h5>
                      <p className="text-[10px] text-slate-500">Тел: {ent.contactPhone}</p>
                    </div>
                    <button 
                      onClick={() => handleAction(widget)}
                      className="px-2.5 py-1 bg-brand-medium text-white font-bold text-[10px] rounded-lg cursor-pointer"
                    >
                      Написать
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      case 'entrepreneurs': {
        const activeEnt = entrepreneurs.filter(e => e.isActive && e.moderationStatus === 'approved').slice(0, 3);
        return (
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1">
              <Truck size={14} className="text-brand-medium" />
              <span>Доставка товаров / Предприниматели</span>
            </h4>
            <div className="grid gap-2">
              {activeEnt.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Предприниматели не зарегистрированы.</p>
              ) : (
                activeEnt.map((ent) => (
                  <div key={ent.id} className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-brand-medium rounded-xl">
                      <Truck size={18} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900">{ent.businessName}</h5>
                      <p className="text-[10px] text-slate-500">Доставка: {ent.village || 'Район'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      }

      case 'calendar': {
        return (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon size={14} className="text-brand-medium" />
              <span>Районные события ({content.calendarPeriod || 'Ближайшие'})</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-white rounded-xl border border-slate-100 flex gap-2.5">
                <div className="bg-emerald-50 text-emerald-700 font-extrabold px-2 py-1 rounded text-center shrink-0 min-w-[40px]">
                  <p className="text-[10px]">ИЮЛ</p>
                  <p className="text-sm font-black">15</p>
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800">День Поселка Октябрьский</h5>
                  <p className="text-[10px] text-slate-500">Ярмарка, концерт и народные гулянья</p>
                </div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100 flex gap-2.5">
                <div className="bg-emerald-50 text-emerald-700 font-extrabold px-2 py-1 rounded text-center shrink-0 min-w-[40px]">
                  <p className="text-[10px]">АВГ</p>
                  <p className="text-sm font-black">02</p>
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800">Малиновка Эко-Ралли</h5>
                  <p className="text-[10px] text-slate-500">Спортивный забег по холмам Устьян</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'sos': {
        return (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-5 text-center space-y-3 shadow-sm">
            <h4 className="text-xs font-black text-red-800 uppercase tracking-widest flex items-center justify-center gap-1 animate-pulse">
              <AlertTriangle size={15} />
              <span>{content.sosText || 'Экстренная помощь'}</span>
            </h4>
            <p className="text-[11px] text-red-600">Нажмите кнопку ниже для быстрой связи со службой спасения или волонтерами района.</p>
            <button
              onClick={() => handleAction(widget)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer shadow-lg active:scale-95 animate-pulse inline-flex items-center gap-1.5"
            >
              <Phone size={14} />
              <span>Позвонить 112 / SOS</span>
            </button>
          </div>
        );
      }

      case 'divider': {
        const thickness = content.dividerThickness || 1;
        const color = content.dividerColor || '#cbd5e1';
        const dStyle = content.dividerStyle || 'solid';

        return (
          <div 
            className="w-full" 
            style={{ 
              borderTopWidth: `${thickness}px`, 
              borderTopColor: color, 
              borderTopStyle: dStyle 
            }} 
          />
        );
      }

      default:
        return <p className="text-xs text-slate-400">Неизвестный блок</p>;
    }
  };

  // Ensure widgets are sorted by order
  const sortedWidgets = [...page.widgets].sort((a, b) => a.order - b.order);

  return (
    <div className="relative font-sans min-h-[60vh] pb-16 transition-all" style={getPageBackgroundStyle()}>
      
      {/* View/Edit Mode Header Banner inside the custom page (only for developer to see current state) */}
      {isDeveloperMode && (
        <div className="max-w-2xl mx-auto mb-6 px-4">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-center justify-between text-xs font-extrabold shadow-md">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isEditing ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isEditing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span>
                КОНСТРУКТОР: <span className="text-slate-300 font-normal">"{page.title}"</span> ({page.path})
              </span>
            </div>
            <div className="bg-slate-800 text-[10px] px-2 py-0.5 rounded">
              {isEditing ? '📝 РЕЖИМ РЕДАКТИРОВАНИЯ' : '👁️ РЕЖИМ ПРОСМОТРА'}
            </div>
          </div>
        </div>
      )}

      {/* Main Widgets Container */}
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        
        {/* If no widgets exist */}
        {sortedWidgets.length === 0 && (
          <div className="bg-white/85 border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-4 shadow-sm">
            <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Plus size={24} />
            </div>
            <h4 className="text-sm font-black text-slate-800">Эта страница пуста</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Войдите в режим редактирования, чтобы добавить заголовок, текст, кнопки, картинки, карту и другие полезные блоки.
            </p>
            {isEditing && (
              <button
                onClick={() => onAddWidget(0)}
                className="px-4 py-2 bg-brand-medium text-white font-extrabold text-xs rounded-xl hover:bg-brand-dark transition-all cursor-pointer"
              >
                + Добавить первый блок
              </button>
            )}
          </div>
        )}

        {sortedWidgets.map((widget, index) => {
          // Calculate paddings and margins for the wrapper
          const styleWrapper: React.CSSProperties = {
            paddingTop: `${widget.style.paddingTop || 0}px`,
            paddingBottom: `${widget.style.paddingBottom || 0}px`,
            marginTop: `${widget.style.marginTop || 0}px`,
            marginBottom: `${widget.style.marginBottom || 0}px`,
            width: widget.style.width ? `${widget.style.width}%` : '100%',
          };

          const isCurrentlyDragged = draggedId === widget.id;

          return (
            <div
              key={widget.id}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, widget.id)}
              className={`group relative transition-all rounded-3xl ${
                isEditing 
                  ? `border-2 border-dashed p-4 hover:bg-brand-medium/5 cursor-move ${
                      isCurrentlyDragged ? 'border-brand-medium bg-brand-medium/10 opacity-50' : 'border-slate-300 hover:border-brand-medium'
                    }` 
                  : widget.mobileHidden ? 'hidden md:block' : ''
              }`}
              style={styleWrapper}
            >
              
              {/* Edit HUD overlay */}
              {isEditing && (
                <div className="absolute -top-3.5 left-4 right-4 z-20 flex items-center justify-between text-[10px] font-black select-none pointer-events-none">
                  <div className="bg-brand-dark text-white px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm pointer-events-auto">
                    {widget.type === 'header' && <Sparkles size={10} />}
                    {widget.type === 'text' && <FileText size={10} />}
                    {widget.type === 'image' && <ImageIcon size={10} />}
                    {widget.type === 'button' && <Info size={10} />}
                    <span>{widget.type.toUpperCase()}</span>
                  </div>
                  
                  {/* Action buttons (Move, Edit, Delete) */}
                  <div className="flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-lg shadow-sm pointer-events-auto">
                    {index > 0 && (
                      <button 
                        onClick={() => onMoveWidget(widget.id, 'up')}
                        className="hover:text-emerald-400 p-0.5" 
                        title="Вверх"
                      >
                        <ChevronUp size={11} />
                      </button>
                    )}
                    {index < sortedWidgets.length - 1 && (
                      <button 
                        onClick={() => onMoveWidget(widget.id, 'down')}
                        className="hover:text-emerald-400 p-0.5" 
                        title="Вниз"
                      >
                        <ChevronDown size={11} />
                      </button>
                    )}
                    <span className="text-slate-600 px-0.5">|</span>
                    <button 
                      onClick={() => onEditWidget(widget)}
                      className="hover:text-amber-400 p-0.5 flex items-center gap-0.5" 
                      title="Редактировать параметры"
                    >
                      <Edit3 size={11} />
                    </button>
                    <span className="text-slate-600 px-0.5">|</span>
                    <button 
                      onClick={() => onDeleteWidget(widget.id)}
                      className="hover:text-red-400 p-0.5" 
                      title="Удалить"
                    >
                      <Trash size={11} />
                    </button>
                  </div>
                </div>
              )}

              {/* Render Widget Body */}
              <div className="w-full">
                {renderWidgetContent(widget)}
              </div>

              {/* Edit Mode Quick Add Inline Button (shown at the bottom border of the block on hover) */}
              {isEditing && (
                <div className="absolute -bottom-3.5 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto">
                  <button
                    onClick={() => onAddWidget(widget.order + 1)}
                    className="bg-brand-medium text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider hover:bg-brand-dark flex items-center gap-1 shadow-md cursor-pointer transition-all"
                  >
                    <Plus size={10} />
                    <span>Вставить блок</span>
                  </button>
                </div>
              )}

            </div>
          );
        })}

        {/* Add block button at the end if editing */}
        {isEditing && sortedWidgets.length > 0 && (
          <div className="pt-4 pb-8 flex justify-center">
            <button
              onClick={() => onAddWidget(sortedWidgets[sortedWidgets.length - 1].order + 1)}
              className="px-5 py-2.5 bg-brand-medium hover:bg-brand-dark text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Добавить блок в конец</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
