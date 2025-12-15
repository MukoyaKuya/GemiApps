import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Preview } from './components/Preview';
import { analyzeDocument } from './services/geminiService';
import { generateDocx } from './services/docxService';
import { ProcessingState, ConversionResponse } from './types';
import { FileText, Loader2, Download, AlertCircle, Wand2 } from 'lucide-react';

export default function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({ status: 'idle' });
  const [extractedData, setExtractedData] = useState<ConversionResponse | null>(null);

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setProcessingState({ status: 'idle' });
      setExtractedData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setImageFile(null);
    setImagePreview(null);
    setExtractedData(null);
    setProcessingState({ status: 'idle' });
  };

  const handleAnalyze = async () => {
    if (!imagePreview || !imageFile) return;

    try {
      setProcessingState({ status: 'analyzing', message: 'Gemini is reading your document...' });
      
      const base64Data = imagePreview.split(',')[1];
      const data = await analyzeDocument(base64Data, imageFile.type);
      
      setExtractedData(data);
      setProcessingState({ status: 'complete', message: 'Analysis complete!' });
    } catch (error) {
      console.error(error);
      setProcessingState({ 
        status: 'error', 
        message: 'Failed to analyze document. Please ensure the file is valid and try again.' 
      });
    }
  };

  const handleDownload = async () => {
    if (!extractedData) return;
    try {
      setProcessingState({ status: 'generating', message: 'Creating Word document...' });
      await generateDocx(extractedData);
      setProcessingState({ status: 'complete', message: 'Download started!' });
    } catch (error) {
       setProcessingState({ 
        status: 'error', 
        message: 'Failed to generate DOCX file.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">ScanToDocx</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
             <span>Powered by Gemini 2.5</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Convert Scanned Documents to <span className="text-indigo-600">Word</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload a photo or scan of a document. Our AI will transcribe text, recreate tables, and preserve formatting into an editable .docx file.
          </p>
        </div>

        {/* Upload Section */}
        {!imagePreview && (
          <div className="max-w-xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* Error Message */}
        {processingState.status === 'error' && (
          <div className="max-w-xl mx-auto mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{processingState.message}</p>
          </div>
        )}

        {/* Main Content Area */}
        {imagePreview && (
          <div className="flex flex-col items-center">
             {/* Controls */}
             <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200/50 flex gap-4 mt-6 items-center">
                {processingState.status === 'analyzing' || processingState.status === 'generating' ? (
                  <div className="flex items-center gap-3 px-6 py-2">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span className="font-medium text-slate-700">{processingState.message}</span>
                  </div>
                ) : (
                  <>
                    {!extractedData ? (
                      <button
                        onClick={handleAnalyze}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
                      >
                        <Wand2 className="w-4 h-4" />
                        Analyze Document
                      </button>
                    ) : (
                      <button
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        Download .docx
                      </button>
                    )}
                  </>
                )}
             </div>

            <Preview 
              imageSrc={imagePreview}
              fileType={imageFile?.type}
              onClear={handleClear} 
              extractedData={extractedData} 
            />
          </div>
        )}
      </main>
    </div>
  );
}