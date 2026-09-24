'use client';
import React from 'react';
import { EDDIE_BUILD } from '@/lib/buildInfo';
export function BuildBadge(){return <div className="fixed bottom-2 right-3 z-[100] rounded-md border border-sky-500/20 bg-[#07111f]/90 px-2 py-1 text-[10px] font-mono text-sky-300 shadow-lg backdrop-blur" title={`Identificador do código publicado: ${EDDIE_BUILD.marker} (${EDDIE_BUILD.version})`}>EDDIE {EDDIE_BUILD.uiVersion} · Event OS</div>}
