import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Sparkles, Heart, Download, RefreshCw, Trash2, Search, 
  SlidersHorizontal, Play, MessageSquare, Cloud, HardDrive, Calendar, ArrowUpRight 
} from 'lucide-react';
import { 
  getFractals, likeFractalInDb, deleteFractalFromDb, 
  isSupabaseConfigured, supabase, TABLE_NAME 
} from '../lib/supabase';
import confetti from 'canvas-confetti';

// 썸네일 이미지가 없거나 경량 렌더링 시 사용할 실시간 미니 프랙탈 캔버스
function MiniFractalCanvas({ angle = 30, depth = 8, branchRatio = 0.7, colorTheme = 'summer' }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const leafColors = {
      summer: '#00CEC9',
      sakura: '#FF7675',
      autumn: '#FDCB6E',
      frost: '#74B9FF',
    };
    const leafColor = leafColors[colorTheme] || leafColors.summer;

    const drawBranch = (x, y, length, currentAngle, currentDepth) => {
      if (currentDepth <= 0) return;
      const endX = x + length * Math.sin(currentAngle);
      const endY = y - length * Math.cos(currentAngle);

      ctx.lineWidth = Math.max(1, currentDepth * 0.75);
      if (currentDepth > 2) {
        ctx.strokeStyle = '#5c4880';
      } else {
        ctx.strokeStyle = leafColor;
      }

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const rad = (Number(angle) * Math.PI) / 180;
      const nextRatio = Math.min(0.78, Math.max(0.55, Number(branchRatio) || 0.7));
      const nextDepth = currentDepth - 1;
      drawBranch(endX, endY, length * nextRatio, currentAngle - rad, nextDepth);
      drawBranch(endX, endY, length * nextRatio, currentAngle + rad, nextDepth);
    };

    const startX = width / 2;
    const startY = height - 12;
    const initialLength = height * 0.28;
    const renderDepth = Math.min(Number(depth) || 8, 9);

    drawBranch(startX, startY, initialLength, 0, renderDepth);
  }, [angle, depth, branchRatio, colorTheme]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={160}
      className="w-full h-full object-contain p-2"
    />
  );
}

