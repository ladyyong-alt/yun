import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CategoryFilter from './components/CategoryFilter';
import SimulationCard from './components/SimulationCard';
import SimulationModal from './components/SimulationModal';
import StudentGallery from './components/StudentGallery';
import Footer from './components/Footer';
import { SIMULATIONS } from './data/simulationsData';
import { SearchX, Sparkles } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [activeSimulation, setActiveSimulation] = useState(null);

  // 필터링 및 정렬 처리
  const filteredSimulations = useMemo(() => {
    let result = [...SIMULATIONS];

    // 1. 카테고리 필터
    if (selectedCategory !== 'all') {
      result = result.filter((sim) => sim.category === selectedCategory);
    }

    // 2. 검색어 필터 (제목, 부제목, 설명, 태그)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((sim) =>
        sim.title.toLowerCase().includes(q) ||
        sim.subtitle.toLowerCase().includes(q) ||
        sim.description.toLowerCase().includes(q) ||
        sim.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // 3. 정렬
    if (sortBy === 'popular') {
      result.sort((a, b) => parseInt(b.likes.replace(',', '')) - parseInt(a.likes.replace(',', '')));
    } else if (sortBy === 'views') {
      result.sort((a, b) => parseInt(b.views.replace(',', '')) - parseInt(a.views.replace(',', '')));
    } else if (sortBy === 'level') {
      result.sort((a, b) => a.level.localeCompare(b.level));
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  const handleExploreClick = () => {
    const el = document.getElementById('simulation-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 학생 갤러리에서 선택한 작품으로 프랙탈 시뮬레이터 열기
  const handleOpenFractalWithData = (work) => {
    const sim = SIMULATIONS.find((s) => s.id === 'fractal-tree');
    if (sim) {
      setActiveSimulation({
        ...sim,
        initialData: {
          angle: work.angle,
          depth: work.depth,
          branchRatio: work.branchRatio,
          colorTheme: work.colorTheme,
          title: work.title,
          studentName: work.studentName,
          comment: work.comment,
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-clay-purple-light selection:text-white">
      {/* 1. 상단 네비게이션 바 (Top Floating Clay Nav) */}
      <Navbar
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        onCategorySelect={setSelectedCategory}
        activeCategory={selectedCategory}
        onOpenHighSchoolLab={() => {
          const sim = SIMULATIONS.find((s) => s.id === 'geogebra-lab');
          if (sim) setActiveSimulation(sim);
        }}
      />

      {/* 2. 메인 페이지 본문 */}
      <main className="flex-1 flex flex-col">
        {/* 히어로 섹션 (실시간 단위원 & 파동 시뮬레이터 포함) */}
        <HeroSection onExploreClick={handleExploreClick} />

        {/* 고등학생 전용 인터랙티브 앱 하이라이트 배너 */}
        <section className="px-4 sm:px-8 max-w-7xl mx-auto w-full pt-2 pb-4">
          <div className="clay-card p-5 sm:p-6 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-teal-500/10 border border-purple-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-clay-purple text-white shadow-sm">
                  🎓 고등학생 추천
                </span>
                <span className="text-xs font-bold text-clay-slate-600">
                  수학 I · 수학 II · 기하 · 미적분 수능/내신 연계
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-clay-slate-900 mt-0.5">
                고교 수학 인터랙티브 랩 & GeoGebra 계산기
              </h2>
              <p className="text-xs text-clay-slate-500">
                미분계수 접선 수렴, 구분구적법 정적분 오차, 이차곡선 초점 궤적을 직접 조작해보세요.
              </p>
            </div>

            {/* 원클릭 바로 실행 버튼들 */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const sim = SIMULATIONS.find((s) => s.id === 'geogebra-lab');
                  if (sim) setActiveSimulation(sim);
                }}
                className="clay-btn-primary px-3.5 py-2 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm"
              >
                <span>GeoGebra / Desmos</span>
              </button>

              <button
                onClick={() => {
                  const sim = SIMULATIONS.find((s) => s.id === 'calculus-derivative');
                  if (sim) setActiveSimulation(sim);
                }}
                className="clay-btn-peach px-3.5 py-2 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm text-white"
              >
                <span>미분계수 & 접선</span>
              </button>

              <button
                onClick={() => {
                  const sim = SIMULATIONS.find((s) => s.id === 'riemann-sum');
                  if (sim) setActiveSimulation(sim);
                }}
                className="clay-btn-teal px-3.5 py-2 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm text-white"
              >
                <span>구분구적법 & 정적분</span>
              </button>
            </div>
          </div>
        </section>

        {/* 시뮬레이션 카탈로그 섹션 */}
        <section
          id="simulation-grid-section"
          className="px-4 sm:px-8 max-w-7xl mx-auto w-full pt-4 scroll-mt-24"
        >
          {/* 카테고리 필터 & 검색 결과 컨트롤러 */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={filteredSimulations.length}
          />

          {/* 시뮬레이션 그리드 (Simulation Cards Grid) */}
          <div id="simulation-grid" className="mt-6">
            {filteredSimulations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSimulations.map((sim) => (
                  <SimulationCard
                    key={sim.id}
                    sim={sim}
                    onOpenModal={setActiveSimulation}
                  />
                ))}
              </div>
            ) : (
              /* 검색 결과 없음 Empty State */
              <div className="clay-card p-12 text-center flex flex-col items-center justify-center gap-4 my-8 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-clay-slate-400">
                  <SearchX className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-clay-slate-800">
                    일치하는 수학 시뮬레이션이 없습니다
                  </h3>
                  <p className="text-xs text-clay-slate-500 mt-1">
                    검색어를 확인하시거나 카테고리 필터를 '전체 보기'로 전환해보세요.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="clay-btn-primary px-5 py-2 text-xs font-bold rounded-full"
                >
                  전체 목록 다시 보기
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 3. 학생별 프랙탈 작품 모음방 (Student Gallery) */}
        <StudentGallery onOpenFractalWithData={handleOpenFractalWithData} />
      </main>

      {/* 3. 모달 (시뮬레이션 실행창) */}
      {activeSimulation && (
        <SimulationModal
          sim={activeSimulation}
          onClose={() => setActiveSimulation(null)}
        />
      )}

      {/* 4. 푸터 (Footer) */}
      <Footer />
    </div>
  );
}
