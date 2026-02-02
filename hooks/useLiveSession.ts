import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, UserSettings, TranscriptionItem } from '../types';
import { createPcmBlob, decodeAudioData, base64ToBytes, PCM_SAMPLE_RATE, downsampleBuffer, INPUT_SAMPLE_RATE } from '../utils/audio';
import { supabase } from '../utils/supabaseClient';

interface UseLiveSessionProps {
  settings: UserSettings;
}

export const useLiveSession = ({ settings }: UseLiveSessionProps) => {
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [transcripts, setTranscripts] = useState<TranscriptionItem[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Transcription Refs (to handle partial updates)
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');
  
  // Track active bubble IDs for streaming updates
  const currentUserIdRef = useRef<string | null>(null);
  const currentAiIdRef = useRef<string | null>(null);

  // Session Ref
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentSessionRef = useRef<any>(null); // To close it later
  
  // Supabase Session ID
  const supabaseSessionIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setStatus(ConnectionState.CONNECTING);
      
      // 1. Create Supabase Session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          name: settings.name,
          level: settings.level,
          topic: settings.topic
        })
        .select()
        .single();

      if (sessionData) {
        supabaseSessionIdRef.current = sessionData.id;
        console.log("Supabase session created:", sessionData.id);
      } else if (sessionError) {
        console.error("Error creating Supabase session:", sessionError);
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      // Note: Browsers might ignore sampleRate in the constructor, so we must check it later.
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: PCM_SAMPLE_RATE });

      // Request Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          // Disable thinking budget to prioritize low latency (speed)
          thinkingConfig: { thinkingBudget: 0 },
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `Você é o I.V.A.S, um tutor de inglês pessoal para brasileiros.
Seu objetivo é ensinar conversação de forma RÁPIDA, natural e bilíngue.

DADOS DO ALUNO:
Nome: ${settings.name}
Nível: ${settings.level}
Tópico: ${settings.topic}

PROTOCOLO DE RESPOSTA (Priorize velocidade e clareza):

1. INTERAÇÃO BILÍNGUE (Imediata):
   - Responda primeiro em INGLÊS (curto e direto).
   - Em seguida, dê a tradução em PORTUGUÊS.
   
2. CORREÇÃO PRECISA:
   - Identifique erros de pronúncia ou gramática imediatamente.
   - Corrija em PORTUGUÊS de forma breve.

3. TRANSCRIÇÃO FIEL:
   - Certifique-se de que o que você fala corresponde exatamente à legenda gerada.

TEMA: ${settings.topic}
Mantenha o diálogo fluido. Evite monólogos longos.`,
          // Enable transcription to show words in the UI
          inputAudioTranscription: {}, 
          outputAudioTranscription: {} 
        },
      };

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            console.log("Session Opened");
            setStatus(ConnectionState.CONNECTED);
            
            // Setup Input Stream
            if (!inputAudioContextRef.current || !mediaStreamRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
            // Reduced buffer size from 4096 to 2048 to improve latency (approx 50ms faster input)
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(2048, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              if (!inputAudioContextRef.current) return;

              const inputData = e.inputBuffer.getChannelData(0);
              
              // Ensure we are sending 16k audio even if the context is running at 44.1/48k
              const currentSampleRate = inputAudioContextRef.current.sampleRate;
              const resampledData = downsampleBuffer(inputData, currentSampleRate, INPUT_SAMPLE_RATE);
              const pcmBlob = createPcmBlob(resampledData);
              
              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                   session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             handleServerMessage(message);
          },
          onclose: () => {
            console.log("Session Closed");
            setStatus(ConnectionState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error("Session Error", err);
            setStatus(ConnectionState.ERROR);
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;
      currentSessionRef.current = await sessionPromise;

    } catch (error) {
      console.error("Connection failed", error);
      setStatus(ConnectionState.ERROR);
    }
  }, [settings]);

  const handleServerMessage = async (message: LiveServerMessage) => {
    const { serverContent } = message;

    // Handle Audio
    const base64Audio = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && outputAudioContextRef.current) {
      setIsAiSpeaking(true);
      const ctx = outputAudioContextRef.current;
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
      
      const audioBuffer = await decodeAudioData(base64ToBytes(base64Audio), ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      // --- Audio Processing Chain for Natural Voice ---

      // 1. High-Pass Filter: Removes low-frequency rumble/mud (below 100Hz) for clarity
      const highPassFilter = ctx.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 100;
      highPassFilter.Q.value = 0.71; 

      // 2. Compressor: Smooths out dynamics for natural, consistent volume
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -20;
      compressor.knee.value = 20; 
      compressor.ratio.value = 6; 
      compressor.attack.value = 0.003; 
      compressor.release.value = 0.25; 

      // 3. Gain: Master volume (0.5 to prevent blowing out speakers)
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.5;

      // Connect Chain: Source -> HPF -> Compressor -> Gain -> Destination
      source.connect(highPassFilter);
      highPassFilter.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      
      sourceNodesRef.current.add(source);
      
      source.onended = () => {
        sourceNodesRef.current.delete(source);
        if (sourceNodesRef.current.size === 0) {
           // Small delay to ensure smooth visual transition
           setTimeout(() => setIsAiSpeaking(false), 200);
        }
      };
    }

    // Handle Interruption
    if (serverContent?.interrupted) {
       sourceNodesRef.current.forEach(node => {
         try { node.stop(); } catch(e) {}
       });
       sourceNodesRef.current.clear();
       nextStartTimeRef.current = 0;
       setIsAiSpeaking(false);
       
       // Force end the current AI turn visual if interrupted
       currentOutputTransRef.current = ''; 
       currentAiIdRef.current = null;
    }

    // Handle Real-time Transcriptions
    // User Input
    if (serverContent?.inputTranscription) {
        const text = serverContent.inputTranscription.text;
        if (text) {
            currentInputTransRef.current += text;
            
            // If we haven't started tracking this turn ID yet, do so
            if (!currentUserIdRef.current) {
                currentUserIdRef.current = Date.now().toString() + '-user';
                currentAiIdRef.current = null; // Ensure AI turn is considered 'done' if user starts
            }
            
            const turnId = currentUserIdRef.current;
            const fullText = currentInputTransRef.current;

            setTranscripts(prev => {
                const exists = prev.find(item => item.id === turnId);
                if (exists) {
                    return prev.map(item => item.id === turnId ? { ...item, text: fullText } : item);
                } else {
                    return [...prev, { id: turnId, text: fullText, isUser: true, timestamp: Date.now() }];
                }
            });
        }
    }

    // AI Output
    if (serverContent?.outputTranscription) {
        const text = serverContent.outputTranscription.text;
        if (text) {
            currentOutputTransRef.current += text;

            if (!currentAiIdRef.current) {
                currentAiIdRef.current = Date.now().toString() + '-ai';
                currentUserIdRef.current = null; // Ensure User turn is considered 'done' if AI starts
            }
            
            const turnId = currentAiIdRef.current;
            const fullText = currentOutputTransRef.current;

            setTranscripts(prev => {
                const exists = prev.find(item => item.id === turnId);
                if (exists) {
                    return prev.map(item => item.id === turnId ? { ...item, text: fullText } : item);
                } else {
                    return [...prev, { id: turnId, text: fullText, isUser: false, timestamp: Date.now() }];
                }
            });
        }
    }

    if (serverContent?.turnComplete) {
        // --- SAVE TO SUPABASE ---
        const sessionId = supabaseSessionIdRef.current;
        if (sessionId) {
            const promises = [];
            
            // Save User Message if exists
            if (currentInputTransRef.current.trim()) {
                promises.push(supabase.from('messages').insert({
                    session_id: sessionId,
                    text: currentInputTransRef.current.trim(),
                    is_user: true
                }));
            }
            
            // Save AI Message if exists
            if (currentOutputTransRef.current.trim()) {
                promises.push(supabase.from('messages').insert({
                    session_id: sessionId,
                    text: currentOutputTransRef.current.trim(),
                    is_user: false
                }));
            }
            
            if (promises.length > 0) {
                Promise.all(promises).catch(err => console.error('Supabase save error:', err));
            }
        }

        // Reset buffers and IDs for the next turn
        currentInputTransRef.current = '';
        currentOutputTransRef.current = '';
        currentUserIdRef.current = null;
        currentAiIdRef.current = null;
    }
  };

  const disconnect = useCallback(async () => {
    if (currentSessionRef.current) {
        // Attempt to cleanup session logic if SDK provides methods
    }

    // Stop Microphones
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Disconnect ScriptProcessor
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    // Close AudioContexts
    if (inputAudioContextRef.current) {
        await inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        await outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }

    setStatus(ConnectionState.DISCONNECTED);
    setIsAiSpeaking(false);
    nextStartTimeRef.current = 0;
    setTranscripts([]);
    currentInputTransRef.current = '';
    currentOutputTransRef.current = '';
    currentUserIdRef.current = null;
    currentAiIdRef.current = null;
    supabaseSessionIdRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    status,
    connect,
    disconnect,
    transcripts,
    isAiSpeaking
  };
};