import React from 'react';
import { playSound } from '../utils/sound';

export const RetroButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}> = ({ onClick, children, variant = 'primary', disabled = false, className = "" }) => {
  const handleClick = () => {
    if (!disabled) {
      playSound('click');
      onClick();
    }
  };

  let style = "";
  if (variant === 'primary') {
    // Botones de acción grandes y suaves
    style = "w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-b from-pink-400 to-pink-600 shadow-[0_4px_0_#9d174d,0_6px_6px_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 active:border-t-2 border-pink-400/50 text-white font-bold text-xs md:text-sm tracking-wide";
  } else {
    // Botones de sistema (pill shape)
    style = "px-6 py-2 bg-slate-700 rounded-full shadow-[0_3px_0_#334155,0_4px_4px_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 text-[10px] text-slate-200 font-bold tracking-widest uppercase border border-slate-600";
  }

  return (
    <button 
      onClick={handleClick} 
      disabled={disabled} 
      className={`transition-all select-none flex items-center justify-center ${style} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:brightness-110'} ${className}`}
    >
      {children}
    </button>
  );
};

export const ScreenContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative w-full max-w-[500px] flex flex-col items-center mx-auto">
    
    {/* CARCASA PRINCIPAL (Cuerpo de la consola) */}
    <div className="w-full bg-[#fbcfe8] rounded-[3rem] p-4 md:p-6 shadow-[0_20px_40px_-10px_rgba(219,39,119,0.4),inset_0_-8px_0_rgba(0,0,0,0.05),inset_0_4px_12px_rgba(255,255,255,0.8)] border border-pink-200">
      
      {/* MARCO DE PANTALLA (Bezel gris) */}
      <div className="bg-[#f1f5f9] rounded-[2rem] p-4 md:p-6 shadow-inner border border-slate-200 relative">
        
        {/* LED INDICATOR */}
        <div className="absolute top-4 left-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_#f87171]"></div>
            <span className="text-[9px] text-slate-400 font-bold tracking-widest">POWER</span>
        </div>

        {/* PANTALLA LCD (Contenedor de juego) */}
        {/* Aspect-square en móvil para ganar altura, aspect-video en desktop si se prefiere, aquí usamos un min-height para asegurar espacio */}
        <div className="mt-4 bg-[#fff1f2] border-4 border-[#831843] rounded-xl w-full min-h-[350px] md:min-h-[400px] relative overflow-hidden shadow-[inset_0_0_20px_rgba(131,24,67,0.05)] flex flex-col">
           {children}
           
           {/* Scanlines muy sutiles */}
           <div className="absolute inset-0 pointer-events-none opacity-5" 
                style={{ backgroundImage: "linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)", backgroundSize: "100% 4px" }}>
           </div>
           {/* Glare (Brillo cristal) */}
           <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none skew-x-12 opacity-50"></div>
        </div>

        {/* BRANDING */}
        <div className="mt-3 text-center">
            <span className="text-slate-400/80 font-black italic text-sm tracking-widest drop-shadow-[1px_1px_0_white]">
                GAME<span className="text-pink-400">LOVE</span>
            </span>
        </div>
      </div>

      {/* CONTROLES (Decorativos y Funcionales) */}
      <div className="mt-6 px-4 pb-4">
        <div className="flex justify-between items-end relative">
            
            {/* D-PAD (Cruz direccional) */}
            <div className="w-28 h-28 relative flex items-center justify-center drop-shadow-md">
                <div className="w-8 h-24 bg-slate-700 rounded-lg absolute"></div>
                <div className="w-24 h-8 bg-slate-700 rounded-lg absolute"></div>
                <div className="w-8 h-8 bg-slate-600 rounded-full absolute shadow-inner"></div>
                {/* Flechitas decorativas */}
                <div className="absolute top-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-500/50"></div>
                <div className="absolute bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-500/50"></div>
                <div className="absolute left-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-slate-500/50"></div>
                <div className="absolute right-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-slate-500/50"></div>
            </div>

            {/* BOTONES START/SELECT */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                 <div className="flex flex-col items-center gap-1 -rotate-12">
                    <div className="w-12 h-3 bg-slate-600 rounded-full shadow-[0_2px_0_rgba(0,0,0,0.2)]"></div>
                    <span className="text-[8px] font-bold text-pink-700/50 tracking-wider">SELECT</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 -rotate-12">
                    <div className="w-12 h-3 bg-slate-600 rounded-full shadow-[0_2px_0_rgba(0,0,0,0.2)]"></div>
                    <span className="text-[8px] font-bold text-pink-700/50 tracking-wider">START</span>
                 </div>
            </div>

            {/* PARLANTE (Speaker holes) */}
            <div className="absolute bottom-2 right-4 flex gap-1.5 -rotate-[20deg] opacity-30">
                {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-10 bg-black rounded-full shadow-inner"></div>)}
            </div>
        </div>
      </div>

    </div>
  </div>
);

export const Heart: React.FC<{ filled?: boolean; className?: string }> = ({ filled = true, className = "" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth={filled ? "0" : "2.5"} 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);