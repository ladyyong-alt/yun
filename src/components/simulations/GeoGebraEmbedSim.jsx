import React, { useState } from 'react';
import { ExternalLink, Sparkles, Compass, Box, Calculator, CheckCircle2 } from 'lucide-react';

export default function GeoGebraEmbedSim() {
  const [activeTool, setActiveTool] = useState('geogebra-graphing');

  const tools = {
    'geogebra-graphing': {
      title: 'GeoGebra 그래픽 계산기 (고교 공통·수학 I/II)',
      url: 'https://www.geogebra.org/calculator',
      desc: '함수 그래프, 접선, 교점, 미적분 수식을 자유자재로 입력하고 실시간으로 시각화할 수 있는 전세계 표준 고교 수학 계산기입니다.',
      presets: ['y = x^3 - 3x', 'y = 2^x, y = log2(x)', 'x^2 + y^2 = 25', 'y = sin(2x) + 1'],
    },
    'geogebra-3d': {
      title: 'GeoGebra 3D 계산기 (고등 기하·공간도형)',
      url: 'https://www.geogebra.org/3d',
      desc: '공간좌표계에서 평면의 방정식, 구의 방정식, 공간벡터의 내적과 정사영을 3차원으로 회전하며 탐구합니다.',
      presets: ['x^2 + y^2 + z^2 = 9', '2x + 3y - z = 4', 'Curve(cos(t), sin(t), t, t, 0, 10)'],
    },
    'desmos': {
      title: 'Desmos 공학용 그래프 계산기 (수능·모의고사 분석용)',
      url: 'https://www.desmos.com/calculator?lang=ko',
      desc: '부드러운 슬라이더 인터랙션으로 매개변수 a, b, k의 변화에 따른 그래프의 이동과 실근의 개수를 직관적으로 분석합니다.',
      presets: ['y = a(x - p)^2 + q', 'f(x) = |x^2 - 4| - k', 'y = e^x, y = ln(x)'],
    }
  };

  const current = tools[activeTool];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 도구 선택 탭 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTool('geogebra-graphing')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTool === 'geogebra-graphing' ? 'clay-btn-primary text-white' : 'clay-btn text-clay-slate-600'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>GeoGebra 그래픽</span>
          </button>

          <button
            onClick={() => setActiveTool('geogebra-3d')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTool === 'geogebra-3d' ? 'clay-btn-teal text-white' : 'clay-btn text-clay-slate-600'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>GeoGebra 3D 공간도형</span>
          </button>

          <button
            onClick={() => setActiveTool('desmos')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTool === 'desmos' ? 'clay-btn-peach text-white' : 'clay-btn text-clay-slate-600'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Desmos 그래프</span>
          </button>
        </div>

        {/* 새 창 열기 링크 */}
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="clay-btn px-3.5 py-1.5 text-xs font-bold text-clay-purple flex items-center gap-1.5 hover:scale-105 transition-all"
        >
          <span>전체 화면 새 창으로 열기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 내장 인터랙티브 웹 앱 Iframe 컨테이너 */}
      <div className="clay-inset p-2 bg-white rounded-2xl overflow-hidden shadow-inner relative">
        <iframe
          key={activeTool}
          src={current.url}
          title={current.title}
          className="w-full h-[450px] sm:h-[500px] rounded-xl border border-slate-200"
          allow="fullscreen"
          loading="lazy"
        />
      </div>

      {/* 고등학생을 위한 추천 탐구 예시 */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 flex flex-col gap-1">
          <span className="text-xs font-extrabold text-clay-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {current.title}
          </span>
          <p className="text-xs text-clay-slate-500">
            {current.desc}
          </p>
        </div>

        <div className="sm:col-span-4 flex flex-col gap-1 sm:items-end">
          <span className="text-[11px] font-bold text-clay-slate-500">고교 추천 수식 프리셋</span>
          <div className="flex flex-wrap gap-1">
            {current.presets.map((preset, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-clay-purple border border-purple-100"
              >
                {preset}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
