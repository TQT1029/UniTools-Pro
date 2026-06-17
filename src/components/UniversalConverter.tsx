import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UnitConverterCategory } from '../types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  Scale,
  RefreshCw,
  Search,
  Clipboard,
  Check,
  History,
  Trash2,
  TrendingUp,
  Sliders
} from 'lucide-react';

export default function UniversalConverter() {
  const [category, setCategory] = useState<string>('Độ dài');
  const [searchInp, setSearchInp] = useLocalStorage('unitools_conv_search', '');
  const [fromUnit, setFromUnit] = useLocalStorage('unitools_conv_from', '');
  const [toUnit, setToUnit] = useLocalStorage('unitools_conv_to', '');
  const [valInp, setValInp] = useLocalStorage('unitools_conv_val', 1.0);
  const [resultText, setResultText] = useState('0');
  const [chartStyle, setChartStyle] = useState<'bar' | 'line'>('bar');
  const [history, setHistory] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Grand Conversion registry mapping
  const registry: Record<string, UnitConverterCategory> = {
    // --- GEOMETRY & STANDARD BASIC ---
    'Độ dài': {
      group: 'Hình Học & Đo Lường Cơ Bản',
      type: 'linear',
      units: {
        mm: 0.001,
        cm: 0.01,
        m: 1.0,
        km: 1000.0,
        inch: 0.0254,
        feet: 0.3048,
        Yard: 0.9144,
        'Hải lý': 1852.0
      }
    },
    'Diện tích': {
      group: 'Hình Học & Đo Lường Cơ Bản',
      type: 'linear',
      units: {
        'cm²': 0.0001,
        'm²': 1.0,
        'km²': 1000000.0,
        'Hecta (ha)': 10000.0,
        Acre: 4046.86
      }
    },
    'Thể tích (Mở rộng)': {
      group: 'Hình Học & Đo Lường Cơ Bản',
      type: 'linear',
      units: {
        ml: 0.001,
        'Lít (l)': 1.0,
        'm³': 1000.0,
        'Gallon (US)': 3.78541,
        'Quart (US)': 0.946353
      }
    },
    Góc: {
      group: 'Hình Học & Đo Lường Cơ Bản',
      type: 'linear',
      units: {
        'Độ (°)': 1.0,
        'Radian (rad)': 57.2958,
        'Gradian (grad)': 0.9
      }
    },

    // --- MECHANICS ---
    'Khối lượng': {
      group: 'Cơ Học & Động Lực Học',
      type: 'linear',
      units: {
        mg: 0.001,
        g: 1.0,
        kg: 1000.0,
        Tấn: 1000000.0,
        'Pound (lb)': 453.592,
        'Ounce (oz)': 28.3495
      }
    },
    'Vận tốc': {
      group: 'Cơ Học & Động Lực Học',
      type: 'linear',
      units: {
        'm/s': 1.0,
        'km/h': 0.277778,
        mph: 0.44704,
        Knot: 0.51444,
        Mach: 340.3
      }
    },
    'Gia tốc': {
      group: 'Cơ Học & Động Lực Học',
      type: 'linear',
      units: {
        'm/s²': 1.0,
        'cm/s²': 0.01,
        'g-force (g)': 9.80665,
        'ft/s²': 0.3048
      }
    },
    Lực: {
      group: 'Cơ Học & Động Lực Học',
      type: 'linear',
      units: {
        'Newton (N)': 1.0,
        'Kilonewton (kN)': 1000.0,
        'Kilogram-force (kgf)': 9.80665,
        'Pound-force (lbf)': 4.44822
      }
    },
    'Áp suất': {
      group: 'Cơ Học & Động Lực Học',
      type: 'linear',
      units: {
        Pa: 1.0,
        kPa: 1000.0,
        Bar: 100000.0,
        'Atmosphere (atm)': 101325.0,
        PSI: 6894.76
      }
    },

    // --- PHYSICS & HEAT ---
    'Nhiệt độ': {
      group: 'Nhiệt & Năng Lượng Vật Lý',
      type: 'temperature',
      units: ['Celsius', 'Fahrenheit', 'Kelvin']
    },
    'Năng lượng': {
      group: 'Nhiệt & Năng Lượng Vật Lý',
      type: 'linear',
      units: {
        'Joule (J)': 1.0,
        kJ: 1000.0,
        'Calorie (cal)': 4.184,
        'Kilocalorie (kcal)': 4184.0,
        'Watt-hour (Wh)': 3600.0,
        'Kilowatt-hour (kWh)': 3600000.0
      }
    },
    'Công suất': {
      group: 'Nhiệt & Năng Lượng Vật Lý',
      type: 'linear',
      units: { 'Watt (W)': 1.0, kW: 1000.0, 'Mã lực (HP)': 745.7 }
    },

    // --- ELECTROMAGNETIC WAVES ---
    'Tần số': {
      group: 'Sóng & Điện Từ Học',
      type: 'linear',
      units: { Hz: 1.0, kHz: 1000.0, MHz: 1000000.0, GHz: 1000000000.0 }
    },

    // --- TIME ---
    'Thời gian nâng cao': {
      group: 'Thời Gian Biến Thiên',
      type: 'linear',
      units: {
        'Giây (s)': 1.0,
        'Phút (m)': 60.0,
        'Giờ (h)': 3600.0,
        'Ngày (d)': 86400.0,
        'Tuần (w)': 604800.0,
        'Tháng (Mo)': 2592000.0,
        'Năm (Yr)': 31536000.0
      }
    },

    // --- DIGITAL & TECHNOLOGY ---
    'Dung lượng số': {
      group: 'Công Nghệ & Kỹ Thuật Số',
      type: 'linear',
      units: {
        Byte: 1.0,
        KB: 1024.0,
        MB: 1048576.0,
        GB: 1073741824.0,
        TB: 1099511627776.0,
        PB: 1125899906842624.0
      }
    },
    'Băng thông mạng': {
      group: 'Công Nghệ & Kỹ Thuật Số',
      type: 'linear',
      units: {
        Kbps: 1.0,
        Mbps: 1000.0,
        Gbps: 1000000.0,
        'KB/s': 8.0,
        'MB/s': 8000.0
      }
    },
    'Mật độ PPI (DPI)': {
      group: 'Công Nghệ & Kỹ Thuật Số',
      type: 'linear',
      units: {
        '72 PPI (Web Layout)': 1.0,
        '96 PPI (Windows UI)': 1.33333,
        '150 PPI (Medium Print)': 2.08333,
        '300 PPI (High Print Standard)': 4.16667
      }
    }
  };

  // Grouped Categories computed property
  const groupedCategories = useMemo<Record<string, string[]>>(() => {
    const list: Record<string, string[]> = {};
    Object.entries(registry).forEach(([key, value]) => {
      const g = value.group;
      if (!list[g]) list[g] = [];
      list[g].push(key);
    });
    return list;
  }, []);

  // Filter & list units
  const availableUnits = useMemo(() => {
    const data = registry[category];
    if (!data) return [];
    const list = data.type === 'linear'
      ? Object.keys(data.units)
      : (data.units as string[]);

    if (!searchInp.trim()) return list;
    return list.filter(u => u.toLowerCase().includes(searchInp.toLowerCase().trim()));
  }, [category, searchInp]);

  // Handle Category changes
  useEffect(() => {
    const data = registry[category];
    if (data) {
      const units = data.type === 'linear' ? Object.keys(data.units) : (data.units as string[]);
      setFromUnit(units[0] || '');
      setToUnit(units[1] || units[0] || '');
    }
  }, [category]);

  // Execute actual scientific conversion
  const executeValueConversion = (val: number, from: string, to: string, catKey: string) => {
    const data = registry[catKey];
    if (!data) return 0;
    if (data.type === 'linear') {
      const unitsMap = data.units as Record<string, number>;
      return (val * unitsMap[from]) / unitsMap[to];
    } else {
      // Temperature scales converter
      let cVal = val;
      if (from === 'Fahrenheit') cVal = ((val - 32) * 5) / 9;
      else if (from === 'Kelvin') cVal = val - 273.15;

      if (to === 'Celsius') return cVal;
      if (to === 'Fahrenheit') return (cVal * 9) / 5 + 32;
      if (to === 'Kelvin') return cVal + 273.15;
    }
    return val;
  };

  // Run computation loop
  useEffect(() => {
    if (!fromUnit || !toUnit || isNaN(valInp)) {
      setResultText('-');
      return;
    }
    const computed = executeValueConversion(valInp, fromUnit, toUnit, category);
    const textResult = `${valInp.toLocaleString()} ${fromUnit} = ${computed.toLocaleString(undefined, { maximumFractionDigits: 5 })} ${toUnit}`;
    setResultText(textResult);

    // Save in session history safely
    if (history[0] !== textResult) {
      setHistory(prev => [textResult, ...prev.slice(0, 5)]);
    }
  }, [valInp, fromUnit, toUnit, category]);

  const swapValueUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(resultText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Compile Recharts graphical data scales
  const compiledRechartsData = useMemo(() => {
    const data = registry[category];
    if (!data || !fromUnit || isNaN(valInp)) return [];

    if (data.type === 'linear') {
      const displayUnits = Object.keys(data.units).slice(0, 8);
      return displayUnits.map(unit => ({
        name: unit,
        value: Number(executeValueConversion(valInp, fromUnit, unit, category).toFixed(4))
      }));
    } else {
      // temperature variance scale chart
      const deltas = [-30, -15, 0, 15, 30];
      return deltas.map(delta => {
        const inputVal = valInp + delta;
        return {
          name: `${inputVal} ${fromUnit}`,
          value: Number(executeValueConversion(inputVal, fromUnit, toUnit, category).toFixed(2))
        };
      });
    }
  }, [category, fromUnit, toUnit, valInp]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: CONVERTER CONTROLLER PANEL */}
      <div className="lg:col-span-5 flex flex-col gap-6 h-full justify-between">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm flex flex-col h-full">
          <h3 className="text-base font-bold text-[#117a8b] dark:text-cyan-400 border-b pb-3 mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#117a8b]" /> Cấu Hình Đại Lượng & Đơn Vị
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Nhóm biến thể đại lượng</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
              >
                {(Object.entries(groupedCategories) as [string, string[]][]).map(([group, keys]) => (
                  <optgroup key={group} label={`── ${group.toUpperCase()} ──`}>
                    {keys.map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Tìm kiếm nhanh loại hình đơn vị</span>
              <div className="relative">
                <input
                  type="text"
                  value={searchInp}
                  onChange={(e) => setSearchInp(e.target.value)}
                  placeholder="Nhập kí hiệu (m, km, acre, ppi...)"
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Từ đơn vị (From)</span>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  {availableUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={swapValueUnits}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-705 p-2 rounded-xl text-slate-500 transition-colors border border-slate-200 dark:border-slate-700"
                title="Đảo vị trí quy đổi"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Đến đơn vị (To)</span>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  {availableUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Giá trị đầu vào (Input value)</span>
              <input
                type="number"
                value={valInp}
                onChange={(e) => setValInp(parseFloat(e.target.value) || 0)}
                step="any"
                className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* RESULTS CARD */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1">
              <Scale className="w-4 h-4" /> Kết Quả Phân Tích Quy Đổi
            </h4>
            <button
              onClick={handleCopyClipboard}
              className="text-[10px] bg-slate-50 hover:bg-slate-100 dark:bg-slate-705 text-slate-500 font-bold border rounded-lg px-2.5 py-1 flex items-center gap-1 transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
              {isCopied ? 'Đã copy' : 'Sao chép'}
            </button>
          </div>
          <div className="bg-cyan-500/5 dark:bg-slate-905 border border-dashed border-cyan-500/25 rounded-2xl p-4 min-h-[70px] flex items-center justify-center">
            <span className="text-sm font-black text-cyan-700 dark:text-cyan-400 text-center break-all">{resultText}</span>
          </div>
        </div>

        {/* HISTORY CACHE BOARD */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2.5 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><History className="w-4 h-4 text-[#117a8b]" /> Nhật ký gần đây</span>
            <button
              onClick={() => setHistory([])}
              className="text-[10px] text-rose-500 font-bold hover:underline flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" /> Xóa nhật ký
            </button>
          </div>
          <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar text-xs font-mono font-bold text-slate-500">
            {history.length === 0 ? (
              <span className="text-slate-400 italic block text-center py-4">Chưa có lịch sử tính toán nào...</span>
            ) : (
              history.map((h, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-755 border rounded-lg p-2 truncate">{h}</div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RECHARTS TRAJECTORY GRAPH */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm flex flex-col justify-between min-h-[450px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-[#117a8b]" /> Đồ thị dải chuyển đổi so sánh (Scales Comparer)
          </span>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-400">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="converterChartStyle"
                checked={chartStyle === 'bar'}
                onChange={() => setChartStyle('bar')}
                className="text-cyan-600 border-slate-300"
              />
              Cột Biên Độ
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="converterChartStyle"
                checked={chartStyle === 'line'}
                onChange={() => setChartStyle('line')}
                className="text-cyan-600 border-slate-300"
              />
              Đường Tuyến Tính
            </label>
          </div>
        </div>

        <div className="flex-1 min-h-[350px] relative w-full flex items-center justify-center bg-slate-50/20 rounded-xl p-2 border">
          {compiledRechartsData.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Thiết lập tham số để xem dải trực quan biểu đồ...</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartStyle === 'bar' ? (
                <BarChart data={compiledRechartsData} margin={{ left: -10, right: 10, top: 15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorConverter" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#117a8b" stopOpacity={0.85}/>
                      <stop offset="95%" stopColor="#117a8b" stopOpacity={0.35}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={9} />
                  <YAxis fontSize={9} />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Chỉ số chuyển đổi']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="value" fill="url(#colorConverter)" radius={4} />
                </BarChart>
              ) : (
                <LineChart data={compiledRechartsData} margin={{ left: -10, right: 10, top: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={9} />
                  <YAxis fontSize={9} />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Chỉ số chuyển đổi']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                  <Line type="linear" dataKey="value" stroke="#117a8b" strokeWidth={3} dot />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
