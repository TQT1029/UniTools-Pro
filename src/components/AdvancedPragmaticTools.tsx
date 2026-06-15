import React, { useState, useEffect, useMemo } from 'react';
import { AdvancedToolGroup } from '../types';
import {
  Wrench,
  Search,
  Clipboard,
  Check,
  Terminal,
  Play,
  Share2,
  FolderOpen
} from 'lucide-react';

export default function AdvancedPragmaticTools() {
  const [activeGroupKey, setActiveGroupKey] = useState('programmer');
  const [activeToolKey, setActiveToolKey] = useState('json_formatter');
  const [searchQuery, setSearchQuery] = useState('');
  const [formInputs, setFormInputs] = useState<Record<string, any>>({});
  const [terminalOutput, setTerminalOutput] = useState('Sẵn sàng thực thi công cụ...');
  const [outputChars, setOutputChars] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState('SUCCESS - SYSTEM IDLE');

  const registry: AdvancedToolGroup[] = [
    {
      name: 'Phân Hệ Lập Trình Viên',
      icon: 'programmer',
      tools: {
        json_formatter: {
          name: 'JSON Formatter & Minify Pro',
          inputs: [
            {
              id: 'json-src',
              type: 'textarea',
              placeholder: 'Dán văn bản chuỗi JSON vào đây...',
              value: '{"name":"UniTools","version":"v6.0","release":2026,"developer":{"team":"DeepMind","senior":true}}'
            }
          ],
          actions: [
            {
              name: 'Định dạng (Format 4 spaces)',
              icon: 'align-left',
              run: (inputs) => {
                const src = inputs['json-src'] || '';
                if (!src.trim()) return 'Vui lòng điền nội dung JSON thô.';
                try {
                  const parsed = JSON.parse(src);
                  return JSON.stringify(parsed, null, 4);
                } catch (e: any) {
                  throw new Error(`[Lỗi định dạng JSON] -> ${e.message}`);
                }
              }
            },
            {
              name: 'Nén gọn (Minify)',
              icon: 'minify',
              run: (inputs) => {
                const src = inputs['json-src'] || '';
                if (!src.trim()) return 'Vui lòng điền nội dung JSON thô.';
                try {
                  const parsed = JSON.parse(src);
                  return JSON.stringify(parsed);
                } catch (e: any) {
                  throw new Error(`[Lỗi nén JSON] -> ${e.message}`);
                }
              }
            }
          ]
        },
        base64_codec: {
          name: 'Base64 Encode / Decode Standard',
          inputs: [
            {
              id: 'b64-src',
              type: 'textarea',
              placeholder: 'Nhập chuỗi chữ thuần hoặc mã hóa Base64...',
              value: 'UniTools v6.0 Chuẩn Thương Mại'
            }
          ],
          actions: [
            {
              name: 'Mã hóa (Encode)',
              icon: 'lock',
              run: (inputs) => {
                const src = inputs['b64-src'] || '';
                try {
                  const bytes = new TextEncoder().encode(src);
                  let binary = '';
                  for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                  }
                  return btoa(binary);
                } catch (e: any) {
                  throw new Error(`[Lỗi Encode Base64] -> ${e.message}`);
                }
              }
            },
            {
              name: 'Giải mã (Decode)',
              icon: 'unlock',
              run: (inputs) => {
                const src = inputs['b64-src'] || '';
                try {
                  const binary = atob(src);
                  const bytes = new Uint8Array(binary.length);
                  for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                  }
                  return new TextDecoder().decode(bytes);
                } catch (e: any) {
                  throw new Error(`[Lỗi Decode Base64] -> Vui lòng đảm bảo chuỗi là Base64 hợp lệ. Chi tiết: ${e.message}`);
                }
              }
            }
          ]
        },
        url_codec: {
          name: 'URL Encoder / Decoder Utility',
          inputs: [
            {
              id: 'url-src',
              type: 'textarea',
              placeholder: 'Dẫn liên kết URL hoặc chuỗi query param vào đây...',
              value: 'https://untools.org/search?q=trí tuệ nhân tạo&category=calculus+v3'
            }
          ],
          actions: [
            {
              name: 'Mã hóa URL',
              icon: 'link',
              run: (inputs) => {
                const src = inputs['url-src'] || '';
                return encodeURIComponent(src);
              }
            },
            {
              name: 'Giải mã URL',
              icon: 'unlink',
              run: (inputs) => {
                const src = inputs['url-src'] || '';
                return decodeURIComponent(src);
              }
            }
          ]
        },
        radix_converter: {
          name: 'Cơ Số Toán Học (Bases Convert)',
          inputs: [
            { id: 'rad-val', type: 'text', label: 'Giá Trị Đầu Vào', value: '1024' },
            {
              id: 'rad-from',
              type: 'select',
              label: 'Từ Hệ Cơ Số Nguyện Bản',
              options: {
                '10': 'Thập phân (Decimal 10)',
                '2': 'Nhị phân (Binary 2)',
                '16': 'Thập lục phân (Hexadecimal 16)',
                '8': 'Bát phân (Octal 8)'
              },
              value: '10'
            }
          ],
          actions: [
            {
              name: 'Chuyển Đổi Hệ Cơ Số',
              icon: 'calc',
              run: (inputs) => {
                const val = String(inputs['rad-val'] || '').trim();
                const fromBase = parseInt(inputs['rad-from'] || '10');
                if (!val) return 'Vui lòng cung cấp số đầu vào.';

                const parsed = parseInt(val, fromBase);
                if (isNaN(parsed)) {
                  throw new Error(`Đầu vào '${val}' không đúng định dạng thuộc cơ số ${fromBase}`);
                }

                return (
                  `• Hệ thập phân (Dec 10): ${parsed}\n` +
                  `• Hệ nhị phân (Bin 2): ${parsed.toString(2)}\n` +
                  `• Hệ thập lục phân (Hex 16): ${parsed.toString(16).toUpperCase()}\n` +
                  `• Hệ bát phân (Oct 8): ${parsed.toString(8)}`
                );
              }
            }
          ]
        }
      }
    },
    {
      name: 'Năng Suất & Mã Hóa',
      icon: 'productivity',
      tools: {
        password_gen: {
          name: 'Password Generator Safe',
          inputs: [
            { id: 'pass-len', type: 'number', label: 'Độ dài mật mã (Length)', value: 16 },
            { id: 'pass-upper', type: 'checkbox', label: 'Ký tự in hoa (A-Z)', value: true },
            { id: 'pass-num', type: 'checkbox', label: 'Chữ số (0-9)', value: true },
            { id: 'pass-sym', type: 'checkbox', label: 'Ký tự đặc biệt (!@#)', value: true }
          ],
          actions: [
            {
              name: 'Sinh Mật Mã Ngẫu Nhiên',
              icon: 'key',
              run: (inputs) => {
                const len = parseInt(inputs['pass-len'] || '16');
                let pool = 'abcdefghijklmnopqrstuvwxyz';
                if (inputs['pass-upper']) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if (inputs['pass-num']) pool += '0123456789';
                if (inputs['pass-sym']) pool += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
                
                let res = '';
                for (let i = 0; i < len; i++) {
                  res += pool.charAt(Math.floor(Math.random() * pool.length));
                }
                return res;
              }
            }
          ]
        },
        crypto_hash: {
          name: 'Hash Cryptography SHA-256',
          inputs: [
            { id: 'hash-src', type: 'text', label: 'Chuỗi văn bản thô', value: 'UniTools Enterprise' }
          ],
          actions: [
            {
              name: 'Kích hoạt mã hóa SHA-256',
              icon: 'fingerprint',
              run: async (inputs) => {
                const src = inputs['hash-src'] || '';
                if (!crypto || !crypto.subtle) {
                  throw new Error('Tính năng mã hóa bảo mật SHA-256 chỉ hoạt động trên môi trường an toàn (HTTPS hoặc localhost). Bạn dường như đang dùng HTTP trên địa chỉ IP.');
                }
                const u8 = new TextEncoder().encode(src);
                const buf = await crypto.subtle.digest('SHA-256', u8);
                const hashArray = Array.from(new Uint8Array(buf));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
              }
            }
          ]
        },
        uuid_gen: {
          name: 'UUID v4 ID Generator Unique',
          inputs: [],
          actions: [
            {
              name: 'Generator định danh UUID v4',
              icon: 'id',
              run: () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                  const r = (Math.random() * 16) | 0;
                  const v = c === 'x' ? r : (r & 0x3) | 0x8;
                  return v.toString(16);
                });
              }
            }
          ]
        },
        case_converter: {
          name: 'Text Case Converter Pro',
          inputs: [
            { id: 'case-src', type: 'textarea', placeholder: 'Ký tự văn bản xử lý hoa thường...', value: 'Hello world! Welcome to UniTools Suite.' }
          ],
          actions: [
            {
              name: 'UPPERCASE',
              icon: 'font',
              run: (inputs) => (inputs['case-src'] || '').toUpperCase()
            },
            {
              name: 'lowercase',
              icon: 'font-small',
              run: (inputs) => (inputs['case-src'] || '').toLowerCase()
            },
            {
              name: 'Title Case',
              icon: 'heading',
              run: (inputs) => (inputs['case-src'] || '').replace(
                /\w\S*/g,
                (w: string) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()
              )
            }
          ]
        }
      }
    },
    {
      name: 'Tài Chính & Kế Toán',
      icon: 'finance',
      tools: {
        loan_emi: {
          name: 'EMI Trả Góp Định Kỳ (EMI Loan Calculator)',
          inputs: [
            { id: 'loan-p', type: 'number', label: 'Khoản Vay Gốc (VND)', value: 400000000 },
            { id: 'loan-r', type: 'number', label: 'Lãi Suất Hằng Năm (%)', value: 8.5 },
            { id: 'loan-n', type: 'number', label: 'Kỳ hạn (Số tháng)', value: 120 }
          ],
          actions: [
            {
              name: 'Tính EMI Trả Góp',
              icon: 'calc',
              run: (inputs) => {
                const p = parseFloat(inputs['loan-p']);
                const r = parseFloat(inputs['loan-r']) / 12 / 100;
                const n = parseInt(inputs['loan-n']);

                if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || n <= 0) {
                  return 'Vui lòng cung cấp đầy đủ thông số tài chính thực tế.';
                }

                const compounding = Math.pow(1 + r, n);
                const emi = (p * r * compounding) / (compounding - 1);
                const totalPayment = emi * n;
                const totalInterest = totalPayment - p;

                return (
                  `• Khoản thanh toán trả góp hàng tháng (EMI): ${Math.round(emi).toLocaleString('vi-VN')} VND\n` +
                  `• Tổng nợ vay gốc ban đầu: ${Math.round(p).toLocaleString('vi-VN')} VND\n` +
                  `• Chi phí tiền lãi thuần: ${Math.round(totalInterest).toLocaleString('vi-VN')} VND\n` +
                  `• Tổng nghĩa vụ gốc & lãi thanh toán: ${Math.round(totalPayment).toLocaleString('vi-VN')} VND`
                );
              }
            }
          ]
        },
        vat_tax: {
          name: 'Thuế Suất & VAT Calculator',
          inputs: [
            { id: 'vat-base', type: 'number', label: 'Giá Trị Căn Bản (VND)', value: 50000000 },
            { id: 'vat-rate', type: 'number', label: 'Thuế Suất VAT (%)', value: 10 },
            {
              id: 'vat-mode',
              type: 'select',
              label: 'Phương Pháp Nhập Thuế',
              options: {
                add: 'Thuế cộng thêm (Net + Tax)',
                sub: 'Thuế gộp trong giá trị (Gross - Tax)'
              },
              value: 'add'
            }
          ],
          actions: [
            {
              name: 'Tính Thuế Suất VAT',
              icon: 'percent',
              run: (inputs) => {
                const base = parseFloat(inputs['vat-base']);
                const rate = parseFloat(inputs['vat-rate']);
                const mode = inputs['vat-mode'];

                if (isNaN(base) || isNaN(rate) || base <= 0) {
                  return 'Thông số thuế chưa hợp lý.';
                }

                let tax = 0, total = 0, net = 0;
                if (mode === 'add') {
                  tax = base * (rate / 100);
                  net = base;
                  total = base + tax;
                } else {
                  net = base / (1 + (rate / 105));
                  tax = base - net;
                  total = base;
                }

                return (
                  `• Giá trị thuần chưa thuế (Net): ${Math.round(net).toLocaleString('vi-VN')} VND\n` +
                  `• Giá trị thuế suất VAT: ${Math.round(tax).toLocaleString('vi-VN')} VND\n` +
                  `• Giá trị tổng cộng sau thuế: ${Math.round(total).toLocaleString('vi-VN')} VND`
                );
              }
            }
          ]
        }
      }
    },
    {
      name: 'Y Tế & Khoa Học AI',
      icon: 'health',
      tools: {
        bmi_calc: {
          name: 'Chỉ Só Trọng Lượng Cơ Thể (BMI Calculator)',
          inputs: [
            { id: 'bmi-w', type: 'number', label: 'Cân Nặng Thể Trạng (kg)', value: 65 },
            { id: 'bmi-h', type: 'number', label: 'Chiều Cao Thực Tế (cm)', value: 172 }
          ],
          actions: [
            {
              name: 'Phân Tích Chỉ Số BMI',
              icon: 'bmi',
              run: (inputs) => {
                const w = parseFloat(inputs['bmi-w']);
                const h = parseFloat(inputs['bmi-h']) / 100;

                if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
                  return 'Vui lòng cung cấp chỉ số chiều cao, cân nặng.';
                }

                const index = w / (h * h);
                let desc = '';
                if (index < 18.5) desc = 'Gầy nhẹ (Underweight)';
                else if (index < 24.9) desc = 'Thân hình tuyệt vời lý tưởng (Normal weight)';
                else if (index < 29.9) desc = 'Thừa cân (Overweight)';
                else desc = 'Béo phì cần tập luyện điều độ (Obese)';

                return `• Điểm số BMI của bạn: ${index.toFixed(2)}\n• Đánh giá lâm bạ: ${desc}`;
              }
            }
          ]
        },
        token_counter: {
          name: 'LLM Token & LLM Prompt Pricing',
          inputs: [
            {
              id: 'tok-src',
              type: 'textarea',
              placeholder: 'Dán Prompt hoặc bài viết cần trích định lượng Token tại đây...',
              value: 'Trí tuệ nhân tạo (AI) đang viết lại luật chơi của nền công nghiệp toàn cầu. UniTools là productivity suite tối ưu nhất.'
            }
          ],
          actions: [
            {
              name: 'Định Lượng Prompt & Chi Phí',
              icon: 'calc',
              run: (inputs) => {
                const prompt = inputs['tok-src'] || '';
                const chars = prompt.length;
                const words = prompt.trim() === '' ? 0 : prompt.trim().split(/\s+/).length;

                const tokensEst = Math.round(words * 1.35 + (chars - words * 5) * 0.1);
                const priceGPT = (tokensEst / 1000000) * 10.0;
                const priceClaude = (tokensEst / 1000000) * 8.0;

                return (
                  `• Số từ: ${words} | Số ký tự: ${chars}\n` +
                  `• Định lượng AI Token xấp xỉ: ${tokensEst} Tokens\n` +
                  `• Ước lượng chi phí nạp GPT-4o (Input $15/1M Tokens): $${priceGPT.toFixed(5)}\n` +
                  `• Ước lượng chi phí nạp Claude 3.5 Sonnet: $${priceClaude.toFixed(5)}`
                );
              }
            }
          ]
        }
      }
    }
  ];

  const toolRegistryMap = useMemo(() => {
    const map: Record<string, any> = {};
    registry.forEach(group => {
      Object.entries(group.tools).forEach(([key, t]) => {
        map[key] = t;
      });
    });
    return map;
  }, []);

  const activeTool = useMemo(() => {
    return toolRegistryMap[activeToolKey];
  }, [activeToolKey, toolRegistryMap]);

  useEffect(() => {
    if (activeTool) {
      const inputsInit: Record<string, any> = {};
      activeTool.inputs.forEach((inp: any) => {
        inputsInit[inp.id] = inp.value !== undefined ? inp.value : '';
      });
      setFormInputs(inputsInit);
      setTerminalOutput('Engine sẵn sàng. Hãy điền tham số và kích hoạt...');
      setTerminalStatus('SUCCESS - SYSTEM IDLE');
    }
  }, [activeToolKey]);

  const handleInputChange = (id: string, val: any) => {
    setFormInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleActionRun = async (action: any) => {
    setTerminalStatus('PROCESSING RUNTIME INTERFACE...');
    try {
      let output = action.run(formInputs);
      if (output instanceof Promise) {
        output = await output;
      }
      setTerminalOutput(output);
      setOutputChars(output.length);
      setTerminalStatus('SUCCESS - RESULT GENERATED');
    } catch (err: any) {
      setTerminalOutput(`[Lỗi thực thi mã nguồn công cụ]\n${err.message}`);
      setOutputChars(0);
      setTerminalStatus('ERROR - RUNTIME INTERACTION FAILED');
    }
  };

  const handleCopyClipboardValue = () => {
    navigator.clipboard.writeText(terminalOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredToolRegistry = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return registry;

    return registry.map(group => {
      const filteredTools = Object.entries(group.tools).filter(([key, tool]: [string, any]) =>
        tool.name.toLowerCase().includes(q) || key.toLowerCase().includes(q)
      );
      if (filteredTools.length === 0) return null;
      return {
        ...group,
        tools: Object.fromEntries(filteredTools)
      };
    }).filter(Boolean) as AdvancedToolGroup[];
  }, [searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: TREE LIST OF UTILITIES */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full max-h-[80vh]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm flex flex-col h-full overflow-hidden">
          <h3 className="text-sm font-extrabold text-slate-700 dark:text-indigo-400 border-b pb-3 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <FolderOpen className="w-5 h-5 text-indigo-500" /> Bản đồ Tiện ích Chuyên Dụng
          </h3>
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Gõ tìm kiếm nhanh công cụ..."
              className="w-full bg-slate-50 dark:bg-slate-900 border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-401 absolute left-3 top-2.5" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
            {filteredToolRegistry.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-401 block tracking-widest pl-1">
                  {group.name}
                </span>
                <div className="space-y-1 pl-1">
                  {(Object.entries(group.tools) as [string, any][]).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveToolKey(key);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeToolKey === key ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/40'}`}
                    >
                      <Wrench className={`w-3.5 h-3.5 ${activeToolKey === key ? 'text-white' : 'text-indigo-500'}`} />
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: TERMINAL INTERACTION SCREEN */}
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 flex flex-col justify-between shadow-sm min-h-[350px]">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-indigo-300 border-b pb-2 mb-4 uppercase tracking-wider">
                Cấu hình tham số: {activeTool?.name}
              </h3>

              <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {activeTool?.inputs.map((inp) => {
                  const val = formInputs[inp.id] !== undefined ? formInputs[inp.id] : '';
                  
                  return (
                    <div key={inp.id} className="w-full">
                      {inp.label && inp.type !== 'checkbox' && (
                        <label className="block text-[10px] font-bold text-slate-401 uppercase mb-1.5">{inp.label}</label>
                      )}

                      {inp.type === 'textarea' ? (
                        <textarea
                          value={val}
                          onChange={(e) => handleInputChange(inp.id, e.target.value)}
                          placeholder={inp.placeholder}
                          className="w-full bg-slate-50 dark:bg-slate-900 border text-xs font-mono p-3 rounded-xl resize-none h-[120px] focus:outline-none custom-scrollbar leading-relaxed text-slate-800 dark:text-white"
                        />
                      ) : inp.type === 'select' ? (
                        <select
                          value={val}
                          onChange={(e) => handleInputChange(inp.id, e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2 rounded-xl focus:outline-none text-slate-705 dark:text-white"
                        >
                          {Object.entries(inp.options || {}).map(([k, oVal]) => (
                            <option key={k} value={k}>{oVal}</option>
                          ))}
                        </select>
                      ) : inp.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-xs text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={!!val}
                            onChange={(e) => handleInputChange(inp.id, e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 scale-95"
                          />
                          {inp.label}
                        </label>
                      ) : (
                        <input
                          type={inp.type}
                          value={val}
                          onChange={(e) => handleInputChange(inp.id, inp.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2 rounded-xl focus:outline-none text-slate-800 dark:text-white font-bold"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-700/80 pt-4 mt-6">
              {activeTool?.actions.map((act, index) => (
                <button
                  key={index}
                  onClick={() => handleActionRun(act)}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> {act.name}
                </button>
              ))}
            </div>
          </div>

          {/* UNIX simulated console logs */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm flex flex-col h-full min-h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-401 flex items-center gap-1.5"><Terminal className="w-4 h-4 text-indigo-500" /> Casio UNIX Terminal Pro</span>
              <button
                onClick={handleCopyClipboardValue}
                className="text-[10px] bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                {isCopied ? 'Đã sao chép' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl font-mono text-xs select-text overflow-y-auto custom-scrollbar border shadow-inner">
              <pre className="whitespace-pre-wrap break-all leading-relaxed font-sans">{terminalOutput}</pre>
            </div>
            <div className="mt-3 text-[10px] uppercase font-bold text-slate-401 flex items-center justify-between font-mono select-none">
              <span>status: <span className="text-indigo-500">{terminalStatus}</span></span>
              <span>Ký tự: {outputChars}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
