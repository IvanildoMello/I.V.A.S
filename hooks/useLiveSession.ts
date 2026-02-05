import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, UserSettings, TranscriptionItem, ProficiencyLevel } from '../types';
import { createPcmBlob, decodeAudioData, base64ToBytes, PCM_SAMPLE_RATE, downsampleBuffer, INPUT_SAMPLE_RATE } from '../utils/audio';
import { supabase } from '../utils/supabaseClient';

interface UseLiveSessionProps {
  settings: UserSettings;
}

export const useLiveSession = ({ settings }: UseLiveSessionProps) => {
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptionItem[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');
  const currentUserIdRef = useRef<string | null>(null);
  const currentAiIdRef = useRef<string | null>(null);

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentSessionRef = useRef<any>(null);
  const supabaseSessionIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setStatus(ConnectionState.CONNECTING);
      setErrorMessage(null);

      // Check for browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Seu navegador não suporta acesso ao microfone.");
      }

      let historyContext = "";
      const { data: pastMessages } = await supabase
        .from('messages')
        .select('text, is_user, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (pastMessages && pastMessages.length > 0) {
        const history = [...pastMessages].reverse()
          .map(m => `${m.is_user ? 'Student' : 'I.V.A.S'}: ${m.text}`)
          .join('\n');
        
        historyContext = `
        You already know this student. Their name is ${settings.name}.
        RECOLLECTION OF LAST CHAT:
        ---
        ${history}
        ---
        INSTRUCTIONS FOR RETURN:
        1. Greet them warmly as a returning friend.
        2. Attempt to resume the previous topic or ask how they've been.
        3. Make the conversation feel continuous and human.
        `;
      }

      const { data: sessionData } = await supabase
        .from('sessions')
        .insert({ name: settings.name, level: settings.level, topic: settings.topic })
        .select().single();

      if (sessionData) supabaseSessionIdRef.current = sessionData.id;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: PCM_SAMPLE_RATE });

      // Resilience: Try with ideal constraints, fallback to simple audio if it fails
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true }
          } 
        });
      } catch (err) {
        console.warn("Retrying with basic audio constraints due to:", err);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      mediaStreamRef.current = stream;

      // Define level-specific constraints
      let levelSpecificPrompt = "";
      switch (settings.level) {
        case ProficiencyLevel.BEGINNER:
          levelSpecificPrompt = `
            LEVEL: BEGINNER (A1-A2)
            - VOCABULARY: Stick to the most common 1,000 English words.
            - STRUCTURE: Use simple present, past, and future. Short, declarative sentences.
            - PACE: Enunciate clearly and slightly slower than native speed.
            - PEDAGOGY: Focus on basic grammar, greetings, and daily routine vocabulary. 
            - CORRECTION: Gently correct basic errors immediately in the explanation section.
          `;
          break;
        case ProficiencyLevel.INTERMEDIATE:
          levelSpecificPrompt = `
            LEVEL: INTERMEDIATE (B1-B2)
            - VOCABULARY: Use descriptive words and common phrasal verbs.
            - STRUCTURE: Mix simple and complex sentences. Use modals and conditionals.
            - PACE: Natural native speed but with clear articulation.
            - PEDAGOGY: Focus on connecting ideas, expressing opinions, and idiomatic expressions.
            - CORRECTION: Focus on making their English sound "more natural" rather than just "correct."
          `;
          break;
        case ProficiencyLevel.ADVANCED:
          levelSpecificPrompt = `
            LEVEL: ADVANCED (C1-C2)
            - VOCABULARY: Use sophisticated, nuanced, and academic/professional vocabulary.
            - STRUCTURE: Full native-level complexity. Use irony, sarcasm, and subtle cultural references.
            - PACE: Full native conversational speed. No hand-holding.
            - PEDAGOGY: Focus on nuance, connotations, register (formal vs informal), and high-level debate.
            - CORRECTION: Only point out extremely subtle errors or offer "gold-standard" alternatives for complex thoughts.
          `;
          break;
      }

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are I.V.A.S, a world-class American English conversation partner. You are ${settings.name}'s closest friend.

${historyContext || `This is your first time meeting ${settings.name}. Be warm and welcoming.`}

LEVEL-SPECIFIC ADAPTATION:
${levelSpecificPrompt}

MANDATORY RESPONSE FORMAT:
For EVERY turn, speak in this specific order:
1. NATURAL ENGLISH: Conversational American English tailored to the LEVEL above.
2. PORTUGUESE TRANSLATION: Accurate, contextual translation of what you just said.
3. PEDAGOGICAL EXPLANATION: In Portuguese, explain WHY certain phrases were used. Focus on "Real-Talk" (how natives actually speak) vs. "Textbook English."

CORE TUTORING PRINCIPLES:
- ACCURACY: Ensure translations capture the emotional intent, not just literal words.
- POSITIVE REINFORCEMENT: Use reactions like "That's exactly it!", "You're getting so good at this!", or "Love that phrasing!".
- CONVERSATIONAL FLOW: Share small personal-style anecdotes to make it a two-way conversation.
- CLARITY: Enunciate clearly but keep the native rhythm for the assigned level.

CURRENT SETTINGS:
- Name: ${settings.name}
- Level: ${settings.level}
- Topic: ${settings.topic}`,
          inputAudioTranscription: {}, 
          outputAudioTranscription: {} 
        },
      };

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            setStatus(ConnectionState.CONNECTED);
            if (!inputAudioContextRef.current || !mediaStreamRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              if (!inputAudioContextRef.current) return;
              const resampledData = downsampleBuffer(e.inputBuffer.getChannelData(0), inputAudioContextRef.current.sampleRate, INPUT_SAMPLE_RATE);
              if (sessionPromiseRef.current) sessionPromiseRef.current.then(s => s.sendRealtimeInput({ media: createPcmBlob(resampledData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: handleServerMessage,
          onclose: () => setStatus(ConnectionState.DISCONNECTED),
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus(ConnectionState.ERROR);
            setErrorMessage("Erro na conexão com a IA. Tente novamente.");
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;
      currentSessionRef.current = await sessionPromise;
    } catch (error: any) {
      console.error("Connection error:", error);
      setStatus(ConnectionState.ERROR);
      
      if (error.name === 'NotFoundError' || error.message.includes('Requested device not found')) {
        setErrorMessage("Microfone não encontrado. Verifique se ele está conectado corretamente.");
      } else if (error.name === 'NotAllowedError') {
        setErrorMessage("Permissão de microfone negada. Ative o acesso para continuar.");
      } else {
        setErrorMessage(error.message || "Erro desconhecido ao iniciar a sessão.");
      }
    }
  }, [settings]);

  const handleServerMessage = async (message: LiveServerMessage) => {
    const { serverContent } = message;
    const base64Audio = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && outputAudioContextRef.current) {
      setIsAiSpeaking(true);
      const ctx = outputAudioContextRef.current;
      const now = ctx.currentTime;
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
      const audioBuffer = await decodeAudioData(base64ToBytes(base64Audio), ctx);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // --- Professional Audio Post-Processing Chain ---
      const highPass = ctx.createBiquadFilter();
      highPass.type = 'highpass';
      highPass.frequency.setValueAtTime(90, now);

      const warmth = ctx.createBiquadFilter();
      warmth.type = 'peaking';
      warmth.frequency.setValueAtTime(250, now);
      warmth.Q.setValueAtTime(0.8, now);
      warmth.gain.setValueAtTime(2.0, now);

      const clarity = ctx.createBiquadFilter();
      clarity.type = 'peaking';
      clarity.frequency.setValueAtTime(2800, now);
      clarity.Q.setValueAtTime(1.0, now);
      clarity.gain.setValueAtTime(1.5, now);

      const lowPass = ctx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.setValueAtTime(7800, now);

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-28, now);
      compressor.knee.setValueAtTime(40, now);
      compressor.ratio.setValueAtTime(3.5, now);
      compressor.attack.setValueAtTime(0.010, now);
      compressor.release.setValueAtTime(0.200, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.95, now);

      source.connect(highPass);
      highPass.connect(warmth);
      warmth.connect(clarity);
      clarity.connect(lowPass);
      lowPass.connect(compressor);
      compressor.connect(gain);
      gain.connect(ctx.destination);

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      sourceNodesRef.current.add(source);
      source.onended = () => {
        sourceNodesRef.current.delete(source);
        if (sourceNodesRef.current.size === 0) setIsAiSpeaking(false);
      };
    }

    if (serverContent?.interrupted) {
       sourceNodesRef.current.forEach(node => { try { node.stop(); } catch(e) {} });
       sourceNodesRef.current.clear();
       nextStartTimeRef.current = 0;
       setIsAiSpeaking(false);
    }

    if (serverContent?.inputTranscription?.text) {
        currentInputTransRef.current += serverContent.inputTranscription.text;
        if (!currentUserIdRef.current) currentUserIdRef.current = 'u-' + Date.now();
        const id = currentUserIdRef.current;
        const text = currentInputTransRef.current;
        setTranscripts(prev => {
            const index = prev.findIndex(i => i.id === id);
            if (index !== -1) {
                const next = [...prev];
                next[index] = { ...next[index], text };
                return next;
            }
            return [...prev, { id, text, isUser: true, timestamp: Date.now() }];
        });
    }

    if (serverContent?.outputTranscription?.text) {
        currentOutputTransRef.current += serverContent.outputTranscription.text;
        if (!currentAiIdRef.current) currentAiIdRef.current = 'a-' + Date.now();
        const id = currentAiIdRef.current;
        const text = currentOutputTransRef.current;
        setTranscripts(prev => {
            const index = prev.findIndex(i => i.id === id);
            if (index !== -1) {
                const next = [...prev];
                next[index] = { ...next[index], text };
                return next;
            }
            return [...prev, { id, text, isUser: false, timestamp: Date.now() }];
        });
    }

    if (serverContent?.turnComplete) {
        const sessionId = supabaseSessionIdRef.current;
        if (sessionId) {
            const msgs = [];
            if (currentInputTransRef.current.trim()) msgs.push({ session_id: sessionId, text: currentInputTransRef.current.trim(), is_user: true });
            if (currentOutputTransRef.current.trim()) msgs.push({ session_id: sessionId, text: currentOutputTransRef.current.trim(), is_user: false });
            if (msgs.length > 0) supabase.from('messages').insert(msgs).then(() => {});
        }
        currentInputTransRef.current = ''; 
        currentOutputTransRef.current = '';
        currentUserIdRef.current = null; 
        currentAiIdRef.current = null;
    }
  };

  const disconnect = useCallback(async () => {
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
    if (inputAudioContextRef.current) await inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) await outputAudioContextRef.current.close();
    setStatus(ConnectionState.DISCONNECTED);
    setErrorMessage(null);
    setIsAiSpeaking(false);
    nextStartTimeRef.current = 0;
    setTranscripts([]);
    supabaseSessionIdRef.current = null;
  }, []);

  useEffect(() => { return () => { disconnect(); }; }, []);

  return { status, connect, disconnect, transcripts, isAiSpeaking, errorMessage };
};