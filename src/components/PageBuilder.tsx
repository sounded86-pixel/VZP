import React, { useState, useEffect } from 'react';
import { 
  Page, 
  Widget, 
  WidgetType, 
  PageHistory, 
  UserProfile, 
  HelpRequest, 
  Entrepreneur, 
  Order 
} from '../types';
import { 
  dbCreatePage, 
  dbUpdatePage, 
  dbDeletePage, 
  dbCreatePageHistory, 
  dbSubscribePageHistory 
} from '../firebaseSync';
import { CustomPageRenderer } from './CustomPageRenderer';
import { 
  Settings, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  Info, 
  List, 
  BarChart3, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  Calendar, 
  Hammer, 
  Truck, 
  Link as LinkIcon, 
  Eye, 
  Edit3, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Copy, 
  RotateCcw, 
  Layout, 
  Check, 
  Download, 
  Upload, 
  ChevronRight,
  Sliders,
  Palette,
  EyeOff
} from 'lucide-react';

interface PageBuilderProps {
  pages: Page[];
  users: UserProfile[];
  requests: HelpRequest[];
  entrepreneurs: Entrepreneur[];
  orders: Order[];
  currentUser: UserProfile;
  onNavigate: (screen: string) => void;
}

const WIDGET_TYPES: { type: WidgetType; label: string; icon: any; desc: string }[] = [
  { type: 'header', label: 'Заголовок', icon: Sparkles, desc: 'Крупный текст с выбором размера' },
  { type: 'text', label: 'Параграф', icon: FileText, desc: 'Обычный текст с переносами строк' },
  { type: 'image', label: 'Изображение', icon: ImageIcon, desc: 'Картинка по ссылке с подписью' },
  { type: 'button', label: 'Кнопка действия', icon: Info, desc: 'Кнопка с переходом или вызовом функции' },
  { type: 'list', label: 'Список', icon: List, desc: 'Маркированный или нумерованный список' },
  { type: 'stats', label: 'Статистика', icon: BarChart3, desc: 'Индикатор (кол-во жителей, заказов, просьб)' },
  { type: 'map', label: 'Карта района', icon: MapPin, desc: 'Интерактивная карта с меткой Устьян' },
  { type: 'form', label: 'Форма заявки', icon: FileText, desc: 'Форма сбора ФИО, телефона и обращений' },
  { type: 'link', label: 'Ссылка-текст', icon: LinkIcon, desc: 'Простая текстовая ссылка с переходом' },
  { type: 'gallery', label: 'Карусель картинок', icon: ImageIcon, desc: 'Галерея из нескольких изображений' },
  { type: 'news', label: 'Лента новостей', icon: Sparkles, desc: 'Список последних объявлений района' },
  { type: 'masters', label: 'Список мастеров', icon: Hammer, desc: 'Виджет каталога проверенных мастеров' },
  { type: 'entrepreneurs', label: 'Предприниматели', icon: Truck, desc: 'Виджет местных производителей' },
  { type: 'calendar', label: 'Календарь событий', icon: Calendar, desc: 'Расписание праздников и ярмарок' },
  { type: 'sos', label: 'Кнопка SOS', icon: AlertTriangle, desc: 'Крупный блок экстренного вызова 112' },
  { type: 'divider', label: 'Разделитель', icon: Sliders, desc: 'Горизонтальная декоративная линия' },
];

