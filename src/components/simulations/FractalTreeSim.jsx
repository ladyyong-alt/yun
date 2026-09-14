import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Wind, Sparkles } from 'lucide-react';

export default function FractalTreeSim() {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(28); // 분기 각도 (도)
  const [depth, setDepth] = useState(9); // 재귀 깊이
  const [branchRatio, setBranchRatio] = useState(0.72); // 가지 축소율
  const [sway, setSway] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const drawBranch = (x, y, length, currentAngle, currentDepth) => {
      if (currentDepth === 0) return;

      const endX = x + length * Math.sin(currentAngle);
      const endY = y - length * Math.cos(currentAngle);

      // 깊이에 따른 선 굵기와 색상 (줄기: 브라운/보라, 끝 가지: 민트/에메랄드)
      ctx.lineWidth = Math.max(1, currentDepth * 0.9);
      const ratio = currentDepth / depth;
      if (currentDepth > 3) {
        ctx.strokeStyle = `rgb(${Math.round(86 + (1 - ratio) * 60)}, ${Math.round(68 + (1 - ratio) * 80)}, ${Math.round(140 + ratio * 60)})`;
      } else {
        ctx.strokeStyle = '#00CEC9'; // 잎사귀 민트
      }

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const rad = (angle * Math.PI) / 180;

      // 좌우 재귀 가지
      drawBranch(endX, endY, length * branchRatio, currentAngle - rad, currentDepth - 1);
      drawBranch(endX, endY, length * branchRatio, currentAngle + rad, currentDepth - 1);
    };

    // 밑둥 시작점
    const startX = width / 2;
    const startY = height - 20;
    const initialLength = height * 0.24;

    drawBranch(startX, startY, initialLength, 0, depth);
  }, [angle, depth, branchRatio]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="clay-inset p-3 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center rounded-2xl">
        <canvas
          ref={canvasRef}
          width={520}
          height={300}
          className="w-full h-auto max-h-[300px] rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-clay-slate-600">
        <div className="p-3 rounded-2xl bg-white/60 border border-white flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span>가지 분기 각도 (θ)</span>
            <span className="text-teal-600">{angle}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
          />
        </div>

        <div className="p-3 rounded-2xl bg-white/60 border border-white flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span>재귀 깊이 (Depth)</span>
            <span className="text-clay-purple">{depth}단계</span>
          </div>
          <input
            type="range"
            min="4"
            max="11"
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
          />
        </div>

        <div className="p-3 rounded-2xl bg-white/60 border border-white flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span>가지 비율 (Ratio)</span>
            <span className="text-rose-500">{branchRatio}</span>
          </div>
          <input
            type="range"
            min="0.55"
            max="0.80"
            step="0.02"
            value={branchRatio}
            onChange={(e) => setBranchRatio(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-clay-slate-500">
        <button
          onClick={() => { setAngle(28); setDepth(9); setBranchRatio(0.72); }}
          className="clay-btn px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>기본값 복원</span>
        </button>
        <span>총 가지 수: 약 {Math.pow(2, depth + 1) - 1} 개</span>
      </div>
    </div>
  );
}
