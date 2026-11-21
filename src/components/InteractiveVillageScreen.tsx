import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Search, Plus, ArrowLeft, Home, Users, BookOpen, 
  Calendar, Award, Heart, Share2, Sparkles, Shield, Camera, 
  FileText, ExternalLink, ChevronRight, Check, X, Filter, 
  Layers, Map, Info, UserCheck, Smartphone, Printer, Hammer, Eye
} from 'lucide-react';
import { 
  InteractiveVillage, VillageHouse, VillageResident, VillageFamilyTree, 
  MemorialPlaqueConfig, UserProfile, ResidentRelative 
} from '../types';
import { 
  getStoredVillages, saveStoredVillages, 
  getStoredHouses, saveStoredHouses, 
  getStoredResidents, saveStoredResidents, 
  getStoredFamilyTrees, saveStoredFamilyTrees 
} from '../data/villageArchiveData';
import { 
  dbSubscribeVillages, dbCreateVillage, dbUpdateVillage,
  dbSubscribeHouses, dbCreateHouse, dbUpdateHouse,
  dbSubscribeResidents, dbCreateResident, dbUpdateResident,
  dbSubscribeFamilyTrees, dbCreateFamilyTree, dbUpdateFamilyTree
} from '../firebaseSync';
import { VillageMapCanvas } from './village/VillageMapCanvas';
import { FamilyTreeVisualizer } from './village/FamilyTreeVisualizer';
import { MemorialPlaqueBuilder } from './village/MemorialPlaqueBuilder';

interface InteractiveVillageScreenProps {
  currentUser?: UserProfile | null;
  onBack?: () => void;
  initialVillageId?: string;
  initialHouseId?: string;
}

type ScreenView = 'villages_list' | 'village_map' | 'house_detail' | 'resident_detail' | 'family_tree' | 'memorial_plaque';

