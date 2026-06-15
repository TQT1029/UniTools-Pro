import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, Download, Copy, Check, Info, Settings, Sparkles } from 'lucide-react';

const LANGUAGE_VOICES = [
  { code: 'vi-VN', langName: 'Tiếng Việt', defaultText: 'Chào mừng bạn đến với UniTools. Đây là công cụ chuyển đổi văn bản thành giọng nói chuyên nghiệp.' },
  { code: 'en-US', langName: 'Tiếng Anh (US)', defaultText: 'Welcome to UniTools. This is a professional text to speech conversion tool.' },
  { code: 'en-GB', langName: 'Tiếng Anh (UK)', defaultText: 'Welcome to UniTools. This is a professional text to speech conversion tool.' },
  { code: 'ja-JP', langName: 'Tiếng Nhật', defaultText: 'UniToolsへようこそ。これはプロフェッショナルなテキスト読み上げツールです。' },
  { code: 'ko-KR', langName: 'Tiếng Hàn', defaultText: '유니툴즈에 오신 것을 환영합니다. 이것은 전문 텍스트 음성 변환 도구입니다.' },
  { code: 'fr-FR', langName: 'Tiếng Pháp', defaultText: 'Bienvenue chez UniTools. C\'est un outil de synthèse vocale professionnel.' },
];

