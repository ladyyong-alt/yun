import React, { useState } from 'react';
import { Play, Eye, Heart, Sparkles, ExternalLink, Activity, ArrowUpRight } from 'lucide-react';

export default function SimulationCard({ sim, onOpenModal }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(parseInt(sim.likes.replace(',', '')));

  const handleLike = (e) => {
    e.stopPropagation();
    if (liked) {
      setLikeCount((prev) => prev - 1);
      setLiked(false);
    } else {
      setLikeCount((prev) => prev + 1);
      setLiked(true);
    }
  };

  // 배경 썸네일 색상 그라데이션
  const gradientStyles = {
    purple: 'from-purple-500/15 via-indigo-500/10 to-blue-500/15',
    peach: 'from-rose-500/15 via-orange-500/10 to-amber-500/15',
    teal: 'from-teal-500/15 via-emerald-500/10 to-cyan-500/15',
    yellow: 'from-amber-500/15 via-yellow-500/10 to-orange-500/15',
    blue: 'from-blue-500/15 via-cyan-500/10 to-indigo-500/15',
  };

  const bgGrad = gradientStyles[sim.badgeColor] || gradientStyles.purple;

  return (
    <div
      onClick={() => onOpenModal(sim)}
      className="clay-card p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-all duration-300"
    >
      {/* Top Banner & Thumbnail Graphic */}
      <div className={`w-full h-36 rounded-2xl bg-gradient-to-tr ${bgGrad} p-4 flex flex-col justify-between relative overflow-hidden border border-white/60 shadow-inner`}>
        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${sim.levelColor}`}>
            {sim.level}
          </span>

          <button
            onClick={handleLike}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              liked ? 'bg-rose-500 text-white shadow-md' : 'bg-white/80 text-clay-slate-600 hover:text-rose-500'
            }`}
            title="좋아요"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Decorative Math Icon / Abstract Vector Representation */}
        <div className="flex items-center justify-center my-auto">
          {sim.interactiveType === 'geogebra-lab' && (
            <div className="flex items-center gap-2 text-clay-purple">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center text-xl font-extrabold text-clay-purple border border-purple-200">
                ∿
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-clay-purple">GeoGebra + Desmos</span>
                <span className="text-[10px] text-clay-slate-500 font-mono">3D & Graphing Lab</span>
              </div>
            </div>
          )}

          {sim.interactiveType === 'calculus-derivative' && (
            <div className="flex items-center gap-2 text-rose-500">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center text-base font-serif font-extrabold text-rose-500 border border-rose-200">
                dy/dx
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-rose-600">접선 f'(a)</span>
                <span className="text-[10px] text-clay-slate-500 font-mono">Δx ➔ 0 극한</span>
              </div>
            </div>
          )}

          {sim.interactiveType === 'riemann-sum' && (
            <div className="flex items-center gap-2 text-teal-600">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center text-lg font-serif font-extrabold text-teal-600 border border-teal-200">
                ∫ f
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-teal-700">구분구적법 S_n</span>
                <span className="text-[10px] text-clay-slate-500 font-mono">n ➔ ∞ 정적분</span>
              </div>
            </div>
          )}

          {sim.interactiveType === 'conic-sections' && (
            <div className="flex items-center gap-2 text-amber-600">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center text-lg font-extrabold text-amber-600 border border-amber-200">
                ⬭
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-amber-700">타원·포물선·쌍곡선</span>
                <span className="text-[10px] text-clay-slate-500 font-mono">초점과 거리의 합</span>
              </div>
            </div>
          )}

          {sim.interactiveType === 'unit-circle' && (
            <div className="flex items-center gap-2 text-clay-purple">
              <div className="w-12 h-12 rounded-full border-2 border-clay-purple border-dashed animate-spin-slow flex items-center justify-center text-lg font-bold">
                θ
              </div>
              <span className="text-sm font-mono font-bold">sin(ωt)</span>
            </div>
          )}

          {sim.interactiveType === 'monte-carlo' && (
            <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-xl">
              <span className="text-2xl font-serif">π</span>
              <span className="text-xs font-mono bg-white/80 px-2 py-0.5 rounded-full border border-rose-200">
                ≈ 3.14159...
              </span>
            </div>
          )}

          {sim.interactiveType === 'fractal-tree' && (
            <div className="text-teal-600 flex flex-col items-center">
              <div className="text-2xl font-bold">🌱 ⨁</div>
              <span className="text-[10px] font-mono">Self-Similarity</span>
            </div>
          )}

          {sim.interactiveType === 'galton-board' && (
            <div className="text-amber-600 flex flex-col items-center">
              <div className="text-lg tracking-widest font-mono">••• ⤹ •••</div>
              <span className="text-[11px] font-bold">B(n, p) → Normal Dist</span>
            </div>
          )}

          {!['unit-circle', 'monte-carlo', 'fractal-tree', 'galton-board'].includes(sim.interactiveType) && (
            <div className="text-clay-purple text-center">
              <div className="text-2xl font-bold font-serif">∫ ƒ(x) dx</div>
            </div>
          )}
        </div>

        {/* Bottom Tag */}
        <div className="flex items-center justify-between z-10 text-[10px] font-bold text-clay-slate-600">
          <span className="px-2 py-0.5 rounded-md bg-white/70 backdrop-blur-sm">
            {sim.categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-clay-slate-500">
            <Eye className="w-3 h-3" />
            {sim.views}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col gap-2.5 mt-4">
        <div>
          <h3 className="text-base font-extrabold text-clay-slate-900 group-hover:text-clay-purple transition-colors line-clamp-1">
            {sim.title}
          </h3>
          <p className="text-xs font-medium text-clay-slate-500 line-clamp-1">
            {sim.subtitle}
          </p>
        </div>

        <p className="text-xs text-clay-slate-600 line-clamp-2 leading-relaxed font-normal">
          {sim.description}
        </p>

        {/* Mathematical Formula Preview Box */}
        <div className="clay-inset px-3 py-2 rounded-xl text-[11px] font-mono text-clay-purple-dark font-bold bg-[#F4F7FB] flex items-center justify-between">
          <span className="truncate">{sim.formula}</span>
          <span className="text-[10px] text-clay-slate-400 font-sans ml-2 flex-shrink-0">수식</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sim.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-clay-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-clay-slate-500 flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          {likeCount.toLocaleString()}
        </span>

        <button
          onClick={() => onOpenModal(sim)}
          className="clay-btn-primary px-3.5 py-1.5 text-xs font-extrabold flex items-center gap-1.5 shadow-sm group-hover:scale-105 transition-all"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>시뮬레이션 실행</span>
        </button>
      </div>
    </div>
  );
}
