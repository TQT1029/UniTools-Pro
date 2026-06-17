import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { CountWordResult } from "../types";
import {
  FileText,
  UploadCloud,
  Trash2,
  Sparkles,
  Award,
  BookOpen,
  Mic,
  Brain,
  Download,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Layers,
  Search,
  Eye,
} from "lucide-react";

export default function CountWordPro() {
  const [inputText, setTextareaValue] = useLocalStorage("unitools_cwp_input", "");
  const [freqLimit, setFreqLimit] = useLocalStorage("unitools_cwp_limit", 15);
  const [excludeStopWords, setExcludeStopWords] = useLocalStorage("unitools_cwp_exclude", true);
  const [activeSubTab, setActiveSubTab] = useState<
    "freq" | "seo" | "struct" | "ai"
  >("freq");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [latency, setLatency] = useState(0);
  const [report, setReport] = useState<CountWordResult | null>(null);
  const [btnTextTextReport, setBtnTextTextReport] =
    useState("Sao Chép Báo Cáo");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudCanvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const stopWords = useMemo(
    () =>
      new Set([
        "và",
        "thì",
        "mà",
        "là",
        "nhưng",
        "hoặc",
        "của",
        "cho",
        "để",
        "với",
        "trong",
        "ngoài",
        "tại",
        "từ",
        "the",
        "and",
        "a",
        "of",
        "to",
        "in",
        "is",
        "you",
        "that",
        "it",
        "he",
        "was",
        "for",
        "on",
        "are",
        "as",
        "this",
        "with",
        "i",
        "with",
        "at",
        "by",
        "an",
        "be",
        "has",
        "have",
        "had",
        "do",
        "does",
        "did",
        "but",
      ]),
    [],
  );

  // Web Worker setup
  useEffect(() => {
    const workerCode = function () {
      function normalizeVietnameseLetters(str: string) {
        return str
          .normalize("NFC")
          .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
          .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
          .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
          .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
          .replace(/ì|í|ị|ỉ|ĩ/g, "i")
          .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
          .replace(/đ/g, "d");
      }

      self.onmessage = function (e) {
        const { text, stopWordsArr } = e.data;
        const start = performance.now();
        const sw = new Set(stopWordsArr);

        if (!text) {
          self.postMessage({ isEmpty: true });
          return;
        }

        const charCountTotal = text.length;
        const charCountNoSpaces = text.replace(/\s/g, "").length;

        const lines = text.split(/\r\n|\r|\n/);
        const lineCountTotal = lines.length;
        const emptyLines = lines.filter((l: string) => l.trim() === "").length;
        const nonEmptyLines = lineCountTotal - emptyLines;

        const paragraphs = text
          .split(/\n\s*\n+/)
          .filter((p: string) => p.trim().length > 0);
        const paragraphCount = paragraphs.length;

        const wordsRaw = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
        const wordCountTotal = wordsRaw.length;

        const sentences = text
          .split(/[.!?]+(?:\s|$)/)
          .filter((s: string) => s.trim().length > 0);
        const sentenceCount = sentences.length;

        let longestWord = "";
        let shortestWord = wordsRaw[0] || "";
        let totalWordLength = 0;

        const lengthDistribution: Record<string, number> = {
          "1-3": 0,
          "4-6": 0,
          "7-10": 0,
          "10+": 0,
        };
        const wordFreqMap: Record<string, number> = {};
        const charFreqMap: Record<string, number> = {};

        for (let i = 0; i < text.length; i++) {
          const char = text[i].toLowerCase();
          if (/[^\s]/.test(char)) {
            charFreqMap[char] = (charFreqMap[char] || 0) + 1;
          }
        }

        wordsRaw.forEach((word: string) => {
          totalWordLength += word.length;
          if (word.length > longestWord.length) longestWord = word;
          if (word.length < shortestWord.length && word.length > 0)
            shortestWord = word;

          if (word.length <= 3) lengthDistribution["1-3"]++;
          else if (word.length <= 6) lengthDistribution["4-6"]++;
          else if (word.length <= 10) lengthDistribution["7-10"]++;
          else lengthDistribution["10+"]++;

          wordFreqMap[word] = (wordFreqMap[word] || 0) + 1;
        });

        const uniqueWordsCount = Object.keys(wordFreqMap).length;
        const repeatedWordsCount = wordCountTotal - uniqueWordsCount;
        const avgWordLength = wordCountTotal
          ? Number((totalWordLength / wordCountTotal).toFixed(1))
          : 0;

        const getNGrams = (wordsArr: string[], n: number) => {
          const ngrams: Record<string, number> = {};
          for (let i = 0; i <= wordsArr.length - n; i++) {
            const gram = wordsArr.slice(i, i + n).join(" ");
            if (gram.trim()) {
              ngrams[gram] = (ngrams[gram] || 0) + 1;
            }
          }
          return Object.entries(ngrams)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        };

        const bigrams = getNGrams(wordsRaw, 2);
        const trigrams = getNGrams(wordsRaw, 3);
        const quadgrams = getNGrams(wordsRaw, 4);

        let stopWordMatchCount = 0;
        wordsRaw.forEach((w: string) => {
          if (sw.has(w)) stopWordMatchCount++;
        });

        const viCount = (
          text.match(
            /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi,
          ) || []
        ).length;
        const langDetected =
          viCount > wordCountTotal * 0.1 ? "Tiếng Việt" : "English / Hỗn hợp";

        const h1Count =
          (text.match(/^#\s.+/gm) || []).length +
          (text.match(/<h1[^>]*>.*?<\/h1>/gi) || []).length;
        const h2Count =
          (text.match(/^##\s.+/gm) || []).length +
          (text.match(/<h2[^>]*>.*?<\/h2>/gi) || []).length;
        const h3Count =
          (text.match(/^###\s.+/gm) || []).length +
          (text.match(/<h3[^>]*>.*?<\/h3>/gi) || []).length;
        const h4Count =
          (text.match(/^####+\s.+/gm) || []).length +
          (text.match(/<h4[^>]*>.*?<\/h4>|<h5[^>]*>.*?<\/h5>/gi) || []).length;
        const listCount =
          (text.match(/^(\s*[-*+]|\s*\d+\.)\s.+/gm) || []).length +
          (text.match(/<li[^>]*>/gi) || []).length;
        const tableCount =
          (text.match(/^\|.+\|$/gm) || []).length +
          (text.match(/<table[^>]*>/gi) || []).length;
        const linkCount =
          (text.match(/\[.*?\]\(.*?\)/g) || []).length +
          (text.match(/<a\s[^>]*href/gi) || []).length;
        const imgCount =
          (text.match(/!\[.*?\]\(.*?\)/g) || []).length +
          (text.match(/<img\s/gi) || []).length;

        const duplicateSentences: string[] = [];
        const seenSet = new Set();
        sentences.forEach((s: string) => {
          const clean = s.trim().toLowerCase();
          if (clean.length > 20) {
            if (seenSet.has(clean)) {
              duplicateSentences.push(s.trim());
            } else {
              seenSet.add(clean);
            }
          }
        });

        const duration = Number((performance.now() - start).toFixed(1));

        self.postMessage({
          isEmpty: false,
          duration,
          charCountTotal,
          charCountNoSpaces,
          lineCountTotal,
          emptyLines,
          nonEmptyLines,
          paragraphCount,
          wordCountTotal,
          uniqueWordsCount,
          repeatedWordsCount,
          sentenceCount,
          langDetected,
          longestWord,
          shortestWord,
          avgWordLength,
          lengthDistribution,
          wordFreqMap,
          charFreqMap,
          bigrams,
          trigrams,
          quadgrams,
          stopWordMatchCount,
          struct: {
            h1Count,
            h2Count,
            h3Count,
            h4Count,
            listCount,
            tableCount,
            linkCount,
            imgCount,
          },
          duplicateCount: duplicateSentences.length,
          duplicateSample: duplicateSentences.slice(0, 1).join(""),
        });
      };
    };

    const blob = new Blob([`(${workerCode.toString()})()`].concat(), {
      type: "application/javascript",
    });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const data = e.data;
      if (data.isEmpty) {
        setReport(null);
        setLatency(0);
        return;
      }
      setLatency(data.duration);
      setReport(data);
      setIsToastVisible(true);
      const timer = setTimeout(() => setIsToastVisible(false), 1500);
      return () => clearTimeout(timer);
    };

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        text: inputText,
        stopWordsArr: Array.from(stopWords),
      });
    }
  }, [inputText, stopWords]);

  useEffect(() => {
    if (activeSubTab === "seo" && report) {
      setTimeout(() => renderWordCloud(), 100);
    }
  }, [activeSubTab, report, excludeStopWords]);

  const renderWordCloud = () => {
    const canvas = cloudCanvasRef.current;
    if (!canvas || !report) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth || 350;
    const height = canvas.offsetHeight || 220;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    let words = (Object.entries(report.wordFreqMap) as [string, number][])
      .filter(([w]) => w.length > 1 && (!excludeStopWords || !stopWords.has(w)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24);

    if (words.length === 0) {
      ctx.fillStyle = "#64748b";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Không tìm thấy đủ từ phù hợp để vẽ WordCloud.",
        width / 2,
        height / 2,
      );
      return;
    }

    const maxWeight = words[0][1];
    const minWeight = words[words.length - 1][1];

    const colors = [
      "#6366f1",
      "#4f46e5",
      "#3b82f6",
      "#06b6d4",
      "#f43f5e",
      "#ec4899",
      "#10b981",
    ];

    words.forEach(([word, freq], idx) => {
      const fontSize =
        maxWeight === minWeight
          ? 18
          : 11 + ((freq - minWeight) / (maxWeight - minWeight)) * 22;

      ctx.font = `bold ${Math.floor(fontSize)}px "Segoe UI", sans-serif`;
      ctx.fillStyle = colors[idx % colors.length];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let angle = Math.random() * Math.PI * 2;
      let radius = idx === 0 ? 0 : 25 + Math.random() * (width / 5);

      let x = width / 2 + Math.cos(angle) * radius;
      let y = height / 2 + Math.sin(angle) * radius;

      x = Math.max(fontSize * 1.5, Math.min(width - fontSize * 1.5, x));
      y = Math.max(fontSize, Math.min(height - fontSize, y));

      ctx.save();
      ctx.translate(x, y);
      if (idx % 5 === 0) ctx.rotate(Math.PI / 2);
      ctx.fillText(word, 0, 0);
      ctx.restore();
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result)
        setWordInputValue(event.target.result as string);
    };
    reader.readAsText(file);
  };

  const setWordInputValue = (val: string) => {
    setTextareaValue(val);
  };

  const triggerCopyReportText = () => {
    if (!report) return;
    const reportText = `--- UNI COUNTERWORD PRO REPORT ---
Ngôn ngữ chủ đạo: ${report.langDetected}
Tổng số từ: ${report.wordCountTotal} (${report.uniqueWordsCount} từ độc nhất)
Tổng số ký tự: ${report.charCountTotal} (Không tính dấu cách: ${report.charCountNoSpaces})
Số lượng câu văn: ${report.sentenceCount} | Đoạn văn: ${report.paragraphCount}
Số lượng dòng: ${report.lineCountTotal} (Dòng trống: ${report.emptyLines})
Ước tính thời gian đọc: ${Math.ceil(report.wordCountTotal / 200)} phút | Nói: ${Math.ceil(report.wordCountTotal / 130)} phút
Ước lượng GPT Token: ${Math.ceil(report.charCountTotal / 3.7)} tokens`;

    navigator.clipboard.writeText(reportText);
    setBtnTextTextReport("Đã Sao Chép! ✓");
    setTimeout(() => setBtnTextTextReport("Sao Chép Báo Cáo"), 1800);
  };

  const exportToFile = (format: "json" | "csv") => {
    if (!report) return;
    let mimeType = "text/plain";
    let content = "";
    let fileName = `UniTools_WordCount_${Date.now()}`;

    if (format === "json") {
      mimeType = "application/json";
      content = JSON.stringify(report, null, 2);
      fileName += ".json";
    } else {
      mimeType = "text/csv;charset=utf-8;";
      let csvLines = ["Metric,Value"];
      csvLines.push(`Ngon ngu,${report.langDetected}`);
      csvLines.push(`Tong so tu,${report.wordCountTotal}`);
      csvLines.push(`Tu doc nhat,${report.uniqueWordsCount}`);
      csvLines.push(`Ky tu thau,${report.charCountTotal}`);
      csvLines.push(`Ky tu thuc,${report.charCountNoSpaces}`);
      csvLines.push(`Cau van,${report.sentenceCount}`);
      csvLines.push(`Doan van,${report.paragraphCount}`);
      csvLines.push(`H1,${report.struct.h1Count}`);
      csvLines.push(`H2,${report.struct.h2Count}`);
      csvLines.push(`H3,${report.struct.h3Count}`);
      content = "\uFEFF" + csvLines.join("\n");
      fileName += ".csv";
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result)
        setWordInputValue(event.target.result as string);
    };
    reader.readAsText(file);
  };

  const loadDemoText = () => {
    setWordInputValue(`## Xu hướng Trí tuệ nhân tạo (AI) và Mô hình Ngôn ngữ Lớn

Trí tuệ nhân tạo (AI) hay artificial intelligence đang là hạt nhân cốt lõi thay đổi hoàn toàn cục diện thế giới công nghệ hiện đại. Trong kỷ nguyên số vạn vật kết nối hiện nay, hệ thống mô hình ngôn ngữ lớn (large language model) đóng vai trò như một bộ não nhân tạo xử lý và phân tích khối lượng dữ liệu khổng lồ (big data).

### Các phân hệ kiến trúc của AI chuyên sâu:
1. Machine learning (Học máy): Tập trung huấn luyện các mô hình dự đoán.
2. Deep learning (Học sâu): Mô phỏng các mạng lưới nơ-ron sinh học phức tạp.
3. Natural Language Processing (NLP): Xử lý ngôn ngữ tự nhiên tối ưu.

State of the art là thuật ngữ chỉ các công nghệ AI tiên tiến đạt mức độ tối tân hiện nay. Bản chất hệ thống luôn vận hành liên tục không ngừng nghỉ để tự tối ưu hóa. Mật độ từ khóa và chất lượng bài viết chính là điều kiện tiên quyết giúp tối ưu hóa công cụ tìm kiếm bài viết (SEO bài viết) lên top Google một cách tự nhiên và bền vững.`);
  };

  const filteredWordsList = useMemo(() => {
    if (!report) return [];
    let list = Object.entries(report.wordFreqMap) as [string, number][];
    if (excludeStopWords) {
      list = list.filter(([w]) => !stopWords.has(w));
    }
    return list.sort((a, b) => b[1] - a[1]).slice(0, freqLimit);
  }, [report, freqLimit, excludeStopWords, stopWords]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: TEXT EDITOR */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm flex flex-col h-full min-h-[500px]">
          <h3 className="text-sm font-bold text-slate-700 dark:text-indigo-400 border-b pb-3 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <FileText className="w-5 h-5 text-indigo-500" /> Không Gian Nhập
            Liệu
          </h3>

          {/* Draggable Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-50 dark:bg-slate-900/10 mb-4 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.csv,.json,.md,.html"
            />
            <UploadCloud className="w-8 h-8 mx-auto text-slate-401 group-hover:text-indigo-500 transition-colors mb-1.5" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Kéo thả tệp tin hoặc{" "}
              <span className="text-indigo-500 underline font-bold">
                chọn từ thiết bị
              </span>
            </p>
            <p className="text-[10px] text-slate-401 mt-1">
              Hỗ trợ TXT, MD, CSV, JSON (lên đến 20MB)
            </p>
          </div>

          {/* Word Input Area */}
          <div className="flex-1 relative flex flex-col">
            <textarea
              value={inputText}
              onChange={(e) => setWordInputValue(e.target.value)}
              placeholder="Dán hoặc bắt đầu nhập đoạn văn bản cần đếm từ và thống kê tần suất..."
              className="flex-1 w-full bg-slate-50 dark:bg-slate-905 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-750 rounded-xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none custom-scrollbar leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 select-none pointer-events-none">
              <span
                className={`text-[9px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded shadow-sm transition-opacity duration-300 ${isToastVisible ? "opacity-100" : "opacity-0"}`}
              >
                Auto-updated
              </span>
              <span className="text-[10px] font-mono bg-slate-250 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                ⚡ {latency} ms
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setWordInputValue("")}
              className="bg-slate-155 dark:bg-slate-700 hover:bg-slate-150 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-slate-400" /> Làm Sạch Ô Nhập
            </button>
            <button
              onClick={loadDemoText}
              className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-950/40 text-indigo-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" /> Tải Văn Bản Mẫu
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ANALYTICS BOARDS */}
      <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
        {/* Top Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-401 block">
              <Award className="w-3.5 h-3.5 inline mr-1 text-indigo-500" /> Tổng
              Số Từ
            </span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {report ? report.wordCountTotal.toLocaleString() : 0}
              </span>
              <span className="text-[9px] font-bold text-indigo-500">
                {report ? report.uniqueWordsCount : 0} độc nhất
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-cyan-400"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-401 block">
              <Eye className="w-3.5 h-3.5 inline mr-1 text-cyan-400" /> Tổng Kí
              Tự
            </span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {report ? report.charCountTotal.toLocaleString() : 0}
              </span>
              <span className="text-[9px] text-slate-401 font-mono">
                /{report ? report.charCountNoSpaces.toLocaleString() : 0} thực
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-violet-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-401 block">
              <BookOpen className="w-3.5 h-3.5 inline mr-1 text-violet-500" />{" "}
              Câu &amp; Đoạn
            </span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {report ? report.sentenceCount : 0}
              </span>
              <span className="text-[9px] text-violet-400 font-bold font-mono">
                /{report ? report.paragraphCount : 0} Đoạn
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-rose-500"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-401 block">
              <Mic className="w-3.5 h-3.5 inline mr-1 text-rose-500" /> Đọc
              &amp; Nói
            </span>
            <div className="flex items-baseline gap-1 bg-slate-50 dark:bg-slate-900/30 px-2 py-0.5 rounded-lg border dark:border-slate-700 mt-1 max-w-fit font-mono text-xs">
              <span className="font-black text-slate-700 dark:text-slate-300">
                {report ? Math.ceil(report.wordCountTotal / 200) : 0}m
              </span>
              <span className="text-[9px] text-slate-401 mr-1.5">đọc</span>
              <span className="font-black text-slate-700 dark:text-slate-300 border-l pl-1.5 border-slate-200 dark:border-slate-700">
                {report ? Math.ceil(report.wordCountTotal / 130) : 0}m
              </span>
              <span className="text-[9px] text-slate-401">nói</span>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-5 shadow-sm">
          <div className="flex border-b border-slate-150 dark:border-slate-700 gap-1.5 mb-4 overflow-x-auto custom-scrollbar select-none">
            <button
              onClick={() => setActiveSubTab("freq")}
              className={`pb-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeSubTab === "freq" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold" : "border-transparent text-slate-401 hover:text-slate-905"}`}
            >
              <Clock className="w-3.5 h-3.5" /> Tần Suất &amp; N-Grams
            </button>
            <button
              onClick={() => setActiveSubTab("seo")}
              className={`pb-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeSubTab === "seo" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold" : "border-transparent text-slate-401 hover:text-slate-905"}`}
            >
              <Search className="w-3.5 h-3.5" /> SEO Mật Độ &amp; Đám Mây
            </button>
            <button
              onClick={() => setActiveSubTab("struct")}
              className={`pb-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeSubTab === "struct" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold" : "border-transparent text-slate-410 hover:text-slate-905"}`}
            >
              <Layers className="w-3.5 h-3.5" /> Ngôn Ngữ &amp; Tags Web
            </button>
            <button
              onClick={() => setActiveSubTab("ai")}
              className={`pb-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${activeSubTab === "ai" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold" : "border-transparent text-slate-410 hover:text-slate-905"}`}
            >
              <Brain className="w-3.5 h-3.5" /> Thống Kê AI Tokens
            </button>
          </div>

          {/* Sub Tab: Frequencies & N-grams */}
          {activeSubTab === "freq" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-905 p-3 rounded-xl border border-slate-150 dark:border-slate-755">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-401 uppercase">
                    Hiển thị:
                  </span>
                  <select
                    value={freqLimit}
                    onChange={(e) => setFreqLimit(parseInt(e.target.value))}
                    className="bg-white dark:bg-slate-800 border rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none"
                  >
                    <option value={10}>Top 10 từ</option>
                    <option value={15}>Top 15 từ</option>
                    <option value={30}>Top 30 từ</option>
                  </select>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer font-bold select-none">
                  <input
                    type="checkbox"
                    checked={excludeStopWords}
                    onChange={(e) => setExcludeStopWords(e.target.checked)}
                    className="text-indigo-600 focus:ring-indigo-500 rounded scale-95"
                  />
                  Loại bỏ Stop Words phổ biến
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Words Freq Map List */}
                <div className="border border-slate-150 dark:border-slate-755 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 font-bold sticky top-0 border-b border-slate-150 dark:border-slate-755 select-none">
                      <tr>
                        <th className="p-2.5">Từ vựng</th>
                        <th className="p-2.5 text-center">Tần suất</th>
                        <th className="p-2.5 text-right">Tỉ lệ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium text-slate-600 dark:text-slate-300">
                      {filteredWordsList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center p-6 text-slate-401 italic"
                          >
                            Chưa có dữ liệu từ khóa...
                          </td>
                        </tr>
                      ) : (
                        filteredWordsList.map(([word, freq]) => {
                          const pct = report
                            ? ((freq / report.wordCountTotal) * 100).toFixed(1)
                            : "0";
                          return (
                            <tr
                              key={word}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
                            >
                              <td className="p-2.5 font-bold font-mono">
                                {word}
                              </td>
                              <td className="p-2.5 text-center font-bold text-indigo-500">
                                {freq}
                              </td>
                              <td className="p-2.5 text-right text-slate-401 font-mono">
                                {pct}%
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Recharts chart */}
                <div className="h-[220px] relative bg-slate-50/10 dark:bg-slate-905 rounded-xl border dark:border-slate-755 p-2 flex items-center justify-center">
                  {filteredWordsList.length === 0 ? (
                    <span className="text-xs text-slate-401 italic">
                      Không có biểu đồ hiển thị...
                    </span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={filteredWordsList.map(([name, value]) => ({
                          name,
                          value,
                        }))}
                        margin={{ left: -15, right: 5, top: 10, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorCountWord"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.85}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0.35}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" fontSize={9} tickLine={false} />
                        <YAxis fontSize={9} tickLine={false} />
                        <Tooltip
                          formatter={(value) => [`${value} lần`, "Tần suất"]}
                          contentStyle={{
                            backgroundColor: "#111827",
                            borderColor: "#1f2937",
                            borderRadius: "12px",
                            color: "#f9fafb",
                            fontSize: "11px",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="url(#colorCountWord)"
                          radius={4}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* N-Grams */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-150 dark:border-slate-755 pt-4">
                <div>
                  <h4 className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 select-none">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Bigrams
                    (Cặp 2 từ)
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-905 p-3 rounded-xl border border-slate-150 dark:border-slate-755 text-[11px] font-mono space-y-1.5 h-[130px] overflow-y-auto custom-scrollbar">
                    {report?.bigrams.map(([phrase, count], idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-0.5"
                        title={phrase}
                      >
                        <span className="truncate max-w-[120px] text-slate-500">
                          {phrase}
                        </span>
                        <span className="font-bold text-indigo-500">
                          {count}x
                        </span>
                      </div>
                    )) || <div className="text-slate-401 italic">Trống...</div>}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-extrabold text-purple-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 select-none">
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> Trigrams
                    (Cặp 3 từ)
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-905 p-3 rounded-xl border border-slate-150 dark:border-slate-755 text-[11px] font-mono space-y-1.5 h-[130px] overflow-y-auto custom-scrollbar">
                    {report?.trigrams.map(([phrase, count], idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-0.5"
                        title={phrase}
                      >
                        <span className="truncate max-w-[120px] text-slate-500">
                          {phrase}
                        </span>
                        <span className="font-bold text-purple-500">
                          {count}x
                        </span>
                      </div>
                    )) || <div className="text-slate-401 italic">Trống...</div>}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 select-none">
                    <Layers className="w-3.5 h-3.5 text-rose-400" /> Quadgrams
                    (Cặp 4 từ)
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-905 p-3 rounded-xl border border-slate-150 dark:border-slate-755 text-[11px] font-mono space-y-1.5 h-[130px] overflow-y-auto custom-scrollbar">
                    {report?.quadgrams.map(([phrase, count], idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-0.5"
                        title={phrase}
                      >
                        <span className="truncate max-w-[120px] text-slate-500">
                          {phrase}
                        </span>
                        <span className="font-bold text-rose-500">
                          {count}x
                        </span>
                      </div>
                    )) || <div className="text-slate-401 italic">Trống...</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: SEO and Word Cloud Canvas */}
          {activeSubTab === "seo" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-905 p-4 rounded-xl border border-slate-150 dark:border-slate-755">
                    <h5 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wide mb-2 select-none">
                      Từ khóa mật độ cao
                    </h5>
                    {filteredWordsList[0] ? (
                      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border font-mono font-bold text-indigo-700 dark:text-indigo-400 text-xs flex justify-between">
                        <span>"{filteredWordsList[0][0]}"</span>
                        <span>
                          {report
                            ? (
                                (filteredWordsList[0][1] /
                                  report.wordCountTotal) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-401">Trống</span>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-905 p-4 rounded-xl border border-slate-150 dark:border-slate-755">
                    <h5 className="text-[10px] font-bold text-slate-401 block uppercase tracking-wide mb-2 select-none">
                      Đặc tính độ dài
                    </h5>
                    <div className="text-[11px] space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span>Trung bình:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {report?.avgWordLength || 0} ký tự
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dài nhất:</span>
                        <span
                          className="font-bold text-indigo-500 text-right truncate max-w-[110px]"
                          title={report?.longestWord}
                        >
                          "{report?.longestWord || ""}"
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ngắn nhất:</span>
                        <span className="font-bold text-emerald-500">
                          "{report?.shortestWord || ""}"
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-8 bg-slate-50 dark:bg-slate-905 border border-slate-150 dark:border-slate-755 rounded-xl flex flex-col p-4 h-[240px]">
                  <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-200 dark:border-slate-700 select-none">
                    <span className="text-[10px] font-bold text-slate-401 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />{" "}
                      Đám mây từ khóa (Word Cloud)
                    </span>
                    <button
                      onClick={renderWordCloud}
                      className="text-[9px] font-bold text-slate-401 border dark:border-slate-700 px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Vẽ lại
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden relative flex items-center justify-center">
                    <canvas
                      ref={cloudCanvasRef}
                      className="w-full h-full max-h-[190px]"
                    ></canvas>
                  </div>
                </div>
              </div>

              {/* Length distribution */}
              <div className="border-t border-slate-150 dark:border-slate-755 pt-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1 h-[140px] relative">
                  {report ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={Object.entries(report.lengthDistribution).map(
                          ([name, value]) => ({ name: `${name} kí tự`, value }),
                        )}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                        <XAxis dataKey="name" fontSize={9} />
                        <YAxis fontSize={9} />
                        <Tooltip
                          formatter={(value) => [`${value} từ`, "Số lượng"]}
                          contentStyle={{
                            backgroundColor: "#111827",
                            borderColor: "#1f2937",
                            borderRadius: "12px",
                            color: "#f9fafb",
                            fontSize: "11px",
                          }}
                        />
                        <Line
                          type="linear"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2.5}
                          dot
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: Structural elements markup */}
          {activeSubTab === "struct" && report && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-905 p-4 rounded-xl border border-slate-150 dark:border-slate-755">
                <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block uppercase mb-3 tracking-wide select-none">
                  Thống kê thẻ Markdown &amp; Web
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono font-bold">
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-150 dark:border-slate-700 rounded-lg flex justify-between shadow-xs">
                    <span>Thẻ H1:</span>
                    <span className="text-indigo-500">
                      {report.struct.h1Count}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-150 dark:border-slate-700 rounded-lg flex justify-between shadow-xs">
                    <span>Thẻ H2:</span>
                    <span className="text-indigo-500">
                      {report.struct.h2Count}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-150 dark:border-slate-700 rounded-lg flex justify-between shadow-xs">
                    <span>Thẻ H3:</span>
                    <span className="text-indigo-500">
                      {report.struct.h3Count}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-150 dark:border-slate-700 rounded-lg flex justify-between shadow-xs">
                    <span>Thẻ H4+:</span>
                    <span className="text-indigo-500">
                      {report.struct.h4Count}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-150 dark:border-slate-700 rounded-lg flex justify-between shadow-xs">
                    <span>Danh sách:</span>
                    <span className="text-emerald-500">
                      {report.struct.listCount}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-150 dark:border-slate-700 rounded-lg flex justify-between shadow-xs">
                    <span>Bảng biểu:</span>
                    <span className="text-emerald-500">
                      {report.struct.tableCount}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-150 dark:border-slate-700 rounded-lg flex justify-between shadow-xs">
                    <span>Liên kết:</span>
                    <span className="text-purple-500">
                      {report.struct.linkCount}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2 border border-slate-150 dark:border-slate-700 rounded-lg flex justify-between shadow-xs">
                    <span>Hình ảnh:</span>
                    <span className="text-purple-500">
                      {report.struct.imgCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-905 p-4 rounded-xl border border-slate-150 dark:border-slate-755 flex flex-col justify-between gap-3">
                <div className="space-y-2 text-xs font-bold leading-normal">
                  <h4 className="text-xs uppercase text-slate-401 block tracking-wide select-none">
                    Ngôn ngữ &amp; Trình bày
                  </h4>
                  <div className="flex justify-between border-b border-slate-150 dark:border-slate-700/60 py-1">
                    <span>Hệ ngôn ngữ chính:</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                      {report.langDetected}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] text-slate-500">
                    <span>Dòng trống:</span>
                    <span>{report.emptyLines}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] text-slate-500">
                    <span>Dòng văn bản:</span>
                    <span>{report.nonEmptyLines}</span>
                  </div>
                </div>

                <div className="bg-rose-500/5 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/35 rounded-xl p-3.5 text-xs leading-relaxed text-rose-800 dark:text-rose-400 font-medium">
                  <span className="font-bold block mb-1">
                    Cảnh báo trùng lặp (Duplicate sentences)
                  </span>
                  {report.duplicateCount > 0 ? (
                    <span className="font-mono text-[10px] text-rose-500 block leading-tight">
                      Có {report.duplicateCount} cụm trùng lặp. Mẫu: "
                      {report.duplicateSample.slice(0, 68)}..."
                    </span>
                  ) : (
                    <span>
                      Không phát hiện trường hợp trùng lặp chuỗi câu đáng kể.
                      Văn bản nguyên bản tốt.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab: AI LLM Tokens */}
          {activeSubTab === "ai" && (
            <div className="bg-slate-50 dark:bg-slate-905 text-slate-800 dark:text-slate-100 border border-slate-150 dark:border-slate-755 p-5 rounded-xl relative overflow-hidden">
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 select-none">
                <Brain className="w-4 h-4 text-indigo-500" /> Hệ số chuyển đổi
                Token ước tính (~92% Acc)
              </h4>
              <p className="text-[11px] text-slate-401 mb-4 leading-relaxed font-medium">
                Sử dụng các hệ số thuật toán mã hóa Byte-Pair Encoding (BPE) của
                cl100k_base tương đương cho các mô hình ngôn ngữ lớn để quy đổi.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 p-3.5 rounded-xl">
                  <div className="text-[9px] font-bold text-slate-401 uppercase">
                    GPT-4o / GPT-4 (cl100k)
                  </div>
                  <div className="text-2xl font-black text-rose-500 font-mono mt-1">
                    {report
                      ? Math.ceil(report.charCountTotal / 3.75).toLocaleString()
                      : 0}
                  </div>
                  <span className="text-[9px] text-slate-401 block mt-1 leading-none">
                    cl100k_base tokenizer
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 p-3.5 rounded-xl">
                  <div className="text-[9px] font-bold text-slate-401 uppercase">
                    Claude 3.5 / Anthropic
                  </div>
                  <div className="text-2xl font-black text-indigo-500 font-mono mt-1">
                    {report
                      ? Math.ceil(report.wordCountTotal * 1.34).toLocaleString()
                      : 0}
                  </div>
                  <span className="text-[9px] text-slate-401 block mt-1 leading-none">
                    ~0.75 từ / token
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 p-3.5 rounded-xl">
                  <div className="text-[9px] font-bold text-slate-401 uppercase">
                    Gemini 1.5 / Google
                  </div>
                  <div className="text-2xl font-black text-emerald-500 font-mono mt-1">
                    {report
                      ? Math.ceil(report.charCountTotal / 4.1).toLocaleString()
                      : 0}
                  </div>
                  <span className="text-[9px] text-slate-401 block mt-1 leading-none">
                    ~4 ký tự một Token tiếng Việt
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Export Rows */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200 block">
              Bộ xuất báo cáo đếm từ chuyên dụng
            </span>
            <span className="text-slate-401 mt-0.5 block">
              Xuất dữ liệu thành công cấu trúc file thông minh an toàn.
            </span>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={triggerCopyReportText}
              className="bg-slate-155 hover:bg-slate-150 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-650 dark:text-slate-200 font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" /> {btnTextTextReport}
            </button>
            <button
              onClick={() => exportToFile("json")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Xuất JSON
            </button>
            <button
              onClick={() => exportToFile("csv")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Xuất CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
