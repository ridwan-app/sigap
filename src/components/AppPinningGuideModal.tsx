import { useState } from 'react';
import { Smartphone, CheckCircle, ShieldAlert, X, ChevronRight } from 'lucide-react';

interface AppPinningGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppPinningGuideModal({ isOpen, onClose }: AppPinningGuideModalProps) {
  const [selectedBrand, setSelectedBrand] = useState<'umum' | 'samsung' | 'xiaomi' | 'oppo_realme' | 'vivo'>('umum');

  if (!isOpen) return null;

  return (
    <div id="pinning-guide-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Panduan Sematkan Aplikasi (HP Android)</h3>
              <p className="text-xs text-slate-400">Kunci tombol Home & notifikasi selama ujian</p>
            </div>
          </div>
          <button
            id="close-pinning-guide"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Selector */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            id="guide-tab-umum"
            onClick={() => setSelectedBrand('umum')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedBrand === 'umum' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Umum / Standar
          </button>
          <button
            id="guide-tab-samsung"
            onClick={() => setSelectedBrand('samsung')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedBrand === 'samsung' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Samsung
          </button>
          <button
            id="guide-tab-xiaomi"
            onClick={() => setSelectedBrand('xiaomi')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedBrand === 'xiaomi' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Xiaomi / Redmi
          </button>
          <button
            id="guide-tab-oppo"
            onClick={() => setSelectedBrand('oppo_realme')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedBrand === 'oppo_realme' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Oppo / Realme
          </button>
          <button
            id="guide-tab-vivo"
            onClick={() => setSelectedBrand('vivo')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedBrand === 'vivo' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vivo / Lainnya
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Catatan:</strong> Fitur ini adalah fitur gratis bawaan Android. Siswa tidak perlu mengunduh aplikasi apa pun dari luar.
            </p>
          </div>

          {selectedBrand === 'umum' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-600" /> Cara Umum di Semua HP Android:
              </h4>
              <ol className="list-decimal list-inside space-y-2.5 pl-1 text-slate-600">
                <li className="leading-relaxed">
                  Buka <strong>Pengaturan / Setelan (Settings)</strong> HP &rarr; pilih <strong>Keamanan (Security)</strong> &rarr; cari <strong>Sematkan Aplikasi (App Pinning / Pin Windows)</strong> lalu aktifkan (ON).
                </li>
                <li className="leading-relaxed">
                  Buka browser <strong>Google Chrome</strong> di halaman ujian ini.
                </li>
                <li className="leading-relaxed">
                  Buka menu <strong>Recent Apps</strong> (tombol kotak ||| di bawah atau geser dari bawah tahan).
                </li>
                <li className="leading-relaxed">
                  Ketuk <strong>ikon Chrome</strong> atau ikon titik tiga di atas jendela Chrome &rarr; pilih <strong>"Sematkan" (Pin)</strong>.
                </li>
                <li className="leading-relaxed">
                  Layar HP kini terkunci di halaman ujian. Tombol Home dan notifikasi tidak akan bisa dibuka.
                </li>
              </ol>
            </div>
          )}

          {selectedBrand === 'samsung' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-600" /> Panduan Khusus Samsung (One UI):
              </h4>
              <ol className="list-decimal list-inside space-y-2.5 pl-1 text-slate-600">
                <li>Buka <strong>Pengaturan</strong> &rarr; <strong>Keamanan dan Privasi</strong> &rarr; <strong>Pengaturan keamanan lainnya</strong>.</li>
                <li>Aktifkan <strong>Sematkan Aplikasi (Pin App)</strong>.</li>
                <li>Buka browser ujian di Chrome. Buka tombol <strong>Recent Apps (tiga garis)</strong>.</li>
                <li>Ketuk <strong>ikon bulat Chrome</strong> tepat di atas jendela pratinjau.</li>
                <li>Pilih menu <strong>Sematkan aplikasi ini (Pin this app)</strong>. Selesai!</li>
              </ol>
            </div>
          )}

          {selectedBrand === 'xiaomi' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-600" /> Panduan Khusus Xiaomi / Redmi (MIUI / HyperOS):
              </h4>
              <ol className="list-decimal list-inside space-y-2.5 pl-1 text-slate-600">
                <li>Buka <strong>Setelan</strong> &rarr; <strong>Sandi & Keamanan</strong> &rarr; <strong>Privasi</strong>.</li>
                <li>Aktifkan <strong>Penyematan Layar (Screen Pinning)</strong>.</li>
                <li>Buka menu <strong>Recent Apps</strong>, tekan dan tahan jendela Chrome, lalu ketuk <strong>ikon Jarum Pentul / Pin</strong>.</li>
              </ol>
            </div>
          )}

          {selectedBrand === 'oppo_realme' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-600" /> Panduan Oppo / Realme (ColorOS / Realme UI):
              </h4>
              <ol className="list-decimal list-inside space-y-2.5 pl-1 text-slate-600">
                <li>Buka <strong>Pengaturan</strong> &rarr; <strong>Keamanan</strong> &rarr; <strong>Sematkan Layar</strong> (aktifkan).</li>
                <li>Buka Chrome halaman ujian &rarr; Buka <strong>Recent Apps</strong>.</li>
                <li>Ketuk <strong>titik dua (⋮)</strong> di pojok atas jendela Chrome &rarr; pilih <strong>Sematkan</strong>.</li>
              </ol>
            </div>
          )}

          {selectedBrand === 'vivo' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-600" /> Panduan Vivo / Lainnya (Funtouch OS):
              </h4>
              <ol className="list-decimal list-inside space-y-2.5 pl-1 text-slate-600">
                <li>Buka <strong>Pengaturan</strong> &rarr; <strong>Keamanan</strong> &rarr; <strong>Penyematan Layar</strong> (aktifkan).</li>
                <li>Buka Chrome halaman ujian &rarr; Buka <strong>Recent Apps</strong> &rarr; ketuk ikon jarum sematan di atas jendela Chrome.</li>
              </ol>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
            <p className="font-medium text-slate-900">Cara Melepas Sematan Setelah Ujian Selesai:</p>
            <p>Tekan dan tahan tombol <strong>Kembali (Back)</strong> dan tombol <strong>Recent Apps</strong> secara bersamaan selama 2 detik.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            id="understood-pinning-guide"
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
