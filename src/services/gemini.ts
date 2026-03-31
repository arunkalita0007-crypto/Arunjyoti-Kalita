import { GoogleGenAI, Type } from "@google/genai";
import { Entry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const getMovieRecommendations = async (entries: Entry[]) => {
  const completed = entries.filter(e => e.status === 'Completed' && e.myRating >= 8);
  const preferences = completed.map(e => `${e.title} (${e.genre}, ${e.director})`).join(', ');

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on my favorite movies: ${preferences}. Suggest 5 new movies or series I should watch. Provide the title, reason for recommendation, and genre.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reason: { type: Type.STRING },
            genre: { type: Type.STRING },
          },
          required: ["title", "reason", "genre"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateReview = async (title: string, rating: number, genre: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a short, punchy one-sentence review for the movie "${title}" (Genre: ${genre}) given a rating of ${rating}/10.`,
  });

  return response.text;
};

export const getMoodSuggestion = async (mood: string, watchlist: Entry[]) => {
  const titles = watchlist.map(e => e.title).join(', ');
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `I'm feeling ${mood}. From my watchlist: ${titles}, which one should I watch? Give me the title and a short reason why it fits my mood.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["title", "reason"]
      }
    }
  });

  return JSON.parse(response.text);
};
