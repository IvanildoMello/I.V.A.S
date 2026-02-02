import React, { useState } from 'react';
import SettingsView from './components/SettingsView';
import Visualizer from './components/Visualizer';
import ChatLog from './components/ChatLog';
import { useLiveSession } from './hooks/useLiveSession';
import { ConnectionState, UserSettings } from './types';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const { status, connect, disconnect, transcripts, isAiSpeaking } = useLiveSession({ 
    settings: settings || { name: 'User', level: 'Beginner', topic: 'General' } as any 
  });

  const handleStart = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };
  
  React.useEffect(() => {
      if (settings && status === ConnectionState.DISCONNECTED) {
          connect();
      }
  }, [settings, connect, status]);

  if (!hasStarted) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative font-sans">
        {/* Background effects */}
        <div className="absolute top-0 -left-4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-64 h-64 md:w-96 md:h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10 text-center max-w-md mx-auto p-8 animate-[fadeIn_1s_ease-out]">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mx-auto mb-8 shadow-xl shadow-blue-500/30 flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6 tracking-tight">I.V.A.S</h1>
            <p className="text-slate-400 text-lg md:text-xl mb-10 font-light leading-relaxed">
              Seu tutor pessoal de inglês com inteligência artificial. Aprenda conversação em tempo real.
            </p>
            
            <button 
                onClick={() => setHasStarted(true)}
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-blue-600 px-10 font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-4 focus:ring-offset-slate-900"
            >
                <span className="mr-2 text-lg">Iniciar Jornada</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
       </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-64 h-64 md:w-96 md:h-96 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 md:w-96 md:h-96 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10 w-full">
          <SettingsView onStart={handleStart} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-slate-900 relative flex flex-col font-sans overflow-hidden supports-[height:100cqh]:h-[100cqh] supports-[height:100svh]:h-[100svh]">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status === ConnectionState.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <div className="flex flex-col">
                    <h2 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight">I.V.A.S</h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold truncate max-w-[150px] md:max-w-none">
                        {settings.topic} • {settings.level.split(' ')[0]}
                    </p>
                </div>
            </div>
            <button 
                onClick={() => {
                    disconnect();
                    setSettings(null);
                }}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition border border-red-500/20 whitespace-nowrap"
            >
                End Session
            </button>
        </div>

        {/* Main Content: Visualizer (Flexible Height) */}
        <div className="flex-1 relative flex flex-col items-center justify-center min-h-0 z-0 py-4">
            {status === ConnectionState.ERROR && (
                 <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-500/50 mb-8 absolute top-4 z-50 mx-4 text-center text-sm">
                     Connection Error. Please check your API Key.
                 </div>
            )}
            
            {status === ConnectionState.CONNECTING && (
                <div className="animate-pulse text-blue-400 font-medium text-sm md:text-base">
                    Connecting to your tutor...
                </div>
            )}

            {status === ConnectionState.CONNECTED && (
                 <Visualizer isActive={true} isSpeaking={isAiSpeaking} />
            )}
        </div>

        {/* Bottom Section: Conversation Log (Fixed Height) */}
        {/* Adjusted height for mobile to ensure visualizer has space */}
        <div className="relative z-20 h-[40vh] md:h-[35vh] min-h-[200px] md:min-h-[250px] bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50 shrink-0 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pb-safe">
             {/* Status Bar inside the log area */}
             <div className="px-4 md:px-6 py-2 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Transcript
                 </span>
                 <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isAiSpeaking ? 'text-blue-400' : 'text-green-400'}`}>
                    {isAiSpeaking ? 'AI Speaking' : 'Listening'}
                 </span>
             </div>
             
             {/* Chat Log Component */}
             <div className="flex-1 overflow-hidden relative">
                 <ChatLog transcripts={transcripts} />
             </div>
        </div>
        
        {/* Tailwind Custom Animation Config Injection */}
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          /* Support for iOS safe area at bottom */
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
          }
        `}</style>
    </div>
  );
};

export default App;