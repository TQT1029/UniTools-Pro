import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Calendar, Clock, RotateCcw, AlertTriangle, PartyPopper, CalendarDays, Activity } from 'lucide-react';

const SUB_TABS = [
  { id: 'distance_offset', name: 'Mốc Ngày & Tịnh Tiến' },
  { id: 'age_zodiac', name: 'Profile Tuổi & Học Thuyết Cung' },
  { id: 'stats_conversions', name: 'Thống Kê & Quy Đổi Thời Gian' }
];

export default function DateDiagnostics() {
  const [activeTab, setActiveTab] = useLocalStorage('unitools_date_tab', 'distance_offset');

  // Core Variables
  const [startDate, setStartDate] = useLocalStorage('unitools_date_start', '');
  const [endDate, setEndDate] = useLocalStorage('unitools_date_end', '');
  const [baseDate, setBaseDate] = useLocalStorage('unitools_date_base', '');
  const [offsetDays, setOffsetDays] = useLocalStorage('unitools_date_offset', 30);
  const [diffReport, setDiffReport] = useState('Vui lòng chọn hoặc nhập ngày mốc khởi điểm...');
  const [offsetReport, setOffsetReport] = useState('Vui lòng nhập độ lệch hoặc click để tịnh tiến...');

  // Manual fast input helpers
  const [manualStart, setManualStart] = useLocalStorage('unitools_date_mstart', '');
  const [manualEnd, setManualEnd] = useLocalStorage('unitools_date_mend', '');

  // Tab 2 States (Age & Zodiac)
  const [birthDate, setBirthDate] = useLocalStorage('unitools_date_birth', '1998-01-15');
  const [ageProfile, setAgeProfile] = useState<any>(null);
  const [zodiacProfile, setZodiacProfile] = useState<any>(null);

  // Tab 3 States (Conversions & Stats)
  const [convYears, setConvYears] = useState(1);
  const [convDays, setConvDays] = useState(365);
  const [convDirection, setConvDirection] = useState<'y2d' | 'd2y'>('y2d');

  const [statsStart, setStatsStart] = useState('');
  const [statsEnd, setStatsEnd] = useState('');
  const [calendarStats, setCalendarStats] = useState<any>(null);

  // Sync / Auto initialize today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setBaseDate(today);
    setStatsStart(today);
    setStatsEnd(today);
  }, []);

  // Sync and recalculate profile for birthdate
  useEffect(() => {
    if (!birthDate) return;
    const dateObj = new Date(birthDate);
    if (isNaN(dateObj.getTime())) return;

    // 1. Calculate Age details
    const today = new Date();
    let years = today.getFullYear() - dateObj.getFullYear();
    let months = today.getMonth() - dateObj.getMonth();
    let days = today.getDate() - dateObj.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const nextBd = new Date(today.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    if (nextBd < today) {
      nextBd.setFullYear(today.getFullYear() + 1);
    }
    const daysLived = Math.floor((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilBd = Math.ceil((nextBd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setAgeProfile({
      years,
      months,
      days,
      daysLived,
      weeksLived: Math.floor(daysLived / 7),
      monthsLived: Math.floor(daysLived / 30.43),
      yearsLived: Math.floor(daysLived / 365.25),
      daysUntilBirthday: daysUntilBd,
      nextBirthdayDate: nextBd.toLocaleDateString('vi-VN')
    });

    // 2. Zodiac Sign
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    let zodiac = { name: '', symbol: '', range: '' };

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      zodiac = { name: 'Bạch Dương', symbol: '♈ (Aries)', range: '21/03 - 19/04' };
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      zodiac = { name: 'Kim Ngưu', symbol: '♉ (Taurus)', range: '20/04 - 20/05' };
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      zodiac = { name: 'Song Tử', symbol: '♊ (Gemini)', range: '21/05 - 20/06' };
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      zodiac = { name: 'Cự Giải', symbol: '♋ (Cancer)', range: '21/06 - 22/07' };
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      zodiac = { name: 'Sư Tử', symbol: '♌ (Leo)', range: '23/07 - 22/08' };
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      zodiac = { name: 'Xử Nữ', symbol: '♍ (Virgo)', range: '23/08 - 22/09' };
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      zodiac = { name: 'Thiên Bình', symbol: '♎ (Libra)', range: '23/09 - 22/10' };
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      zodiac = { name: 'Bọ Cạp', symbol: '♏ (Scorpio)', range: '23/10 - 21/11' };
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      zodiac = { name: 'Nhân Mã', symbol: '♐ (Sagittarius)', range: '22/11 - 21/12' };
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      zodiac = { name: 'Ma Kết', symbol: '♑ (Capricorn)', range: '22/12 - 19/1' };
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      zodiac = { name: 'Bảo Bình', symbol: '♒ (Aquarius)', range: '20/1 - 18/2' };
    } else {
      zodiac = { name: 'Song Ngư', symbol: '♓ (Pisces)', range: '19/02 - 20/03' };
    }
    setZodiacProfile(zodiac);
  }, [birthDate]);

  // Recalculate working days stats whenever start/end changes
  useEffect(() => {
    if (!statsStart || !statsEnd) return;
    let s = new Date(statsStart);
    let e = new Date(statsEnd);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return;

    let inverted = false;
    if (s > e) {
      const t = s;
      s = e;
      e = t;
      inverted = true;
    }

    let totalDays = 0;
    let workDays = 0;
    let weekendDays = 0;

    const cursor = new Date(s);
    while (cursor <= e) {
      totalDays++;
      const dow = cursor.getDay();
      if (dow === 0 || dow === 6) {
        weekendDays++;
      } else {
        workDays++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    setCalendarStats({
      totalDays,
      workDays,
      weekendDays,
      isInverted: inverted,
      hours: totalDays * 24,
      minutes: totalDays * 24 * 60,
      seconds: totalDays * 24 * 3600
    });
  }, [statsStart, statsEnd]);

  // Handle parsing manual date string (e.g. DD/MM/YYYY or YYYY-MM-DD)
  const parseManualDate = (text: string, setter: (val: string) => void) => {
    if (!text.trim()) return;
    // Check DD/MM/YYYY pattern
    const dmy = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (dmy) {
      const d = parseInt(dmy[1]);
      const m = parseInt(dmy[2]) - 1;
      const y = parseInt(dmy[3]);
      const parsed = new Date(y, m, d);
      if (!isNaN(parsed.getTime())) {
        setter(parsed.toISOString().split('T')[0]);
      }
      return;
    }
    // Check YYYY-MM-DD
    const ymd = text.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
    if (ymd) {
      const parsed = new Date(text);
      if (!isNaN(parsed.getTime())) {
        setter(parsed.toISOString().split('T')[0]);
      }
    }
  };

  // Preset quick functions
  const setQuickPreset = (offset: number, target: 'start' | 'end' | 'base') => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().split('T')[0];
    if (target === 'start') setStartDate(dateStr);
    if (target === 'end') setEndDate(dateStr);
    if (target === 'base') setBaseDate(dateStr);
  };

  const calculateDifference = () => {
    if (!startDate || !endDate) return;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDiffReport(
      `• Thống kê khoảng cách thực địa:\n` +
      `  - Số ngày chênh lệch ròng: ${diffDays} ngày\n` +
      `  - Số tuần tương đương: ${(diffDays / 7).toFixed(2)} tuần\n` +
      `  - Số tháng chuẩn hóa (quy ước 30.43d): ${(diffDays / 30.43).toFixed(2)} tháng\n` +
      `  - Trạng thái biên độ: ${diffDays >= 0 ? 'Thì Tương Lai' : 'Thì Quá Khứ'}`
    );
  };

  const calculateOffset = () => {
    if (!baseDate) return;
    const base = new Date(baseDate);
    base.setDate(base.getDate() + offsetDays);

    setOffsetReport(
      `• Tỉnh tiến thời gian hoàn thành:\n` +
      `  - Điểm mốc ban đầu: ${new Date(baseDate).toLocaleDateString('vi-VN')}\n` +
      `  - Độ tịnh tiến: ${offsetDays >= 0 ? '+' : ''}${offsetDays} ngày\n` +
      `  - Kết quả ngày đích đến: ${base.toLocaleDateString('vi-VN')}`
    );
  };

  // Convert Time factors
  const handleConversion = (val: number, direction: 'y2d' | 'd2y') => {
    if (direction === 'y2d') {
      setConvYears(val);
      setConvDays(Number((val * 365.242).toFixed(2)));
    } else {
      setConvDays(val);
      setConvYears(Number((val / 365.242).toFixed(4)));
    }
  };

  return (
    <div className="space-y-6">
      {/* GLOBAL TAB SWITCHER */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all text-center ${activeTab === tab.id ? 'bg-[#117a8b] text-white shadow' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* CORE DISPLAY PORTALS */}
      {activeTab === 'distance_offset' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Controls column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Diff calculator */}
            <div className="bg-white dark:bg-slate-805 rounded-2xl border border-slate-200 dark:border-slate-705 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 border-b pb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> Tính Toán Khoảng Cách Lịch Trình
              </h3>

              <div className="space-y-4">
                {/* START DATE */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-401 dark:text-slate-400 uppercase">Ngày bắt đầu</span>
                    <input
                      type="text"
                      placeholder="Gõ nháp DD/MM/YYYY..."
                      value={manualStart}
                      onChange={(e) => {
                        setManualStart(e.target.value);
                        parseManualDate(e.target.value, setStartDate);
                      }}
                      className="text-[9px] bg-slate-50 dark:bg-slate-900 border text-slate-500 px-1.5 py-0.5 rounded focus:outline-none w-32"
                    />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm px-3 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => setQuickPreset(0, 'start')} className="bg-slate-100 dark:bg-slate-800 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold">Hôm nay</button>
                    <button onClick={() => setQuickPreset(-1, 'start')} className="bg-slate-100 dark:bg-slate-800 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold">Hôm qua</button>
                    <button onClick={() => setQuickPreset(-30, 'start')} className="bg-slate-100 dark:bg-slate-800 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold">-30 ngày</button>
                  </div>
                </div>

                {/* END DATE */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-401 dark:text-slate-400 uppercase">Ngày kết thúc</span>
                    <input
                      type="text"
                      placeholder="Gõ nháp DD/MM/YYYY..."
                      value={manualEnd}
                      onChange={(e) => {
                        setManualEnd(e.target.value);
                        parseManualDate(e.target.value, setEndDate);
                      }}
                      className="text-[9px] bg-slate-50 dark:bg-slate-900 border text-slate-500 px-1.5 py-0.5 rounded focus:outline-none w-32"
                    />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm px-3 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => setQuickPreset(0, 'end')} className="bg-slate-100 dark:bg-slate-800 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold">Hôm nay</button>
                    <button onClick={() => setQuickPreset(7, 'end')} className="bg-slate-100 dark:bg-slate-800 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold">+7 ngày</button>
                    <button onClick={() => setQuickPreset(30, 'end')} className="bg-slate-100 dark:bg-slate-800 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold">+30 ngày</button>
                  </div>
                </div>

                <button
                  onClick={calculateDifference}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center uppercase tracking-wider shadow-sm"
                >
                  <Calendar className="w-4 h-4" /> Kích Hoạt Tính Khoảng Cách
                </button>
              </div>
            </div>

            {/* Offset tịnh tiến */}
            <div className="bg-white dark:bg-slate-805 rounded-2xl border border-slate-200 dark:border-slate-705 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-orange-600 dark:text-orange-400 border-b pb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-orange-500" /> Tịnh Tiến Trục Thời Gian
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-401 dark:text-slate-400 block uppercase mb-1.5 font-sans">Ngày mốc ban đầu</span>
                  <input
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm px-3 py-2.5 rounded-xl font-bold focus:outline-none"
                  />
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => setQuickPreset(0, 'base')} className="bg-slate-100 dark:bg-slate-800 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 font-bold select-none">Mốc Hôm Nay</button>
                    <button onClick={() => setQuickPreset(90, 'base')} className="bg-slate-100 dark:bg-slate-800 text-[10px] py-1 px-2.5 rounded-lg text-slate-500 font-bold select-none">Mốc +90 ngày</button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-401 dark:text-slate-400 uppercase">Biến thiên lệch ngày (nhập số âm nếu giật lùi)</span>
                    <span className="text-[10.5px] font-mono text-orange-500 font-bold">{offsetDays} ngày</span>
                  </div>
                  <input
                    type="number"
                    value={offsetDays}
                    onChange={(e) => setOffsetDays(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-sm px-3 py-2.5 rounded-xl font-bold focus:outline-none"
                  />
                </div>

                <button
                  onClick={calculateOffset}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center uppercase tracking-wider"
                >
                  <History className="w-4 h-4" /> Tính Mốc Đích Ngày Đến
                </button>
              </div>
            </div>
          </div>

          {/* Report columns */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-805 rounded-2xl border border-slate-205 dark:border-slate-705 p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-300 border-b pb-3 flex items-center gap-2 uppercase tracking-widest">
              <Sliders className="w-4 h-4 text-amber-500" /> Báo cáo Phân Tích Thực Địa Lịch Trình
            </h3>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div className="bg-amber-50/10 dark:bg-slate-950/40 border border-amber-200/50 dark:border-slate-750 rounded-2xl p-4 font-mono text-xs text-amber-900 dark:text-amber-200 whitespace-pre-line leading-relaxed h-[340px] overflow-y-auto custom-scrollbar shadow-inner">
                <span className="font-bold block mb-1 text-[11px] text-amber-600 uppercase tracking-widest border-b pb-1">① Kết quả Khoảng Cách :</span>
                {diffReport}
              </div>
              <div className="bg-orange-50/10 dark:bg-slate-950/40 border border-orange-200/50 dark:border-slate-750 rounded-2xl p-4 font-mono text-xs text-orange-950 dark:text-orange-200 whitespace-pre-line leading-relaxed h-[340px] overflow-y-auto custom-scrollbar shadow-inner">
                <span className="font-bold block mb-1 text-[11px] text-orange-600 uppercase tracking-widest border-b pb-1">② Kết quả tịnh tiến :</span>
                {offsetReport}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'age_zodiac' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Birth date input */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-805 rounded-2xl border border-slate-200 dark:border-slate-705 p-6 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 border-b pb-3 flex items-center gap-1.5 uppercase">
                <CalendarClock className="w-5 h-5" /> Thiết Lập Ngày Sinh
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Chọn chính bản đồ ngày sinh để hệ thống bóc tách học thuyết thời gian, tuổi sinh vật học và phân tích biểu đồ cung sao chiếu mệnh.
              </p>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Ngày Sinh Nhật Của Bạn</span>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-sm px-3 py-2.5 rounded-xl font-bold focus:outline-none focus:ring-1 focus:ring-indigo-505"
                />
              </div>
            </div>

            <div className="bg-indigo-50/20 dark:bg-slate-900 border border-indigo-100 dark:border-slate-750 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed">
              <Sparkles className="w-4 h-4 text-indigo-500 mb-1.5 animate-spin" />
              Công cụ tự động chuyển đổi múi giờ bản địa và quy ước trung bình năm thiên văn học (365.25 ngày).
            </div>
          </div>

          {/* Profile results */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-805 rounded-2xl border border-slate-205 dark:border-slate-705 p-6 shadow-sm flex flex-col justify-between gap-5">
            <h3 className="text-xs font-black text-slate-500 dark:text-slate-300 border-b pb-3 flex items-center gap-2 uppercase tracking-widest">
              <Globe className="w-4 h-4 text-indigo-500 animate-pulse" /> Nhật Ký Tuổi Tác & Cung Hoàng Đạo
            </h3>

            {ageProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Age parameters */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 p-4 rounded-xl space-y-3.5">
                  <span className="font-bold text-[10.5px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block border-b pb-1">Tuổi Sinh Học Hiện Tại</span>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white dark:bg-slate-900 p-2 border rounded-xl shadow-xs">
                      <span className="text-lg font-black text-slate-800 dark:text-white block font-mono">{ageProfile.years}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Năm</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 border rounded-xl shadow-xs">
                      <span className="text-lg font-black text-slate-800 dark:text-white block font-mono">{ageProfile.months}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Tháng</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 border rounded-xl shadow-xs">
                      <span className="text-lg font-black text-slate-800 dark:text-white block font-mono">{ageProfile.days}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Ngày</span>
                    </div>
                  </div>

                  <div className="text-[11.5px] font-mono space-y-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
                    <div>• Bạn đã thọ nhận: <strong className="text-indigo-600 dark:text-indigo-300">{ageProfile.daysLived.toLocaleString()}</strong> ngày sống</div>
                    <div>• Tương đương: <strong>{ageProfile.weeksLived.toLocaleString()}</strong> tuần tuổi</div>
                    <div>• Quy đổi: <strong>{ageProfile.monthsLived.toLocaleString()}</strong> tháng hoặc <strong>{ageProfile.yearsLived.toLocaleString()}</strong> năm</div>
                  </div>
                </div>

                {/* Zodiac signs profile */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-[10.5px] uppercase tracking-wider text-teal-600 dark:text-teal-400 block border-b pb-1 mb-3">Thông Tin Chiêm Tinh Học</span>
                    {zodiacProfile && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold font-mono">
                          <span>Cung Hoàng Đạo:</span>
                          <span className="text-teal-600 dark:text-teal-400 text-sm">{zodiacProfile.name}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold font-mono">
                          <span>Kí hiệu / Symbol:</span>
                          <span className="text-[#117a8b]">{zodiacProfile.symbol}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold font-mono border-b pb-2">
                          <span>Thời gian kì:</span>
                          <span className="text-slate-500 font-semibold">{zodiacProfile.range}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-900 border p-3 rounded-lg text-center mt-3 shadow-xs">
                    <span className="text-[9.5px] font-bold text-slate-400 uppercase block mb-1">Thời gian tới Sinh Nhật tiếp theo</span>
                    <span className="text-sm font-black font-mono text-[#117a8b] dark:text-indigo-300 block">
                      Còn {ageProfile.daysUntilBirthday} ngày ròng
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 block">Dịp: {ageProfile.nextBirthdayDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Chọn ngày sinh để hiển thị phân tích...</span>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stats_conversions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Day Converter Panel */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-705 p-6 shadow-sm flex flex-col gap-5 justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#117a8b] border-b pb-3 flex items-center gap-1.5 uppercase">
                <Clock className="w-5 h-5 text-indigo-500 animate-spin" /> Quy Đổi Các Hệ Tuổi & Năm
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium mt-2">
                Chuyển đổi tức thời các khoảng thời gian năm thiên văn học sang ngày, tuần, tháng, giờ ròng và ngược lại.
              </p>

              <div className="space-y-4 mt-4">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border text-[10px] font-bold">
                  <button
                    onClick={() => setConvDirection('y2d')}
                    className={`flex-1 py-1.5 rounded-md ${convDirection === 'y2d' ? 'bg-white dark:bg-slate-800 shadow text-[#117a8b]' : 'text-slate-400'}`}
                  >
                    Năm ➔ Ngày ròng
                  </button>
                  <button
                    onClick={() => setConvDirection('d2y')}
                    className={`flex-1 py-1.5 rounded-md ${convDirection === 'd2y' ? 'bg-white dark:bg-slate-800 shadow text-[#117a8b]' : 'text-slate-400'}`}
                  >
                    Ngày ròng ➔ Năm
                  </button>
                </div>

                {convDirection === 'y2d' ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-450 uppercase block mb-1">Nhập Số Năm</span>
                      <input
                        type="number"
                        min="0"
                        step="0.05"
                        value={convYears}
                        onChange={(e) => handleConversion(parseFloat(e.target.value) || 0, 'y2d')}
                        className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2 rounded-xl"
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border p-3.5 rounded-xl font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      <div>• Số Ngày ròng: <strong>{convDays.toLocaleString()}</strong> ngày</div>
                      <div>• Số Tuần ròng: <strong>{(convYears * 52.177).toLocaleString()}</strong> tuần</div>
                      <div>• Số Tháng: <strong>{(convYears * 12).toLocaleString()}</strong> tháng</div>
                      <div>• Số Giờ: <strong>{Math.round(convYears * 8766).toLocaleString()}</strong> giờ</div>
                      <div>• Số Giây: <strong>{Math.round(convYears * 31557600).toLocaleString()}</strong> giây</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-450 uppercase block mb-1">Nhập Số Ngày ròng</span>
                      <input
                        type="number"
                        min="0"
                        value={convDays}
                        onChange={(e) => handleConversion(parseFloat(e.target.value) || 0, 'd2y')}
                        className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2 rounded-xl"
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 border p-3.5 rounded-xl font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      <div>• Số Năm ròng: <strong className="text-[#117a8b]">{convYears.toLocaleString()}</strong> năm</div>
                      <div>• Số Tuần ròng: <strong>{(convDays / 7).toFixed(2)}</strong> tuần</div>
                      <div>• Số Tháng: <strong>{(convDays / 30.43).toFixed(2)}</strong> tháng</div>
                      <div>• Số Giờ: <strong>{Math.round(convDays * 24).toLocaleString()}</strong> giờ</div>
                      <div>• Số Giây: <strong>{Math.round(convDays * 86400).toLocaleString()}</strong> giây</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[9.5px] font-mono text-slate-401 text-center block uppercase">Standard Astronomical Standard</span>
          </div>

          {/* Working days and stats */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-805 rounded-2xl border border-slate-205 dark:border-slate-705 p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 border-b pb-3 flex items-center gap-1.5 uppercase">
                <CalendarClock className="w-5 h-5 text-indigo-500 animate-bounce" /> Thống Kê Ngày Làm Việc & Ngày Nghỉ
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Thực hiện phân rã chu kỳ ngày để bóc tách chính xác số ngày làm việc hành chính (thứ 2 đến thứ 6) và số ngày nghỉ thứ 7, chủ nhật ròng rã.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Mốc Bắt Đầu</span>
                  <input
                    type="date"
                    value={statsStart}
                    onChange={(e) => setStatsStart(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Mốc Kết Thúc</span>
                  <input
                    type="date"
                    value={statsEnd}
                    onChange={(e) => setStatsEnd(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {calendarStats ? (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 p-4 rounded-xl mt-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-[10px] uppercase tracking-wider text-[#117a8b] block mb-2 border-b pb-1">
                    Trực Quan Hóa Mốc Ngày Lịch Trình {calendarStats.isInverted ? '(Đã đảo chiều vì Ngày Bắt Đầu > Kết Thúc)' : ''}
                  </span>
                  
                  <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    <div className="bg-[#117a8b]/10 border border-[#117a8b]/30 p-2.5 rounded-lg">
                      <span className="text-xl font-black text-[#117a8b] block font-mono">
                        {calendarStats.totalDays}
                      </span>
                      <span className="text-[9px] font-bold text-slate-410 uppercase">Tổng số ngày</span>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg">
                      <span className="text-xl font-black text-emerald-500 block font-mono">
                        {calendarStats.workDays}
                      </span>
                      <span className="text-[9px] font-bold text-slate-410 uppercase">Ngày đi làm</span>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg">
                      <span className="text-xl font-black text-rose-500 block font-mono">
                        {calendarStats.weekendDays}
                      </span>
                      <span className="text-[9px] font-bold text-slate-410 uppercase">Ngày nghỉ lễ</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border p-3 rounded-lg font-mono text-[11px] leading-relaxed text-slate-500 mt-2">
                  <div className="font-bold text-[10px] text-[#117a8b] border-b pb-0.5 mb-1 flex items-center justify-between">
                    <span>Breakdown tổng thời lượng:</span>
                    <span>Tọa độ trục chuẩn</span>
                  </div>
                  <div>• Tổng số giờ ròng: <strong className="text-slate-700 dark:text-slate-300">{calendarStats.hours.toLocaleString()}</strong> tiếng</div>
                  <div>• Tổng số phút ròng: <strong className="text-slate-700 dark:text-slate-300">{calendarStats.minutes.toLocaleString()}</strong> phút</div>
                  <div>• Tổng số giây ròng: <strong className="text-slate-700 dark:text-slate-300">{calendarStats.seconds.toLocaleString()}</strong> giây</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
