import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sliders, Timer, Play, Pause, RotateCcw, HeartPulse, Plus, Trash2, Edit2, Check, CheckSquare, Square, Flame } from 'lucide-react';

interface PomodoroTask {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
  pomodoros: number;
}

export default function PomodoroProductivity() {
  const [focusTime, setFocusTime] = useLocalStorage('unitools_pomodoro_focus_time', 25);
  const [shortTime, setShortTime] = useLocalStorage('unitools_pomodoro_short_time', 5);
  const [longTime, setLongTime] = useLocalStorage('unitools_pomodoro_long_time', 15);

  const [currentMode, setCurrentMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [paused, setPaused] = useState(true);

  // Focus and break total session times (tracked in seconds)
  const [workSecs, setWorkSecs] = useState(0);
  const [breakSecs, setBreakSecs] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Todo-List integration state
  const [tasks, setTasks] = useLocalStorage<PomodoroTask[]>('unitools_pomodoro_tasks', [
    { id: '1', title: 'Giải bài tập logic toán học', completed: false, notes: 'Hoàn thành chương 1', pomodoros: 1 },
    { id: '2', title: 'Nghiên cứu tài liệu vi tích phân', completed: false, notes: 'Đọc phương trình vi phân', pomodoros: 0 }
  ]);
  const [selectedTaskId, setSelectedTaskId] = useLocalStorage<string | null>('unitools_pomodoro_active_task', null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  // Apply new cycle setup
  const applyCycleSetup = () => {
    setPaused(true);
    if (currentMode === 'focus') {
      setTimeLeft(focusTime * 60);
    } else if (currentMode === 'shortBreak') {
      setTimeLeft(shortTime * 60);
    } else {
      setTimeLeft(longTime * 60);
    }
  };

  useEffect(() => {
    applyCycleSetup();
  }, [focusTime, shortTime, longTime, currentMode]);

  // Timer Tick implementation
  useEffect(() => {
    if (!paused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            triggerCycleSessionEnd();
            return 0;
          }
          // Increment statistical track
          if (currentMode === 'focus') {
            setWorkSecs(w => w + 1);
          } else {
            setBreakSecs(b => b + 1);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, currentMode]);

  const triggerCycleSessionEnd = () => {
    setPaused(true);
    playSynthAudioBeep();

    if (currentMode === 'focus') {
      // Safely increment completed pomodoro on the linked active task
      if (selectedTaskId) {
        setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, pomodoros: t.pomodoros + 1 } : t));
      }
      alert('Hoàn thành chu kỳ làm việc hiệu suất! Hãy nghỉ ngơi, phục hồi năng lượng nào.');
      setCurrentMode('shortBreak');
    } else {
      alert('Chu kỳ nghỉ xả hơi hoàn tất! Hãy tập trung cao độ trở lại.');
      setCurrentMode('focus');
    }
  };

  const playSynthAudioBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note beep
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn('AudioContext beep blocked by safety sandbox restrictions.');
    }
  };

  const resetCurrentTimer = () => {
    setPaused(true);
    applyCycleSetup();
  };

  const formatTimerLabel = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  // Recharts Pie Chart configuration
  const compiledRechartsData = React.useMemo(() => {
    return [
      { name: 'Tập trung (Giây)', value: workSecs, color: '#f43f5e' },
      { name: 'Nghỉ ngơi (Giây)', value: breakSecs, color: '#10b981' }
    ];
  }, [workSecs, breakSecs]);

  const ratio = React.useMemo(() => {
    if (workSecs === 0) return 0;
    return ((workSecs / (workSecs + breakSecs)) * 100).toFixed(1);
  }, [workSecs, breakSecs]);

  // Tasks managers functions
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: PomodoroTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      notes: newTaskNotes.trim() || undefined,
      pomodoros: 0
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskNotes('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleStartEdit = (task: PomodoroTask) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingNotes(task.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingTitle.trim()) return;
    setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, title: editingTitle.trim(), notes: editingNotes.trim() || undefined } : t));
    setEditingTaskId(null);
  };

  const activeTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* COLUMN 1: POMODORO CLOCK & SETUP (lg:col-span-4) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-6 flex flex-col items-center text-center justify-center relative overflow-hidden shadow-sm h-full">
          {/* Progress bar line */}
          <div
            className="absolute left-0 top-0 h-1.5 bg-rose-500 transition-all duration-300"
            style={{
              width: `${((focusTime * 60 - timeLeft) / (focusTime * 60)) * 100}%`
            }}
          ></div>

          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-2">
            <Timer className="w-5 h-5 mx-auto text-rose-500 mb-1" /> Đồng Hồ Pomodoro
          </span>
          <div className="text-6xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-widest my-4 drop-shadow-xs select-none">
            {formatTimerLabel()}
          </div>

          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-700 px-3.5 py-1 rounded-full mb-4">
            {currentMode === 'focus' ? '🎯 Tập Trung Cao Độ' : currentMode === 'shortBreak' ? '☕ Nghỉ Ngắn Phục Hồi' : '⛺ Nghỉ Dài'}
          </div>

          {activeTask && (
            <div className="mb-4 text-xs font-semibold text-rose-500 px-3 py-1 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/55 rounded-xl max-w-full truncate animate-pulse">
              🎯 Đang làm: <span className="font-bold">{activeTask.title}</span>
            </div>
          )}

          <div className="flex gap-2 w-full max-w-xs justify-center text-xs font-bold pt-2">
            <button
              onClick={() => setPaused(!paused)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all text-center flex-1 justify-center"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? 'Kích hoạt' : 'Tạm dừng'}
            </button>
            <button
              onClick={resetCurrentTimer}
              className="bg-slate-550 hover:bg-slate-600 dark:bg-slate-700 text-white py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all text-center"
              title="Khởi tạo lại đồng hồ hiện tại"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* SETTINGS CARD */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 border-b pb-3 mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-rose-500 animate-pulse" /> Thiết Lập Chu Kỳ (Phút)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tập trung</span>
              <input
                type="number"
                min={1}
                value={focusTime}
                onChange={(e) => setFocusTime(Math.max(1, parseInt(e.target.value) || 25))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold text-rose-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nghỉ ngắn</span>
              <input
                type="number"
                min={1}
                value={shortTime}
                onChange={(e) => setShortTime(Math.max(1, parseInt(e.target.value) || 5))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold text-emerald-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nghỉ dài</span>
              <input
                type="number"
                min={1}
                value={longTime}
                onChange={(e) => setLongTime(Math.max(1, parseInt(e.target.value) || 15))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold text-teal-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: INTEGRATED TODO LIST MANAGER (lg:col-span-4) */}
      <div className="lg:col-span-4 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm overflow-hidden h-full min-h-[450px]">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-650 dark:text-slate-200 border-b pb-3 mb-4 flex items-center justify-between">
          <span>📝 Tuyến Công Việc (To-Do List)</span>
          <span className="text-[10px] text-slate-400 font-bold font-mono">x {tasks.length}</span>
        </h3>

        {/* Input box to insert task */}
        <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
          <input
            type="text"
            placeholder="Tên công việc mới..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-white dark:bg-slate-850 text-xs px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 dark:text-slate-100"
          />
          <div className="flex gap-1.5">
            <textarea
              placeholder="Ghi chú thêm (không bắt buộc)..."
              value={newTaskNotes}
              onChange={(e) => setNewTaskNotes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
              className="flex-1 bg-white dark:bg-slate-850 text-[11px] px-2.5 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-rose-500 text-slate-800 dark:text-slate-100 resize-y min-h-[40px] max-h-32"
              rows={2}
            />
            <button
              onClick={handleAddTask}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm
            </button>
          </div>
        </div>

        {/* Tasks listings and active selections */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 italic">
              Không có công việc nào hiện tại. Hãy tạo để bắt đầu tích lũy!
            </div>
          ) : (
            tasks.map((task) => {
              const isSelected = selectedTaskId === task.id;
              const isEditing = editingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-rose-450 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/15'
                      : 'border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-2 py-1.5 rounded"
                      />
                      <textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-2 py-1.5 rounded resize-y min-h-[40px] max-h-32"
                        rows={2}
                        placeholder="Ghi chú..."
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="bg-slate-400 hover:bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className="text-slate-400 hover:text-rose-500 flex-shrink-0"
                          >
                            {task.completed ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            onClick={() => !task.completed && setSelectedTaskId(isSelected ? null : task.id)}
                            className={`text-xs font-bold truncate cursor-pointer select-none leading-tight ${
                              task.completed
                                ? 'line-through text-slate-400'
                                : isSelected
                                ? 'text-rose-600 dark:text-rose-450 hover:underline'
                                : 'text-slate-700 dark:text-slate-200 hover:text-rose-500'
                            }`}
                            title="Nhấp để Chọn/Bỏ chọn để liên kết tiến trình"
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleStartEdit(task)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Chỉnh sửa công việc"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="Xóa công việc"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {task.notes && (
                        <p className={`text-[10px] pl-6 mt-1 whitespace-pre-wrap break-words max-h-24 overflow-y-auto leading-relaxed pr-1 custom-scrollbar ${task.completed ? 'text-slate-400' : 'text-slate-450 dark:text-slate-400'}`}>
                          {task.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between pl-6 pt-1 text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-1 text-rose-500 dark:text-rose-450">
                          <Flame className="w-3.5 h-3.5" />
                          <span>Chu kỳ: {task.pomodoros} 🍅</span>
                        </div>
                        {isSelected && !task.completed && (
                          <span className="text-[9px] bg-rose-500/10 text-rose-550 px-1.5 py-0.5 rounded-full leading-none border border-rose-500/20">
                            Đang đính kèm...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 3: RECHARTS PIE STATS & VERBOSE REPORT (lg:col-span-4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm flex flex-col justify-between min-h-[450px]">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 border-b pb-3 mb-4">
            Định ngạch Thời gian Tích lũy Thực tế
          </h3>
          <div className="w-full h-[200px] relative flex justify-center items-center">
            {workSecs === 0 && breakSecs === 0 ? (
              <span className="text-[11px] text-slate-400 italic text-center px-4">
                Hãy kích hoạt đồng hồ để ghi nhận chỉ số thực tế...
              </span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => [`${value} giây`, 'Thời lượng']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Pie
                    data={compiledRechartsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {compiledRechartsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* POMODORO RUNTIME REPORT */}
        <div className="mt-4 bg-rose-50/20 dark:bg-slate-905 border border-rose-100 dark:border-slate-750/70 rounded-xl p-3.5 font-mono text-[11px] text-slate-650 dark:text-rose-350 leading-relaxed shadow-inner">
          <span className="font-bold block mb-1 text-[10px] text-rose-550 tracking-widest uppercase flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Hiệu Năng Chu Kỳ:
          </span>
          • Thời gian học thực: {Math.floor(workSecs / 60)}m {workSecs % 60}s<br />
          • Thời gian nghỉ thực: {Math.floor(breakSecs / 60)}m {breakSecs % 60}s<br />
          • Tỉ lệ đồng bộ học: {ratio}% <span className="text-slate-400">(mục tiêu &gt; 75%)</span>
        </div>
      </div>
    </div>
  );
}
