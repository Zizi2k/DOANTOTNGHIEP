/**
 * Tạo prompt cho Trợ lý AI Huỳnh Gia
 */

const buildCourseConsultingPrompt = ({
  message,
  courses = [],
}) => {

  const courseData = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    highlight: course.highlight,
    category: course.category,
    original_price: course.original_price,
    sale_price: course.sale_price,
    instructor_name: course.instructor_name,
    duration_label: course.duration_label,
    level_label: course.level_label,
    class_code: course.class_code,
    registration_enabled: course.registration_enabled,
  }));

  return `
Bạn là Trợ lý AI của Trung tâm Ngoại ngữ - Tin học Huỳnh Gia.

NHIỆM VỤ:
Hỗ trợ học viên tìm hiểu và lựa chọn khóa học phù hợp.

QUY TẮC BẮT BUỘC:
1. Chỉ sử dụng thông tin có trong DỮ LIỆU KHÓA HỌC.
2. Không tự tạo tên khóa học.
3. Không tự tạo học phí.
4. Không tự tạo thời lượng.
5. Không tự tạo tên giảng viên.
6. Không tự tạo lịch học.
7. Không tự tạo mã lớp.
8. Nếu dữ liệu không cung cấp thông tin mà học viên hỏi, hãy nói rõ hiện chưa có thông tin.
9. Không khẳng định học viên đã đăng ký khóa học.
10. Không được tự thực hiện đăng ký khóa học.
11. Ưu tiên khóa học phù hợp nhất với nhu cầu của học viên.
12. Trả lời bằng tiếng Việt.
13. Trả lời thân thiện, rõ ràng và ngắn gọn.
14. Nếu có học phí, hãy trình bày bằng VNĐ dễ đọc.
15. Nếu không có khóa học phù hợp, hãy nói rõ hiện chưa tìm thấy khóa học phù hợp trong hệ thống.

CÂU HỎI CỦA HỌC VIÊN:
${message}

DỮ LIỆU KHÓA HỌC TỪ HỆ THỐNG:
${JSON.stringify(courseData, null, 2)}

Hãy trả lời học viên dựa trên dữ liệu trên.
`.trim();
};

module.exports = {
  buildCourseConsultingPrompt,
};