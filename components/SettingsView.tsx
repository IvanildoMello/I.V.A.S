import React, { useState, useEffect } from 'react';
import { ProficiencyLevel, UserSettings } from '../types';

interface SettingsViewProps {
  onStart: (settings: UserSettings) => void;
}

const translations = {
  pt: {
    subtitle: "Seu Tutor Pessoal de Inglês",
    welcomeBack: "BEM-VINDO DE VOLTA!",
    nameLabel: "COMO DEVO TE CHAMAR?",
    namePlaceholder: "ex: Maria",
    levelLabel: "SELECIONE SEU NÍVEL",
    levels: [
      { id: ProficiencyLevel.BEGINNER, title: "Iniciante", exact: "A1-A2", desc: "Frases básicas e cotidiano." },
      { id: ProficiencyLevel.INTERMEDIATE, title: "Intermediário", exact: "B1-B2", desc: "Expressar opiniões e situações." },
      { id: ProficiencyLevel.ADVANCED, title: "Avançado", exact: "C1-C2", desc: "Fluência e temas complexos." },
    ],
    topicLabel: "TÓPICO PARA CONVERSAR",
    topicPlaceholder: "ex: Viagem, Entrevista",
    startButton: "Continuar Conversa",
    footer: "Gemini 2.5 • Áudio Real-time"
  },
  en: {
    subtitle: "Personal English Tutor",
    welcomeBack: "WELCOME BACK!",
    nameLabel: "WHAT SHOULD I CALL YOU?",
    namePlaceholder: "e.g. Maria",
    levelLabel: "SELECT YOUR LEVEL",
    levels: [
      { id: ProficiencyLevel.BEGINNER, title: "Beginner", exact: "A1-A2", desc: "Basic sentences & routine." },
      { id: ProficiencyLevel.INTERMEDIATE, title: "Intermediate", exact: "B1-B2", desc: "Express opinions & handle situations." },
      { id: ProficiencyLevel.ADVANCED, title: "Advanced", exact: "C1-C2", desc: "Fluency & complex topics." },
    ],
    topicLabel: "TOPIC TO DISCUSS",
    topicPlaceholder: "e.g. Travel, Interview",
    startButton: "Resume Lesson",
    footer: "Powered by Gemini 2.5 • Audio"
  }
};

const SettingsView: React.FC<SettingsViewProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<ProficiencyLevel>(ProficiencyLevel.BEGINNER);
  const [topic, setTopic] = useState('');
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [isReturning, setIsReturning] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem('ivas_user_name');
    const savedLevel = localStorage.getItem('ivas_user_level') as ProficiencyLevel;
    if (savedName) {
      setName(savedName);
      setIsReturning(true);
    }
    if (savedLevel && Object.values(ProficiencyLevel).includes(savedLevel)) {
      setLevel(savedLevel);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('ivas_user_name', name.trim());
      localStorage.setItem('ivas_user_level', level);
      const finalTopic = topic.trim() || (lang === 'pt' ? 'Rotina Diária' : 'Daily Routine');
      onStart({ name, level, topic: finalTopic });
    }
  };

  return (
    <div className={`w-full transition-all duration-1000 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="relative group max-w-[92%] mx-auto md:max-w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-slate-900/95 backdrop-blur-2xl p-5 md:p-8 rounded-[1.75rem] border border-white/10 shadow-2xl">
          
          <button 
            onClick={() => setLang(prev => prev === 'pt' ? 'en' : 'pt')}
            className="absolute top-5 right-5 text-[10px] font-bold text-slate-400 hover:text-white border border-slate-700 rounded-full px-2.5 py-1 transition-all z-20"
            type="button"
          >
            {lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT'}
          </button>

          <div className="text-center mb-6 md:mb-10 space-y-1">
            <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
              I.V.A.S
            </h1>
            <p className="text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em]">
              {isReturning ? t.welcomeBack : t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.nameLabel}</label>
              <div className="relative group/input">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-slate-600 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder={t.namePlaceholder}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.levelLabel}</label>
              <div className="flex flex-col gap-2">
                {t.levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setLevel(lvl.id)}
                    className={`relative p-3 md:p-4 rounded-xl text-left border transition-all duration-300 ${
                      level === lvl.id
                        ? 'bg-blue-600/10 border-blue-500/60 ring-1 ring-blue-500/20'
                        : 'bg-slate-800/20 border-slate-700/40 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs md:text-base font-bold truncate ${level === lvl.id ? 'text-white' : 'text-slate-300'}`}>
                                    {lvl.title}
                                </span>
                                <span className={`text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400`}>
                                    {lvl.exact}
                                </span>
                            </div>
                            <p className="text-[9px] md:text-[11px] text-slate-500 truncate mt-0.5">
                                {lvl.desc}
                            </p>
                        </div>
                        {level === lvl.id && (
                             <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                             </div>
                        )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t.topicLabel}</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 md:py-4 text-sm md:text-base text-white placeholder-slate-600 focus:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                placeholder={t.topicPlaceholder}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3.5 md:py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all"
            >
              {t.startButton}
            </button>

            <div className="text-center">
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{t.footer}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;