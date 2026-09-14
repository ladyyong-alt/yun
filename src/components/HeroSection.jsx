import React from 'react';
import { Sparkles, Play, ArrowDown, BookOpen, Layers, Lightbulb, CheckCircle2 } from 'lucide-react';
import UnitCircleSim from './simulations/UnitCircleSim';

export default function HeroSection({ onExploreClick }) {
  return (
    <section className="relative px-4 sm:px-8 max-w-7xl mx-auto w-full pt-8 sm:pt-14 pb-12">
      {/* Background Decorative Clay Blobs */}
      <div className="absolute -top-10 left-1/4 w-72 h-72 bg-clay-purple-light/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-clay-teal-light/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-clay-peach-light/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Headline & Value Proposition */}
        <div className="lg:col-span-6 flex flex-col items-start gap-5 text-left">
          {/* Top Clay Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="clay-badge px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white/90 text-clay-purple flex items-center gap-1.5 border border-purple-100">
              <Sparkles className="w-3.5 h-3.5 text-clay-purple animate-spin-slow" />
              <span>클레이모피즘 수학 놀이터</span>
            </span>

            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Vercel 1-Click 배포 최적화
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-clay-slate-900 leading-[1.25]">
            수학을 외우지 않고, <br />
            <span className="bg-gradient-to-r from-clay-purple via-clay-teal to-clay-peach bg-clip-text text-transparent">
              만지고 느끼며 실험
            </span>
            하는 공간
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-clay-slate-600 leading-relaxed max-w-xl font-medium">
            공식만 빽빽한 교과서는 그만! 단위원의 회전, 프랙탈 나무의 성장, 몬테카를로 파이(π)의 확률 수렴까지
            슬라이더를 움직이며 살아 숨쉬는 수학 원리를 직접 체득하세요.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
            <button
              onClick={onExploreClick}
              className="clay-btn-primary px-6 py-3.5 rounded-full text-sm font-extrabold flex items-center justify-center gap-2 shadow-clay-primary flex-1 sm:flex-initial"
            >
              <span>시뮬레이션 모음 탐색하기</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('simulation-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="clay-btn px-5 py-3.5 rounded-full text-sm font-extrabold text-clay-slate-700 hover:text-clay-purple flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <Layers className="w-4 h-4 text-clay-teal" />
              <span>추천 프로그램</span>
            </button>
          </div>

          {/* Value Pills / Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-4 w-full border-t border-slate-200/80">
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-clay-purple">100%</span>
              <span className="text-[11px] font-bold text-clay-slate-500">무설치 웹 브라우저</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-clay-teal">12종+</span>
              <span className="text-[11px] font-bold text-clay-slate-500">초·중·고 수학 코스</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-clay-peach">0원</span>
              <span className="text-[11px] font-bold text-clay-slate-500">영구 무료 오픈소스</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Simulator Card (Hero Preview) */}
        <div className="lg:col-span-6 w-full">
          <div className="clay-card p-5 sm:p-6 relative bg-white">
            {/* Live Indicator Pill */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-extrabold text-clay-slate-700">
                  실시간 인터랙티브 체험: 단위원 & 하모닉 파동
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-clay-purple border border-purple-100">
                Live Canvas
              </span>
            </div>

            {/* Embedded Live Simulation */}
            <div className="mt-3">
              <UnitCircleSim isCompact={true} />
            </div>

            {/* Hint footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-clay-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                슬라이더를 조작해 주파수(ω)와 진폭(A)을 바꿔보세요!
              </span>
              <span className="font-bold text-clay-purple">
                MathClay Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
