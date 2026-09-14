import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Download, BookmarkPlus, Trash2, Sparkles, FolderHeart, Check, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FractalTreeSim() {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(28); // 분기 각도 (도)
  const [depth, setDepth] = useState(9); // 재귀 깊이
  const [branchRatio, setBranchRatio] = useState(0.72); // 가지 축소율
  const [colorTheme, setColorTheme] = useState('summer'); // 'summer', 'sakura', 'autumn', 'frost'
  
  // 저장 관련 상태
  const [workTitle, setWorkTitle] = useState('');
  const [savedList, setSavedList] = useState([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // 테마별 색상 팔레트
  const colorThemes = {
    summer: {
      name: '여름 숲 (에메랄드/민트)',
      leafColor: '#00CEC9',
      trunkFn: (ratio) => `rgb(${Math.round(86 + (1 - ratio) * 60)}, ${Math.round(68 + (1 - ratio) * 80)}, ${Math.round(140 + ratio * 60)})`,
    },
    sakura: {
      name: '봄 벚꽃 (로즈/핑크)',
      leafColor: '#FF7675',
      trunkFn: (ratio) => `rgb(${Math.round(120 + (1 - ratio) * 60)}, ${Math.round(80 + (1 - ratio) * 40)}, ${Math.round(110 + ratio * 40)})`,
    },
    autumn: {
      name: '가을 단풍 (앰버/골드)',
      leafColor: '#FDCB6E',
      trunkFn: (ratio) => `rgb(${Math.round(180 + (1 - ratio) * 40)}, ${Math.round(90 + (1 - ratio) * 40)}, ${Math.round(40 + ratio * 30)})`,
    },
    frost: {
      name: '겨울 서리 (바이올렛/스카이)',
      leafColor: '#74B9FF',
      trunkFn: (ratio) => `rgb(${Math.round(108 + (1 - ratio) * 40)}, ${Math.round(92 + (1 - ratio) * 60)}, ${Math.round(231 + ratio * 20)})`,
    },
  };

  // 1. 로컬 스토리지에서 저장된 프랙탈 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mathclay_saved_fractals');
      if (saved) {
        setSavedList(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load saved fractals from localStorage', e);
    }
  }, []);

  // 2. 캔버스 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // 배경 부드러운 그라데이션
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const theme = colorThemes[colorTheme] || colorThemes.summer;

    const drawBranch = (x, y, length, currentAngle, currentDepth) => {
      if (currentDepth === 0) return;

      const endX = x + length * Math.sin(currentAngle);
      const endY = y - length * Math.cos(currentAngle);

      ctx.lineWidth = Math.max(1, currentDepth * 0.9);
      const ratio = currentDepth / depth;

      if (currentDepth > 3) {
        ctx.strokeStyle = theme.trunkFn(ratio);
      } else {
        ctx.strokeStyle = theme.leafColor;
      }

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const rad = (angle * Math.PI) / 180;

      // 좌우 재귀 가지
      drawBranch(endX, endY, length * branchRatio, currentAngle - rad, currentDepth - 1);
      drawBranch(endX, endY, length * branchRatio, currentAngle + rad, currentDepth - 1);
    };

    const startX = width / 2;
    const startY = height - 15;
    const initialLength = height * 0.24;

    drawBranch(startX, startY, initialLength, 0, depth);
  }, [angle, depth, branchRatio, colorTheme]);

  // 3. 작품 저장하기 (localStorage)
  const handleSaveToGallery = () => {
    const defaultName = `프랙탈 트리 (${angle}°, ${depth}단)`;
    const title = workTitle.trim() || defaultName;

    const canvas = canvasRef.current;
    const thumbnail = canvas ? canvas.toDataURL('image/jpeg', 0.6) : null;

    const newItem = {
      id: 'fractal_' + Date.now(),
      title,
      angle,
      depth,
      branchRatio,
      colorTheme,
      createdAt: new Date().toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      thumbnail,
    };

    const updated = [newItem, ...savedList].slice(0, 15); // 최대 15개 저장
    setSavedList(updated);
    try {
      localStorage.setItem('mathclay_saved_fractals', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage limit exceeded, saving without large thumbnail', e);
      const lightweight = updated.map((item) => ({ ...item, thumbnail: null }));
      localStorage.setItem('mathclay_saved_fractals', JSON.stringify(lightweight));
    }

    setWorkTitle('');
    setSaveSuccessMsg(`"${title}" 저장이 완료되었습니다!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // 4. 저장된 작품 불러오기
  const handleLoadWork = (item) => {
    setAngle(item.angle);
    setDepth(item.depth);
    setBranchRatio(item.branchRatio);
    if (item.colorTheme) setColorTheme(item.colorTheme);
    setSaveSuccessMsg(`"${item.title}" 설정을 불러왔습니다!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // 5. 저장된 작품 삭제하기
  const handleDeleteWork = (id, e) => {
    e.stopPropagation();
    const updated = savedList.filter((item) => item.id !== id);
    setSavedList(updated);
    localStorage.setItem('mathclay_saved_fractals', JSON.stringify(updated));
  };

  // 6. 이미지 PNG 다운로드
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `MathClay_Fractal_${angle}deg_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setSaveSuccessMsg('🖼️ 고해상도 PNG 이미지가 다운로드되었습니다!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 테마 선택 탭 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {Object.entries(colorThemes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setColorTheme(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                colorTheme === key ? 'clay-pill-active text-white' : 'clay-pill-inactive text-clay-slate-600'
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>

        {/* 고화질 PNG 다운로드 버튼 */}
        <button
          onClick={handleDownloadPNG}
          className="clay-btn-teal px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm text-white hover:scale-105 transition-all"
          title="현재 프랙탈 캔버스를 이미지 파일로 다운로드"
        >
          <Download className="w-3.5 h-3.5" />
          <span>이미지(PNG) 다운로드</span>
        </button>
      </div>

      {/* 메인 캔버스 뷰 */}
      <div className="relative clay-inset p-3 bg-white flex items-center justify-center rounded-2xl shadow-inner">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          className="w-full h-auto max-h-[320px] rounded-xl shadow-sm bg-white"
        />

        {/* 상단 통계 뱃지 */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
          <span className="clay-badge px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-clay-purple shadow-sm">
            각도: {angle}°
          </span>
          <span className="clay-badge px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-teal-700 shadow-sm">
            깊이: {depth}단계 (가지 약 {Math.pow(2, depth + 1) - 1}개)
          </span>
          <span className="clay-badge px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-rose-600 shadow-sm">
            축소율: {branchRatio}
          </span>
        </div>

        {/* 저장 완료 알림 토스트 */}
        {saveSuccessMsg && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 clay-card px-4 py-2 rounded-full text-xs font-extrabold bg-white/95 text-clay-purple border border-purple-200 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 조작 슬라이더 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-clay-slate-600">
        <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between">
            <span>가지 분기 각도 (θ)</span>
            <span className="text-teal-600 font-extrabold">{angle}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
          />
        </div>

        <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between">
            <span>재귀 깊이 (Depth)</span>
            <span className="text-clay-purple font-extrabold">{depth}단계</span>
          </div>
          <input
            type="range"
            min="4"
            max="11"
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
          />
        </div>

        <div className="p-3 rounded-2xl bg-white/70 border border-white flex flex-col gap-1.5 shadow-sm">
          <div className="flex justify-between">
            <span>가지 축소 비율 (Ratio)</span>
            <span className="text-rose-500 font-extrabold">{branchRatio}</span>
          </div>
          <input
            type="range"
            min="0.55"
            max="0.80"
            step="0.02"
            value={branchRatio}
            onChange={(e) => setBranchRatio(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* 작품 저장 폼 (Save Card) */}
      <div className="clay-card p-4 bg-gradient-to-r from-purple-50/70 to-teal-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 border border-purple-100">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-clay-purple flex items-center justify-center flex-shrink-0 shadow-sm">
            <BookmarkPlus className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="프랙탈 작품 이름을 입력하세요 (예: 눈꽃 나무)"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
            className="clay-input flex-1 px-4 py-2 text-xs font-bold text-clay-slate-700 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => { setAngle(28); setDepth(9); setBranchRatio(0.72); }}
            className="clay-btn px-3 py-2 rounded-full text-xs font-bold text-clay-slate-600 flex items-center gap-1"
            title="기본값 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본값</span>
          </button>

          <button
            onClick={handleSaveToGallery}
            className="clay-btn-primary px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>내 보관함에 저장하기</span>
          </button>
        </div>
      </div>

      {/* 저장된 프랙탈 목록 갤러리 */}
      {savedList.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-clay-slate-700 flex items-center gap-1.5">
              <FolderHeart className="w-4 h-4 text-rose-500" />
              <span>내가 저장한 프랙탈 보관함 ({savedList.length}개)</span>
            </span>
            <span className="text-[11px] text-clay-slate-400">
              클릭 시 즉시 해당 수치로 불러옵니다
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {savedList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadWork(item)}
                className="clay-card p-2.5 bg-white/95 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-300 hover:scale-[1.02] transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-clay-purple flex items-center justify-center font-bold text-xs flex-shrink-0 border border-purple-100">
                      🌱
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-extrabold text-clay-slate-800 truncate group-hover:text-clay-purple">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-clay-slate-400">
                      {item.angle}° · {item.depth}단계 · {item.createdAt}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteWork(item.id, e)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex-shrink-0"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