export default function StudentGallery({ onOpenFractalWithData }) {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'likes', 'depth'

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const data = await getFractals();
      setWorks(data);
    } catch (err) {
      console.error('Failed to load student works', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. 최초 데이터 로드
    fetchWorks();

    // 2. 동일 브라우저 내 프랙탈 저장/삭제 이벤트 즉각 수신 (모달 창에서 저장 즉시 반영)
    const handleWorkSaved = () => {
      fetchWorks();
    };
    const handleWorkDeleted = () => {
      fetchWorks();
    };

    window.addEventListener('mathclay_work_saved', handleWorkSaved);
    window.addEventListener('mathclay_work_deleted', handleWorkDeleted);

    // 3. Supabase Realtime 채널 실시간 동기화 (다른 학생 기기나 창에서 등록/좋아요 시 자동 갱신)
    let channel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('realtime_fractal_gallery')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: TABLE_NAME },
            () => {
              fetchWorks();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime subscription failed:', err);
      }
    }

    return () => {
      window.removeEventListener('mathclay_work_saved', handleWorkSaved);
      window.removeEventListener('mathclay_work_deleted', handleWorkDeleted);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // 고유 학생 목록 추출
  const studentNames = useMemo(() => {
    const set = new Set();
    works.forEach((w) => {
      if (w.studentName && w.studentName.trim()) {
        set.add(w.studentName.trim());
      }
    });
    return Array.from(set);
  }, [works]);

  // 필터링 및 정렬
  const filteredWorks = useMemo(() => {
    let result = [...works];

    // 1. 학생별 필터
    if (selectedStudent !== 'all') {
      result = result.filter((w) => (w.studentName || '').trim() === selectedStudent);
    }

    // 2. 검색어 필터 (학생 이름, 작품 제목, 코멘트)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((w) =>
        (w.studentName || '').toLowerCase().includes(q) ||
        (w.title || '').toLowerCase().includes(q) ||
        (w.comment || '').toLowerCase().includes(q)
      );
    }

    // 3. 정렬
    if (sortBy === 'latest') {
      result.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
    } else if (sortBy === 'likes') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'depth') {
      result.sort((a, b) => (b.depth || 0) - (a.depth || 0));
    }

    return result;
  }, [works, selectedStudent, searchQuery, sortBy]);

  // 응원(좋아요) 처리
  const handleLike = async (work, e) => {
    e.stopPropagation();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 }
    });

    setWorks((prev) =>
      prev.map((item) =>
        item.id === work.id ? { ...item, likes: (item.likes || 0) + 1 } : item
      )
    );

    await likeFractalInDb(work.id);
  };

  // 삭제 처리
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('이 학생 작품을 보관함에서 삭제하시겠습니까?')) return;
    await deleteFractalFromDb(id);
    setWorks((prev) => prev.filter((item) => item.id !== id));
  };

  // 이미지 다운로드
  const handleDownload = (work, e) => {
    e.stopPropagation();
    if (!work.thumbnail) {
      alert('썸네일 이미지를 찾을 수 없습니다.');
      return;
    }
    const link = document.createElement('a');
    link.download = `MathClay_${work.studentName || '학생'}_${work.title || '프랙탈'}.png`;
    link.href = work.thumbnail;
    link.click();
  };

  return (
    <section id="student-gallery-section" className="px-4 sm:px-8 max-w-7xl mx-auto w-full py-8 scroll-mt-24">
      {/* 헤더 배너 */}
      <div className="clay-card p-6 sm:p-8 bg-gradient-to-r from-purple-500/10 via-rose-500/5 to-teal-500/10 border border-purple-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-clay-purple to-clay-teal text-white shadow-sm flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>학생 작품 모음방 (Gallery)</span>
              </span>

              {isSupabaseConfigured ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  <span>Supabase 실시간 동기화</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-slate-500" />
                  <span>로컬 보관 모드</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-clay-slate-900 tracking-tight mt-1">
              우리 학교·학급 학생 프랙탈 탐구 전시관 🎨
            </h2>
            <p className="text-xs sm:text-sm text-clay-slate-600 max-w-2xl font-medium">
              학생들이 직접 각도와 재귀 단계를 조작하여 탐구하고 저장한 수학 작품들을 확인하고, 친구들의 작품을 응원(❤️)하거나 내 시뮬레이터로 다시 불러와 탐구할 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
            <button
              onClick={() => onOpenFractalWithData && onOpenFractalWithData({ angle: 28, depth: 8, branchRatio: 0.72, colorTheme: 'summer' })}
              className="clay-btn-primary px-4 py-2 rounded-full text-xs font-extrabold text-white flex items-center gap-1.5 hover:scale-105 transition-all shadow-sm"
              title="프랙탈 시뮬레이터 열고 작품 만들기"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>작품 등록하기</span>
            </button>
            <button
              onClick={fetchWorks}
              disabled={loading}
              className="clay-btn px-3.5 py-2 rounded-full text-xs font-bold text-clay-purple flex items-center gap-1.5 hover:scale-105 transition-all"
              title="최신 등록 작품 새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>
        </div>

        {/* 필터 및 정렬 컨트롤러 바 */}
        <div className="mt-6 pt-5 border-t border-purple-100/80 flex flex-col gap-4">
          {/* 학생별 필터 알약 버튼 리스트 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            <span className="text-xs font-extrabold text-clay-slate-700 whitespace-nowrap mr-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-clay-purple" />
              <span>학생 선택:</span>
            </span>

            <button
              onClick={() => setSelectedStudent('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedStudent === 'all'
                  ? 'clay-pill-active text-white'
                  : 'clay-pill-inactive text-clay-slate-600'
              }`}
            >
              전체 학생 ({works.length}작품)
            </button>

            {studentNames.map((name) => {
              const count = works.filter((w) => (w.studentName || '').trim() === name).length;
              const isSelected = selectedStudent === name;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedStudent(name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'clay-pill-active text-white'
                      : 'clay-pill-inactive text-clay-slate-600'
                  }`}
                >
                  <span>🧑‍🎓 {name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 검색 & 정렬 바 */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-clay-slate-600">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-clay-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="학생 이름, 작품 제목, 소감 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="clay-input w-full pl-8 pr-3 py-1.5 text-xs text-clay-slate-700 placeholder-clay-slate-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-clay-slate-400" />
              <span className="text-clay-slate-500 font-medium">정렬:</span>
              <div className="clay-inset px-3 py-1 rounded-full text-xs font-bold bg-white/70">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-clay-slate-700 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="latest">✨ 최신 등록순</option>
                  <option value="likes">❤️ 응원 많은순</option>
                  <option value="depth">🌲 재귀 깊이(단)순</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 작품 카드 그리드 */}
      <div className="mt-6">
        {loading ? (
          <div className="clay-card p-12 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-clay-purple animate-spin" />
            <span className="text-sm font-bold text-clay-slate-600">
              학생들의 프랙탈 작품을 불러오는 중입니다...
            </span>
          </div>
        ) : filteredWorks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWorks.map((work) => (
              <div
                key={work.id}
                onClick={() => onOpenFractalWithData && onOpenFractalWithData(work)}
                className="clay-card p-4 flex flex-col justify-between cursor-pointer group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              >
                {/* 작품 썸네일 */}
                <div className="w-full h-40 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden relative shadow-inner flex items-center justify-center">
                  {work.thumbnail ? (
                    <img
                      src={work.thumbnail}
                      alt={work.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <MiniFractalCanvas 
                      angle={work.angle} 
                      depth={work.depth} 
                      branchRatio={work.branchRatio} 
                      colorTheme={work.colorTheme} 
                    />
                  )}

                  {/* 좌측 상단 학생 이름 뱃지 */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 shadow-sm border border-purple-100 backdrop-blur-sm">
                    <span className="text-[11px] font-extrabold text-clay-purple">
                      🧑‍🎓 {work.studentName || '익명 학생'}
                    </span>
                  </div>

                  {/* 우측 상단 응원(좋아요) 버튼 */}
                  <button
                    onClick={(e) => handleLike(work, e)}
                    className="absolute top-2.5 right-2.5 px-2 py-1 rounded-full bg-white/95 shadow-sm text-rose-500 font-extrabold text-xs flex items-center gap-1 hover:scale-110 active:scale-95 transition-all border border-rose-100"
                    title="친구 작품 응원하기"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{work.likes || 0}</span>
                  </button>
                </div>

                {/* 카드 본문 정보 */}
                <div className="flex flex-col gap-2 mt-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-clay-slate-900 group-hover:text-clay-purple transition-colors truncate">
                      {work.title || '프랙탈 나무'}
                    </h3>
                  </div>

                  {/* 탐구 소감 말풍선 (있을 경우) */}
                  {work.comment ? (
                    <div className="clay-inset p-2.5 rounded-xl bg-purple-50/50 text-[11px] text-clay-slate-600 font-medium flex items-start gap-1.5 line-clamp-2">
                      <MessageSquare className="w-3.5 h-3.5 text-clay-purple flex-shrink-0 mt-0.5" />
                      <span className="italic">"{work.comment}"</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-clay-slate-400 font-medium">
                      각도와 비율을 조작하여 완성한 프랙탈 작품입니다.
                    </p>
                  )}

                  {/* 수학적 파라미터 배지 */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-clay-purple border border-purple-100">
                      각도: {work.angle}°
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                      깊이: {work.depth}단계
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                      비율: {work.branchRatio}
                    </span>
                  </div>
                </div>

                {/* 카드 푸터 액션 */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-clay-slate-500">
                  <span className="text-[10px] font-medium text-clay-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {work.createdAt}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDownload(work, e)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-clay-slate-500 hover:text-clay-purple transition-all"
                      title="고해상도 이미지 다운로드"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(work.id, e)}
                      className="p-1.5 rounded-full hover:bg-rose-50 text-clay-slate-400 hover:text-rose-500 transition-all"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenFractalWithData && onOpenFractalWithData(work)}
                      className="clay-btn-primary px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 text-white shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>체험</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 작품이 없을 때 Empty State */
          <div className="clay-card p-12 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto my-6">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-clay-purple flex items-center justify-center text-2xl shadow-sm">
              🎨
            </div>
            <div>
              <h3 className="text-base font-extrabold text-clay-slate-800">
                {selectedStudent !== 'all' ? `"${selectedStudent}" 학생의 작품이 없습니다` : '아직 등록된 학생 작품이 없습니다'}
              </h3>
              <p className="text-xs text-clay-slate-500 mt-1">
                프랙탈 시뮬레이터에서 학생 이름과 함께 작품을 저장하면 이곳 전시관에 등록됩니다!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
              <button
                onClick={() => onOpenFractalWithData && onOpenFractalWithData({ angle: 28, depth: 9, branchRatio: 0.72, colorTheme: 'summer' })}
                className="clay-btn-primary px-5 py-2.5 text-xs font-extrabold rounded-full flex items-center gap-1.5 text-white shadow-md hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>지금 내 프랙탈 작품 만들기</span>
              </button>
              {(selectedStudent !== 'all' || searchQuery.trim()) && (
                <button
                  onClick={() => {
                    setSelectedStudent('all');
                    setSearchQuery('');
                  }}
                  className="clay-btn px-4 py-2.5 text-xs font-bold rounded-full text-clay-purple hover:scale-105 transition-all"
                >
                  전체 작품 보기
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
