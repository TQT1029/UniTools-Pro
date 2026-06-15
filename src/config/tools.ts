import { ToolDefinition } from '../types';

export const TOOL_CATEGORIES = [
  { id: 'math', name: 'Toán Học & Kĩ Thuật', count: 2 },
  { id: 'text', name: 'Xử Lý Văn Bản', count: 4 },
  { id: 'conversion', name: 'Quy Đổi Đo Lường', count: 1 },
  { id: 'dev_pragmatic', name: 'Tiện Ích Đa Năng', count: 1 },
  { id: 'specialized', name: 'Công Cụ Đặc Thù', count: 5 }
];

export const ALL_TOOLS: ToolDefinition[] = [
  {
    id: 'math_cas_grapher',
    name: 'Giải Toán & Đồ Thị',
    category: 'math',
    description: 'Trình giải toán CAS, KaTeX, vẽ đồ thị 2D động & 3D Vector xoay chiều.',
    icon: 'activity'
  },
  {
    id: 'math_type_wysiwyg',
    name: 'Soạn Thảo Công Thức',
    category: 'math',
    description: 'Biên soạn công thức trực quan, ma trận mở rộng, xuất LaTeX và MathML.',
    icon: 'binary'
  },
  {
    id: 'count_word_pro',
    name: 'Phân Tích Đếm Từ',
    category: 'text',
    description: 'Đếm chữ qua Web Worker, thống kê tần suất Recharts & Word Cloud.',
    icon: 'file-text'
  },
  {
    id: 'text_transformer_studio',
    name: 'Lọc & Biến Đổi Chữ',
    category: 'text',
    description: 'Xây dựng chuỗi biến đổi dữ liệu, làm sạch thô, khử tiếng Việt, trích xuất SEO.',
    icon: 'wand'
  },
  {
    id: 'translation_tool',
    name: 'Dịch Thuật Đa Ngôn Ngữ',
    category: 'text',
    description: 'Hỗ trợ dịch nhanh qua Google Translate & Microsoft API với tùy chọn Exchange.',
    icon: 'languages'
  },
  {
    id: 'text_to_speech',
    name: 'Văn Bản → Giọng Nói',
    category: 'text',
    description: 'Chuyển văn bản thành giọng đọc đa ngôn ngữ, hỗ trợ tùy biến và tải file MP3.',
    icon: 'volume2'
  },
  {
    id: 'universal_converter',
    name: 'Quy Đổi Đơn Vị',
    category: 'conversion',
    description: 'Quy đổi 11 chuyên ngành vật lý, cơ học, năng lượng, dải PPI và biểu đồ Recharts.',
    icon: 'sliders'
  },
  {
    id: 'advanced_pragmatic_tools',
    name: 'Bộ Lập Trình Đa Năng',
    category: 'dev_pragmatic',
    description: 'JSON Formatter, Base64/URL, SHA-256 Async, Password Safe, VAT Tax, BMI.',
    icon: 'wrench'
  },
  {
    id: 'video_dynamics',
    name: 'Thời Lượng Xem Video',
    category: 'specialized',
    description: 'Ước tính dọn dẹp thời gian thi xem video dưới tốc phát và vẽ Recharts giảm lùi tự động.',
    icon: 'play'
  },
  {
    id: 'coc_progress_builder',
    name: 'Clash of Clans Calc',
    category: 'specialized',
    description: 'Thiết kế tiến trình nỗ lực nâng cấp nhà bằng bình thuốc Potion, vẽ Burn-down line.',
    icon: 'layers'
  },
  {
    id: 'date_diagnostics',
    name: 'Lịch & Ngày Tháng',
    category: 'specialized',
    description: 'Tính chênh lệch ngày, tuổi sinh học, cung hoàng đạo và quy đổi thời lượng.',
    icon: 'calendar'
  },
  {
    id: 'compounded_investment',
    name: 'Lãi Kép & Tài Chính',
    category: 'specialized',
    description: 'Mô hình thặng dư tài sản qua lãi suất kép, so sánh biểu đồ đầu tư tích lũy.',
    icon: 'trending-up'
  },
  {
    id: 'pomodoro_productivity',
    name: 'Đồng Hồ Pomodoro',
    category: 'specialized',
    description: 'Đếm ngược Pomodoro tập trung, tiếng chuông điện tử, thống kê Recharts Pie.',
    icon: 'stopwatch'
  }
];
