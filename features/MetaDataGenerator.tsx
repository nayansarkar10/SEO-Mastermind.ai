import React, { useState } from 'react';
import { generateSEOContent } from '../services/geminiService';
import { Tags, Loader2, Search } from 'lucide-react';

const MetaDataGenerator: React.FC = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // We'll store parsed output, but since the AI returns text, we might get a raw string.
  // We'll ask the AI to format strictly or just parse standard text. 
  // For simplicity and robustness, we will show the AI analysis text and try to extract a preview if possible, 
  // or just ask the user to fill the preview fields from the AI suggestion.
  // actually, let's ask for JSON to make the preview automatic.
  
  const [aiOutput, setAiOutput] = useState<string>('');
  const [previewData, setPreviewData] = useState<{title: string, desc: string} | null>(null);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    setAiOutput('');
    setPreviewData(null);

    try {
      const prompt = `Generate 3 options for SEO-friendly Meta Titles (max 60 chars) and Meta Descriptions (max 160 chars) for the following content.
      
      Content: "${content}"

      For the BEST option among them, provide a JSON block at the very end of your response like this:
      \`\`\`json
      {
        "title": "The Title Here",
        "description": "The Description Here"
      }
      \`\`\`
      `;

      const response = await generateSEOContent({ prompt });
      setAiOutput(response.text);

      // Try to extract JSON for preview
      const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          setPreviewData({
            title: parsed.title,
            desc: parsed.description
          });
        } catch (e) {
          console.error("Failed to parse JSON for preview", e);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
          <Tags className="w-5 h-5 mr-2 text-brand-500" />
          Generate Meta Tags
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Content Summary or Full Text
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your page content or a summary here..."
              className="w-full h-32 p-3 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-y"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !content.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Generate Tags
          </button>
        </div>
      </div>

      {/* SERP Preview */}
      {previewData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Google Search Preview (SERP)
          </h4>
          
          <div className="max-w-[600px] font-arial">
            <div className="flex items-center mb-1">
              <div className="bg-slate-100 rounded-full p-2 mr-3">
                <GlobeIcon className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-slate-800">example.com</span>
                <span className="text-xs text-slate-500">https://example.com › post</span>
              </div>
            </div>
            <h3 className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
              {previewData.title}
            </h3>
            <p className="text-[#4d5156] text-sm mt-1 leading-normal line-clamp-2">
              {previewData.desc}
            </p>
          </div>
        </div>
      )}

      {/* Full AI Output */}
      {aiOutput && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
           <h4 className="text-lg font-medium text-slate-900 mb-4 border-b pb-2">Analysis & Options</h4>
           <div className="prose prose-slate max-w-none prose-sm">
             <div className="whitespace-pre-wrap">{aiOutput.replace(/```json[\s\S]*```/, '')}</div>
           </div>
        </div>
      )}
    </div>
  );
};

const GlobeIcon: React.FC<{className?: string}> = ({className}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export default MetaDataGenerator;