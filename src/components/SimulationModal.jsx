import React, { useEffect } from 'react';
import { X, Sparkles, Share2, BookOpen, CheckCircle, ExternalLink, Lightbulb } from 'lucide-react';
import UnitCircleSim from './simulations/UnitCircleSim';
import MonteCarloSim from './simulations/MonteCarloSim';
import FractalTreeSim from './simulations/FractalTreeSim';
import GaltonBoardSim from './simulations/GaltonBoardSim';
import CalculusDerivativeSim from './simulations/CalculusDerivativeSim';
import RiemannSumSim from './simulations/RiemannSumSim';
import ConicSectionSim from './simulations/ConicSectionSim';
import GeoGebraEmbedSim from './simulations/GeoGebraEmbedSim';
import confetti from 'canvas-confetti';

export default function SimulationModal({ sim, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!sim) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('🔗 시뮬레이션 공유 링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="clay-card relative w-full max-w-4xl bg-white p-5 sm:p-8 z-10 my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${sim.levelColor}`}>
                {sim.level}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-clay-slate-600">
                {sim.categoryLabel}
              </span>
              <span className="text-xs font-bold text-clay-slate-400">
                조회수 {sim.views}회
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-clay-slate-900 mt-1">
              {sim.title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-clay-slate-500">
              {sim.subtitle}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full clay-btn text-clay-slate-500 hover:text-clay-purple flex-shrink-0 transition-transform active:scale-95"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulation Sandbox Area */}
        <div className="my-5 w-full">
          {sim.interactiveType === 'geogebra-lab' && <GeoGebraEmbedSim />}
          {sim.interactiveType === 'calculus-derivative' && <CalculusDerivativeSim />}
          {sim.interactiveType === 'riemann-sum' && <RiemannSumSim />}
          {sim.interactiveType === 'conic-sections' && <ConicSectionSim />}
          {sim.interactiveType === 'unit-circle' && <UnitCircleSim isCompact={false} />}
          {sim.interactiveType === 'monte-carlo' && <MonteCarloSim />}
          {sim.interactiveType === 'fractal-tree' && <FractalTreeSim />}
          {sim.interactiveType === 'galton-board' && <GaltonBoardSim />}
          {!['geogebra-lab', 'calculus-derivative', 'riemann-sum', 'conic-sections', 'unit-circle', 'monte-carlo', 'fractal-tree', 'galton-board'].includes(sim.interactiveType) && (
            <div className="clay-inset p-8 text-center rounded-2xl flex flex-col items-center justify-center gap-4 bg-slate-50">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-clay-purple text-2xl font-serif font-extrabold shadow-sm">
                ∫
              </div>
              <div className="max-w-md">
                <h4 className="text-base font-extrabold text-clay-slate-800">
                  {sim.title} 전용 랩 엔진
                </h4>
                <p className="text-xs text-clay-slate-500 mt-1">
                  고급 파라미터 시뮬레이션 모듈입니다. 수식과 기본 이론을 확인하고 실험값을 변경해보세요.
                </p>
              </div>
              <div className="clay-card p-4 w-full max-w-md text-xs font-mono font-bold text-clay-purple bg-white">
                {sim.formula}
              </div>
              <button
                onClick={triggerConfetti}
                className="clay-btn-primary px-5 py-2.5 text-xs font-bold rounded-full"
              >
                🎉 실험 데이터 기록하기
              </button>
            </div>
          )}
        </div>

        {/* Explanation & Learning Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="md:col-span-2 flex flex-col gap-2">
            <h4 className="text-xs font-extrabold text-clay-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-clay-purple" />
              <span>학습 목표 및 수학적 원리</span>
            </h4>
            <p className="text-xs text-clay-slate-600 leading-relaxed">
              {sim.description}
            </p>
            <div className="clay-inset p-3 rounded-xl bg-purple-50/50 mt-1 flex items-start gap-2 text-xs text-clay-purple-dark">
              <Lightbulb className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
              <span>
                <strong>탐구 질문:</strong> 파라미터를 조작했을 때 수식의 어떤 변수가 그래프의 형태나 수렴 속도에 가장 큰 영향을 미치는지 관찰해보세요.
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-clay-slate-500">핵심 키워드</span>
              <div className="flex flex-wrap gap-1">
                {sim.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-clay-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleShare}
                className="clay-btn flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 text-clay-slate-700"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>공유하기</span>
              </button>

              <button
                onClick={triggerConfetti}
                className="clay-btn-teal flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>학습 완료</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
