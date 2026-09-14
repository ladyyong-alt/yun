import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, RotateCcw, BarChart3, Calculator } from 'lucide-react';

export default function RiemannSumSim() {
  const canvasRef = useRef(null);
  const [funcKey, setFuncKey] = useState('parabola'); // 'parabola', 'cubic', 'sine'
  const [n, setN] = useState(8); // 직사각형 분할 수
  const [sumType, setSumType] = useState('midpoint'); // 'left', 'right', 'midpoint', 'trapezoid'
  const [interval, setInterval] = useState([0.5, 3.5]); // [a, b]

  const functions = {
    parabola: {
      name: 'f(x) = -x² + 4x',
      sub: '이차함수 포물선 아래의 면적',
      f: (x) => -Math.pow(x, 2) + 4 * x,
      // 부정적분 F(x) = -x^3/3 + 2x^2
      F: (x) => -Math.pow(x, 3) / 3 + 2 * Math.pow(x, 2),
      domain: [0, 4.2],
      range: [0, 5],
    },
    cubic: {
      name: 'f(x) = 0.2x³ - x + 3',
      sub: '삼차곡선과 정적분의 수렴',
      f: (x) => 0.2 * Math.pow(x, 3) - x + 3,
      F: (x) => 0.05 * Math.pow(x, 4) - 0.5 * Math.pow(x, 2) + 3 * x,
      domain: [0, 4.5],
      range: [0, 6.5],
    },
    sine: {
      name: 'f(x) = 2 sin(x) + 2.5',
      sub: '삼각함수 파동 면적 구분구적법',
      f: (x) => 2 * Math.sin(x) + 2.5,
      F: (x) => -2 * Math.cos(x) + 2.5 * x,
      domain: [0, 4.5],
      range: [0, 5.5],
    }
  };

  const currentFunc = functions[funcKey];
  const [a, b] = interval;

  // 실제 이론적 정적분 값
  const exactIntegral = currentFunc.F(b) - currentFunc.F(a);

  // 구분구적법 근사 계산
  const dx = (b - a) / n;
  let approxSum = 0;
  const rects = [];

  for (let i = 0; i < n; i++) {
    const xLeft = a + i * dx;
    const xRight = xLeft + dx;
    let evalX = xLeft;

    if (sumType === 'left') evalX = xLeft;
    else if (sumType === 'right') evalX = xRight;
    else if (sumType === 'midpoint') evalX = (xLeft + xRight) / 2;

    const height = currentFunc.f(evalX);
    approxSum += height * dx;
    rects.push({ xLeft, xRight, height, evalX });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const [xMin, xMax] = currentFunc.domain;
    const [yMin, yMax] = currentFunc.range;

    const toCanvasX = (x) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y) => height - ((y - yMin) / (yMax - yMin)) * height;

    // 1. 축 & 그리드
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

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

    // 메인 X, Y축
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0)); ctx.lineTo(width, toCanvasY(0));
    ctx.moveTo(toCanvasX(0), 0); ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // 2. 구분구적법 직사각형들 그리기 (클레이 그라데이션)
    rects.forEach((rect, idx) => {
      const rx1 = toCanvasX(rect.xLeft);
      const rx2 = toCanvasX(rect.xRight);
      const rWidth = rx2 - rx1;
      const ryTop = toCanvasY(rect.height);
      const ryBottom = toCanvasY(0);
      const rHeight = ryBottom - ryTop;

      // 직사각형 내부 채우기 (민트/퍼플 반투명)
      const grad = ctx.createLinearGradient(0, ryTop, 0, ryBottom);
      grad.addColorStop(0, 'rgba(108, 92, 231, 0.45)');
      grad.addColorStop(1, 'rgba(0, 206, 201, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(rx1, ryTop, rWidth, rHeight);

      // 직사각형 테두리
      ctx.strokeStyle = '#6C5CE7';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(rx1, ryTop, rWidth, rHeight);

      // 평가점 샘플링 점 표기
      const ceX = toCanvasX(rect.evalX);
      ctx.beginPath();
      ctx.arc(ceX, ryTop, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FF7675';
      ctx.fill();
    });

    // 3. 곡선 f(x) 그리기
    ctx.beginPath();
    ctx.strokeStyle = '#0984E3';
    ctx.lineWidth = 3.5;
    const steps = 250;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = currentFunc.f(x);
      const cx = toCanvasX(x);
      const cy = toCanvasY(y);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // 4. 구간 [a, b] 경계선
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#FF7675';
    ctx.lineWidth = 1.5;

    const caX = toCanvasX(a);
    ctx.beginPath();
    ctx.moveTo(caX, toCanvasY(0)); ctx.lineTo(caX, toCanvasY(currentFunc.f(a)));
    ctx.stroke();

    const cbX = toCanvasX(b);
    ctx.beginPath();
    ctx.moveTo(cbX, toCanvasY(0)); ctx.lineTo(cbX, toCanvasY(currentFunc.f(b)));
    ctx.stroke();
    ctx.setLineDash([]);

    // a, b 텍스트 라벨
    ctx.fillStyle = '#FF7675';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`a=${a}`, caX - 12, toCanvasY(0) + 14);
    ctx.fillText(`b=${b}`, cbX - 12, toCanvasY(0) + 14);

  }, [funcKey, n, sumType, interval, rects, currentFunc]);

  const errorPct = Math.abs((approxSum - exactIntegral) / exactIntegral * 100).toFixed(2);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 함수 선택 및 방식 선택 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {Object.entries(functions).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setFuncKey(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                funcKey === key ? 'clay-pill-active text-white' : 'clay-pill-inactive text-clay-slate-600'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* 합 계산 모드 (좌측합, 우측합, 중점합) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
          {[
            { id: 'left', label: '좌측합' },
            { id: 'midpoint', label: '중점합' },
            { id: 'right', label: '우측합' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSumType(type.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                sumType === type.id
                  ? 'bg-clay-purple text-white shadow-sm'
                  : 'text-clay-slate-600 hover:text-clay-purple'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 캔버스 뷰 */}
      <div className="relative clay-inset p-3 bg-white/90 rounded-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={300}
          className="w-full h-auto max-h-[300px] rounded-xl shadow-inner bg-slate-50/70"
        />

        {/* 통계 오버레이 */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
          <div className="clay-card px-3.5 py-2 text-xs font-bold bg-white/95 border border-purple-100 shadow-sm flex items-baseline gap-2">
            <span className="text-clay-slate-500">구분구적법 합 S_{n}:</span>
            <span className="text-lg font-extrabold text-clay-purple">{approxSum.toFixed(4)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="clay-badge px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-emerald-700">
              정확한 정적분 ∫ f(x)dx = {exactIntegral.toFixed(4)}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${parseFloat(errorPct) < 1.0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
              오차: {errorPct}%
            </span>
          </div>
        </div>
      </div>

      {/* 직사각형 개수 n 조절 슬라이더 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-clay-slate-600">
        <div className="p-3.5 rounded-2xl bg-white/70 border border-white flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span>직사각형 분할 개수 (n ➔ ∞ 극한)</span>
            <span className="text-clay-purple font-extrabold text-base">{n} 등분</span>
          </div>
          <input
            type="range"
            min="2"
            max="64"
            step="2"
            value={n}
            onChange={(e) => setN(parseInt(e.target.value))}
          />
          <span className="text-[10px] text-clay-slate-400">
            직사각형 개수 n이 많아질수록 곡선 아래의 빈틈과 튀어나온 오차가 0으로 사라집니다.
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/70 border border-white flex flex-col justify-between gap-2">
          <div className="flex justify-between items-center">
            <span>적분 구간 [a, b]</span>
            <span className="text-rose-500 font-extrabold">[{a}, {b}] (폭 Δx = {dx.toFixed(3)})</span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setInterval([0.5, 3.5])}
              className="clay-btn flex-1 py-1.5 text-xs font-bold text-clay-slate-700"
            >
              기본 구간 [0.5, 3.5]
            </button>
            <button
              onClick={() => setInterval([1.0, 4.0])}
              className="clay-btn flex-1 py-1.5 text-xs font-bold text-clay-slate-700"
            >
              확장 구간 [1, 4]
            </button>
          </div>
        </div>
      </div>

      {/* 수능/고등수학 연계 설명 */}
      <div className="clay-inset p-3.5 rounded-2xl bg-purple-50/60 flex items-center justify-between gap-4 text-xs font-medium text-clay-slate-700">
        <div className="flex flex-col gap-0.5">
          <span className="font-extrabold text-clay-purple flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            고등 미적분 핵심: 구분구적법의 정적분 변환 공식
          </span>
          <span className="text-[11px] font-mono text-clay-purple-dark">
            lim_(n➔∞) ∑_(k=1)^n f(a + k·Δx)·Δx = ∫_a^b f(x) dx
          </span>
        </div>

        <button
          onClick={() => setN(64)}
          className="clay-btn-teal px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm"
        >
          n=64 극한 수렴 보기
        </button>
      </div>
    </div>
  );
}
