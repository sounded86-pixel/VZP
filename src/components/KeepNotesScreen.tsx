import React, { useState, useEffect } from 'react';
import { KeepNote, UserProfile } from '../types';
import { googleSignIn, logout, initAuth } from '../lib/googleAuth';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pin, Trash2, Search, Plus, RefreshCw, Check, CheckSquare, Square, 
  Cloud, CloudOff, Palette, LogOut, AlertTriangle, FileText, Settings, X, ChevronRight, Edit3
} from 'lucide-react';

interface KeepNotesScreenProps {
  currentUser: UserProfile;
  isOffline: boolean;
}

const KEEP_COLORS = [
  { id: 'white', name: 'Белый', bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-900' },
  { id: 'yellow', name: 'Желтый', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-950' },
  { id: 'green', name: 'Зеленый', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-950' },
  { id: 'blue', name: 'Синий', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-950' },
  { id: 'purple', name: 'Сиреневый', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-950' },
  { id: 'rose', name: 'Розовый', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-950' },
  { id: 'slate', name: 'Серый', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900' }
];

export default function KeepNotesScreen({ currentUser, isOffline }: KeepNotesScreenProps) {
  const [notes, setNotes] = useState<KeepNote[]>(() => {
    const saved = localStorage.getItem(`keep_notes_${currentUser.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Note Creator State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('white');
  const [isPinned, setIsPinned] = useState(false);
  
  // Checklist State
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<{ text: string; done: boolean }[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null);

  // Active edit state
  const [editingNote, setEditingNote] = useState<KeepNote | null>(null);

  // Persist notes locally
  useEffect(() => {
    localStorage.setItem(`keep_notes_${currentUser.id}`, JSON.stringify(notes));
  }, [notes, currentUser.id]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setSyncStatus('idle');
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Trigger Google Sign-In
  const handleSignIn = async () => {
    if (isOffline) {
      alert("Невозможно авторизоваться: вы находитесь в автономном (оффлайн) режиме.");
      return;
    }
    try {
      setSyncing(true);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setSyncStatus('idle');
        // Automatically sync after login
        await triggerCloudSync(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setErrorMessage(err.message || "Ошибка авторизации");
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm("Выйти из аккаунта Google? Ваши локальные заметки сохранятся в памяти приложения.")) {
      await logout();
      setGoogleUser(null);
      setAccessToken(null);
      setSyncStatus('idle');
    }
  };

  // Google Drive Sync Engine
  const triggerCloudSync = async (tokenToUse?: string) => {
    const token = tokenToUse || accessToken;
    if (!token) {
      setSyncStatus('error');
      setErrorMessage("Требуется авторизация Google для синхронизации.");
      return;
    }
    if (isOffline) {
      setSyncStatus('error');
      setErrorMessage("Нет подключения к сети для выполнения синхронизации.");
      return;
    }

    setSyncing(true);
    setSyncStatus('idle');
    try {
      // 1. Fetch JSON files from Google Drive named 'KeepNote_*.json'
      const listUrl = `https://www.googleapis.com/drive/v3/files?q=name+contains+%27KeepNote_%27+and+trashed+%3D+false&fields=files(id,name,modifiedTime)`;
      const listRes = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!listRes.ok) {
        throw new Error(`Ошибка списка файлов на Диске: ${listRes.statusText}`);
      }

      const listData = await listRes.json();
      const driveFiles = listData.files || [];

      // Create a map of Drive Note ID -> Drive File
      const driveNotesMap: Record<string, { fileId: string; modifiedTime: string; noteId: string }> = {};
      driveFiles.forEach((file: any) => {
        const match = file.name.match(/KeepNote_(.+)\.json/);
        if (match) {
          const noteId = match[1];
          driveNotesMap[noteId] = {
            fileId: file.id,
            modifiedTime: file.modifiedTime,
            noteId
          };
        }
      });

      const updatedNotes = [...notes];
      let hasChanges = false;

      // 2. Sync local notes with Drive notes
      for (const localNote of notes) {
        const driveItem = driveNotesMap[localNote.id];
        
        if (driveItem) {
          // File exists both locally and on Drive. Compare update times.
          const driveTime = new Date(driveItem.modifiedTime).getTime();
          const localTime = new Date(localNote.updatedAt).getTime();

          if (localTime > driveTime) {
            // Local is newer: upload local to Drive
            await updateDriveFile(token, driveItem.fileId, localNote);
          } else if (driveTime > localTime) {
            // Drive is newer: download Drive file to local
            const downloadedNote = await downloadDriveFile(token, driveItem.fileId);
            if (downloadedNote) {
              const idx = updatedNotes.findIndex(n => n.id === localNote.id);
              if (idx !== -1) {
                updatedNotes[idx] = { ...downloadedNote, driveFileId: driveItem.fileId };
                hasChanges = true;
              }
            }
          }
          // Remove from map to track what's left
          delete driveNotesMap[localNote.id];
        } else {
          // Local only: create file on Drive
          if (!localNote.driveFileId) {
            const driveFileId = await createDriveFile(token, localNote);
            if (driveFileId) {
              const idx = updatedNotes.findIndex(n => n.id === localNote.id);
              if (idx !== -1) {
                updatedNotes[idx].driveFileId = driveFileId;
                hasChanges = true;
              }
            }
          }
        }
      }

      // 3. Drive files that don't exist locally: download them!
      for (const remainingNoteId in driveNotesMap) {
        const driveItem = driveNotesMap[remainingNoteId];
        const downloadedNote = await downloadDriveFile(token, driveItem.fileId);
        if (downloadedNote) {
          updatedNotes.push({ ...downloadedNote, driveFileId: driveItem.fileId });
          hasChanges = true;
        }
      }

      if (hasChanges) {
        setNotes(updatedNotes);
      }
      setSyncStatus('success');
    } catch (error: any) {
      console.error("Ошибка синхронизации:", error);
      setSyncStatus('error');
      setErrorMessage(error.message || "Ошибка синхронизации файлов с Google Диском.");
    } finally {
      setSyncing(false);
    }
  };

  // Create file on Google Drive
  const createDriveFile = async (token: string, note: KeepNote): Promise<string | null> => {
    try {
      const metadata = {
        name: `KeepNote_${note.id}.json`,
        mimeType: 'application/json',
        description: 'Google Keep Note backup file generated by Ust-Yany mutual aid app.'
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(note)], { type: 'application/json' }));

      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      if (res.ok) {
        const data = await res.json();
        return data.id;
      }
      return null;
    } catch (err) {
      console.error("Ошибка создания файла на Диске:", err);
      return null;
    }
  };

  // Update file on Google Drive
  const updateDriveFile = async (token: string, fileId: string, note: KeepNote) => {
    try {
      await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(note)
      });
    } catch (err) {
      console.error("Ошибка обновления файла на Диске:", err);
    }
  };

  // Download note file from Google Drive
  const downloadDriveFile = async (token: string, fileId: string): Promise<KeepNote | null> => {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error("Ошибка загрузки файла с Диска:", err);
      return null;
    }
  };

  // Delete file from Google Drive
  const deleteDriveFile = async (token: string, fileId: string) => {
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Ошибка удаления файла с Диска:", err);
    }
  };

  // Create local Note
  const handleAddNote = async () => {
    if (!title.trim() && !content.trim() && checklistItems.length === 0) {
      setIsAdding(false);
      return;
    }

    const newNote: KeepNote = {
      id: `note_${Date.now()}`,
      title: title.trim() || 'Без названия',
      content: isChecklist ? '' : content,
      color: selectedColor,
      pinned: isPinned,
      isChecklist,
      checklistItems: isChecklist ? checklistItems : [],
      updatedAt: new Date().toISOString()
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);

    // Reset Form
    setTitle('');
    setContent('');
    setSelectedColor('white');
    setIsPinned(false);
    setIsChecklist(false);
    setChecklistItems([]);
    setIsAdding(false);

    // Sync with cloud if logged in
    if (googleUser && accessToken && !isOffline) {
      const fileId = await createDriveFile(accessToken, newNote);
      if (fileId) {
        setNotes(prev => prev.map(n => n.id === newNote.id ? { ...n, driveFileId: fileId } : n));
      }
    }
  };

  // Toggle Pinned
  const togglePin = async (noteId: string) => {
    const updated = notes.map(n => n.id === noteId ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n);
    setNotes(updated);

    const updatedNote = updated.find(n => n.id === noteId);
    if (updatedNote && googleUser && accessToken && !isOffline && updatedNote.driveFileId) {
      await updateDriveFile(accessToken, updatedNote.driveFileId, updatedNote);
    }
  };

  // Delete Note
  const handleDeleteNote = async (note: KeepNote) => {
    // Explicit confirmation dialog (Adhering to Workspace Integration Guidelines)
    const confirmed = window.confirm(
      `Вы действительно хотите удалить заметку "${note.title}"? Это действие сотрет её из памяти приложения и удалит резервную копию на Google Диске.`
    );
    if (!confirmed) return;

    // Remove locally
    setNotes(prev => prev.filter(n => n.id !== note.id));

    // Remove from cloud if exists
    if (note.driveFileId && googleUser && accessToken && !isOffline) {
      await deleteDriveFile(accessToken, note.driveFileId);
    }
  };

  // Checkbox Item Toggles
  const handleToggleChecklistItem = async (noteId: string, itemIndex: number) => {
    const updated = notes.map(n => {
      if (n.id === noteId) {
        const items = [...n.checklistItems];
        items[itemIndex] = { ...items[itemIndex], done: !items[itemIndex].done };
        return { ...n, checklistItems: items, updatedAt: new Date().toISOString() };
      }
      return n;
    });
    setNotes(updated);

    const updatedNote = updated.find(n => n.id === noteId);
    if (updatedNote && googleUser && accessToken && !isOffline && updatedNote.driveFileId) {
      await updateDriveFile(accessToken, updatedNote.driveFileId, updatedNote);
    }
  };

  // Checklist Creator helper
  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, { text: newChecklistItem.trim(), done: false }]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  // Edit Note Action
  const handleOpenEdit = (note: KeepNote) => {
    setEditingNote(note);
  };

  const handleSaveEdit = async () => {
    if (!editingNote) return;

    const updated = notes.map(n => n.id === editingNote.id ? { 
      ...editingNote, 
      updatedAt: new Date().toISOString() 
    } : n);

    setNotes(updated);
    const updatedNote = updated.find(n => n.id === editingNote.id);

    if (updatedNote && googleUser && accessToken && !isOffline) {
      if (updatedNote.driveFileId) {
        await updateDriveFile(accessToken, updatedNote.driveFileId, updatedNote);
      } else {
        const fileId = await createDriveFile(accessToken, updatedNote);
        if (fileId) {
          setNotes(prev => prev.map(n => n.id === updatedNote.id ? { ...n, driveFileId: fileId } : n));
        }
      }
    }

    setEditingNote(null);
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.checklistItems.some(i => i.text.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesColor = activeColorFilter ? note.color === activeColorFilter : true;
    
    return matchesSearch && matchesColor;
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const otherNotes = filteredNotes.filter(n => !n.pinned);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-sans" id="keep_notes_screen_root">
      
      {/* Cloud Drive Sync Header Panel */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-2xl p-5 shadow-md mb-6 border border-amber-400">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl text-white">
              <Cloud size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Облачная синхронизация заметок</h3>
              <p className="text-xs text-amber-50 opacity-90">
                Сохраняйте личные заметки, планы, списки покупок или напоминания с поддержкой бэкапа на Google Диск
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
            {googleUser ? (
              <div className="flex flex-wrap items-center gap-2 bg-black/15 p-2 rounded-xl border border-white/10 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold px-1 text-yellow-100">
                  <CheckCircleIcon />
                  <span className="truncate max-w-[120px]">{googleUser.displayName || googleUser.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerCloudSync()}
                  disabled={syncing}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Синхронизация..." : "Синхронизировать"}
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="bg-transparent hover:bg-white/10 text-white p-1.5 rounded-lg text-xs font-bold transition-all"
                  title="Выйти из Google аккаунта"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={syncing}
                className="w-full md:w-auto bg-white hover:bg-amber-50 text-amber-950 px-4 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <GoogleLogo />
                <span>Войти через Google и включить бэкап</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync result alert messages */}
        {syncStatus === 'success' && (
          <div className="mt-3 bg-emerald-500/30 text-emerald-100 border border-emerald-500/20 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
            <Check size={14} className="stroke-[3]" />
            Синхронизация успешно завершена! Ваши заметки в облаке Google Диска.
          </div>
        )}
        {syncStatus === 'error' && (
          <div className="mt-3 bg-red-500/30 text-red-100 border border-red-500/20 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={14} />
            Синхронизация приостановлена: {errorMessage}
          </div>
        )}
      </div>

      {/* Note Creator Form */}
      <div className="max-w-xl mx-auto mb-8">
        {!isAdding ? (
          <div 
            onClick={() => setIsAdding(true)}
            className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all"
          >
            <span className="text-slate-450 font-medium">Новая заметка или список дел...</span>
            <div className="flex items-center gap-2 text-slate-450">
              <button 
                type="button"
                title="Создать список"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChecklist(true);
                  setIsAdding(true);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <CheckSquare size={18} />
              </button>
              <button type="button" className="p-1.5 hover:bg-slate-100 rounded-lg">
                <Plus size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-amber-400 rounded-2xl shadow-md p-4 space-y-3 transition-all">
            <div className="flex items-center justify-between gap-2">
              <input 
                type="text"
                placeholder="Заголовок"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full font-bold text-lg text-slate-900 border-none outline-none focus:ring-0 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1.5 rounded-lg transition-all ${isPinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Закрепить заметку"
              >
                <Pin size={18} className={isPinned ? 'fill-amber-500' : ''} />
              </button>
            </div>

            {/* Checklist Editor Mode */}
            {isChecklist ? (
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...checklistItems];
                        updated[index].done = !updated[index].done;
                        setChecklistItems(updated);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {item.done ? <CheckSquare size={16} className="text-emerald-500" /> : <Square size={16} />}
                    </button>
                    <span className={`text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.text}
                    </span>
                    <button 
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-slate-400 hover:text-red-500 ml-auto p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center gap-2 pt-1">
                  <Plus size={16} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Добавить пункт"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                    className="w-full text-sm text-slate-700 outline-none placeholder:text-slate-400 border-none focus:ring-0 py-0.5"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            ) : (
              <textarea
                placeholder="Заметка..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-slate-800 text-sm border-none outline-none focus:ring-0 min-h-[80px] placeholder:text-slate-400 resize-y"
              />
            )}

            {/* Note Options (Color selection and Submission buttons) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1">
                <Palette size={14} className="text-slate-400 mr-1" />
                {KEEP_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-5 h-5 rounded-full border transition-all ${color.bg} ${color.border} ${
                      selectedColor === color.id ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsChecklist(!isChecklist);
                    if (isChecklist) {
                      setChecklistItems([]);
                    }
                  }}
                  className="px-3 py-1.5 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                >
                  {isChecklist ? "✏️ В обычный текст" : "☑️ В список дел"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-xs transition-all"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-6 bg-slate-100 p-3 rounded-2xl border">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Поиск по заголовкам и тексту заметок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-amber-450 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase mr-1 whitespace-nowrap">Цвет:</span>
          <button
            onClick={() => setActiveColorFilter(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              activeColorFilter === null ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            Все
          </button>
          {KEEP_COLORS.map(col => {
            const hasNotes = notes.some(n => n.color === col.id);
            if (!hasNotes) return null; // Only show filters that have active notes
            return (
              <button
                key={col.id}
                onClick={() => setActiveColorFilter(col.id)}
                className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${col.bg} ${col.border} ${col.text} ${
                  activeColorFilter === col.id ? 'ring-2 ring-amber-500 font-extrabold' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {col.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* NOTES LIST */}
      {notes.length === 0 ? (
        <div className="text-center py-14 px-4 bg-white border rounded-2xl">
          <div className="text-slate-300 mb-3 flex justify-center">
            <FileText size={48} className="stroke-[1.5]" />
          </div>
          <h4 className="text-base font-black text-slate-700">Здесь будут ваши заметки</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Создавайте записки, заготовки обращений, списки покупок или дел на день. Вся информация хранится надежно!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-1">
                <Pin size={12} className="fill-amber-500" /> Закрепленные
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onTogglePin={togglePin} 
                    onDelete={handleDeleteNote}
                    onOpenEdit={handleOpenEdit}
                    onToggleCheckItem={handleToggleChecklistItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular section */}
          {otherNotes.length > 0 && (
            <div className="space-y-2">
              {pinnedNotes.length > 0 && (
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Другие заметки</h4>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onTogglePin={togglePin} 
                    onDelete={handleDeleteNote}
                    onOpenEdit={handleOpenEdit}
                    onToggleCheckItem={handleToggleChecklistItem}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Note Modal */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-2xl p-5 shadow-2xl border-2 ${
                KEEP_COLORS.find(c => c.id === editingNote.color)?.bg || 'bg-white'
              } ${
                KEEP_COLORS.find(c => c.id === editingNote.color)?.border || 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-2">
                <input 
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full font-bold text-lg border-none outline-none bg-transparent focus:ring-0 text-slate-900"
                  placeholder="Заголовок"
                />
                <button
                  type="button"
                  onClick={() => setEditingNote({ ...editingNote, pinned: !editingNote.pinned })}
                  className={`p-1.5 rounded-lg transition-all ${editingNote.pinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  <Pin size={18} className={editingNote.pinned ? 'fill-amber-500' : ''} />
                </button>
              </div>

              {editingNote.isChecklist ? (
                <div className="space-y-2 py-2 max-h-[250px] overflow-y-auto">
                  {editingNote.checklistItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...editingNote.checklistItems];
                          updated[index] = { ...updated[index], done: !updated[index].done };
                          setEditingNote({ ...editingNote, checklistItems: updated });
                        }}
                        className="text-slate-500"
                      >
                        {item.done ? <CheckSquare size={16} className="text-emerald-500" /> : <Square size={16} />}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          const updated = [...editingNote.checklistItems];
                          updated[index] = { ...updated[index], text: e.target.value };
                          setEditingNote({ ...editingNote, checklistItems: updated });
                        }}
                        className={`text-sm w-full bg-transparent border-none outline-none focus:ring-0 ${
                          item.done ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = editingNote.checklistItems.filter((_, i) => i !== index);
                          setEditingNote({ ...editingNote, checklistItems: updated });
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNote({
                        ...editingNote,
                        checklistItems: [...editingNote.checklistItems, { text: 'Новое дело', done: false }]
                      });
                    }}
                    className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1 pt-1"
                  >
                    <Plus size={12} /> Добавить пункт списка
                  </button>
                </div>
              ) : (
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 text-slate-800 min-h-[140px] resize-y"
                  placeholder="Заметка..."
                />
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-slate-100/30">
                <div className="flex flex-wrap items-center gap-1">
                  {KEEP_COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => setEditingNote({ ...editingNote, color: color.id })}
                      className={`w-5 h-5 rounded-full border transition-all ${color.bg} ${color.border} ${
                        editingNote.color === color.id ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingNote(null)}
                    className="px-4 py-2 hover:bg-slate-100/40 text-slate-500 rounded-xl text-xs font-bold"
                  >
                    Закрыть
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-sm transition-all"
                  >
                    Сохранить изменения
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Sub Component: Individual Note card
interface NoteCardProps {
  key?: string | number;
  note: KeepNote;
  onTogglePin: (id: string) => void;
  onDelete: (note: KeepNote) => void;
  onOpenEdit: (note: KeepNote) => void;
  onToggleCheckItem: (noteId: string, index: number) => void;
}

function NoteCard({ note, onTogglePin, onDelete, onOpenEdit, onToggleCheckItem }: NoteCardProps) {
  const colorObj = KEEP_COLORS.find(c => c.id === note.color) || KEEP_COLORS[0];
  const formattedDate = new Date(note.updatedAt).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`p-4 rounded-2xl border-2 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-3 ${colorObj.bg} ${colorObj.border} group relative`}>
      <div>
        <div className="flex justify-between items-start gap-2">
          <h5 className="font-extrabold text-sm text-slate-900 leading-snug">{note.title}</h5>
          
          <div className="flex items-center gap-1 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onTogglePin(note.id)}
              className={`p-1 hover:bg-black/5 rounded-lg transition-all ${note.pinned ? 'text-amber-500' : 'text-slate-400'}`}
              title={note.pinned ? "Открепить" : "Закрепить"}
            >
              <Pin size={14} className={note.pinned ? 'fill-amber-500' : ''} />
            </button>
          </div>
        </div>

        {/* Note Content display */}
        {note.isChecklist ? (
          <div className="space-y-1.5 mt-2">
            {note.checklistItems.slice(0, 5).map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => onToggleCheckItem(note.id, index)}
              >
                {item.done ? (
                  <CheckSquare size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <Square size={14} className="text-slate-400 shrink-0" />
                )}
                <span className={`text-xs ${item.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {item.text}
                </span>
              </div>
            ))}
            {note.checklistItems.length > 5 && (
              <div className="text-[10px] text-slate-400 font-semibold pl-5">
                И еще {note.checklistItems.length - 5} пунктов...
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-700 font-medium mt-2 whitespace-pre-wrap line-clamp-6 leading-relaxed">
            {note.content}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100/40 pt-2.5 mt-1 text-[10px] text-slate-400 font-semibold">
        <div className="flex items-center gap-1">
          <span>{formattedDate}</span>
          {note.driveFileId && (
            <span className="text-emerald-600 flex items-center gap-0.5" title="Сохранено в облаке Google Диска">
              • <Cloud size={10} /> Диск
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-20 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onOpenEdit(note)}
            className="p-1.5 hover:bg-black/5 text-slate-500 rounded-lg transition-all"
            title="Редактировать"
          >
            <Edit3 size={12} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
            title="Удалить заметку"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons Helpers (SVGs for simplicity and avoiding third-party mismatches)
function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    </svg>
  );
}
