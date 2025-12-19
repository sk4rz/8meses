export enum GameState {
  INTRO = 'INTRO',
  PLAYING = 'PLAYING',
  LEVEL_TRANSITION = 'LEVEL_TRANSITION',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export type LevelConfig = {
  id: number;
  name: string;
  instruction: string;
  type: 'CATCH' | 'MASH' | 'MEMORY' | 'TIMING' | 'SIMON' | 'MATH' | 'DODGE' | 'BOSS';
};

// ==========================================
// 🎮 EDITA LOS TEXTOS DE LOS NIVELES AQUÍ 🎮
// ==========================================
export const LEVELS: LevelConfig[] = [
  { id: 1, name: "Mes 1: La Conquista",     instruction: "¡Atrapa 10 corazones!",          type: 'CATCH' },
  { id: 2, name: "Mes 2: Conexión",         instruction: "¡Encuentra las parejas!",        type: 'MEMORY' },
  { id: 3, name: "Mes 3: Latidos",          instruction: "¡Dale click rápido para llenar!", type: 'MASH' },
  { id: 4, name: "Mes 4: Sincronía",        instruction: "¡Para en la zona verde!",        type: 'TIMING' },
  { id: 5, name: "Mes 5: Confianza",        instruction: "¡Repite la secuencia!",          type: 'SIMON' },
  { id: 6, name: "Mes 6: Lógica",           instruction: "Resuelve: 4 + 4 = ?",            type: 'MATH' },
  { id: 7, name: "Mes 7: Esquivando Dramas", instruction: "¡Esquiva por 10 seg!",          type: 'DODGE' },
  { id: 8, name: "Mes 8: Para Siempre",     instruction: "¡Mantén presionado para cargar!", type: 'BOSS' },
];