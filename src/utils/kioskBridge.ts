// Utility bridge untuk berkomunikasi dengan Android Native APK (SIGAP Exambro)
// dan mengontrol sensor keamanan ujian anti-curang.

declare global {
  interface Window {
    SigapExambro?: {
      startLockTask?: () => void;
      stopLockTask?: () => void;
      setScreenshotAllowed?: (allowed: boolean) => void;
      isExambroApp?: () => boolean;
      exitApp?: () => void;
    };
    Android?: {
      lockExam?: (locked: boolean) => void;
      preventScreenshot?: (prevent: boolean) => void;
      isKioskMode?: () => boolean;
    };
    webkit?: {
      messageHandlers?: {
        sigapKiosk?: {
          postMessage: (message: any) => void;
        };
      };
    };
  }
}

/**
 * Memeriksa apakah aplikasi sedang dibuka di dalam APK SIGAP Exambro Native
 */
export function isRunningInNativeExambro(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.SigapExambro?.isExambroApp?.() ||
    window.Android?.isKioskMode?.() ||
    navigator.userAgent.includes('SIGAP_EXAMBRO') ||
    navigator.userAgent.includes('Exambrowser')
  );
}

/**
 * Mengirim sinyal kunci ke APK Android (Menonaktifkan Tombol Home, Back, Recent Apps & Screenshot)
 */
export function sendLockSignalToNative(locked: boolean) {
  try {
    if (typeof window === 'undefined') return;

    if (locked) {
      // 1. Android SigapExambro Interface
      if (window.SigapExambro?.startLockTask) {
        window.SigapExambro.startLockTask();
      }
      if (window.SigapExambro?.setScreenshotAllowed) {
        window.SigapExambro.setScreenshotAllowed(false);
      }

      // 2. Android Standard Bridge Interface
      if (window.Android?.lockExam) {
        window.Android.lockExam(true);
      }
      if (window.Android?.preventScreenshot) {
        window.Android.preventScreenshot(true);
      }

      // 3. WebKit iOS / WebView Bridge
      if (window.webkit?.messageHandlers?.sigapKiosk) {
        window.webkit.messageHandlers.sigapKiosk.postMessage({ action: 'LOCK_EXAM' });
      }

      // 4. Window PostMessage (untuk iframe / wrapper)
      window.postMessage({ type: 'SIGAP_KIOSK_COMMAND', action: 'LOCK_TASK', payload: true }, '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SIGAP_KIOSK_COMMAND', action: 'LOCK_TASK', payload: true }, '*');
      }
    } else {
      // Buka kunci kembali ke mode normal
      if (window.SigapExambro?.stopLockTask) {
        window.SigapExambro.stopLockTask();
      }
      if (window.SigapExambro?.setScreenshotAllowed) {
        window.SigapExambro.setScreenshotAllowed(true);
      }

      if (window.Android?.lockExam) {
        window.Android.lockExam(false);
      }
      if (window.Android?.preventScreenshot) {
        window.Android.preventScreenshot(false);
      }

      if (window.webkit?.messageHandlers?.sigapKiosk) {
        window.webkit.messageHandlers.sigapKiosk.postMessage({ action: 'UNLOCK_EXAM' });
      }

      window.postMessage({ type: 'SIGAP_KIOSK_COMMAND', action: 'UNLOCK_TASK', payload: false }, '*');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'SIGAP_KIOSK_COMMAND', action: 'UNLOCK_TASK', payload: false }, '*');
      }
    }
  } catch (err) {
    console.warn('Gagal mengirim sinyal ke jembatan native:', err);
  }
}

/**
 * Membunyikan suara alarm peringatan ringkas saat terdeteksi pelanggaran (menggunakan Web Audio API sintetis)
 */
export function playViolationAlarm() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Abaikan jika browser membatasi autoplay audio
  }
}
