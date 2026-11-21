import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Share2, Printer, Plus, ArrowLeft, Heart, 
  ExternalLink, Sparkles, Filter, ChevronRight, UserPlus
} from 'lucide-react';
import { VillageResident, VillageFamilyTree, InteractiveVillage, VillageHouse } from '../../types';

interface FamilyTreeVisualizerProps {
  village: InteractiveVillage;
  residents: VillageResident[];
  houses: VillageHouse[];
  familyTrees: VillageFamilyTree[];
  initialResidentId?: string;
  onSelectResident: (residentId: string) => void;
  onBack: () => void;
  onAddRelative?: (fromResidentId: string) => void;
}

export const FamilyTreeVisualizer: React.FC<FamilyTreeVisualizerProps> = ({
  village,
  residents,
  houses,
  familyTrees,
  initialResidentId,
  onSelectResident,
  onBack,
  onAddRelative
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRootId, setSelectedRootId] = useState<string>(
    initialResidentId || residents[0]?.id || ''
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Selected root resident
  const rootResident = useMemo(() => {
    return residents.find(r => r.id === selectedRootId) || residents[0];
  }, [residents, selectedRootId]);

  // Build tree nodes relative to rootResident:
  // Generation 1: Ancestors / Parents / Grandparents
  // Generation 2: Root & Spouses & Siblings
  // Generation 3: Children
  // Generation 4: Grandchildren
  const treeData = useMemo(() => {
    if (!rootResident) return { ancestors: [], selfAndSpouse: [], children: [], grandchildren: [] };

    const getRes = (id: string) => residents.find(r => r.id === id);

    // Relatives from direct `relatives` array and familyTree connections
    const spouseIds: string[] = [];
    const parentIds: string[] = [];
    const childIds: string[] = [];
    const siblingIds: string[] = [];
    const grandchildIds: string[] = [];

    (rootResident.relatives || []).forEach(rel => {
      if (rel.relation === 'spouse') spouseIds.push(rel.residentId);
      if (rel.relation === 'parent') parentIds.push(rel.residentId);
      if (rel.relation === 'child') childIds.push(rel.residentId);
      if (rel.relation === 'sibling') siblingIds.push(rel.residentId);
      if (rel.relation === 'grandchild') grandchildIds.push(rel.residentId);
    });

    // Also scan tree connections in familyTrees
    familyTrees.forEach(t => {
      t.connections.forEach(c => {
        if (c.from === rootResident.id) {
          if (c.relation === 'spouse' && !spouseIds.includes(c.to)) spouseIds.push(c.to);
          if (c.relation === 'child' && !childIds.includes(c.to)) childIds.push(c.to);
          if (c.relation === 'sibling' && !siblingIds.includes(c.to)) siblingIds.push(c.to);
        }
        if (c.to === rootResident.id) {
          if (c.relation === 'parent' && !parentIds.includes(c.from)) parentIds.push(c.from);
          if (c.relation === 'spouse' && !spouseIds.includes(c.from)) spouseIds.push(c.from);
        }
      });
    });

    // Also check children of children to find grandchildren
    childIds.forEach(cId => {
      const child = getRes(cId);
      if (child && child.relatives) {
        child.relatives.forEach(r => {
          if (r.relation === 'child' && !grandchildIds.includes(r.residentId)) {
            grandchildIds.push(r.residentId);
          }
        });
      }
    });

    return {
      ancestors: parentIds.map(getRes).filter(Boolean) as VillageResident[],
      selfAndSpouse: [rootResident, ...spouseIds.map(getRes).filter(Boolean) as VillageResident[]],
      siblings: siblingIds.map(getRes).filter(Boolean) as VillageResident[],
      children: childIds.map(getRes).filter(Boolean) as VillageResident[],
      grandchildren: grandchildIds.map(getRes).filter(Boolean) as VillageResident[]
    };
  }, [rootResident, residents, familyTrees]);

  // Search filtered residents in the village
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return residents.filter(r => 
      r.name.toLowerCase().includes(q) ||
      (r.occupation && r.occupation.toLowerCase().includes(q)) ||
      (r.birthYear && r.birthYear.toString().includes(q))
    );
  }, [residents, searchQuery]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const getHouseAddress = (houseId: string) => {
    const h = houses.find(house => house.id === houseId);
    return h ? h.address : '';
  };

  const renderNodeCard = (resident: VillageResident, badgeLabel?: string, isCenter = false) => {
    const address = getHouseAddress(resident.houseId);
    return (
      <div
        key={resident.id}
        onClick={() => onSelectResident(resident.id)}
        className={`group cursor-pointer transition-all duration-200 rounded-2xl p-3 border text-left relative flex flex-col justify-between ${
          isCenter
            ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/40 shadow-lg min-w-[220px]'
            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md min-w-[200px]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src={resident.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={resident.name}
              className={`w-12 h-12 rounded-xl object-cover border-2 ${
                resident.isAlive ? 'border-emerald-400' : 'border-slate-300'
              }`}
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                resident.isAlive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              title={resident.isAlive ? 'Живёт и здравствует' : 'Вечная память'}
            />
          </div>

          <div className="min-w-0 flex-1">
            {badgeLabel && (
              <span className="inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 mb-1">
                {badgeLabel}
              </span>
            )}
            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
              {resident.name}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {resident.birthYear} — {resident.deathYear || 'н.в.'}
            </p>
            {address && (
              <p className="text-[9px] text-slate-400 truncate mt-0.5">
                🏠 {address}
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
          <span className="text-slate-500 truncate max-w-[130px]">
            {resident.occupation || 'Житель деревни'}
          </span>
          <span className="text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Назад"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>🌳 Генеалогическое древо рода</span>
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                д. {village.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Связи поколений, родословные ветви и семейная преемственность жителей
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Share2 size={14} />
            <span>{copiedLink ? 'Ссылка скопирована!' : 'Поделиться'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Printer size={14} />
            <span>Печать древа</span>
          </button>
        </div>
      </div>

      {/* Search and Root Selector Bar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Найти родственника в деревне..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            Корень древа:
          </span>
          <select
            value={selectedRootId}
            onChange={(e) => setSelectedRootId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            {residents.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.birthYear}–{r.deathYear || 'н.в.'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Live Results Dropdown if query entered */}
      {searchQuery.trim() && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Результаты поиска ({searchResults.length}):
          </h4>
          {searchResults.length === 0 ? (
            <p className="text-xs text-slate-400">Никого не найдено по запросу «{searchQuery}»</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {searchResults.map(res => (
                <div
                  key={res.id}
                  onClick={() => {
                    setSelectedRootId(res.id);
                    setSearchQuery('');
                  }}
                  className="p-2.5 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={res.photo}
                      alt={res.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{res.name}</p>
                      <p className="text-[10px] text-slate-500">{res.birthYear}–{res.deathYear || 'н.в.'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700">Выбрать древо</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Family Tree Graphic Canvas */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[700px] flex flex-col items-center space-y-10">
          
          {/* 1. Generation 1: Ancestors / Parents */}
          {treeData.ancestors.length > 0 && (
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  Поколение I: Родители / Старшие в роду
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {treeData.ancestors.map(a => renderNodeCard(a, 'Родитель'))}
              </div>
              {/* Connecting Vertical Line */}
              <div className="w-0.5 h-8 bg-amber-300 my-1"></div>
            </div>
          )}

          {/* 2. Generation 2: Center Person, Spouse & Siblings */}
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Поколение II: Основатели ветви
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              {/* Center Person */}
              {rootResident && renderNodeCard(rootResident, 'Глава рода', true)}

              {/* Spouses */}
              {treeData.selfAndSpouse.slice(1).map(sp => renderNodeCard(sp, 'Супруг(а)'))}

              {/* Siblings */}
              {treeData.siblings.map(sib => renderNodeCard(sib, 'Брат / Сестра'))}
            </div>

            {/* Connecting Vertical Line to Children */}
            {(treeData.children.length > 0) && (
              <div className="w-0.5 h-8 bg-amber-300 my-1"></div>
            )}
          </div>

          {/* 3. Generation 3: Children */}
          {treeData.children.length > 0 && (
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Поколение III: Дети ({treeData.children.length})
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                {treeData.children.map(ch => renderNodeCard(ch, 'Сын / Дочь'))}
              </div>

              {/* Connecting Line to Grandchildren */}
              {treeData.grandchildren.length > 0 && (
                <div className="w-0.5 h-8 bg-emerald-300 my-1"></div>
              )}
            </div>
          )}

          {/* 4. Generation 4: Grandchildren */}
          {treeData.grandchildren.length > 0 && (
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                  Поколение IV: Внуки и правнуки ({treeData.grandchildren.length})
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                {treeData.grandchildren.map(gc => renderNodeCard(gc, 'Внук / Внучка'))}
              </div>
            </div>
          )}

          {/* If no relatives found yet */}
          {treeData.children.length === 0 && treeData.ancestors.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 font-medium">
                Для этого жителя пока не указаны родственные связи.
              </p>
              <button
                onClick={() => onAddRelative && onAddRelative(rootResident.id)}
                className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus size={14} />
                <span>Добавить родственника</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
