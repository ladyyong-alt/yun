import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MonteCarloSim() {
  const canvasRef = useRef(null);
  const [totalCount, setTotalCount] = useState(0);
  const [insideCount, setInsideCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [batchSpeed, setBatchSpeed] = useState(15); // 한 틱당 던지는 다트 수
  const animFrameId = useRef(null);
  const dataRef = useRef({ total: 0, inside: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const radius = size / 2;
    const centerX = radius;
    const centerY = radius;

    // 캔버스 초기 배경 그리기 (정사각형 + 내접원)
    const initCanvas = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // 내접원 배경 가이드
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(108, 92, 231, 0.08)';
      ctx.fill();
      ctx.strokeStyle = '#6C5CE7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 축 선
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY); ctx.lineTo(size, centerY);
      ctx.moveTo(centerX, 0); ctx.lineTo(centerX, size);
      ctx.stroke();
    };

    if (dataRef.current.total === 0) {
      initCanvas();
    }

    const step = () => {
      if (isRunning) {
        for (let i = 0; i < batchSpeed; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const dx = x - centerX;
          const dy = y - centerY;
          const isInside = (dx * dx + dy * dy) <= (radius * radius);

          dataRef.current.total += 1;
          if (isInside) {
            dataRef.current.inside += 1;
            ctx.fillStyle = '#1DD1A1'; // 원 내부: 민트색
          } else {
            ctx.fillStyle = '#FF7675'; // 원 외부: 코랄색
          }

          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        setTotalCount(dataRef.current.total);
        setInsideCount(dataRef.current.inside);
      }

      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, batchSpeed]);

  const handleReset = () => {
    dataRef.current = { total: 0, inside: 0 };
    setTotalCount(0);
    setInsideCount(0);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 내접원 다시 그리기
      const size = canvas.width;
      const radius = size / 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(108, 92, 231, 0.08)';
      ctx.fill();
      ctx.strokeStyle = '#6C5CE7';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const estimatedPi = totalCount > 0 ? ((4 * insideCount) / totalCount) : 0;
  const errorPercent = totalCount > 0 ? (Math.abs(estimatedPi - Math.PI) / Math.PI * 100).toFixed(2) : '0.00';

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* 다트보드 캔버스 */}
        <div className="clay-inset p-3 bg-white/60 flex items-center justify-center rounded-2xl">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="rounded-xl shadow-inner border border-slate-200"
          />
        </div>

        {/* 통계 및 추정 패널 */}
        <div className="flex flex-col gap-3">
          <div className="clay-card p-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-clay-slate-500">원주율 π 추정값</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-clay-purple tracking-tight">
                {totalCount > 0 ? estimatedPi.toFixed(5) : '3.14159...'}
              </span>
              <span className="text-xs font-bold text-clay-slate-400">
                (실제 π ≈ 3.14159)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-clay-slate-500">오차율:</span>
              <span className={`px-2 py-0.5 rounded-full ${parseFloat(errorPercent) < 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {errorPercent}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col">
              <span className="text-emerald-700">원 내부 점 (N_in)</span>
              <span className="text-lg font-extrabold text-emerald-800">{insideCount.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col">
              <span className="text-slate-600">총 던진 점 (N_total)</span>
              <span className="text-lg font-extrabold text-slate-800">{totalCount.toLocaleString()}</span>
            </div>
          </div>

          {/* 속도 조절 */}
          <div className="p-3 rounded-2xl bg-white/60 border border-white flex flex-col gap-1.5 text-xs font-bold text-clay-slate-600">
            <div className="flex justify-between">
              <span>투척 속도 (Batch Speed)</span>
              <span className="text-clay-purple">{batchSpeed * 60} 점/초</span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              step="2"
              value={batchSpeed}
              onChange={(e) => setBatchSpeed(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 조작 버튼 */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              isRunning ? 'clay-btn text-clay-slate-700' : 'clay-btn-teal text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? '일시 정지' : '다트 투척 시작'}</span>
          </button>

          <button
            onClick={handleReset}
            className="clay-btn p-2 rounded-full text-clay-slate-600 hover:text-clay-purple"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs text-clay-slate-500 font-medium">
          수식: π ≈ 4 × (N_in / N_total)
        </span>
      </div>
    </div>
  );
}
