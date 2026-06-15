import React, { useState, useEffect, useRef } from 'react';
import { TOOL_CATEGORIES, ALL_TOOLS } from '../config/tools';
import { ToolDefinition } from '../types';
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Command,
  Binary,
  FileText,
  Wand2,
  Sliders,
  Wrench,
  Play,
  Layers,
  Calendar,
  TrendingUp,
  Timer,
  Activity,
  ChevronRight,
  Sparkles,
  Languages,
  Volume2
} from 'lucide-react';

interface LayoutProps {
  activeToolId: string;
  onSelectTool: (id: string) => void;
  children: React.ReactNode;
}

export default function Layout({ activeToolId, onSelectTool, children }: LayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('unitools_theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('unitools_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  const mapIcon = (iconName: string, isActive?: boolean) => {
    const p = { className: "w-4 h-4" };
    if (isActive) {
      switch (iconName) {
        case 'languages': return <Languages {...p} className="text-white" />;
        case 'volume2': return <Volume2 {...p} className="text-white" />;
        case 'activity': return <Activity {...p} className="text-white" />;
        case 'binary': return <Binary {...p} className="text-white" />;
        case 'file-text': return <FileText {...p} className="text-white" />;
        case 'wand': return <Wand2 {...p} className="text-white" />;
        case 'sliders': return <Sliders {...p} className="text-white" />;
        case 'wrench': return <Wrench {...p} className="text-white" />;
        case 'play': return <Play {...p} className="text-white animate-pulse" />;
        case 'layers': return <Layers {...p} className="text-white" />;
        case 'calendar': return <Calendar {...p} className="text-white" />;
        case 'trending-up': return <TrendingUp {...p} className="text-white" />;
        case 'stopwatch': return <Timer {...p} className="text-white" />;
        default: return <Wrench {...p} className="text-white" />;
      }
    }
    switch (iconName) {
      case 'languages': return <Languages {...p} className="text-indigo-500" />;
      case 'volume2': return <Volume2 {...p} className="text-teal-500" />;
      case 'activity': return <Activity {...p} className="text-emerald-500" />;
      case 'binary': return <Binary {...p} className="text-purple-500" />;
      case 'file-text': return <FileText {...p} className="text-sky-500" />;
      case 'wand': return <Wand2 {...p} className="text-pink-500" />;
      case 'sliders': return <Sliders {...p} className="text-blue-500" />;
      case 'wrench': return <Wrench {...p} className="text-amber-500" />;
      case 'play': return <Play {...p} className="text-indigo-500 animate-pulse" />;
      case 'layers': return <Layers {...p} className="text-emerald-500" />;
      case 'calendar': return <Calendar {...p} className="text-orange-500" />;
      case 'trending-up': return <TrendingUp {...p} className="text-emerald-500" />;
      case 'stopwatch': return <Timer {...p} className="text-rose-500" />;
      default: return <Wrench {...p} />;
    }
  };

  const filteredTools = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_TOOLS.slice(0, 5);
    return ALL_TOOLS.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-905 text-slate-800 dark:text-slate-100 font-sans antialiased">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-950 border-r border-slate-150 dark:border-slate-755 shadow-xs shrink-0 select-none">
        <div className="p-6 border-b border-slate-150 dark:border-slate-755 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-md text-white">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider text-slate-900 dark:text-white uppercase leading-none">UniTools</h1>
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mt-1">SaaS Pro</span>
            </div>
          </div>
        </div>

        {/* Command Palette trigger */}
        <div className="p-4 border-b border-slate-150 dark:border-slate-755">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full bg-slate-850 dark:bg-slate-905 hover:bg-slate-155 dark:hover:bg-slate-850 text-slate-401 dark:text-slate-401 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-between group transition-all duration-150 cursor-pointer border border-transparent hover:border-slate-150 dark:hover:border-slate-750"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-401 group-hover:text-indigo-500 transition-colors" />
              <span>Tìm công cụ nhanh...</span>
            </div>
            <kbd className="bg-white dark:bg-slate-800 border dark:border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono shadow-3xs">⌘ K</kbd>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {TOOL_CATEGORIES.map(cat => {
            const catTools = ALL_TOOLS.filter(t => t.category === cat.id);
            return (
              <div key={cat.id} className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-401 tracking-widest pl-2">
                  {cat.name}
                </span>
                <div className="space-y-1">
                  {catTools.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => onSelectTool(tool.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between group transition-all duration-150 ${activeToolId === tool.id ? 'bg-indigo-600 text-white shadow-sm font-bold scale-[1.01]' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-850 dark:hover:bg-slate-155'}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {mapIcon(tool.icon, activeToolId === tool.id)}
                        <span className="truncate">{tool.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-all ${activeToolId === tool.id ? 'text-white translate-x-0' : 'text-slate-304 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-150 dark:border-slate-755 text-[10px] text-slate-401 font-semibold select-none text-center bg-slate-850/30 dark:bg-slate-905/30">
          <span>Engine hiệu năng cao &amp; Recharts</span>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)}></div>
          <aside className="relative w-80 max-w-sm bg-slate-950 border-r border-slate-150 dark:border-slate-755 flex flex-col p-6 shadow-2xl h-full animate-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-401 hover:bg-slate-850 dark:hover:bg-slate-155"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-6">
              <Command className="w-6 h-6 text-indigo-500" />
              <h2 className="text-sm font-extrabold uppercase text-slate-900 dark:text-white">UniTools Suite</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
              {TOOL_CATEGORIES.map(cat => {
                const catTools = ALL_TOOLS.filter(t => t.category === cat.id);
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-401 uppercase tracking-widest block pl-1">{cat.name}</span>
                    <div className="space-y-1">
                      {catTools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => {
                            onSelectTool(tool.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${activeToolId === tool.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-450 hover:bg-slate-850 dark:hover:bg-slate-155'}`}
                        >
                          {mapIcon(tool.icon, activeToolId === tool.id)}
                          <span className="truncate">{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-950 border-b border-slate-150 dark:border-slate-755 px-6 flex items-center justify-between shadow-3xs z-10 select-none shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-850 dark:bg-slate-955 text-slate-600 dark:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-401">
              <span>UniTools</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-150" />
              <span className="text-slate-900 dark:text-slate-200 font-extrabold">
                {ALL_TOOLS.find(t => t.id === activeToolId)?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-155 dark:bg-slate-905 text-slate-401 hover:text-slate-900 dark:text-slate-401 dark:hover:text-white transition-all cursor-pointer border border-slate-150 dark:border-slate-750"
              title="Tìm tiện ích nhanh (Cmd + K)"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-155 dark:bg-slate-905 text-slate-401 hover:text-slate-900 dark:text-slate-401 dark:hover:text-white transition-all cursor-pointer border border-slate-150 dark:border-slate-750"
              title="Chuyển đổi giao diện Sáng / Tối"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <span className="text-[10px] items-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 dark:text-emerald-400 text-slate-900 dark:text-white font-extrabold px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-3xs hidden sm:flex">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Production Ready
            </span>
          </div>
        </header>

        {/* VIEWPORT CONTROLLER */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>

      {/* COMMAND PALETTE DIALOG */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setSearchOpen(false)}></div>
          <div className="relative w-full max-w-xl bg-slate-950 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-755 shadow-2xl p-6 text-slate-800 dark:text-white animate-scale-up">
            <div className="flex items-center gap-2.5 border-b border-slate-150 dark:border-slate-755 pb-4 mb-4">
              <Command className="w-5 h-5 text-indigo-500 animate-spin" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Gõ tên tính năng hoặc mô tả công cụ..."
                className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-401 pl-1 border-none focus:ring-0"
              />
              <button onClick={() => setSearchOpen(false)} className="text-[9px] font-bold text-slate-401 border dark:border-slate-700 px-2 py-1 rounded-lg bg-slate-850 dark:bg-slate-905">ESC</button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {filteredTools.length === 0 ? (
                <div className="text-slate-401 italic text-center py-6 text-xs">Không tìm thấy tiện ích nào trùng khớp...</div>
              ) : (
                filteredTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-850 dark:hover:bg-slate-155 border border-transparent hover:border-slate-150 dark:hover:border-slate-750 flex items-center justify-between group transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-850 dark:bg-slate-905 p-2 rounded-xl border border-slate-150 dark:border-slate-755">
                        {mapIcon(tool.icon)}
                      </div>
                      <div>
                        <span className="text-xs font-bold block group-hover:text-indigo-600 transition-colors">{tool.name}</span>
                        <span className="text-[10px] text-slate-401 block mt-0.5">{tool.description}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-304 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
            <div className="text-[9px] font-semibold text-slate-401 text-center mt-4 border-t border-slate-150 dark:border-slate-755 pt-3 flex items-center justify-center gap-3 select-none">
              <span>↑↓ Di chuyển</span>
              <span>• Bấm để kích hoạt tiện ích</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
