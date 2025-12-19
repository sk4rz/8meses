import { GoogleGenAI } from "@google/genai";

// ==========================================
// 💌 EDITA TU CARTA DE AMOR AQUÍ ABAJO 💌
// ==========================================
const CARTA_PERSONALIZADA = `
Te amo, Xuan 💗
Gracias por hacerme muy feliz durante estos 8 meses


(y más difícil paq no chingues)
`;

// Si pones esto en 'true', saldrá siempre tu carta de arriba.
// Si pones 'false', intentará crear un poema nuevo con IA cada vez.
const USAR_CARTA_FIJA = true; 

export const generateLovePoem = async (): Promise<string> => {
  // 1. Si elegimos carta fija, devolvemos el texto directo.
  if (USAR_CARTA_FIJA) {
    // Simula un pequeño retraso para dar emoción
    await new Promise(resolve => setTimeout(resolve, 1500));
    return CARTA_PERSONALIZADA.trim();
  }

  // 2. Fallback si no hay API Key
  if (!process.env.API_KEY) {
    return CARTA_PERSONALIZADA.trim();
  }

  // 3. Intentar generar con IA
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Escribe un poema corto, romántico y divertido (máximo 6 líneas) en español para celebrar 8 meses de novios, usando referencias a videojuegos y amor eterno.",
    });
    return response.text || CARTA_PERSONALIZADA.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
     return CARTA_PERSONALIZADA.trim();
  }
};