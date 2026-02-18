import React, { useEffect, useState } from 'react';
import { getDailySEONews, fetchArticleContent } from '../services/geminiService';
import { NewsItem } from '../types';
import { ChevronRight, ExternalLink, Loader2, X, FileText, Globe } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reader Mode State
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [readerContent, setReaderContent] = useState<string>('');
  const [readerLoading, setReaderLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const items = await getDailySEONews();
        if (items && items.length > 0) {
          setNews(items);
        }
      } catch (error) {
        console.error("Error fetching news ticker:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const handleOpenReader = async (e: React.MouseEvent, item: NewsItem) => {
    e.stopPropagation();
    setSelectedArticle(item);
    setIsReaderOpen(true);
    setReaderLoading(true);
    setReaderContent(''); // Clear previous

    try {
      const content = await fetchArticleContent(item.url, item.title);
      setReaderContent(content);
    } catch (error) {
      setReaderContent("Sorry, we couldn't load the full content for this article.");
    } finally {
      setReaderLoading(false);
    }
  };

  const handleCloseReader = () => {
    setIsReaderOpen(false);
    setSelectedArticle(null);
  };

  if (loading) {
    return (
      <div className="w-full h-48 bg-[#1A6F44] rounded-xl flex items-center justify-center text-white mb-6 shadow-md animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin mr-3" />
        <span className="font-medium">Curating daily SEO insights...</span>
      </div>
    );
  }

  if (news.length === 0) return null;

  const currentArticle = news[currentIndex];

  return (
    <>
      <div className="w-full h-48 bg-gradient-to-r from-[#1e7f46] to-[#155d33] rounded-xl overflow-hidden shadow-md mb-6 relative flex group select-none">
        {/* Background decorative element */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 -skew-x-12 transform translate-x-12 pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 h-24 w-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Content - Full Width */}
        <div className="w-full p-6 md:p-8 flex flex-col justify-center text-white relative z-10 pr-20">
          <div>
            <div className="flex items-center space-x-3 text-xs font-medium text-green-100 mb-3 opacity-90">
               <span className="bg-white/20 px-2 py-0.5 rounded text-white flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  Trending
               </span>
               {currentArticle.author && (
                  <div className="flex items-center">
                    <span>{currentArticle.author}</span>
                  </div>
               )}
               <span className="text-green-300">•</span>
               <span>{currentArticle.date}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3 line-clamp-1">
              {currentArticle.title}
            </h2>
            
            <p className="text-green-50 text-sm md:text-base leading-relaxed line-clamp-2 max-w-4xl">
              {currentArticle.summary}
            </p>
          </div>

          <div className="flex items-center mt-4">
              <button 
                  onClick={(e) => handleOpenReader(e, currentArticle)}
                  className="relative z-30 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all flex items-center bg-white/10 border border-white/20 px-4 py-2 rounded-full cursor-pointer"
              >
                  Read Summary <FileText className="w-3 h-3 ml-2" />
              </button>
              
              <a 
                href={currentArticle.url}
                target="_blank"
                rel="noreferrer" 
                onClick={(e) => e.stopPropagation()}
                className="ml-4 relative z-30 text-green-100 text-xs hover:text-white transition-colors flex items-center hover:underline"
                title="Open original source"
              >
                Original Source <ExternalLink className="w-3 h-3 ml-1" />
              </a>
          </div>
        </div>

        {/* Navigation Arrow */}
        <button 
          onClick={handleNext}
          className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/20 to-transparent hover:from-black/40 flex items-center justify-center text-white transition-all z-40 cursor-pointer"
          aria-label="Next Article"
        >
          <ChevronRight className="w-10 h-10 drop-shadow-md opacity-80 hover:opacity-100" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 right-8 flex space-x-1.5 z-30">
          {news.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </div>

      {/* Reader Mode Modal */}
      {isReaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={handleCloseReader}
          />
          
          <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white z-10">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="bg-green-100 p-2 rounded-lg">
                   <FileText className="w-5 h-5 text-green-700" />
                </div>
                <div className="flex flex-col overflow-hidden">
                   <span className="text-xs font-bold text-green-600 uppercase tracking-wider">AI Reader Mode</span>
                   <h3 className="text-sm font-semibold text-slate-900 truncate max-w-md">
                     {selectedArticle?.title}
                   </h3>
                </div>
              </div>
              <button 
                onClick={handleCloseReader}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50">
              {readerLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
                  <p className="text-slate-500 font-medium animate-pulse">Reading and summarizing article...</p>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-sm border border-slate-100">
                  <MarkdownRenderer content={readerContent} />
                  
                  {selectedArticle?.url && (
                    <div className="mt-10 pt-6 border-t border-slate-100 flex justify-center">
                      <a 
                        href={selectedArticle.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium"
                      >
                        View original source <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewsTicker;
