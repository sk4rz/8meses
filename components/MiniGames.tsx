import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSound } from '../utils/sound';
import { Heart } from './RetroUI';

const GB_BG = '#fff1f2'; 
const GB_ACCENT = '#be185d'; 
const GB_TEXT = '#881337'; 

// --- Nivel 1: Catch (Lluvia de Amor) ---
export const GameCatch: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const paddleX = useRef(50);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let hearts: { x: number; y: number; speed: number }[] = [];
    let frame = 0;
    
    // Clamping mejorado para evitar cortes en bordes (10% a 90%)
    const setPaddleX = (val: number) => {
      paddleX.current = Math.max(10, Math.min(90, val));
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if(e.cancelable) e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      let x = clientX - rect.left;
      let pct = (x / rect.width) * 100;
      setPaddleX(pct);
    };

    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };

    canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = () => {
      frame++;

      if (keysPressed.current['ArrowLeft']) setPaddleX(paddleX.current - 2);
      if (keysPressed.current['ArrowRight']) setPaddleX(paddleX.current + 2);

      if (frame % 50 === 0) {
        hearts.push({ x: Math.random() * 80 + 10, y: -10, speed: 0.5 + Math.random() * 0.4 });
      }

      hearts.forEach(h => h.y += h.speed);

      // Hitbox ajustada
      hearts.forEach((h, i) => {
        if (h.y > 82 && h.y < 95 && Math.abs(h.x - paddleX.current) < 15) { 
          hearts.splice(i, 1);
          playSound('collect');
          setScore(s => {
            const newScore = s + 1;
            if (newScore >= 10) onComplete();
            return newScore;
          });
        }
      });
      hearts = hearts.filter(h => h.y < 105);

      // --- DIBUJO ---
      ctx.fillStyle = GB_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;

      // Jugador (Canasta) 
      const px = (paddleX.current / 100) * W;
      const py = H * 0.85;
      
      // Base (Rect estándar para compatibilidad)
      ctx.fillStyle = GB_TEXT;
      ctx.beginPath();
      ctx.rect(px - 25, py, 50, 25);
      ctx.fill();
      
      // Interior
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.rect(px - 20, py + 3, 40, 10);
      ctx.fill();

      // Corazones
      hearts.forEach(h => {
        const hx = (h.x / 100) * W;
        const hy = (h.y / 100) * H;
        
        ctx.fillStyle = GB_ACCENT;
        ctx.beginPath();
        const size = 6;
        ctx.moveTo(hx, hy + size);
        ctx.bezierCurveTo(hx - size, hy, hx - size*1.5, hy - size*0.5, hx, hy - size);
        ctx.bezierCurveTo(hx + size*1.5, hy - size*0.5, hx + size, hy, hx, hy + size);
        ctx.fill();
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      <div className="absolute top-2 left-0 w-full text-center pointer-events-none z-10">
        <span className="bg-white/80 px-3 py-1 rounded-full text-[#831843] font-bold text-sm shadow-sm border border-pink-200">
          SCORE: {score}/10
        </span>
      </div>
      <canvas ref={canvasRef} width={300} height={400} className="w-full h-full block touch-none" />
    </div>
  );
};

// --- Nivel 2: Memory ---
export const GameMemory: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const icons = ['💗', '💌', '🎁', '🌹']; 
  const [cards, setCards] = useState<{ id: number; icon: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);

  useEffect(() => {
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({ id, icon, flipped: false, matched: false }));
    setCards(deck);
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedIds.length === 2 || cards.find(c => c.id === id)?.matched || flippedIds.includes(id)) return;
    
    playSound('click');
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const card1 = cards.find(c => c.id === first);
      const card2 = cards.find(c => c.id === id);

      if (card1?.icon === card2?.icon) {
        playSound('powerup');
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
          setFlippedIds([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlippedIds([]);
        }, 1000); 
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setTimeout(onComplete, 800);
    }
  }, [cards, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="grid grid-cols-4 gap-3 md:gap-4 w-full max-w-xs">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-lg flex items-center justify-center text-2xl md:text-3xl transition-all duration-300 shadow-sm ${
              card.flipped || card.matched 
                ? 'bg-white border-2 border-pink-400 rotate-y-180' 
                : 'bg-pink-500 border-2 border-pink-700 text-transparent'
            }`}
          >
            {(card.flipped || card.matched) ? card.icon : ''}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Nivel 3: Mash ---
export const GameMash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => Math.max(0, p - 0.5)); 
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    playSound('click');
    setScale(1.2);
    setTimeout(() => setScale(1), 100);
    setProgress(p => {
      const newP = p + 7;
      if (newP >= 100) {
        onComplete();
        return 100;
      }
      return newP;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8 select-none">
      <h3 className="text-[#881337] font-bold text-sm animate-pulse">¡LLENA EL CORAZÓN!</h3>
      
      <div className="relative w-40 h-40 transition-transform duration-150" style={{ transform: `scale(${scale})` }}>
         <Heart className="w-full h-full text-gray-200 absolute inset-0" />
         <div 
            className="absolute bottom-0 left-0 w-full overflow-hidden flex items-end justify-center transition-all duration-75"
            style={{ height: `${progress}%`, filter: 'drop-shadow(0 0 10px rgba(236,72,153,0.5))' }}
         >
             <Heart className="w-40 h-40 text-pink-500" /> 
         </div>
      </div>
      
      <button 
        onMouseDown={handleClick}
        onTouchStart={(e) => { e.preventDefault(); handleClick(); }}
        className="px-8 py-3 bg-[#881337] text-white rounded-full font-bold shadow-[0_4px_0_#4c0519] active:translate-y-1 active:shadow-none"
      >
        CLICK AQUÍ
      </button>
    </div>
  );
};

// --- Nivel 4: Timing ---
export const GameTiming: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState(1);
  const [running, setRunning] = useState(true);
  const [status, setStatus] = useState<"IDLE" | "WIN" | "LOSE">("IDLE");

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setPos(p => {
        if (p >= 98) setDir(-1);
        if (p <= 2) setDir(1);
        return p + (dir * 2); 
      });
    }, 16);
    return () => clearInterval(interval);
  }, [dir, running]);

  const handleStop = () => {
    if (!running) {
        setRunning(true);
        setStatus("IDLE");
        setPos(0);
        return;
    }
    setRunning(false);
    if (pos > 40 && pos < 60) { 
      playSound('win');
      setStatus("WIN");
      setTimeout(onComplete, 1000);
    } else {
      playSound('lose');
      setStatus("LOSE");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8 p-4">
      <div className="bg-white/80 px-4 py-2 rounded-lg border border-pink-200 shadow-sm text-[#881337] text-xs font-bold uppercase">
        {status === "WIN" ? "¡PERFECTO!" : status === "LOSE" ? "INTENTA DE NUEVO" : "DETÉN EN EL CENTRO"}
      </div>
      
      <div className="w-full max-w-[280px] h-12 bg-gray-200 rounded-full border-4 border-gray-300 relative overflow-hidden shadow-inner">
        <div className="absolute left-[40%] width-[20%] h-full bg-pink-400 w-[20%] opacity-80"></div>
        <div 
            className="absolute top-0 w-3 h-full bg-[#881337] shadow-md transition-none"
            style={{ left: `${pos}%` }}
        ></div>
      </div>
      
      <button 
        onClick={handleStop}
        className="w-20 h-20 rounded-full bg-[#881337] border-4 border-[#4c0519] shadow-lg flex items-center justify-center active:scale-95"
      >
        <div className="w-16 h-16 rounded-full bg-[#9f1239] flex items-center justify-center text-white font-black text-xl">
           OK
        </div>
      </button>
    </div>
  );
};

// --- Nivel 5: Simon ---
export const GameSimon: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const buttons = ['IZQ', 'DER']; 
  const [sequence, setSequence] = useState<number[]>([]);
  const [playbackIdx, setPlaybackIdx] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);

  const addToSequence = useCallback(() => {
    const next = Math.floor(Math.random() * 2);
    setSequence(prev => [...prev, next]);
  }, []);

  useEffect(() => {
    addToSequence();
    addToSequence();
    addToSequence();
  }, []);

  useEffect(() => {
    if (sequence.length === 0) return;
    setPlayerTurn(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= sequence.length) {
        clearInterval(interval);
        setPlayerTurn(true);
        setActiveBtn(null);
        return;
      }
      const btnIdx = sequence[i];
      setActiveBtn(btnIdx);
      playSound('click');
      setTimeout(() => setActiveBtn(null), 300);
      i++;
    }, 800);
    return () => clearInterval(interval);
  }, [sequence]);

  const handleBtnClick = (idx: number) => {
    if (!playerTurn) return;
    playSound('collect');
    setActiveBtn(idx);
    setTimeout(() => setActiveBtn(null), 150);
    
    if (idx === sequence[playbackIdx]) {
      if (playbackIdx === sequence.length - 1) {
        playSound('win');
        setTimeout(onComplete, 800);
      } else {
        setPlaybackIdx(p => p + 1);
      }
    } else {
      playSound('lose');
      setPlaybackIdx(0);
      const temp = [...sequence];
      setSequence([]); 
      setTimeout(() => setSequence(temp), 200);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8">
      <div className={`text-sm font-bold px-4 py-2 rounded-full ${playerTurn ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
         {playerTurn ? "¡TU TURNO!" : "MEMORIZA LA SECUENCIA"}
      </div>
      <div className="flex gap-6">
        {buttons.map((label, i) => (
          <button
            key={i}
            onClick={() => handleBtnClick(i)}
            className={`w-24 h-24 rounded-2xl font-bold text-xl transition-all duration-100 shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 ${
              activeBtn === i 
              ? 'bg-white text-pink-600 border-4 border-pink-400 brightness-110' 
              : 'bg-pink-500 text-white border-b-8 border-pink-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Nivel 6: Math ---
export const GameMath: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [answer, setAnswer] = useState("");
  
  const checkAnswer = () => {
    if (answer.trim() === "8") {
      playSound('win');
      onComplete();
    } else {
      playSound('lose');
      setAnswer("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6">
      <div className="bg-white px-8 py-6 rounded-2xl border-2 border-pink-200 shadow-md">
          <div className="text-3xl text-[#881337] font-black tracking-widest">4 + 4 = ?</div>
      </div>
      <input 
        type="number" 
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
        className="bg-pink-50 border-4 border-pink-300 text-[#881337] text-center text-4xl p-4 w-32 outline-none rounded-xl font-bold focus:border-pink-500 transition-colors"
        autoFocus
      />
      <button onClick={checkAnswer} className="mt-4 px-6 py-2 bg-[#881337] text-white rounded-full text-sm font-bold hover:bg-[#9f1239]">
        CONFIRMAR
      </button>
    </div>
  );
};

// --- Nivel 7: Dodge (Esquiva la Distancia) ---
export const GameDodge: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerX = useRef(50);
  const [timeLeft, setTimeLeft] = useState(10); 
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef<number>(0);

  // Reiniciar tiempo al reiniciar juego
  useEffect(() => {
      if (!gameOver) setTimeLeft(10);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let enemies: { x: number; y: number; speed: number }[] = [];
    let frame = 0;
    const MAX_FRAMES = 600; // ~10 segundos a 60fps
    
    // Clamping seguro para evitar cortes en bordes
    const setPlayerX = (val: number) => {
      playerX.current = Math.max(8, Math.min(92, val));
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
       if(e.cancelable) e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      let x = clientX - rect.left;
      let pct = (x / rect.width) * 100;
      setPlayerX(pct);
    };

    canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mousemove', handleMove);

    const update = () => {
      frame++;
      
      // Sincronizar Timer para UI
      if (frame % 60 === 0) { 
         setTimeLeft(Math.ceil((MAX_FRAMES - frame) / 60));
      }

      // Condición de Victoria
      if (frame >= MAX_FRAMES) { 
        onComplete();
        return;
      }

      // Generar enemigos
      if (frame % 20 === 0) {
        enemies.push({ x: Math.random() * 90 + 5, y: -10, speed: 1.0 + Math.random() });
      }

      enemies.forEach(e => e.y += e.speed);

      // Limpieza de enemigos fuera de pantalla
      enemies = enemies.filter(e => e.y < 120);

      let hit = false;
      enemies.forEach(e => {
        // Hitbox: Jugador Y aprox 85%
        if (e.y > 80 && e.y < 95 && Math.abs(e.x - playerX.current) < 10) {
          hit = true;
        }
      });

      if (hit) {
        playSound('lose');
        setGameOver(true);
        return; // Detener bucle
      }

      // -- DIBUJO --
      ctx.fillStyle = GB_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;

      // Jugador (Corazón Feliz)
      const px = (playerX.current / 100) * W;
      const py = H * 0.85;
      
      ctx.fillStyle = GB_ACCENT;
      ctx.beginPath();
      const size = 6;
      ctx.moveTo(px, py + size);
      ctx.bezierCurveTo(px - size, py, px - size*1.5, py - size*0.5, px, py - size);
      ctx.bezierCurveTo(px + size*1.5, py - size*0.5, px + size, py, px, py + size);
      ctx.fill();

      // Enemigos (Nubes Grises)
      ctx.fillStyle = '#94a3b8'; 
      enemies.forEach(e => {
        const ex = (e.x / 100) * W;
        const ey = (e.y / 100) * H;
        ctx.beginPath();
        ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.arc(ex - 6, ey + 4, 6, 0, Math.PI * 2);
        ctx.arc(ex + 6, ey + 4, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mousemove', handleMove);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameOver, onComplete]); // IMPORTANTE: No incluir timeLeft aquí

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
       {gameOver && (
           <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
               <button onClick={() => setGameOver(false)} className="px-6 py-3 bg-[#881337] text-white rounded-lg shadow-lg font-bold text-sm hover:scale-105 transition-transform">
                 INTENTAR DE NUEVO
               </button>
           </div>
       )}
       <div className="absolute top-2 right-0 w-full text-center pointer-events-none z-10">
          <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-mono">
            TIEMPO: {timeLeft}s
          </span>
       </div>
      <canvas ref={canvasRef} width={300} height={400} className="w-full h-full block touch-none" />
    </div>
  );
};

// --- Nivel 8: Boss ---
export const GameBoss: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [charge, setCharge] = useState(0);
  const intervalRef = useRef<any>(null);

  const startCharge = () => {
    playSound('powerup');
    intervalRef.current = setInterval(() => {
        setCharge(c => {
            if (c >= 100) {
                clearInterval(intervalRef.current);
                onComplete();
                return 100;
            }
            return c + 2; 
        });
    }, 30);
  };

  const stopCharge = () => {
    clearInterval(intervalRef.current);
    setCharge(c => Math.max(0, c - 20)); 
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full h-full p-4 select-none">
      <h3 className="text-[#881337] text-sm font-bold">MANTÉN EL AMOR CARGANDO...</h3>
      
      <div className="w-full max-w-[200px] h-6 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
        <div 
            className="h-full bg-gradient-to-r from-pink-400 to-[#be185d] transition-all duration-75"
            style={{ width: `${charge}%` }}
        ></div>
      </div>

      <button
        onMouseDown={startCharge}
        onMouseUp={stopCharge}
        onMouseLeave={stopCharge}
        onTouchStart={(e) => { e.preventDefault(); startCharge(); }}
        onTouchEnd={(e) => { e.preventDefault(); stopCharge(); }}
        className="w-28 h-28 rounded-full bg-[#be185d] border-[6px] border-[#9d174d] shadow-[0_10px_20px_rgba(190,24,93,0.3)] flex items-center justify-center active:scale-95 active:shadow-none transition-all"
      >
        <Heart className="w-14 h-14 text-white animate-pulse" />
      </button>
    </div>
  );
};