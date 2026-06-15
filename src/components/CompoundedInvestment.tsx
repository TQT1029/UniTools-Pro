import React, { useState, useEffect } from 'react';
import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
Legend,
CartesianGrid,
AreaChart,
Area
} from 'recharts';
import { Sliders, TrendingUp, HandMetal, Check, HelpCircle } from 'lucide-react';
const FINANCIAL_SUB_TABS = [
{ id: 'compound', name: 'Lãi Kép & DCA' },
{ id: 'simple', name: 'Lãi Đơn Định Kỳ' },
{ id: 'pv_fv', name: 'Quy Đổi PV ⇆ FV' },
{ id: 'roi_cagr', name: 'Định Lượng ROI & CAGR' }
];
export default function CompoundedInvestment() {
const [activeSubTab, setActiveSubTab] = useState('compound');
// Tab 1: Compound & DCA States
const [principal, setPrincipal] = useState(50000000);
const [contribution, setContribution] = useState(24000000); // 2tr / thang
const [contribFreq, setContribFreq] = useState<'yearly' | 'monthly'>('yearly');
const [rate, setRate] = useState(8.5);
const [years, setYears] = useState(10);
// Tab 2: Simple Interest States
const [simplePrincipal, setSimplePrincipal] = useState(50000000);
const [simpleRate, setSimpleRate] = useState(7.0);
const [simpleYears, setSimpleYears] = useState(10);
// Tab 3: PV / FV States
const [pvFvDirection, setPvFvDirection] = useState<'pv2fv' | 'fv2pv'>('pv2fv');
const [pvFvValue, setPvFvValue] = useState(100000000);
const [pvFvDiscountRate, setPvFvDiscountRate] = useState(6.0); // Inflation rate or index
const [pvFvYears, setPvFvYears] = useState(10);
// Tab 4: ROI / CAGR States
const [initialValue, setInitialValue] = useState(50000000);
const [finalValue, setFinalValue] = useState(150000000);
const [roiCagrYears, setRoiCagrYears] = useState(5);
// Output variables
const [report, setReport] = useState('');
const [chartData, setChartData] = useState<any[]>([]);
// Calculate results dynamically
useEffect(() => {
const payload: any[] = [];
  let rep = '';
if (activeSubTab === 'compound') {
  const p = principal;
  const c = contribution;
  const r = rate / 100;
  const y = years;

  if (p < 0 || c < 0 || r < 0 || y <= 0) {
    setReport('Nhập các thông số đầu tư định mức lớn hơn hoặc bằng 0.');
    setChartData([]);
    return;
  }

  let accumulatedWealth = p;
  let accumulatedContribution = p;

  // Year 0
  payload.push({
    name: 'Năm 0',
    'Vốn gốc tích lũy (VND)': Math.round(accumulatedContribution),
    'Giá trị thặng dư (VND)': 0,
    'Tổng tài sản (VND)': Math.round(accumulatedWealth)
  });

  // Factor contribution freq
  const yearlyContribution = contribFreq === 'monthly' ? c * 12 : c;

  for (let i = 1; i <= y; i++) {
    // Compound interest calculated at end of year including contribution
    accumulatedWealth = (accumulatedWealth + yearlyContribution) * (1 + r);
    accumulatedContribution += yearlyContribution;

    payload.push({
      name: `Năm ${i}`,
      'Vốn gốc tích lũy (VND)': Math.round(accumulatedContribution),
      'Giá trị thặng dư (VND)': Math.round(Math.max(0, accumulatedWealth - accumulatedContribution)),
      'Tổng tài sản (VND)': Math.round(accumulatedWealth)
    });
  }

  rep = `• Tổng vốn tích lũy gốc tự nộp: ${Math.round(accumulatedContribution).toLocaleString('vi-VN')} VND\n` +
        `• Tổng giá trị tài sản ròng cuối kỳ (Gồm lãi kép): ${Math.round(accumulatedWealth).toLocaleString('vi-VN')} VND\n` +
        `• Lợi nhuận phát sinh lãi kép: ${Math.round(accumulatedWealth - accumulatedContribution).toLocaleString('vi-VN')} VND\n` +
        `• Tỉ lệ thặng dư hiệu suất: ${((accumulatedWealth - accumulatedContribution) / accumulatedContribution * 100).toFixed(1)}%`;

} else if (activeSubTab === 'simple') {
  const p = simplePrincipal;
  const r = simpleRate / 100;
  const y = simpleYears;

  if (p < 0 || r < 0 || y <= 0) {
    setReport('Nhập thông tin vốn gốc và lãi suất chính xác.');
    setChartData([]);
    return;
  }

  // Year 0
  payload.push({
    name: 'Năm 0',
    'Tổng thu lãi đơn (VND)': p,
    'Lãi suất quy ước (VND)': 0,
    'Đối chiếu Lãi Kép (VND)': p
  });

  for (let i = 1; i <= y; i++) {
    const interestSimple = p * r * i;
    const compoundEquivalent = p * Math.pow(1 + r, i);

    payload.push({
      name: `Năm ${i}`,
      'Tổng thu lãi đơn (VND)': Math.round(p),
      'Lãi suất quy ước (VND)': Math.round(interestSimple),
      'Đối chiếu Lãi Kép (VND)': Math.round(compoundEquivalent)
    });
  }

  const endSimple = p + (p * r * y);
  const endCompound = p * Math.pow(1 + r, y);

  rep = `• Tổng vốn ban đầu gửi: ${Math.round(p).toLocaleString('vi-VN')} VND\n` +
        `• Tổng số tiền thu được (Lãi Đơn): ${Math.round(endSimple).toLocaleString('vi-VN')} VND\n` +
        `• Tiền lãi ròng tích lũy đơn: ${Math.round(p * r * y).toLocaleString('vi-VN')} VND\n` +
        `• So sánh chênh lệch: Nếu là Lãi Kép cùng kỳ hạn, bạn sẽ kiếm thêm được ${Math.round(endCompound - endSimple).toLocaleString('vi-VN')} VND !`;

} else if (activeSubTab === 'pv_fv') {
  const v = pvFvValue;
  const r = pvFvDiscountRate / 100;
  const y = pvFvYears;

  if (v < 0 || r < 0 || y <= 0) {
    setReport('Thông số giá trị hoặc lãi suất chiết khấu không hợp lệ.');
    setChartData([]);
    return;
  }

  if (pvFvDirection === 'pv2fv') {
    const targetFV = v * Math.pow(1 + r, y);
    
    payload.push({
      name: 'Năm 0',
      'Giá trị mốc ban đầu (VND)': Math.round(v),
      'Erosion (Trượt giá) (VND)': 0,
      'Giá trị tương lai quy định (VND)': Math.round(v)
    });

    for (let i = 1; i <= y; i++) {
      const currentFV = v * Math.pow(1 + r, i);
      const erodedValue = v / Math.pow(1 + r, i); // purchasing power decay

      payload.push({
        name: `Năm ${i}`,
        'Giá trị mốc ban đầu (VND)': Math.round(v),
        'Erosion (Trượt giá) (VND)': Math.round(erodedValue),
        'Giá trị tương lai quy định (VND)': Math.round(currentFV)
      });
    }

    rep = `• Giá Trị Hiện Tại (PV): ${Math.round(v).toLocaleString('vi-VN')} VND\n` +
          `• Giá Trị Tương Lai (FV) cuối kì (ở mức ${pvFvDiscountRate}% / Năm): ${Math.round(targetFV).toLocaleString('vi-VN')} VND\n` +
          `• Chi phí thặng dư tăng trưởng danh nghĩa: ${Math.round(targetFV - v).toLocaleString('vi-VN')} VND\n` +
          `• Ý nghĩa: 1 đồng hôm nay giá trị bằng ${(targetFV / v).toFixed(2)} đồng trong ${y} năm tới (do có sinh lời từ đầu tư).`;
  } else {
    const targetPV = v / Math.pow(1 + r, y);

    payload.push({
      name: 'Năm 0',
      'Giá trị mốc ban đầu (VND)': Math.round(v),
      'Erosion (Trượt giá) (VND)': Math.round(v),
      'Giá trị tương lai quy định (VND)': Math.round(v)
    });

    for (let i = 1; i <= y; i++) {
      const currentPV = v / Math.pow(1 + r, i);
      payload.push({
        name: `Năm ${i}`,
        'Giá trị mốc ban đầu (VND)': Math.round(v),
        'Erosion (Trượt giá) (VND)': Math.round(currentPV),
        'Giá trị tương lai quy định (VND)': Math.round(v)
      });
    }

    rep = `• Khoản tiền mong muốn cuối kỳ (FV): ${Math.round(v).toLocaleString('vi-VN')} VND\n` +
          `• Số tiền cần gửi vào Hôm Nay (PV): ${Math.round(targetPV).toLocaleString('vi-VN')} VND\n` +
          `• Chi phí cơ hội bị trượt giá nếu không đầu tư: ${Math.round(v - targetPV).toLocaleString('vi-VN')} VND\n` +
          `• Ý nghĩa: Để có được ${Math.round(v).toLocaleString('vi-VN')} VND sau ${y} năm nữa với mức sinh lời quy đổi ${pvFvDiscountRate}%, bạn chỉ cần tích lũy ${Math.round(targetPV).toLocaleString('vi-VN')} VND ở hiện tại!`;
  }

} else if (activeSubTab === 'roi_cagr') {
  const init = initialValue;
  const fin = finalValue;
  const y = roiCagrYears;

  if (init <= 0 || fin < 0 || y <= 0) {
    setReport('Vốn ban đầu tối thiểu lớn hơn 0 và kỳ hạn lớn hơn 0.');
    setChartData([]);
    return;
  }

  const totalROI = ((fin - init) / init) * 100;
  const cagr = (Math.pow(fin / init, 1 / y) - 1);
  const cagrPercent = cagr * 100;

  payload.push({
    name: 'Bắt đầu',
    'Giá trị ước lượng tài sản (VND)': Math.round(init),
    'Trọng số lãi ròng (VND)': 0
  });

  for (let i = 1; i <= y; i++) {
    const stepVal = init * Math.pow(1 + cagr, i);
    payload.push({
      name: `Năm ${i}`,
      'Giá trị ước lượng tài sản (VND)': Math.round(stepVal),
      'Trọng số lãi ròng (VND)': Math.round(Math.max(0, stepVal - init))
    });
  }

  rep = `• Tỉ suất lợi nhuận thu về ròng (ROI): ${totalROI.toFixed(1)}%\n` +
        `• Tốc độ tăng trưởng hàng năm kép (CAGR): ${cagrPercent.toFixed(2)}% / Năm\n` +
        `• Tổng thặng dư tài sản tăng trưởng: ${Math.round(fin - init).toLocaleString('vi-VN')} VND\n` +
        `• Ý nghĩa: Danh mục đầu tư của bạn có mức tăng trưởng bình quân tương đương tích lũy lãi kép ${cagrPercent.toFixed(2)}% đều đặn mỗi năm.`;
}

  setChartData(payload);
}, [
activeSubTab,
principal, contribution, contribFreq, rate, years,
simplePrincipal, simpleRate, simpleYears,
pvFvDirection, pvFvValue, pvFvDiscountRate, pvFvYears,
initialValue, finalValue, roiCagrYears
]);
  
return (
<div className="space-y-6">
{/* SECTOR SWITCHERS */}
<div className="flex bg-slate-155 dark:bg-slate-850 p-1 rounded-2xl border border-slate-150 dark:border-slate-755">
{FINANCIAL_SUB_TABS.map(tab => (
<button
key={tab.id}
onClick={() => setActiveSubTab(tab.id)}
className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${activeSubTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-401 hover:text-slate-905'}`}
>
{tab.name}
</button>
))}
</div><div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
    {/* LEFT COLUMN: DYNAMIC SETTINGS COMPONENT */}
    <div className="lg:col-span-4 flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border-b border-slate-150 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Sliders className="w-5 h-5 text-indigo-500" /> Cấu hình tham số
        </h3>

        {/* CONDITIONAL CONTROLS FORM */}
        {activeSubTab === 'compound' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Số vốn khởi điểm (VND)</span>
              <input
                type="number"
                step={1000000}
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2.5 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-slate-401 uppercase">Gửi định kỳ đóng góp (VND)</span>
                <select
                  value={contribFreq}
                  onChange={(e) => setContribFreq(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded-lg font-bold border-none"
                >
                  <option value="yearly">Mỗi Năm</option>
                  <option value="monthly">Mỗi Tháng</option>
                </select>
              </div>
              <input
                type="number"
                step={1000000}
                value={contribution}
                onChange={(e) => setContribution(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2.5 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Lãi suất (%/Năm)</span>
                <input
                  type="number"
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-xl text-center font-bold text-emerald-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Kỳ hạn (Năm)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={years}
                  onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-xl text-center font-bold text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'simple' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Số vốn gốc ban đầu (VND)</span>
              <input
                type="number"
                step={1000000}
                value={simplePrincipal}
                onChange={(e) => setSimplePrincipal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2.5 rounded-xl font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Lãi suất đơn (%)</span>
                <input
                  type="number"
                  step={0.1}
                  value={simpleRate}
                  onChange={(e) => setSimpleRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-xl text-center font-bold text-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Thời gian gửi (Năm)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={simpleYears}
                  onChange={(e) => setSimpleYears(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-xl text-center font-bold text-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'pv_fv' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Định hướng quy đổi</span>
              <select
                value={pvFvDirection}
                onChange={(e) => setPvFvDirection(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2.5 rounded-xl font-bold focus:outline-none"
              >
                <option value="pv2fv">Quy đổi PV ➔ FV (Tương lai)</option>
                <option value="fv2pv">Quy đổi FV ➔ PV (Hiện tại)</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Số tiền mốc định mức (VND)</span>
              <input
                type="number"
                step={1000000}
                value={pvFvValue}
                onChange={(e) => setPvFvValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2.5 rounded-xl font-bold focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Mức Chiết Khấu / Lạm Phát (%)</span>
                <input
                  type="number"
                  step={0.1}
                  value={pvFvDiscountRate}
                  onChange={(e) => setPvFvDiscountRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-xl text-center font-bold text-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Dải Số Năm chờ</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={pvFvYears}
                  onChange={(e) => setPvFvYears(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs p-2.5 rounded-xl text-center font-bold text-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'roi_cagr' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Vốn đầu tư ban đầu (VND)</span>
              <input
                type="number"
                step={1000000}
                value={initialValue}
                onChange={(e) => setInitialValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2.5 rounded-xl font-bold focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Thanh lý thu về cuối kỳ (VND)</span>
              <input
                type="number"
                step={1000000}
                value={finalValue}
                onChange={(e) => setFinalValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2.5 rounded-xl font-bold focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-401 block uppercase mb-1.5">Chu kỳ giữ tài sản (Năm)</span>
              <input
                type="number"
                min={1}
                max={60}
                value={roiCagrYears}
                onChange={(e) => setRoiCagrYears(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2.5 rounded-xl font-bold text-center focus:outline-none text-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* VERBOSE SUMMARY */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-755 p-5 shadow-sm">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 pb-2 mb-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-1.5 select-none">
          <HandMetal className="w-5 h-5 text-indigo-500" /> Báo cáo Phân Tích
        </h4>
        <div className="bg-slate-50/50 dark:bg-slate-905 border border-slate-150 dark:border-slate-755 rounded-xl p-3.5 font-mono text-[11px] text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-line shadow-inner">
          {report}
        </div>
      </div>
    </div>

    {/* RIGHT COLUMN: CHARTS VIEW */}
    <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-5 shadow-sm flex flex-col justify-between min-h-[460px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 select-none">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-501 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Bản đồ tăng trưởng tài sản tích lũy
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Thống Kê</span>
      </div>

      <div className="flex-1 min-h-[350px] relative w-full flex items-center justify-center bg-slate-50/10 rounded-xl p-2 border border-slate-150 dark:border-slate-700">
        {chartData.length === 0 ? (
          <span className="text-xs text-slate-401 italic">Thiết lập dữ liệu hợp lệ để hiển thị biểu đồ...</span>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeSubTab === 'roi_cagr' ? (
              <AreaChart data={chartData} margin={{ left: -5, right: 10, top: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="roiGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 9 }} stroke="#888888" tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString('vi-VN') + ' VND', 'Tài sản']} contentStyle={{ fontSize: 10, borderRadius: 8, backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="Giá trị ước lượng tài sản (VND)" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#roiGrowthGrad)" />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ left: -5, right: 10, top: 15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorVongoc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.25}/>
                  </linearGradient>
                  <linearGradient id="colorTichluy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.25}/>
                  </linearGradient>
                  <linearGradient id="colorEquivalent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.85}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.25}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 9 }} stroke="#888888" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => Number(value).toLocaleString('vi-VN') + ' VND'} contentStyle={{ fontSize: 10, borderRadius: 8, backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                
                {activeSubTab === 'compound' && (
                  <>
                    <Bar dataKey="Vốn gốc tích lũy (VND)" fill="url(#colorVongoc)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Tổng tài sản (VND)" fill="url(#colorTichluy)" radius={[4, 4, 0, 0]} />
                  </>
                )}

                {activeSubTab === 'simple' && (
                  <>
                    <Bar dataKey="Tổng thu lãi đơn (VND)" fill="url(#colorVongoc)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Lãi suất quy ước (VND)" fill="url(#colorTichluy)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Đối chiếu Lãi Kép (VND)" fill="url(#colorEquivalent)" radius={[4, 4, 0, 0]} />
                  </>
                )}

                {activeSubTab === 'pv_fv' && (
                  <>
                    <Bar dataKey="Giá trị mốc ban đầu (VND)" fill="url(#colorVongoc)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Erosion (Trượt giá) (VND)" fill="url(#colorEquivalent)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Giá trị tương lai quy định (VND)" fill="url(#colorTichluy)" radius={[4, 4, 0, 0]} />
                  </>
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-401 mt-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-700 rounded-xl leading-normal select-none">
        <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
        <div>
          Thuyết Giá Trị Thời Gian Của Tiền (TVM): Tiền tệ ở hiện tại luôn mang giá trị thặng dư cao hơn lượng tiền tương đương trong tương lai do khả năng sinh lời, lạm phát và chi phí cơ hội.
        </div>
      </div>
    </div>
  </div>
</div >
);
}