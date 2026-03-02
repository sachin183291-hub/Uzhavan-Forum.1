
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useLanguage } from '../context/LanguageContext.tsx';

// ── PCM helpers ───────────────────────────────────────────────────────────────
function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decodeBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pcmToAudioBuffer(
  raw: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
): Promise<AudioBuffer> {
  const int16 = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
  const buf = ctx.createBuffer(1, int16.length, sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < int16.length; i++) ch[i] = int16[i] / 32768.0;
  return buf;
}

// ── Live model — try 2.5 first, fall back to 2.0 ─────────────────────────────
const LIVE_MODELS = [
  'gemini-2.5-flash-preview-native-audio-dialog',
  'gemini-2.0-flash-live-001',
  'gemini-2.0-flash-exp',
];

const LiveChat: React.FC = () => {
  const { t, language } = useLanguage();

  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [transcript, setTranscript] = useState<{ role: 'you' | 'ai'; text: string }[]>([]);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(24).fill(4));

  // Refs that must survive re-renders without triggering them
  const sessionRef = useRef<any>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextPlayRef = useRef<number>(0);
  const playingSources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const waveInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);   // mirrored bool for use inside callbacks

  // ── Wave animation ───────────────────────────────────────────────────────
  const startWave = useCallback(() => {
    waveInterval.current = setInterval(() => {
      setWaveHeights(isActiveRef.current
        ? Array.from({ length: 24 }, () => 8 + Math.random() * 88)
        : Array(24).fill(4)
      );
    }, 120);
  }, []);

  const stopWave = useCallback(() => {
    if (waveInterval.current) { clearInterval(waveInterval.current); waveInterval.current = null; }
    setWaveHeights(Array(24).fill(4));
  }, []);

  // ── Teardown ─────────────────────────────────────────────────────────────
  const teardown = useCallback(() => {
    isActiveRef.current = false;
    stopWave();
    setStatus('idle');

    // Disconnect mic pipeline
    if (processorRef.current) { try { processorRef.current.disconnect(); } catch { } processorRef.current = null; }
    if (sourceRef.current) { try { sourceRef.current.disconnect(); } catch { } sourceRef.current = null; }

    // Stop mic tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // Stop all playing audio
    playingSources.current.forEach(s => { try { s.stop(); } catch { } });
    playingSources.current.clear();
    nextPlayRef.current = 0;

    // Close audio contexts
    if (inputCtxRef.current) { inputCtxRef.current.close().catch(() => { }); inputCtxRef.current = null; }
    if (outputCtxRef.current) { outputCtxRef.current.close().catch(() => { }); outputCtxRef.current = null; }

    // Close Live session
    if (sessionRef.current) { try { sessionRef.current.close(); } catch { } sessionRef.current = null; }
  }, [stopWave]);

  // ── Start ─────────────────────────────────────────────────────────────────
  const startSession = async () => {
    setErrorMsg('');
    setTranscript([]);
    setStatus('connecting');
    isActiveRef.current = true;
    startWave();

    try {
      // 1. Mic permission
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (micErr: any) {
        throw new Error(
          micErr?.name === 'NotAllowedError'
            ? 'Microphone permission denied. Please allow mic access in your browser and try again.'
            : `Microphone error: ${micErr?.message || micErr}`
        );
      }
      streamRef.current = stream;

      // 2. Audio contexts
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      inputCtxRef.current = new AudioCtx({ sampleRate: 16000 });
      outputCtxRef.current = new AudioCtx({ sampleRate: 24000 });

      // 3. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

      let session: any = null;
      let lastErr: any = null;

      for (const model of LIVE_MODELS) {
        try {
          session = await ai.live.connect({
            model,
            callbacks: {
              onopen: () => {
                setStatus('active');

                // Wire up mic → PCM → session (capture session from closure)
                const micSource = inputCtxRef.current!.createMediaStreamSource(stream);
                const processor = inputCtxRef.current!.createScriptProcessor(2048, 1, 1);
                sourceRef.current = micSource;
                processorRef.current = processor;

                processor.onaudioprocess = (ev) => {
                  if (!sessionRef.current) return;
                  const inputData = ev.inputBuffer.getChannelData(0);
                  const int16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32767;
                  try {
                    sessionRef.current.sendRealtimeInput({
                      media: {
                        data: encodeBase64(new Uint8Array(int16.buffer)),
                        mimeType: 'audio/pcm;rate=16000',
                      },
                    });
                  } catch (_) { }
                };

                micSource.connect(processor);
                processor.connect(inputCtxRef.current!.destination);
              },

              onmessage: async (msg: any) => {
                const outCtx = outputCtxRef.current;
                if (!outCtx) return;

                // Play audio response
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                  try {
                    const raw = decodeBase64(audioData);
                    const buf = await pcmToAudioBuffer(raw, outCtx, 24000);
                    const src = outCtx.createBufferSource();
                    src.buffer = buf;
                    src.connect(outCtx.destination);
                    src.addEventListener('ended', () => playingSources.current.delete(src));
                    nextPlayRef.current = Math.max(nextPlayRef.current, outCtx.currentTime);
                    src.start(nextPlayRef.current);
                    nextPlayRef.current += buf.duration;
                    playingSources.current.add(src);
                  } catch (_) { }
                }

                // Interruption → stop playback
                if (msg.serverContent?.interrupted) {
                  playingSources.current.forEach(s => { try { s.stop(); } catch { } });
                  playingSources.current.clear();
                  nextPlayRef.current = 0;
                }

                // Transcriptions
                const inText = msg.serverContent?.inputTranscription?.text;
                if (inText?.trim()) {
                  setTranscript(prev => [...prev.slice(-6), { role: 'you', text: inText.trim() }]);
                }
                const outText = msg.serverContent?.outputTranscription?.text;
                if (outText?.trim()) {
                  setTranscript(prev => [...prev.slice(-6), { role: 'ai', text: outText.trim() }]);
                }
              },

              onerror: (err: any) => {
                setErrorMsg(`Connection error: ${err?.message || 'Unknown error'}`);
                setStatus('error');
                teardown();
              },

              onclose: () => {
                if (isActiveRef.current) teardown();
              },
            },
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
              },
              systemInstruction: `You are Uzhavan AI — an expert agricultural officer assistant. 
                Always respond in ${language} language.
                Help farmers with crop diseases, fertilizers, weather, market prices, and government schemes.
                Be concise, friendly, and practical. Speak naturally as if talking to a farmer in their field.`,
              inputAudioTranscription: {},
              outputAudioTranscription: {},
            },
          });
          lastErr = null;
          break; // success
        } catch (e: any) {
          lastErr = e;
          console.warn(`Model ${model} failed:`, e?.message);
        }
      }

      if (!session || lastErr) {
        throw new Error(lastErr?.message || 'All Live API models failed. Please check your API key and network.');
      }

      sessionRef.current = session;

    } catch (err: any) {
      const msg = err?.message || String(err);
      setErrorMsg(msg);
      setStatus('error');
      teardown();
    }
  };

  const stopSession = useCallback(() => {
    teardown();
  }, [teardown]);

  useEffect(() => () => teardown(), [teardown]);

  const isActive = status === 'active';
  const isConnecting = status === 'connecting';
  const isError = status === 'error';

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-16 px-4 flex flex-col items-center justify-center transition-colors">
      <div className="max-w-4xl w-full text-center space-y-10">

        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-3 bg-emerald-900 text-white px-5 py-2 rounded-full shadow-2xl border border-emerald-800">
            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-red-400 animate-pulse' : isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('nav_live')}</span>
          </div>
          <h1 className="heading-font text-5xl md:text-8xl font-black text-stone-900 dark:text-stone-100 tracking-tighter leading-none">
            {t('live_sync_title').split(' ')[0]}{' '}
            <span className="text-emerald-600">{t('live_sync_title').split(' ').slice(1).join(' ') || 'Sync.'}</span>
          </h1>
          <p className="text-xl text-stone-500 dark:text-stone-400 font-medium max-w-xl mx-auto leading-relaxed">
            {t('live_subtitle')}
          </p>
        </div>

        {/* Error banner */}
        {isError && errorMsg && (
          <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-[2rem] text-left max-w-xl mx-auto">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="fas fa-exclamation-triangle text-red-500 text-sm" />
            </div>
            <div>
              <p className="text-red-700 dark:text-red-400 font-black text-sm mb-1">Connection Failed</p>
              <p className="text-red-600 dark:text-red-400 text-xs font-medium leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Waveform + Button */}
        <div className="relative py-8 flex flex-col items-center gap-10">

          {/* Animated bars */}
          <div className="flex items-end justify-center gap-1 h-40">
            {waveHeights.map((h, i) => (
              <div
                key={i}
                className={`w-2 md:w-3 rounded-full transition-all duration-100 ${isActive
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : isConnecting
                      ? 'bg-amber-400'
                      : 'bg-stone-200 dark:bg-stone-800'
                  }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* Transcript */}
          <div className="min-h-16 w-full max-w-2xl flex flex-col items-center justify-center gap-2 overflow-hidden px-4">
            {transcript.length > 0 ? (
              transcript.slice(-4).map((line, idx) => (
                <p
                  key={idx}
                  className={`text-sm md:text-base font-bold tracking-tight transition-all ${line.role === 'you'
                      ? 'text-stone-500 dark:text-stone-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                >
                  <span className="font-black mr-2">{line.role === 'you' ? t('live_you') : 'AI'}:</span>
                  {line.text}
                </p>
              ))
            ) : (
              <p className="text-stone-300 dark:text-stone-700 font-black uppercase tracking-widest text-xs">
                {isConnecting ? t('live_connecting') : isActive ? t('live_listening') : t('live_idle')}
              </p>
            )}
          </div>

          {/* Main button */}
          <button
            onClick={isActive || isConnecting ? stopSession : startSession}
            disabled={isConnecting}
            className={`w-36 h-36 md:w-48 md:h-48 rounded-[3.5rem] flex flex-col items-center justify-center gap-3
              transition-all duration-500 shadow-2xl active:scale-95 focus:outline-none
              ${isConnecting
                ? 'bg-amber-500 cursor-wait scale-95'
                : isActive
                  ? 'bg-red-600 hover:bg-red-500 scale-105'
                  : 'bg-emerald-900 dark:bg-emerald-700 hover:scale-105 hover:bg-emerald-800'
              }`}
          >
            <i className={`fas ${isConnecting ? 'fa-spinner fa-spin' : isActive ? 'fa-stop' : 'fa-microphone-lines'
              } text-4xl md:text-5xl text-white`} />
            <span className="text-[10px] font-black uppercase text-white tracking-widest opacity-80">
              {isConnecting ? 'Connecting...' : isActive ? t('live_btn_end') : t('live_btn_start')}
            </span>
          </button>

          {/* Mic hint */}
          {!isActive && !isConnecting && !isError && (
            <p className="text-stone-400 dark:text-stone-600 text-xs font-bold flex items-center gap-2">
              <i className="fas fa-shield-halved text-emerald-500" />
              Microphone access required. Tap Start to begin.
            </p>
          )}
        </div>

        {/* Stats footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-10 border-t border-stone-100 dark:border-stone-800">
          <div className="p-7 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
            <i className="fas fa-bolt text-emerald-500 mb-3 text-xl block" />
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{t('live_latency')}</p>
            <p className="text-base font-black dark:text-stone-200 tracking-tight">{t('live_latency_val')}</p>
          </div>
          <div className="p-7 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
            <i className="fas fa-microchip text-blue-500 mb-3 text-xl block" />
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{t('live_engine')}</p>
            <p className="text-base font-black dark:text-stone-200 tracking-tight">{t('live_engine_val')}</p>
          </div>
          <div className="p-7 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 shadow-sm">
            <i className="fas fa-language text-amber-500 mb-3 text-xl block" />
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{t('live_advisory_mode')}</p>
            <p className="text-base font-black dark:text-stone-200 tracking-tight">{t('live_dialect_val')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
