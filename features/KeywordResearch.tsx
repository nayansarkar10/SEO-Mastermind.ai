import React, { useState } from 'react';
import { generateSEOContent } from '../services/geminiService';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { Search, Loader2, Globe, AlertCircle } from 'lucide-react';
import { GroundingChunk } from '../types';

const KeywordResearch: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [useGrounding, setUseGrounding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setGroundingSources([]);

    try {
      const prompt = `Perform extensive keyword research for the topic: "${topic}".
      Generate a comprehensive table of at least 10 keywords.
      Columns should be: Keyword, Search Intent (Informational, Commercial, Transactional), and a brief "Why target this?" explanation.
      Include a mix of head terms and long-tail keywords.
      ${useGrounding ? 'Use Google Search to find currently trending or relevant variations if possible.' : ''}
      After the table, provide a brief strategy summary.`;

      const response = await generateSEOContent({
        prompt,
        useGrounding
      });

      setResult(response.text);
      if (response.groundingChunks) {
        setGroundingSources(response.groundingChunks);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Research Parameters</h3>
          <p className="text-slate-500 text-sm">Enter a niche or topic to discover high-potential keywords.</p>
        </div>

        <form onSubmit={handleResearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. specialized coffee beans, yoga for beginners..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Find Keywords'
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setUseGrounding(!useGrounding)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                ${useGrounding ? 'bg-brand-600' : 'bg-slate-200'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${useGrounding ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <span className="text-sm text-slate-700 font-medium flex items-center">
              Enable Google Search Grounding
              <Globe className="w-4 h-4 text-brand-500 ml-1.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 ml-1">
            Enables the agent to access real-time search information for fresher results.
          </p>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">Keyword Strategy Report</h3>
          <MarkdownRenderer content={result} />
          
          {groundingSources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sources</h4>
              <ul className="space-y-2">
                {groundingSources.map((source, idx) => (
                  <li key={idx}>
                    <a 
                      href={source.web?.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-brand-600 hover:underline flex items-center truncate"
                    >
                      <Globe className="w-3 h-3 mr-1.5" />
                      {source.web?.title || source.web?.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeywordResearch;
