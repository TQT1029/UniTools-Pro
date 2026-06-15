import React, { useState, useEffect, useRef } from 'react';
import { MathTypeSymbol } from '../types';
import {
  Keyboard,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Table,
  Sparkles,
  Clipboard,
  Check
} from 'lucide-react';

export default function MathTypeWYSIWYG() {
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [outputView, setOutputView] = useState<'latex' | 'mathml' | 'unicodemath'>('latex');
  const [zoom, setZoom] = useState(100);
  const [mirrorValue, setMirrorValue] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Modal Matrix properties
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [matrixRows, setMatrixRows] = useState(3);
  const [matrixCols, setMatrixCols] = useState(3);
  const [matrixEnv, setMatrixEnv] = useState<'bmatrix' | 'matrix' | 'vmatrix' | 'Bmatrix'>('bmatrix');

  const canvasRef = useRef<HTMLDivElement>(null);

  const categories = {
    basic: 'Phép Toán Cơ Bản',
    greek: 'Chữ Hy Lạp',
    calculus: 'Giải Tích & Cơ Học',
    linear_algebra: 'Đại Số Tuyến Tính',
    logic: 'Logic Toán',
    set_theory: 'Tập Hợp',
    geometry: 'Hình Học & Thống Kê',
    structural: 'Cấu Trúc Hộp Slot'
  };

  const symbolRegistry: MathTypeSymbol[] = [
    // Basic math / Operators
    { id: 'b_minus', display: '−', latex: '-', category: 'basic', tags: ['tru', 'minus', 'sub'] },
    { id: 'b_times', display: '×', latex: '\\times', category: 'basic', tags: ['nhan', 'times', 'mul'] },
    { id: 'b_div', display: '÷', latex: '\\div', category: 'basic', tags: ['chia', 'div', 'divide'] },
    { id: 'b_neq', display: '≠', latex: '\\neq', category: 'basic', tags: ['khac', 'not equal', 'neq'] },
    { id: 'b_approx', display: '≈', latex: '\\approx', category: 'basic', tags: ['xap xi', 'approximate', 'approx'] },
    { id: 'b_infty', display: '∞', latex: '\\infty', category: 'basic', tags: ['vo cuc', 'vo han', 'infinity'] },
    { id: 'b_pm', display: '±', latex: '\\pm', category: 'basic', tags: ['cong tru', 'pm'] },
    { id: 'b_mp', display: '∓', latex: '\\mp', category: 'basic', tags: ['tru cong', 'mp'] },
    { id: 'b_propto', display: '∝', latex: '\\propto', category: 'basic', tags: ['ty le thuan', 'proportional'] },
    { id: 'b_equiv', display: '≡', latex: '\\equiv', category: 'basic', tags: ['dong du', 'equivalent', 'equiv'] },
    { id: 'b_leq', display: '≤', latex: '\\le', category: 'basic', tags: ['nho hon bang', 'leq'] },
    { id: 'b_geq', display: '≥', latex: '\\ge', category: 'basic', tags: ['lon hon bang', 'geq'] },

    // Greek symbols (Lowercase)
    { id: 'g_alpha', display: 'α', latex: '\\alpha', category: 'greek', tags: ['alpha', 'hy lap', 'goc'] },
    { id: 'g_beta', display: 'β', latex: '\\beta', category: 'greek', tags: ['beta', 'hy lap'] },
    { id: 'g_gamma', display: 'γ', latex: '\\gamma', category: 'greek', tags: ['gamma', 'hy lap'] },
    { id: 'g_delta', display: 'δ', latex: '\\delta', category: 'greek', tags: ['delta', 'sai so'] },
    { id: 'g_epsilon', display: 'ε', latex: '\\epsilon', category: 'greek', tags: ['epsilon'] },
    { id: 'g_zeta', display: 'ζ', latex: '\\zeta', category: 'greek', tags: ['zeta'] },
    { id: 'g_eta', display: 'η', latex: '\\eta', category: 'greek', tags: ['eta', 'hieu suat'] },
    { id: 'g_theta', display: 'θ', latex: '\\theta', category: 'greek', tags: ['theta', 'goc'] },
    { id: 'g_iota', display: 'ι', latex: '\\iota', category: 'greek', tags: ['iota'] },
    { id: 'g_kappa', display: 'κ', latex: '\\kappa', category: 'greek', tags: ['kappa'] },
    { id: 'g_lambda', display: 'λ', latex: '\\lambda', category: 'greek', tags: ['lambda', 'buoc song'] },
    { id: 'g_mu', display: 'μ', latex: '\\mu', category: 'greek', tags: ['mu', 'ma sat'] },
    { id: 'g_nu', display: 'ν', latex: '\\nu', category: 'greek', tags: ['nu', 'tan so'] },
    { id: 'g_xi', display: 'ξ', latex: '\\xi', category: 'greek', tags: ['xi'] },
    { id: 'g_pi', display: 'π', latex: '\\pi', category: 'greek', tags: ['pi', '3.14'] },
    { id: 'g_rho', display: 'ρ', latex: '\\rho', category: 'greek', tags: ['rho', 'khoi luong rieng'] },
    { id: 'g_sigma', display: 'σ', latex: '\\sigma', category: 'greek', tags: ['sigma', 'do lech chuan'] },
    { id: 'g_tau', display: 'τ', latex: '\\tau', category: 'greek', tags: ['tau', 'thoi gian'] },
    { id: 'g_upsilon', display: 'υ', latex: '\\upsilon', category: 'greek', tags: ['upsilon'] },
    { id: 'g_phi', display: 'φ', latex: '\\phi', category: 'greek', tags: ['phi'] },
    { id: 'g_chi', display: 'χ', latex: '\\chi', category: 'greek', tags: ['chi'] },
    { id: 'g_psi', display: 'ψ', latex: '\\psi', category: 'greek', tags: ['psi'] },
    { id: 'g_omega', display: 'ω', latex: '\\omega', category: 'greek', tags: ['omega', 'tan so goc'] },

    // Greek symbols (Uppercase)
    { id: 'g_ALPHA', display: 'Α', latex: 'A', category: 'greek', tags: ['alpha hoa'] },
    { id: 'g_BETA', display: 'Β', latex: 'B', category: 'greek', tags: ['beta hoa'] },
    { id: 'g_GAMMA', display: 'Γ', latex: '\\Gamma', category: 'greek', tags: ['gamma hoa'] },
    { id: 'g_DELTA', display: 'Δ', latex: '\\Delta', category: 'greek', tags: ['delta hoa', 'tam giac'] },
    { id: 'g_EPSILON', display: 'Ε', latex: 'E', category: 'greek', tags: ['epsilon hoa'] },
    { id: 'g_ZETA', display: 'Ζ', latex: 'Z', category: 'greek', tags: ['zeta hoa'] },
    { id: 'g_ETA', display: 'Η', latex: 'H', category: 'greek', tags: ['eta hoa'] },
    { id: 'g_THETA', display: 'Θ', latex: '\\Theta', category: 'greek', tags: ['theta hoa'] },
    { id: 'g_IOTA', display: 'Ι', latex: 'I', category: 'greek', tags: ['iota hoa'] },
    { id: 'g_KAPPA', display: 'Κ', latex: 'K', category: 'greek', tags: ['kappa hoa'] },
    { id: 'g_LAMBDA', display: 'Λ', latex: '\\Lambda', category: 'greek', tags: ['lambda hoa'] },
    { id: 'g_MU', display: 'Μ', latex: 'M', category: 'greek', tags: ['mu hoa'] },
    { id: 'g_NU', display: 'Ν', latex: 'N', category: 'greek', tags: ['nu hoa'] },
    { id: 'g_XI', display: 'Ξ', latex: '\\Xi', category: 'greek', tags: ['xi hoa'] },
    { id: 'g_PI', display: 'Π', latex: '\\Pi', category: 'greek', tags: ['pi hoa'] },
    { id: 'g_RHO', display: 'Ρ', latex: 'P', category: 'greek', tags: ['rho hoa'] },
    { id: 'g_SIGMA', display: 'Σ', latex: '\\Sigma', category: 'greek', tags: ['sigma hoa', 'tong'] },
    { id: 'g_TAU', display: 'Τ', latex: 'T', category: 'greek', tags: ['tau hoa'] },
    { id: 'g_UPSILON', display: 'Υ', latex: '\\Upsilon', category: 'greek', tags: ['upsilon hoa'] },
    { id: 'g_PHI', display: 'Φ', latex: '\\Phi', category: 'greek', tags: ['phi hoa'] },
    { id: 'g_CHI', display: 'Χ', latex: 'X', category: 'greek', tags: ['chi hoa'] },
    { id: 'g_PSI', display: 'Ψ', latex: '\\Psi', category: 'greek', tags: ['psi hoa'] },
    { id: 'g_OMEGA', display: 'Ω', latex: '\\Omega', category: 'greek', tags: ['omega hoa', 'ohm'] },

    // Calculus & mechanics / Operators
    { id: 'cal_sum', display: '∑', latex: '\\sum ', category: 'calculus', tags: ['tong', 'sum'] },
    { id: 'cal_prod', display: '∏', latex: '\\prod ', category: 'calculus', tags: ['tich', 'product'] },
    { id: 'cal_int', display: '∫', latex: '\\int ', category: 'calculus', tags: ['tich phan', 'integral', 'int'] },
    { id: 'cal_iint', display: '∬', latex: '\\iint ', category: 'calculus', tags: ['tich phan kep', 'double integral'] },
    { id: 'cal_iiint', display: '∭', latex: '\\iiint ', category: 'calculus', tags: ['tich phan bo ba', 'triple integral'] },
    { id: 'cal_oint', display: '∮', latex: '\\oint ', category: 'calculus', tags: ['tich phan duong', 'contour integral'] },
    { id: 'cal_partial', display: '∂', latex: '\\partial ', category: 'calculus', tags: ['dao ham rieng', 'partial'] },
    { id: 'cal_nabla', display: '∇', latex: '\\nabla ', category: 'calculus', tags: ['toan tu nabla', 'gradient'] },
    { id: 'cal_infty', display: '∞', latex: '\\infty', category: 'calculus', tags: ['vo cuc', 'infinity'] },
    { id: 'cal_approx', display: '≈', latex: '\\approx', category: 'calculus', tags: ['xap xi', 'approx'] },
    { id: 'cal_neq', display: '≠', latex: '\\neq', category: 'calculus', tags: ['khac', 'neq'] },
    { id: 'cal_leq', display: '≤', latex: '\\le', category: 'calculus', tags: ['leq'] },
    { id: 'cal_geq', display: '≥', latex: '\\ge', category: 'calculus', tags: ['geq'] },

    // Linear algebra / Vector
    { id: 'la_vec', display: '→', latex: '\\vec{}', category: 'linear_algebra', tags: ['vector', 'vec'] },
    { id: 'la_dot', display: '⋅', latex: '\\cdot', category: 'linear_algebra', tags: ['tich vo huong', 'dot product'] },
    { id: 'la_cross', display: '×', latex: '\\times', category: 'linear_algebra', tags: ['tich co huong', 'cross product'] },
    { id: 'la_otimes', display: '⊗', latex: '\\otimes', category: 'linear_algebra', tags: ['tich tap', 'tensor product'] },
    { id: 'la_oplus', display: '⊕', latex: '\\oplus', category: 'linear_algebra', tags: ['cong truc tiep', 'direct sum'] },

    // Logic
    { id: 'log_forall', display: '∀', latex: '\\forall ', category: 'logic', tags: ['voi moi', 'forall'] },
    { id: 'log_exists', display: '∃', latex: '\\exists ', category: 'logic', tags: ['ton tai', 'exists'] },
    { id: 'log_and', display: '∧', latex: '\\wedge ', category: 'logic', tags: ['va', 'logic and'] },
    { id: 'log_or', display: '∨', latex: '\\vee ', category: 'logic', tags: ['hoac', 'logic or'] },
    { id: 'log_not', display: '¬', latex: '\\neg ', category: 'logic', tags: ['phu dinh', 'not'] },
    { id: 'log_implies', display: '⇒', latex: '\\implies ', category: 'logic', tags: ['suy ra', 'implies'] },
    { id: 'log_iff', display: '⇔', latex: '\\iff ', category: 'logic', tags: ['tuong duong', 'iff'] },

    // Set theory
    { id: 'set_in', display: '∈', latex: '\\in ', category: 'set_theory', tags: ['thuoc', 'element of'] },
    { id: 'set_notin', display: '∉', latex: '\\notin ', category: 'set_theory', tags: ['khong thuoc', 'not element of'] },
    { id: 'set_subset', display: '⊂', latex: '\\subset ', category: 'set_theory', tags: ['tap con', 'subset'] },
    { id: 'set_subseteq', display: '⊆', latex: '\\subseteq ', category: 'set_theory', tags: ['tap con hoac bang'] },
    { id: 'set_union', display: '∪', latex: '\\cup ', category: 'set_theory', tags: ['hop', 'union'] },
    { id: 'set_inter', display: '∩', latex: '\\cap ', category: 'set_theory', tags: ['giao', 'intersection'] },
    { id: 'set_empty', display: '∅', latex: '\\varnothing ', category: 'set_theory', tags: ['tap rong', 'empty set'] },
    { id: 'set_N', display: 'ℕ', latex: '\\mathbb{N}', category: 'set_theory', tags: ['so tu nhien'] },
    { id: 'set_Z', display: 'ℤ', latex: '\\mathbb{Z}', category: 'set_theory', tags: ['so nguyen'] },
    { id: 'set_R', display: 'ℝ', latex: '\\mathbb{R}', category: 'set_theory', tags: ['so thuc'] },

    // Geometry & statistics
    { id: 'geo_angle', display: '∠', latex: '\\angle ', category: 'geometry', tags: ['goc', 'angle'] },
    { id: 'geo_perp', display: '⊥', latex: '\\perp ', category: 'geometry', tags: ['vuong goc', 'perpendicular'] },
    { id: 'geo_parallel', display: '∥', latex: '\\parallel ', category: 'geometry', tags: ['song song', 'parallel'] },
    { id: 'geo_triangle', display: '△', latex: '\\triangle ', category: 'geometry', tags: ['tam giac', 'triangle'] },
    { id: 'st_mu', display: 'μ', latex: '\\mu', category: 'geometry', tags: ['ky vong', 'trung binh'] },
    { id: 'st_sigma', display: 'σ', latex: '\\sigma', category: 'geometry', tags: ['do lech chuan'] }
  ];

  const structuralSchema = {
    fraction: {
      type: 'fraction',
      html: `<span class="v-slot" contenteditable="true" data-slot="num"></span><span class="v-fraction-line"></span><span class="v-slot" contenteditable="true" data-slot="den"></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `\\frac{${compiler(node.querySelector('[data-slot="num"]'))}}{${compiler(node.querySelector('[data-slot="den"]'))}}`
    },
    sqrt: {
      type: 'sqrt',
      html: `<span class="v-sqrt-bar v-slot" contenteditable="true" data-slot="core"></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `\\sqrt{${compiler(node.querySelector('[data-slot="core"]'))}}`
    },
    rootn: {
      type: 'rootn',
      html: `<span class="v-slot text-[10px] font-bold text-purple-500" contenteditable="true" data-slot="index"></span><span class="v-sqrt-bar v-slot" contenteditable="true" data-slot="core"></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `\\sqrt[${compiler(node.querySelector('[data-slot="index"]'))}]{${compiler(node.querySelector('[data-slot="core"]'))}}`
    },
    superscript: {
      type: 'superscript',
      html: `<span class="v-slot text-[11px]" contenteditable="true" data-slot="sup"></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `^{${compiler(node.querySelector('[data-slot="sup"]'))}}`
    },
    subscript: {
      type: 'subscript',
      html: `<span class="v-slot text-[11px]" contenteditable="true" data-slot="sub"></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `_{${compiler(node.querySelector('[data-slot="sub"]'))}}`
    },
    subsup: {
      type: 'subsup',
      html: `<span class="v-subsup-container"><span class="v-slot text-[10px]" contenteditable="true" data-slot="sup"></span><span class="v-slot text-[10px]" contenteditable="true" data-slot="sub"></span></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `_{${compiler(node.querySelector('[data-slot="sub"]'))}}^{${compiler(node.querySelector('[data-slot="sup"]'))}}`
    },
    vector: {
      type: 'vector',
      html: `<span class="v-vector-box"><span class="v-vector-arrow">→</span><span class="v-slot" contenteditable="true" data-slot="core"></span></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `\\vec{${compiler(node.querySelector('[data-slot="core"]'))}}`
    },
    'integral-def': {
      type: 'integral-def',
      html: `<span class="v-integral-sign">∫</span><span class="v-integral-bounds"><span class="v-slot" contenteditable="true" data-slot="up"></span><span class="v-slot" contenteditable="true" data-slot="down"></span></span><span class="v-slot" contenteditable="true" data-slot="core"></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `\\int_{${compiler(node.querySelector('[data-slot="down"]'))}}^{${compiler(node.querySelector('[data-slot="up"]'))}} ${compiler(node.querySelector('[data-slot="core"]'))}`
    },
    summation: {
      type: 'summation',
      html: `<span class="flex flex-col items-center justify-center leading-none"><span class="v-slot text-[10px]" contenteditable="true" data-slot="up"></span><span class="font-bold text-sm my-0.5 text-purple-600">∑</span><span class="v-slot text-[10px]" contenteditable="true" data-slot="down"></span></span><span class="v-slot" contenteditable="true" data-slot="core"></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `\\sum_{${compiler(node.querySelector('[data-slot="down"]'))}}^{${compiler(node.querySelector('[data-slot="up"]'))}} ${compiler(node.querySelector('[data-slot="core"]'))}`
    },
    limit: {
      type: 'limit',
      html: `<span class="flex flex-col items-center justify-center leading-none"><span class="font-bold text-xs text-purple-600">lim</span><span class="v-slot text-[9px]" contenteditable="true" data-slot="down"></span></span><span class="v-slot" contenteditable="true" data-slot="core"></span>`,
      toLatex: (compiler: any, node: HTMLElement) =>
        `\\lim_{${compiler(node.querySelector('[data-slot="down"]'))}} ${compiler(node.querySelector('[data-slot="core"]'))}`
    },
    piecewise: {
      type: 'piecewise',
      html: `<span class="v-bracket-side select-none text-purple-600">{</span><span class="v-matrix-grid" style="grid-template-columns: repeat(2, minmax(40px, 1fr));" data-rows="2" data-cols="2">${Array.from({ length: 4 }, (_, i) => `<span class="v-slot" contenteditable="true" data-cell="${i}"></span>`).join('')}</span>`,
      toLatex: (compiler: any, node: HTMLElement) => {
        const grid = node.querySelector('.v-matrix-grid');
        if (!grid) return '';
        const r = parseInt(grid.getAttribute('data-rows') || '2');
        const c = parseInt(grid.getAttribute('data-cols') || '2');
        const cells = grid.querySelectorAll('[data-cell]');
        let res = '\\begin{cases} ';
        for (let i = 0; i < r; i++) {
          let row: string[] = [];
          for (let j = 0; j < c; j++) {
            row.push(compiler(cells[i * c + j]));
          }
          res += row.join(' & ') + (i < r - 1 ? ' \\\\ ' : '');
        }
        return res + ' \\end{cases}';
      }
    }
  };

  useEffect(() => {
    // Inject Custom layout math styles once as styling rule
    if (!document.getElementById('mathtype-component-injected-css')) {
      const s = document.createElement('style');
      s.id = 'mathtype-component-injected-css';
      s.innerHTML = `
        .visual-stage { min-height: 280px; padding: 25px; outline: none; line-height: 2.8; font-size: 1.65rem; box-sizing: border-box; }
        .v-node { display: inline-flex; vertical-align: middle; margin: 0 4px; border: 1.5px dashed rgba(168,85,247,0.45); border-radius: 6px; padding: 3px; position: relative; background: rgba(168,85,247,0.02); }
        .v-slot { min-width: 28px; min-height: 32px; display: inline-block; border: 1.5px dotted #94a3b8; margin: 2px; padding: 2px 6px; outline: none; background: #fff; text-align: center; color: #0f172a; border-radius: 4px; font-style: normal; font-size: 1.35rem; line-height: 1.5; transition: all 0.15s; }
        .dark .v-slot { background: #1e293b; color: #f8fafc; border-color: #475569; }
        .v-slot:focus { border-color: #a855f7; background: rgba(168,85,247,0.06); box-shadow: 0 0 0 3px rgba(168,85,247,0.15); }
        .v-slot:empty::before { content: '■'; color: #cbd5e1; font-size: 0.85rem; opacity: 0.45; pointer-events: none; }
        .dark .v-slot:empty::before { color: #475569; }
        .v-fraction { flex-direction: column; align-items: center; justify-content: center; padding: 4px 6px; }
        .v-fraction-line { width: 100%; height: 2px; background: #0f172a; margin: 4px 0; }
        .dark .v-fraction-line { background: #f8fafc; }
        .v-sqrt { align-items: center; padding-left: 18px; }
        .v-sqrt::before { content: '√'; position: absolute; left: 4px; font-weight: bold; color: #a855f7; font-size: 1.5rem; }
        .v-sqrt-bar { border-top: 2px solid #0f172a; }
        .dark .v-sqrt-bar { border-top-color: #f8fafc; }
        .v-scalable-bracket-container { display: inline-flex; align-items: center; margin: 0 4px; vertical-align: middle; position: relative; border: 1.5px solid transparent; border-radius: 6px; }
        .v-scalable-bracket-container.focused-matrix { border-color: rgba(168,85,247,0.5); background: rgba(168,85,247,0.03); }
        .v-bracket-side { font-size: 2.3rem; font-weight: 100; color: #a855f7; display: inline-flex; align-items: center; height: 100%; user-select: none; transform: scaleY(1.2); }
        .v-matrix-grid { display: inline-grid; gap: 8px; padding: 8px; align-items: center; justify-items: center; }
        .v-subsup-container { display: inline-flex; flex-direction: column; vertical-align: middle; }
        .v-vector-box { display: inline-flex; flex-direction: column; align-items: center; position: relative; padding-top: 14px; }
        .v-vector-arrow { position: absolute; top: -3px; left: 50%; transform: translateX(-50%); font-size: 0.95rem; color: #a855f7; font-weight: bold; }
        .v-integral-sign { font-size: 2.5rem; color: #a855f7; margin-right: 4px; line-height: 1; }
        .v-integral-bounds { display: inline-flex; flex-direction: column; justify-content: space-between; font-size: 0.75rem; margin-right: 6px; height: 42px; }
      `;
      document.head.appendChild(s);
    }

    // Spatial Navigation hooks
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvasRef.current || !canvasRef.current.contains(document.activeElement)) return;
      if (e.key === 'Tab') {
        e.preventDefault();
        const slots = Array.from(canvasRef.current.querySelectorAll('.v-slot')) as HTMLElement[];
        if (slots.length === 0) return;
        const currentIdx = slots.indexOf(document.activeElement as HTMLElement);
        const nextIdx = currentIdx + (e.shiftKey ? -1 : 1);
        if (nextIdx >= 0 && nextIdx < slots.length) {
          slots[nextIdx].focus();
        } else if (nextIdx >= slots.length) {
          const textNode = document.createTextNode(' ');
          canvasRef.current.appendChild(textNode);
          const range = document.createRange();
          range.setStartAfter(textNode);
          range.collapse(true);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerPipelineSync = () => {
    if (!canvasRef.current) return;
    const computedLatex = traverseDOMToLatex(canvasRef.current);
    
    // Live update outputs mirroring
    if (outputView === 'latex') {
      setMirrorValue(computedLatex);
    } else if (outputView === 'mathml') {
      setMirrorValue(`<math xmlns="http://www.w3.org/1998/Math/MathML">\n  <semantics>\n    <mrow>\n      <mtext>${computedLatex || '...'}</mtext>\n    </mrow>\n  </semantics>\n</math>`);
    } else {
      setMirrorValue(computedLatex
        .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\gamma/g, 'γ')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\omega/g, 'ω')
        .replace(/\\pi/g, 'π')
        .replace(/\\int/g, '∫')
        .replace(/\\sum/g, '∑')
      );
    }
  };

  useEffect(() => {
    triggerPipelineSync();
  }, [outputView]);

  const traverseDOMToLatex = (element: ChildNode): string => {
    let latex = '';
    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        latex += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const type = el.getAttribute('data-type');

        if (type && structuralSchema[type as keyof typeof structuralSchema]) {
          latex += structuralSchema[type as keyof typeof structuralSchema].toLatex(
            (elem: HTMLElement) => traverseDOMToLatex(elem),
            el
          );
        } else if (type === 'matrix-container') {
          const rows = parseInt(el.getAttribute('data-rows') || '1');
          const cols = parseInt(el.getAttribute('data-cols') || '1');
          const env = el.getAttribute('data-env') || 'bmatrix';

          latex += `\\begin{${env}}`;
          const cells = el.querySelectorAll('[data-cell]');
          for (let r = 0; r < rows; r++) {
            let rowPieces: string[] = [];
            for (let c = 0; c < cols; c++) {
              const cell = cells[r * cols + c] as HTMLElement;
              rowPieces.push(traverseDOMToLatex(cell));
            }
            latex += rowPieces.join(' & ');
            if (r < rows - 1) latex += ' \\\\ ';
          }
          latex += `\\end{${env}}`;
        } else {
          latex += traverseDOMToLatex(el);
        }
      }
    });
    return latex;
  };

  const insertTextToken = (text: string) => {
    canvasRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const tNode = document.createTextNode(text);
    range.insertNode(tNode);
    range.setStartAfter(tNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    triggerPipelineSync();
  };

  const insertStructuralTemplateNode = (type: keyof typeof structuralSchema) => {
    canvasRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const schema = structuralSchema[type];
    const wrapper = document.createElement('span');
    wrapper.className = `v-node v-${type}`;
    wrapper.setAttribute('data-type', type);
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.innerHTML = schema.html;

    range.insertNode(wrapper);
    focusFirstAvailableSlotInNode(wrapper);
    triggerPipelineSync();
  };

  const insertMatrixTemplateNode = (rows: number, cols: number, env: string) => {
    canvasRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const container = document.createElement('span');
    container.className = 'v-scalable-bracket-container';
    container.setAttribute('data-type', 'matrix-container');
    container.setAttribute('data-env', env);
    container.setAttribute('data-rows', String(rows));
    container.setAttribute('data-cols', String(cols));
    container.setAttribute('contenteditable', 'false');

    let leftB = '[', rightB = ']';
    if (env === 'matrix') { leftB = '('; rightB = ')'; }
    if (env === 'vmatrix') { leftB = '|'; rightB = '|'; }
    if (env === 'Bmatrix') { leftB = '{'; rightB = '}'; }

    container.innerHTML = `
      <span class="v-bracket-side select-none text-purple-500 font-extrabold mr-1">${leftB}</span>
      <span class="v-matrix-grid" style="grid-template-columns: repeat(${cols}, minmax(34px, 1fr));">
        ${Array.from({ length: rows * cols }, (_, i) => `<span class="v-slot" contenteditable="true" data-cell="${i}"></span>`).join('')}
      </span>
      <span class="v-bracket-side select-none text-purple-500 font-extrabold ml-1">${rightB}</span>
    `;

    range.insertNode(container);
    focusFirstAvailableSlotInNode(container);
    triggerPipelineSync();
  };

  const focusFirstAvailableSlotInNode = (container: HTMLElement) => {
    const firstSlot = container.querySelector('.v-slot') as HTMLElement;
    if (firstSlot) {
      setTimeout(() => {
        firstSlot.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(firstSlot);
        range.collapse(true);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }, 20);
    }
  };

  const modifyMatrixStructure = (action: 'row-above' | 'row-below' | 'col-left' | 'col-right' | 'row-delete' | 'col-delete') => {
    const activeSlot = document.activeElement as HTMLElement;
    if (!activeSlot || (!activeSlot.hasAttribute('data-cell') && !activeSlot.closest('.v-matrix-grid'))) return;

    const grid = activeSlot.closest('.v-matrix-grid') as HTMLElement;
    const container = grid.closest('[data-type="matrix-container"]') as HTMLElement;
    if (!grid || !container) return;

    let rows = parseInt(container.getAttribute('data-rows') || '1');
    let cols = parseInt(container.getAttribute('data-cols') || '1');

    const cellIdx = parseInt(activeSlot.getAttribute('data-cell') || '0');
    const currentRow = Math.floor(cellIdx / cols);
    const currentCol = cellIdx % cols;

    let newRows = rows;
    let newCols = cols;

    if (action === 'row-above' || action === 'row-below') newRows++;
    if (action === 'col-left' || action === 'col-right') newCols++;
    if (action === 'row-delete' && rows > 1) newRows--;
    if (action === 'col-delete' && cols > 1) newCols--;

    if (newRows === rows && newCols === cols) return;

    // Cache content from old slots
    const currentSlots = Array.from(grid.querySelectorAll('[data-cell]')) as HTMLElement[];
    const dataMatrix = Array.from({ length: rows }, () => Array(cols).fill(''));
    currentSlots.forEach((slot) => {
      const idx = parseInt(slot.getAttribute('data-cell') || '0');
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      dataMatrix[r][c] = slot.innerHTML;
    });

    // Splice matrix mapping
    if (action === 'row-above') dataMatrix.splice(currentRow, 0, Array(cols).fill(''));
    if (action === 'row-below') dataMatrix.splice(currentRow + 1, 0, Array(cols).fill(''));
    if (action === 'col-left') dataMatrix.forEach(r => r.splice(currentCol, 0, ''));
    if (action === 'col-right') dataMatrix.forEach(r => r.splice(currentCol + 1, 0, ''));
    if (action === 'row-delete') dataMatrix.splice(currentRow, 1);
    if (action === 'col-delete') dataMatrix.forEach(r => r.splice(currentCol, 1));

    container.setAttribute('data-rows', String(newRows));
    container.setAttribute('data-cols', String(newCols));
    grid.style.gridTemplateColumns = `repeat(${newCols}, minmax(34px, 1fr))`;

    let cellsHTML = '';
    let counter = 0;
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const val = dataMatrix[r]?.[c] || '';
        cellsHTML += `<span class="v-slot" contenteditable="true" data-cell="${counter}">${val}</span>`;
        counter++;
      }
    }
    grid.innerHTML = cellsHTML;

    // Shift focus safely
    const targetIdx = Math.min(counter - 1, currentRow * newCols + currentCol);
    setTimeout(() => {
      const targetSlots = grid.querySelectorAll('[data-cell]') as NodeListOf<HTMLElement>;
      if (targetSlots[targetIdx]) {
        targetSlots[targetIdx].focus();
      } else {
        focusFirstAvailableSlotInNode(grid);
      }
    }, 20);

    triggerPipelineSync();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mirrorValue);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const getFilteredSymbols = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return symbolRegistry.filter(s => s.category === activeTab);
    }
    return symbolRegistry.filter(s =>
      s.display.toLowerCase().includes(query) ||
      s.latex.toLowerCase().includes(query) ||
      s.tags.some(t => t.toLowerCase().includes(query))
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-stretch relative">
      {/* TOOLBAR PALETTE PANEL */}
      <div className="xl:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col overflow-hidden shadow-sm h-full max-h-[82vh]">
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border-b border-slate-200 dark:border-slate-700/80 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-purple-500" /> Thư viện Ký Hiệu MathType v6.0
          </span>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm ký hiệu (ví dụ: alpha, matrix, int...)"
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all font-medium"
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          </div>
        </div>

        {/* Dynamic Category Tabs */}
        {!searchQuery && (
          <div className="flex border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/10 overflow-x-auto custom-scrollbar">
            {Object.entries(categories).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2.5 text-[11px] font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-slate-100/60 dark:bg-slate-700/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Categories Symbols Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 xl:grid-cols-4 gap-2.5 p-4 flex-1 overflow-y-auto custom-scrollbar content-start bg-slate-50/20">
          {!searchQuery && activeTab === 'structural' ? (
            <>
              <button
                onClick={() => insertStructuralTemplateNode('fraction')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">a/b</div>
                <span>Phân Số</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('sqrt')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">√x</div>
                <span>Căn Bậc 2</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('rootn')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">ⁿ√x</div>
                <span>Căn Bậc n</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('superscript')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">xⁿ</div>
                <span>Bũ Trên</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('subscript')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">xₙ</div>
                <span>Chỉ Số Dưới</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('subsup')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">xⁿₘ</div>
                <span>Số Mũ Kép</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('vector')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">→</div>
                <span>Véc-Tơ</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('integral-def')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">∫</div>
                <span>Tích Phân XĐ</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('summation')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">∑</div>
                <span>Tổng Sigma</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('limit')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">lim</div>
                <span>Giới Hạn</span>
              </button>
              <button
                onClick={() => insertStructuralTemplateNode('piecewise')}
                className="bg-purple-50/60 dark:bg-slate-700/50 hover:bg-purple-100/80 dark:hover:bg-slate-600 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-slate-600/70 p-2.5 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <div className="text-sm font-black">{"{"}</div>
                <span>Phân Nhánh</span>
              </button>
              <button
                onClick={() => setShowMatrixModal(true)}
                className="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold p-2.5 rounded-xl text-[11px] flex flex-col items-center justify-center gap-1 shadow active:scale-95"
              >
                <Table className="w-5.5 h-5.5" />
                <span>Ma Trận Mới</span>
              </button>
            </>
          ) : (
            getFilteredSymbols().map((sym) => (
              <button
                key={sym.id}
                onClick={() => insertTextToken(sym.latex)}
                className="bg-white hover:bg-purple-50 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200/60 dark:border-slate-600/60 py-3 rounded-xl text-base font-bold shadow-sm transition-all font-mono active:scale-95 flex flex-col items-center justify-center"
                title={`${sym.latex} (${sym.tags.join(', ')})`}
              >
                <span>{sym.display}</span>
              </button>
            ))
          )}
        </div>

        {/* Dynamic Matrix Sizing Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/40 flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Thao Tác Cấu Trúc Ma Trận Tương Tác
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
            <button
              onClick={() => modifyMatrixStructure('row-above')}
              className="bg-white dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-purple-50 dark:hover:bg-slate-600 transition-colors"
            >
              + Hàng Trên
            </button>
            <button
              onClick={() => modifyMatrixStructure('row-below')}
              className="bg-white dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-purple-50 dark:hover:bg-slate-600 transition-colors"
            >
              + Hàng Dưới
            </button>
            <button
              onClick={() => modifyMatrixStructure('row-delete')}
              className="bg-white dark:bg-slate-700 p-2.5 rounded-xl border border-slate-250 dark:border-slate-600 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mx-auto" />
            </button>
            <button
              onClick={() => modifyMatrixStructure('col-left')}
              className="bg-white dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-purple-50 dark:hover:bg-slate-600 transition-colors"
            >
              + Cột Trái
            </button>
            <button
              onClick={() => modifyMatrixStructure('col-right')}
              className="bg-white dark:bg-slate-700 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-purple-50 dark:hover:bg-slate-600 transition-colors"
            >
              + Cột Phải
            </button>
            <button
              onClick={() => modifyMatrixStructure('col-delete')}
              className="bg-white dark:bg-slate-700 p-2.5 rounded-xl border border-slate-250 dark:border-slate-600 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mx-auto text-rose-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE WYSIWYG CANVAS WORKSPACE */}
      <div className="xl:col-span-8 flex flex-col gap-6 h-full max-h-[82vh]">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 flex flex-col gap-3 shadow-sm flex-1 overflow-hidden relative">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-slate-700/75 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Không gian soạn thảo trực quan (MathType Workspace)
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setZoom(prev => Math.max(50, prev - 15))}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-purple-600 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-1.5 min-w-[45px] text-center text-slate-600 dark:text-slate-300">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(prev => Math.min(250, prev + 15))}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-purple-600 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
              <button
                onClick={() => setZoom(100)}
                className="text-[10px] uppercase font-bold text-slate-500 hover:text-purple-600 px-1.5 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Interactive editable rich div element */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/35 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-auto custom-scrollbar relative">
            <div
              ref={canvasRef}
              contentEditable
              onInput={triggerPipelineSync}
              className="visual-stage w-full h-full font-serif font-medium text-slate-900 dark:text-white"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            ></div>
          </div>
        </div>

        {/* MATH OUTPUT REPRESENTATIONS */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 flex flex-col h-[185px] shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/85 pb-2.5 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Đồng bộ mã kết xuất Toán Học
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg text-[10px] font-bold border border-slate-200/50 dark:border-slate-700/80">
                <button
                  onClick={() => setOutputView('latex')}
                  className={`px-2.5 py-1 rounded transition-colors ${outputView === 'latex' ? 'bg-white dark:bg-slate-750 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}
                >
                  LaTeX
                </button>
                <button
                  onClick={() => setOutputView('mathml')}
                  className={`px-2.5 py-1 rounded transition-colors ${outputView === 'mathml' ? 'bg-white dark:bg-slate-750 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}
                >
                  MathML
                </button>
                <button
                  onClick={() => setOutputView('unicodemath')}
                  className={`px-2.5 py-1 rounded transition-colors ${outputView === 'unicodemath' ? 'bg-white dark:bg-slate-750 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}
                >
                  UnicodeMath
                </button>
              </div>
              <button
                onClick={handleCopyCode}
                className="text-[10px] bg-sky-50 dark:bg-[#1e293b] hover:bg-sky-100 dark:hover:bg-slate-700/60 p-1.5 rounded-lg text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700/80"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                {isCopied ? 'Đã copy' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={mirrorValue}
            placeholder="Ký hiệu LaTeX sẽ tự động kết xuất tương ứng tại đây..."
            className="w-full flex-1 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl font-mono text-xs border-none outline-none resize-none leading-relaxed shadow-inner custom-scrollbar"
          ></textarea>
        </div>
      </div>

      {/* MODAL CONFIG MATRIX */}
      {showMatrixModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm shadow-xl p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-0.5 border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-purple-500" /> Thiết lập Ma Trận Động
              </h3>
              <p className="text-[11px] text-slate-400">Điều chỉnh số hàng và cột tùy ý ở ma trận mới của bạn.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hàng (Rows)</label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={matrixRows}
                  onChange={(e) => setMatrixRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Cột (Columns)</label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={matrixCols}
                  onChange={(e) => setMatrixCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Loại dấu ngoặc (Boundary bracket)</label>
              <select
                value={matrixEnv}
                onChange={(e: any) => setMatrixEnv(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
              >
                <option value="bmatrix">Ma Trận Vuông [ ]</option>
                <option value="matrix">Ma Trận Tròn ( )</option>
                <option value="vmatrix">Định thức | |</option>
                <option value="Bmatrix">Ma Trận Nhọn {"{ }"}</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3 mt-1">
              <button
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  insertMatrixTemplateNode(matrixRows, matrixCols, matrixEnv);
                  setShowMatrixModal(false);
                }}
                className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-all active:scale-95"
              >
                Tạo cấu trúc Ma Trận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
