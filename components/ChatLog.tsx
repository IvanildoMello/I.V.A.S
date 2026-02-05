
import React, { useEffect, useRef } from 'react';
import { TranscriptionItem } from '../types';

interface ChatLogProps {
  transcripts: TranscriptionItem[];
}

const ChatLog: React.FC<ChatLogProps> = ({ transcripts }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  return (
    <div className="w-full h-full overflow-y-auto px-3 md:px-4 py-4 space-y-3 scrollbar-hide">
      {transcripts.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
           </svg>
           <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">Silêncio no momento...</p>
        </div>
      ) : (
        transcripts.map((item) => (
          <div
            key={item.id}
            className={`flex ${item.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-4 py-2.5 text-xs md:text-base shadow-lg transition-all animate-[popIn_0.3s_ease-out] ${
                item.isUser
                  ? 'bg-blue-600/20 text-blue-50 border border-blue-500/30 rounded-br-sm'
                  : 'bg-slate-800/60 text-slate-200 border border-slate-700/50 rounded-bl-sm'
              }`}
            >
              {item.text}
            </div>
          </div>
        ))
      )}
      <div ref={endRef} />
      <style>{`
        @keyframes popIn {
            from { opacity: 0; transform: scale(0.95) translateY(5px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatLog;
