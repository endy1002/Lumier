import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Bạn thích thể loại sách nào nhất?',
    options: ['Văn học kinh điển', 'Self-help', 'Tiểu thuyết', 'Khoa học', 'Thơ ca'],
  },
  {
    id: 2,
    question: 'Bạn thường đọc sách vào thời điểm nào?',
    options: ['Buổi sáng', 'Trưa', 'Chiều tối', 'Trước khi ngủ', 'Bất kỳ lúc nào'],
  },
  {
    id: 3,
    question: 'Cuốn sách gần nhất bạn đọc là gì?',
    options: ['Nhà Giả Kim', 'Đắc Nhân Tâm', 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 'Sách khác'],
  },
];

const RECOMMENDATIONS = {
  'Văn học kinh điển': 'The Classic Rose Bookcharm - phù hợp với gu cổ điển thanh lịch của bạn!',
  'Self-help': 'The Golden Book Charm - nguồn cảm hứng vàng ròng cho hành trình phát triển bản thân!',
  'Tiểu thuyết': 'Victoria Library Bookcharm - mang phong cách văn chương lãng mạn!',
  'Khoa học': 'The Aurelian Archive - kho tàng tri thức dành cho tâm hồn khám phá!',
  'Thơ ca': 'The Midnight Library - vẻ đẹp tĩnh lặng và sâu lắng cho tâm hồn thơ!',
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 = initial, 1-3 = quiz, 4 = email, 5 = result
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [showBubble, setShowBubble] = useState(true);

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (step < QUIZ_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setStep(4); // Go to email step
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      // Save lead data (mock)
      console.log('Lead captured:', { email, preferences: answers });
      setStep(5); // Show result
    }
  };

  const getRecommendation = () => {
    const genre = answers[1] || 'Văn học kinh điển';
    return RECOMMENDATIONS[genre] || RECOMMENDATIONS['Văn học kinh điển'];
  };

  const resetChat = () => {
    setStep(0);
    setAnswers({});
    setEmail('');
  };

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && showBubble && (
        <div className="fixed bottom-6 right-6 z-[70] flex items-end gap-3">
          {/* Popup text */}
          <div className="bg-white rounded-2xl rounded-br-none shadow-lg px-4 py-3 max-w-[200px] animate-fade-in-up">
            <p className="font-san text-xs text-brand-charcoal">
              Vẫn chưa tìm được sách đúng gu? 📚
            </p>
            <button
              onClick={() => setShowBubble(false)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-brand-muted text-white rounded-full flex items-center justify-center text-xs hover:bg-brand-charcoal"
            >
              ×
            </button>
          </div>

          {/* Mascot button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setShowBubble(false);
            }}
            className="w-14 h-14 bg-brand-navy rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform animate-float"
          >
            <MessageCircle size={24} className="text-white" />
          </button>
        </div>
      )}

      {/* Closed state - just the button */}
      {!isOpen && !showBubble && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[70] w-14 h-14 bg-brand-navy rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[70] w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Chat header */}
          <div className="gradient-navy px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-amber rounded-full flex items-center justify-center">
                <span className="text-sm">📖</span>
              </div>
              <div>
                <p className="font-san text-sm font-medium text-white">
                  Lumier Assistant
                </p>
                <p className="font-san text-[10px] text-white/60">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat body */}
          <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
            {step === 0 && (
              <div className="space-y-3">
                <div className="bg-brand-cream rounded-2xl rounded-bl-none px-4 py-3">
                  <p className="font-san text-sm text-brand-charcoal">
                    Xin chào! 👋 Mình là trợ lý của Lumier. Để gợi ý bookcharm phù hợp, mình
                    muốn hỏi bạn vài câu nhé!
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-2.5 bg-brand-navy text-white font-san text-sm rounded-xl hover:bg-brand-deep-blue transition-colors"
                >
                  Bắt đầu! 🚀
                </button>
              </div>
            )}

            {step >= 1 && step <= QUIZ_QUESTIONS.length && (
              <div className="space-y-3">
                <div className="bg-brand-cream rounded-2xl rounded-bl-none px-4 py-3">
                  <p className="font-san text-sm text-brand-charcoal">
                    {QUIZ_QUESTIONS[step - 1].question}
                  </p>
                </div>
                <div className="space-y-2">
                  {QUIZ_QUESTIONS[step - 1].options.map((option) => (
                    <button
                      key={option}
                      onClick={() =>
                        handleAnswer(QUIZ_QUESTIONS[step - 1].id, option)
                      }
                      className="w-full text-left px-4 py-2.5 border border-brand-cream-dark rounded-xl font-san text-sm hover:border-brand-amber hover:bg-brand-amber/5 transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <div className="bg-brand-cream rounded-2xl rounded-bl-none px-4 py-3">
                  <p className="font-san text-sm text-brand-charcoal">
                    Tuyệt vời! Để nhận gợi ý, vui lòng nhập email của bạn nhé 📬
                  </p>
                </div>
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2.5 border border-brand-cream-dark rounded-xl font-san text-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-brand-navy text-white rounded-xl hover:bg-brand-deep-blue"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                <div className="bg-brand-cream rounded-2xl rounded-bl-none px-4 py-3">
                  <p className="font-san text-sm text-brand-charcoal">
                    🎉 Dựa trên sở thích của bạn, mình gợi ý:
                  </p>
                  <p className="font-san text-sm font-semibold text-brand-navy mt-2">
                    {getRecommendation()}
                  </p>
                </div>
                <button
                  onClick={resetChat}
                  className="w-full py-2.5 border border-brand-cream-dark text-brand-charcoal font-san text-sm rounded-xl hover:border-brand-amber transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
