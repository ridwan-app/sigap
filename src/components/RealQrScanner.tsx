import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertCircle, RefreshCw, X } from 'lucide-react';

interface RealQrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function RealQrScanner({ onScanSuccess, onClose }: RealQrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const regionId = 'real-qr-scanner-region';

    const startScanner = async () => {
      try {
        setIsInitializing(true);
        setErrorMsg('');

        // Pastikan element container ada
        const element = document.getElementById(regionId);
        if (!element) return;

        const scanner = new Html5Qrcode(regionId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isMounted) return;
            // Stop scanning once detected
            if (isRunningRef.current && scannerRef.current) {
              isRunningRef.current = false;
              scannerRef.current
                .stop()
                .then(() => {
                  onScanSuccess(decodedText);
                })
                .catch(() => {
                  onScanSuccess(decodedText);
                });
            } else {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Ignore scan frame failures
          }
        );

        isRunningRef.current = true;
        if (isMounted) setIsInitializing(false);
      } catch (err: any) {
        if (!isMounted) return;
        setIsInitializing(false);
        const message = err?.message || String(err);
        if (message.includes('NotAllowedError') || message.includes('Permission')) {
          setErrorMsg('Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda.');
        } else if (message.includes('NotFoundError') || message.includes('DevicesNotFoundError')) {
          setErrorMsg('Kamera tidak ditemukan pada perangkat ini.');
        } else {
          setErrorMsg('Tidak dapat membuka kamera. Pastikan izin kamera aktif.');
        }
      }
    };

    // Timeout kecil agar DOM div sudah ter-render sempurna
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current && isRunningRef.current) {
        isRunningRef.current = false;
        scannerRef.current.stop().catch(() => {}).finally(() => {
          try {
            scannerRef.current?.clear();
          } catch {}
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center min-h-[260px]">
      <div id="real-qr-scanner-region" className="w-full h-full min-h-[240px]" />

      {isInitializing && (
        <div className="absolute inset-0 bg-[#181b22]/90 flex flex-col items-center justify-center text-purple-300 text-xs gap-2 p-4 text-center">
          <RefreshCw className="w-7 h-7 animate-spin text-purple-400" />
          <span>Menyalakan kamera perangkat...</span>
        </div>
      )}

      {errorMsg && (
        <div className="absolute inset-0 bg-[#181b22]/95 flex flex-col items-center justify-center text-rose-300 text-xs gap-2.5 p-5 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
          <p className="font-semibold">{errorMsg}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
          >
            Tutup Scanner
          </button>
        </div>
      )}
    </div>
  );
}
