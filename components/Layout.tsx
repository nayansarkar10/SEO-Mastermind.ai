import React, { useState } from 'react';
import { AppView } from '../types';
import NewsTicker from './NewsTicker';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Tags, 
  MessageSquareText, 
  Menu,
  X,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.KEYWORD_RESEARCH, label: 'Keyword Research', icon: Search },
    { id: AppView.CONTENT_OPTIMIZER, label: 'Content Optimizer', icon: FileText },
    { id: AppView.META_GENERATOR, label: 'Meta Generator', icon: Tags },
    { id: AppView.IMAGE_GENERATOR, label: 'Image Generator', icon: ImageIcon },
    { id: AppView.CONSULTANT_CHAT, label: 'SEO Consultant', icon: MessageSquareText },
  ];

  const handleNavClick = (view: AppView) => {
    onViewChange(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center p-6 border-b border-slate-700">
          <TrendingUp className="w-8 h-8 text-brand-500 mr-3" />
          <h1 className="text-xl font-bold tracking-tight">SEO Mastermind</h1>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center px-4 py-3 rounded-lg transition-colors
                ${currentView === item.id 
                  ? 'bg-brand-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 text-center">
            Powered by Gemini API
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 py-4">
          <button 
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h2 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.id === currentView)?.label}
          </h2>

          <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Agent Ready</span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <div className="max-w-5xl mx-auto h-full">
            {/* News Ticker Section */}
            <NewsTicker />
            
            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
