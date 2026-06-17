import React, { useState, useEffect, useRef, useMemo } from 'react';
import { create, all } from 'mathjs';
import { useLocalStorage } from '../hooks/useLocalStorage';
import katex from 'katex';
import { MathFunction } from '../types';
import { Calculator, Play, RotateCcw, Copy, Check, Eye, EyeOff, Trash2, Plus } from 'lucide-react';

const math = create(all);

interface MathCASGrapherProps {
  onFormulaSelect?: (formula: string) => void;
}

export default function MathCASGrapher({ onFormulaSelect }: MathCASGrapherProps) {
  const [rawInput, setRawInput] = useLocalStorage('unitools_math_input', 'x^2 - 5x + 6');
  const [terminalOutput, setTerminalOutput] = useState('Hệ thống CAS/Đồ thị sẵn sàng...');
  const [isCopied, setIsCopied] = useState(false);
  const [graphMode, setGraphMode] = useLocalStorage<'2d' | '3d'>('unitools_math_mode', '2d');
  
  const [domainX, setDomainX] = useState<[number, number]>([-8, 8]);
  const [domainY, setDomainY] = useState<[number, number]>([-8, 8]);

  const [functions, setFunctions] = useLocalStorage<MathFunction[]>('unitools_math_funcs', [
    { id: 'f1', expr: 'x^2 - 2', color: '#6366f1', visible: true },
    { id: 'f2', expr: 'sin(x) * 3', color: '#10b981', visible: true },
    { id: 'f3', expr: 'cos(x)^2', color: '#f43f5e', visible: false }
  ]);
  const [newFuncExpr, setNewFuncExpr] = useState('');

  const [history, setHistory] = useState<string[]>([
    'x^2 - 5x + 6',
    'det([[1, 2], [3, 4]])',
    'sin(x) * x',
    'derivative("x^3 + 2x", "x")',
    'simplify("2x + 5x - 3")'
  ]);

  const wysiwygRef = useRef<HTMLDivElement>(null);
  const canvas3DRef = useRef<HTMLCanvasElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const [isDragging2D, setIsDragging2D] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const [theta, setTheta] = useState(0.6);
  const [phi, setPhi] = useState(0.8);
  const isDragging3D = useRef(false);
  const isPanning3D = useRef(false);
  const lastMousePos3D = useRef({ x: 0, y: 0 });
  const [scale3D, setScale3D] = useLocalStorage('unitools_math_scale3d', 16);
  const [pan3D, setPan3D] = useState({ x: 0, y: 0 });

  const keyboardSchema = {
    numeric: {
      name: 'Số học',
      keys: [
        { label: '7', token: '7' }, { label: '8', token: '8' }, { label: '9', token: '9' }, { label: '÷', token: '/' },
        { label: '4', token: '4' }, { label: '5', token: '5' }, { label: '6', token: '6' }, { label: '×', token: '*' },
        { label: '1', token: '1' }, { label: '2', token: '2' }, { label: '3', token: '3' }, { label: '−', token: '-' },
        { label: '0', token: '0' }, { label: '.', token: '.' }, { label: 'π', token: 'pi' }, { label: '+', token: '+' },
        { label: 'e', token: 'e' }, { label: '(', token: '(' }, { label: ')', token: ')' }, { label: 'Ans', token: 'Ans' }
      ]
    },
    algebra: {
      name: 'Giải tích & Đại số',
      keys: [
        { label: 'x', token: 'x' }, { label: 'y', token: 'y' }, { label: 'z', token: 'z' }, { label: 'x²', token: '^2' },
        { label: 'x³', token: '^3' }, { label: 'xⁿ', token: '^' }, { label: '√', token: 'sqrt(' }, { label: 'abs', token: 'abs(' },
        { label: 'log', token: 'log(' }, { label: 'ln', token: 'log(' }, { label: 'sin', token: 'sin(' }, { label: 'cos', token: 'cos(' },
        { label: 'tan', token: 'tan(' }, { label: 'd/dx', token: 'derivative(' }, { label: 'Simplify', token: 'simplify(' }, { label: 'Expand', token: 'expand(' }
      ]
    },
    matrix: {
      name: 'Ma trận & Logic',
      keys: [
        { label: '[ ]', token: '[[]]' }, { label: 'Det', token: 'det(' }, { label: 'Inv', token: 'inv(' }, { label: 'Trans', token: 'transpose(' },
        { label: 'Dot', token: 'dot(' }, { label: 'Cross', token: 'cross(' }, { label: 'Mean', token: 'mean(' }, { label: 'Std', token: 'std(' },
        { label: '∧', token: ' and ' }, { label: '∨', token: ' or ' }, { label: '¬', token: 'not ' }, { label: '∈', token: ' in ' }
      ]
    }
  };

  const [activeKeyboardTab, setActiveKeyboardTab] = useState<keyof typeof keyboardSchema>('numeric');

  useEffect(() => {
    evaluateInputExpression();
  }, [rawInput, functions]);


  const handleVirtualKeyPress = (token: string) => {
    if (token === 'Ans') {
      setRawInput(prev => prev + '6');
    } else {
      setRawInput(prev => prev + token);
    }
  };

  const evaluateInputExpression = () => {
    if (!wysiwygRef.current) return;
    try {
      if (rawInput.trim().length > 0) {
        const node = math.parse(rawInput);
        const tex = node.toTex({ parenthesis: 'keep', implicit: 'hide' });
        
        katex.render(tex, wysiwygRef.current, {
          displayMode: true,
          throwOnError: false
        });

        const result = node.evaluate({ x: 2, y: 3 });
        let formattedResult = '';
        if (typeof result === 'function') {
          formattedResult = `[Hàm số hợp lệ]\nĐã sẵn sàng vẽ đồ thị biểu diễn 2D & 3D không gian.`;
        } else {
          formattedResult = `• Kết quả tính toán: ${math.format(result, { precision: 10 })}\n• Định dạng số thực (với x=2, y=3): ${Number(result)}`;
        }
        setTerminalOutput(formattedResult);
      } else {
        katex.render('\\square', wysiwygRef.current, {
          displayMode: true,
          throwOnError: false
        });
        setTerminalOutput('Casio CAS Engine sẵn sàng...');
      }
    } catch (err: any) {
      try {
        katex.render(rawInput, wysiwygRef.current, {
          displayMode: true,
          throwOnError: false
        });
      } catch (e) {}
      setTerminalOutput(`[Lỗi cú pháp]\n${err.message}`);
    }
  };

  const executeCasResult = () => {
    if (!rawInput.trim()) return;
    try {
      const node = math.parse(rawInput);
      const res = node.evaluate({ x: 2, y: 3 });
      const finalStr = math.format(res, { precision: 10 });
      setTerminalOutput(`• Biểu thức: ${rawInput}\n• Kết quả quy chiếu (x=2, y=3): ${finalStr}`);
      
      if (!history.includes(rawInput)) {
        setHistory(prev => [rawInput, ...prev.slice(0, 9)]);
      }
    } catch (err: any) {
      setTerminalOutput(`[Lỗi xử lý CAS]\n${err.message}`);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(terminalOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const compiledFuncs = useMemo(() => {
    const result: { id: string, color: string, fn: math.EvalFunction, isImplicit: boolean }[] = [];
    functions.forEach(f => {
      if (!f.visible) return;
      let exprToCompile = f.expr;
      let isImplicit = false;
      if (f.expr.includes('=')) {
        const [lhs, rhs] = f.expr.split('=');
        exprToCompile = `${lhs} - (${rhs})`;
        isImplicit = true;
      }
      try { result.push({ id: f.id, color: f.color, fn: math.compile(exprToCompile), isImplicit }); } catch(e) {}
    });
    return result;
  }, [functions]);

  const compiledInput = useMemo(() => {
    let exprToCompile = rawInput.trim();
    if (!exprToCompile) return null;
    let isImplicit = false;
    if (exprToCompile.includes('=')) {
      const [lhs, rhs] = exprToCompile.split('=');
      exprToCompile = `${lhs} - (${rhs})`;
      isImplicit = true;
    }
    // Only skip if no y but it's not implicit. Implicit can have just x and y or x or y
    try { 
      return { fn: math.compile(exprToCompile), isImplicit };
    } catch(e) { return null; }
  }, [rawInput]);

  const draw2DGraph = () => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);

    ctx.clearRect(0, 0, width, height);

    const minX = domainX[0];
    const maxX = domainX[1];
    const minY = domainY[0];
    const maxY = domainY[1];

    const mapX = (x: number) => ((x - minX) / (maxX - minX)) * width;
    const mapY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

    const isDark = document.documentElement.classList.contains('dark');
    
    // Draw Grid
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertical grid lines
    const stepX = (maxX - minX) / 10;
    for (let x = Math.ceil(minX / stepX) * stepX; x <= maxX; x += stepX) {
      const px = mapX(x);
      ctx.moveTo(px, 0); ctx.lineTo(px, height);
    }
    // Horizontal grid lines
    const stepY = (maxY - minY) / 10;
    for (let y = Math.ceil(minY / stepY) * stepY; y <= maxY; y += stepY) {
      const py = mapY(y);
      ctx.moveTo(0, py); ctx.lineTo(width, py);
    }
    ctx.stroke();

    // Draw Axes
    ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '10px system-ui, sans-serif';
    ctx.beginPath();

    const drawText = (text: string, x: number, y: number) => {
      ctx.fillText(text, x, y);
    };

    if (0 >= minX && 0 <= maxX) {
      const px = mapX(0);
      ctx.moveTo(px, 0); ctx.lineTo(px, height);
      
      for (let y = Math.ceil(minY / stepY) * stepY; y <= maxY; y += stepY) {
        if (Math.abs(y) < 1e-10) continue; 
        const py = mapY(y);
        drawText(Number.isInteger(y) ? y.toString() : y.toFixed(1), px + 5, py + 3);
      }
    }
    if (0 >= minY && 0 <= maxY) {
      const py = mapY(0);
      ctx.moveTo(0, py); ctx.lineTo(width, py);

      for (let x = Math.ceil(minX / stepX) * stepX; x <= maxX; x += stepX) {
        if (Math.abs(x) < 1e-10) continue; 
        const px = mapX(x);
        drawText(Number.isInteger(x) ? x.toString() : x.toFixed(1), px - 4, py + 14);
      }
      
      if (0 >= minX && 0 <= maxX) {
         drawText('0', mapX(0) - 12, py + 14);
      }
    }
    ctx.stroke();

    // Draw Functions
    const renderFunction = (fnData: {fn: math.EvalFunction, isImplicit: boolean}, color: string) => {
      const { fn, isImplicit } = fnData;
      if (isImplicit) {
        // Marching Squares for Implicit Equations
        const res = 2; // pixel block size
        const cols = Math.ceil(width / res);
        const rows = Math.ceil(height / res);
        const values = new Float32Array((cols + 1) * (rows + 1));
        
        for (let r = 0; r <= rows; r++) {
          const y = maxY - (r / rows) * (maxY - minY); // inverse mapY
          for (let c = 0; c <= cols; c++) {
            const x = minX + (c / cols) * (maxX - minX); // inverse mapX
            try {
              values[r * (cols + 1) + c] = fn.evaluate({ x, y, z: 0 });
            } catch(e) { 
              values[r * (cols + 1) + c] = 1; // dummy non-zero
            }
          }
        }
        
        ctx.fillStyle = color;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
             const v0 = values[r * (cols + 1) + c];
             const v1 = values[r * (cols + 1) + c + 1];
             const v2 = values[(r + 1) * (cols + 1) + c];
             const v3 = values[(r + 1) * (cols + 1) + c + 1];
             
             // If not all signs are the same, there's a zero crossing
             const s0 = v0 > 0;
             if (s0 !== (v1 > 0) || s0 !== (v2 > 0) || s0 !== (v3 > 0)) {
                ctx.fillRect(c * res, r * res, res, res);
             }
          }
        }
      } else {
        // Explicit 2D Plotting (y = f(x))
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        let first = true;
        for (let px = 0; px <= width; px += 2) {
          const x = minX + (px / width) * (maxX - minX);
          try {
            const y = fn.evaluate({ x });
            if (typeof y === 'number' && isFinite(y)) {
              const py = mapY(y);
              if (first || py < -height || py > height * 2) { ctx.moveTo(px, py); first = false; }
              else { ctx.lineTo(px, py); }
            } else { first = true; }
          } catch(e) { first = true; }
        }
        ctx.stroke();
      }
    };

    compiledFuncs.forEach(cf => renderFunction({ fn: cf.fn, isImplicit: cf.isImplicit }, cf.color));
    if (compiledInput) renderFunction(compiledInput, '#6366f1');
  };

  const panGraph = (direction: 'left' | 'right' | 'up' | 'down') => {
    const shiftX = (domainX[1] - domainX[0]) * 0.25;
    const shiftY = (domainY[1] - domainY[0]) * 0.25;
    if (direction === 'left') {
      setDomainX([domainX[0] - shiftX, domainX[1] - shiftX]);
    } else if (direction === 'right') {
      setDomainX([domainX[0] + shiftX, domainX[1] + shiftX]);
    } else if (direction === 'up') {
      setDomainY([domainY[0] + shiftY, domainY[1] + shiftY]);
    } else if (direction === 'down') {
      setDomainY([domainY[0] - shiftY, domainY[1] - shiftY]);
    }
  };

  const zoomGraph = (factor: number) => {
    const centerX = (domainX[0] + domainX[1]) / 2;
    const centerY = (domainY[0] + domainY[1]) / 2;
    const halfWidth = ((domainX[1] - domainX[0]) * factor) / 2;
    const halfHeight = ((domainY[1] - domainY[0]) * factor) / 2;
    setDomainX([centerX - halfWidth, centerX + halfWidth]);
    setDomainY([centerY - halfHeight, centerY + halfHeight]);
  };

  const reset2DView = () => {
    setDomainX([-8, 8]);
    setDomainY([-8, 8]);
  };

  useEffect(() => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };
    canvas.addEventListener('wheel', preventScroll, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', preventScroll);
    };
  }, [graphMode]);

  const handleMouseMove2D = (e: React.MouseEvent) => {
    if (!isDragging2D) return;
    const dx = e.movementX;
    const dy = e.movementY;
    const spanX = domainX[1] - domainX[0];
    const spanY = domainY[1] - domainY[0];
    const canvas = canvas2DRef.current;
    if(canvas) {
       const unitX = spanX / canvas.offsetWidth;
       const unitY = spanY / canvas.offsetHeight;
       setDomainX([domainX[0] - dx * unitX, domainX[1] - dx * unitX]);
       setDomainY([domainY[0] + dy * unitY, domainY[1] + dy * unitY]);
    }
  };

  const handleWheel2D = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const centerX = (domainX[0] + domainX[1]) / 2;
    const centerY = (domainY[0] + domainY[1]) / 2;
    const spanX = (domainX[1] - domainX[0]) * zoomFactor;
    const spanY = (domainY[1] - domainY[0]) * zoomFactor;
    setDomainX([centerX - spanX / 2, centerX + spanX / 2]);
    setDomainY([centerY - spanY / 2, centerY + spanY / 2]);
  };

  const autoFit2DView = () => {
    setDomainX([-10, 10]);
    setDomainY([-10, 10]);
  };

  const addNewFunction = () => {
    if (!newFuncExpr.trim()) return;
    const colors = ['#f43f5e', '#a855f7', '#06b6d4', '#eab308', '#ec4899'];
    const color = colors[functions.length % colors.length];
    const newFunc: MathFunction = {
      id: 'f_' + Date.now(),
      expr: newFuncExpr,
      color,
      visible: true
    };
    setFunctions(prev => [...prev, newFunc]);
    setNewFuncExpr('');
  };

  const deleteFunction = (id: string) => {
    setFunctions(prev => prev.filter(f => f.id !== id));
  };

  const toggleFunctionVisibility = (id: string) => {
    setFunctions(prev => prev.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  };

  const draw3DGraph = () => {
    const canvas = canvas3DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth || 400;
    const height = canvas.offsetHeight || 300;
    const isDark = document.documentElement.classList.contains('dark');
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    let compiled3D: math.EvalFunction | null = null;
    let textToCompile = rawInput.trim();
    if (!textToCompile && functions[0]) {
      textToCompile = functions[0].expr;
    }
    if (!textToCompile) {
      textToCompile = 'x^2 - y^2';
    }

    let isImplicit3D = false;
    let expr3D = textToCompile;
    if (textToCompile.includes('=')) {
       const [lhs, rhs] = textToCompile.split('=');
       expr3D = `${lhs} - (${rhs})`;
       isImplicit3D = true;
    }

    try {
      compiled3D = math.compile(expr3D);
    } catch (e) {
      try {
        compiled3D = math.compile('x^2 - y^2');
        isImplicit3D = false;
      } catch (err) {}
    }

    if (!compiled3D) return;

    const project = (x3d: number, y3d: number, z3d: number) => {
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const x1 = x3d * cosT - y3d * sinT;
      const y1 = x3d * sinT + y3d * cosT;
      const z1 = y1 * sinP + z3d * cosP;
      const x2 = x1;

      return {
        x: width / 2 + pan3D.x + x2 * scale3D,
        y: height / 2 + pan3D.y - z1 * scale3D,
        depth: z1
      };
    };

    const steps = 24;
    const size = 6;
    const stepSize = (size * 2) / steps;

    // --- Bắt đầu Vẽ các Trục Tọa Độ (Axes) ---
    ctx.lineWidth = 2;
    ctx.font = 'bold 12px system-ui, sans-serif';

    const drawAxis = (ax: number, ay: number, az: number, color: string, label: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      const origin = project(-ax, -ay, -az);
      const end = project(ax, ay, az);
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      
      const labelPt = project(ax * 1.1, ay * 1.1, az * 1.1);
      ctx.fillText(label, labelPt.x - 4, labelPt.y + 4);

      ctx.font = '10px system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      const maxDist = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(az));
      for (let i = -Math.floor(maxDist); i <= Math.floor(maxDist); i += 2) {
        if (i === 0) continue;
        const tickPt = project(ax ? i : 0, ay ? i : 0, az ? i : 0);
        ctx.fillText(i.toString(), tickPt.x + 4, tickPt.y - 2);
      }
      ctx.font = 'bold 12px system-ui, sans-serif';
    };

    // X-Axis (Red), Y-Axis (Green), Z-Axis (Blue)
    drawAxis(size + 1.5, 0, 0, '#ef4444', 'X');
    drawAxis(0, size + 1.5, 0, '#22c55e', 'Y');
    drawAxis(0, 0, size + 1.5, '#3b82f6', 'Z');
    // --- Kết thúc Vẽ các Trục Tọa Độ ---

    if (isImplicit3D) {
      const pts: {x: number, y: number, depth: number}[] = [];
      const steps3D = 30; // Voxel resolution
      const res3D = (size * 2) / steps3D;
      
      const vals = new Float32Array((steps3D+1)*(steps3D+1)*(steps3D+1));
      const getIdx = (ix: number, iy: number, iz: number) => ix + iy*(steps3D+1) + iz*(steps3D+1)*(steps3D+1);
      
      // Compute 3D scalar field
      for(let ix=0; ix<=steps3D; ix++) {
        const x = -size + ix*res3D;
        for(let iy=0; iy<=steps3D; iy++) {
          const y = -size + iy*res3D;
          for(let iz=0; iz<=steps3D; iz++) {
            const z = -size + iz*res3D;
            try {
               vals[getIdx(ix, iy, iz)] = compiled3D.evaluate({x, y, z});
            } catch(e) { vals[getIdx(ix, iy, iz)] = 1; }
          }
        }
      }
      
      // Marching cubes point cloud surface detection
      for(let ix=0; ix<steps3D; ix++) {
        const x = -size + ix*res3D + res3D/2;
        for(let iy=0; iy<steps3D; iy++) {
          const y = -size + iy*res3D + res3D/2;
          for(let iz=0; iz<steps3D; iz++) {
            const z = -size + iz*res3D + res3D/2;
            const v0 = vals[getIdx(ix, iy, iz)];
            const v1 = vals[getIdx(ix+1, iy, iz)];
            const v2 = vals[getIdx(ix, iy+1, iz)];
            const v3 = vals[getIdx(ix, iy, iz+1)];
            
            const s0 = v0 > 0;
            if (s0 !== (v1>0) || s0 !== (v2>0) || s0 !== (v3>0)) {
               pts.push(project(x, y, z));
            }
          }
        }
      }
      
      // Painter's algorithm
      pts.sort((a,b) => a.depth - b.depth); 
      
      ctx.fillStyle = 'rgba(99, 102, 241, 0.7)';
      pts.forEach(p => {
         ctx.beginPath();
         ctx.arc(p.x, p.y, 1.5, 0, Math.PI*2);
         ctx.fill();
      });
    } else {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= steps; i++) {
        const x = -size + i * stepSize;
        ctx.beginPath();
        for (let j = 0; j <= steps; j++) {
          const y = -size + j * stepSize;
          try {
            const z = Number(compiled3D.evaluate({ x, y })) * 0.4;
            if (isFinite(z) && !isNaN(z)) {
              const pt = project(x, y, z);
              if (j === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
          } catch (e) {}
        }
        ctx.stroke();
      }

      for (let j = 0; j <= steps; j++) {
        const y = -size + j * stepSize;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const x = -size + i * stepSize;
          try {
            const z = Number(compiled3D.evaluate({ x, y })) * 0.4;
            if (isFinite(z) && !isNaN(z)) {
              const pt = project(x, y, z);
              if (i === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
          } catch (e) {}
        }
        ctx.stroke();
      }
    }
  };

  const handleMouseDown3D = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      isDragging3D.current = true;
    } else if (e.button === 2) {
      isPanning3D.current = true;
    }
    lastMousePos3D.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove3D = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const deltaX = e.clientX - lastMousePos3D.current.x;
    const deltaY = e.clientY - lastMousePos3D.current.y;

    if (isDragging3D.current) {
      setTheta(prev => prev + deltaX * 0.01);
      setPhi(prev => prev - deltaY * 0.01);
    } else if (isPanning3D.current) {
      setPan3D(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    } else {
      return;
    }
    
    lastMousePos3D.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave3D = () => {
    isDragging3D.current = false;
    isPanning3D.current = false;
  };

  useEffect(() => {
    const canvas = canvas3DRef.current;
    if (!canvas) return;
    const preventScroll3D = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setScale3D(prev => Math.max(1, prev * zoomFactor));
    };
    canvas.addEventListener('wheel', preventScroll3D, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', preventScroll3D);
    };
  }, [graphMode]);

  useEffect(() => {
    if (graphMode === '3d') {
      draw3DGraph();
    } else if (graphMode === '2d') {
      draw2DGraph();
    }
  }, [graphMode, rawInput, theta, phi, functions, domainX, domainY, compiledFuncs, compiledInput, scale3D, pan3D]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full items-stretch">
      {/* LEFT COL: CASIO KEYBOARD CONTROLS */}
      <div className="xl:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 flex flex-col overflow-hidden shadow-sm">
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 border-b border-slate-150 dark:border-slate-755 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-500" /> Bàn Phím Mô phỏng CAS
          </span>
          <div className="flex bg-slate-200 dark:bg-slate-700/60 p-0.5 rounded-lg text-[10px] font-semibold">
            <button
              onClick={() => setGraphMode('2d')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${graphMode === '2d' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-300 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              2D
            </button>
            <button
              onClick={() => setGraphMode('3d')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${graphMode === '3d' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-300 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              3D Space
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-150 dark:border-slate-755 bg-slate-50/20 dark:bg-slate-900/10 overflow-x-auto custom-scrollbar">
          {Object.keys(keyboardSchema).map((key) => (
            <button
              key={key}
              onClick={() => setActiveKeyboardTab(key as any)}
              className={`px-4 py-2.5 text-[11px] font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeKeyboardTab === key
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-slate-100/60 dark:bg-slate-700/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {keyboardSchema[key as keyof typeof keyboardSchema].name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-4 flex-1 bg-slate-50/10 dark:bg-slate-900/5 content-start overflow-y-auto custom-scrollbar min-h-[300px]">
          {keyboardSchema[activeKeyboardTab].keys.map((k, idx) => (
            <button
              key={idx}
              onClick={() => handleVirtualKeyPress(k.token)}
              className="bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-150 dark:border-slate-700/80 py-3 rounded-xl text-xs font-bold transition-all shadow-3xs flex items-center justify-center font-mono active:scale-98 cursor-pointer"
            >
              {k.label}
            </button>
          ))}
          <button
            onClick={() => setRawInput('')}
            className="col-span-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            CLEAR (C)
          </button>
          <button
            onClick={() => setRawInput(prev => prev.slice(0, -1))}
            className="col-span-2 bg-slate-400 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all active:scale-98 cursor-pointer"
          >
            BACKSPACE (⌫)
          </button>
        </div>
      </div>

      {/* MID COL: SCREEN INTERFACE & HISTORIES */}
      <div className="xl:col-span-4 flex flex-col gap-6 h-full justify-between">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-5 flex flex-col gap-3 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-401 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-indigo-500" /> Màn hình công thức (KaTeX)
          </span>
          <div className="border border-slate-150 dark:border-slate-950 bg-slate-50 dark:bg-slate-905 rounded-xl p-6 min-h-[110px] flex items-center justify-center overflow-x-auto shadow-inner custom-scrollbar">
            <div ref={wysiwygRef} className="text-slate-900 dark:text-white text-xl font-mono text-center"></div>
          </div>
          <div>
            <input
              type="text"
              value={rawInput}
              onChange={(e) => {
                setRawInput(e.target.value);
                if (onFormulaSelect) onFormulaSelect(e.target.value);
              }}
              placeholder="Nhập biểu thức ví dụ: x^2 - sin(x)..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-700/80 rounded-xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            onClick={executeCasResult}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4" /> KÍCH HOẠT PHÂN TÍCH CAS
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-5 flex flex-col flex-1 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-755 pb-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-401">
              Phép tính &amp; Kết quả quy chiếu
            </span>
            <button
              onClick={handleCopyResult}
              className="text-[10px] bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-bold cursor-pointer"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Sao chép
            </button>
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-900 shadow-inner">
            <pre className="whitespace-pre-wrap break-all leading-relaxed font-sans">{terminalOutput}</pre>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 p-5 flex flex-col h-[180px] overflow-hidden shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-401 border-b border-slate-150 dark:border-slate-755 pb-2 mb-2 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" /> Lịch sử biểu thức mẫu
          </span>
          <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 text-xs font-mono">
            {history.map((hist, index) => (
              <div
                key={index}
                onClick={() => {
                  setRawInput(hist);
                  if (onFormulaSelect) onFormulaSelect(hist);
                }}
                className="bg-slate-50/50 dark:bg-slate-700/30 p-2.5 rounded-lg border border-slate-150 dark:border-slate-700/60 cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 truncate transition-all font-bold"
                title={hist}
              >
                {hist}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COL: CHART GRAPH PORTALS */}
      <div className="xl:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-755 flex flex-col overflow-hidden h-full shadow-sm">
        <div className="p-4 border-b border-slate-150 dark:border-slate-755 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-650 dark:text-slate-400 flex items-center gap-1.5">
            Màn hình hiển thị đồ thị
          </span>
        </div>

        {graphMode === '2d' && (
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 relative bg-slate-550/5 dark:bg-slate-900/20 rounded-xl border border-slate-150 dark:border-slate-755 min-h-[220px] overflow-hidden">
              <canvas
                ref={canvas2DRef}
                className={`w-full h-full absolute inset-0 cursor-${isDragging2D ? 'grabbing' : 'grab'}`}
                onMouseDown={() => setIsDragging2D(true)}
                onMouseUp={() => setIsDragging2D(false)}
                onMouseLeave={() => setIsDragging2D(false)}
                onMouseMove={handleMouseMove2D}
                onWheel={handleWheel2D}
              />
            </div>

            <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-150 dark:border-slate-700/50 text-[10px] font-bold">
              <button onClick={() => panGraph('left')} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer">◀ Trái</button>
              <button onClick={() => panGraph('right')} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer">▶ Phải</button>
              <button onClick={() => panGraph('up')} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer">▲ Trên</button>
              <button onClick={() => panGraph('down')} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer">▼ Dưới</button>
              <button onClick={() => zoomGraph(0.75)} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer">🔍 Co</button>
              <button onClick={() => zoomGraph(1.33)} className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer">🔍 Giãn</button>
              <button onClick={reset2DView} className="bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-500 cursor-pointer">⟲ Reset</button>
              <button onClick={autoFit2DView} className="bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-555 cursor-pointer">↕ Khớp</button>
            </div>

            <div className="h-[150px] border-t border-slate-150 dark:border-slate-755 pt-3 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-401 mb-2">
                Hộp lớp đồ thị đồng bộ
              </span>
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {functions.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl border border-slate-150 dark:border-slate-700/80"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.color }}></span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate">
                        y = {f.expr}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleFunctionVisibility(f.id)}
                        className="text-slate-401 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      >
                        {f.visible ? <Eye className="w-4 h-4 text-indigo-500" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteFunction(f.id)}
                        className="text-slate-401 hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newFuncExpr}
                  onChange={(e) => setNewFuncExpr(e.target.value)}
                  placeholder="Thêm hàm (ví dụ: x^3)..."
                  className="flex-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none"
                />
                <button
                  onClick={addNewFunction}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 text-xs flex items-center justify-center gap-1 transition-all cursor-pointer font-bold"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>
              </div>
            </div>
          </div>
        )}

        {graphMode === '3d' && (
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
            <div className="flex-1 relative bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden min-h-[250px] flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-800">
              <canvas
                ref={canvas3DRef}
                onMouseDown={handleMouseDown3D}
                onMouseMove={handleMouseMove3D}
                onMouseUp={handleMouseUpOrLeave3D}
                onMouseLeave={handleMouseUpOrLeave3D}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full absolute inset-0 cursor-crosshair"
              ></canvas>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center py-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold font-mono uppercase tracking-wider select-none">
              ✥ Isometric 3D Space &mdash; Di chuột để xoay góc tọa độ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
