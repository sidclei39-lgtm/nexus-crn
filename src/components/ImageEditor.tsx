import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Wand2, Loader2, Download, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function ImageEditor() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setMimeType(file.type);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key do Gemini não encontrada.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Extract base64 data without the data:image/jpeg;base64, prefix
      const base64Data = selectedImage.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
            setGeneratedImage(imageUrl);
            foundImage = true;
            break;
          }
        }
      }
      
      if (!foundImage) {
        throw new Error("Não foi possível gerar a imagem. Tente um prompt diferente.");
      }

    } catch (err: any) {
      console.error("Erro ao gerar imagem:", err);
      setError(err.message || "Ocorreu um erro ao processar a imagem.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const a = document.createElement('a');
      a.href = generatedImage;
      a.download = `imagem-editada-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wand2 className="text-emerald-500" />
          Editor de Imagens com IA
        </h2>
        <p className="text-zinc-400">Edite imagens de campanhas usando inteligência artificial. Ex: "Adicione um filtro retrô", "Remova o fundo".</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload and Original Image */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Imagem Original</h3>
          
          {!selectedImage ? (
            <div 
              className="flex-1 min-h-[300px] border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={48} className="mb-4" />
              <p className="font-medium">Clique para fazer upload</p>
              <p className="text-sm mt-1">PNG, JPG ou WEBP</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="relative flex-1 bg-black/50 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center border border-zinc-800">
                <img src={selectedImage} alt="Original" className="max-w-full max-h-[400px] object-contain" />
                <button 
                  onClick={() => {
                    setSelectedImage(null);
                    setGeneratedImage(null);
                    setPrompt('');
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors backdrop-blur-sm"
                  title="Remover imagem"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
          />
        </div>

        {/* Prompt and Generated Image */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Edição</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">O que você deseja fazer?</label>
            <div className="flex gap-3">
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Transforme em uma pintura a óleo..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                disabled={!selectedImage || isGenerating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && selectedImage && prompt.trim() && !isGenerating) {
                    handleGenerate();
                  }
                }}
              />
              <button
                onClick={handleGenerate}
                disabled={!selectedImage || !prompt.trim() || isGenerating}
                className="px-6 py-2.5 bg-emerald-500 text-black font-semibold rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                Gerar
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex-1 flex flex-col">
            <h4 className="text-sm font-medium text-zinc-400 mb-2">Resultado</h4>
            <div className="relative flex-1 bg-black/50 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center border border-zinc-800">
              {isGenerating ? (
                <div className="flex flex-col items-center text-emerald-500">
                  <Loader2 size={40} className="animate-spin mb-4" />
                  <p className="font-medium animate-pulse">A IA está trabalhando na sua imagem...</p>
                </div>
              ) : generatedImage ? (
                <>
                  <img src={generatedImage} alt="Gerada" className="max-w-full max-h-[400px] object-contain" />
                  <button 
                    onClick={handleDownload}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Download size={18} />
                    Baixar
                  </button>
                </>
              ) : (
                <div className="text-zinc-600 flex flex-col items-center">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p>A imagem editada aparecerá aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
