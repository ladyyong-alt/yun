export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
  }

  const apiKey = 
    process.env.OPENAI_API_KEY || 
    process.env.VITE_OPENAI_API_KEY || 
    process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      error: 'OPENAI_API_KEY 환경변수가 설정되지 않았습니다. Vercel 대시보드 Settings > Environment Variables에 OPENAI_API_KEY를 등록해주세요.'
    });
  }

  try {
    const { messages, userQuestion } = req.body || {};

    const systemPrompt = `당신은 대한민국 중·고등학교 학생들의 수학 학습을 도와주는 친절하고 명쾌한 AI 수학 선생님 '클레이 쌤(Clay Math Tutor)'입니다.

다음 가이드라인을 철저히 준수하여 학생에게 친절하고 깊이 있는 답변을 제공하세요:
1. [학생 눈높이 맞춤형 설명]: 
   - 중학교 수학, 공통수학1·2, 수학 I, 수학 II, 미적분, 기하, 확률과 통계의 핵심 개념을 학생이 이해하기 쉬운 언어로 설명합니다.
2. [원리와 직관 중심]: 
   - 단순 암기식 공식 전달을 지양하고, 기하학적 의미나 그래프 개형, 극한의 원리 등 시각적 직관을 함께 제시합니다.
3. [수식 가독성 극대화]: 
   - 수식은 줄바꿈과 LaTeX 표기($...$, $$...$$) 또는 알아보기 쉬운 기호로 깔끔하게 정돈하여 제공합니다.
4. [MathClay 시뮬레이터 연계 추천]: 
   - 관련된 경우 우리 웹사이트(MathClay)에 있는 시뮬레이터를 직접 조작해보라고 권유하세요:
     • 삼각함수, 주기, 호도법: [단위원 회전 시뮬레이터]
     • 미분계수, 접선, 순간변화율: [미분계수와 접선 시뮬레이터]
     • 정적분, 구분구적법, 면적 오차: [구분구적법과 정적분 시뮬레이터]
     • 포물선, 타원, 쌍곡선, 초점: [이차곡선 탐구기]
     • 등비수열의 합, 재귀 수열, 차원: [프랙탈 트리 시뮬레이터]
     • 정규분포, 중심극한정리: [골턴보드 시뮬레이터]
     • 원주율, 기하학적 확률: [몬테카를로 파이 시뮬레이터]
     • 복합 함수/공간도형: [GeoGebra/Desmos 인터랙티브 랩]
5. [따뜻한 격려와 생각할 거리]: 
   - 마지막에는 칭찬과 함께 학생이 더 깊게 탐구해볼 수 있는 '생각해볼 만한 질문' 1가지를 가볍게 건네주세요.`;

    const chatHistory = Array.isArray(messages) && messages.length > 0
      ? messages.slice(-10).map((m) => ({
          role: m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant',
          content: m.text || m.content || '',
        }))
      : [{ role: 'user', content: userQuestion || '안녕하세요 선생님!' }];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `OpenAI API 오류 (${response.status})`;
      console.error('OpenAI API Error:', errMsg);
      return res.status(response.status).json({ error: errMsg });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '답변을 생성하지 못했습니다. 다시 질문해주세요.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat API Error:', err);
    return res.status(500).json({ error: `서버 내부 오류: ${err.message}` });
  }
}
