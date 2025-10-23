
import React, { useState, useCallback } from 'react';
import ImageUpload from '../components/ImageUpload';
import Spinner from '../components/Spinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { analyzeImage } from '../services/geminiService';

const ImageAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setAnalysis('');
    setError('');
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setAnalysis('');
    setError('');
  }, []);

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError("Please upload an image to analyze.");
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis('');

    try {
      const result = await analyzeImage(imageFile);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Image Analyzer</h2>
        <p className="text-gray-400 mt-1">Get a detailed description of any image.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">1. Upload Image</h3>
          <ImageUpload onImageSelect={handleImageSelect} clearImage={clearImage} imagePreviewUrl={imagePreviewUrl} />
          
          {imageFile && (
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Analysis</h3>
          <div className="w-full h-auto min-h-[300px] bg-gray-700/50 rounded-lg p-4 border border-gray-700 prose prose-invert prose-p:text-gray-300">
            {isLoading && <div className="flex justify-center items-center h-full"><Spinner text="Analyzing..." /></div>}
            {error && !isLoading && <ErrorDisplay message={error} />}
            {analysis && !isLoading && !error && (
              <p>{analysis}</p>
            )}
            {!analysis && !isLoading && !error && <p className="text-gray-500">The AI's analysis will appear here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
