import React, { useState } from 'react';
import { Sparkles, Search, Compass, BookOpen, FlaskConical, Users, Menu, X, PlusCircle, ArrowRight } from 'lucide-react';

export default function Navbar({ onSearchChange, searchQuery, onCategorySelect, activeCategory }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');

  const navLinks = [
    { id: 'explore', label: '시뮬레이션 탐색', icon: Compass },
    { id: 'curriculum', label: '교과과정 코스', icon: BookOpen },
    { id: 'lab', label: '인터랙티브 랩', icon: FlaskConical },
    { id: 'community', label: '교사·학생 커뮤니티', icon: Users },
  ];

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
      <nav className="clay-nav px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <a 
          href="#" 
          className="flex items-center gap-3 group select-none flex-shrink-0"
          onClick={() => {
            onCategorySelect('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {/* 3D Clay Icon Pill */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-clay-purple to-clay-purple-light flex items-center justify-center text-white font-bold text-2xl shadow-clay-primary transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-300 border border-white/60">
            <span className="font-serif">π</span>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-clay-purple to-clay-blue bg-clip-text text-transparent">
                MathClay
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-clay-purple/10 text-clay-purple border border-clay-purple/20">
                LAB
              </span>
            </div>
            <span className="text-[11px] font-medium text-clay-slate-500 hidden sm:block">
              수학 학습 시뮬레이션 포털
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#EAEFF6] px-2 py-1.5 rounded-full shadow-[inset_2px_2px_4px_#cbd5e1,inset_-2px_-2px_4px_#ffffff]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'clay-pill-active text-white'
                    : 'text-clay-slate-600 hover:text-clay-purple hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-clay-slate-500'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search Field */}
          <div className="relative hidden md:block w-48 lg:w-56">
            <Search className="w-4 h-4 text-clay-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="시뮬레이션 검색 (예: 삼각비, 파이)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="clay-input w-full pl-9 pr-3 py-2 text-xs text-clay-slate-700 placeholder-clay-slate-400 font-medium"
            />
          </div>

          {/* New Simulation Submit Button */}
          <button 
            onClick={() => alert('시뮬레이션 제작/등록 기능은 준비 중입니다! Vercel 배포 후 새로운 시뮬레이터를 추가할 수 있습니다.')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-clay-purple hover:text-clay-purple-dark bg-white shadow-clay-btn hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
            title="새 수학 시뮬레이션 제안"
          >
            <PlusCircle className="w-4 h-4 text-clay-purple" />
            <span>등록하기</span>
          </button>

          {/* Primary Action Button (Sign in / Get Started) */}
          <button 
            onClick={() => alert('MathClay는 회원가입 없이 모든 수학 시뮬레이션을 즉시 무료로 체험할 수 있습니다!')}
            className="clay-btn-primary px-4 sm:px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-clay-primary"
          >
            <span>체험 시작</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-2xl bg-white shadow-clay-btn text-clay-slate-700 hover:text-clay-purple"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Claymorphism Card) */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 clay-card p-5 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-clay-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="시뮬레이션 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="clay-input w-full pl-9 pr-3 py-2 text-xs"
            />
          </div>

          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-left transition-all ${
                    isActive ? 'clay-btn-primary text-white' : 'hover:bg-slate-100 text-clay-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-clay-slate-500 font-medium">
            <span>✨ 완전 무료 오픈소스 플랫폼</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Vercel Ready</span>
          </div>
        </div>
      )}
    </header>
  );
}
