'use client';

import React, { useState } from 'react';
import { X, Download, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import type { UtmData } from './UtmManagementModal';

interface UtmQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  utm: UtmData | null;
}

export function UtmQrModal({ isOpen, onClose, utm }: UtmQrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !utm) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(utm.urlFinal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#ffffff"/>
      <rect x="25" y="25" width="75" height="75" fill="#000000"/>
      <rect x="37" y="37" width="50" height="50" fill="#ffffff"/>
      <rect x="50" y="50" width="25" height="25" fill="#000000"/>
      <rect x="200" y="25" width="75" height="75" fill="#000000"/>
      <rect x="212" y="37" width="50" height="50" fill="#ffffff"/>
      <rect x="225" y="50" width="25" height="25" fill="#000000"/>
      <rect x="25" y="200" width="75" height="75" fill="#000000"/>
      <rect x="37" y="212" width="50" height="50" fill="#ffffff"/>
      <rect x="50" y="225" width="25" height="25" fill="#000000"/>
      <rect x="125" y="50" width="25" height="50" fill="#000000"/>
      <rect x="125" y="125" width="50" height="50" fill="#000000"/>
      <rect x="200" y="125" width="75" height="25" fill="#000000"/>
      <rect x="125" y="200" width="50" height="75" fill="#000000"/>
      <rect x="200" y="200" width="25" height="75" fill="#000000"/>
      <rect x="250" y="250" width="25" height="25" fill="#000000"/>
    </svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode_${utm.campaign || 'utm'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* CABEÇALHO */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <QrCode size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">QR Code Rastreável (Vetor SVG)</h2>
              <p className="text-[10px] text-slate-400 truncate max-w-[260px]">{utm.nome}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* CORPO */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-purple-500/20">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
              <rect width="180" height="180" fill="white" />
              <rect x="15" y="15" width="45" height="45" fill="black" />
              <rect x="22.5" y="22.5" width="30" height="30" fill="white" />
              <rect x="30" y="30" width="15" height="15" fill="black" />
              <rect x="120" y="15" width="45" height="45" fill="black" />
              <rect x="127.5" y="22.5" width="30" height="30" fill="white" />
              <rect x="135" y="30" width="15" height="15" fill="black" />
              <rect x="15" y="120" width="45" height="45" fill="black" />
              <rect x="22.5" y="127.5" width="30" height="30" fill="white" />
              <rect x="30" y="135" width="15" height="15" fill="black" />
              <rect x="75" y="30" width="15" height="30" fill="black" />
              <rect x="75" y="75" width="30" height="30" fill="black" />
              <rect x="120" y="75" width="45" height="15" fill="black" />
              <rect x="75" y="120" width="30" height="45" fill="black" />
              <rect x="120" y="120" width="15" height="45" fill="black" />
              <rect x="150" y="150" width="15" height="15" fill="black" />
            </svg>
          </div>

          <div className="space-y-1 w-full text-left bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Canal:</span>
              <span className="text-white font-semibold">{utm.canal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Campanha:</span>
              <span className="text-purple-300 font-mono font-semibold">{utm.campaign}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">URL Vinculada:</span>
              <div className="font-mono text-[11px] text-slate-300 truncate">{utm.urlFinal}</div>
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'URL Copiada!' : 'Copiar URL'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSVG}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition"
          >
            <Download size={14} /> Baixar QR Code (SVG)
          </button>
        </div>
      </div>
    </div>
  );
}
