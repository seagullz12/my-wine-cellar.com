// openaiService.js
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});
export const getWineDataFromText = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: 'You are a helpful assistant with expert knowledge about wines.' },
        { role: 'user', content: `Extract wine details from the following text: "${text}". Respond in the following structured format: "Name: [wine name]; Grape: [grape]; Vintage: [vintage]; Region: [region]; Producer: [producer]; Alcohol Content: [alcohol content]; Colour: [colour]; Nose: [nose]; Palate: [palate]; Pairing: [pairing]." If any information is missing, fill it based on your knowledge.` }
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching wine data:', error);
    throw error;
  }
};



