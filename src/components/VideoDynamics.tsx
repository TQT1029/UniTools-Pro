import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Play, TrendingDown, Clipboard, Check, Sliders, Calendar } from 'lucide-react';

export default function VideoDynamics() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(10);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [speed, setSpeed] = useState(2.0);
  const [chartStyle, setChartStyle] = useState<'line' | 'bar'>('line');
  const [report, setReport] = useState('');

  const formatTime = (secs: number) => {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return d > 0
      ? `${d} ngày ${h} giờ ${m} phút ${s} giây`
      : `${h} giờ ${m} phút ${s} giây`;
  };

  useEffect(() => {
    const totalOriginalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
    if (totalOriginalSeconds <= 0 || speed <= 0) {
      setReport('Vui lòng nhập thời lượng video thực biểu chuẩn và tốc độ hợp lệ.');
      return;
    }

    const actualSeconds = totalOriginalSeconds / speed;
    const timeSavedSeconds = Math.max(0, totalOriginalSeconds - actualSeconds);
    const completionDate = new Date(Date.now() + actualSeconds * 1000);

    setReport(
      `• Tổng thời lượng ban đầu: ${formatTime(totalOriginalSeconds)}\n` +
      `• Tốc phát tăng tốc mong muốn: x${speed.toFixed(2)}\n` +
      `• Thời gian xem thực tế: ${formatTime(actualSeconds)}\n` +
      `• Quỹ thời gian quý giá tiết kiệm được: ${formatTime(timeSavedSeconds)}\n` +
      `• Dự kiến hoàn thành khóa học/video vào: ${completionDate.toLocaleTimeString()} ngày ${completionDate.toLocaleDateString('vi-VN')}`
    );
  }, [days, hours, minutes, seconds, speed]);

  const compiledChartData = React.useMemo(() => {
    const totalOriginalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;
    if (totalOriginalSeconds <= 0) return [];

    const presets = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0];
    if (!presets.includes(speed)) {
      presets.push(speed);
      presets.sort((a, b) => a - b);
    }

    return presets.map(sp => ({
      name: `x${sp}`,
      'Thời lượng thực xem (Giờ)': Number((totalOriginalSeconds / sp / 3600).toFixed(2))
    }));
  }, [days, hours, minutes, seconds, speed]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: CONTROL INPUTS */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full justify-between">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm">
          <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 border-b pb-3 mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" /> Cấu Hình Thời Lượng & Tốc Phát
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày</span>
                <input
                  type="number"
                  min={0}
                  value={days}
                  onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giờ</span>
                <input
                  type="number"
                  min={0}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phút</span>
                <input
                  type="number"
                  min={0}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Giây</span>
                <input
                  type="number"
                  min={0}
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-lg text-center font-bold"
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Play className="w-3.5 h-3.5" /> Thừa Số Tốc Phát (Speed multiplier)
              </span>
              <input
                type="number"
                min={0.1}
                max={16.0}
                step={0.05}
                value={speed}
                onChange={(e) => setSpeed(Math.max(0.1, parseFloat(e.target.value) || 2.0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs md:text-sm px-3 py-2 rounded-xl text-indigo-500 font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* OUTPUT ANALYSIS CARD */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 mb-3 border-b flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" /> Báo cáo Động Học Thời Gian Video
          </h4>
          <div className="bg-indigo-50/30 dark:bg-slate-905 border border-indigo-100 dark:border-slate-705 rounded-xl p-3 font-mono text-[11.5px] text-indigo-900 dark:text-indigo-300 leading-relaxed whitespace-pre-line shadow-inner">
            {report}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RECHARTS BUDGET TIME */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm flex flex-col justify-between min-h-[450px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-indigo-500" /> Biến thiên Giảm Vòng Xem Theo Tốc Độ Phát
          </span>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-slate-400">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="videoChartStyle"
                checked={chartStyle === 'line'}
                onChange={() => setChartStyle('line')}
                className="text-indigo-650"
              />
              Đường Giảm Thời Gian
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="videoChartStyle"
                checked={chartStyle === 'bar'}
                onChange={() => setChartStyle('bar')}
                className="text-indigo-650"
              />
              Cột Trực Quan
            </label>
          </div>
        </div>

        <div className="flex-1 min-h-[350px] relative w-full flex items-center justify-center bg-slate-50/20 rounded-xl p-2 border">
          {compiledChartData.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Thiết lập thời lượng hợp lệ để vẽ quỹ đạo...</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartStyle === 'line' ? (
                <LineChart data={compiledChartData} margin={{ left: -10, right: 10, top: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={9} />
                  <YAxis label={{ value: 'Giờ biến đổi', angle: -90, position: 'insideLeft', style: { fontSize: '9px', fill: '#64748b' } }} fontSize={9} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                  <Line type="linear" dataKey="Thời lượng thực xem (Giờ)" stroke="#6366f1" strokeWidth={3} dot />
                </LineChart>
              ) : (
                <BarChart data={compiledChartData} margin={{ left: -10, right: 10, top: 15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.85}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.35}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={9} />
                  <YAxis label={{ value: 'Giờ biến đổi', angle: -90, position: 'insideLeft', style: { fontSize: '9px', fill: '#64748b' } }} fontSize={9} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="Thời lượng thực xem (Giờ)" fill="url(#colorVideo)" radius={4} />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
