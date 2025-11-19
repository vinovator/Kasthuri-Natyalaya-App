
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash';

export const generateAnnouncement = async (topic: string, audience: string, keyDetails: string): Promise<string> => {
  // Check if API key is available. If not, return a fallback message.
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return `(AI Generation Unavailable - Missing API Key)\n\nDraft for: ${topic}\nDetails: ${keyDetails}`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are an administrative assistant for a classical Bharatanatyam dance school called "Kasthuri Natyalaya".
      Write a professional yet warm announcement.
      
      Topic: ${topic}
      Target Audience: ${audience}
      Key Details to Include: ${keyDetails}
      
      Keep it concise (under 150 words). Use a respectful and culturally appropriate tone for an Indian classical arts school.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Could not generate content.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const generateEventDescription = async (eventName: string, date: string): Promise<string> => {
    if (!process.env.API_KEY) return "";

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Write a short, engaging description (2 sentences) for a Bharatanatyam dance event named "${eventName}" happening on ${date}.
        Mention that it is hosted by Kasthuri Natyalaya.
      `;
  
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
  
      return response.text || "";
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return "";
    }
  };

export const generateFeeReminder = async (parentName: string, studentName: string, amountDue: number, classCount: number): Promise<string> => {
  if (!process.env.API_KEY) return `Dear ${parentName}, This is a gentle reminder regarding pending fees of £${amountDue} for ${studentName}.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Write a polite and professional fee payment reminder email to a parent.
      
      School Name: Kasthuri Natyalaya (Bharatanatyam Dance School)
      Parent Name: ${parentName}
      Student Name: ${studentName}
      Amount Due: £${amountDue}
      Pending Classes Count: ${classCount}
      
      The tone should be polite, respectful, and understanding, consistent with a cultural arts school. 
      Keep it short. Do not include subject lines.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Error generating reminder.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return `Dear ${parentName}, This is a gentle reminder regarding pending fees of £${amountDue} for ${studentName}.`;
  }
};

export const generateBulkFeeReminder = async (studentCount: number): Promise<string> => {
    if (!process.env.API_KEY) return `Dear Parents, This is a gentle reminder regarding pending fees. Please verify your payment status with the administration.`;
  
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Write a polite and professional fee payment reminder email suitable for sending to multiple parents (BCC).
        
        School Name: Kasthuri Natyalaya
        Context: Reminding ${studentCount} parents about outstanding fees.
        
        The tone should be generic enough to apply to all, but warm and respectful. 
        Ask them to check their specific due amount in the portal or contact the admin.
        Do not include placeholders for specific amounts.
      `;
  
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
  
      return response.text || "Error generating reminder.";
    } catch (error) {
      console.error("Gemini AI Error:", error);
      return "Error generating content.";
    }
  };
