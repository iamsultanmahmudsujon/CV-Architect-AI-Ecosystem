
import React, { useState, useRef } from 'react';
import { AnalysisResult, HeadshotAnalysis } from '../types';
import ScoreCards from './ScoreCards';
import { AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp, RefreshCw, FileSearch, Lightbulb, Sparkles, Download, Layout, FileText, GraduationCap, Briefcase, Users, FilePenLine, Copy, Linkedin, DollarSign, BookOpen, Rocket, Code2, Printer, Camera, Image as ImageIcon } from 'lucide-react';
import { analyzeHeadshot } from '../services/geminiService';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'sections' | 'templates' | 'interview' | 'coverLetter' | 'linkedin' | 'projects' | 'photo'>('overview');
  
  // Headshot State
  const [headshotImage, setHeadshotImage] = useState<string | null>(null);
  const [headshotResult, setHeadshotResult] = useState<HeadshotAnalysis | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const downloadDoc = (content: string, filename: string) => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="utf-8"><title>Document</title>
      <style>body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }</style>
      </head><body>`;
    const footer = `</body></html>`;
    const fullContent = header + content + footer;
    
    const blob = new Blob(['\ufeff', fullContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = (type: 'ats' | 'executive' | 'fresher') => {
      let content = "";
      let filename = "";
       if (type === 'ats') {
      filename = "ATS_Standard_CV_Template.doc";
       content = `
        <h1>[YOUR NAME]</h1>
        <p class="contact">[City, State, Zip Code] | [Phone Number] | [Email Address] | [LinkedIn URL]</p>
        <h2>PROFESSIONAL SUMMARY</h2>
        <p>[3-4 sentences summarizing your experience, key skills, and major achievements, tailored to the job description. Avoid using "I" or "My". Focus on value delivered.]</p>
        <h2>CORE COMPETENCIES</h2>
        <p><strong>Skills:</strong> [Skill 1] &bull; [Skill 2] &bull; [Skill 3] &bull; [Skill 4] &bull; [Skill 5] &bull; [Skill 6]<br/><strong>Tools:</strong> [Tool 1] &bull; [Tool 2] &bull; [Tool 3]</p>
        <h2>PROFESSIONAL EXPERIENCE</h2>
        <p><strong>[Job Title]</strong> &nbsp;|&nbsp; [Company Name] &nbsp;|&nbsp; [City, State] <span style="float:right"><strong>[Month, Year] – Present</strong></span></p>
        <ul><li>[Action Verb] [Task/Project] resulting in [Quantifiable Outcome/Metric].</li><li>[Action Verb] [Task] using [Tools/Skills] to achieve [Result].</li></ul>
        <h2>EDUCATION</h2>
        <p><strong>[Degree Name]</strong> in [Major] &nbsp;|&nbsp; [University Name] <span style="float:right">[Year]</span></p>
      `;
    } else if (type === 'executive') {
      filename = "Modern_Executive_CV_Template.doc";
      content = `
        <h1 style="color: #2e5cb8;">[YOUR NAME]</h1>
        <p>[Contact Info]</p>
        <hr/>
        <h2 style="color: #2e5cb8;">SENIOR EXECUTIVE PROFILE</h2>
        <p>Visionary Executive with [Number]+ years of experience...</p>
        <h2 style="color: #2e5cb8;">CAREER HIGHLIGHTS</h2>
        <ul><li><strong>Revenue Growth:</strong> Delivered $XXM...</li></ul>
        <h2 style="color: #2e5cb8;">PROFESSIONAL EXPERIENCE</h2>
        <p><strong>[Company]</strong> | [Role]</p>
      `;
    } else {
      filename = "Academic_Fresher_CV_Template.doc";
      content = `
        <h1>[YOUR NAME]</h1>
        <p>[Contact Info]</p>
        <h2>EDUCATION</h2>
        <p><strong>[Degree]</strong> | [University]</p>
        <h2>PROJECTS</h2>
        <p><strong>[Project]</strong></p>
        <ul><li>Details...</li></ul>
        <h2>SKILLS</h2>
        <ul><li>List...</li></ul>
      `;
    }
    downloadDoc(content, filename);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleDownloadPDF = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert("Please allow popups to download the report.");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>CV Analysis Report - ${result.jobTitleDetected || 'Candidate'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .page-break { page-break-before: always; }
              @page { margin: 1cm; }
            }
            body { font-family: 'Inter', sans-serif; }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        </head>
        <body class="bg-white p-8 max-w-4xl mx-auto text-slate-900">
          <!-- Header -->
          <div class="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">CV Audit Report</h1>
              <p class="text-slate-500 mt-1">Generated by CV-Architect AI Ecosystem</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-slate-500">Analysis Date</div>
              <div class="font-medium mb-2">${new Date().toLocaleDateString()}</div>
              <div class="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                Overall Score: ${result.scores.overallScore}/100
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h2 class="text-xl font-bold text-slate-800 mb-3">Executive Summary</h2>
            <p class="text-slate-700 leading-relaxed text-sm">${result.summary}</p>
            <div class="mt-4 flex gap-6 text-sm border-t border-slate-200 pt-3">
              <div><span class="font-bold text-slate-900">Target Market:</span> ${result.marketFit}</div>
              <div><span class="font-bold text-slate-900">Detected Role:</span> ${result.jobTitleDetected}</div>
            </div>
          </div>

          <!-- Scores Grid -->
          <h2 class="text-lg font-bold text-slate-900 mb-4">Scoring Breakdown</h2>
          <div class="grid grid-cols-5 gap-3 mb-8 text-center">
            <div class="p-3 border border-blue-100 bg-blue-50 rounded-lg">
              <div class="text-[10px] text-blue-700 font-bold uppercase tracking-wider">ATS Score</div>
              <div class="text-xl font-bold text-blue-800">${result.scores.atsScore}%</div>
            </div>
            <div class="p-3 border border-purple-100 bg-purple-50 rounded-lg">
              <div class="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Keywords</div>
              <div class="text-xl font-bold text-purple-800">${result.scores.keywordMatch}%</div>
            </div>
            <div class="p-3 border border-pink-100 bg-pink-50 rounded-lg">
              <div class="text-[10px] text-pink-700 font-bold uppercase tracking-wider">Skills</div>
              <div class="text-xl font-bold text-pink-800">${result.scores.skillsScore}%</div>
            </div>
             <div class="p-3 border border-amber-100 bg-amber-50 rounded-lg">
              <div class="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Experience</div>
              <div class="text-xl font-bold text-amber-800">${result.scores.experienceScore}%</div>
            </div>
             <div class="p-3 border border-indigo-100 bg-indigo-50 rounded-lg">
              <div class="text-[10px] text-indigo-700 font-bold uppercase tracking-wider">Format</div>
              <div class="text-xl font-bold text-indigo-800">${result.scores.formatScore}%</div>
            </div>
          </div>

          <!-- Strengths & Weaknesses -->
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 class="font-bold text-green-700 mb-3 flex items-center border-b border-green-100 pb-2">
                Top Strengths
              </h3>
              <ul class="space-y-2">
                ${result.strengths.map(s => `
                  <li class="flex items-start text-sm text-slate-700">
                    <span class="mr-2 text-green-500">✓</span> ${s}
                  </li>
                `).join('')}
              </ul>
            </div>
            <div>
              <h3 class="font-bold text-red-700 mb-3 flex items-center border-b border-red-100 pb-2">
                Critical Gaps
              </h3>
              <ul class="space-y-2">
                ${result.weaknesses.map(w => `
                  <li class="flex items-start text-sm text-slate-700">
                    <span class="mr-2 text-red-500">⚠</span> ${w}
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <!-- Section Analysis -->
          <div class="mb-8">
            <h2 class="text-lg font-bold text-slate-900 mb-4 bg-slate-100 p-2 rounded">Detailed Section Analysis</h2>
            ${result.sectionAnalysis.map(section => `
              <div class="mb-5 border-b border-slate-100 pb-4 break-inside-avoid">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-slate-800">${section.sectionName}</h4>
                  <span class="text-[10px] font-bold px-2 py-1 rounded uppercase border ${
                    section.status === 'good' ? 'bg-green-100 text-green-700 border-green-200' :
                    section.status === 'warning' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }">${section.status}</span>
                </div>
                <p class="text-sm text-slate-600 mb-2">${section.feedback}</p>
                <div class="bg-indigo-50 p-3 rounded text-sm text-indigo-800 border border-indigo-100">
                  <strong>Recommendation:</strong> ${section.suggestion}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="page-break"></div>

          <!-- Keywords -->
          <div class="mb-8 pt-8">
            <h2 class="text-lg font-bold text-slate-900 mb-4 bg-slate-100 p-2 rounded">Keyword Gap Analysis</h2>
            <div class="mb-6">
              <h4 class="text-sm font-bold text-red-600 mb-2 uppercase tracking-wide">Missing Keywords (Add These)</h4>
              <div class="flex flex-wrap gap-2">
                ${result.keywords.missing.length ? result.keywords.missing.map(k => 
                  `<span class="px-2 py-1 bg-white border border-red-200 text-red-700 text-xs font-medium rounded shadow-sm">${k}</span>`
                ).join('') : '<span class="text-slate-500 text-sm italic">No critical keywords missing.</span>'}
              </div>
            </div>
             <div>
              <h4 class="text-sm font-bold text-green-600 mb-2 uppercase tracking-wide">Matched Keywords</h4>
              <div class="flex flex-wrap gap-2">
                ${result.keywords.present.map(k => 
                  `<span class="px-2 py-1 bg-white border border-green-200 text-green-700 text-xs font-medium rounded shadow-sm">${k}</span>`
                ).join('')}
              </div>
            </div>
          </div>

          <!-- Project Ideas -->
          ${result.projectIdeas && result.projectIdeas.length > 0 ? `
            <div class="mb-8 break-inside-avoid">
              <h2 class="text-lg font-bold text-slate-900 mb-4 bg-slate-100 p-2 rounded">Recommended Portfolio Projects</h2>
              <div class="grid grid-cols-1 gap-4">
                ${result.projectIdeas.map(p => `
                  <div class="border border-slate-200 p-4 rounded-lg bg-white shadow-sm">
                    <div class="flex justify-between items-start">
                      <h4 class="font-bold text-slate-800 text-sm">${p.title}</h4>
                      <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase font-bold">${p.difficulty}</span>
                    </div>
                    <p class="text-xs text-slate-600 mt-2 leading-relaxed">${p.description}</p>
                    <div class="mt-3 flex flex-wrap gap-1">
                      ${p.techStack.map(t => `<span class="text-[10px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">${t}</span>`).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Interview Questions -->
           <div class="mb-8 break-inside-avoid">
            <h2 class="text-lg font-bold text-slate-900 mb-4 bg-slate-100 p-2 rounded">Top Interview Questions</h2>
            <ul class="space-y-3">
              ${result.interviewQuestions.map((q, i) => `
                <li class="flex gap-3 text-sm text-slate-800">
                  <span class="flex-shrink-0 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">${i+1}</span>
                  <span class="pt-0.5">${q}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          
           <!-- Footer -->
           <div class="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
             <div>CV-Architect AI Ecosystem</div>
             <div>${new Date().toLocaleString()}</div>
           </div>

           <script>
             window.onload = () => {
               setTimeout(() => {
                 window.print();
               }, 800);
             };
           </script>
        </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  // Headshot Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setHeadshotImage(base64);
        setIsAnalyzingPhoto(true);
        setHeadshotResult(null);
        try {
          // Strip prefix for API
          const base64Data = base64.split(',')[1];
          const analysis = await analyzeHeadshot(base64Data, file.type);
          setHeadshotResult(analysis);
        } catch (err) {
          console.error(err);
          alert("Failed to analyze photo");
        } finally {
          setIsAnalyzingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analysis Report</h2>
          <p className="text-slate-500 text-sm">Role Detected: <span className="font-semibold text-slate-700">{result.jobTitleDetected || "General"}</span> | Market: <span className="font-semibold text-slate-700">{result.marketFit}</span></p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Download PDF Report
          </button>
          <button 
            onClick={onReset}
            className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Analysis
          </button>
        </div>
      </div>

      <ScoreCards scores={result.scores} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6">
          <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: null },
              { id: 'sections', label: 'Gap Analysis', icon: null },
              { id: 'keywords', label: 'Keywords & Learning', icon: BookOpen },
              { id: 'projects', label: 'Project Ideas', icon: Rocket },
              { id: 'photo', label: 'Photo AI', icon: Camera },
              { id: 'linkedin', label: 'LinkedIn Audit', icon: Linkedin },
              { id: 'templates', label: 'HR Templates', icon: Layout },
              { id: 'interview', label: 'Interview Prep', icon: Users },
              { id: 'coverLetter', label: 'Cover Letter', icon: FilePenLine },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Summary Block */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                     <FileSearch className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Executive Overview</h3>
                    <p className="text-slate-700 leading-relaxed">{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* Salary Estimate */}
              {result.salaryEstimation && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign className="w-24 h-24 text-green-600" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-green-900 mb-1 flex items-center">
                      <DollarSign className="w-5 h-5 mr-1" /> Salary Benchmark
                    </h3>
                    <p className="text-sm text-green-700 mb-4">Estimated range for this role in {result.marketFit}</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-green-800">{result.salaryEstimation.currency} {result.salaryEstimation.min}</span>
                      <span className="text-slate-500 font-medium">to</span>
                      <span className="text-3xl font-extrabold text-green-800">{result.salaryEstimation.max}</span>
                    </div>
                    <p className="mt-3 text-sm text-green-800 italic">{result.salaryEstimation.explanation}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="bg-white rounded-lg">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                    Top Strengths
                  </h3>
                  <ul className="space-y-3">
                    {result.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                         <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-3"></span>
                         <span className="text-slate-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white rounded-lg">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                    Critical Gaps
                  </h3>
                   <ul className="space-y-3">
                    {result.weaknesses.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                         <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-3"></span>
                         <span className="text-slate-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.rewrittenSummary && (
                <div className="mt-6 border border-indigo-100 rounded-xl overflow-hidden">
                  <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center">
                    <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
                    <h3 className="text-sm font-bold text-indigo-900">AI-Suggested Professional Summary</h3>
                  </div>
                  <div className="p-6 bg-white">
                    <p className="text-slate-600 text-sm italic leading-relaxed">"{result.rewrittenSummary}"</p>
                    <p className="text-xs text-slate-400 mt-3 text-right">Optimized for {result.marketFit} market</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-200">
                 <div>
                   <h3 className="text-lg font-bold text-slate-900">Keyword Optimization Score</h3>
                   <p className="text-sm text-slate-500">Percentage of essential JD keywords found in your CV</p>
                 </div>
                 <div className="text-4xl font-extrabold text-slate-800">{result.keywords.score}%</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-red-100 rounded-xl p-5 bg-red-50/30">
                  <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-4 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" /> Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.missing.length > 0 ? (
                      result.keywords.missing.map((kw, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-red-600 border border-red-200 shadow-sm">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No critical keywords missing. Excellent coverage!</span>
                    )}
                  </div>
                </div>
                <div className="border border-green-100 rounded-xl p-5 bg-green-50/30">
                  <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-4 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Matched Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.present.map((kw, i) => (
                      <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-green-700 border border-green-200 shadow-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Path Section */}
              {result.learningPath && result.learningPath.length > 0 && (
                <div className="mt-8 border-t border-slate-200 pt-6">
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                     <BookOpen className="w-5 h-5 mr-2 text-blue-600" /> Recommended Upskilling Path
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {result.learningPath.map((item, idx) => (
                       <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                             <span className="font-bold text-slate-800 text-sm">{item.skill}</span>
                             <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{item.type}</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-3">Try searching:</p>
                          <div className="bg-white p-2 rounded border border-slate-200 text-sm font-medium text-indigo-600 truncate">
                            {item.recommendation}
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-4 animate-fade-in">
               <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-700">
                  Review the section-by-section breakdown below. Expand each item to see specific actionable advice.
                </p>
              </div>
              {result.sectionAnalysis.map((section, idx) => (
                <SectionAccordion key={idx} data={section} />
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 p-6 rounded-xl">
                  <div className="flex items-center mb-2">
                     <Rocket className="w-6 h-6 text-violet-600 mr-3" />
                     <h3 className="text-lg font-bold text-slate-900">Portfolio Project Generator</h3>
                  </div>
                  <p className="text-slate-700 text-sm">
                    Based on your missing skills, here are 3 unique projects you should build to impress recruiters for this role.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.projectIdeas && result.projectIdeas.length > 0 ? (
                    result.projectIdeas.map((project, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col hover:shadow-lg transition-shadow">
                         <div className="flex justify-between items-start mb-4">
                           <div className="bg-slate-100 p-2 rounded-lg">
                             <Code2 className="w-6 h-6 text-slate-600" />
                           </div>
                           <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                             project.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                             project.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                             'bg-red-100 text-red-700'
                           }`}>
                             {project.difficulty}
                           </span>
                         </div>
                         <h4 className="font-bold text-slate-900 mb-2">{project.title}</h4>
                         <p className="text-sm text-slate-500 mb-4 flex-grow">{project.description}</p>
                         
                         <div className="mt-auto">
                           <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Tech Stack</p>
                           <div className="flex flex-wrap gap-2">
                             {project.techStack.map((tech, tIdx) => (
                               <span key={tIdx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-medium">
                                 {tech}
                               </span>
                             ))}
                           </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12 text-slate-400 italic">
                      No project suggestions available. Try running a new analysis.
                    </div>
                  )}
                </div>
             </div>
          )}

          {activeTab === 'photo' && (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-slate-900 text-white p-6 rounded-xl flex justify-between items-center">
                 <div>
                   <h3 className="text-lg font-bold mb-1 flex items-center">
                      <Camera className="w-5 h-5 mr-2" /> AI Headshot Analyzer
                   </h3>
                   <p className="text-slate-400 text-sm">Upload your LinkedIn or CV photo for an instant professional audit.</p>
                 </div>
                 <button onClick={() => photoInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                   Upload Photo
                 </button>
                 <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Image Preview */}
                  <div className="md:col-span-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative">
                       {headshotImage ? (
                         <img src={headshotImage} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <div className="text-center text-slate-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No image selected</p>
                         </div>
                       )}
                       {isAnalyzingPhoto && (
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Analysis Results */}
                  <div className="md:col-span-2">
                    {!headshotResult && !isAnalyzingPhoto && (
                       <div className="h-full flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100">
                         Upload a photo to see analysis results.
                       </div>
                    )}
                    {headshotResult && (
                      <div className="space-y-6">
                         <div className="flex items-center space-x-4">
                            <div className={`text-5xl font-bold ${headshotResult.score >= 80 ? 'text-green-600' : headshotResult.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                              {headshotResult.score}
                            </div>
                            <div>
                               <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">Professional Score</div>
                               <div className="h-2 w-48 bg-slate-100 rounded-full mt-1">
                                 <div className={`h-full rounded-full ${headshotResult.score >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${headshotResult.score}%` }}></div>
                               </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                               <div className="text-xs font-bold text-slate-500 uppercase">Lighting</div>
                               <p className="text-sm font-medium text-slate-800">{headshotResult.lighting}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded border border-slate-100">
                               <div className="text-xs font-bold text-slate-500 uppercase">Background</div>
                               <p className="text-sm font-medium text-slate-800">{headshotResult.background}</p>
                            </div>
                             <div className="bg-slate-50 p-3 rounded border border-slate-100">
                               <div className="text-xs font-bold text-slate-500 uppercase">Attire</div>
                               <p className="text-sm font-medium text-slate-800">{headshotResult.attire}</p>
                            </div>
                             <div className="bg-slate-50 p-3 rounded border border-slate-100">
                               <div className="text-xs font-bold text-slate-500 uppercase">Expression</div>
                               <p className="text-sm font-medium text-slate-800">{headshotResult.expression}</p>
                            </div>
                         </div>

                         <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center"><Lightbulb className="w-4 h-4 mr-2"/> Improvement Tips</h4>
                            <ul className="space-y-1">
                              {headshotResult.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-blue-900 flex items-start">
                                  <span className="mr-2">•</span> {tip}
                                </li>
                              ))}
                            </ul>
                         </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'linkedin' && (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-[#0077b5] bg-opacity-5 border border-blue-100 p-6 rounded-xl">
                 <div className="flex items-center mb-4">
                    <Linkedin className="w-6 h-6 text-[#0077b5] mr-3" />
                    <h3 className="text-lg font-bold text-slate-900">LinkedIn Profile Optimizer</h3>
                 </div>
                 <p className="text-slate-600 text-sm mb-4">
                   Align your LinkedIn profile with your CV to attract recruiters.
                 </p>
                 
                 <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                       <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Suggested Headline</h4>
                       <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-800 text-lg">{result.linkedinAudit?.headline || "N/A"}</p>
                          <button onClick={() => copyToClipboard(result.linkedinAudit?.headline || "")} className="text-blue-600 hover:text-blue-800 text-xs font-bold ml-4">Copy</button>
                       </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                       <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Suggested 'About' Summary</h4>
                       <p className="text-slate-700 text-sm whitespace-pre-line">{result.linkedinAudit?.aboutSummary || "N/A"}</p>
                       <button onClick={() => copyToClipboard(result.linkedinAudit?.aboutSummary || "")} className="mt-3 text-blue-600 hover:text-blue-800 text-xs font-bold">Copy to Clipboard</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Missing Profile Sections</h4>
                          <ul className="list-disc pl-4 text-sm text-red-600">
                             {result.linkedinAudit?.missingSections.map((s, i) => <li key={i}>{s}</li>) || <li>None detected</li>}
                          </ul>
                       </div>
                       <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Banner Image Idea</h4>
                          <p className="text-slate-700 text-sm italic">{result.linkedinAudit?.bannerSuggestion || "Professional workspace"}</p>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
                 <h3 className="text-lg font-bold text-indigo-900 mb-2">Standard HR-Approved Formats</h3>
                 <p className="text-indigo-700 text-sm">
                   Download these templates to ensure your CV is 100% ATS-compliant.
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col bg-white">
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">ATS Standard</h4>
                    <p className="text-sm text-slate-500 mb-6 flex-grow">
                      The safest format for online applications. Simple hierarchy.
                    </p>
                    <button onClick={() => downloadTemplate('ats')} className="w-full py-2.5 flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      <Download className="w-4 h-4" /><span>Download .doc</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col bg-white">
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-purple-600">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Modern Executive</h4>
                    <p className="text-sm text-slate-500 mb-6 flex-grow">
                      Highlights core competencies and achievements early.
                    </p>
                    <button onClick={() => downloadTemplate('executive')} className="w-full py-2.5 flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      <Download className="w-4 h-4" /><span>Download .doc</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col bg-white">
                     <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-green-600">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Academic / Fresher</h4>
                    <p className="text-sm text-slate-500 mb-6 flex-grow">
                      Prioritizes education and projects.
                    </p>
                    <button onClick={() => downloadTemplate('fresher')} className="w-full py-2.5 flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      <Download className="w-4 h-4" /><span>Download .doc</span>
                    </button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-amber-900 mb-2">Interview Readiness</h3>
                <p className="text-amber-800 text-sm">
                  Based on your CV's gaps and the Job Description, expect these questions in your interview.
                </p>
              </div>
              <div className="space-y-4">
                {result.interviewQuestions && result.interviewQuestions.length > 0 ? (
                  result.interviewQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 text-lg">{q}</h4>
                        <p className="text-xs text-slate-400 mt-2">Tip: Use the STAR method (Situation, Task, Action, Result) to answer.</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No interview questions generated. Try running the analysis again.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'coverLetter' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-teal-50 border border-teal-100 p-6 rounded-xl flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-teal-900 mb-2">Tailored Cover Letter</h3>
                    <p className="text-teal-800 text-sm">
                      An AI-drafted cover letter connecting your specific experience to the Job Description.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => copyToClipboard(result.coverLetter)}
                      className="flex items-center px-3 py-2 bg-white border border-teal-200 rounded text-sm font-medium text-teal-700 hover:bg-teal-50"
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </button>
                    <button 
                      onClick={() => downloadDoc(`<p>${result.coverLetter.replace(/\n/g, '<br/>')}</p>`, 'Cover_Letter.doc')}
                      className="flex items-center px-3 py-2 bg-teal-600 border border-transparent rounded text-sm font-medium text-white hover:bg-teal-700"
                    >
                      <Download className="w-4 h-4 mr-2" /> Doc
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap text-slate-700 leading-relaxed font-serif">
                  {result.coverLetter || "Cover letter could not be generated."}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionAccordion: React.FC<{ data: any }> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-700 bg-green-100 border-green-200';
      case 'warning': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'missing': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center space-x-4">
           <div className={`w-24 text-center py-1 rounded text-xs font-bold uppercase border ${getStatusColor(data.status)}`}>
             {data.status}
           </div>
           <span className="font-semibold text-slate-900">{data.sectionName}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      
      {isOpen && (
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Analysis & Feedback</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{data.feedback}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-600 uppercase mb-2 flex items-center">
               <Lightbulb className="w-3 h-3 mr-1.5" /> Recommendation
            </h4>
            <p className="text-sm text-slate-700">{data.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;
