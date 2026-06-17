import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CocPotion } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Sliders, Plus, Trash2, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';

export default function CocProgressBuilder() {
  const [days, setDays] = useLocalStorage('unitools_coc_d', 10);
  const [hours, setHours] = useLocalStorage('unitools_coc_h', 0);
  const [minutes, setMinutes] = useLocalStorage('unitools_coc_m', 0);

  const [buffQueue, setBuffQueue] = useState<CocPotion[]>([
    { name: 'Builder Potion x10', multiplier: 10, duration: 1 }
  ]);

  const [potName, setPotName] = useLocalStorage('unitools_coc_pn', 'Builder Potion x10');
  const [potMult, setPotMult] = useLocalStorage('unitools_coc_pm', 10);
  const [potDur, setPotDur] = useLocalStorage('unitools_coc_pd', 1);
  const [report, setReport] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);

  const formatDuration = (secs: number) => {
    const dd = Math.floor(secs / 86400);
    const hh = Math.floor((secs % 86450) / 3600);
    const mm = Math.floor((secs % 3600) / 60);
    return `${dd} ngày ${hh} giờ ${mm} phút`;
  };

  const handleAddBuff = () => {
    if (!potName.trim() || potMult <= 0 || potDur <= 0) return;
    setBuffQueue(prev => [...prev, { name: potName, multiplier: potMult, duration: potDur }]);
  };

  const handleClearBuffs = () => {
    setBuffQueue([]);
  };

  const handleDeleteBuff = (index: number) => {
    setBuffQueue(prev => prev.filter((_, idx) => idx !== index));
  };

  useEffect(() => {
    const originalSeconds = days * 86400 + hours * 3600 + minutes * 60;
    if (originalSeconds <= 0) {
      setReport('Vui lòng cấu hình thời lượng nâng cấp thi công công trình hợp lệ.');
      setChartData([]);
      return;
    }

    let remainingWork = originalSeconds;
    let currentRealTime = 0.0;
    const trajectory = [{ x: 0, y: Number((originalSeconds / 3600).toFixed(1)) }];

    buffQueue.forEach((buff) => {
      if (remainingWork <= 0) return;
      const buffDurationSec = buff.duration * 3600;
      const maxWorkDone = buffDurationSec * buff.multiplier;

      let realTimeSpent;
      if (remainingWork >= maxWorkDone) {
        remainingWork -= maxWorkDone;
        realTimeSpent = buffDurationSec;
      } else {
        realTimeSpent = remainingWork / buff.multiplier;
        remainingWork = 0.0;
      }
      currentRealTime += realTimeSpent;
      trajectory.push({
        x: Number((currentRealTime / 3600).toFixed(1)),
        y: Number((remainingWork / 3600).toFixed(1))
      });
    });

    if (remainingWork > 0) {
      currentRealTime += remainingWork;
      remainingWork = 0.0;
      trajectory.push({
        x: Number((currentRealTime / 3600).toFixed(1)),
        y: 0
      });
    }

    const savedSecs = Math.max(0, originalSeconds - currentRealTime);
    const completionDate = new Date(Date.now() + currentRealTime * 1000);
    const ratio = originalSeconds > 0 ? (savedSecs / originalSeconds) * 100 : 0;

    setReport(
      `• Tổng thời gian thực tế ngoài đời thực: ${formatDuration(currentRealTime)}\n` +
      `• Quỹ thời gian thi công rút ngắn: ${formatDuration(savedSecs)}\n` +
      `• Tỷ lệ rút gọn tối ưu hóa: Tăng tốc ${ratio.toFixed(1)}%\n` +
      `• Dự kiến hoàn thành nâng cấp: ${completionDate.toLocaleTimeString()} - ${completionDate.toLocaleDateString('vi-VN')}`
    );

    setChartData(trajectory);
  }, [days, hours, minutes, buffQueue]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: CONTROLLER FORM */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-indigo-400 border-b pb-3 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Sliders className="w-5 h-5 text-indigo-500" /> Thời gian Nâng Cấp Gốc
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-401 uppercase tracking-wider block mb-1">Ngày</span>
              <input
                type="number"
                min={0}
                value={days}
                onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-401 uppercase tracking-wider block mb-1">Giờ</span>
              <input
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-401 uppercase tracking-wider block mb-1">Phút</span>
              <input
                type="number"
                min={0}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-indigo-400 border-b pb-3 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Plus className="w-5 h-5 text-indigo-500" /> Cấu Hình Thuốc Potion
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-401 uppercase tracking-wider block mb-1">Tên loại thuốc Buff</span>
              <input
                type="text"
                value={potName}
                onChange={(e) => setPotName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2 rounded-xl font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-401 uppercase tracking-wider block mb-1">Hệ số nhân (x)</span>
                <input
                  type="number"
                  min={1}
                  value={potMult}
                  onChange={(e) => setPotMult(Math.max(1, parseInt(e.target.value) || 12))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold text-indigo-500"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-401 uppercase tracking-wider block mb-1">Thời lượng (Giờ)</span>
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={potDur}
                  onChange={(e) => setPotDur(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold text-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddBuff}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Thêm Vào Hàng Đợi Buffs
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5 mb-2.5 select-none">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-401 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-500" /> Trạng thái hàng đợi
            </span>
            <button
              onClick={handleClearBuffs}
              className="text-[10px] text-rose-500 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Trash2 className="w-3" /> Xóa sạch
            </button>
          </div>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar border dark:border-slate-700 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/10">
            {buffQueue.length === 0 ? (
              <span className="text-slate-401 italic text-center block text-[10px] py-4">Hàng đợi trống...</span>
            ) : (
              buffQueue.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border text-xs font-semibold shadow-xs">
                  <span>{item.name} (x{item.multiplier} trong {item.duration}h)</span>
                  <button onClick={() => handleDeleteBuff(idx)} className="text-rose-500 font-black hover:text-rose-700 select-none text-base leading-none cursor-pointer">&times;</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RECHARTS TRAJECTORY GRAPH */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm flex flex-col justify-between min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 select-none">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-501 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-indigo-500" /> Tốc độ thăng cấp rút gọn (Burn-down chart)
          </span>
          <span className="text-[9px] font-mono text-slate-401 font-bold">Quy chuẩn Clash of Clans</span>
        </div>

        <div className="flex-1 min-h-[300px] relative w-full flex items-center justify-center bg-slate-50/10 rounded-xl p-2 border dark:border-slate-700">
          {chartData.length === 0 ? (
            <span className="text-xs text-slate-401 italic">Thiết lập thời lượng để hiển thị sơ đồ đường...</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -10, right: 10, top: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="x" label={{ value: 'Giờ thực tế', position: 'insideBottomRight', offset: -10, style: { fontSize: '9px', fill: '#64748b' } }} fontSize={9} />
                <YAxis label={{ value: 'Giờ thăng cấp còn lại', angle: -90, position: 'insideLeft', style: { fontSize: '9px', fill: '#64748b' } }} fontSize={9} />
                <Tooltip
                  formatter={(value) => [`${value} giờ`, 'Khối lượng còn lại']}
                  labelFormatter={(label) => `Giờ ngoài đời: ${label}h`}
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#1f2937',
                    borderRadius: '12px',
                    color: '#f9fafb',
                    fontSize: '11px'
                  }}
                />
                <Line type="linear" dataKey="y" stroke="#6366f1" strokeWidth={2.5} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-4 bg-slate-50/50 dark:bg-slate-905 border border-slate-200 dark:border-slate-755 rounded-xl p-4 font-mono text-xs text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-line shadow-inner">
          <span className="font-bold block mb-1 text-slate-700 dark:text-slate-300 uppercase tracking-widest text-[10px]"><Sparkles className="w-3.5 h-3.5 inline mr-1 text-indigo-400" /> Tổng hợp mô phỏng:</span>
          {report}
        </div>
      </div>
    </div>
  );
}
