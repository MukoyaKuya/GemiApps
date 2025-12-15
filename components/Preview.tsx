import React from 'react';
import { X, FileText, Table as TableIcon, Type } from 'lucide-react';
import { ConversionResponse, ContentType } from '../types';

interface PreviewProps {
  imageSrc: string;
  fileType?: string;
  onClear: () => void;
  extractedData: ConversionResponse | null;
}

export const Preview: React.FC<PreviewProps> = ({ imageSrc, fileType, onClear, extractedData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 w-full max-w-6xl mx-auto">
      {/* Original Image/PDF */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Original Document</h3>
          <button 
            onClick={onClear}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <X className="w-4 h-4" /> Remove
          </button>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white min-h-[400px]">
          {fileType === 'application/pdf' ? (
            <iframe 
              src={imageSrc} 
              className="w-full h-[600px] bg-slate-100" 
              title="PDF Preview"
            />
          ) : (
            <img 
              src={imageSrc} 
              alt="Preview" 
              className="w-full h-auto object-contain max-h-[600px]"
            />
          )}
        </div>
      </div>

      {/* Extracted Structure Preview */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center h-8">
          <h3 className="font-semibold text-slate-700">Detected Structure</h3>
          {extractedData && (
             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
               Analysis Complete
             </span>
          )}
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full max-h-[600px] overflow-y-auto p-6 space-y-4">
          {!extractedData ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <p>Structure preview will appear here after analysis.</p>
            </div>
          ) : (
            extractedData.elements.map((el, idx) => (
              <div key={idx} className="group relative border-l-2 border-slate-100 pl-4 hover:border-indigo-400 transition-colors">
                {el.type === ContentType.HEADING && (
                  <div className="flex items-start gap-3">
                    <Type className="w-4 h-4 text-indigo-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1">
                        Heading {el.level} • {el.align}
                      </p>
                      <p className={`text-slate-800 ${el.level === 1 ? 'text-xl font-bold' : 'text-lg font-semibold'}`}>
                        {el.text}
                      </p>
                    </div>
                  </div>
                )}
                
                {el.type === ContentType.PARAGRAPH && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <div>
                       <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                        Paragraph • {el.align}
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {el.text}
                      </p>
                    </div>
                  </div>
                )}

                {el.type === ContentType.TABLE && (
                  <div className="flex items-start gap-3">
                    <TableIcon className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                    <div className="w-full">
                       <p className="text-xs font-bold text-emerald-500 uppercase tracking-wide mb-2">
                        Table detected
                      </p>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <tbody className="divide-y divide-slate-200">
                            {el.rows?.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx === 0 ? "bg-slate-50" : "bg-white"}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3 py-2 text-slate-600 border-r last:border-r-0 border-slate-200 whitespace-nowrap">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};