import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Sparkles, TrendingUp, Sliders } from 'lucide-react';

export default function CalculusDerivativeSim() {
  const canvasRef = useRef(null);
  const [funcKey, setFuncKey] = useState('cubic'); // 'cubic', 'quadratic', 'sine', 'quartic'
  const [a, setA] = useState(1.0); // 점 a
  const [deltaX, setDeltaX] = useState(0.8); // 할선의 dx
  const [showSecant, setShowSecant] = useState(true); // 할선 표시 여부

  // 함수 정의
  const functions = {
    cubic: {
      name: 'f(x) = x³ - 3x',
      sub: '삼차함수의 극값과 변곡점 탐구',
      f: (x) => Math.pow(x, 3) - 3 * x,
      df: (x) => 3 * Math.pow(x, 2) - 3,
      domain: [-2.6, 2.6],
      range: [-4.5, 4.5],
    },
    quadratic: {
      name: 'f(x) = -x² + 4',
      sub: '이차함수의 꼭짓점과 대칭 접선',
      f: (x) => -Math.pow(x, 2) + 4,
      df: (x) => -2 * x,
      domain: [-3.2, 3.2],
      range: [-5.5, 5.5],
    },
    sine: {
      name: 'f(x) = 2 sin(x)',
      sub: '삼각함수의 미분과 주기적 기울기',
      f: (x) => 2 * Math.sin(x),
      df: (x) => 2 * Math.cos(x),
      domain: [-4.2, 4.2],
      range: [-3.5, 3.5],
    },
    quartic: {
      name: 'f(x) = 0.25x⁴ - 2x²',
      sub: '사차함수의 W자형 개형과 3개의 극값',
      f: (x) => 0.25 * Math.pow(x, 4) - 2 * Math.pow(x, 2),
      df: (x) => Math.pow(x, 3) - 4 * x,
      domain: [-3.5, 3.5],
      range: [-5, 4],
    },
  };

  const currentFunc = functions[funcKey];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const [xMin, xMax] = currentFunc.domain;
    const [yMin, yMax] = currentFunc.range;

    // 좌표 변환 함수
    const toCanvasX = (x) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y) => height - ((y - yMin) / (yMax - yMin)) * height;

    // 1. 모안 그리드 & 축
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    // x축 그리드
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
      ctx.stroke();
      if (x !== 0) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px sans-serif';
        ctx.fillText(x.toString(), cx - 3, toCanvasY(0) + 14);
      }
    }

    // y축 그리드
    for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.stroke();
      if (y !== 0) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px sans-serif';
        ctx.fillText(y.toString(), toCanvasX(0) + 4, cy + 3);
      }
    }

    // 메인 X축, Y축
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0)); ctx.lineTo(width, toCanvasY(0));
    ctx.moveTo(toCanvasX(0), 0); ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // 2. 함수 f(x) 곡선 그리기
    ctx.beginPath();
    ctx.strokeStyle = '#6C5CE7';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = currentFunc.f(x);
      const cx = toCanvasX(x);
      const cy = toCanvasY(y);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // 3. 접점 (a, f(a)) 계산
    const fa = currentFunc.f(a);
    const fpa = currentFunc.df(a); // 순간변화율 (미분계수)
    const caX = toCanvasX(a);
    const caY = toCanvasY(fa);

    // 4. 할선 (Secant Line): 점 P(a, f(a)) 와 점 Q(a + dx, f(a + dx))
    if (showSecant && Math.abs(deltaX) > 0.02) {
      const x2 = a + deltaX;
      const fx2 = currentFunc.f(x2);
      const secantSlope = (fx2 - fa) / deltaX;

      // 할선 그리기
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 206, 201, 0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      const secX1 = xMin;
      const secY1 = fa + secantSlope * (secX1 - a);
      const secX2 = xMax;
      const secY2 = fa + secantSlope * (secX2 - a);

      ctx.moveTo(toCanvasX(secX1), toCanvasY(secY1));
      ctx.lineTo(toCanvasX(secX2), toCanvasY(secY2));
      ctx.stroke();
      ctx.setLineDash([]);

      // 점 Q(a + Δx, f(a + Δx))
      const cqX = toCanvasX(x2);
      const cqY = toCanvasY(fx2);
      ctx.beginPath();
      ctx.arc(cqX, cqY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#00CEC9';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Q 라벨
      ctx.fillStyle = '#008B87';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`Q(a+Δx)`, cqX + 6, cqY - 6);
    }

    // 5. 접선 (Tangent Line) 그리기: y - f(a) = f'(a)(x - a)
    ctx.beginPath();
    ctx.strokeStyle = '#FF7675';
    ctx.lineWidth = 3;

    const tanX1 = xMin;
    const tanY1 = fa + fpa * (tanX1 - a);
    const tanX2 = xMax;
    const tanY2 = fa + fpa * (tanX2 - a);

    ctx.moveTo(toCanvasX(tanX1), toCanvasY(tanY1));
    ctx.lineTo(toCanvasX(tanX2), toCanvasY(tanY2));
    ctx.stroke();

    // 6. 접점 P(a, f(a)) 하이라이트
    ctx.beginPath();
    ctx.arc(caX, caY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#FF7675';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // P 라벨
    ctx.fillStyle = '#D63031';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`P(${a.toFixed(2)}, ${fa.toFixed(2)})`, caX + 8, caY - 8);

    // 극값 알림 (f'(a) ≈ 0)
    if (Math.abs(fpa) < 0.15) {
      ctx.fillStyle = '#6C5CE7';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('★ 극점 도달! f\'(a) ≈ 0', caX - 40, caY - 22);
    }
  }, [funcKey, a, deltaX, showSecant, currentFunc]);

  const fa = currentFunc.f(a);
  const fpa = currentFunc.df(a);
  const x2 = a + deltaX;
  const fx2 = currentFunc.f(x2);
  const secantSlope = Math.abs(deltaX) > 0.001 ? ((fx2 - fa) / deltaX) : fpa;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 함수 선택 탭 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(functions).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setFuncKey(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              funcKey === key
                ? 'clay-pill-active text-white'
                : 'clay-pill-inactive text-clay-slate-600'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* 메인 캔버스 뷰 */}
      <div className="relative clay-inset p-3 bg-white/90 rounded-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          className="w-full h-auto max-h-[320px] rounded-xl shadow-inner bg-slate-50/70"
        />

        {/* 상단 오버레이 수식 정보 카드 */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
          <div className="clay-card px-3 py-1.5 text-xs font-bold bg-white/95 text-clay-purple border border-purple-100 shadow-sm flex items-center gap-2">
            <span>미분계수 f'({a.toFixed(2)}) = </span>
            <span className="text-base text-rose-500 font-extrabold">{fpa.toFixed(3)}</span>
          </div>

          <div className="clay-badge px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/95 text-clay-slate-700 shadow-sm">
            접선의 방정식: y = {fpa.toFixed(2)}(x - {a.toFixed(2)}) {fa >= 0 ? `+ ${fa.toFixed(2)}` : `- ${Math.abs(fa).toFixed(2)}`}
          </div>
        </div>

        {/* 범례 */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3 text-[11px] font-bold bg-white/90 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1 text-clay-purple">
            <span className="w-3 h-1 bg-clay-purple inline-block rounded-full"></span> 함수 f(x)
          </span>
          <span className="flex items-center gap-1 text-rose-500">
            <span className="w-3 h-1 bg-rose-500 inline-block rounded-full"></span> 접선 f'(a)
          </span>
          {showSecant && (
            <span className="flex items-center gap-1 text-teal-600">
              <span className="w-3 h-1 bg-teal-500 inline-block rounded-full"></span> 할선 (Δx)
            </span>
          )}
        </div>
      </div>

      {/* 조작 슬라이더 패널 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-clay-slate-600">
        {/* 점 a 위치 조절 */}
        <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span>접점의 x좌표 (a)</span>
            <span className="text-rose-500 font-extrabold text-sm">{a.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={currentFunc.domain[0] + 0.3}
            max={currentFunc.domain[1] - 0.3}
            step="0.05"
            value={a}
            onChange={(e) => setA(parseFloat(e.target.value))}
          />
        </div>

        {/* 할선의 증분 Δx 조절 (미분계수의 정의 극한 체험) */}
        <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span>증분 Δx (할선 ➔ 접선 극한 수렴)</span>
            <span className="text-teal-600 font-extrabold text-sm">{deltaX.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-1.5"
            max="1.5"
            step="0.05"
            value={deltaX}
            onChange={(e) => setDeltaX(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* 수렴 원리 학습 팁 */}
      <div className="clay-inset p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/60 to-rose-50/60 flex items-center justify-between gap-4 text-xs font-medium text-clay-slate-700">
        <div className="flex flex-col gap-0.5">
          <span className="font-extrabold text-clay-purple flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            고등 수학 II 핵심 개념: 미분계수의 극한 정의
          </span>
          <span className="text-[11px] text-clay-slate-600">
            슬라이더로 Δx를 0으로 서서히 보내보세요. 평균변화율(할선 기울기: <strong>{secantSlope.toFixed(3)}</strong>)이 순간변화율(접선 기울기: <strong>{fpa.toFixed(3)}</strong>)에 완벽히 일치하게 됩니다!
          </span>
        </div>

        <button
          onClick={() => { setA(1.0); setDeltaX(0.01); }}
          className="clay-btn px-3 py-1.5 rounded-full text-[11px] font-bold text-clay-purple whitespace-nowrap shadow-sm"
        >
          Δx ➔ 0 극한 맞추기
        </button>
      </div>
    </div>
  );
}
