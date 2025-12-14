
import React from 'react';
import { AnalysisScore } from '../types';
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { ShieldCheck, Target, PenTool, Briefcase, Layout, BookOpen } from 'lucide-react';

interface ScoreCardsProps {
  scores: AnalysisScore;
}

const ScoreCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; desc: string }> = ({ title, value, icon, color, desc }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${color.replace('bg-', 'text-')}` })}
        </div>
        <span className={`text-2xl font-bold ${value >= 75 ? 'text-slate-800' : value >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{value}%</span>
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 h-8">{desc}</p>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
      <div 
        className={`h-1.5 rounded-full transition-all duration-1000 ${value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

const ScoreCards: React.FC<ScoreCardsProps> = ({ scores }) => {
  const data = [
    {
      name: 'Overall',
      uv: scores.overallScore,
      fill: '#2563eb',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Main Overall Score */}
      <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">Employability Rating</h3>
        <div className="relative w-32 h-32 flex items-center justify-center my-2">
           <div className="absolute inset-0 flex items-center justify-center flex-col">
             <span className="text-4xl font-bold text-white">{scores.overallScore}</span>
             <span className="text-xs text-slate-400 uppercase tracking-wider">/ 100</span>
           </div>
           <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={8} data={data} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="uv" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex space-x-2 mt-2">
          <span className="px-2 py-1 bg-white/10 rounded text-xs text-blue-200">HR-Grade</span>
          <span className="px-2 py-1 bg-white/10 rounded text-xs text-green-200">AI-Powered</span>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ScoreCard 
          title="ATS Compatibility" 
          value={scores.atsScore} 
          icon={<ShieldCheck />} 
          color="bg-blue-500" 
          desc="Parsing accuracy & formatting compliance."
        />
        <ScoreCard 
          title="Keyword Match" 
          value={scores.keywordMatch} 
          icon={<Target />} 
          color="bg-purple-500"
          desc="Alignment with JD hard/soft skills."
        />
        <ScoreCard 
          title="Skills Coverage" 
          value={scores.skillsScore} 
          icon={<BookOpen />} 
          color="bg-pink-500"
          desc="Depth of technical & functional proficiencies."
        />
        <ScoreCard 
          title="Experience Fit" 
          value={scores.experienceScore} 
          icon={<Briefcase />} 
          color="bg-amber-500" 
          desc="Role relevance and career progression."
        />
        <ScoreCard 
          title="Format & Readability" 
          value={scores.formatScore} 
          icon={<Layout />} 
          color="bg-indigo-500" 
          desc="Structure, white space, and brevity."
        />
      </div>
    </div>
  );
};

export default ScoreCards;
