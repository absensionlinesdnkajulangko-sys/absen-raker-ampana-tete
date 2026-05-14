import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { MousePointer2, RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    onClear();
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) return;
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          tempat untuk tanda tangan (wajib di isi)
        </label>
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
        >
          <RotateCcw size={12} />
          Bersihkan
        </button>
      </div>
      <div className="relative rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden group">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "w-full h-40 cursor-crosshair",
          }}
          onEnd={save}
        />
        <div className="absolute bottom-2 right-2 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
          <MousePointer2 size={24} />
        </div>
      </div>
    </div>
  );
};
