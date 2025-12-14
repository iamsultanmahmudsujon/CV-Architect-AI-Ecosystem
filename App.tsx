import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import HistorySidebar from './components/HistorySidebar';
import { AppState, AnalysisResult, UserInput, HistoryItem } from './types';
import { analyzeCV } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('cv_architect_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (analysis: AnalysisResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: Date.now(),
      title: analysis.jobTitleDetected || "CV Analysis",
      score: analysis.scores.overallScore,
      result: analysis
    };
    const updated = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    localStorage.setItem('cv_architect_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('cv_architect_history', JSON.stringify(updated));
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item.result);
    setAppState(AppState.RESULTS);
    setIsHistoryOpen(false);
  };

  const handleAnalysis = async (data: UserInput) => {
    setAppState(AppState.ANALYZING);
    setError(null);
    try {
      const analysis = await analyzeCV(
        data.cvText, 
        data.jobDescription, 
        data.targetMarket,
        data.fileData,
        data.fileMimeType
      );
      setResult(analysis);
      saveToHistory(analysis);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setAppState(AppState.ERROR);
      
      // Determine user-friendly error message
      let msg = err.message || "An unexpected error occurred.";
      
      if (msg.includes("API Key")) {
        msg = "API Key is missing. Please check your Environment Variables in Vercel.";
      } else if (msg.includes("400")) {
        msg = "The file or content was rejected by the AI. It might be too large or corrupted. Try a smaller PDF.";
      } else if (msg.includes("429")) {
        msg = "Traffic limit exceeded (Quota). Please wait a minute and try again.";
      } else if (msg.includes("500") || msg.includes("503")) {
        msg = "AI Service is temporarily unavailable. Please try again later.";
      }
      
      setError(msg);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Header onOpenHistory={() => setIsHistoryOpen(true)} />
      
      <HistorySidebar 
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelect={handleHistorySelect}
        onDelete={deleteHistoryItem}
      />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {appState === AppState.IDLE && (
          <div className="animate-fade-in space-y-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                CV-Architect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI Ecosystem</span>
              </h1>
              <p className="text-lg text-slate-600">
                HR-grade analysis using Gemini 2.5. Includes ATS scoring, Salary Estimation, LinkedIn Audit, and tailored Career Paths for the {new Date().getFullYear()} job market.
              </p>
            </div>
            <InputForm onSubmit={handleAnalysis} isLoading={false} />
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full opacity-25"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-slate-800">Performing 360° Career Analysis...</h3>
              <p className="text-slate-500 max-w-md">Benchmarking salary, auditing for LinkedIn, extracting skills, and checking ATS compliance.</p>
            </div>
          </div>
        )}

        {appState === AppState.RESULTS && result && (
          <AnalysisDashboard result={result} onReset={resetApp} />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-xl mx-auto text-center pt-20">
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
              <p className="text-red-600 mb-6 font-medium">{error}</p>
              <button 
                onClick={resetApp}
                className="px-6 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CV-Architect AI. Powered by Google Gemini.</p>
          <p className="mt-2 text-xs">Disclaimer: AI-generated insights (including salary estimates) are suggestions and do not guarantee employment or compensation.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;