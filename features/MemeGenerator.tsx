
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ImageUpload from '../components/ImageUpload';
import Spinner from '../components/Spinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { generateMemeCaptions } from '../services/geminiService';
import { MEME_TEMPLATES } from '../constants';

const MemeGenerator: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const memeImageRef = useRef<HTMLImageElement>(null);

  const resetState = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setCaptions([]);
    setSelectedCaption('');
    setError('');
  };

  const handleImageSelect = useCallback((file: File) => {
    resetState();
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleTemplateSelect = async (templateUrl: string) => {
    resetState();
    setIsLoading(true);
    try {
        const response = await fetch(templateUrl);
        const blob = await response.blob();
        const file = new File([blob], "meme-template.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file));
    } catch (e) {
        setError("Failed to load template image.");
    } finally {
        setIsLoading(false);
    }
  };

  const clearImage = useCallback(() => {
    resetState();
  }, []);

  const handleGenerateCaptions = async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }
    setIsLoading(true);
    setError('');
    setCaptions([]);
    setSelectedCaption('');
    
    try {
      const result = await generateMemeCaptions(imageFile);
      setCaptions(result);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = memeImageRef.current;
    if (!canvas || !ctx || !img) return;

    const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, w, h);

    if (selectedCaption) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        
        let fontSize = Math.floor(w / 10);
        
        const fitText = () => {
             ctx.font = `bold ${fontSize}px Impact, sans-serif`;
             return ctx.measureText(selectedCaption).width < w * 0.9;
        }

        while(!fitText() && fontSize > 10){
            fontSize--;
        }
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeText(selectedCaption, canvas.width / 2, y + 10);
        ctx.fillText(selectedCaption, canvas.width / 2, y + 10);
    }
  }, [selectedCaption]);

  useEffect(() => {
    const img = memeImageRef.current;
    if (img && img.complete) {
        drawMeme();
    } else if (img) {
        img.onload = drawMeme;
    }
  }, [imagePreviewUrl, selectedCaption, drawMeme]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Meme Generator</h2>
        <p className="text-gray-400 mt-1">Create viral memes in seconds with AI-powered captions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">1. Choose an Image</h3>
          <ImageUpload onImageSelect={handleImageSelect} clearImage={clearImage} imagePreviewUrl={imagePreviewUrl} />
          
          <h3 className="text-lg font-semibold text-gray-300 pt-4">Or use a template</h3>
          <div className="grid grid-cols-2 gap-2">
            {MEME_TEMPLATES.slice(0, 4).map(template => (
              <img key={template.id} src={template.url} alt={template.name}
                   className="rounded-md cursor-pointer hover:ring-2 hover:ring-purple-500 transition"
                   onClick={() => handleTemplateSelect(template.url)} />
            ))}
          </div>

          {imageFile && (
            <>
              <h3 className="text-lg font-semibold text-gray-300 pt-4">2. Get Captions</h3>
              <button
                onClick={handleGenerateCaptions}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <span>Magic Caption</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V4H7v1H5V4zM5 7h10v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" /><path d="M11.707 11.293a1 1 0 010 1.414l-2 2a1 1 0 01-1.414 0l-1-1a1 1 0 111.414-1.414L9 12.586l1.293-1.293a1 1 0 011.414 0z" /></svg>
              </button>
            </>
          )}

          {isLoading && <Spinner text="Generating captions..." />}
          {error && <ErrorDisplay message={error} />}

          {captions.length > 0 && !isLoading && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">3. Pick a Caption</h3>
              {captions.map((caption, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCaption(caption)}
                  className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${selectedCaption === caption ? 'bg-purple-800 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {caption}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Meme Preview</h3>
          <div className="relative w-full aspect-video bg-gray-700/50 rounded-lg flex items-center justify-center border border-gray-700">
            {!imagePreviewUrl && <p className="text-gray-500">Your meme will appear here.</p>}
            <canvas ref={canvasRef} width="800" height="450" className="w-full h-full object-contain rounded-lg"></canvas>
            <img ref={memeImageRef} src={imagePreviewUrl || ''} className="hidden" alt="meme base" crossOrigin="anonymous"/>
          </div>
          {selectedCaption && (
            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Download Meme
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemeGenerator;
