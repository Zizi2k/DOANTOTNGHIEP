const {
  detectIntent,
} = require('../services/ai/intentService');

const {
  getCourseContext,
} = require('../services/ai/contextService');

const {
  buildCourseConsultingPrompt,
} = require('../services/ai/promptService');

const {
  generateAnswer,
} = require('../services/ai/llmService');


const chat = async (req, res) => {

  try {

    const { message } = req.body;

    // ==============================
    // 1. VALIDATE
    // ==============================

    if (!message || !message.trim()) {

      return res.status(400).json({
        message: 'Vui lòng nhập câu hỏi',
      });

    }


    // ==============================
    // 2. NHẬN DIỆN INTENT
    // ==============================

    const intent = detectIntent(message);


    // ==============================
    // 3. CONTEXT
    // ==============================

    let context = null;

    let answer =
      'Trợ lý AI Huỳnh Gia đã nhận được câu hỏi.';


    // ==============================
    // 4. TƯ VẤN KHÓA HỌC
    // ==============================

    if (intent === 'COURSE_CONSULTING') {

      context = await getCourseContext(
        req.user,
        message
      );


      // Không có khóa học
      if (!context.length) {

        answer =
          'Hiện chưa tìm thấy khóa học phù hợp trong hệ thống.';

      }

      // Có khóa học
      else {

        const prompt =
          buildCourseConsultingPrompt({
            message,
            courses: context,
          });


        answer =
          await generateAnswer(prompt);

      }

    }


    // ==============================
    // 5. RESPONSE
    // ==============================

    return res.json({

      success: true,

      data: {

        question: message,

        intent,

        user: {
          id: req.user.id,
          role: req.user.role,
        },

        context,

        answer,

      },

    });


  } catch (error) {

    console.error(
      'AI Chat Error:',
      error
    );


    return res.status(500).json({

      message:
        'Trợ lý AI hiện không thể xử lý yêu cầu. Vui lòng thử lại sau.',

    });

  }

};


module.exports = {
  chat,
};