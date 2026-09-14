import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

export default function UnitCircleSim({ isCompact = false }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [frequency, setFrequency] = useState(1); // 주파수
  const [amplitude, setAmplitude] = useState(60); // 진폭
  const [angle, setAngle] = useState(0); // 현재 각도 (rad)
  const angleRef = useRef(0);
  const animFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const wavePoints = [];
    const maxWavePoints = isCompact ? 160 : 260;

    const render = () => {
      // 캔버스 크기 대응
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 중심점 계산
      const circleCenterX = isCompact ? width * 0.28 : width * 0.25;
      const circleCenterY = height * 0.5;
      const radius = amplitude;

      // 그리드 배경
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
      ctx.lineWidth = 1;
      // 수평 중심선
      ctx.beginPath();
      ctx.moveTo(0, circleCenterY);
      ctx.lineTo(width, circleCenterY);
      ctx.stroke();

      // 수직선 (단위원 중심)
      ctx.beginPath();
      ctx.moveTo(circleCenterX, 0);
      ctx.lineTo(circleCenterX, height);
      ctx.stroke();

      // 1. 단위원 그리기
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#6C5CE7';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(108, 92, 231, 0.05)';
      ctx.fill();

      // 현재 회전 각도에 따른 회전점 위치
      const currentAngle = angleRef.current;
      const pointX = circleCenterX + radius * Math.cos(currentAngle);
      const pointY = circleCenterY - radius * Math.sin(currentAngle); // 화면 좌표계 반전

      // 사인(수직) 성분 선
      ctx.beginPath();
      ctx.moveTo(pointX, circleCenterY);
      ctx.lineTo(pointX, pointY);
      ctx.strokeStyle = '#FF7675';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 코사인(수평) 성분 선
      ctx.beginPath();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.lineTo(pointX, circleCenterY);
      ctx.strokeStyle = '#00CEC9';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 반지름 회전 벡터 선
      ctx.beginPath();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.lineTo(pointX, pointY);
      ctx.strokeStyle = '#2D3748';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 단위원 위 점
      ctx.beginPath();
      ctx.arc(pointX, pointY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#6C5CE7';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // 2. 투영 연결 점선 (단위원 점 -> 파동 시작점)
      const waveStartX = isCompact ? width * 0.58 : width * 0.52;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pointX, pointY);
      ctx.lineTo(waveStartX, pointY);
      ctx.strokeStyle = 'rgba(255, 118, 117, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. 우측 사인파 (Sine Wave) 궤적 저장 및 그리기
      wavePoints.unshift(pointY);
      if (wavePoints.length > maxWavePoints) {
        wavePoints.pop();
      }

      if (wavePoints.length > 1) {
        ctx.beginPath();
        for (let i = 0; i < wavePoints.length; i++) {
          const x = waveStartX + i * (isCompact ? 1.5 : 2);
          const y = wavePoints[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#FF7675';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 파동 진입점 하이라이트 점
        ctx.beginPath();
        ctx.arc(waveStartX, wavePoints[0], 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FF7675';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 라벨 및 수치 텍스트 표기
      if (!isCompact) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#00B894';
        ctx.fillText(`cos(θ) = ${Math.cos(currentAngle).toFixed(2)}`, circleCenterX - 40, height - 15);
        ctx.fillStyle = '#FF7675';
        ctx.fillText(`sin(θ) = ${Math.sin(currentAngle).toFixed(2)}`, circleCenterX + radius + 10, circleCenterY - 10);
        ctx.fillStyle = '#6C5CE7';
        ctx.fillText(`θ = ${( (currentAngle % (Math.PI * 2)) * (180 / Math.PI) ).toFixed(0)}°`, circleCenterX + 8, circleCenterY - 8);
      }

      // 각도 업데이트 (재생 중일 때)
      if (isPlaying) {
        angleRef.current += 0.035 * frequency;
        setAngle(angleRef.current);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, frequency, amplitude, isCompact]);

  const resetAngle = () => {
    angleRef.current = 0;
    setAngle(0);
  };

  const sinVal = Math.sin(angle).toFixed(3);
  const cosVal = Math.cos(angle).toFixed(3);
  const degVal = ((angle % (Math.PI * 2)) * (180 / Math.PI)).toFixed(0);

  return (
    <div className="flex flex-col h-full w-full">
      {/* 캔버스 컨테이너 */}
      <div className="relative clay-inset p-3 bg-gradient-to-b from-slate-50/80 to-slate-100/80 rounded-2xl overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={isCompact ? 480 : 640}
          height={isCompact ? 220 : 280}
          className="w-full h-auto max-h-[280px] rounded-xl select-none"
        />

        {/* 오버레이 수치 알약 */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/90 shadow-sm border border-purple-200 text-clay-purple">
            각도 θ: {degVal}°
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/90 shadow-sm border border-rose-200 text-rose-500">
            sin(θ): {sinVal}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/90 shadow-sm border border-teal-200 text-teal-600">
            cos(θ): {cosVal}
          </span>
        </div>
      </div>

      {/* 클레이 컨트롤러 패널 */}
      <div className="mt-4 flex flex-col gap-3">
        {/* 슬라이더 컨트롤 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-clay-slate-600">
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/60 shadow-sm border border-white">
            <div className="flex justify-between items-center">
              <span>주파수 (Frequency: ω)</span>
              <span className="text-clay-purple font-extrabold">{frequency}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={frequency}
              onChange={(e) => setFrequency(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white/60 shadow-sm border border-white">
            <div className="flex justify-between items-center">
              <span>진폭 (Amplitude: A)</span>
              <span className="text-rose-500 font-extrabold">{amplitude}px</span>
            </div>
            <input
              type="range"
              min="30"
              max={isCompact ? 75 : 90}
              step="5"
              value={amplitude}
              onChange={(e) => setAmplitude(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* 액션 버튼 바 */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isPlaying ? 'clay-btn text-clay-slate-700' : 'clay-btn-primary text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? '일시 정지' : '애니메이션 재생'}</span>
            </button>

            <button
              onClick={resetAngle}
              className="clay-btn p-2 rounded-full text-clay-slate-600 hover:text-clay-purple"
              title="각도 초기화 (0도)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-clay-slate-400 font-medium hidden sm:inline">
            y = {amplitude} · sin({frequency}ωt)
          </span>
        </div>
      </div>
    </div>
  );
}
