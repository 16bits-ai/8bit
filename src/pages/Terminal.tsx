import React, { useState, useRef, useEffect } from 'react';
import ParallaxBackground from '../components/ParallaxBackground';
import TextType from '../components/TextType';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
}

const Terminal: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'HELLO! I\'M CARL\'S KERNEL. TYPE A MESSAGE TO START CHATTING.',
      sender: 'bot',
      isTyping: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize Gemini AI
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keep input focused after sending message
  useEffect(() => {
    if (!isBotTyping && inputRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [messages, isBotTyping]);

  // Get bot response from Gemini API
  const getBotResponse = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    if (!ai) {
      return 'ERROR: GEMINI API KEY NOT CONFIGURED. PLEASE CHECK YOUR ENVIRONMENT VARIABLES.';
    }

    try {
      // Build conversation history for context
      const systemPrompt = `You are Carl's Kernel, a helpful terminal assistant. You act as Carl Liu, an AI-driven product builder and software engineer currently studying in Stanford University's Learning, Design & Technology (LDT) program. 

Carl is focused on innovating in AI for learning, creativity, and human augmentation, especially building AI systems that expand what people can do and improve global access to knowledge. 

Carl's background includes:
- Serving as Head of Product at Presence, leading product and engineering for a 20-person team, shipping cross-platform AI features, and scaling AI-driven campaigns
- Working at Airbnb on customer support automation, BERT-based classification, and award-winning data visualizations
- Building core features for Tableau Public and Tableau Online using TypeScript, React, Redux, and scalable visualization systems

Carl has strong technical experience across Java/Kotlin, TypeScript/JavaScript, Swift, Python, C#, SQL, Unity, iOS, D3, AWS, Kubernetes, Terraform, Flask, ARKit/ARCore, and Mediapipe.

When responding, think like a builder-designer-engineer: be clear, analytical, optimistic about AI, and grounded in practical product thinking using user experience, system design, and engineering constraints. Communicate with curiosity and a focus on rapid prototyping, visualization, and educational impact. The mission is to design and articulate ideas for AI tools that help people learn, create, and think better, including personal tutors, intelligent agents, lightweight on-device models, and intuitive visualization systems.

Professional contact information: csliu@stanford.edu and linkedin.com/in/gazcn007 (reference when appropriate in context).

Keep responses concise and in an 80s arcade terminal style (use ALL CAPS, be friendly but brief). Be helpful and engaging.`;

      // Format conversation history
      const historyText = conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => {
          if (msg.sender === 'user') {
            return `USER: ${msg.text}`;
          } else {
            return `ASSISTANT: ${msg.text}`;
          }
        })
        .join('\n');

      const contents = `${systemPrompt}\n\n${historyText}\n\nUSER: ${userMessage}\nASSISTANT:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
      });
      
      // Convert to uppercase for terminal style
      const text = response.text || '';
      return text.trim().toUpperCase();
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'ERROR: FAILED TO GET RESPONSE. PLEASE TRY AGAIN.';
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isBotTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = messageText.trim();
    setInputValue('');
    setIsBotTyping(true);
    
    // Refocus input after a brief delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    try {
      // Get updated messages list for conversation history
      const updatedMessages = [...messages, userMessage];
      
      // Get response from Gemini
      const responseText = await getBotResponse(currentInput, updatedMessages);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        isTyping: true
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsBotTyping(false);
      
      // Mark message as done typing after animation completes
      // Estimate: ~30ms per character + 500ms buffer
      const typingDuration = responseText.length * 30 + 500;
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg => (msg.id === botResponse.id ? { ...msg, isTyping: false } : msg))
        );
      }, typingDuration);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'ERROR: FAILED TO GET RESPONSE. PLEASE TRY AGAIN.',
        sender: 'bot',
        isTyping: false
      };
      setMessages(prev => [...prev, errorResponse]);
      setIsBotTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isBotTyping) return;
    await sendMessage(inputValue);
  };

  const handleOptionClick = (optionText: string) => {
    if (isBotTyping) return;
    sendMessage(optionText);
  };

  // Check if it's the initial conversation (no user messages yet)
  const hasUserMessages = messages.some(msg => msg.sender === 'user');
  const defaultOptions = [
    'What is your email?',
    'What is your linkedin?',
  ];

  return (
    <div className="relative w-full min-h-screen bg-black">
      <ParallaxBackground color="#FFE66D" variant="lines" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-20">
        <h1
          className="text-3xl md:text-5xl lg:text-7xl font-bold mb-8 md:mb-12 text-center"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#FFE66D',
            textShadow: '0 0 10px #FFE66D'
          }}
        >
          TERMINAL CHAT
        </h1>

        <div className="max-w-4xl mx-auto">
          <div
            className="border-4 border-[#FFE66D] bg-black/90 p-4 md:p-8 flex flex-col"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#FFE66D',
              minHeight: '500px',
              maxHeight: '70vh'
            }}
          >
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 terminal-scrollbar">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[70%] p-3 border-2 ${
                        message.sender === 'user'
                          ? 'border-[#FFE66D] bg-[#FFE66D]/10'
                          : 'border-[#FFE66D] bg-black'
                      }`}
                      style={{
                        wordBreak: 'break-word',
                        fontSize: '0.6rem',
                        lineHeight: '1.6'
                      }}
                    >
                      {message.sender === 'bot' && message.isTyping ? (
                        <TextType
                          text={message.text}
                          typingSpeed={30}
                          showCursor={true}
                          cursorCharacter="█"
                          cursorBlinkDuration={0.5}
                          loop={false}
                          className="text-[#FFE66D]"
                        />
                      ) : (
                        <span className="text-[#FFE66D]">{message.text}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Default Options (Fallout style) */}
            {!hasUserMessages && !isBotTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 mb-4"
              >
                {defaultOptions.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className="w-full text-left p-3 border-2 border-[#FFE66D] bg-black hover:bg-[#FFE66D]/10 transition-all"
                    style={{
                      fontFamily: '"Press Start 2P", cursive',
                      fontSize: '0.5rem',
                      lineHeight: '1.6',
                      color: '#FFE66D'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-[#FFE66D] mr-2">{index + 1}.</span>
                    <span className="text-[#FFE66D]">{option.toUpperCase()}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t-2 border-[#FFE66D] pt-4">
              <div className="flex gap-2">
                <span className="text-[#FFE66D] text-xs self-center">{'>'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  placeholder="TYPE YOUR MESSAGE..."
                  className="flex-1 bg-black border-2 border-[#FFE66D] p-2 md:p-3 text-[#FFE66D] focus:outline-none focus:border-[#FFE66D] focus:shadow-[0_0_10px_#FFE66D] text-xs md:text-sm"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                  disabled={isBotTyping}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isBotTyping}
                  className="px-4 md:px-6 py-2 md:py-3 border-2 border-[#FFE66D] bg-black text-[#FFE66D] hover:bg-[#FFE66D] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                >
                  SEND
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;

