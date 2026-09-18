// Screen Wake Lock API wrapper to prevent screen from sleeping during exams

interface WakeLockSentinelLike {
  release: () => Promise<void>;
  addEventListener: (type: string, listener: () => void) => void;
}

let wakeLockSentinel: WakeLockSentinelLike | null = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if ('wakeLock' in navigator) {
    try {
      const navWithWakeLock = navigator as unknown as {
        wakeLock: {
          request: (type: 'screen') => Promise<WakeLockSentinelLike>;
        };
      };
      wakeLockSentinel = await navWithWakeLock.wakeLock.request('screen');
      
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Wake Lock request failed or was dismissed:', err);
      return false;
    }
  }
  return false;
}

export async function releaseScreenWakeLock(): Promise<void> {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    } catch (err) {
      console.warn('Error releasing wake lock:', err);
    }
  }
}

export function isWakeLockActive(): boolean {
  return wakeLockSentinel !== null;
}
