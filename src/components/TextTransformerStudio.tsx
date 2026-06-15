import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TransformationRule, TextTransformationType, RuleDefinition } from '../types';
import {
  Wand2,
  Trash2,
  FileUp,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Plus,
  Play,
  Copy,
  Check,
  Download,
  Settings,
  Layers,
  Activity,
  Save
} from 'lucide-react';

export default function TextTransformerStudio() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [rules, setRules] = useState<TransformationRule[]>([
    { id: 'rule_1', enabled: true, type: 'normalize_spaces', value1: '', value2: '' },
    { id: 'rule_2', enabled: true, type: 'extract_emails', value1: '', value2: '' }
  ]);
  const [preset, setPreset] = useState('');
  const [customPresets, setCustomPresets] = useState<{id: string, name: string, rules: TransformationRule[]}[]>(() => {
    try {
      const saved = localStorage.getItem('unitools_custom_text_filters');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [searchFilter, setSearchFilter] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  const [latency, setLatency] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Statistics counters
  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    lines: 0,
    extracts: 0
  });

  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ruleRegistry: Record<TextTransformationType, RuleDefinition> = {
    remove_exact: { name: 'Xóa từ / chuỗi chính xác', category: 'remove', placeholder: 'Ví dụ: gmail.com' },
    remove_multiple: { name: 'Xóa hàng loạt (mỗi dòng 1 từ)', category: 'remove', placeholder: 'com\nnet\norg' },
    remove_chars: { name: 'Xóa tập ký tự đặc biệt', category: 'remove', placeholder: 'Ví dụ: @#$%&*' },
    remove_pattern_range: { name: 'Xóa dải mẫu tuần tự (Range)', category: 'remove', placeholder: 'Mẫu: item_1..10' },
    remove_domain_ext: { name: 'Xóa tên miền mở rộng (TLD)', category: 'remove', flag: true },
    remove_line_match: { name: 'Xóa cả dòng chứa từ khóa', category: 'remove', placeholder: 'Từ khóa...' },
    remove_paragraph_match: { name: 'Xóa cả đoạn chứa từ khóa', category: 'remove', placeholder: 'Từ khóa...' },
    remove_regex: { name: 'Xóa bằng Regex biểu thức', category: 'remove', placeholder: 'Ví dụ: \\d+' },
    
    replace_find_target: {
      name: 'Thay thế chuỗi đơn lẻ',
      category: 'replace',
      dualInput: true,
      placeholder1: 'Chuỗi cũ...',
      placeholder2: 'Chuỗi mới...'
    },
    replace_batch: {
      name: 'Thay thế hàng loạt (Cặp A->B)',
      category: 'replace',
      placeholder: 'Mẫu: xau_cu->xau_moi (mỗi dòng 1 cặp)'
    },
    replace_regex: {
      name: 'Thay thế bằng Regex Capture Groups',
      category: 'replace',
      dualInput: true,
      placeholder1: 'Pattern (VD: (\\d+))',
      placeholder2: 'Replacement (VD: ID:$1)'
    },
    
    split_fullname: { name: 'Tách cấu trúc Họ và Tên', category: 'split', flag: true },
    split_email: { name: 'Tách Email (User | Domain)', category: 'split', flag: true },
    split_url: { name: 'Tách cấu trúc liên kết URL', category: 'split', flag: true },
    split_custom: { name: 'Tách chuỗi bằng ký tự phân tách', category: 'split', placeholder: 'Ví dụ: | hoặc ::' },
    
    extract_emails: { name: 'Trích xuất danh sách Emails', category: 'extract', flag: true },
    extract_phones: { name: 'Trích xuất danh sách Số Điện Thoại', category: 'extract', flag: true },
    extract_urls: { name: 'Trích xuất danh sách liên kết URLs', category: 'extract', flag: true },
    extract_hashtags_mentions: { name: 'Trích xuất Hashtags & Mentions', category: 'extract', flag: true },
    
    normalize_spaces: { name: 'Chuẩn hóa khoảng trắng & Dòng trống', category: 'normalize', flag: true },
    normalize_vietnamese: { name: 'Khử dấu Tiếng Việt chuẩn hóa', category: 'normalize', flag: true },
    
    case_upper: { name: 'Chuyển sang CHỮ IN HOA', category: 'case', flag: true },
    case_lower: { name: 'Chuyển sang chữ in thường', category: 'case', flag: true },
    case_camel: { name: 'Chuyển đổi sang camelCase', category: 'case', flag: true },
    case_snake: { name: 'Chuyển đổi sang snake_case', category: 'case', flag: true },
    case_kebab: { name: 'Chuyển đổi sang kebab-case', category: 'case', flag: true }
  };

  // Pipeline Worker logic
  useEffect(() => {
    const workerCode = function () {
      function normalizeViLetters(str: string) {
        return str
          .normalize('NFC')
          .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
          .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
          .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
          .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
          .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
          .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
          .replace(/đ/g, 'd');
      }

      self.onmessage = function (e) {
        const { text, rulesStack } = e.data;
        const start = performance.now();

        let currentText = text || '';
        let extractedResults: string[] = [];
        let isStructural = false;

        rulesStack.forEach((rule: any) => {
          if (!rule.enabled) return;
          const p1 = rule.value1 || '';
          const p2 = rule.value2 || '';

          switch (rule.type) {
            case 'remove_exact':
              if (p1) currentText = currentText.split(p1).join('');
              break;
            case 'remove_multiple':
              if (p1) {
                p1.split('\n').forEach((v: string) => {
                  const cleaned = v.trim();
                  if (cleaned) currentText = currentText.split(cleaned).join('');
                });
              }
              break;
            case 'remove_chars':
              if (p1) {
                const esc = p1.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                currentText = currentText.replace(new RegExp('[' + esc + ']', 'g'), '');
              }
              break;
            case 'remove_pattern_range':
              if (p1.includes('..')) {
                const match = p1.match(/(.*?)(\d+)\.\.(\d+)(.*)/);
                if (match) {
                  const prefix = match[1], startR = parseInt(match[2]), endR = parseInt(match[3]), suffix = match[4];
                  for (let i = startR; i <= endR; i++) {
                    currentText = currentText.split(`${prefix}${i}${suffix}`).join('');
                  }
                }
              }
              break;
            case 'remove_domain_ext':
              currentText = currentText.replace(/\.(com|net|org|vn|edu|gov|io|info|me)\b/gi, '');
              break;
            case 'remove_line_match':
              if (p1) {
                currentText = currentText
                  .split('\n')
                  .filter((line: string) => !line.includes(p1))
                  .join('\n');
              }
              break;
            case 'remove_paragraph_match':
              if (p1) {
                currentText = currentText
                  .split(/\n\s*\n+/)
                  .filter((p: string) => !p.includes(p1))
                  .join('\n\n');
              }
              break;
            case 'remove_regex':
              if (p1) {
                try { currentText = currentText.replace(new RegExp(p1, 'g'), ''); } catch (err) {}
              }
              break;
            case 'replace_find_target':
              if (p1) currentText = currentText.split(p1).join(p2);
              break;
            case 'replace_batch':
              if (p1) {
                p1.split('\n').forEach((line: string) => {
                  const parts = line.split('->');
                  if (parts.length === 2) {
                    currentText = currentText.split(parts[0].trim()).join(parts[1].trim());
                  }
                });
              }
              break;
            case 'replace_regex':
              if (p1) {
                try { currentText = currentText.replace(new RegExp(p1, 'g'), p2); } catch (err) {}
              }
              break;
            case 'normalize_spaces':
              currentText = currentText
                .replace(/[ \t]+/g, ' ')
                .split('\n')
                .map((l: string) => l.trim())
                .join('\n')
                .replace(/\n{3,}/g, '\n\n');
              break;
            case 'normalize_vietnamese':
              currentText = normalizeViLetters(currentText);
              break;
            case 'case_upper':
              currentText = currentText.toUpperCase();
              break;
            case 'case_lower':
              currentText = currentText.toLowerCase();
              break;
            case 'case_snake':
              currentText = currentText.toLowerCase().replace(/[\s-]+/g, '_');
              break;
            case 'case_kebab':
              currentText = currentText.toLowerCase().replace(/[\s_]+/g, '-');
              break;
            case 'case_camel':
              currentText = currentText
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m: any, chr: string) => chr.toUpperCase());
              break;
            case 'extract_emails':
              const emails = currentText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
              extractedResults.push(...emails);
              isStructural = true;
              break;
            case 'extract_phones':
              const phones = currentText.match(/(?:\+84|0)[1-9]\d{8}\b/g) || [];
              extractedResults.push(...phones);
              isStructural = true;
              break;
            case 'extract_urls':
              const urls = currentText.match(/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g) || [];
              extractedResults.push(...urls);
              isStructural = true;
              break;
            case 'extract_hashtags_mentions':
              const tags = currentText.match(/[#@][\p{L}\p{N}_]+/gu) || [];
              extractedResults.push(...tags);
              isStructural = true;
              break;
            case 'split_fullname':
              isStructural = true;
              currentText.split('\n').forEach((line: string) => {
                const tk = line.trim();
                if (tk) {
                  const p = tk.split(/\s+/);
                  extractedResults.push(`Tên gốc: ${tk} | Họ: ${p[0]} | Đệm: ${p.slice(1, -1).join(' ') || '--'} | Tên: ${p[p.length - 1] || ''}`);
                }
              });
              break;
            case 'split_email':
              isStructural = true;
              currentText.split('\n').forEach((line: string) => {
                const em = line.trim();
                if (em.includes('@')) {
                  const p = em.split('@');
                  extractedResults.push(`Email: ${em} | Username: ${p[0]} | Domain: ${p[1]}`);
                }
              });
              break;
            case 'split_custom':
              if (p1) {
                isStructural = true;
                currentText.split('\n').forEach((line: string) => {
                  if (line.includes(p1)) {
                    extractedResults.push(`Dòng gốc: ${line} | Các phần: [ ${line.split(p1).join(' | ')} ]`);
                  }
                });
              }
              break;
          }
        });

        const finalOutput = isStructural ? extractedResults.join('\n') : currentText;
        const latencyVal = Number((performance.now() - start).toFixed(1));

        // Stats calculation
        const chars = finalOutput.length;
        const words = (finalOutput.match(/[\p{L}\p{N}]+/gu) || []).length;
        const linesCount = finalOutput ? finalOutput.split('\n').length : 0;

        self.postMessage({
          outputText: finalOutput,
          latency: latencyVal,
          stats: {
            chars,
            words,
            lines: linesCount,
            extracts: extractedResults.length
          }
        });
      };
    };

    const blob = new Blob([`(${workerCode.toString()})()`].concat(), { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    worker.onmessage = (e) => {
      setOutputText(e.data.outputText);
      setLatency(e.data.latency);
      setStats(e.data.stats);
    };

    return () => worker.terminate();
  }, []);

  // Post messages to compute output whenever inputs, rules changes
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        text: inputText,
        rulesStack: rules
      });
    }
  }, [inputText, rules]);

  const loadDemoSet = () => {
    setInputText(`Nguyen Van Binh <nguyen.binh@gmail.com>
Tran Thi Hoa <hoa.tqt@yahoo.com>
Phan Minh Hoang <hoang_pm@edu.com.vn>

Hãy làm sạch và trích xuất dữ liệu thô này! Thông tin sản phẩm: https://untools.org/products/v3-cleaner.
Vui lòng liên hệ @developer_support hoặc đăng tại thẻ #UniTools_Suite, cảm ơn.`);
  };

  useEffect(() => {
    localStorage.setItem('unitools_custom_text_filters', JSON.stringify(customPresets));
  }, [customPresets]);

  const saveCurrentRulesAsPreset = () => {
    const name = window.prompt("Nhập tên bộ lọc cấu hình của bạn:");
    if (!name || name.trim() === '') return;
    const newPreset = {
      id: 'custom_' + Date.now(),
      name: name.trim(),
      rules: JSON.parse(JSON.stringify(rules)) // Deep copy
    };
    setCustomPresets(prev => [...prev, newPreset]);
    setPreset(newPreset.id);
  };

  const deleteCustomPreset = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa bộ lọc này?")) {
      setCustomPresets(prev => prev.filter(p => p.id !== id));
      if (preset === id) {
        setPreset('');
        setRules([]);
      }
    }
  };

  const handleQuickPresetSelection = (val: string) => {
    setPreset(val);
    if (!val) return;
    let newRules: TransformationRule[] = [];

    if (val === 'clean_data') {
      newRules = [
        { id: 'pres_1', enabled: true, type: 'normalize_spaces', value1: '', value2: '' },
        { id: 'pres_2', enabled: true, type: 'remove_chars', value1: '@#$%', value2: '' }
      ];
    } else if (val === 'extract_seo') {
      newRules = [
        { id: 'pres_1', enabled: true, type: 'extract_urls', value1: '', value2: '' },
        { id: 'pres_2', enabled: true, type: 'extract_hashtags_mentions', value1: '', value2: '' }
      ];
    } else if (val === 'dev_case') {
      newRules = [
        { id: 'pres_1', enabled: true, type: 'case_snake', value1: '', value2: '' }
      ];
    } else if (val === 'split_identity') {
      newRules = [
        { id: 'pres_1', enabled: true, type: 'split_email', value1: '', value2: '' }
      ];
    } else if (val.startsWith('custom_')) {
      const target = customPresets.find(p => p.id === val);
      if (target) {
        newRules = JSON.parse(JSON.stringify(target.rules));
      }
    }
    setRules(newRules);
  };

  const addEmptyRule = () => {
    const newRule: TransformationRule = {
      id: 'rule_' + Date.now() + Math.random().toString(36).substr(2, 4),
      enabled: true,
      type: 'remove_exact',
      value1: '',
      value2: ''
    };
    setRules(prev => [...prev, newRule]);
  };

  const deleteRuleToken = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const moveRuleOrder = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;

    const copy = [...rules];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;
    setRules(copy);
  };

  const handleRuleTypeChange = (id: string, type: TextTransformationType) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, type, value1: '', value2: '' } : r));
  };

  const handleRuleValueChange = (id: string, field: 'value1' | 'value2', val: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const toggleRuleEnabled = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const triggerExportFile = (format: 'txt' | 'md' | 'json' | 'csv') => {
    if (!outputText) return;
    let mimeType = 'text/plain';
    let content = '';
    let ext = format;

    if (format === 'json') {
      mimeType = 'application/json';
      content = JSON.stringify({ metadata: stats, result: outputText }, null, 2);
    } else if (format === 'md') {
      content = `### UniTools Text Transformer Export\n\n\`\`\`text\n${outputText}\n\`\`\``;
    } else if (format === 'csv') {
      mimeType = 'text/csv;charset=utf-8;';
      content = '\uFEFF' + outputText.split('\n').map((line, idx) => `${idx + 1},"${line.replace(/"/g, '""')}"`).join('\n');
    } else {
      content = outputText;
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Transformer_Export_${Date.now()}.${ext}`;
    link.click();
  };

  const readUploadedTextFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (event) => {
      if (event.target?.result) setInputText(event.target.result as string);
    };
    r.readAsText(file);
  };

  const triggerClipboardCopy = () => {
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredRuleTypes = useMemo(() => {
    const filter = searchFilter.toLowerCase().trim();
    return Object.entries(ruleRegistry).filter(([key, def]) =>
      def.name.toLowerCase().includes(filter) || key.toLowerCase().includes(filter)
    );
  }, [searchFilter]);

  // Automatic pattern suggestion rules detector
  const suggestedRules = useMemo(() => {
    const list: Array<{ type: TextTransformationType; label: string; details: string; defaultVal1?: string; defaultVal2?: string }> = [];
    if (!inputText) return list;

    // 1. Email check
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(inputText)) {
      list.push({
        type: 'extract_emails',
        label: 'Trích xuất Emails',
        details: 'Trích lục danh sách địa chỉ mail.'
      });
      list.push({
        type: 'split_email',
        label: 'Tách Email (User | Domain)',
        details: 'Phân tách tên người dùng & tên miền đại diện.'
      });
    }

    // 2. Phone check
    if (/(?:\+84|0)[1-9]\d{8}\b/.test(inputText)) {
      list.push({
        type: 'extract_phones',
        label: 'Trích xuất Số Điện Thoại',
        details: 'Thâu tóm danh sách SĐT đầu số Việt Nam.'
      });
    }

    // 3. URL check
    if (/https?:\/\//.test(inputText)) {
      list.push({
        type: 'extract_urls',
        label: 'Trích xuất liên kết URLs',
        details: 'Lọc toàn bộ đường dẫn liên kết internet.'
      });
      list.push({
        type: 'split_url',
        label: 'Phân phân rã cấu trúc URL',
        details: 'Xem chi tiết các mảnh ghép Scheme/Host.'
      });
    }

    // 4. Special chars check (excluding typical letters, digits, standard spacing)
    if (/["'#$%&*<>?@[\]^`{|}]/.test(inputText)) {
      list.push({
        type: 'remove_chars',
        label: 'Xóa ký tự đặc biệt',
        details: 'Quét sạch các ký tự rác phổ biến.',
        defaultVal1: '@#$%&*'
      });
    }

    // 5. Spacings spacing check
    if (/[ \t]{2,}/.test(inputText) || /\n{3,}/.test(inputText)) {
      list.push({
        type: 'normalize_spaces',
        label: 'Chuẩn hóa khoảng trắng',
        details: 'Làm gọn khoảng trống & xóa dòng dư thừa.'
      });
    }

    // 6. Vietnamese alphabet check
    if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(inputText)) {
      list.push({
        type: 'normalize_vietnamese',
        label: 'Khử dấu Tiếng Việt',
        details: 'Quy đổi chữ có dấu Việt sang dạng ABC không dấu.'
      });
    }

    // 7. Custom delimiter check (look for common characters like '|', ';', '::', '\t')
    const delimiters = ['|', ';', '::', '\t'];
    delimiters.forEach(delim => {
      if (inputText.includes(delim)) {
        list.push({
          type: 'split_custom',
          label: `Tách bởi phân cách "${delim === '\t' ? '\\t' : delim}"`,
          details: 'Phát hiện dòng dữ liệu phân chia cột.',
          defaultVal1: delim
        });
      }
    });

    return list;
  }, [inputText]);

  const injectSuggestedRule = (type: TextTransformationType, val1 = '', val2 = '') => {
    const newRule: TransformationRule = {
      id: 'rule_' + Date.now() + Math.random().toString(36).substr(2, 4),
      enabled: true,
      type,
      value1: val1,
      value2: val2
    };
    setRules(prev => [...prev, newRule]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: PIPELINE CONTROLLERS */}
      <div className="lg:col-span-5 flex flex-col gap-6 h-full justify-between">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm flex flex-col h-full min-h-[500px]">
          <h3 className="text-base font-bold text-teal-600 dark:text-teal-400 border-b pb-3 mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-teal-500" /> Trình Dựng Pipeline Quy Tắc Động
          </h3>

          {/* Upload Drop area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-xl p-3.5 text-center cursor-pointer transition-all bg-slate-50 dark:bg-slate-900/10 mb-4 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={readUploadedTextFile}
              className="hidden"
              accept=".txt,.csv,.json,.md,.html"
            />
            <FileUp className="w-6 h-6 mx-auto text-slate-400 group-hover:text-teal-500 transition-colors mb-1" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Kéo thả hoặc nhấp để tải file phân tích nhanh
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dùng cấu hình Preset có sẵn</span>
              <div className="flex gap-2">
                <select
                  value={preset}
                  onChange={(e) => handleQuickPresetSelection(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-755 border border-slate-200 dark:border-slate-700/70 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">-- Chọn Preset mẫu --</option>
                  <option value="clean_data">Làm sạch văn bản thô</option>
                  <option value="extract_seo">Trích xuất thực thể SEO</option>
                  <option value="dev_case">Chuyển định dạng Code Case</option>
                  <option value="split_identity">Tách email người dùng</option>
                  {customPresets.length > 0 && (
                    <optgroup label="Cấu hình của bạn">
                      {customPresets.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {preset.startsWith('custom_') && (
                  <button
                    onClick={() => deleteCustomPreset(preset)}
                    className="bg-rose-100 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-200 dark:hover:bg-rose-900/50 p-1.5 rounded-xl border border-rose-200 dark:border-rose-800/50 transition-colors"
                    title="Xóa bộ lọc này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Lọc tìm nhanh quy tắc</span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Gõ tên luật cần tìm..."
                className="w-full bg-slate-50 dark:bg-slate-755 border border-slate-200 dark:border-slate-700/70 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Rules pipeline dynamic stack builder */}
          <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/10 border rounded-2xl p-4 flex flex-col min-h-[320px]">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Layers className="w-4 h-4 text-teal-500" /> Chuỗi Quy Tắc Xử Lý (Sequence Stack)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveCurrentRulesAsPreset}
                  className="bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold py-1 px-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800/50 text-[10px] flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Save className="w-3.5 h-3.5" /> Lưu bộ lọc
                </button>
                <button
                  onClick={addEmptyRule}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-1 px-2.5 rounded-lg text-[10px] flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm quy tắc
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar max-h-[310px] pr-1">
              {rules.length === 0 ? (
                <div className="text-slate-400 italic text-center py-10 text-xs">Hãy thêm các quy tắc biến đổi dọn dẹp...</div>
              ) : (
                rules.map((rule, idx) => {
                  const meta = ruleRegistry[rule.type];
                  return (
                    <div
                      key={rule.id}
                      className="bg-white dark:bg-slate-850 border border-slate-205 dark:border-slate-750 p-2.5 rounded-xl shadow-xs flex flex-col gap-2 relative transition-all"
                    >
                      <div className="flex items-center justify-between gap-1.5 select-none">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => toggleRuleEnabled(rule.id)}
                            className="rounded text-teal-600 focus:ring-teal-500 border-slate-300 scale-95"
                          />
                          <select
                            value={rule.type}
                            onChange={(e) => handleRuleTypeChange(rule.id, e.target.value as any)}
                            className="bg-slate-50 dark:bg-slate-700 text-[10px] font-bold p-1 rounded-lg border border-slate-300 dark:border-slate-600/80 max-w-[170px]"
                          >
                            {filteredRuleTypes.map(([key, def]) => (
                              <option key={key} value={key}>{def.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                          <button
                            onClick={() => moveRuleOrder(idx, 'up')}
                            disabled={idx === 0}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 p-0.5"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveRuleOrder(idx, 'down')}
                            disabled={idx === rules.length - 1}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 p-0.5"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRuleToken(rule.id)}
                            className="text-rose-400 hover:text-rose-600 ml-1 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Inputs conditional schema */}
                      {!meta?.flag && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {meta?.dualInput ? (
                            <>
                              <input
                                type="text"
                                value={rule.value1}
                                onChange={(e) => handleRuleValueChange(rule.id, 'value1', e.target.value)}
                                placeholder={meta.placeholder1}
                                className="bg-slate-50 dark:bg-slate-900 border text-[11px] p-2 rounded-lg"
                              />
                              <input
                                type="text"
                                value={rule.value2}
                                onChange={(e) => handleRuleValueChange(rule.id, 'value2', e.target.value)}
                                placeholder={meta.placeholder2}
                                className="bg-slate-50 dark:bg-slate-900 border text-[11px] p-2 rounded-lg"
                              />
                            </>
                          ) : (
                            <textarea
                              value={rule.value1}
                              onChange={(e) => handleRuleValueChange(rule.id, 'value1', e.target.value)}
                              placeholder={meta?.placeholder || 'Nhập tham số...'}
                              className="col-span-2 bg-slate-50 dark:bg-slate-900 border text-[11px] p-2 rounded-lg resize-none h-11 focus:outline-none"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={loadDemoSet}
            className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-teal-500" /> Tải Tập Dữ Liệu Có Sẵn Để Trực Quan Hóa
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: DIRECT OUTPUTS & PERFORMANCE COMPONENT */}
      <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
        {/* KPI indicators panel */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl border p-2.5 text-center shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Tổng ký tự</span>
            <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{stats.chars.toLocaleString()}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border p-2.5 text-center shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Mật độ Từ</span>
            <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{stats.words.toLocaleString()}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border p-2.5 text-center shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Số dòng</span>
            <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{stats.lines.toLocaleString()}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border p-2.5 text-center shadow-xs">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Bản ghi trích</span>
            <span className="text-sm font-black text-teal-500 font-mono">{stats.extracts.toLocaleString()}</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border p-2.5 text-center shadow-xs col-span-2 sm:col-span-1 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-slate-400 block uppercase flex items-center gap-0.5 justify-center"><Activity className="w-3 h-3" /> Độ trễ</span>
            <span className="text-[10px] font-extrabold text-indigo-500 font-mono italic mt-0.5">{latency} ms</span>
          </div>
        </div>

        {/* Automatic Rule Suggestions banner */}
        {suggestedRules.length > 0 && (
          <div className="bg-amber-500/10 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex flex-col gap-2">
            <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Trợ Lý Gợi Ý Quy Tắc Phù Hợp Tự Động (Auto-Detected Rules)
            </h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
              Phát hiện cấu trúc dữ liệu thô trùng khớp với các chuẩn quy tắc làm sạch sau. Click bất kỳ phím nào dưới đây để lập tức bổ sung quy tắc vào chuỗi xử lý:
            </p>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-h-[120px] custom-scrollbar">
              {suggestedRules.map((sug, idx) => (
                <button
                  key={`${sug.type}-${idx}`}
                  type="button"
                  onClick={() => injectSuggestedRule(sug.type, sug.defaultVal1, sug.defaultVal2)}
                  className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold text-slate-705 dark:text-slate-300 shadow-3xs flex items-center gap-2 active:scale-95 transition-all text-left shrink-0 cursor-pointer"
                >
                  <span className="text-[11px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded-lg leading-none">+</span>
                  <div>
                    <span className="block font-bold leading-none text-slate-800 dark:text-slate-100">{sug.label}</span>
                    <span className="block text-[9px] text-slate-400 font-normal mt-0.5">{sug.details}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Text / Output Text comparative grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inputs section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-4 flex flex-col h-[380px]">
            <div className="flex justify-between items-center pb-2 mb-2 border-b">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Văn bản gốc (Original inputs)</span>
              <span className="text-[10px] font-mono text-slate-400">Dữ liệu thô</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dán văn bản gốc cần dọn dẹp hoặc trích xuất tại đây..."
              className="w-full flex-1 bg-slate-50 dark:bg-slate-905 text-slate-800 dark:text-slate-100 text-xs font-mono p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none custom-scrollbar leading-relaxed"
            />
          </div>

          {/* Output diff section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-205 dark:border-slate-705 p-4 flex flex-col h-[380px]">
            <div className="flex justify-between items-center pb-2 mb-2 border-b">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Kết quả biến đổi (Outputs)</span>
              <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer font-bold select-none">
                <input
                  type="checkbox"
                  checked={showDiff}
                  onChange={(e) => setShowDiff(e.target.checked)}
                  className="rounded text-teal-600 scale-90"
                />
                Chế độ Diff Highlight
              </label>
            </div>

            {showDiff && inputText.length < 30000 ? (
              <div className="w-full flex-1 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 text-xs font-mono p-3 rounded-lg overflow-y-auto custom-scrollbar select-text whitespace-pre-wrap break-all leading-relaxed border border-slate-200 dark:border-slate-900 shadow-inner">
                <div className="bg-teal-50 dark:bg-teal-950/20 p-2 text-yellow-600 dark:text-yellow-400 border border-teal-200 dark:border-teal-800/40 rounded-lg mb-2 text-[10.5px]">
                  ✓ Phản hồi thay đổi: Độ dài thay đổi ({inputText.length} → {outputText.length} ký tự). Xem phía dưới:
                </div>
                {outputText.slice(0, 4000)}
              </div>
            ) : (
              <div className="w-full flex-1 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 text-xs font-mono p-3 rounded-lg overflow-y-auto custom-scrollbar select-text whitespace-pre-wrap break-all leading-relaxed border border-slate-200 dark:border-slate-900 shadow-inner">
                {outputText || <span className="text-slate-650 italic">Hệ thống chuyển đổi sẵn sàng thực thi tự động qua Web Worker...</span>}
              </div>
            )}
          </div>
        </div>

        {/* Global Exports section */}
        <div className="bg-white dark:bg-slate-800 border rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200 block">Bộ xuất dữ liệu đa nguồn (Multi-format export engine)</span>
            <span className="text-slate-400">Không có các nút download giả lập. Download file thật trực tiếp!</span>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={triggerClipboardCopy}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Đã sao chép' : 'Sao chép văn bản'}
            </button>
            <button
              onClick={() => triggerExportFile('txt')}
              className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-xl text-xs"
            >
              TXT
            </button>
            <button
              onClick={() => triggerExportFile('md')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs"
            >
              Markdown
            </button>
            <button
              onClick={() => triggerExportFile('json')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-xl text-xs"
            >
              JSON
            </button>
            <button
              onClick={() => triggerExportFile('csv')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-xl text-xs"
            >
              CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
