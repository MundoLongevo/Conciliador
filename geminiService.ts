
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractCreditsFromStatement = async (imageData?: string, ocrText?: string): Promise<Transaction[]> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analise este extrato bancário da Clínica Marie.
    Extraia APENAS os lançamentos de CRÉDITO (marcados com 'C' ou que representem entrada de dinheiro, como Pix Recebido, Transferências Recebidas).
    Ignore débitos ('D') e transferências enviadas.
    Para cada crédito, extraia: data, descrição (histórico), valor e número do documento se disponível.
    Converta o valor para um número (ex: 1.000,00 -> 1000).
  `;

  const contents = [];
  if (imageData) {
    contents.push({
      inlineData: {
        mimeType: "image/png",
        data: imageData.split(',')[1] || imageData
      }
    });
  }
  if (ocrText) {
    contents.push({ text: `Texto do Extrato: ${ocrText}` });
  }
  contents.push({ text: prompt });

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            document: { type: Type.STRING },
            id: { type: Type.STRING, description: "Um ID único gerado para esta transação" }
          },
          required: ["date", "description", "amount"]
        }
      }
    }
  });

  try {
    const rawData = JSON.parse(response.text || "[]");
    return rawData.map((t: any) => ({
      ...t,
      id: t.id || Math.random().toString(36).substr(2, 9),
      type: 'C'
    }));
  } catch (e) {
    console.error("Erro ao processar resposta do Gemini", e);
    return [];
  }
};
