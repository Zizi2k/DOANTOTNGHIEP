const { GoogleGenAI } = require('@google/genai');

let ai = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'Chưa cấu hình GEMINI_API_KEY trong backend/.env'
    );
  }

  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return ai;
};

const generateAnswer = async (prompt) => {
  const client = getClient();

  const interaction = await client.interactions.create({
    model: 'gemini-3.6-flash',

    input: prompt,

    generation_config: {
      thinking_level: 'low',
    },
  });

  const text = interaction.output_text;

  if (!text || !text.trim()) {
    throw new Error('Gemini không trả về nội dung');
  }

  return text.trim();
};

module.exports = {
  generateAnswer,
};