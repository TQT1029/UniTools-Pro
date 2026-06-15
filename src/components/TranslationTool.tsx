import React, { useState, useEffect } from 'react';
import { Languages, Copy, Check, Sparkles, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Tự động phát hiện ngôn ngữ' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'Tiếng Anh (English)' },
  { code: 'ja', name: 'Tiếng Nhật (Japanese)' },
  { code: 'zh', name: 'Tiếng Trung (Chinese)' },
  { code: 'ko', name: 'Tiếng Hàn (Korean)' },
  { code: 'fr', name: 'Tiếng Pháp (French)' },
  { code: 'de', name: 'Tiếng Đức (German)' },
  { code: 'es', name: 'Tiếng Tây Ban Nha (Spanish)' },
  { code: 'ru', name: 'Tiếng Nga (Russian)' },
];

export default function TranslationTool() {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [engine, setEngine] = useState<'google' | 'microsoft'>('google');
  const [msApiKey, setMsApiKey] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [detectedLang, setDetectedLang] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-run translation with debounce
  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      setDetectedLang('');
      setErrorMsg('');
      return;
    }

    const timer = setTimeout(() => {
      translateText();
    }, 600);

    return () => clearTimeout(timer);
  }, [sourceText, sourceLang, targetLang, engine, msApiKey]);

  const translateText = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setErrorMsg('');

    try {
      if (engine === 'microsoft' && msApiKey.trim()) {
        // Call Real Microsoft Translator API
        const response = await fetch(
          `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${targetLang}`,
          {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': msApiKey,
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Region': 'global',
            },
            body: JSON.stringify([{ text: sourceText }]),
          }
        );

        if (!response.ok) {
          throw new Error('Không thể kết nối API Microsoft. Vui lòng kiểm tra lại API Key.');
        }

        const data = await response.json();
        if (data && data[0]?.translations?.[0]?.text) {
          setTranslatedText(data[0].translations[0].text);
          if (data[0].detectedLanguage?.language) {
            const detected = SUPPORTED_LANGUAGES.find(l => l.code === data[0].detectedLanguage.language);
            setDetectedLang(detected ? detected.name : data[0].detectedLanguage.language.toUpperCase());
          }
        }
      } else {
        // Call Live Google Translate API (gtx gtranslator engine)
        const sl = sourceLang;
        const tl = targetLang;
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(sourceText)}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Dịch vụ Google Translate tạm thời quá tải.');
        }

        const result = await response.json();
        if (result && result[0]) {
          const sentences = result[0].map((s: any) => s[0]).join('');
          setTranslatedText(sentences);
          
          if (result[2]) {
            const detectedCode = result[2];
            const detected = SUPPORTED_LANGUAGES.find(l => l.code === detectedCode);
            setDetectedLang(detected ? detected.name : detectedCode.toUpperCase());
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      if (engine === 'microsoft') {
        setErrorMsg('Microsoft API thất bại. Đang tự động chuyển hướng sử dụng Google Translate Engine...');
        // Fallback gracefully
        setTimeout(() => {
          setEngine('google');
        }, 1500);
      } else {
        setErrorMsg(error.message || 'Lỗi mạng xảy ra khi dịch văn bản.');
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: SOURCE PANEL */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-805 rounded-2xl border border-slate-200 dark:border-slate-705 p-5 shadow-sm flex flex-col h-full min-h-[420px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-755 pb-4 mb-4">
            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase">
              <Languages className="w-5 h-5 text-indigo-500" /> Ngôn ngữ Nguồn
            </h3>
            
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={`src-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col relative">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Nhập hoặc dán văn bản cần dịch tại đây (Hệ thống tự động dịch nhanh)..."
              className="w-full flex-1 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-505 resize-none custom-scrollbar leading-relaxed h-[240px] border border-slate-200 dark:border-slate-750"
            />
            {sourceLang === 'auto' && detectedLang && (
              <span className="absolute bottom-3 left-3 bg-indigo-50/80 dark:bg-indigo-950/50 text-[#117a8b] dark:text-indigo-300 px-2 py-1 rounded text-[10px] font-bold border border-indigo-200/40">
                Phát hiện: {detectedLang}
              </span>
            )}
            <span className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400">
              {sourceText.length} ký tự
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: TRANSLATED OUTPUT */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-805 rounded-2xl border border-slate-200 dark:border-slate-705 p-5 shadow-sm flex flex-col h-full min-h-[420px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-755 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 uppercase">
                Ngôn ngữ Đích
              </h3>
              {sourceLang !== 'auto' && (
                <button
                  onClick={handleSwapLanguages}
                  title="Đổi chiều dịch ngôn ngữ"
                  className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border rounded-lg text-slate-500 hover:text-indigo-500 active:scale-90 transition-all text-[11px] font-bold flex gap-1 items-center"
                >
                  ⇄ Hoán đổi
                </button>
              )}
            </div>
            
            <select
              value={targetLang}
              onChange={(e) => {
                if (e.target.value === 'auto') return;
                setTargetLang(e.target.value);
              }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.filter(l => l.code !== 'auto').map(lang => (
                <option key={`dest-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col relative justify-between gap-4">
            <div className="w-full flex-1 bg-slate-50 dark:bg-slate-900 text-teal-950 dark:text-teal-300 text-xs font-semibold p-4 rounded-xl resize-none h-[240px] overflow-y-auto custom-scrollbar leading-relaxed border border-slate-200 dark:border-slate-750 relative select-text whitespace-pre-wrap">
              {isTranslating ? (
                <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xs flex flex-col items-center justify-center rounded-xl">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
                  <span className="text-[10px] font-bold text-slate-401 uppercase">Đang dịch tài liệu...</span>
                </div>
              ) : null}
              {translatedText || <span className="text-slate-400 italic">Bản dịch sẽ hiển thị tự động tại đây...</span>}
            </div>

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/20 text-rose-600 dark:text-rose-400 text-[11px] p-2 rounded-lg border border-red-200/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-between items-center bg-slate-100/40 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" /> Sẵn sàng qua gtx-cloud
              </span>
              <button
                onClick={copyToClipboard}
                disabled={!translatedText}
                className="bg-[#117a8b] hover:bg-[#0f6c7c] disabled:opacity-40 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Đã sao chép' : 'Sao chép kết quả'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CONFIGURATION PANEL: CHOICE OF ENGINES */}
      <div className="lg:col-span-12">
        <div className="bg-white dark:bg-slate-805 rounded-xl border border-slate-200 dark:border-slate-705 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3 mb-4">
            <div>
              <h4 className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                Cấu hình Nhà Cung Cấp Dịch Thuật (Engine Providers)
              </h4>
              <p className="text-[11px] text-slate-400">
                Cho phép chuyển dịch tức thời qua Google Translate công nghệ đám mây hoặc qua Microsoft Azure API.
              </p>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border">
              <button
                type="button"
                onClick={() => setEngine('google')}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${engine === 'google' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Google Translate (Mặc định)
              </button>
              <button
                type="button"
                onClick={() => setEngine('microsoft')}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${engine === 'microsoft' ? 'bg-white dark:bg-slate-800 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Microsoft Translators API
              </button>
            </div>
          </div>

          {engine === 'microsoft' ? (
            <div className="space-y-3 animate-scale-up">
              <div className="bg-indigo-50/50 dark:bg-slate-900/30 p-4 rounded-xl border">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 block mb-1">
                  Cách cấu hình Azure Cognitive Service:
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tạo một tài nguyên **Translator** trong Microsoft Azure Portal, lấy khóa đăng ký (**Ocp-Apim-Subscription-Key**) và điền vào ô bên dưới. Hệ thống sẽ ngay lập tức định tuyến các kết quả dịch văn bản trực tiếp qua API chính phủ này.
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Microsoft API Key (Subscription Key)</span>
                <input
                  type="password"
                  value={msApiKey}
                  onChange={(e) => setMsApiKey(e.target.value)}
                  placeholder="Dán Ocp-Apim-Subscription-Key vào đây..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border text-xs px-3 py-2 rounded-xl"
                />
                {!msApiKey.trim() && (
                  <span className="text-[10px] text-amber-500 italic font-medium block mt-1">
                    * Đang chạy ở chế độ giả lập kết quả hoặc fallback Google Translate vì chưa thiết lập API Key.
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border text-[11px] text-slate-400 leading-relaxed flex gap-2 items-start">
              <HelpCircle className="w-5 h-5 text-teal-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-600 dark:text-slate-300 block">Ưu điểm của gtx Cloud Engine:</span>
                Tích hợp sẵn mà không cần bất kỳ khóa bí mật hay cấu hình phức tạp nào. Hoạt động tức thì trên hàng triệu từ, hỗ trợ tự động nhận dạng ngôn ngữ hoàn toàn chính xác.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
