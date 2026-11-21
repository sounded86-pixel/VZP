import React, { useState, useEffect, useMemo } from 'react';
import { HelpItem, HelpType, HelpCategory, UserProfile } from './types';
import { 
  subscribeToHelpItems, 
  createHelpItem, 
  toggleItemStatus, 
  getLocalProfile, 
  saveLocalProfile 
} from './storage';
import { 
  initInstallPromptListener, 
  isPushNotificationSupported, 
  getNotificationPermission, 
  isPushPromptDismissed 
} from './pwaService';

import { PwaHeader } from './components/PwaHeader';
import { PushBanner } from './components/PushBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ItemCard } from './components/ItemCard';
import { CreateItemModal } from './components/CreateItemModal';
import { ProfileModal } from './components/ProfileModal';
import { WebhookSettingsModal } from './components/WebhookSettingsModal';
import { InstallPromptModal } from './components/InstallPromptModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { LocationItem } from './locationsData';
import { AiAssistantWidget } from './components/AiAssistantWidget';

import { Plus, Search, FilterX, HelpCircle, Layers, Sparkles } from 'lucide-react';

export const PwaApp: React.FC = () => {
  // State: Data
  const [items, setItems] = useState<HelpItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(getLocalProfile());

  // State: Filters
  const [activeTab, setActiveTab] = useState<HelpType>('request'); // 'request' | 'offer'
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>('all');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State: Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // State: PWA and Network
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);
  const [showPushBanner, setShowPushBanner] = useState<boolean>(false);

  // Initialize network & PWA listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt handler
    initInstallPromptListener(() => setCanInstall(true));

    // Check push banner criteria
    if (isPushNotificationSupported() && getNotificationPermission() === 'default' && !isPushPromptDismissed()) {
      setShowPushBanner(true);
    }

    // Subscribe to items with offline resilience
    const unsubscribe = subscribeToHelpItems((freshItems) => {
      setItems(freshItems);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // Sync profile update
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveLocalProfile(newProfile);
  };

  // Add new item
  const handleCreateItem = async (newItem: HelpItem) => {
    await createHelpItem(newItem);
    // Automatically switch to the tab of the created item
    setActiveTab(newItem.type);
    setSelectedCategory('all');
    if (selectedVillage !== 'all' && selectedVillage !== newItem.settlement) {
      setSelectedVillage(newItem.settlement);
    }
  };

  // Toggle resolved / active status
  const handleToggleStatus = async (id: string, newStatus: 'active' | 'completed') => {
    await toggleItemStatus(id, newStatus);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Filter by Tab (Request vs Offer)
      if (item.type !== activeTab) return false;

      // 2. Filter by Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // 3. Filter by Village, Region, or Country
      if (selectedVillage !== 'all' && Boolean(selectedVillage)) {
        const needle = selectedVillage.toLowerCase();
        const matchesSettlement = item.settlement.toLowerCase().includes(needle) || needle.includes(item.settlement.toLowerCase());
        const matchesRegion = Boolean(item.region && (item.region.toLowerCase().includes(needle) || needle.includes(item.region.toLowerCase())));
        const matchesCountry = Boolean(item.country && (item.country.toLowerCase().includes(needle) || needle.includes(item.country.toLowerCase())));
        if (!matchesSettlement && !matchesRegion && !matchesCountry) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = item.description.toLowerCase().includes(query);
        const matchesSettlement = item.settlement.toLowerCase().includes(query);
        const matchesRegion = Boolean(item.region && item.region.toLowerCase().includes(query));
        const matchesCountry = Boolean(item.country && item.country.toLowerCase().includes(query));
        const matchesAuthor = item.author.toLowerCase().includes(query);
        if (!matchesText && !matchesSettlement && !matchesRegion && !matchesCountry && !matchesAuthor) return false;
      }

      return true;
    });
  }, [items, activeTab, selectedCategory, selectedVillage, searchQuery]);

  // Tab counters
  const requestCount = useMemo(() => {
    return items.filter((i) => i.type === 'request' && i.status === 'active').length;
  }, [items]);

  const offerCount = useMemo(() => {
    return items.filter((i) => i.type === 'offer' && i.status === 'active').length;
  }, [items]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-24 text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
      {/* 1. Header with expanded RF, Belarus, Kazakhstan, CIS location directory */}
      <PwaHeader
        profile={profile}
        selectedVillage={selectedVillage}
        onSelectVillage={setSelectedVillage}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        canInstall={canInstall}
        isOnline={isOnline}
      />

      {/* 2. Gentle Push Notification Banner */}
      {showPushBanner && (
        <PushBanner
          selectedVillage={selectedVillage}
          onSubscribed={() => setShowPushBanner(false)}
        />
      )}

      {/* 3. Main 2 Tabs & Category Pills */}
      <CategoryFilter
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        requestCount={requestCount}
        offerCount={offerCount}
      />

      {/* 4. Search & Stats Bar */}
      <div className="max-w-2xl mx-auto w-full px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Быстрый поиск по тексту, селу, району или автору..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700 font-bold p-0.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 5. Main Feed */}
      <main className="max-w-2xl mx-auto w-full px-3 py-2 flex-1">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center my-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-2xl">
              {activeTab === 'request' ? '🌾' : '🚜'}
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">
              {activeTab === 'request' ? 'Активных просьб не найдено' : 'Пока нет предложений помощи'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 font-medium leading-relaxed">
              {selectedVillage !== 'all' || selectedCategory !== 'all' || searchQuery
                ? 'Попробуйте сбросить фильтры или выбрать «Все регионы и сёла».'
                : activeTab === 'request'
                ? 'Будьте первым, кто создаст просьбу о помощи в своём селе!'
                : 'Предложите свою помощь соседям: подвезти, привезти лекарства или помочь по хозяйству.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(selectedVillage !== 'all' || selectedCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedVillage('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                >
                  Сбросить фильтры
                </button>
              )}
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Создать запись</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* 6. Big Prominent Action Bar: "+ Создать просьбу или предложение" (Fixed Bottom) */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-3 bg-white/95 backdrop-blur-xs border-t border-slate-200 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className={`flex-1 py-3.5 px-4 rounded-xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-98 ${
              activeTab === 'request'
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900'
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>
              {activeTab === 'request' ? '+ Создать просьбу о помощи' : '+ Предложить свою помощь'}
            </span>
          </button>
        </div>
      </div>

      {/* 7. Modals */}
      <CreateItemModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateItem}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        defaultVillage={selectedVillage}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={handleUpdateProfile}
      />

      <WebhookSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        items={items}
      />

      <InstallPromptModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        canPromptDirectly={canInstall}
      />

      {/* Global Location Directory Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        selectedLocation={selectedVillage}
        onSelect={(loc) => setSelectedVillage(loc)}
        allowAll={true}
        title="Выбор села или региона"
      />

      {/* Floating AI Assistant Widget */}
      <AiAssistantWidget />
    </div>
  );
};
