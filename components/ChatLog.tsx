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
    <div className="w-full h-full overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
      {transcripts.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-60">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
           </svg>
           <p className="text-sm font-medium">Conversation history will appear here</p>
        </div>
      ) : (
        transcripts.map((item) => (
          <div
            key={item.id}
            className={`flex ${item.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm md:text-base shadow-sm backdrop-blur-sm transition-all ${
                item.isUser
                  ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-br-none'
                  : 'bg-slate-700/40 text-slate-200 border border-slate-600/30 rounded-bl-none'
              }`}
            >
              {item.text}
            </div>
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ChatLog;