export const InteractiveVillageScreen: React.FC<InteractiveVillageScreenProps> = ({
  currentUser,
  onBack,
  initialVillageId,
  initialHouseId
}) => {
  // State for archives
  const [villages, setVillages] = useState<InteractiveVillage[]>(getStoredVillages);
  const [houses, setHouses] = useState<VillageHouse[]>(getStoredHouses);
  const [residents, setResidents] = useState<VillageResident[]>(getStoredResidents);
  const [familyTrees, setFamilyTrees] = useState<VillageFamilyTree[]>(getStoredFamilyTrees);

  // Active view navigation
  const [currentView, setCurrentView] = useState<ScreenView>('villages_list');
  const [selectedVillageId, setSelectedVillageId] = useState<string>(initialVillageId || 'village_likhachevo');
  const [selectedHouseId, setSelectedHouseId] = useState<string>(initialHouseId || '');
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');

  // Search & Filters
  const [villageSearch, setVillageSearch] = useState('');
  const [houseViewMode, setHouseViewMode] = useState<'map' | 'grid'>('map');
  const [residentSearchQuery, setResidentSearchQuery] = useState('');
  const [photoViewerUrl, setPhotoViewerUrl] = useState<string | null>(null);

  // Modals state
  const [showAddVillageModal, setShowAddVillageModal] = useState(false);
  const [showAddHouseModal, setShowAddHouseModal] = useState(false);
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);

  // Form states: Add Village
  const [newVillageName, setNewVillageName] = useState('');
  const [newVillageRegion, setNewVillageRegion] = useState('Архангельская область');
  const [newVillageDistrict, setNewVillageDistrict] = useState('Устьянский район');
  const [newVillageDesc, setNewVillageDesc] = useState('');
  const [newVillageYear, setNewVillageYear] = useState('1750');
  const [newVillageCover, setNewVillageCover] = useState('');

  // Form states: Add House
  const [newHouseStreet, setNewHouseStreet] = useState('ул. Центральная');
  const [newHouseNumber, setNewHouseNumber] = useState('');
  const [newHouseYear, setNewHouseYear] = useState('1950');
  const [newHouseStyle, setNewHouseStyle] = useState('Северная изба-пятистенок');
  const [newHouseHistory, setNewHouseHistory] = useState('');
  const [newHousePhoto, setNewHousePhoto] = useState('');

  // Form states: Add Resident
  const [newResName, setNewResName] = useState('');
  const [newResBirthYear, setNewResBirthYear] = useState('1940');
  const [newResDeathYear, setNewResDeathYear] = useState('');
  const [newResBirthPlace, setNewResBirthPlace] = useState('');
  const [newResPhoto, setNewResPhoto] = useState('');
  const [newResBio, setNewResBio] = useState('');
  const [newResAchievements, setNewResAchievements] = useState('');
  const [newResOccupation, setNewResOccupation] = useState('');
  const [newResMilitary, setNewResMilitary] = useState('');
  const [newResIsAlive, setNewResIsAlive] = useState(false);
  const [newResTargetHouseId, setNewResTargetHouseId] = useState('');

  // Subscribe to Firestore updates
  useEffect(() => {
    const unsubVillages = dbSubscribeVillages((remoteVillages) => {
      if (remoteVillages.length > 0) {
        setVillages(remoteVillages);
        saveStoredVillages(remoteVillages);
      }
    });

    const unsubHouses = dbSubscribeHouses((remoteHouses) => {
      if (remoteHouses.length > 0) {
        setHouses(remoteHouses);
        saveStoredHouses(remoteHouses);
      }
    });

    const unsubResidents = dbSubscribeResidents((remoteResidents) => {
      if (remoteResidents.length > 0) {
        setResidents(remoteResidents);
        saveStoredResidents(remoteResidents);
      }
    });

    const unsubTrees = dbSubscribeFamilyTrees((remoteTrees) => {
      if (remoteTrees.length > 0) {
        setFamilyTrees(remoteTrees);
        saveStoredFamilyTrees(remoteTrees);
      }
    });

    return () => {
      unsubVillages();
      unsubHouses();
      unsubResidents();
      unsubTrees();
    };
  }, []);

  // Initial params handling
  useEffect(() => {
    if (initialHouseId) {
      const h = houses.find(house => house.id === initialHouseId);
      if (h) {
        setSelectedVillageId(h.villageId);
        setSelectedHouseId(h.id);
        setCurrentView('house_detail');
      }
    } else if (initialVillageId) {
      setSelectedVillageId(initialVillageId);
      setCurrentView('village_map');
    }
  }, [initialVillageId, initialHouseId]);

  // Derived active items
  const activeVillage = useMemo(() => {
    return villages.find(v => v.id === selectedVillageId) || villages[0];
  }, [villages, selectedVillageId]);

  const villageHouses = useMemo(() => {
    if (!activeVillage) return [];
    return houses.filter(h => h.villageId === activeVillage.id);
  }, [houses, activeVillage]);

  const villageResidents = useMemo(() => {
    if (!activeVillage) return [];
    return residents.filter(r => r.villageId === activeVillage.id);
  }, [residents, activeVillage]);

  const activeHouse = useMemo(() => {
    return houses.find(h => h.id === selectedHouseId);
  }, [houses, selectedHouseId]);

  const activeHouseResidents = useMemo(() => {
    if (!activeHouse) return [];
    return residents.filter(r => activeHouse.residents.includes(r.id));
  }, [residents, activeHouse]);

  const activeResident = useMemo(() => {
    return residents.find(r => r.id === selectedResidentId);
  }, [residents, selectedResidentId]);

  // Filtered villages for main screen
  const filteredVillages = useMemo(() => {
    if (!villageSearch.trim()) return villages;
    const q = villageSearch.toLowerCase();
    return villages.filter(v => 
      v.name.toLowerCase().includes(q) ||
      v.district.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );
  }, [villages, villageSearch]);

  // Filtered residents for active village
  const filteredResidents = useMemo(() => {
    if (!residentSearchQuery.trim()) return villageResidents;
    const q = residentSearchQuery.toLowerCase();
    return villageResidents.filter(r => 
      r.name.toLowerCase().includes(q) ||
      (r.occupation && r.occupation.toLowerCase().includes(q)) ||
      (r.biography && r.biography.toLowerCase().includes(q))
    );
  }, [villageResidents, residentSearchQuery]);

  // --- Handlers: Add Village ---
  const handleCreateVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName.trim()) return;

    const newVillage: InteractiveVillage = {
      id: `village_${Date.now()}`,
      name: newVillageName.trim(),
      region: newVillageRegion.trim() || 'Архангельская область',
      district: newVillageDistrict.trim() || 'Устьянский район',
      description: newVillageDesc.trim() || 'Летопись деревни формируется жителями.',
      foundedYear: parseInt(newVillageYear) || 1750,
      housesCount: 1,
      residentsCount: 0,
      coverImage: newVillageCover.trim() || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      heritageFeatures: ['Деревенские династии', 'Родовая память'],
      createdAt: new Date().toISOString()
    };

    const updated = [newVillage, ...villages];
    setVillages(updated);
    saveStoredVillages(updated);
    await dbCreateVillage(newVillage);

    setShowAddVillageModal(false);
    setSelectedVillageId(newVillage.id);
    setCurrentView('village_map');
  };

  // --- Handlers: Add House ---
  const handleCreateHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseNumber.trim() || !activeVillage) return;

    const fullAddress = `${newHouseStreet}, д. ${newHouseNumber.trim()}`;
    const newHouse: VillageHouse = {
      id: `house_${Date.now()}`,
      villageId: activeVillage.id,
      address: fullAddress,
      houseNumber: newHouseNumber.trim(),
      street: newHouseStreet,
      coordinates: {
        lat: 61.1245 + (Math.random() * 0.01 - 0.005),
        lng: 43.1890 + (Math.random() * 0.01 - 0.005),
        mapX: Math.floor(Math.random() * 70) + 15,
        mapY: Math.floor(Math.random() * 60) + 20
      },
      yearBuilt: parseInt(newHouseYear) || 1950,
      architecturalStyle: newHouseStyle,
      photo: newHousePhoto.trim() || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      history: newHouseHistory.trim() || 'Построен семьёй местных мастеров.',
      residents: [],
      condition: 'preserved',
      createdAt: new Date().toISOString()
    };

    const updated = [newHouse, ...houses];
    setHouses(updated);
    saveStoredHouses(updated);
    await dbCreateHouse(newHouse);

    // Update village houses count
    const updatedVillage = { ...activeVillage, housesCount: (activeVillage.housesCount || 0) + 1 };
    await dbUpdateVillage(activeVillage.id, { housesCount: updatedVillage.housesCount });

    setShowAddHouseModal(false);
    setSelectedHouseId(newHouse.id);
    setCurrentView('house_detail');
  };

  // --- Handlers: Add Resident ---
  const handleCreateResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResName.trim() || !activeVillage) return;

    const targetHouseId = newResTargetHouseId || selectedHouseId || villageHouses[0]?.id;
    if (!targetHouseId) return;

    const residentId = `res_${Date.now()}`;
    const achList = newResAchievements.split(',').map(s => s.trim()).filter(Boolean);

    const newResident: VillageResident = {
      id: residentId,
      houseId: targetHouseId,
      villageId: activeVillage.id,
      name: newResName.trim(),
      birthYear: parseInt(newResBirthYear) || 1940,
      deathYear: newResIsAlive ? undefined : (newResDeathYear ? parseInt(newResDeathYear) : undefined),
      birthPlace: newResBirthPlace.trim() || `д. ${activeVillage.name}`,
      photo: newResPhoto.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      biography: newResBio.trim() || 'Биография записывается родственниками и краеведами.',
      achievements: achList.length > 0 ? achList : ['Житель деревни'],
      occupation: newResOccupation.trim() || 'Труженик села',
      militaryService: newResMilitary.trim() || undefined,
      isAlive: newResIsAlive,
      relatives: [],
      createdAt: new Date().toISOString()
    };

    const updatedResidents = [newResident, ...residents];
    setResidents(updatedResidents);
    saveStoredResidents(updatedResidents);
    await dbCreateResident(newResident);

    // Attach resident to house
    const targetHouse = houses.find(h => h.id === targetHouseId);
    if (targetHouse) {
      const updatedHouseResidents = [...targetHouse.residents, residentId];
      await dbUpdateHouse(targetHouseId, { residents: updatedHouseResidents });
      setHouses(prev => prev.map(h => h.id === targetHouseId ? { ...h, residents: updatedHouseResidents } : h));
    }

    // Update village resident count
    await dbUpdateVillage(activeVillage.id, { residentsCount: (activeVillage.residentsCount || 0) + 1 });

    setShowAddResidentModal(false);
    setSelectedResidentId(residentId);
    setCurrentView('resident_detail');
  };

  // --- Handlers: Save Memorial Plaque ---
  const handleSavePlaque = async (config: MemorialPlaqueConfig) => {
    if (!activeHouse) return;
    const updatedHouse = { ...activeHouse, memorialPlaque: config };
    setHouses(prev => prev.map(h => h.id === activeHouse.id ? updatedHouse : h));
    saveStoredHouses(houses.map(h => h.id === activeHouse.id ? updatedHouse : h));
    await dbUpdateHouse(activeHouse.id, { memorialPlaque: config });
  };

  // =========================================================================
  // VIEW: 3.5. Family Tree Visualizer
  // =========================================================================
  if (currentView === 'family_tree' && activeVillage) {
    return (
      <FamilyTreeVisualizer
        village={activeVillage}
        residents={villageResidents}
        houses={villageHouses}
        familyTrees={familyTrees}
        initialResidentId={selectedResidentId || (activeHouseResidents[0]?.id)}
        onSelectResident={(rId) => {
          setSelectedResidentId(rId);
          setCurrentView('resident_detail');
        }}
        onBack={() => {
          if (selectedHouseId) setCurrentView('house_detail');
          else setCurrentView('village_map');
        }}
        onAddRelative={(fromId) => {
          setSelectedResidentId(fromId);
          setShowAddResidentModal(true);
        }}
      />
    );
  }

  // =========================================================================
  // VIEW: 4. Memorial Plaque Builder
  // =========================================================================
  if (currentView === 'memorial_plaque' && activeHouse && activeVillage) {
    return (
      <MemorialPlaqueBuilder
        house={activeHouse}
        village={activeVillage}
        residents={residents}
        onBack={() => setCurrentView('house_detail')}
        onSavePlaque={handleSavePlaque}
      />
    );
  }

  // =========================================================================
  // VIEW: 3.4. Resident Detail Card
  // =========================================================================
  if (currentView === 'resident_detail' && activeResident && activeVillage) {
    const residentHouse = houses.find(h => h.id === activeResident.houseId);
    const relatedResidents = (activeResident.relatives || []).map(rel => ({
      ...rel,
      resident: residents.find(r => r.id === rel.residentId)
    })).filter(item => Boolean(item.resident));

    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Navigation Breadcrumb */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto">
            <button 
              onClick={() => setCurrentView('villages_list')} 
              className="hover:text-slate-800"
            >
              Деревни
            </button>
            <span>/</span>
            <button 
              onClick={() => setCurrentView('village_map')} 
              className="hover:text-slate-800"
            >
              д. {activeVillage.name}
            </button>
            <span>/</span>
            {residentHouse && (
              <>
                <button 
                  onClick={() => {
                    setSelectedHouseId(residentHouse.id);
                    setCurrentView('house_detail');
                  }} 
                  className="hover:text-slate-800"
                >
                  {residentHouse.address}
                </button>
                <span>/</span>
              </>
            )}
            <span className="text-amber-900 font-black">{activeResident.name}</span>
          </div>

          <button
            onClick={() => {
              if (selectedHouseId) setCurrentView('house_detail');
              else setCurrentView('village_map');
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            <span>Назад</span>
          </button>
        </div>

        {/* Resident Header Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <img
                src={activeResident.photo}
                alt={activeResident.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-amber-800/20 shadow-md"
              />
              <span
                className={`absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${
                  activeResident.isAlive ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                {activeResident.isAlive ? 'Живёт' : 'Вечная память'}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  {activeResident.birthYear} — {activeResident.deathYear || 'настоящее время'}
                </span>
                {activeResident.occupation && (
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-md">
                    {activeResident.occupation}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeResident.name}
              </h1>

              <div className="text-xs text-slate-600 space-y-1">
                <p>📍 <strong>Место рождения:</strong> {activeResident.birthPlace}</p>
                {residentHouse && (
                  <p>
                    🏠 <strong>Родовой дом:</strong>{' '}
                    <button
                      onClick={() => {
                        setSelectedHouseId(residentHouse.id);
                        setCurrentView('house_detail');
                      }}
                      className="text-amber-800 font-bold hover:underline"
                    >
                      {residentHouse.address}
                    </button>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setCurrentView('family_tree')}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Users size={14} />
                  <span>Показать древо рода</span>
                </button>
                {residentHouse && (
                  <button
                    onClick={() => {
                      setSelectedHouseId(residentHouse.id);
                      setCurrentView('memorial_plaque');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Shield size={14} className="text-amber-700" />
                    <span>Именная табличка дома</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Story / Biography Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen size={20} className="text-amber-800" />
            <h2 className="text-lg font-black text-slate-900">
              📖 История жизни и воспоминания
            </h2>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-serif">
            {activeResident.biography}
          </p>

          {/* Military Service if present */}
          {activeResident.militaryService && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-xs text-amber-950 space-y-1">
              <span className="font-black uppercase tracking-wider block text-[10px] text-amber-800">
                🎖️ Военная служба / Фронт и тыл:
              </span>
              <p>{activeResident.militaryService}</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        {activeResident.achievements.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Award size={20} className="text-amber-600" />
              <h3 className="text-base font-black text-slate-900">
                🏆 Заслуги и народное признание
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {activeResident.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="text-amber-600" />
                  <span>{ach}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relatives List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-amber-800" />
              <h3 className="text-base font-black text-slate-900">
                👨‍👩‍👧‍👦 Родственники ({relatedResidents.length})
              </h3>
            </div>
            <button
              onClick={() => setCurrentView('family_tree')}
              className="text-xs font-bold text-amber-800 hover:underline"
            >
              Открыть в древе →
            </button>
          </div>

          {relatedResidents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedResidents.map(({ resident: relRes, relation, note }) => {
                if (!relRes) return null;
                const relLabel = 
                  relation === 'spouse' ? 'Супруг(а)' :
                  relation === 'parent' ? 'Родитель' :
                  relation === 'child' ? 'Сын / Дочь' :
                  relation === 'sibling' ? 'Брат / Сестра' :
                  relation === 'grandparent' ? 'Дедушка / Бабушка' :
                  relation === 'grandchild' ? 'Внук / Внучка' : 'Родственник';

                return (
                  <div
                    key={relRes.id}
                    onClick={() => setSelectedResidentId(relRes.id)}
                    className="p-3 rounded-2xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={relRes.photo}
                        alt={relRes.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {relLabel}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {relRes.name}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {relRes.birthYear}–{relRes.deathYear || 'н.в.'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-2">
              Родственники пока не привязаны. Вы можете построить связи в разделе «Родословное дерево».
            </p>
          )}
        </div>

        {/* Archive Photos & Gallery */}
        {activeResident.gallery && activeResident.gallery.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Camera size={20} className="text-amber-800" />
              <h3 className="text-base font-black text-slate-900">
                📸 Архивные фотографии и документы
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activeResident.gallery.map(item => (
                <div
                  key={item.id}
                  onClick={() => setPhotoViewerUrl(item.url)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 relative aspect-video"
                >
                  <img
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <p className="text-[10px] text-white font-medium truncate">
                      {item.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: 3.3. House Detail Card
  // =========================================================================
  if (currentView === 'house_detail' && activeHouse && activeVillage) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Breadcrumb Navigation */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <button 
              onClick={() => setCurrentView('villages_list')} 
              className="hover:text-slate-800"
            >
              Деревни
            </button>
            <span>/</span>
            <button 
              onClick={() => setCurrentView('village_map')} 
              className="hover:text-slate-800"
            >
              д. {activeVillage.name}
            </button>
            <span>/</span>
            <span className="text-amber-900 font-black">{activeHouse.address}</span>
          </div>

          <button
            onClick={() => setCurrentView('village_map')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            <span>К карте деревни</span>
          </button>
        </div>

        {/* House Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Photo Column */}
          <div className="lg:col-span-6 relative aspect-4/3 lg:aspect-auto min-h-[300px]">
            <img
              src={activeHouse.photo}
              alt={activeHouse.address}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              <span>Построен в {activeHouse.yearBuilt} году</span>
            </div>

            {activeHouse.memorialPlaque && (
              <div className="absolute bottom-4 left-4 right-4 bg-amber-950/85 backdrop-blur-xs text-amber-200 p-3 rounded-2xl border border-amber-500/40 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-amber-400" />
                  <div>
                    <span className="font-bold block">{activeHouse.memorialPlaque.title}</span>
                    <span className="text-[10px] text-amber-300 opacity-90">{activeHouse.memorialPlaque.subtitle}</span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('memorial_plaque')}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-[10px] font-black"
                >
                  Табличка
                </button>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  д. {activeVillage.name}
                </span>
                <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                  Дом №{activeHouse.houseNumber}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
                {activeHouse.address}
              </h1>

              <div className="space-y-2 text-xs text-slate-600">
                <p>🏗️ <strong>Архитектура:</strong> {activeHouse.architecturalStyle || 'Северная изба'}</p>
                <p>📍 <strong>Улица:</strong> {activeHouse.street}</p>
                <p>👨‍👩‍👧‍👦 <strong>Жителей в летописи дома:</strong> {activeHouseResidents.length} чел.</p>
              </div>

              {activeHouse.history && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-700 font-serif leading-relaxed">
                  <span className="font-bold font-sans text-slate-900 block mb-1 text-[11px] uppercase tracking-wider">
                    История усадьбы:
                  </span>
                  {activeHouse.history}
                </div>
              )}
            </div>

            {/* Actions for the House */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentView('memorial_plaque')}
                className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Shield size={16} />
                <span>📛 Именная табличка</span>
              </button>

              <button
                onClick={() => {
                  setSelectedResidentId(activeHouseResidents[0]?.id || '');
                  setCurrentView('family_tree');
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Users size={16} />
                <span>🌳 Построить дерево</span>
              </button>

              <button
                onClick={() => {
                  setNewResTargetHouseId(activeHouse.id);
                  setShowAddResidentModal(true);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus size={16} />
                <span>Добавить жителя</span>
              </button>
            </div>
          </div>
        </div>

        {/* Residents Section (3.3. Список жителей) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>👨‍👩‍👧‍👦 Жители дома</span>
                <span className="text-xs text-slate-500 font-normal">({activeHouseResidents.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Поколения людей, строивших, живших и хранивших этот дом
              </p>
            </div>

            <button
              onClick={() => {
                setNewResTargetHouseId(activeHouse.id);
                setShowAddResidentModal(true);
              }}
              className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-200"
            >
              <Plus size={14} />
              <span>Добавить жителя</span>
            </button>
          </div>

          {activeHouseResidents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {activeHouseResidents.map((res) => (
                <div
                  key={res.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={res.photo}
                      alt={res.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-900 transition-colors">
                          {res.name}
                        </h3>
                        <span className={`w-2 h-2 rounded-full ${res.isAlive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Годы жизни: {res.birthYear} — {res.deathYear || 'настоящее время'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {res.occupation || 'Житель деревни'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setSelectedResidentId(res.id);
                        setCurrentView('resident_detail');
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-200/80 transition-colors"
                    >
                      <BookOpen size={14} />
                      <span>📖 История</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResidentId(res.id);
                        setCurrentView('family_tree');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Users size={14} />
                      <span>🌳 Дерево</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p>В этом доме пока не записаны жители.</p>
              <button
                onClick={() => {
                  setNewResTargetHouseId(activeHouse.id);
                  setShowAddResidentModal(true);
                }}
                className="mt-2 text-amber-800 font-bold hover:underline"
              >
                + Записать первого жителя или основателя
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: 3.2. Village Screen (Map & Houses Catalog)
  // =========================================================================
  if (currentView === 'village_map' && activeVillage) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Village Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('villages_list')}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="К списку деревень"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                  {activeVillage.district}, {activeVillage.region}
                </span>
                <span className="text-xs text-slate-500">
                  Основана около {activeVillage.foundedYear} г.
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                🏡 {activeVillage.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-serif">
                {activeVillage.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowAddHouseModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} />
                <span>Добавить дом</span>
              </button>
              <button
                onClick={() => setCurrentView('family_tree')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Users size={14} />
                <span>🌳 Дерево рода</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Домов на карте</span>
              <span className="text-lg font-black text-slate-900">{villageHouses.length}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Жителей в летописи</span>
              <span className="text-lg font-black text-slate-900">{villageResidents.length}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">С табличками</span>
              <span className="text-lg font-black text-amber-700">
                {villageHouses.filter(h => h.memorialPlaque).length}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ветеранов и мастеров</span>
              <span className="text-lg font-black text-emerald-700">
                {villageResidents.filter(r => r.achievements && r.achievements.length > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher: Interactive Map vs Grid */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHouseViewMode('map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                houseViewMode === 'map'
                  ? 'bg-amber-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Map size={14} />
              <span>🗺️ Карта деревни с домами</span>
            </button>
            <button
              onClick={() => setHouseViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                houseViewMode === 'grid'
                  ? 'bg-amber-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Home size={14} />
              <span>🏠 Каталог домов ({villageHouses.length})</span>
            </button>
          </div>

          <div className="relative w-48 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск жителя..."
              value={residentSearchQuery}
              onChange={(e) => setResidentSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-medium"
            />
          </div>
        </div>

        {/* Search Results Dropdown if query entered */}
        {residentSearchQuery.trim() && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Найдено жителей в деревне ({filteredResidents.length}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredResidents.map(res => (
                <div
                  key={res.id}
                  onClick={() => {
                    setSelectedResidentId(res.id);
                    setCurrentView('resident_detail');
                  }}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50 cursor-pointer flex items-center gap-2.5"
                >
                  <img src={res.photo} alt={res.name} className="w-9 h-9 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{res.name}</p>
                    <p className="text-[10px] text-slate-500">{res.birthYear}–{res.deathYear || 'н.в.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display: Interactive Map Canvas or Grid of Houses */}
        {houseViewMode === 'map' ? (
          <VillageMapCanvas
            village={activeVillage}
            houses={villageHouses}
            residents={villageResidents}
            selectedHouseId={selectedHouseId}
            onSelectHouse={(house) => {
              setSelectedHouseId(house.id);
              setCurrentView('house_detail');
            }}
            onOpenFamilyTree={() => setCurrentView('family_tree')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {villageHouses.map((house) => {
              const residentsOfHouse = residents.filter(r => house.residents.includes(r.id));
              return (
                <div
                  key={house.id}
                  onClick={() => {
                    setSelectedHouseId(house.id);
                    setCurrentView('house_detail');
                  }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video">
                      <img
                        src={house.photo}
                        alt={house.address}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        {house.yearBuilt} г.
                      </span>
                      {house.memorialPlaque && (
                        <span className="absolute top-2.5 right-2.5 bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                          📛 Табличка
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-black text-slate-900 text-sm group-hover:text-amber-900 transition-colors">
                        {house.address}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {house.architecturalStyle || 'Северная изба'}
                      </p>

                      {/* Residents Avatars */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">
                          Жители ({residentsOfHouse.length}):
                        </span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {residentsOfHouse.slice(0, 4).map(r => (
                            <img
                              key={r.id}
                              src={r.photo}
                              alt={r.name}
                              title={r.name}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                    <span>Открыть карточку дома</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: 3.1. Main Screen «Интерактивная деревня»
  // =========================================================================
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl select-none">
          🏡
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest">
              Народная летопись памяти
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-amber-100">
            🏡 ИНТЕРАКТИВНАЯ ДЕРЕВНЯ
          </h1>

          <p className="text-sm sm:text-base text-amber-200/90 font-serif leading-relaxed">
            Цифровой архив жителей, домов и историй. Сохраняем память о родных деревнях, объединяем поколения и находим родственников по всей стране.
          </p>

          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowAddVillageModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus size={16} />
              <span>Добавить свою деревню</span>
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft size={16} />
                <span>На главную</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-8 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="🔍 Найдите деревню по названию или району..."
            value={villageSearch}
            onChange={(e) => setVillageSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-medium shadow-xs"
          />
        </div>

        <div className="md:col-span-4 flex items-center justify-between sm:justify-end gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Оцифровано</span>
            <span className="font-black text-slate-900">{villages.length} деревень • {houses.length} домов</span>
          </div>
          <button
            onClick={() => setShowAddVillageModal(true)}
            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs shrink-0"
            title="Добавить деревню"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Village List Grid (3.1. Список деревень) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">
            Выберите деревню для открытия карты:
          </h2>
          <span className="text-xs text-slate-500">
            Показано: {filteredVillages.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVillages.map((village) => {
            const vHouses = houses.filter(h => h.villageId === village.id);
            const vResidents = residents.filter(r => r.villageId === village.id);

            return (
              <div
                key={village.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative aspect-16/9 overflow-hidden">
                    <img
                      src={village.coverImage || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'}
                      alt={village.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                        {village.district}
                      </span>
                      <h3 className="text-xl font-black text-white">
                        📍 {village.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-600 line-clamp-3 font-serif">
                      {village.description}
                    </p>

                    {/* Features tags */}
                    {village.heritageFeatures && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {village.heritageFeatures.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[11px]">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Домов</span>
                        <span className="font-black text-slate-900">{vHouses.length || village.housesCount || 0}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Жителей</span>
                        <span className="font-black text-slate-900">{vResidents.length || village.residentsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Button [ОТКРЫТЬ] */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      setSelectedVillageId(village.id);
                      setCurrentView('village_map');
                    }}
                    className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>ОТКРЫТЬ КАРТУ ДЕРЕВНИ</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Village Promo Card */}
          <div
            onClick={() => setShowAddVillageModal(true)}
            className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-amber-50/30 transition-all min-h-[320px] group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={28} />
            </div>
            <h3 className="font-black text-slate-900 text-base mb-1">
              ➕ Добавить свою деревню
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              Создайте цифровую летопись своей малой родины: нанесите дома, запишите воспоминания старожилов и имена земляков.
            </p>
            <span className="px-4 py-2 bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs">
              Заполнить карточку деревни
            </span>
          </div>
        </div>
      </div>

      {/* MODAL: Add Village */}
      {showAddVillageModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🏡 Добавить новую деревню</span>
              </h3>
              <button
                onClick={() => setShowAddVillageModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVillage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Название деревни: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="напр., Задориха"
                  value={newVillageName}
                  onChange={(e) => setNewVillageName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Район:
                  </label>
                  <input
                    type="text"
                    value={newVillageDistrict}
                    onChange={(e) => setNewVillageDistrict(e.target.value)}
                    placeholder="Устьянский район"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Год основания:
                  </label>
                  <input
                    type="number"
                    value={newVillageYear}
                    onChange={(e) => setNewVillageYear(e.target.value)}
                    placeholder="1780"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Описание и исторические особенности:
                </label>
                <textarea
                  rows={3}
                  value={newVillageDesc}
                  onChange={(e) => setNewVillageDesc(e.target.value)}
                  placeholder="Северная деревня, известные мастера, традиции..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ссылка на фото обложки (URL):
                </label>
                <input
                  type="url"
                  value={newVillageCover}
                  onChange={(e) => setNewVillageCover(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVillageModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-md"
                >
                  Создать летопись
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add House */}
      {showAddHouseModal && activeVillage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>🏠 Добавить дом в д. {activeVillage.name}</span>
              </h3>
              <button
                onClick={() => setShowAddHouseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHouse} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Улица:
                  </label>
                  <input
                    type="text"
                    required
                    value={newHouseStreet}
                    onChange={(e) => setNewHouseStreet(e.target.value)}
                    placeholder="ул. Центральная"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Номер дома: *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHouseNumber}
                    onChange={(e) => setNewHouseNumber(e.target.value)}
                    placeholder="7"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Год постройки:
                  </label>
                  <input
                    type="number"
                    value={newHouseYear}
                    onChange={(e) => setNewHouseYear(e.target.value)}
                    placeholder="1952"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Архитектурный тип:
                  </label>
                  <input
                    type="text"
                    value={newHouseStyle}
                    onChange={(e) => setNewHouseStyle(e.target.value)}
                    placeholder="Северная изба-пятистенок"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  История дома и воспоминания:
                </label>
                <textarea
                  rows={2}
                  value={newHouseHistory}
                  onChange={(e) => setNewHouseHistory(e.target.value)}
                  placeholder="Кто рубил дом, когда перестраивали, предания..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Фотография дома (URL):
                </label>
                <input
                  type="url"
                  value={newHousePhoto}
                  onChange={(e) => setNewHousePhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddHouseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-md"
                >
                  Нанести дом на карту
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Resident */}
      {showAddResidentModal && activeVillage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <span>👤 Записать жителя в архив</span>
              </h3>
              <button
                onClick={() => setShowAddResidentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateResident} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ФИО жителя: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="напр., Петров Иван Васильевич"
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Год рождения: *
                  </label>
                  <input
                    type="number"
                    required
                    value={newResBirthYear}
                    onChange={(e) => setNewResBirthYear(e.target.value)}
                    placeholder="1930"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Год ухода:
                  </label>
                  <input
                    type="number"
                    disabled={newResIsAlive}
                    value={newResDeathYear}
                    onChange={(e) => setNewResDeathYear(e.target.value)}
                    placeholder={newResIsAlive ? 'Живёт и здравствует' : '2005'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aliveCheck"
                  checked={newResIsAlive}
                  onChange={(e) => setNewResIsAlive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="aliveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Житель живёт и здравствует в настоящее время
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Место рождения:
                </label>
                <input
                  type="text"
                  value={newResBirthPlace}
                  onChange={(e) => setNewResBirthPlace(e.target.value)}
                  placeholder={`д. ${activeVillage.name}`}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Профессия / ремесло:
                </label>
                <input
                  type="text"
                  value={newResOccupation}
                  onChange={(e) => setNewResOccupation(e.target.value)}
                  placeholder="Мастер-плотник, учитель, кузнец..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Заслуги (через запятую):
                </label>
                <input
                  type="text"
                  value={newResAchievements}
                  onChange={(e) => setNewResAchievements(e.target.value)}
                  placeholder="Ветеран труда, Медаль за отвагу, Заслуженный учитель..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Биография и воспоминания:
                </label>
                <textarea
                  rows={3}
                  value={newResBio}
                  onChange={(e) => setNewResBio(e.target.value)}
                  placeholder="Текст воспоминаний, жизненного пути, истории..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Фотография (URL):
                </label>
                <input
                  type="url"
                  value={newResPhoto}
                  onChange={(e) => setNewResPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddResidentModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-md"
                >
                  Сохранить жителя
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Photo Viewer */}
      {photoViewerUrl && (
        <div
          onClick={() => setPhotoViewerUrl(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
        >
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={photoViewerUrl} alt="Archive preview" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
