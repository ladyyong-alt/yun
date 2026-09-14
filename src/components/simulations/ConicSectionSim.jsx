import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, RotateCcw, Compass } from 'lucide-react';

export default function ConicSectionSim() {
  const canvasRef = useRef(null);
  const [conicType, setConicType] = useState('ellipse'); // 'ellipse', 'parabola', 'hyperbola'
  const [a, setA] = useState(3.0); // 장반경 또는 꼭짓점 거리
  const [b, setB] = useState(2.0); // 단반경
  const [p, setP] = useState(2.0); // 포물선 초점 p
  const [t, setT] = useState(0.8); // 궤적 위 동점 P의 매개변수

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 38; // 1단위당 픽셀

    const toCanvasX = (x) => centerX + x * scale;
    const toCanvasY = (y) => centerY - y * scale;

    // 1. 축 & 그리드
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;

    for (let x = -7; x <= 7; x++) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
      ctx.stroke();
    }
    for (let y = -4; y <= 4; y++) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(width, cy);
      ctx.stroke();
    }

    // 메인 축
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
    ctx.stroke();

    // 2. 곡선 유형별 렌더링
    if (conicType === 'ellipse') {
      // 타원 x^2/a^2 + y^2/b^2 = 1
      const c = a > b ? Math.sqrt(a * a - b * b) : Math.sqrt(b * b - a * a);

      // 타원 곡선 그리기
      ctx.beginPath();
      ctx.strokeStyle = '#6C5CE7';
      ctx.lineWidth = 3.5;
      ctx.ellipse(centerX, centerY, a * scale, b * scale, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 초점 F1(-c, 0), F2(c, 0)
      const f1X = toCanvasX(-c), f1Y = toCanvasY(0);
      const f2X = toCanvasX(c), f2Y = toCanvasY(0);

      [f1X, f2X].forEach((fx, i) => {
        ctx.beginPath();
        ctx.arc(fx, f1Y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FF7675';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#D63031';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(i === 0 ? `F₁(-${c.toFixed(1)}, 0)` : `F₂(${c.toFixed(1)}, 0)`, fx - 16, f1Y + 18);
      });

      // 동점 P(a cos t, b sin t)
      const px = a * Math.cos(t);
      const py = b * Math.sin(t);
      const cpx = toCanvasX(px);
      const cpy = toCanvasY(py);

      // 거리선 PF1, PF2
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#00CEC9';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(f1X, f1Y); ctx.lineTo(cpx, cpy); ctx.lineTo(f2X, f2Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // 점 P
      ctx.beginPath();
      ctx.arc(cpx, cpy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#00CEC9';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#008B87';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`P(${px.toFixed(2)}, ${py.toFixed(2)})`, cpx + 8, cpy - 8);

    } else if (conicType === 'parabola') {
      // 포물선 y^2 = 4px
      ctx.beginPath();
      ctx.strokeStyle = '#0984E3';
      ctx.lineWidth = 3.5;

      const steps = 200;
      for (let i = -steps; i <= steps; i++) {
        const yVal = (i / steps) * 4;
        const xVal = (yVal * yVal) / (4 * p);
        if (xVal > 7) continue;
        const cx = toCanvasX(xVal);
        const cy = toCanvasY(yVal);
        if (i === -steps) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // 초점 F(p, 0)
      const fx = toCanvasX(p);
      const fy = toCanvasY(0);
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FF7675';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#D63031';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`초점 F(${p}, 0)`, fx - 14, fy + 18);

      // 준선 x = -p
      const directrixX = toCanvasX(-p);
      ctx.strokeStyle = '#E84118';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(directrixX, 0); ctx.lineTo(directrixX, height);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#E84118';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`준선 x = -${p}`, directrixX + 4, 20);

      // 동점 P
      const py = t * 2.5;
      const px = (py * py) / (4 * p);
      const cpx = toCanvasX(px);
      const cpy = toCanvasY(py);

      // 초점거리 PF & 준선 수선의 발 PH
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#00CEC9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy); ctx.lineTo(cpx, cpy); ctx.lineTo(directrixX, cpy);
      ctx.stroke();
      ctx.setLineDash([]);

      // 점 P
      ctx.beginPath();
      ctx.arc(cpx, cpy, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#00CEC9';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // 쌍곡선 x^2/a^2 - y^2/b^2 = 1
      const c = Math.sqrt(a * a + b * b);
      ctx.beginPath();
      ctx.strokeStyle = '#E17055';
      ctx.lineWidth = 3.5;

      // 점근선 y = ±(b/a)x
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.moveTo(toCanvasX(-7), toCanvasY(-7 * (b / a)));
      ctx.lineTo(toCanvasX(7), toCanvasY(7 * (b / a)));
      ctx.moveTo(toCanvasX(-7), toCanvasY(7 * (b / a)));
      ctx.lineTo(toCanvasX(7), toCanvasY(-7 * (b / a)));
      ctx.stroke();
      ctx.setLineDash([]);

      // 우측 쌍곡선
      ctx.strokeStyle = '#6C5CE7';
      ctx.beginPath();
      for (let i = -150; i <= 150; i++) {
        const theta = (i / 150) * 1.3;
        const xVal = a * Math.cosh(theta);
        const yVal = b * Math.sinh(theta);
        const cx = toCanvasX(xVal);
        const cy = toCanvasY(yVal);
        if (i === -150) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // 좌측 쌍곡선
      ctx.beginPath();
      for (let i = -150; i <= 150; i++) {
        const theta = (i / 150) * 1.3;
        const xVal = -a * Math.cosh(theta);
        const yVal = b * Math.sinh(theta);
        const cx = toCanvasX(xVal);
        const cy = toCanvasY(yVal);
        if (i === -150) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      // 초점 표기
      const f1X = toCanvasX(-c), f1Y = toCanvasY(0);
      const f2X = toCanvasX(c), f2Y = toCanvasY(0);
      [f1X, f2X].forEach((fx, idx) => {
        ctx.beginPath();
        ctx.arc(fx, f1Y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FF7675';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

  }, [conicType, a, b, p, t]);

  const cVal = Math.sqrt(Math.abs(a * a - b * b)).toFixed(2);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 곡선 선택 탭 */}
      <div className="flex items-center gap-2">
        {[
          { id: 'ellipse', label: '타원 (PF₁ + PF₂ = 2a)' },
          { id: 'parabola', label: '포물선 (PF = PH)' },
          { id: 'hyperbola', label: '쌍곡선 (|PF₁ - PF₂| = 2a)' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setConicType(item.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              conicType === item.id ? 'clay-pill-active text-white' : 'clay-pill-inactive text-clay-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 캔버스 */}
      <div className="relative clay-inset p-3 bg-white/90 rounded-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={300}
          className="w-full h-auto max-h-[300px] rounded-xl shadow-inner bg-slate-50/70"
        />

        {/* 상단 정의 배너 */}
        <div className="absolute top-4 left-4 clay-card px-3.5 py-1.5 text-xs font-bold bg-white/95 text-clay-purple border border-purple-100 shadow-sm pointer-events-none">
          {conicType === 'ellipse' && `타원의 정의: 두 초점으로부터 거리의 합 d₁ + d₂ = ${(2 * a).toFixed(1)} (초점 c ≈ ${cVal})`}
          {conicType === 'parabola' && `포물선의 정의: 초점 F(${p}, 0)과 준선 x = -${p}까지의 거리 일치`}
          {conicType === 'hyperbola' && `쌍곡선의 정의: 두 초점으로부터 거리의 차 |d₁ - d₂| = ${(2 * a).toFixed(1)}`}
        </div>
      </div>

      {/* 파라미터 조절 슬라이더 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-clay-slate-600">
        {conicType === 'ellipse' && (
          <>
            <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>장축 반지름 (a)</span>
                <span className="text-clay-purple">{a.toFixed(1)}</span>
              </div>
              <input type="range" min="2" max="5" step="0.2" value={a} onChange={(e) => setA(parseFloat(e.target.value))} />
            </div>
            <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>단축 반지름 (b)</span>
                <span className="text-rose-500">{b.toFixed(1)}</span>
              </div>
              <input type="range" min="1" max="4" step="0.2" value={b} onChange={(e) => setB(parseFloat(e.target.value))} />
            </div>
          </>
        )}

        {conicType === 'parabola' && (
          <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5 col-span-2">
            <div className="flex justify-between">
              <span>초점 거리 (p)</span>
              <span className="text-clay-purple">{p.toFixed(1)}</span>
            </div>
            <input type="range" min="0.8" max="4" step="0.2" value={p} onChange={(e) => setP(parseFloat(e.target.value))} />
          </div>
        )}

        {conicType === 'hyperbola' && (
          <>
            <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>주축 길이 (a)</span>
                <span className="text-clay-purple">{a.toFixed(1)}</span>
              </div>
              <input type="range" min="1.5" max="4" step="0.2" value={a} onChange={(e) => setA(parseFloat(e.target.value))} />
            </div>
            <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>점근선 기울기 계수 (b)</span>
                <span className="text-rose-500">{b.toFixed(1)} (기울기 ±{(b/a).toFixed(2)})</span>
              </div>
              <input type="range" min="1" max="4" step="0.2" value={b} onChange={(e) => setB(parseFloat(e.target.value))} />
            </div>
          </>
        )}
      </div>

      {/* 동점 P 위치 조절 */}
      <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5 text-xs font-bold text-clay-slate-600">
        <div className="flex justify-between items-center">
          <span>곡선 위 동점 P 위치 이동</span>
          <span className="text-teal-600 font-extrabold">조작 중</span>
        </div>
        <input type="range" min="-3" max="3" step="0.05" value={t} onChange={(e) => setT(parseFloat(e.target.value))} />
      </div>
    </div>
  );
}
