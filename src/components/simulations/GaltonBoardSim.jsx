import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function GaltonBoardSim() {
  const canvasRef = useRef(null);
  const [isRunning, setIsRunning] = useState(true);
  const [ballCount, setBallCount] = useState(0);
  const animFrameId = useRef(null);

  const numRows = 8;
  const numBins = numRows + 1;
  const binsRef = useRef(new Array(numBins).fill(0));
  const ballsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const startX = width / 2;
    const startY = 30;
    const rowSpacing = 18;
    const colSpacing = 22;

    const spawnBall = () => {
      if (ballsRef.current.length < 50) {
        ballsRef.current.push({
          x: startX,
          y: startY,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 1.8,
          row: 0,
          binIndex: 0,
        });
      }
    };

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. 페그(핀) 그리기
      for (let r = 0; r < numRows; r++) {
        const rowY = startY + 30 + r * rowSpacing;
        const pinsInRow = r + 1;
        const rowStartX = startX - (r * colSpacing) / 2;

        for (let c = 0; c < pinsInRow; c++) {
          const pinX = rowStartX + c * colSpacing;
          ctx.beginPath();
          ctx.arc(pinX, rowY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#64748B';
          ctx.fill();
        }
      }

      // 2. 하단 빈(칸) 및 누적 막대 그리기
      const binWidth = colSpacing - 4;
      const binBottomY = height - 15;
      const binStartX = startX - ((numBins - 1) * colSpacing) / 2;

      for (let b = 0; b < numBins; b++) {
        const bx = binStartX + b * colSpacing - binWidth / 2;
        const binHeight = Math.min(binsRef.current[b] * 2, 70);

        // 빈 분리선
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, binBottomY - 70);
        ctx.lineTo(bx, binBottomY);
        ctx.stroke();

        // 누적 구슬 기둥 (클레이 그라데이션)
        if (binHeight > 0) {
          const grad = ctx.createLinearGradient(0, binBottomY - binHeight, 0, binBottomY);
          grad.addColorStop(0, '#6C5CE7');
          grad.addColorStop(1, '#A29BFE');
          ctx.fillStyle = grad;
          ctx.fillRect(bx + 2, binBottomY - binHeight, binWidth - 4, binHeight);
        }
      }

      // 3. 구슬 이동 및 충돌 시뮬레이션
      if (isRunning) {
        tick++;
        if (tick % 4 === 0) spawnBall();

        for (let i = ballsRef.current.length - 1; i >= 0; i--) {
          const ball = ballsRef.current[i];
          ball.y += ball.vy;
          ball.x += ball.vx;

          // 각 행 통과 시 좌우 50% 확률 결정
          const currentRow = Math.floor((ball.y - (startY + 20)) / rowSpacing);
          if (currentRow > ball.row && currentRow < numRows) {
            ball.row = currentRow;
            // 50% 확률 좌 or 우
            const goRight = Math.random() < 0.5;
            ball.vx = (goRight ? 1 : -1) * (colSpacing / 12);
            if (goRight) ball.binIndex += 1;
          }

          // 하단 빈 도달 시
          if (ball.y >= binBottomY - 5) {
            const finalBin = Math.max(0, Math.min(numBins - 1, ball.binIndex));
            binsRef.current[finalBin] += 1;
            setBallCount((prev) => prev + 1);
            ballsRef.current.splice(i, 1);
            continue;
          }

          // 구슬 렌더링
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#FF7675';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning]);

  const handleReset = () => {
    binsRef.current = new Array(numBins).fill(0);
    ballsRef.current = [];
    setBallCount(0);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="clay-inset p-3 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center rounded-2xl">
        <canvas
          ref={canvasRef}
          width={380}
          height={280}
          className="rounded-xl shadow-inner bg-white/80"
        />
      </div>

      <div className="flex items-center justify-between text-xs font-bold text-clay-slate-600">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
              isRunning ? 'clay-btn text-clay-slate-700' : 'clay-btn-primary text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? '일시 정지' : '구슬 떨구기'}</span>
          </button>

          <button
            onClick={handleReset}
            className="clay-btn p-2 rounded-full text-clay-slate-600 hover:text-clay-purple"
            title="리셋"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-clay-slate-500">누적 구슬:</span>
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-clay-purple font-extrabold text-sm">
            {ballCount} 개
          </span>
        </div>
      </div>
    </div>
  );
}
