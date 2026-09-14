import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 px-4 sm:px-8 max-w-7xl mx-auto w-full pb-12">
      <div className="clay-card p-6 sm:p-10 bg-white/90 flex flex-col gap-8">
        {/* Top section: Brand & Quote */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between border-b border-slate-100 pb-8">
          <div className="md:col-span-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-clay-purple to-clay-purple-light flex items-center justify-center text-white font-bold text-xl shadow-clay-primary border border-white/60">
                <span className="font-serif">π</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-clay-purple to-clay-blue bg-clip-text text-transparent">
                MathClay Hub
              </span>
            </div>
            <p className="text-xs sm:text-sm text-clay-slate-600 leading-relaxed max-w-md font-medium">
              모든 학생과 교사를 위한 클레이모피즘 스타일의 인터랙티브 수학 시뮬레이션 플랫폼입니다. Vercel 원클릭 배포가 가능하도록 경량화되어 있습니다.
            </p>
          </div>

          <div className="md:col-span-6 flex flex-col items-start md:items-end gap-2">
            <div className="clay-inset p-4 rounded-2xl max-w-md bg-slate-50 border border-slate-200/60">
              <p className="text-xs italic text-clay-slate-700 font-medium">
                "수학은 자유의 학문이며, 자연의 비밀을 푸는 열쇠이다."
              </p>
              <p className="text-[11px] text-right font-bold text-clay-purple mt-1">
                — 게오르크 칸토어 (Georg Cantor)
              </p>
            </div>
          </div>
        </div>

        {/* Middle section: Vercel Deploy Badge & Guides */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-teal-50 to-rose-50 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-md">
              ▲
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-clay-slate-900">
                Vercel Ready Deployment
              </span>
              <span className="text-[11px] text-clay-slate-600">
                GitHub 연동 또는 <code className="px-1.5 py-0.5 rounded bg-white font-mono text-[10px] text-purple-700">vercel deploy</code> 명령어로 즉시 전세계 무료 배포 가능
              </span>
            </div>
          </div>

          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="clay-btn px-4 py-2 text-xs font-extrabold text-clay-slate-800 hover:text-clay-purple flex items-center gap-1.5 shadow-sm"
          >
            <span>Vercel 배포 가이드</span>
            <span>↗</span>
          </a>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-clay-slate-500 pt-2">
          <span>
            © 2026 MathClay Simulation Hub. All Rights Reserved.
          </span>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>Claymorphism & Modern Web</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
