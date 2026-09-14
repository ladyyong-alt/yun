import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, X, Sparkles, Minimize2, Maximize2, Trash2, 
  Copy, Check, MessageSquare, Lightbulb, ChevronRight, RefreshCw, HelpCircle
} from 'lucide-react';
import { askMathTutor, RECOMMENDED_QUESTIONS } from '../lib/chatbotService';
import confetti from 'canvas-confetti';

export default function MathChatbot({ isOpen, onToggle, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: `안녕하세요! 🧑‍🏫 대한민국 수학 전문 AI 튜터 **클레이 쌤**이에요.\n\n공통수학, 수학 I, 수학 II, 미적분, 기하, 확률과 통계 등 공부하다 막힌 개념이나 증명 과정, 수식 유도 원리를 무엇이든 편하게 물어보세요!\n\n아래의 **추천 질문**을 누르시면 즉시 답변을 들어보실 수 있습니다. 👇`,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showGreeting, setShowGreeting] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowGreeting(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // 7초 후 플로팅 말풍선 자동 닫기
  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  // 질문 전송 처리
  const handleSendMessage = async (textToSend) => {
    const question = (textToSend || inputValue).trim();
    if (!question || isLoading) return;

    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: question,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await askMathTutor(updatedHistory);
      const botMsg = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);

      // 성공적인 수학 답변 수신 시 가벼운 축하 효과
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { x: 0.85, y: 0.7 },
      });
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        sender: 'bot',
        isError: true,
        text: `⚠️ ${err.message || '답변을 생성하는 도중 오류가 발생했습니다.'}\n\n💡 Vercel 환경변수에 OPENAI_API_KEY가 등록되어 있는지 확인해주세요.`,
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 엔터키 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 답변 복사
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 대화 초기화
  const handleClearChat = () => {
    if (confirm('대화 기록을 모두 비우고 처음부터 다시 시작할까요?')) {
      setMessages([
        {
          id: 'welcome_' + Date.now(),
          sender: 'bot',
          text: '대화가 초기화되었습니다. 새로운 수학 질문을 입력해주세요! ✨',
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // 텍스트 내 서식 간단 렌더링 (줄바꿈, 볼드, 코드블록)
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // 볼드 처리 (**텍스트**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-extrabold text-clay-purple-dark">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // 불릿 기호인 경우
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());

      return (
        <p key={idx} className={`${idx > 0 ? 'mt-1.5' : ''} ${isBullet ? 'pl-2 text-clay-slate-800' : ''}`}>
          {formattedLine.length > 0 ? formattedLine : '\u00A0'}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. 우하단 플로팅 런처 버튼 및 말풍선 */}
      <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex flex-col items-end gap-2 select-none">
        {/* 첫 방문 시 인사 말풍선 */}
        {showGreeting && !isOpen && (
          <div className="clay-card p-3 max-w-xs bg-white text-xs font-bold text-clay-slate-800 shadow-xl border border-purple-200 animate-bounce flex items-center gap-2">
            <span className="text-base">👋</span>
            <span>수학 개념이나 문제 막힐 땐 질문해줘!</span>
            <button 
              onClick={() => setShowGreeting(false)}
              className="p-1 hover:bg-slate-100 rounded-full text-clay-slate-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* 플로팅 런처 동그라미 버튼 */}
        <button
          onClick={onToggle}
          aria-label="AI 수학 튜터 열기"
          className={`clay-btn-primary p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 text-white transition-transform duration-300 hover:scale-110 active:scale-95 ${
            isOpen ? 'bg-gradient-to-r from-clay-purple to-indigo-700 ring-4 ring-purple-200' : ''
          }`}
          title="AI 수학 튜터 열기"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-white animate-pulse" />
              <span className="text-xs font-extrabold hidden md:inline-block pr-1">
                AI 수학 튜터
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white shadow-sm" />
            </>
          )}
        </button>
      </div>

      {/* 2. 챗봇 대화창 모달 */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-3 sm:right-7 z-50 clay-card bg-white/95 backdrop-blur-md border border-purple-200/80 shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
            isExpanded
              ? 'w-[calc(100vw-1.5rem)] sm:w-[680px] h-[86vh] max-w-3xl'
              : 'w-[calc(100vw-1.5rem)] sm:w-[440px] h-[580px] max-h-[82vh]'
          }`}
        >
          {/* 챗봇 헤더 */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight">클레이 AI 수학 튜터</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">GPT-4o</span>
                </div>
                <span className="text-[11px] text-white/80 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  실시간 수학 질의응답 온라인
                </span>
              </div>
            </div>

            {/* 헤더 액션 버튼들 */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all"
                title="대화 기록 비우기"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all hidden sm:block"
                title={isExpanded ? '창 축소' : '창 확대'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 추천 질문 칩 (가로 스크롤) */}
          <div className="px-3.5 py-2 bg-purple-50/60 border-b border-purple-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-extrabold text-clay-purple whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>추천 질문:</span>
            </span>
            {RECOMMENDED_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSendMessage(q.question)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-clay-slate-700 border border-purple-200/70 hover:border-clay-purple hover:text-clay-purple hover:shadow-sm whitespace-nowrap transition-all flex items-center gap-1 active:scale-95"
              >
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          {/* 대화 메시지 영역 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  <div className={`flex items-start gap-2 max-w-[88%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* 아바타 */}
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-clay-purple to-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* 말풍선 */}
                    <div
                      className={`relative p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                        isUser
                          ? 'clay-card bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-tr-none'
                          : msg.isError
                          ? 'clay-card bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none font-medium'
                          : 'clay-card bg-white text-clay-slate-800 border border-purple-100 rounded-tl-none font-normal'
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      {/* 복사 버튼 (봇 응답 hover 시 노출) */}
                      {!isUser && !msg.isError && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-[10px] text-clay-slate-400">
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="flex items-center gap-1 hover:text-clay-purple transition-colors p-1 rounded hover:bg-purple-50"
                            title="답변 복사"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-bold">복사완료</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>답변 복사</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 전송 시각 */}
                  <span className="text-[9px] text-clay-slate-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {/* AI 생각 중 (로딩 표시) */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-clay-purple to-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="clay-card p-3 rounded-2xl rounded-tl-none bg-white border border-purple-100 text-xs font-bold text-clay-purple flex items-center gap-2 shadow-sm">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-clay-purple" />
                  <span>수학적 원리를 풀이하고 수식을 정리하는 중입니다...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력창 영역 */}
          <div className="p-3 bg-white border-t border-purple-100 flex flex-col gap-2">
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="수학 개념이나 문제 풀이 과정을 질문하세요... (Enter로 전송)"
                disabled={isLoading}
                className="clay-input w-full pl-3.5 pr-12 py-2.5 text-xs text-clay-slate-800 placeholder-clay-slate-400 resize-none font-medium max-h-24 focus:ring-2 focus:ring-purple-300"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className={`absolute right-2 p-2 rounded-xl text-white shadow-sm transition-all duration-200 ${
                  inputValue.trim() && !isLoading
                    ? 'clay-btn-primary bg-clay-purple hover:scale-105 active:scale-95'
                    : 'bg-slate-300 cursor-not-allowed text-slate-400'
                }`}
                title="질문 전송"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-clay-slate-400 px-1">
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>공통수학, 수I, 수II, 미적분, 기하, 확통 맞춤 튜터</span>
              </span>
              <span>Shift+Enter 줄바꿈</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
