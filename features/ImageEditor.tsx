
import React, { useState, useCallback } from 'react';
import ImageUpload from '../components/ImageUpload';
import Spinner from '../components/Spinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { editImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setEditedImageUrl(null);
    setError('');
  }, []);
  
  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setEditedImageUrl(null);
    setError('');
    setPrompt('');
  }, []);

  const handleGenerate = async () => {
    if (!imageFile || !prompt.trim()) {
      setError("Please upload an image and enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError('');
    setEditedImageUrl(null);

    try {
      const resultUrl = await editImage(imageFile, prompt);
      setEditedImageUrl(resultUrl);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!editedImageUrl) return;

    const mimeType = editedImageUrl.match(/data:([^;]+);/)?.[1] || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    const fileName = `edited-image.${extension}`;

    const link = document.createElement('a');
    link.href = editedImageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Image Editor</h2>
        <p className="text-gray-400 mt-1">Edit your images with simple text commands.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">1. Upload Image</h3>
          <ImageUpload onImageSelect={handleImageSelect} clearImage={clearImage} imagePreviewUrl={imagePreviewUrl} />
          
          {imageFile && (
            <>
              <h3 className="text-lg font-semibold text-gray-300">2. Describe Your Edit</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter, make the sky look like a galaxy, remove the car in the background..."
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Edit'}
              </button>
            </>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300">Result</h3>
          <div className="w-full h-auto min-h-[200px] bg-gray-700/50 rounded-lg flex items-center justify-center border border-gray-700 p-2">
            {isLoading && <Spinner text="Editing your image..." />}
            {error && !isLoading && <ErrorDisplay message={error} />}
            {editedImageUrl && !isLoading && !error && (
              <img src={editedImageUrl} alt="Edited result" className="w-full h-auto max-h-[500px] object-contain rounded-lg" />
            )}
            {!editedImageUrl && !isLoading && !error && <p className="text-gray-500">Your edited image will appear here.</p>}
          </div>
           {editedImageUrl && !isLoading && !error && (
            <button
              onClick={handleDownload}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Download Edit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
