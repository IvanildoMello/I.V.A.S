import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isActive: boolean;
  isSpeaking: boolean; // True if AI is speaking
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, isSpeaking }) => {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center transition-all duration-500">
      {/* Outer Glow */}
      <div 
        className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-2xl transition-all duration-1000 ${isActive ? 'scale-110' : 'scale-90'}`}
      />
      
      {/* Core Orb */}
      <div className={`relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center transition-all duration-500 ${isSpeaking ? 'scale-110 animate-pulse' : 'scale-100'}`}>
        {/* Inner Ring */}
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-white/20 flex items-center justify-center">
             <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                {isActive ? (
                   <div className="space-x-1 flex items-center h-8">
                      <div className={`w-1 bg-white rounded-full animate-[bounce_1s_infinite] ${isSpeaking ? 'h-6 md:h-8' : 'h-2'}`}></div>
                      <div className={`w-1 bg-white rounded-full animate-[bounce_1.2s_infinite] ${isSpeaking ? 'h-8 md:h-10' : 'h-3'}`}></div>
                      <div className={`w-1 bg-white rounded-full animate-[bounce_0.8s_infinite] ${isSpeaking ? 'h-4 md:h-6' : 'h-2'}`}></div>
                   </div>
                ) : (
                    <span className="text-white/50 text-[10px] md:text-xs font-semibold">Ready</span>
                )}
             </div>
        </div>
      </div>

      {/* Ripple Effects when active */}
      {isActive && (
        <>
            <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-4 rounded-full border border-purple-400/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
        </>
      )}
    </div>
  );
};

export default Visualizer;