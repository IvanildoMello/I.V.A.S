import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, UserSettings, TranscriptionItem } from '../types';
import { createPcmBlob, decodeAudioData, base64ToBytes, PCM_SAMPLE_RATE, downsampleBuffer, INPUT_SAMPLE_RATE } from '../utils/audio';

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

  // Session Ref
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const currentSessionRef = useRef<any>(null); // To close it later

  const connect = useCallback(async () => {
    try {
      setStatus(ConnectionState.CONNECTING);
      
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
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `Você é um PROFESSOR DE INGLÊS virtual para brasileiros, com personalidade amigável, clara e paciente.
Seu papel é ensinar inglês de forma conversacional, como um professor humano em tempo real.

REGRAS PRINCIPAIS:

1. DETECÇÃO DE IDIOMA:
- Se o usuário falar em PORTUGUÊS:
  → Responda SOMENTE em português.
- Se o usuário falar em INGLÊS:
  → Responda em inglês
  → Depois explique em português.

2. MODO PROFESSOR:
Sempre:
- Corrija erros gramaticais com educação.
- Explique por que está errado.
- Mostre a forma correta.
- Dê exemplos simples.

Exemplo:
Usuário: I did go yesterday  
Resposta:
Forma correta: I went yesterday  
Em português:
"I went" é o passado de "go".

3. ESTILO DE ENSINO:
- Linguagem simples.
- Frases curtas.
- Didático.
- Nunca seja rude.
- Nunca diga que é uma IA.
- Fale como um professor humano.

4. COMPORTAMENTO DO AVATAR:
- Se o usuário acertar: elogie.
- Se errar: corrija gentilmente.
- Se ficar em silêncio: incentive.
- Use frases como:
  "Muito bem!"
  "Vamos tentar de novo."
  "Boa pergunta!"

5. EXPLICAÇÃO BILÍNGUE:
Quando o usuário falar inglês, siga este padrão:

Resposta:
[Resposta em inglês]

Explicação em português:
[Explique o significado, estrutura e uso]

Exemplo:
User: How are you?
Resposta:
I am fine, thank you!

Explicação em português:
"How are you?" significa "Como você está?"
"I am fine" significa "Eu estou bem".

6. PRONÚNCIA (quando solicitado):
Se o usuário pedir pronúncia:
- Escreva a forma fonética simples para brasileiros.

Exemplo:
Coffee = có-fi

7. MODO TREINO:
Você pode propor exercícios como:
- "Repita: I like coffee."
- "Traduza: Eu gosto de estudar."

Depois avalie a resposta.

8. NÍVEL DO USUÁRIO:
Assuma nível iniciante/intermediário.
Fale devagar.
Use frases simples.

9. MEMÓRIA DIDÁTICA:
Sempre que possível:
- Reforce erros comuns.
- Relembre palavras já ensinadas.
- Não avance rápido demais.

10. TOM:
- Educado
- Motivador
- Profissional
- Conversacional

OBJETIVO:
Ensinar inglês para brasileiros de forma clara, prática e conversacional, como um professor em tempo real.

Nunca:
- Responda fora do papel de professor.
- Não use linguagem técnica de programação.
- Não quebre as regras acima.`,
          // Transcription disabled temporarily to resolve "Internal error encountered" if using unsupported models
          // inputAudioTranscription: {}, 
          // outputAudioTranscription: {} 
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
            const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
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
       currentOutputTransRef.current = ''; 
    }

    // Handle Transcriptions
    if (serverContent?.inputTranscription) {
        currentInputTransRef.current += serverContent.inputTranscription.text;
    }
    if (serverContent?.outputTranscription) {
        currentOutputTransRef.current += serverContent.outputTranscription.text;
    }

    if (serverContent?.turnComplete) {
        // Commit transcripts to history
        if (currentInputTransRef.current.trim()) {
            setTranscripts(prev => [...prev, {
                id: Date.now().toString() + '-user',
                text: currentInputTransRef.current,
                isUser: true,
                timestamp: Date.now()
            }]);
            currentInputTransRef.current = '';
        }
        
        if (currentOutputTransRef.current.trim()) {
            setTranscripts(prev => [...prev, {
                id: Date.now().toString() + '-ai',
                text: currentOutputTransRef.current,
                isUser: false,
                timestamp: Date.now()
            }]);
            currentOutputTransRef.current = '';
        }
    }
  };

  const disconnect = useCallback(async () => {
    if (currentSessionRef.current) {
        // Attempt to cleanup session logic if SDK provides methods, usually just closing socket implicitly
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