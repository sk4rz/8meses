import React, { useState } from 'react';
import { GameState, LEVELS, LevelConfig } from './types';
import { RetroButton, ScreenContainer, Heart } from './components/RetroUI';
import { GameCatch, GameMemory, GameMash, GameTiming, GameSimon, GameMath, GameDodge, GameBoss } from './components/MiniGames';
import { playSound, initAudio } from './utils/sound';
import { generateLovePoem } from './services/gemini';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [poem, setPoem] = useState<string>("");
  const [loadingPoem, setLoadingPoem] = useState(false);

  const currentLevel: LevelConfig = LEVELS[currentLevelIdx];

  const startGame = () => {
    initAudio();
    playSound('click');
    setGameState(GameState.LEVEL_TRANSITION);
    setCurrentLevelIdx(0);
  };

  const restartGame = () => {
    playSound('click');
    setGameState(GameState.INTRO);
    setCurrentLevelIdx(0);
    setPoem("");
  };

  const nextLevel = async () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      playSound('win');
      setCurrentLevelIdx(p => p + 1);
      setGameState(GameState.LEVEL_TRANSITION);
    } else {
      playSound('win');
      setLoadingPoem(true);
      setGameState(GameState.VICTORY);
      const p = await generateLovePoem();
      setPoem(p);
      setLoadingPoem(false);
    }
  };

  const renderGame = () => {
    switch (currentLevel.type) {
      case 'CATCH': return <GameCatch onComplete={nextLevel} />;
      case 'MEMORY': return <GameMemory onComplete={nextLevel} />;
      case 'MASH': return <GameMash onComplete={nextLevel} />;
      case 'TIMING': return <GameTiming onComplete={nextLevel} />;
      case 'SIMON': return <GameSimon onComplete={nextLevel} />;
      case 'MATH': return <GameMath onComplete={nextLevel} />;
      case 'DODGE': return <GameDodge onComplete={nextLevel} />;
      case 'BOSS': return <GameBoss onComplete={nextLevel} />;
      default: return <div>Error</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 select-none">
      <h1 className="text-2xl md:text-3xl text-[#be185d] mb-6 text-center font-black tracking-tight drop-shadow-sm uppercase">
        Felices 8 Meses
      </h1>

      <ScreenContainer>
        {gameState === GameState.INTRO && (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in text-center p-6">
             <div className="animate-bounce p-4 bg-white rounded-full shadow-sm">
               <Heart className="w-16 h-16 text-[#be185d]" />
             </div>
             <div className="space-y-2 max-w-[250px]">
                <p className="text-[#881337] text-sm font-bold">Holiii</p>
                <div className="h-0.5 w-16 bg-pink-200 mx-auto my-2"></div>
                <p className="text-slate-500 text-xs leading-relaxed">Completa los 8 minijuegos para desbloquear mi carta de amor.</p>
             </div>
             <div className="mt-4">
                 <RetroButton onClick={startGame} variant="primary">START</RetroButton>
             </div>
          </div>
        )}

        {gameState === GameState.LEVEL_TRANSITION && (
          <div className="flex flex-col items-center justify-center gap-6 text-center h-full p-6 w-full">
            <div className="bg-white px-6 py-3 rounded-full shadow-sm border border-pink-100">
                <h2 className="text-xl text-[#881337] font-black">NIVEL {currentLevel.id}</h2>
            </div>
            
            <div className="bg-pink-50/50 p-6 rounded-2xl w-full border border-pink-100">
                 <h3 className="text-lg text-[#be185d] mb-2 font-bold uppercase tracking-wide">{currentLevel.name}</h3>
                 <p className="text-slate-600 text-sm">{currentLevel.instruction}</p>
            </div>
            
            <div className="mt-2">
                <RetroButton onClick={() => setGameState(GameState.PLAYING)} variant="primary">JUGAR</RetroButton>
            </div>
          </div>
        )}

        {gameState === GameState.PLAYING && (
          <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center w-full px-4 py-2 bg-white text-[10px] text-slate-500 border-b border-pink-100 font-bold tracking-widest uppercase">
               <span>LVL {currentLevel.id}</span>
               <span className="text-[#be185d]">MES {currentLevel.id}</span>
            </div>
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#fff1f2] w-full">
                {renderGame()}
            </div>
          </div>
        )}

        {gameState === GameState.VICTORY && (
          <div className="flex flex-col items-center justify-between h-full text-center p-5 w-full gap-4">
             {/* Header */}
             <div className="flex flex-col items-center gap-2 mt-2">
                 <div className="bg-white p-2 rounded-full shadow-sm animate-bounce">
                     <Heart className="w-8 h-8 text-[#be185d]" />
                 </div>
                 <h2 className="text-xl text-[#be185d] font-bold tracking-tight">¡LO LOGRASTE!</h2>
             </div>
             
             {/* Contenido (Poema) con scroll flexible */}
             {loadingPoem ? (
                 <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-xs font-bold animate-pulse">Escribiendo carta...</p>
                 </div>
             ) : (
                 <div className="flex-1 w-full relative group">
                    <div className="absolute inset-0 bg-white border border-pink-200 rounded-xl shadow-inner opacity-80 rotate-1 transform scale-[0.98] z-0"></div>
                    <div className="relative z-10 bg-white border border-pink-200 p-5 rounded-xl shadow-sm w-full h-full overflow-y-auto custom-scrollbar flex items-center justify-center">
                        <p className="text-sm text-[#881337] italic leading-7 font-serif whitespace-pre-line">
                        {poem}
                        </p>
                    </div>
                 </div>
             )}
             
             {/* Footer con Botón */}
             <div className="mt-auto w-full flex flex-col items-center gap-3">
                 <RetroButton onClick={restartGame} variant="secondary" className="w-32 bg-slate-600 border-slate-700 hover:bg-slate-500 text-xs">
                    REINICIAR
                 </RetroButton>
             </div>
          </div>
        )}
      </ScreenContainer>

      <div className="mt-8 text-[10px] text-slate-400 font-medium tracking-wider uppercase opacity-50">
        Hecho con amor
      </div>
    </div>
  );
}