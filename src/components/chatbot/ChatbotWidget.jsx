import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ChatbotWidget() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 = initial, 1-3 = quiz, 4 = email, 5 = result
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [showBubble, setShowBubble] = useState(true);

  const quizQuestions = [
    {
      id: 1,
      question: t('Bạn thích thể loại sách nào nhất?', 'Which book genre do you enjoy the most?'),
      options: [
        { key: 'classic', label: t('Văn học kinh điển', 'Classic literature') },
        { key: 'selfhelp', label: 'Self-help' },
        { key: 'novel', label: t('Tiểu thuyết', 'Novels') },
        { key: 'science', label: t('Khoa học', 'Science') },
        { key: 'poetry', label: t('Thơ ca', 'Poetry') },
      ],
    },
    {
      id: 2,
      question: t('Bạn thường đọc sách vào thời điểm nào?', 'When do you usually read?'),
      options: [
        { key: 'morning', label: t('Buổi sáng', 'Morning') },
        { key: 'noon', label: t('Trưa', 'Noon') },
        { key: 'evening', label: t('Chiều tối', 'Evening') },
        { key: 'before-sleep', label: t('Trước khi ngủ', 'Before sleeping') },
        { key: 'anytime', label: t('Bất kỳ lúc nào', 'Anytime') },
      ],
    },
    {
      id: 3,
      question: t('Cuốn sách gần nhất bạn đọc là gì?', 'What is the latest book you read?'),
      options: [
        { key: 'alchemist', label: t('Nhà Giả Kim', 'The Alchemist') },
        { key: 'how-to-win', label: t('Đắc Nhân Tâm', 'How to Win Friends and Influence People') },
        { key: 'yellow-flowers', label: t('Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Yellow Flowers on the Green Grass') },
        { key: 'youth-worth', label: t('Tuổi Trẻ Đáng Giá Bao Nhiêu', 'How Much Is Youth Worth?') },
        { key: 'other', label: t('Sách khác', 'Other book') },
      ],
    },
  ];

  const recommendations = {
    classic: t(
      'The Classic Rose Bookcharm - phù hợp với gu cổ điển thanh lịch của bạn!',
      'The Classic Rose Bookcharm - perfect for your elegant classic taste!'
    ),
    selfhelp: t(
      'The Golden Book Charm - nguồn cảm hứng vàng ròng cho hành trình phát triển bản thân!',
      'The Golden Book Charm - a golden spark for your self-growth journey!'
    ),
    novel: t(
      'Victoria Library Bookcharm - mang phong cách văn chương lãng mạn!',
      'Victoria Library Bookcharm - crafted for your romantic literary vibe!'
    ),
    science: t(
      'The Aurelian Archive - kho tàng tri thức dành cho tâm hồn khám phá!',
      'The Aurelian Archive - a treasury of knowledge for curious minds!'
    ),
    poetry: t(
      'The Midnight Library - vẻ đẹp tĩnh lặng và sâu lắng cho tâm hồn thơ!',
      'The Midnight Library - quiet and profound beauty for poetic souls!'
    ),
  };

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (step < quizQuestions.length) {
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
    const genre = answers[1] || 'classic';
    return recommendations[genre] || recommendations.classic;
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
          <div className="relative bg-white rounded-2xl shadow-xl px-4 py-3 mr-2 max-w-[200px] animate-fade-in-up
                          after:content-[''] after:absolute after:top-[60%] after:-right-[7px] after:-translate-y-1/2 after:border-t-[8px] after:border-t-transparent after:border-b-[8px] after:border-b-transparent after:border-l-[8px] after:border-l-white">
            <p className="font-san text-xl text-brand-charcoal pr-2">
              {t('Tìm sách đúng gu với LumiAI', 'Find your perfect match with LumiAI')}
            </p>
            <button
              onClick={() => setShowBubble(false)}
              className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-brand-charcoal text-white rounded-full flex items-center justify-center text-xs shadow-md border-2 border-white hover:bg-brand-amber transition-colors"
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
                    {t(
                      'Xin chào! 👋 Mình là trợ lý của Lumier. Để gợi ý bookcharm phù hợp, mình muốn hỏi bạn vài câu nhé!',
                      'Hi there! 👋 I am Lumier assistant. To suggest your ideal bookcharm, may I ask you a few quick questions?'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-2.5 bg-brand-navy text-white font-san text-sm rounded-xl hover:bg-brand-deep-blue transition-colors"
                >
                  {t('Bắt đầu! 🚀', 'Let us begin! 🚀')}
                </button>
              </div>
            )}

            {step >= 1 && step <= quizQuestions.length && (
              <div className="space-y-3">
                <div className="bg-brand-cream rounded-2xl rounded-bl-none px-4 py-3">
                  <p className="font-san text-sm text-brand-charcoal">
                    {quizQuestions[step - 1].question}
                  </p>
                </div>
                <div className="space-y-2">
                  {quizQuestions[step - 1].options.map((option) => (
                    <button
                      key={option.key}
                      onClick={() =>
                        handleAnswer(quizQuestions[step - 1].id, option.key)
                      }
                      className="w-full text-left px-4 py-2.5 border border-brand-cream-dark rounded-xl font-san text-sm hover:border-brand-amber hover:bg-brand-amber/5 transition-all"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <div className="bg-brand-cream rounded-2xl rounded-bl-none px-4 py-3">
                  <p className="font-san text-sm text-brand-charcoal">
                    {t(
                      'Tuyệt vời! Để nhận gợi ý, vui lòng nhập email của bạn nhé 📬',
                      'Great! To receive your recommendation, please enter your email 📬'
                    )}
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
                    {t('🎉 Dựa trên sở thích của bạn, mình gợi ý:', '🎉 Based on your preferences, here is our pick:')}
                  </p>
                  <p className="font-san text-sm font-semibold text-brand-navy mt-2">
                    {getRecommendation()}
                  </p>
                </div>
                <button
                  onClick={resetChat}
                  className="w-full py-2.5 border border-brand-cream-dark text-brand-charcoal font-san text-sm rounded-xl hover:border-brand-amber transition-colors"
                >
                  {t('Thử lại', 'Try again')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
