import React, { useState } from 'react';
import { generateMarketingImage } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Wand2, RefreshCw, Download, AlertCircle } from 'lucide-react';

const ImageGenerator: React.FC = () => {
  const [content, setContent] = useState('');
  const [refinement, setRefinement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // Base64 string
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (isRefinement = false) => {
    const promptText = isRefinement ? refinement : content;
    if (!promptText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // If refining, we pass the current image as context
      const result = await generateMarketingImage({
        prompt: isRefinement 
          ? `Improve this image based on the following feedback: ${refinement}` 
          : `Create a marketing image based on this content: ${content}`,
        previousImageBase64: isRefinement && generatedImage ? generatedImage : undefined
      });

      if (result.imageBase64) {
        setGeneratedImage(result.imageBase64);
        setRefinement(''); // Clear refinement input on success
      } else {
        setError("The model didn't return an image. It might have refused the request or returned only text.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full min-h-[600px]">
      {/* Input Section */}
      <div className="flex flex-col space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-2 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-brand-500" />
            Marketing Image Creator
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            I am an expert marketing content maker with 10+ years of experience. 
            Paste your content below and I'll visualize it for you.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content / Prompt
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g. A cozy coffee shop in NYC with autumn vibes, serving latte art..."
                className="w-full h-32 p-3 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-y"
              />
            </div>
            
            <button
              onClick={() => handleGenerate(false)}
              disabled={isLoading || !content.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading && !generatedImage ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Visuals...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </button>
          </div>
        </div>

        {/* Refinement Section (Only visible if image exists) */}
        {generatedImage && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
            <h4 className="font-medium text-slate-900 mb-3">Refine this Image</h4>
            <div className="flex gap-3">
              <input
                type="text"
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                placeholder="e.g. Make the lighting warmer, add a customer..."
                className="flex-1 px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button
                onClick={() => handleGenerate(true)}
                disabled={isLoading || !refinement.trim()}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Output Section */}
      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 overflow-hidden flex flex-col items-center justify-center p-6 relative min-h-[400px]">
        {isLoading ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 animate-pulse">
              {generatedImage ? 'Refining image...' : 'Generating high-quality asset...'}
            </p>
          </div>
        ) : generatedImage ? (
          <div className="relative group w-full h-full flex items-center justify-center">
            <img 
              src={`data:image/png;base64,${generatedImage}`} 
              alt="Generated Marketing Content" 
              className="max-w-full max-h-[600px] object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
              <a 
                href={`data:image/png;base64,${generatedImage}`} 
                download="marketing-visual.png"
                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-slate-100 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500">
            <ImageIcon className="w-20 h-20 mx-auto mb-4 opacity-20" />
            <p>Your generated visual will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;