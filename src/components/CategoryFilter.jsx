import React from 'react';
import { CATEGORIES } from '../data/simulationsData';
import { Sparkles, Activity, Shapes, Dice5, Compass, Binary, Search, X, SlidersHorizontal, GraduationCap } from 'lucide-react';

// Icon mapper helper
const iconMap = {
  Sparkles,
  GraduationCap,
  Activity,
  Shapes,
  Dice5,
  Compass,
  Binary,
};

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
}) {
  return (
    <div className="w-full flex flex-col gap-5 pt-4 pb-2" id="simulation-filter">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.icon] || Sparkles;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'clay-pill-active'
                  : 'clay-pill-inactive'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-clay-purple'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search status & Sort Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-clay-slate-600">
        <div className="flex items-center gap-2">
          <span className="text-clay-slate-800 font-extrabold text-sm">
            시뮬레이션 목록
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-clay-purple/15 text-clay-purple font-extrabold text-xs">
            {totalCount}개 발견
          </span>
          {searchQuery && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-clay-slate-700">
              <span>"{searchQuery}" 검색 결과</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-rose-500 ml-1"
                title="검색어 지우기"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-clay-slate-400" />
          <span className="text-clay-slate-500 font-medium">정렬:</span>
          <div className="clay-inset px-3 py-1.5 rounded-full text-xs font-bold bg-white/70">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-clay-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="popular">🔥 인기순</option>
              <option value="views">👀 조회수 높은순</option>
              <option value="level">🎓 학년/난이도순</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