export const PageBuilder: React.FC<PageBuilderProps> = ({
  pages,
  users,
  requests,
  entrepreneurs,
  orders,
  currentUser,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'theme'>('pages');
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  
  // Page creation form
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newPageTitle, setNewPageTitle] = useState<string>('');
  const [newPagePath, setNewPagePath] = useState<string>('');
  const [newPageTemplate, setNewPageTemplate] = useState<'empty' | 'home' | 'contacts' | 'news'>('empty');

  // Selected widget for editing details
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [widgetHistory, setWidgetHistory] = useState<PageHistory[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showImportExport, setShowImportExport] = useState<boolean>(false);
  const [jsonClipboard, setJsonClipboard] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [showToast, setShowToast] = useState<string | null>(null);

  // Global theme visual state (simulated since theme is saved in pages)
  const [primaryColor, setPrimaryColor] = useState<string>('#059669');
  const [accentColor, setAccentColor] = useState<string>('#0d9488');
  const [borderRadius, setBorderRadius] = useState<string>('16px');

  // Fetch page history when page is selected
  useEffect(() => {
    if (selectedPage) {
      const unsub = dbSubscribePageHistory(selectedPage.id, (history) => {
        setWidgetHistory(history);
      });
      return unsub;
    } else {
      setWidgetHistory([]);
    }
  }, [selectedPage?.id]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    // Transliterate title if path is empty
    let path = newPagePath.trim();
    if (!path) {
      path = '/' + newPageTitle
        .toLowerCase()
        .replace(/[^a-z0-9а-яё\s]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/[а-яё]/gi, (char) => {
          const dict: { [key: string]: string } = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return dict[char.toLowerCase()] || char;
        });
    }
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Verify uniqueness of path
    if (pages.some(p => p.path === path)) {
      alert('Ошибка: Страница с таким адресом уже существует!');
      return;
    }

    const pageId = 'page_' + Math.random().toString(36).substring(2, 11);
    
    // Generate widgets based on chosen template
    let widgets: Widget[] = [];
    if (newPageTemplate === 'home') {
      widgets = [
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'header',
          order: 0,
          content: { text: newPageTitle, fontSize: 'h1', alignment: 'center', color: '#1e293b' },
          style: { paddingTop: 10, paddingBottom: 10 }
        },
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'stats',
          order: 1,
          content: { statsType: 'users' },
          style: { paddingTop: 10, paddingBottom: 10 }
        },
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'text',
          order: 2,
          content: { text: 'Добро пожаловать в новый раздел! Вы можете полностью перестроить его под свои нужды.', alignment: 'center' },
          style: { paddingTop: 10, paddingBottom: 10, textColor: '#475569' }
        },
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'button',
          order: 3,
          content: { text: 'Нажми на меня', color: '#059669', alignment: 'center' },
          style: { paddingTop: 10, paddingBottom: 10 },
          action: { type: 'navigate', target: 'lenta' }
        }
      ];
    } else if (newPageTemplate === 'contacts') {
      widgets = [
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'header',
          order: 0,
          content: { text: '💰 СИСТЕМА БАЛЛОВ «СПАСИБО»', fontSize: 'h1', color: '#10b981', alignment: 'center' },
          style: { paddingTop: 10, paddingBottom: 10 }
        },
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'text',
          order: 1,
          content: { 
            text: '«Что такое баллы «Спасибо» и зачем они нужны? Каждый раз, когда вы помогаете соседу или получаете благодарность, вам начисляются баллы «Спасибо». Это наш способ сказать, что мы ценим вашу доброту и активность.\n\nПочему баллы важны?\nВ будущем, когда приложение станет популярным и начнёт приносить реальный доход, каждый балл «Спасибо» будет равен 1 рублю. Это значит, что вы сможете обменять накопленные баллы на реальные деньги или услуги.\n\nКогда это произойдёт?\nКогда количество установок приложения достигнет 10 000 (или другой порог), мы запустим программу обмена баллов на реальные деньги. До этого момента баллы копятся и не сгорают.\n\nПочему мы не платим сейчас?\nПотому что пока приложение не приносит дохода, мы не можем платить из своего кармана. Но как только приложение станет популярным — мы запустим обмен.\n\nЧто делать сейчас?\nУстанавливайте приложение, проходите обучение, помогайте соседям и копите баллы. У вас есть реальный шанс быть первыми, кто заработает на этом приложении!»',
            alignment: 'left' 
          },
          style: { paddingTop: 15, paddingBottom: 15, textColor: '#1f2937' }
        },
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'divider',
          order: 2,
          content: { dividerThickness: 2, dividerColor: '#e2e8f0', dividerStyle: 'dashed' },
          style: { paddingTop: 10, paddingBottom: 10 }
        },
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'header',
          order: 3,
          content: { text: '🏆 «Почему мы не платим прямо сейчас?»', fontSize: 'h2', color: '#0f172a', alignment: 'center' },
          style: { paddingTop: 10, paddingBottom: 10 }
        },
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'text',
          order: 4,
          content: { 
            text: 'Многие спрашивают: «Почему вы не даёте деньги за «Спасибо» сразу?»\n\nОтвет прост:\nМы — разработчики, а не спонсоры. Мы создали приложение, чтобы помочь жителям Устьянского района. Мы не получаем прибыль от приложения, пока оно не станет популярным.\n\nКогда мы начнём платить?\nКогда количество установок достигнет 10 000. Это покажет, что приложение действительно нужно людям, и мы сможем привлекать рекламодателей и партнёров, которые готовы платить за развитие.\n\nЧто делать сейчас?\n1. Установи приложение\n2. Пройди «Цифровую грамотность»\n3. Помогай соседям\n4. Копи «Спасибо»\n\nТы — первопроходец. У тебя есть реальный шанс заработать, пока другие ещё не знают о приложении. 🚀',
            alignment: 'left' 
          },
          style: { paddingTop: 15, paddingBottom: 25, textColor: '#1f2937' }
        }
      ];
    } else if (newPageTemplate === 'news') {
      widgets = [
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'header',
          order: 0,
          content: { text: 'Сводка новостей', fontSize: 'h1', alignment: 'left' },
          style: { paddingTop: 10, paddingBottom: 10 }
        },
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'news',
          order: 1,
          content: { newsLimit: 4 },
          style: { paddingTop: 10, paddingBottom: 10 }
        }
      ];
    } else {
      // Empty Template
      widgets = [
        {
          id: 'w_' + Math.random().toString(36).substring(2, 9),
          type: 'header',
          order: 0,
          content: { text: newPageTitle, fontSize: 'h2', alignment: 'left' },
          style: { paddingTop: 10, paddingBottom: 10 }
        }
      ];
    }

    const newPage: Page = {
      id: pageId,
      title: newPageTitle,
      path: path,
      order: pages.length + 1,
      isActive: true,
      isHome: false,
      settings: {
        backgroundType: 'color',
        backgroundColor: '#f8fafc',
        paddingTop: 24,
        paddingBottom: 24
      },
      widgets: widgets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    await dbCreatePage(newPage);
    setSelectedPage(newPage);
    setEditMode(true);
    setShowCreateModal(false);
    setNewPageTitle('');
    setNewPagePath('');
    setNewPageTemplate('empty');
    triggerToast('Страница успешно создана!');
  };

  const handleSavePage = async () => {
    if (!selectedPage) return;

    // Check version backups: save history first
    const historyId = 'hist_' + Math.random().toString(36).substring(2, 11);
    const history: PageHistory = {
      id: historyId,
      pageId: selectedPage.id,
      version: selectedPage.version || 1,
      title: selectedPage.title,
      widgets: selectedPage.widgets,
      settings: selectedPage.settings,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name || 'Developer'
    };

    await dbCreatePageHistory(history);

    // Save actual page incrementing version
    const updatedPage: Page = {
      ...selectedPage,
      version: (selectedPage.version || 1) + 1,
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };

    await dbUpdatePage(selectedPage.id, updatedPage);
    setSelectedPage(updatedPage);
    triggerToast('Изменения успешно опубликованы!');
  };

  const handleDeletePage = async (pageId: string) => {
    if (!window.confirm('Вы действительно хотите БЕЗВОЗВРАТНО удалить эту страницу? Все виджеты и настройки пропадут.')) {
      return;
    }
    await dbDeletePage(pageId);
    setSelectedPage(null);
    setEditMode(false);
    triggerToast('Страница удалена.');
  };

  // Rollback to historical version
  const handleRollback = async (hist: PageHistory) => {
    if (!selectedPage) return;
    if (!window.confirm(`Вы уверены, что хотите откатить страницу к версии ${hist.version} от ${new Date(hist.createdAt).toLocaleDateString()}?`)) {
      return;
    }

    const restoredPage: Page = {
      ...selectedPage,
      widgets: hist.widgets,
      settings: hist.settings || selectedPage.settings,
      title: hist.title || selectedPage.title,
      updatedAt: new Date().toISOString(),
      version: selectedPage.version + 1
    };

    await dbUpdatePage(selectedPage.id, restoredPage);
    setSelectedPage(restoredPage);
    setShowHistoryModal(false);
    triggerToast('Откат версии успешно выполнен!');
  };

  // Widget management operations inside the page state
  const handleAddWidget = (insertOrder: number) => {
    if (!selectedPage) return;
    
    // Choose widget type
    const tempId = 'w_new_' + Math.random().toString(36).substring(2, 7);
    const defaultWidget: Widget = {
      id: tempId,
      type: 'text',
      order: insertOrder,
      content: { text: 'Новый текстовый блок. Нажмите на иконку карандаша для настройки.', alignment: 'left' },
      style: { paddingTop: 8, paddingBottom: 8 }
    };

    // Increment order of downstream widgets
    const updatedWidgets = selectedPage.widgets.map(w => {
      if (w.order >= insertOrder) {
        return { ...w, order: w.order + 1 };
      }
      return w;
    });

    const finalWidgets = [...updatedWidgets, defaultWidget].sort((a, b) => a.order - b.order);
    
    setSelectedPage({
      ...selectedPage,
      widgets: finalWidgets
    });

    // Auto-select the newly added widget for immediate edit
    setEditingWidget(defaultWidget);
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
  };

  const handleUpdateWidgetDetails = (updated: Widget) => {
    if (!selectedPage) return;

    const list = selectedPage.widgets.map(w => w.id === updated.id ? updated : w);
    setSelectedPage({
      ...selectedPage,
      widgets: list
    });
    setEditingWidget(updated);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!selectedPage) return;

    const list = selectedPage.widgets
      .filter(w => w.id !== widgetId)
      .map((w, idx) => ({ ...w, order: idx })); // Recalculate order to be sequential

    setSelectedPage({
      ...selectedPage,
      widgets: list
    });
    
    if (editingWidget?.id === widgetId) {
      setEditingWidget(null);
    }
    triggerToast('Виджет удален');
  };

  const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
    if (!selectedPage) return;

    const sorted = [...selectedPage.widgets].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(w => w.id === widgetId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      // Swap order
      const temp = sorted[index].order;
      sorted[index].order = sorted[index - 1].order;
      sorted[index - 1].order = temp;
    } else if (direction === 'down' && index < sorted.length - 1) {
      const temp = sorted[index].order;
      sorted[index].order = sorted[index + 1].order;
      sorted[index + 1].order = temp;
    }

    setSelectedPage({
      ...selectedPage,
      widgets: sorted.sort((a, b) => a.order - b.order)
    });
  };

  const handleWidgetDrop = (draggedId: string, targetId: string) => {
    if (!selectedPage) return;

    const list = [...selectedPage.widgets];
    const draggedIdx = list.findIndex(w => w.id === draggedId);
    const targetIdx = list.findIndex(w => w.id === targetId);
    if (draggedIdx === -1 || targetIdx === -1) return;

    // Swap orders
    const tempOrder = list[draggedIdx].order;
    list[draggedIdx].order = list[targetIdx].order;
    list[targetIdx].order = tempOrder;

    setSelectedPage({
      ...selectedPage,
      widgets: list.sort((a, b) => a.order - b.order)
    });
  };

  // Export / Import JSON functionality
  const handleOpenExport = () => {
    if (!selectedPage) return;
    setJsonClipboard(JSON.stringify(selectedPage, null, 2));
    setImportError('');
    setShowImportExport(true);
  };

  const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(jsonClipboard);
      if (!parsed.id || !parsed.title || !Array.isArray(parsed.widgets)) {
        setImportError('Некорректная структура JSON. Должны быть id, title и массив widgets.');
        return;
      }

      const importedPage: Page = {
        ...parsed,
        id: selectedPage?.id || parsed.id, // preserve selected page ID if overwriting
        updatedAt: new Date().toISOString()
      };

      setSelectedPage(importedPage);
      setShowImportExport(false);
      triggerToast('Конфигурация успешно импортирована!');
    } catch (err: any) {
      setImportError('Ошибка парсинга JSON: ' + err.message);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col md:flex-row relative">
      
      {/* Visual Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2 animate-bounce">
          <Check size={16} className="text-emerald-400" />
          <span>{showToast}</span>
        </div>
      )}

      {/* LEFT SIDEBAR: Pages list and Settings */}
      <div className="w-full md:w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="text-emerald-600 h-5 w-5" />
            <span className="font-black text-sm uppercase tracking-wider text-slate-700">Конструктор меню</span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 cursor-pointer transition-colors"
            title="Создать новую страницу"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Tab switcher: pages vs global theme */}
        <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 p-1 m-3 rounded-2xl">
          <button
            onClick={() => { setActiveTab('pages'); setSelectedPage(null); setEditMode(false); }}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'pages' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
            }`}
          >
            📂 Страницы ({pages.length})
          </button>
          <button
            onClick={() => { setActiveTab('theme'); setSelectedPage(null); }}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              activeTab === 'theme' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
            }`}
          >
            🎨 Тема меню
          </button>
        </div>

        {activeTab === 'pages' && (
          <div className="flex-1 px-3 py-2 space-y-1">
            {pages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Нет доступных страниц. Создайте первую!</p>
            ) : (
              pages.map((p) => {
                const isSelected = selectedPage?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPage(p);
                      setEditMode(false);
                      setEditingWidget(null);
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-50 border border-emerald-100 text-emerald-900 font-bold' 
                        : 'hover:bg-slate-50 border border-transparent text-slate-600'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <h4 className="text-xs font-bold truncate flex items-center gap-1.5">
                        {p.title}
                        {p.isHome && <span className="text-[9px] bg-emerald-600 text-white px-1 rounded">Главная</span>}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{p.path}</p>
                    </div>
                    <ChevronRight size={14} className={isSelected ? 'text-emerald-600' : 'text-slate-300'} />
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="p-4 space-y-5">
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl space-y-1">
              <h5 className="text-xs font-black flex items-center gap-1">
                <Palette size={14} />
                <span>Глобальные стили</span>
              </h5>
              <p className="text-[10px] text-emerald-600 leading-relaxed">
                Параметры шрифтов и цветов применяются ко всем сгенерированным в конструкторе страницам автоматически.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Основной цвет бренда</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="h-8 w-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Акцентный цвет кнопок</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={accentColor} 
                    onChange={(e) => setAccentColor(e.target.value)} 
                    className="h-8 w-8 rounded border border-slate-300 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={accentColor} 
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Закругление углов карт (Radius)</label>
                <select 
                  value={borderRadius} 
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="4px">Минимальное (4px)</option>
                  <option value="12px">Стандартное (12px)</option>
                  <option value="16px">Округлое (16px)</option>
                  <option value="24px">Супер-округлое (24px)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => triggerToast('Глобальная тема сохранена!')}
              className="w-full py-2.5 bg-brand-medium text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm hover:bg-brand-dark transition-all cursor-pointer"
            >
              Применить тему
            </button>
          </div>
        )}
      </div>

      {/* MAIN WORKSPACE / EDITOR STAGE */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-y-auto">
        {selectedPage ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Toolbar for Selected Page */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 sticky top-0">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedPage(null)}
                  className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    {selectedPage.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedPage.path}</p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* View / Edit Toggle */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                  <button
                    onClick={() => { setEditMode(false); setEditingWidget(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                      !editMode ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Eye size={12} />
                    <span>Просмотр</span>
                  </button>
                  <button
                    onClick={() => setEditMode(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                      editMode ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Edit3 size={12} />
                    <span>Конструктор</span>
                  </button>
                </div>

                {/* Settings / History / Backup */}
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors flex items-center gap-1"
                  title="История версий"
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline text-xs font-bold">История</span>
                </button>

                <button
                  onClick={handleOpenExport}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors flex items-center gap-1"
                  title="Экспорт / Импорт"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline text-xs font-bold">JSON</span>
                </button>

                <button
                  onClick={() => handleDeletePage(selectedPage.id)}
                  className="p-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                  title="Удалить страницу"
                >
                  <Trash2 size={14} />
                </button>

                <button
                  onClick={handleSavePage}
                  className="px-4 py-2 bg-brand-medium text-white text-xs font-black uppercase tracking-wider rounded-xl shadow hover:bg-brand-dark transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check size={14} />
                  <span>Опубликовать</span>
                </button>
              </div>
            </div>

            {/* SPLITSCREEN CONTENT CONTAINER */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
              
              {/* WYSIWYG PREVIEW CONTAINER */}
              <div className="flex-1 overflow-y-auto bg-slate-100 p-4 min-h-[50vh] md:min-h-0">
                <div className="bg-white rounded-3xl shadow-md overflow-hidden max-w-2xl mx-auto border border-slate-200">
                  
                  {/* Visual Title Header inside preview representing app bar */}
                  <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-800">{selectedPage.title}</span>
                    <div className="flex gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                      <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                    </div>
                  </div>

                  <CustomPageRenderer
                    page={selectedPage}
                    isDeveloperMode={true}
                    isEditing={editMode}
                    users={users}
                    requests={requests}
                    entrepreneurs={entrepreneurs}
                    orders={orders}
                    onNavigate={onNavigate}
                    onEditWidget={handleEditWidget}
                    onDeleteWidget={handleDeleteWidget}
                    onMoveWidget={handleMoveWidget}
                    onAddWidget={handleAddWidget}
                    onWidgetDrop={handleWidgetDrop}
                  />
                </div>
              </div>

              {/* RIGHT PANEL: SELECTED WIDGET DETAILS EDITOR */}
              {editMode && editingWidget && (
                <div className="w-full md:w-80 shrink-0 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col h-full md:h-auto overflow-y-auto">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">Настройка виджета</span>
                    <button 
                      onClick={() => setEditingWidget(null)}
                      className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Widget meta info */}
                    <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                      <span>Тип: {editingWidget.type.toUpperCase()}</span>
                      <span className="text-slate-300">|</span>
                      <span>ID: {editingWidget.id}</span>
                    </div>

                    {/* DYNAMIC FIELD EDITOR PER TYPE */}
                    {editingWidget.type === 'header' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Текст заголовка</label>
                          <input 
                            type="text" 
                            value={editingWidget.content.text || ''} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, text: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Размер шрифта</label>
                          <select 
                            value={editingWidget.content.fontSize || 'h2'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, fontSize: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="h1">Большой (H1)</option>
                            <option value="h2">Средний (H2)</option>
                            <option value="h3">Маленький (H3)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Выравнивание</label>
                          <select 
                            value={editingWidget.content.alignment || 'left'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, alignment: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="left">По левому краю</option>
                            <option value="center">По центру</option>
                            <option value="right">По правому краю</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Цвет текста</label>
                          <input 
                            type="color" 
                            value={editingWidget.content.color || '#000000'} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, color: e.target.value }
                            })}
                            className="h-8 w-full rounded border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {editingWidget.type === 'text' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Текстовое содержимое</label>
                          <textarea 
                            rows={6}
                            value={editingWidget.content.text || ''} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, text: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none leading-relaxed"
                            placeholder="Введите параграф текста..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Выравнивание</label>
                          <select 
                            value={editingWidget.content.alignment || 'left'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, alignment: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="left">По левому краю</option>
                            <option value="center">По центру</option>
                            <option value="right">По правому краю</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Цвет текста</label>
                          <input 
                            type="color" 
                            value={editingWidget.style.textColor || '#334155'} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              style: { ...editingWidget.style, textColor: e.target.value }
                            })}
                            className="h-8 w-full rounded border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {editingWidget.type === 'button' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Текст на кнопке</label>
                          <input 
                            type="text" 
                            value={editingWidget.content.text || ''} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, text: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Цвет заливки</label>
                          <input 
                            type="color" 
                            value={editingWidget.content.color || '#059669'} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, color: e.target.value }
                            })}
                            className="h-8 w-full rounded border border-slate-300 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Выравнивание кнопки</label>
                          <select 
                            value={editingWidget.content.alignment || 'left'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, alignment: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="left">По левой стороне</option>
                            <option value="center">По центру</option>
                            <option value="right">По правой стороне</option>
                          </select>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-100">
                          <label className="text-xs font-black text-slate-700">Действие при клике</label>
                          <select 
                            value={editingWidget.action?.type || 'none'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              action: { 
                                type: e.target.value, 
                                target: editingWidget.action?.target || 'lenta' 
                              }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="none">Нет действия</option>
                            <option value="navigate">Открыть раздел меню</option>
                            <option value="url">Открыть веб-ссылку</option>
                            <option value="function">Вызвать функцию приложения</option>
                          </select>
                        </div>

                        {editingWidget.action && editingWidget.action.type !== 'none' && (
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600">Цель (target)</label>
                            {editingWidget.action.type === 'navigate' ? (
                              <select
                                value={editingWidget.action.target}
                                onChange={(e) => handleUpdateWidgetDetails({
                                  ...editingWidget,
                                  action: { ...editingWidget.action!, target: e.target.value }
                                })}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                              >
                                <option value="home">Главная</option>
                                <option value="lenta">Лента заявок</option>
                                <option value="create">Попросить помощь</option>
                                <option value="skills">Каталог мастеров</option>
                                <option value="delivery">Подвоз продуктов</option>
                                <option value="transport">Транспорт района</option>
                                <option value="chat">Сообщения</option>
                                <option value="profile">Мой профиль</option>
                                <option value="sos">Кнопка SOS</option>
                                {pages.map(p => (
                                  <option key={p.id} value={p.id}>Своя: {p.title}</option>
                                ))}
                              </select>
                            ) : editingWidget.action.type === 'function' ? (
                              <select
                                value={editingWidget.action.target}
                                onChange={(e) => handleUpdateWidgetDetails({
                                  ...editingWidget,
                                  action: { ...editingWidget.action!, target: e.target.value }
                                })}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                              >
                                <option value="open_chat">Открыть сообщения</option>
                                <option value="create_request">Открыть форму помощи</option>
                                <option value="open_sos">Активировать SOS</option>
                                <option value="open_masters">Открыть мастеров</option>
                              </select>
                            ) : (
                              <input 
                                type="text"
                                placeholder="https://example.com"
                                value={editingWidget.action.target}
                                onChange={(e) => handleUpdateWidgetDetails({
                                  ...editingWidget,
                                  action: { ...editingWidget.action!, target: e.target.value }
                                })}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {editingWidget.type === 'image' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Ссылка на картинку (URL)</label>
                          <input 
                            type="text" 
                            placeholder="https://images.unsplash.com/..."
                            value={editingWidget.content.imageUrl || ''} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, imageUrl: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        {/* Beautiful Scenery presets to choose quickly */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Красивые виды Устьян (готовые)</label>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => handleUpdateWidgetDetails({
                                ...editingWidget,
                                content: { ...editingWidget.content, imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', caption: 'Живописные поля Устьянского края' }
                              })}
                              className="text-[9px] font-bold p-1 bg-slate-100 rounded hover:bg-slate-250 text-slate-700"
                            >
                              🌾 Поля
                            </button>
                            <button
                              onClick={() => handleUpdateWidgetDetails({
                                ...editingWidget,
                                content: { ...editingWidget.content, imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80', caption: 'Красавица тайга и хвойный лес' }
                              })}
                              className="text-[9px] font-bold p-1 bg-slate-100 rounded hover:bg-slate-250 text-slate-700"
                            >
                              🌲 Лес
                            </button>
                            <button
                              onClick={() => handleUpdateWidgetDetails({
                                ...editingWidget,
                                content: { ...editingWidget.content, imageUrl: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80', caption: 'Уютный деревянный дом в северной деревне' }
                              })}
                              className="text-[9px] font-bold p-1 bg-slate-100 rounded hover:bg-slate-250 text-slate-700"
                            >
                              🏡 Деревня
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Подпись под фото</label>
                          <input 
                            type="text" 
                            placeholder="Например: Поля Устьян"
                            value={editingWidget.content.caption || ''} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, caption: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Режим кадрирования</label>
                          <select 
                            value={editingWidget.content.crop || 'cover'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, crop: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="cover">Обрезать под формат (Cover)</option>
                            <option value="contain">Вписать целиком (Contain)</option>
                            <option value="none">Естественный (None)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {editingWidget.type === 'list' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Вид списка</label>
                          <select 
                            value={editingWidget.content.listType || 'bullets'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, listType: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="bullets">Точки (Маркированный)</option>
                            <option value="numbers">Цифры (Нумерованный)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Пункты списка (по одному на строку)</label>
                          <textarea 
                            rows={5}
                            value={(editingWidget.content.items || []).join('\n')} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, items: e.target.value.split('\n') }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none leading-relaxed"
                            placeholder="Пункт 1&#10;Пункт 2&#10;Пункт 3"
                          />
                        </div>
                      </div>
                    )}

                    {editingWidget.type === 'stats' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Источник статистики</label>
                          <select 
                            value={editingWidget.content.statsType || 'custom'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, statsType: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="users">Количество жителей (сеть)</option>
                            <option value="requests">Активные просьбы (Лента)</option>
                            <option value="masters">Мастера в каталове</option>
                            <option value="orders">Заказы у предпринимателей</option>
                            <option value="custom">Ручное значение</option>
                          </select>
                        </div>

                        {editingWidget.content.statsType === 'custom' && (
                          <>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-600">Название показателя</label>
                              <input 
                                type="text" 
                                value={editingWidget.content.statsLabel || ''} 
                                onChange={(e) => handleUpdateWidgetDetails({
                                  ...editingWidget,
                                  content: { ...editingWidget.content, statsLabel: e.target.value }
                                })}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-600">Значение показателя</label>
                              <input 
                                type="text" 
                                value={editingWidget.content.statsValue || ''} 
                                onChange={(e) => handleUpdateWidgetDetails({
                                  ...editingWidget,
                                  content: { ...editingWidget.content, statsValue: e.target.value }
                                })}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {editingWidget.type === 'map' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Координаты центра карты</label>
                          <input 
                            type="text" 
                            placeholder="61.3400,42.8700"
                            value={editingWidget.content.mapCoords || ''} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, mapCoords: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Масштаб (Zoom)</label>
                          <input 
                            type="number" 
                            min={1}
                            max={20}
                            value={editingWidget.content.mapZoom || 12} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, mapZoom: parseInt(e.target.value) }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {editingWidget.type === 'form' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Заголовок формы</label>
                          <input 
                            type="text" 
                            value={editingWidget.content.text || ''} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, text: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Текст кнопки отправки</label>
                          <input 
                            type="text" 
                            value={editingWidget.content.formSubmitText || ''} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, formSubmitText: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        {/* Editable form fields visual mockup */}
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[10px] font-bold text-slate-500">
                          <p className="uppercase tracking-wider">Поля сбора данных:</p>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span>1. ФИО жителя</span>
                            <span className="text-brand-medium">Текст (Обязательно)</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span>2. Номер телефона</span>
                            <span className="text-brand-medium">Телефон (Обязательно)</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>3. Описание заявки</span>
                            <span className="text-slate-400">Текст-абзац</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {editingWidget.type === 'divider' && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Толщина линии (px)</label>
                          <input 
                            type="number" 
                            min={1}
                            max={10}
                            value={editingWidget.content.dividerThickness || 1} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, dividerThickness: parseInt(e.target.value) }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Стиль линии</label>
                          <select 
                            value={editingWidget.content.dividerStyle || 'solid'}
                            onChange={(e: any) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, dividerStyle: e.target.value }
                            })}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                          >
                            <option value="solid">Сплошная (Solid)</option>
                            <option value="dashed">Штриховая (Dashed)</option>
                            <option value="dotted">Точечная (Dotted)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Цвет разделителя</label>
                          <input 
                            type="color" 
                            value={editingWidget.content.dividerColor || '#cbd5e1'} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              content: { ...editingWidget.content, dividerColor: e.target.value }
                            })}
                            className="h-8 w-full rounded border border-slate-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {/* COMMON STYLE SETTINGS FOR ALL WIDGETS */}
                    <div className="pt-4 border-t border-slate-200 space-y-3">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-700 block">Отступы блока (Padding)</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Сверху (px)</label>
                          <input 
                            type="number" 
                            min={0}
                            max={100}
                            value={editingWidget.style.paddingTop || 0} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              style: { ...editingWidget.style, paddingTop: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Снизу (px)</label>
                          <input 
                            type="number" 
                            min={0}
                            max={100}
                            value={editingWidget.style.paddingBottom || 0} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              style: { ...editingWidget.style, paddingBottom: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Поля сверху (px)</label>
                          <input 
                            type="number" 
                            min={0}
                            max={100}
                            value={editingWidget.style.marginTop || 0} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              style: { ...editingWidget.style, marginTop: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">Поля снизу (px)</label>
                          <input 
                            type="number" 
                            min={0}
                            max={100}
                            value={editingWidget.style.marginBottom || 0} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              style: { ...editingWidget.style, marginBottom: parseInt(e.target.value) || 0 }
                            })}
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <input 
                            type="checkbox" 
                            checked={editingWidget.mobileHidden || false} 
                            onChange={(e) => handleUpdateWidgetDetails({
                              ...editingWidget,
                              mobileHidden: e.target.checked
                            })}
                            className="rounded text-brand-medium focus:ring-brand-medium"
                          />
                          <span>Скрыть блок на мобильных</span>
                        </label>
                      </div>
                    </div>

                    {/* CHANGE WIDGET TYPE CONVERTER */}
                    <div className="pt-4 border-t border-slate-200 space-y-1.5">
                      <span className="text-xs font-bold text-slate-600 block">Преобразовать тип блока</span>
                      <select
                        value={editingWidget.type}
                        onChange={(e: any) => handleUpdateWidgetDetails({
                          ...editingWidget,
                          type: e.target.value
                        })}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                      >
                        {WIDGET_TYPES.map(t => (
                          <option key={t.type} value={t.type}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        handleDeleteWidget(editingWidget.id);
                      }}
                      className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all mt-4"
                    >
                      Удалить этот блок
                    </button>
                  </div>
                </div>
              )}

              {/* QUICK ADD WIDGET DRAWER IF EDIT MODE & NO WIDGET SELECTED */}
              {editMode && !editingWidget && (
                <div className="w-full md:w-80 shrink-0 bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col h-full md:h-auto overflow-y-auto">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">Панель элементов</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Кликните, чтобы вставить блок:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {WIDGET_TYPES.map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.type}
                            onClick={() => {
                              const insertOrder = selectedPage.widgets.length;
                              handleAddWidget(insertOrder);
                              // Convert newly created widget to selected type
                              const sorted = [...selectedPage.widgets].sort((a, b) => a.order - b.order);
                              const latest = sorted[sorted.length - 1];
                              if (latest) {
                                const typedWidget: Widget = {
                                  ...latest,
                                  type: t.type,
                                  content: t.type === 'header' 
                                    ? { text: 'Новый заголовок', fontSize: 'h2', alignment: 'center' }
                                    : t.type === 'button'
                                    ? { text: 'Нажми меня', color: '#059669', alignment: 'center' }
                                    : t.type === 'stats'
                                    ? { statsType: 'users' }
                                    : t.type === 'map'
                                    ? { mapCoords: '61.3400,42.8700', mapZoom: 13 }
                                    : t.type === 'divider'
                                    ? { dividerThickness: 1, dividerColor: '#cbd5e1', dividerStyle: 'solid' }
                                    : latest.content
                                };
                                handleUpdateWidgetDetails(typedWidget);
                              }
                            }}
                            className="p-3 bg-slate-50 border border-slate-150 hover:border-brand-medium hover:bg-emerald-50/50 rounded-2xl text-left transition-all cursor-pointer flex flex-col gap-1"
                          >
                            <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-medium">
                              <Icon size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-800">{t.label}</span>
                            <span className="text-[8px] text-slate-400 leading-tight line-clamp-2">{t.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* Landing Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
            <div className="h-20 w-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
              <Layout size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Визуальный Конструктор Страниц</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Позволяет создавать полноценные интерактивные разделы меню, контакты, галереи и формы без написания кода. Страницы публикуются мгновенно и появляются в главном меню для всех жителей.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-brand-medium hover:bg-brand-dark text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              + Создать новую страницу
            </button>
          </div>
        )}
      </div>

      {/* CREATE PAGE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layout size={18} className="text-brand-medium" />
                <span>Создание новой страницы</span>
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePage} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600">Название страницы (будет в меню)</label>
                <input
                  type="text"
                  required
                  placeholder="Например: О нас, Полезные ссылки, Важное"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-600">Адрес страницы (URL path - опционально)</label>
                <input
                  type="text"
                  placeholder="Например: /about, /links (сгенерируется автоматически)"
                  value={newPagePath}
                  onChange={(e) => setNewPagePath(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-medium focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600">Выберите готовый шаблон</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPageTemplate('empty')}
                    className={`p-3 border rounded-2xl text-left transition-all flex flex-col gap-1 ${
                      newPageTemplate === 'empty' ? 'border-brand-medium bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">📄 Пустая страница</span>
                    <span className="text-[9px] text-slate-400">Только базовый заголовок</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPageTemplate('home')}
                    className={`p-3 border rounded-2xl text-left transition-all flex flex-col gap-1 ${
                      newPageTemplate === 'home' ? 'border-brand-medium bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">🏠 Информационная</span>
                    <span className="text-[9px] text-slate-400">Текст, статистика, кнопка</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPageTemplate('contacts')}
                    className={`p-3 border rounded-2xl text-left transition-all flex flex-col gap-1 ${
                      newPageTemplate === 'contacts' ? 'border-brand-medium bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">💰 Система Спасибо</span>
                    <span className="text-[9px] text-slate-400">Объяснение баллов и почему мы не платим сейчас</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPageTemplate('news')}
                    className={`p-3 border rounded-2xl text-left transition-all flex flex-col gap-1 ${
                      newPageTemplate === 'news' ? 'border-brand-medium bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">📰 Новости / Лента</span>
                    <span className="text-[9px] text-slate-400">Последние просьбы волонтеров</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-medium text-white text-xs font-black uppercase tracking-wider rounded-2xl hover:bg-brand-dark transition-all cursor-pointer shadow-md"
              >
                Создать страницу
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw size={18} className="text-brand-medium" />
                <span>История версий страницы</span>
              </h3>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {widgetHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">История версий пуста. Резервные копии создаются при каждой публикации изменений.</p>
              ) : (
                widgetHistory.map((hist) => (
                  <div 
                    key={hist.id}
                    className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">Версия #{hist.version}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(hist.createdAt).toLocaleDateString()} {new Date(hist.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="text-[9px] text-brand-medium">Автор: {hist.createdBy}</p>
                    </div>
                    <button
                      onClick={() => handleRollback(hist)}
                      className="px-2.5 py-1.5 bg-brand-medium hover:bg-brand-dark text-white font-bold text-[10px] rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Восстановить
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMPORT / EXPORT JSON MODAL */}
      {showImportExport && (
        <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Download size={18} className="text-brand-medium" />
                <span>Экспорт и Импорт разметки</span>
              </h3>
              <button 
                onClick={() => setShowImportExport(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              Вы можете скопировать этот JSON для переноса разметки страницы на другой стенд, или вставить готовую разметку и нажать кнопку импорта.
            </p>

            <div className="space-y-1">
              <textarea
                rows={10}
                value={jsonClipboard}
                onChange={(e) => setJsonClipboard(e.target.value)}
                className="w-full text-[10px] p-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-2xl focus:outline-none font-mono leading-relaxed"
                placeholder="Вставьте JSON конфигурацию страницы..."
              />
            </div>

            {importError && (
              <p className="text-[10px] font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-100">{importError}</p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonClipboard);
                  triggerToast('JSON скопирован в буфер обмена!');
                }}
                className="py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Copy size={13} />
                <span>Скопировать</span>
              </button>
              <button
                onClick={handleImportJson}
                className="py-2.5 bg-brand-medium hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <Upload size={13} />
                <span>Импортировать</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
