require('dotenv').config();

const {
  generateAnswer,
} = require('../services/ai/llmService');

async function test() {
  try {
    const answer = await generateAnswer(
      'Hãy trả lời đúng một câu ngắn bằng tiếng Việt: Xin chào từ Trợ lý AI Huỳnh Gia.'
    );

    console.log('GEMINI OK:');
    console.log(answer);
  } catch (error) {
    console.error('GEMINI ERROR:');
    console.error(error);
  }
}

test();