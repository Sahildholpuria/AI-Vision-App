
import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import ImageEditor from './features/ImageEditor';
import ImageAnalyzer from './features/ImageAnalyzer';
import MemeGenerator from './features/MemeGenerator';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.EDITOR);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.EDITOR:
        return <ImageEditor />;
      case AppTab.ANALYZER:
        return <ImageAnalyzer />;
      case AppTab.MEME_GENERATOR:
        return <MemeGenerator />;
      default:
        return <ImageEditor />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8 bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
