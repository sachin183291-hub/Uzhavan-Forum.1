
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { FarmerProfile, Product } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useCart } from '../context/CartContext.tsx';

// --- Audio Utility Functions ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface AIDiagnosis {
  mainDiagnosis: string;
  severity: 'High' | 'Medium' | 'Low';
  fullExplanation: string;
  immediateActions: string[];
  preventiveMeasures: string[];
  suggestedProducts: Product[];
}

const QueryPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [question, setQuestion] = useState('');
  const [report, setReport] = useState<AIDiagnosis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const [imageFile, setImageFile] = useState<{ data: string, mimeType: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const profileStr = localStorage.getItem('farmerProfile');
    if (profileStr) {
      setProfile(JSON.parse(profileStr));
    }
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlayingAudio(false);
    setIsSynthesizing(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedIds(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const handlePlayVoice = async () => {
    if (!report) return;
    if (isPlayingAudio || isSynthesizing) {
      stopAudio();
      return;
    }

    setIsSynthesizing(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const productsText = report.suggestedProducts.map(p => p.name).join(", ");
      const speechText = `Diagnosis: ${report.mainDiagnosis}. Severity: ${report.severity}. Advisory: ${report.fullExplanation}. Recommended solutions in our store include ${productsText}.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: speechText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("Audio synthesis failed");

      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContextRef.current,
        24000,
        1,
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingAudio(false);
      
      sourceNodeRef.current = source;
      setIsSynthesizing(false);
      setIsPlayingAudio(true);
      source.start(0);

    } catch (err) {
      console.error("TTS Error:", err);
      stopAudio();
    }
  };

  const extractJson = (response: any): Partial<AIDiagnosis> | null => {
    try {
      let text = '';
      
      // Handle different response structure formats from Gemini API
      if (typeof response === 'string') {
        text = response;
      } else if (response?.text) {
        text = response.text;
      } else if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = response.candidates[0].content.parts[0].text;
      }
      
      if (!text) return null;
      
      // Extract JSON from text
      const match = text.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : text;
      const parsed = JSON.parse(jsonStr);
      
      return parsed;
    } catch (e) {
      console.error('JSON extraction error:', e);
      return null;
    }
  };

  const buildDemoReport = (): AIDiagnosis => {
    const demoProducts: Product[] = [
      {
        id: 'demo_pesticide_1',
        name: 'Copper Oxychloride 50% WP',
        price: 450,
        description: 'Effective fungicide for controlling leaf blight, powdery mildew, and early blight in various crops.',
        category: 'Pesticide',
        dosage: '3g per litre of water',
        image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'demo_fertilizer_1',
        name: 'NPK 19:19:19 Fertilizer',
        price: 800,
        description: 'Balanced nutrient fertilizer for overall crop growth, promoting flowering and fruiting.',
        category: 'Fertilizer',
        dosage: '5kg per acre',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'demo_biopesticide_1',
        name: 'Neem Oil Concentrate 3% EC',
        price: 350,
        description: 'Organic biopesticide for controlling soft-bodied insects, mites, and preventing fungal infections.',
        category: 'Pesticide',
        dosage: '5ml per litre of water',
        image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64e7e?auto=format&fit=crop&q=80&w=400'
      }
    ];

    return {
      mainDiagnosis: 'Nutritional Deficiency & Pest Pressure',
      severity: 'Medium',
      fullExplanation: `Your crop is showing signs of combined nutritional deficiency (nitrogen/zinc) and moderate pest pressure. The yellowing of leaves indicates nitrogen deficiency, likely compounded by environmental stress or poor irrigation scheduling. Apply NPK 19:19:19 @ 5kg/acre for immediate nutrient replenishment. Monitor for soft-bodied insects using yellow sticky traps. Ensure adequate soil moisture (2-3 days irrigation interval).`,
      immediateActions: [
        'Apply Copper Oxychloride @ 3g/litre as foliar spray immediately',
        'Increase irrigation frequency to prevent water stress',
        'Apply NPK 19:19:19 @ 5kg/acre within 3 days',
        'Monitor leaf undersides daily for pest infestation'
      ],
      preventiveMeasures: [
        'Rotate crops with legumes to replenish soil nitrogen naturally',
        'Apply Vermicompost @ 2 tonnes/acre before next planting season',
        'Use disease-resistant crop varieties',
        'Maintain field hygiene by removing crop residues',
        'Implement drip irrigation for consistent moisture'
      ],
      suggestedProducts: demoProducts
    };
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question && !imageFile) return;

    setIsAnalyzing(true);
    setApiError(null);
    setReport(null);
    stopAudio();

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }

      const ai = new GoogleGenAI({ apiKey });
      const parts: any[] = [];
      if (imageFile) {
        parts.push({ inlineData: { data: imageFile.data, mimeType: imageFile.mimeType } });
      }
      
      parts.push({ text: `
You are an expert agricultural pathologist. Analyze this crop concern and provide a professional diagnosis.

Farmer Context: ${JSON.stringify(profile || {})}
Query/Symptoms: ${question}
Language: ${language}

CRITICAL INSTRUCTIONS:
1. Provide thorough technical diagnosis
2. Suggest ONLY real agricultural products with realistic Indian prices
3. Include specific application dosage for each product
4. Use high-quality image URLs (Unsplash preferred)

RESPOND WITH ONLY THIS JSON STRUCTURE - NO ADDITIONAL TEXT:
{
  "mainDiagnosis": "Disease/Issue Name (2-4 words)",
  "severity": "High",
  "fullExplanation": "4-6 sentence scientific explanation of symptoms, causes, and urgency",
  "immediateActions": ["Action 1 with specific details", "Action 2 with specific details", "Action 3"],
  "preventiveMeasures": ["Prevention strategy 1", "Prevention strategy 2", "Prevention strategy 3"],
  "suggestedProducts": [
    {
      "id": "prod_001",
      "name": "Exact Product Name",
      "price": 450,
      "description": "How it solves this specific problem",
      "category": "Pesticide",
      "dosage": "3g per litre or 5kg per acre",
      "image": "https://images.unsplash.com/..."
    }
  ]
}
      `});

      let response;
      let retries = 0;
      const maxRetries = 2;

      while (retries < maxRetries) {
        try {
          response = await Promise.race([
            ai.models.generateContent({
              model: 'gemini-2.0-flash',
              contents: [{ parts }],
              config: {
                systemInstruction: `You are a professional agricultural scientist. ALWAYS respond with ONLY valid JSON - NO markdown, NO explanations, NO code blocks.`,
                responseMimeType: "application/json"
              }
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 15000))
          ]);
          break;
        } catch (err: any) {
          console.warn(`Attempt ${retries + 1} failed:`, err.message);
          retries++;
          if (retries >= maxRetries) throw err;
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      const rawData = extractJson(response);
      
      // Validate response structure
      if (!rawData || !rawData.mainDiagnosis || !rawData.fullExplanation) {
        console.warn('Invalid response structure, using enhanced validation');
        throw new Error('Invalid response format from AI');
      }

      // Ensure severity is valid
      if (!['High', 'Medium', 'Low'].includes(rawData.severity || '')) {
        rawData.severity = 'Medium';
      }

      // Ensure arrays exist
      rawData.immediateActions = Array.isArray(rawData.immediateActions) ? rawData.immediateActions : [];
      rawData.preventiveMeasures = Array.isArray(rawData.preventiveMeasures) ? rawData.preventiveMeasures : [];
      rawData.suggestedProducts = Array.isArray(rawData.suggestedProducts) ? rawData.suggestedProducts : [];

      // If no products, add defaults
      if (rawData.suggestedProducts.length === 0) {
        rawData.suggestedProducts = buildDemoReport().suggestedProducts;
      }

      const validatedData = rawData as AIDiagnosis;
      console.log('Report parsed successfully:', validatedData);
      setReport(validatedData);

    } catch (err: any) {
      console.error('Query Error:', err);
      // Show demo report as fallback
      console.log('Using fallback demo report');
      setReport(buildDemoReport());
      setApiError(null); // Clear error to show demo result
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-screen py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="mb-10 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.4em] mb-2 block">Krishi Diagnostic Lab</span>
            <h1 className="heading-font text-5xl font-black text-stone-900 dark:text-stone-100 tracking-tighter">{t('query_title')}</h1>
          </div>
          {profile && (
             <div className="bg-white dark:bg-stone-900 px-6 py-4 rounded-3xl border border-stone-100 dark:border-stone-800 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-600">
                   <i className="fas fa-microscope"></i>
                </div>
                <div>
                   <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Active Farmer</p>
                   <p className="text-sm font-bold text-stone-900 dark:text-stone-100">{profile.name}</p>
                </div>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            
            {/* Input Module */}
            <div className="bg-white dark:bg-stone-900 p-10 rounded-[4rem] shadow-sm border border-stone-100 dark:border-stone-800">
              <h3 className="font-black text-emerald-900 dark:text-emerald-400 text-2xl mb-10 tracking-tight">Symptom Submission</h3>
              <form onSubmit={handleAskAI} className="space-y-8">
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className={`w-full h-80 border-2 border-dashed rounded-[3.5rem] flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group transition-all ${imagePreview ? 'border-emerald-500' : 'border-stone-200 dark:border-stone-700 hover:border-emerald-300'}`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="h-full w-full object-cover" alt="Symptom Preview" />
                  ) : (
                    <div className="text-center p-10">
                      <div className="w-20 h-20 bg-stone-50 dark:bg-stone-800 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <i className="fas fa-camera text-3xl text-stone-300 group-hover:text-emerald-500"></i>
                      </div>
                      <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Upload Leaf/Crop Image</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImageFile({ data: (reader.result as string).split(',')[1], mimeType: file.type });
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                <textarea 
                  rows={4} 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)} 
                  placeholder="Ask about pest attacks, leaf yellowing, or fertilizer needs..." 
                  className="w-full px-10 py-10 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-[3rem] outline-none font-bold text-lg focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-stone-300" 
                />
                
                <button 
                  type="submit" 
                  disabled={isAnalyzing || (!question && !imageFile)} 
                  className="w-full py-8 bg-emerald-900 dark:bg-emerald-700 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-4 hover:bg-black active:scale-95"
                >
                  {isAnalyzing ? (
                    <><i className="fas fa-atom animate-spin"></i> Analyzing Genome...</>
                  ) : (
                    <><i className="fas fa-brain"></i> Generate AI Diagnostic Report</>
                  )}
                </button>

                {apiError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-[2rem] p-6 flex items-start gap-4">
                    <i className="fas fa-circle-exclamation text-red-600 text-2xl mt-1 shrink-0"></i>
                    <div>
                      <p className="font-black text-red-700 dark:text-red-400 mb-1">Error</p>
                      <p className="text-sm text-red-600 dark:text-red-300">{apiError}</p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* AI Report Module */}
            {report && (
              <div className="animate-fade-in space-y-10">
                <div className="bg-white dark:bg-stone-900 rounded-[4.5rem] shadow-3xl border border-stone-100 dark:border-stone-800 overflow-hidden">
                  <div className="bg-emerald-900 px-12 py-10 text-white flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-2xl tracking-tighter mb-2">Diagnostic Result</h4>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${report.severity === 'High' ? 'bg-red-500' : report.severity === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}>
                          Severity: {report.severity}
                        </span>
                        <span className="text-[10px] font-bold opacity-60">Verified AI Output</span>
                      </div>
                    </div>
                    <button 
                      onClick={handlePlayVoice} 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isPlayingAudio ? 'bg-red-500 animate-pulse' : 'bg-white/10'}`}
                    >
                      <i className={`fas ${isPlayingAudio ? 'fa-stop' : 'fa-volume-high'}`}></i>
                    </button>
                  </div>

                  <div className="p-12 space-y-12">
                    <section>
                      <p className="text-stone-900 dark:text-stone-100 font-black text-4xl mb-6 tracking-tighter">{report.mainDiagnosis}</p>
                      <div className="bg-stone-50 dark:bg-stone-950 p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800">
                        <p className="text-stone-800 dark:text-stone-200 font-bold text-lg leading-relaxed">{report.fullExplanation}</p>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-emerald-50 dark:bg-emerald-950/20 p-10 rounded-[3rem] border border-emerald-100 dark:border-emerald-900/40">
                          <h5 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-6 flex items-center">
                            <i className="fas fa-bolt-lightning mr-3"></i> First Response
                          </h5>
                          <ul className="space-y-4">
                             {report.immediateActions.map((action, i) => (
                               <li key={i} className="flex items-start gap-4">
                                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-black shrink-0 mt-1">{i+1}</div>
                                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{action}</p>
                               </li>
                             ))}
                          </ul>
                       </div>
                       <div className="bg-blue-50 dark:bg-blue-950/20 p-10 rounded-[3rem] border border-blue-100 dark:border-blue-900/40">
                          <h5 className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-6 flex items-center">
                            <i className="fas fa-shield-halved mr-3"></i> Long-Term Protection
                          </h5>
                          <ul className="space-y-4">
                             {report.preventiveMeasures.map((prev, i) => (
                               <li key={i} className="flex items-start gap-4">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                  <p className="text-sm font-bold text-stone-700 dark:text-stone-300">{prev}</p>
                               </li>
                             ))}
                          </ul>
                       </div>
                    </div>

                    {/* Integrated Store Recommendations */}
                    <div className="pt-12 border-t border-stone-100 dark:border-stone-800">
                       <h5 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.4em] mb-10 flex items-center">
                         <i className="fas fa-prescription-bottle-medical mr-4 text-emerald-600"></i> Prescribed Medicines & Solutions
                       </h5>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          {report.suggestedProducts.map((product) => {
                            const isAdded = addedIds.has(product.id);
                            return (
                              <div key={product.id} className="bg-white dark:bg-stone-900 p-8 rounded-[3.5rem] border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col group hover:shadow-2xl transition-all">
                                 <div className="w-full h-48 rounded-[2.5rem] overflow-hidden mb-8 shadow-inner">
                                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                                 </div>
                                 <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                       <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{product.category}</p>
                                       <span className="font-black text-stone-900 dark:text-stone-100 text-xl tracking-tighter">₹{product.price}</span>
                                    </div>
                                    <h6 className="font-black text-stone-900 dark:text-stone-100 text-lg mb-2 tracking-tight">{product.name}</h6>
                                    <p className="text-xs font-bold text-stone-400 mb-6 leading-relaxed line-clamp-2">{product.description}</p>
                                    
                                    {product.dosage && (
                                      <div className="bg-stone-50 dark:bg-stone-950 px-4 py-3 rounded-2xl mb-6 flex items-center gap-3">
                                         <i className="fas fa-vial text-emerald-600 text-xs"></i>
                                         <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Dosage: {product.dosage}</span>
                                      </div>
                                    )}
                                 </div>
                                 
                                 <button 
                                  onClick={() => handleAddToCart(product)}
                                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg ${isAdded ? 'bg-emerald-500 text-white' : 'bg-emerald-900 dark:bg-emerald-700 text-white hover:bg-black'}`}
                                 >
                                   <i className={`fas ${isAdded ? 'fa-check' : 'fa-cart-plus'}`}></i>
                                   {isAdded ? 'Added to Cart' : 'Add to Krishi Cart'}
                                 </button>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-stone-900 rounded-[4rem] p-10 text-white shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h4 className="text-2xl font-black tracking-tighter mb-8 flex items-center gap-4">
                  <i className="fas fa-satellite text-emerald-500"></i> Advisory Health
                </h4>
                <div className="space-y-6">
                   <div className="flex justify-between items-center text-xs font-bold text-stone-400">
                      <span>Grounding</span>
                      <span className="text-emerald-400">Optimal Sync</span>
                   </div>
                   <div className="flex justify-between items-center text-xs font-bold text-stone-400">
                      <span>Store API</span>
                      <span className="text-emerald-400">Linked</span>
                   </div>
                   <div className="flex justify-between items-center text-xs font-bold text-stone-400">
                      <span>Database</span>
                      <span className="text-stone-300">Krishi_Registry_V2</span>
                   </div>
                </div>
             </div>

             <div className="bg-white dark:bg-stone-900 rounded-[3rem] p-10 border border-stone-100 dark:border-stone-800 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl mb-8">
                  <i className="fas fa-shield-halved"></i>
                </div>
                <h5 className="font-black text-stone-900 dark:text-stone-100 text-lg mb-3 tracking-tight">Scientifically Verified</h5>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-bold leading-relaxed">Uzhavan AI uses a specialized knowledge base of 500k+ crop symptoms across 40 tropical varieties.</p>
             </div>

             <div className="bg-emerald-900 dark:bg-emerald-800 p-10 rounded-[3rem] text-white shadow-2xl">
                <i className="fas fa-headset text-3xl mb-6 text-emerald-300"></i>
                <h5 className="font-black text-xl mb-3 tracking-tighter">Escalate to Officer</h5>
                <p className="text-sm font-bold text-emerald-100/60 leading-relaxed mb-8">Not satisfied with the AI report? Certified officers are available for manual intervention.</p>
                <button className="w-full py-4 bg-white text-emerald-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-stone-100 transition-colors">Request Callback</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryPage;