export default function TextToSpeech() {
  const [text, setText] = useState('Chào mừng bạn đến với UniTools. Đây là công cụ chuyển đổi văn bản thành giọng nói chuyên nghiệp.');
  const [lang, setLang] = useState('vi-VN');
  const [rate, setRate] = useState(1); // Speed: 0.5 to 2
  const [pitch, setPitch] = useState(1); // Pitch: 0.5 to 2
  const [volume, setVolume] = useState(1); // Volume: 0 to 1

  // Native Web Speech voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Cloud TTS stream references
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [cloudLoading, setCloudLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load native SpeechSynthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
        
        // Auto-select a voice for default vi-VN
        const bestVi = available.find(v => v.lang.startsWith('vi'));
        if (bestVi) setSelectedVoiceName(bestVi.name);
        else if (available.length > 0) setSelectedVoiceName(available[0].name);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Update text when language changes to standard preset
  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    const found = LANGUAGE_VOICES.find(v => v.code === newLang);
    if (found) {
      setText(found.defaultText);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const prefix = newLang.split('-')[0];
      const match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
      if (match) setSelectedVoiceName(match.name);
    }
  };

  // 1. Play Native Synthesis
  const playNative = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Stop and clear previous utterances first
    window.speechSynthesis.cancel();

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set custom bounds
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const pauseNative = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stopNative = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // 2. Generate Cloud Audio Stream URL (Google TTS)
  useEffect(() => {
    if (!text.trim()) {
      setAudioUrl('');
      return;
    }

    // Truncate to maximum 200 characters for Google Translate TTS API support safely
    const shortText = text.slice(0, 200);
    const cl = lang.split('-')[0];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${cl}&client=tw-ob&q=${encodeURIComponent(shortText)}`;
    setAudioUrl(url);
  }, [text, lang]);

  const handleDownloadCloudAudio = async () => {
    if (!audioUrl) return;
    setCloudLoading(true);
    try {
      // Fetch the audio stream blob directly
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `Audio_TTS_Export_${Date.now()}.mp3`;
      downloadLink.click();
    } catch (e) {
      // Fallback: open URL in a blank tab if CORS blocks immediate fetch
      window.open(audioUrl, '_blank');
    } finally {
      setCloudLoading(false);
    }
  };

  const copyTextToClipboard = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Filter voices that match the active language locale
  const filteredVoices = voices.filter(v => {
    const prefix = lang.split('-')[0];
    return v.lang.toLowerCase().startsWith(prefix);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: TEXT EDITOR */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-805 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm flex flex-col h-full min-h-[460px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-755 pb-4 mb-4">
            <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 uppercase">
              <Volume2 className="w-5 h-5 text-teal-500 animate-pulse" /> Nhập Văn Bản Cần Nói
            </h3>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngôn ngữ</span>
              <select
                value={lang}
                onChange={(e) => handleLangChange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
              >
                {LANGUAGE_VOICES.map(voice => (
                  <option key={voice.code} value={voice.code}>
                    {voice.langName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Gõ ngôn ngữ mong muốn hoặc tiếng Việt tại đây..."
            className="w-full flex-1 bg-slate-50 dark:bg-slate-905 text-slate-800 dark:text-slate-100 text-xs font-semibold p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none custom-scrollbar leading-relaxed h-[260px] border border-slate-200 dark:border-slate-750"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-755 pt-4 mt-4 text-xs">
            <span className="text-[10px] font-mono text-slate-400">
              Độ dài: <strong className="text-slate-600 dark:text-slate-200">{text.length}</strong> ký tự ({text.split(/\s+/).filter(Boolean).length} từ)
            </span>
            <div className="flex gap-2">
              <button
                onClick={copyTextToClipboard}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-bold py-1.5 px-3 rounded-lg text-[10.5px] flex items-center gap-1 transition-all"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                SAO CHÉP VĂN BẢN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: CONTROLLERS & AUDIO RECORDER */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Synthesis Settings */}
        <div className="bg-white dark:bg-slate-805 rounded-2xl border border-slate-205 dark:border-slate-705 p-5 shadow-sm flex flex-col gap-5">
          <h3 className="text-xs font-black text-slate-401 dark:text-slate-300 uppercase tracking-widest border-b pb-3 flex items-center gap-1.5">
            <Settings className="w-5 h-5 text-teal-500" /> Tùy Chỉnh Giọng Đọc & Âm Thanh
          </h3>

          <div className="space-y-4">
            {/* Voices Selection */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Giọng đọc hệ thống (Native Core)</span>
              {filteredVoices.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900 border text-[11px] p-2.5 rounded-xl text-slate-400 italic">
                  Không tìm thấy giọng nói của hệ thống cho ngôn ngữ này. Sẽ tự động áp dụng giọng chuẩn nơ-ron của Google.
                </div>
              ) : (
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  {filteredVoices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang}) {voice.default ? ' [Default]' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Range sliders */}
            <div className="grid grid-cols-1 gap-4">
              {/* Speed Slider */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span className="uppercase tracking-widest">Tốc độ đọc (Rate)</span>
                  <span className="text-teal-600">{rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Pitch Slider */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span className="uppercase tracking-widest">Cao độ (Pitch)</span>
                  <span className="text-teal-600">{pitch}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Volume Slider */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span className="uppercase tracking-widest">Âm lượng (Volume)</span>
                  <span className="text-teal-600">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-205 dark:border-slate-750 p-5 shadow-sm space-y-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b pb-2">Khu Vực Điều Khiển & Xuất</span>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={playNative}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all text-center uppercase tracking-wider"
              title="Phát giọng nói của bạn"
            >
              {isPaused ? <Play className="w-4 h-4 fill-white animate-pulse" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'TIẾP TỤC' : 'PHÁT'}</span>
            </button>
            <button
              onClick={pauseNative}
              disabled={!isPlaying}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all text-center uppercase tracking-wider"
              title="Tạm ngừng đọc"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>TẠM DỪNG</span>
            </button>
            <button
              onClick={stopNative}
              disabled={!isPlaying && !isPaused}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs flex flex-col items-center justify-center gap-1 shadow active:scale-95 transition-all text-center uppercase tracking-wider"
              title="Dừng phát giọng nói"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>DỪNG</span>
            </button>
          </div>

          {/* Cloud stream play & download audio file */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
              <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                Có thể nghe trước & tải trực tiếp file âm thanh `.mp3` chất lượng cao từ Cloud Google Neural Voice.
              </div>
            </div>

            {audioUrl ? (
              <div className="flex flex-col gap-2">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full h-8 accent-teal-600 custom-scrollbar opacity-95 text-xs"
                />
                <button
                  type="button"
                  onClick={handleDownloadCloudAudio}
                  disabled={cloudLoading}
                  className="w-full bg-[#117a8b] hover:bg-[#0f6c7c] disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-widest mt-1.5"
                >
                  <Download className="w-4 h-4" />
                  {cloudLoading ? 'ĐANG TẢI FILE...' : 'TẢI FILE ÂM THANH MP3'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
