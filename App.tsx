import React, { useState } from 'react';
import Layout from './components/Layout';
import KeywordResearch from './features/KeywordResearch';
import ContentOptimizer from './features/ContentOptimizer';
import MetaDataGenerator from './features/MetaDataGenerator';
import ImageGenerator from './features/ImageGenerator';
import SEOChat from './features/SEOChat';
import { AppView } from './types';
import { TrendingUp, Users, Target, Activity, Image as ImageIcon } from 'lucide-react';

const Dashboard: React.FC<{ onViewChange: (view: AppView) => void }> = ({ onViewChange }) => {
  return (
    <div className="space-y-8">
      <div className="text-center md:text-left mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to SEO Mastermind</h2>
        <p className="text-lg text-slate-600 max-w-2xl">
          Your AI-powered assistant for dominating search results. Select a tool to get started.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div 
          onClick={() => onViewChange(AppView.KEYWORD_RESEARCH)}
          className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-brand-300 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-500 transition-colors">
            <Target className="w-6 h-6 text-brand-600 group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Keyword Research</h3>
          <p className="text-slate-500">Discover high-value keywords with search intent analysis and long-tail opportunities.</p>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onViewChange(AppView.CONTENT_OPTIMIZER)}
          className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-brand-300 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
            <Activity className="w-6 h-6 text-purple-600 group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Content Optimizer</h3>
          <p className="text-slate-500">Analyze drafts, improve readability, and optimize headings for better ranking.</p>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onViewChange(AppView.META_GENERATOR)}
          className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-brand-300 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
            <TrendingUp className="w-6 h-6 text-green-600 group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Meta Generator</h3>
          <p className="text-slate-500">Create perfectly sized meta titles and descriptions with SERP previews.</p>
        </div>

        {/* Card 4 - New Image Generator */}
        <div 
          onClick={() => onViewChange(AppView.IMAGE_GENERATOR)}
          className="group bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-brand-300 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500 transition-colors">
            <ImageIcon className="w-6 h-6 text-pink-600 group-hover:text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Image Generator</h3>
          <p className="text-slate-500">Create and refine high-quality marketing visuals using AI.</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="mb-6 md:mb-0">
          <h3 className="text-2xl font-bold mb-2">Need strategic advice?</h3>
          <p className="text-brand-100">Chat with the expert consultant agent for custom strategies.</p>
        </div>
        <button 
          onClick={() => onViewChange(AppView.CONSULTANT_CHAT)}
          className="bg-white text-brand-700 font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center"
        >
          <Users className="w-5 h-5 mr-2" />
          Start Consultation
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.KEYWORD_RESEARCH:
        return <KeywordResearch />;
      case AppView.CONTENT_OPTIMIZER:
        return <ContentOptimizer />;
      case AppView.META_GENERATOR:
        return <MetaDataGenerator />;
      case AppView.IMAGE_GENERATOR:
        return <ImageGenerator />;
      case AppView.CONSULTANT_CHAT:
        return <SEOChat />;
      case AppView.DASHBOARD:
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
