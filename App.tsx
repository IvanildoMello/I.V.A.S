import React, { useState } from 'react';
import SettingsView from './components/SettingsView';
import Visualizer from './components/Visualizer';
import ChatLog from './components/ChatLog';
import { useLiveSession } from './hooks/useLiveSession';
import { ConnectionState, UserSettings } from './types';

const App: React.FC = () => {
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