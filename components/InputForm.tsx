import React, { useState, useRef } from 'react';
import { UserInput } from '../types';
import { Upload, Search, Briefcase, FileText, Globe, Lock, FileType, X } from 'lucide-react';

// Declare mammoth on window object as it's loaded via CDN
declare const mammoth: any;

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [market, setMarket] = useState('Bangladesh');
  
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let fileData: string | undefined;
    let fileMimeType: string | undefined;
    let textToAnalyze = cvText;

    if (file) {
      const isDocx = file.name.toLowerCase().endsWith('.docx');
      const isDoc = file.name.toLowerCase().endsWith('.doc');

      if (isDocx) {
        // Handle .docx parsing in browser
        try {
          const arrayBuffer = await file.arrayBuffer();
          if (typeof mammoth !== 'undefined') {
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            textToAnalyze = result.value;
            // Note: We send the extracted text, not the file blob, because Gemini 
            // doesn't natively support docx in inlineData.
          } else {
            setFileError("Document parser not loaded. Please refresh or try PDF.");
            return;
          }
        } catch (err) {
          console.error(err);
          setFileError("Failed to read Word document. Please try saving as PDF.");
          return;
        }
      } else if (isDoc) {
        setFileError("Legacy .doc format is not supported. Please save as .docx or PDF.");
        return;
      } else {
        // Handle PDF and Images (natively supported by Gemini via Base64)
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data:application/pdf;base64, prefix
              const base64String = result.split(',')[1];
              resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          fileData = base64;
          fileMimeType = file.type;
        } catch (err) {
          setFileError("Failed to process file");
          return;
        }
      }
    }

    onSubmit({ 
      cvText: textToAnalyze, 
      jobDescription: jdText, 
      targetMarket: market,
      fileData,
      fileMimeType
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    
    if (selectedFile) {
      // 20 MB Limit (Safer for API inline usage)
      const maxSize = 20 * 1024 * 1024;

      if (selectedFile.size > maxSize) {
        setFileError("File size exceeds 20MB limit. Please upload a compressed or smaller file.");
        return;
      }

      // Allowed Mime Types including MS Word
      // Note: MIME type detection for .docx can be flaky in some browsers/OS, so we check extension too.
      const validMimeTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'image/webp',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      const isDoc = selectedFile.name.toLowerCase().endsWith('.doc');
      const isDocx = selectedFile.name.toLowerCase().endsWith('.docx');
      const isPdfOrImg = validMimeTypes.includes(selectedFile.type);

      if (isPdfOrImg || isDoc || isDocx) {
        setFile(selectedFile);
        // We don't clear cvText immediately because if it's a docx, we extract text on submit.
        // But visually we can clear it to avoid confusion.
        setCvText(''); 
      } else {
        setFileError("Please upload a PDF, Word Doc (DOC/DOCX), or Image file.");
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Start Your Analysis</h2>
        <p className="text-slate-400">Upload your CV (PDF/Word) and Job Description for HR-grade insights.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CV Input Section */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center"><FileText className="w-4 h-4 mr-2 text-blue-600" /> Upload CV or Paste Text</span>
            </label>
            
            {/* File Upload Area */}
            <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'}`}>
              {!file ? (
                <div className="text-center" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 cursor-pointer">Click to upload Resume</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOCX, JPG, PNG supported (Max 20MB)</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <FileType className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={clearFile} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </div>

            {fileError && (
               <p className="text-xs text-red-500 font-medium mt-1">{fileError}</p>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">Or paste text</span>
              </div>
            </div>

            <textarea
              value={cvText}
              onChange={(e) => { setCvText(e.target.value); if (e.target.value) clearFile(); }}
              placeholder="Paste resume text here if not uploading..."
              disabled={!!file}
              className={`w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm text-slate-700 placeholder-slate-400 transition-all ${file ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* JD Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <label className="block text-sm font-semibold text-slate-700 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                Target Job Description
              </label>
              <div className="flex items-center space-x-2">
                <Globe className="w-3 h-3 text-slate-400" />
                <select 
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="text-xs border-none bg-transparent text-slate-600 font-medium focus:ring-0 cursor-pointer"
                >
                  <option value="Bangladesh">Bangladesh (Local Market)</option>
                  <option value="Asia/South Asia">Asia / South Asia</option>
                  <option value="Global">Global Standard</option>
                  <option value="Tech">Tech / Startup</option>
                  <option value="Academic">Academic / CV</option>
                  <option value="Government">Government / NGO</option>
                </select>
              </div>
            </div>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the Job Description here for ATS keyword matching and gap analysis..."
              className="w-full h-[19rem] p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm text-slate-700 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
           <p className="text-xs text-slate-400 flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              Secure processing. Files are not stored.
            </p>
          <button
            type="submit"
            disabled={isLoading || (!cvText.trim() && !file)}
            className={`
              px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all transform active:scale-95 flex items-center
              ${isLoading || (!cvText.trim() && !file)
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Profile...
              </>
            ) : (
              <>
                Run Analysis <Search className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;