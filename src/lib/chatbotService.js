/**
 * 클레이 AI 수학 튜터 통신 서비스
 */

export const RECOMMENDED_QUESTIONS = [
  {
    id: 'diff-tangent',
    category: '수학 II',
    label: '📌 미분계수와 접선의 기울기',
    question: "미분계수 f'(a)의 기하학적 의미와 접선의 방정식 공식이 왜 그렇게 나오는지 쉽게 설명해줘!",
  },
  {
    id: 'unit-circle',
    category: '수학 I',
    label: '📐 단위원과 삼각함수의 관계',
    question: '단위원(반지름이 1인 원)에서 사인(sin)과 코사인(cos)이 어떻게 정의되는지 좌표 평면으로 설명해줘!',
  },
  {
    id: 'riemann-integral',
    category: '미적분',
    label: '∫ 구분구적법과 정적분의 극한',
    question: '구분구적법에서 직사각형의 개수를 무한히 늘리면 어떻게 매끄러운 곡선 아래 넓이(정적분)가 되는지 원리를 알려줘!',
  },
  {
    id: 'fractal-math',
    category: '기하 & 대수',
    label: '🌲 프랙탈과 등비수열의 극한',
    question: '프랙탈 나무나 눈꽃 곡선에서 단계가 진행될 때 가지 수와 총 길이는 어떤 수열 규칙을 따르고 왜 자기유사성을 갖는지 설명해줘!',
  },
  {
    id: 'normal-dist',
    category: '확률과 통계',
    label: '🎲 정규분포 68-95-99.7 법칙',
    question: '골턴보드나 시험 점수에서 정규분포 종 모양 곡선이 나타나는 이유와 표준편차(σ)의 직관적 의미를 알려줘!',
  },
  {
    id: 'conic-sections',
    category: '기하',
    label: '🎯 타원·포물선의 초점과 궤적',
    question: '이차곡선(타원, 포물선, 쌍곡선)에서 초점(Focus)이란 무엇이고 실생활에서 안테나나 조명에 어떻게 쓰이는지 설명해줘!',
  },
];

export async function askMathTutor(messages) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // API Key가 미설정된 경우 사용자 친화적 가이드
      if (data.error && data.error.includes('OPENAI_API_KEY')) {
        throw new Error(
          '🔑 OPENAI_API_KEY 환경변수가 설정되지 않았습니다.\nVercel 프로젝트의 Settings > Environment Variables 메뉴에서 OPENAI_API_KEY를 등록하고 재배포해주세요.'
        );
      }
      throw new Error(data.error || `응답 오류 (${res.status})`);
    }

    return data.reply;
  } catch (err) {
    console.warn('API route call error, checking client fallback:', err.message);

    // 클라이언트 사이드 키 폴백 (VITE_OPENAI_API_KEY가 있을 경우)
    const clientKey = 
      import.meta.env.VITE_OPENAI_API_KEY || 
      import.meta.env.OPENAI_API_KEY;

    if (clientKey) {
      try {
        const directRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${clientKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `당신은 대한민국 고등학교 학생들의 수학 학습을 도와주는 친절하고 명쾌한 AI 수학 선생님 '클레이 쌤(Clay Math Tutor)'입니다.
수식과 개념을 알기 쉽게 정리하고, MathClay의 시뮬레이터(단위원, 미분계수 접선, 구분구적법, 프랙탈 등)를 직접 만져보도록 안내해주세요.`
              },
              ...messages.slice(-8).map((m) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
              }))
            ],
            temperature: 0.7,
            max_tokens: 1200,
          }),
        });

        const directData = await directRes.json();
        if (directRes.ok) {
          return directData.choices?.[0]?.message?.content || '답변을 불러오지 못했습니다.';
        }
      } catch (directErr) {
        console.error('Direct OpenAI call failed:', directErr);
      }
    }

    // 최종 에러 전달
    throw err;
  }
}
