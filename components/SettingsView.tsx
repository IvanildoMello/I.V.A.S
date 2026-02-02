import React, { useState, useEffect } from 'react';
import { ProficiencyLevel, UserSettings } from '../types';

interface SettingsViewProps {
  onStart: (settings: UserSettings) => void;
}

const translations = {
  pt: {
    subtitle: "Seu Tutor Pessoal de Inglês",
    nameLabel: "COMO DEVO TE CHAMAR?",
    namePlaceholder: "ex: Maria",
    levelLabel: "NÍVEL DE PROFICIÊNCIA",
    levels: {
      [ProficiencyLevel.BEGINNER]: "Iniciante (A1-A2)",
      [ProficiencyLevel.INTERMEDIATE]: "Intermediário (B1-B2)",
      [ProficiencyLevel.ADVANCED]: "Avançado (C1-C2)",
    },
    topicLabel: "TÓPICO PARA CONVERSAR",
    topicPlaceholder: "ex: Viagem, Entrevista de emprego",
    startButton: "Começar Conversa",
    footer: "Desenvolvido com Gemini 2.5 • Áudio em Tempo Real"
  },
  en: {
    subtitle: "Personal English Tutor",
    nameLabel: "WHAT SHOULD I CALL YOU?",
    namePlaceholder: "e.g. Maria",
    levelLabel: "PROFICIENCY LEVEL",
    levels: {
      [ProficiencyLevel.BEGINNER]: "Beginner (A1-A2)",
      [ProficiencyLevel.INTERMEDIATE]: "Intermediate (B1-B2)",
      [ProficiencyLevel.ADVANCED]: "Advanced (C1-C2)",
    },
    topicLabel: "TOPIC TO DISCUSS",
    topicPlaceholder: "e.g. Travel, Job Interview",
    startButton: "Start Conversation",
    footer: "Powered by Gemini 2.5 • Real-time Audio"
  }
};

const SettingsView: React.FC<SettingsViewProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<ProficiencyLevel>(ProficiencyLevel.BEGINNER);
  const [topic, setTopic] = useState('');
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<'pt' | 'en'>('pt');

  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Default topic if empty
      const finalTopic = topic.trim() || (lang === 'pt' ? 'Rotina Diária' : 'Daily Routine');
      onStart({ name, level, topic: finalTopic });
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto px-4 md:px-0 transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="relative group">
        {/* Decorative background glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        {/* Main Card */}
        <div className="relative bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.75rem] border border-white/10 shadow-2xl">
          
          {/* Language Toggle */}
          <button 
            onClick={() => setLang(prev => prev === 'pt' ? 'en' : 'pt')}
            className="absolute top-6 right-6 text-xs font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-full px-3 py-1 transition-all"
            type="button"
          >
            {lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT'}
          </button>

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
            <p className="text-slate-400 text-xs md:text-sm font-medium uppercase tracking-widest">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">{t.nameLabel}</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder={t.namePlaceholder}
                />
              </div>
            </div>

            {/* Level Selector */}
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">{t.levelLabel}</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(ProficiencyLevel).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`relative px-4 py-3 md:py-4 rounded-xl text-left border transition-all duration-300 flex items-center group/btn ${
                      level === lvl
                        ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                        : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center transition-colors ${
                       level === lvl ? 'border-blue-400 bg-blue-400' : 'border-slate-600 group-hover/btn:border-slate-500'
                    }`}>
                        {level === lvl && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm md:text-base font-medium">{t.levels[lvl]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">{t.topicLabel}</label>
               <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={t.topicPlaceholder}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <div className="relative rounded-[11px] bg-slate-900/50 group-hover:bg-transparent transition-colors duration-300 px-8 py-3.5 md:py-4">
                 <div className="flex items-center justify-center gap-2">
                     <span className="font-bold text-white text-base md:text-lg tracking-wide group-hover:scale-105 transition-transform">{t.startButton}</span>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                     </svg>
                 </div>
              </div>
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 origin-left"></div>
            </button>

            <div className="text-center pt-2">
                <p className="text-[10px] text-slate-500 font-medium">{t.footer}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;