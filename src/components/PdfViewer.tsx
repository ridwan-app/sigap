import { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText
} from 'lucide-react';

interface PdfViewerProps {
  pdfUrl?: string;
  fileName?: string;
  subjectTitle: string;
}

export function PdfViewer({
  pdfUrl,
  subjectTitle
}: PdfViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoomLevel(100);

  if (!pdfUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-[#161a22]">
        <FileText className="w-12 h-12 text-slate-600 mb-2" />
        <p className="text-xs text-slate-400">Naskah soal belum tersedia.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#12151c] text-white select-none">
      {/* Bar Kontrol Minimalis & Bersih */}
      <div className="h-10 bg-[#1a1f29] border-b border-white/10 px-3 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-slate-200 truncate">
          {subjectTitle}
        </span>

        {/* Kontrol Zoom Saja */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            title="Perkecil"
            className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span 
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="text-[11px] font-mono font-bold text-emerald-400 px-2 py-0.5 bg-[#12151c] rounded cursor-pointer border border-white/10 min-w-[42px] text-center"
          >
            {zoomLevel}%
          </span>

          <button
            onClick={handleZoomIn}
            title="Perbesar"
            className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            title="Reset"
            className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 hover:text-white rounded-lg transition-colors ml-0.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Tampilan Dokumen Soal PDF - Bersih Tanpa Banner Tambahan */}
      <div className="flex-1 w-full h-full relative overflow-auto bg-[#2b303c] flex items-center justify-center p-0.5">
        <div 
          className="w-full h-full transition-transform duration-150 origin-top flex items-center justify-center"
          style={{
            transform: zoomLevel === 100 ? 'none' : `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            width: zoomLevel > 100 ? `${zoomLevel}%` : '100%',
            height: zoomLevel > 100 ? `${zoomLevel}%` : '100%'
          }}
        >
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            title={`Naskah Soal - ${subjectTitle}`}
            className="w-full h-full bg-white border-0"
          />
        </div>
      </div>
    </div>
  );
}
