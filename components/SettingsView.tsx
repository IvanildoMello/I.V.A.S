import React, { useState, useEffect } from 'react';
import { ProficiencyLevel, UserSettings } from '../types';

interface SettingsViewProps {
  onStart: (settings: UserSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<ProficiencyLevel>(ProficiencyLevel.BEGINNER);
  const [topic, setTopic] = useState('Daily Routine');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart({ name, level, topic });
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto px-4 md:px-0 transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="relative group">
        {/* Decorative background glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        {/* Main Card */}
        <div className="relative bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.75rem] border border-white/10 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8 md:mb-10 space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 mb-2 md:mb-4 shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
              I.V.A.S
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-medium uppercase tracking-widest">Personal English Tutor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">What should I call you?</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-300"
                  placeholder="e.g. Maria"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Proficiency Level */}
            <div className="space-y-2 md:space-y-3">
              <label className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Proficiency Level</label>
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                {Object.values(ProficiencyLevel).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`relative overflow-hidden group/btn text-left px-4 py-3 md:px-5 md:py-4 rounded-xl border transition-all duration-300 ${
                      level === lvl
                        ? 'bg-blue-600 border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.3)] transform scale-[1.02]'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="relative z-10 flex justify-between items-center">
                      <span className={`font-semibold text-sm md:text-base ${level === lvl ? 'text-white' : 'group-hover/btn:text-slate-200'}`}>{lvl}</span>
                      {level === lvl && (
                        <span className="flex h-2 w-2 md:h-3 md:w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-white"></span>
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Topic to discuss</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all duration-300"
                  placeholder="e.g. Travel, Job Interview"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-3 md:py-4 rounded-xl shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center justify-center gap-2 text-base md:text-lg">
                Start Conversation
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </form>
        </div>
      </div>
      
      {/* Footer hint */}
      <p className="text-center text-slate-500 text-[10px] md:text-xs mt-6 md:mt-8">
        Powered by Gemini 2.5 • Real-time Audio
      </p>
    </div>
  );
};

export default SettingsView;