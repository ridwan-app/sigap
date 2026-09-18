import { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText,
  ExternalLink,
  Download,
  FileCode,
  Globe
} from 'lucide-react';

interface UniversalDocumentViewerProps {
  dataUrl?: string;
  fileName?: string;
  fileType?: string;
  subjectTitle: string;
  isLink?: boolean;
}

export function UniversalDocumentViewer({
  dataUrl,
  fileName = '',
  fileType = '',
  subjectTitle,
  isLink = false
}: UniversalDocumentViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoomLevel(100);

  if (!dataUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-[#161a22]">
        <FileText className="w-12 h-12 text-slate-600 mb-2" />
        <p className="text-xs text-slate-400">Berkas / materi belum tersedia.</p>
      </div>
    );
  }

  const isPdf = 
    fileType.includes('pdf') || 
    fileName.toLowerCase().endsWith('.pdf') || 
    dataUrl.startsWith('data:application/pdf');

  const isImage = 
    fileType.startsWith('image/') || 
    dataUrl.startsWith('data:image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

  const isVideo = 
    fileType.startsWith('video/') || 
    dataUrl.startsWith('data:video/') ||
    /\.(mp4|webm|ogg)$/i.test(fileName);

  const isAudio = 
    fileType.startsWith('audio/') || 
    dataUrl.startsWith('data:audio/') ||
    /\.(mp3|wav|ogg|m4a)$/i.test(fileName);

  // Jika berupa Tautan Web (YouTube, Canva, Website Materi, dll)
  if (isLink || dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    // Normalisasi jika link youtube untuk embed
    let embedUrl = dataUrl;
    if (dataUrl.includes('youtube.com/watch?v=')) {
      embedUrl = dataUrl.replace('watch?v=', 'embed/');
    } else if (dataUrl.includes('youtu.be/')) {
      embedUrl = dataUrl.replace('youtu.be/', 'youtube.com/embed/');
    }

    return (
      <div className="w-full h-full flex flex-col bg-[#12151c] text-white select-none">
        <div className="h-10 bg-[#1a1f29] border-b border-white/10 px-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-200 truncate">
              {subjectTitle}
            </span>
          </div>
          <a
            href={dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Buka Tab Baru</span>
          </a>
        </div>
        <div className="flex-1 w-full h-full relative bg-[#181b22]">
          <iframe
            src={embedUrl}
            title={subjectTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          />
        </div>
      </div>
    );
  }

  // Jika berupa file Gambar
  if (isImage) {
    return (
      <div className="w-full h-full flex flex-col bg-[#12151c] text-white select-none">
        <div className="h-10 bg-[#1a1f29] border-b border-white/10 px-3 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-200 truncate">{subjectTitle} ({fileName || 'Gambar'})</span>
          <div className="flex items-center gap-1.5">
            <button onClick={handleZoomOut} title="Perkecil" className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 rounded-lg"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span onClick={handleResetZoom} className="text-[11px] font-mono font-bold text-emerald-400 px-2 py-0.5 bg-[#12151c] rounded cursor-pointer border border-white/10">{zoomLevel}%</span>
            <button onClick={handleZoomIn} title="Perbesar" className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 rounded-lg"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button onClick={handleResetZoom} title="Reset" className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 rounded-lg"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="flex-1 w-full h-full overflow-auto bg-[#1a1e26] flex items-center justify-center p-4">
          <img 
            src={dataUrl} 
            alt={subjectTitle}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg transition-transform duration-100"
          />
        </div>
      </div>
    );
  }

  // Jika berupa file Video
  if (isVideo) {
    return (
      <div className="w-full h-full flex flex-col bg-[#12151c] text-white select-none">
        <div className="h-10 bg-[#1a1f29] border-b border-white/10 px-3 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-200 truncate">{subjectTitle} ({fileName || 'Video'})</span>
        </div>
        <div className="flex-1 w-full h-full bg-black flex items-center justify-center p-2">
          <video 
            src={dataUrl} 
            controls 
            controlsList="nodownload"
            className="max-w-full max-h-full rounded-lg shadow-xl"
          >
            Browser Anda tidak mendukung pemutaran video ini.
          </video>
        </div>
      </div>
    );
  }

  // Jika berupa file Audio
  if (isAudio) {
    return (
      <div className="w-full h-full flex flex-col bg-[#12151c] text-white select-none">
        <div className="h-10 bg-[#1a1f29] border-b border-white/10 px-3 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-200 truncate">{subjectTitle} ({fileName || 'Audio'})</span>
        </div>
        <div className="flex-1 w-full h-full bg-[#181b22] flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
            <FileCode className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-white">{subjectTitle}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{fileName}</p>
          </div>
          <audio src={dataUrl} controls className="w-full max-w-md" />
        </div>
      </div>
    );
  }

  // Jika dokumen PDF
  if (isPdf) {
    return (
      <div className="w-full h-full flex flex-col bg-[#12151c] text-white select-none">
        <div className="h-10 bg-[#1a1f29] border-b border-white/10 px-3 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold text-slate-200 truncate">{subjectTitle}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={handleZoomOut} title="Perkecil" className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 hover:text-white rounded-lg transition-colors"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span onClick={handleResetZoom} title="Reset Zoom" className="text-[11px] font-mono font-bold text-emerald-400 px-2 py-0.5 bg-[#12151c] rounded cursor-pointer border border-white/10 min-w-[42px] text-center">{zoomLevel}%</span>
            <button onClick={handleZoomIn} title="Perbesar" className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 hover:text-white rounded-lg transition-colors"><ZoomIn className="w-3.5 h-3.5" /></button>
            <button onClick={handleResetZoom} title="Reset" className="p-1.5 bg-[#252b38] hover:bg-[#303848] text-slate-300 hover:text-white rounded-lg transition-colors ml-0.5"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>
        </div>
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
              src={`${dataUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              title={`Dokumen - ${subjectTitle}`}
              className="w-full h-full bg-white border-0"
            />
          </div>
        </div>
      </div>
    );
  }

  // Format Office / File Lainnya (Word .docx, PowerPoint .pptx, Excel .xlsx, Text .txt, dll)
  return (
    <div className="w-full h-full flex flex-col bg-[#12151c] text-white select-none">
      <div className="h-10 bg-[#1a1f29] border-b border-white/10 px-3 flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold text-slate-200 truncate">{subjectTitle}</span>
      </div>
      <div className="flex-1 w-full h-full bg-[#181b22] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center shadow-lg border border-blue-500/30">
          <FileText className="w-8 h-8" />
        </div>
        <div className="max-w-md">
          <h4 className="text-sm font-bold text-white">{subjectTitle}</h4>
          <p className="text-xs text-slate-400 mt-1">{fileName || 'Berkas Dokumen Pembelajaran'}</p>
          <p className="text-[11px] text-slate-400 mt-2 bg-[#222731] p-3 rounded-xl border border-white/5">
            File materi ini ({fileName ? fileName.split('.').pop()?.toUpperCase() : 'Dokumen'}) dapat dibuka atau diunduh oleh siswa untuk dipelajari.
          </p>
        </div>
        <a
          href={dataUrl}
          download={fileName || `${subjectTitle}.bin`}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Unduh / Buka Dokumen ({fileName || 'File'})</span>
        </a>
      </div>
    </div>
  );
}
