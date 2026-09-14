import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-chat-dev-server',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                const apiKey = env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
                if (!apiKey) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({
                    error: 'OPENAI_API_KEY 환경변수가 설정되지 않았습니다. .env 파일에 OPENAI_API_KEY=sk-... 를 설정해주세요.'
                  }));
                  return;
                }

                try {
                  const parsed = JSON.parse(body || '{}');
                  const messages = parsed.messages || [];

                  const systemPrompt = `당신은 대한민국 중·고등학교 학생들의 수학 학습을 도와주는 친절하고 명쾌한 AI 수학 선생님 '클레이 쌤(Clay Math Tutor)'입니다.
공통수학1·2, 수학 I, 수학 II, 미적분, 기하, 확률과 통계의 핵심 개념과 문제 풀이를 알기 쉽게 설명하고, 우리 웹사이트의 시뮬레이터(단위원, 미분계수 접선, 구분구적법, 프랙탈 등)를 직접 만져보도록 안내하세요.`;

                  const chatHistory = Array.isArray(messages) && messages.length > 0
                    ? messages.slice(-10).map(m => ({
                        role: m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant',
                        content: m.text || m.content || '',
                      }))
                    : [{ role: 'user', content: '안녕하세요!' }];

                  const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${apiKey.trim()}`,
                    },
                    body: JSON.stringify({
                      model: 'gpt-4o-mini',
                      messages: [
                        { role: 'system', content: systemPrompt },
                        ...chatHistory,
                      ],
                      temperature: 0.7,
                      max_tokens: 1200,
                    }),
                  });

                  const data = await openAiRes.json();
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  if (!openAiRes.ok) {
                    res.statusCode = openAiRes.status;
                    res.end(JSON.stringify({ error: data.error?.message || 'OpenAI API 오류' }));
                  } else {
                    res.statusCode = 200;
                    res.end(JSON.stringify({ reply: data.choices?.[0]?.message?.content || '' }));
                  }
                } catch (e) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            } else {
              res.statusCode = 405;
              res.end('Method Not Allowed');
            }
          });
        }
      }
    ],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_', 'OPENAI_'],
    server: {
      port: 3000,
      open: true
    }
  };
})
