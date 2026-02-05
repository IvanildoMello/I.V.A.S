
import React from 'react';

interface VisualizerProps {
  isActive: boolean;
  isSpeaking: boolean; 
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, isSpeaking }) => {
  return (
    <div className="relative w-48 h-48 md:w-72 md:h-72 flex items-center justify-center transition-all duration-700">
      {/* Ambient Glow - Syncs with ball color */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 opacity-30
          ${isSpeaking ? 'scale-150' : 'scale-110'}
          animate-[cycleColorsGlow_8s_linear_infinite]
        `}
      />
      
      {/* Outer Decorative Ring */}
      <div className={`absolute inset-0 rounded-full border border-white/5 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`absolute inset-0 rounded-full border-t-2 border-white/10 animate-[spin_12s_linear_infinite] ${isSpeaking ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* The Character Ball ("Bolinha") */}
      <div 
        className={`relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden
          animate-[cycleColors_8s_linear_infinite]
          ${isSpeaking ? 'scale-110' : (isActive ? 'animate-[bounceSlow_4s_ease-in-out_infinite]' : 'scale-100 grayscale-[0.4]')}
        `}
      >
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/30 pointer-events-none" />
        
        {/* Face Container */}
        <div className="relative flex flex-col items-center gap-2 md:gap-4 mt-2">
            {/* Eyes */}
            <div className="flex gap-6 md:gap-10">
                <div className="w-3 h-4 md:w-4 md:h-6 bg-slate-900 rounded-full animate-[blink_5s_infinite] relative">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-60" />
                </div>
                <div className="w-3 h-4 md:w-4 md:h-6 bg-slate-900 rounded-full animate-[blink_5s_infinite] relative">
                    <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full opacity-60" />
                </div>
            </div>

            {/* Mouth */}
            <div className="h-6 flex items-center justify-center">
                {isSpeaking ? (
                    /* Speaking Animation */
                    <div className="w-6 md:w-10 h-4 md:h-6 bg-slate-900 rounded-full animate-[mouthTalk_0.2s_ease-in-out_infinite] border-b-2 border-white/20" />
                ) : (
                    /* Default Smile/Line */
                    <div className={`w-6 md:w-10 h-1 bg-slate-900/60 rounded-full transition-all duration-500 ${isActive ? 'w-8 md:w-12 h-1.5' : 'w-4 h-0.5'}`} />
                )}
            </div>
        </div>

        {/* Inner Liquid/Depth Effect */}
        <div className="absolute -bottom-4 w-full h-1/2 bg-white/10 blur-xl rounded-full" />
      </div>

      {/* Speech Ripples */}
      {isActive && isSpeaking && (
        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
      )}

      <style>{`
        @keyframes cycleColors {
          0%, 100% { background-color: #6366f1; } /* Indigo */
          25% { background-color: #a855f7; }    /* Purple */
          50% { background-color: #ec4899; }    /* Pink */
          75% { background-color: #3b82f6; }    /* Blue */
        }
        @keyframes cycleColorsGlow {
          0%, 100% { background-color: #6366f1; }
          25% { background-color: #a855f7; }
          50% { background-color: #ec4899; }
          75% { background-color: #3b82f6; }
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0) scale(1.02); }
          50% { transform: translateY(-10px) scale(1); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes mouthTalk {
          0%, 100% { transform: scaleY(0.5) scaleX(1); }
          50% { transform: scaleY(1.2) scaleX(0.9); }
        }
      `}</style>
    </div>
  );
};

export default Visualizer;
