'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { X } from 'lucide-react';

const STARTER_QUESTIONS = [
  'What watches look best on smaller wrists?',
  'Will it fit a 6.5″ wrist?',
  'Return policy?',
];

export const MultimodalChatWidget: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    sendMessage,
    isAgentTyping,
    activeProduct,
  } = useStore();

  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userMessageCount = chatMessages.filter((m) => m.sender === 'user').length;
  const isSessionLimitReached = userMessageCount >= 25;

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen, isAgentTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAgentTyping || isSessionLimitReached) return;
    const msg = input.trim();
    setInput('');
    sendMessage(msg, activeProduct);
  };

  const handlePromptClick = (prompt: string) => {
    if (isAgentTyping || isSessionLimitReached) return;
    sendMessage(prompt, activeProduct);
  };

  return (
    <>
      {/* 10. Docked Tab on the right edge of the viewport (no glow, no sparkle) */}
      {!isChatOpen && (
        <>
          {/* Desktop: slim vertical docked tab */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="hidden sm:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-surface border-l border-y border-hairline hover:border-champagne hover:bg-surface-2 transition-all duration-180 py-4 px-2 cursor-pointer shadow-lg group rounded-l-[4px]"
            aria-label="Open Mono Time concierge"
          >
            <span className="[writing-mode:vertical-rl] rotate-180 font-mono text-[11px] uppercase tracking-[0.14em] text-muted group-hover:text-bone transition-colors">
              Ask about this watch
            </span>
          </button>

          {/* Mobile: small bottom-right text button */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="sm:hidden fixed bottom-16 right-4 z-40 bg-surface border border-hairline py-2 px-3 rounded-[4px] shadow-lg font-mono text-[11px] uppercase tracking-wider text-muted active:text-bone"
            aria-label="Open Mono Time concierge"
          >
            Ask about this watch
          </button>
        </>
      )}

      {/* Backdrop overlay */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={() => setIsChatOpen(false)}
        />
      )}

      {/* 10. Right-side drawer: 400px desktop, full-screen mobile on --surface with hairline left border */}
      {isChatOpen && (
        <aside
          role="dialog"
          aria-label="Mono Time concierge drawer"
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-surface border-l border-hairline flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        >
          {/* Header: Newsreader title + close button */}
          <div className="p-4 sm:p-5 border-b border-hairline flex items-center justify-between bg-surface">
            <div className="flex flex-col">
              <h3 className="font-display text-xl text-bone font-normal leading-tight">
                Mono Time concierge
              </h3>
              {activeProduct && (
                <span className="font-mono text-[10px] text-faint tracking-wider truncate max-w-[280px]">
                  {activeProduct.title}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 text-muted hover:text-bone transition-colors"
              aria-label="Close concierge drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Timeline */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Assistant message: plain text on surface with small mono label CONCIERGE above */}
                {msg.sender === 'agent' ? (
                  <div className="flex flex-col gap-1 max-w-[94%]">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">
                      Concierge
                    </span>
                    <p className="font-sans text-xs text-bone leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>

                    {/* Source Chips: small mono chips for retrieved documents */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.sources.map((source, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center text-[10px] font-mono text-faint border border-hairline bg-surface-2 px-2 py-0.5 rounded-[2px]"
                          >
                            SOURCE · {source}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Prompt suggestions if provided by agent */}
                    {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.suggestedPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handlePromptClick(prompt)}
                            className="text-[11px] font-sans text-muted hover:text-bone border border-hairline hover:border-champagne px-2.5 py-1 rounded-[4px] transition-colors text-left"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* User message: sits in --surface-2 block, right-aligned */
                  <div className="max-w-[85%] bg-surface-2 border border-hairline rounded-[4px] p-3 text-xs text-bone font-sans leading-relaxed">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator: three small champagne dots with opacity animation */}
            {isAgentTyping && (
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">
                  Concierge
                </span>
                <div className="flex items-center gap-1.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse [animation-delay:200ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse [animation-delay:400ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Starter Questions: hairline-bordered text chips */}
          <div className="px-4 py-2 border-t border-hairline flex flex-wrap gap-1.5 bg-surface">
            {STARTER_QUESTIONS.map((question, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(question)}
                disabled={isAgentTyping || isSessionLimitReached}
                className="text-[11px] font-sans text-muted hover:text-bone border border-hairline hover:border-champagne px-2.5 py-1 rounded-[4px] transition-colors disabled:opacity-40"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Input: hairline-underlined text field with champagne Send button */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-hairline flex items-center gap-3 bg-surface"
          >
            <input
              type="text"
              placeholder={
                isSessionLimitReached
                  ? 'Session inquiry limit reached. Email concierge@monotime.com'
                  : isAgentTyping
                  ? 'Concierge is replying...'
                  : 'Ask about dial, movement, or sizing...'
              }
              value={input}
              disabled={isAgentTyping || isSessionLimitReached}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-b border-hairline-strong focus:border-champagne text-xs text-bone placeholder-muted py-2 px-1 focus:outline-none transition-colors font-sans disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isAgentTyping || isSessionLimitReached}
              className="font-mono text-xs uppercase tracking-wider text-champagne hover:text-champagne-dim disabled:opacity-30 transition-colors font-medium py-1 px-2"
            >
              Send
            </button>
          </form>

          {/* Footer: one line */}
          <div className="py-2 px-4 border-t border-hairline bg-surface text-center">
            <p className="font-mono text-[10px] text-faint">
              Answers are generated from our product and policy documents.
            </p>
          </div>
        </aside>
      )}
    </>
  );
};
