import React, { useState } from 'react';
import { generateSEOContent } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Wand2, Loader2, Copy, Check, RefreshCw } from 'lucide-react';

const ContentOptimizer: React.FC = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleOptimize = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const prompt = `Please analyze and optimize the following draft content for SEO. 
      
      Draft Content:
      "${content}"

      Tasks:
      1. Analyze the current state (strengths/weaknesses).
      2. Rewrite the content to improve keyword density, readability, and structure.
      3. Suggest a compelling H1 and subheadings (H2, H3).
      4. Ensure the tone remains professional but engaging.
      `;

      const response = await generateSEOContent({ prompt });
      setResult(response.text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full min-h-[600px]">
      {/* Input Section */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Draft Content</h3>
          <button 
            onClick={() => setContent('')}
            className="text-xs text-slate-500 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="flex-1 p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your draft text here (blog post, about page, product description)..."
            className="w-full h-full min-h-[400px] resize-none outline-none text-slate-700 bg-transparent placeholder:text-slate-300"
          />
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleOptimize}
            disabled={isLoading || !content.trim()}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Optimizing Content...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Optimize for SEO
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Optimized Result</h3>
          {result && (
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-1 rounded-md transition-colors"
            >
              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <RefreshCw className="w-5 h-5 text-brand-500 animate-pulse" />
                </div>
              </div>
              <p className="animate-pulse">Analyzing structure and keywords...</p>
            </div>
          ) : result ? (
            <MarkdownRenderer content={result} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FileTextIcon className="w-16 h-16 mb-4 text-slate-200" />
              <p>Your optimized content will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FileTextIcon: React.FC<{className?: string}> = ({className}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" x2="8" y1="13" y2="13"/>
    <line x1="16" x2="8" y1="17" y2="17"/>
    <line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);

export default ContentOptimizer;
