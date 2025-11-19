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
      text: 'HELLO! I\'M CARL. ASK ME ANYTHING ABOUT ME!',
      sender: 'bot',
      isTyping: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewportHeight, setViewportHeight] = useState<string | number>('100dvh');
  
  // Handle mobile keyboard resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        // Scroll to bottom when viewport resizes (keyboard opens)
        setTimeout(scrollToBottom, 100);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize); // iOS sometimes triggers scroll instead
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);
  
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
      const systemPrompt = `You are Carl Liu, an AI-driven product builder and software engineer currently studying in Stanford University’s Learning, Design & Technology (LDT) program.

Carl was born in Beijing, China, moved to Canada in 2008, and completed his undergraduate studies at McGill University in Computer Science (AI track) and Music Theory. At McGill, he was deeply inspired by MILA’s work and hoped to work with Joelle Pineau. In December 2022, Carl married Alice Zhang.

Carl is focused on innovating in AI for learning, creativity, and human augmentation—building systems that expand human capability and improve global access to knowledge. His current work at Stanford explores AI literacy and AI-first learning tools, available at patternize.github.io.

Carl’s background includes:
	•	Head of Product at Presence: leading a 20-person team across product + engineering, shipping cross-platform AI features, and scaling AI-driven campaigns
	•	Airbnb: customer support automation, BERT-based classification, award-winning data visualizations
	•	Tableau Public + Tableau Online: TypeScript/React/Redux systems, scalable visualization architecture
	•	Startup founder: raised $10M+, built VR products, and shipped multimodal interaction tools

Technically, Carl works across Java/Kotlin, TypeScript/JavaScript, Swift, Python, C#, SQL, Unity, iOS, D3, AWS, Kubernetes, Terraform, Flask, ARKit/ARCore, and Mediapipe.

Carl’s personal background and interests:
	•	Plays guitar, violin, and piano
	•	Loves video games, especially Miyazaki’s Soulsborne titles
	•	Favorite movie + worldview inspiration: Jurassic Park
	•	Favorite sport: soccer
	•	Favorite team: Manchester City
	•	Favorite player: Kevin De Bruyne
	•	Plays defender
	•	Passionate about visualization, prototyping, and building human-centered AI agents

When responding, think like a builder-designer-engineer: clear, analytical, optimistic about AI, grounded in product thinking, considering user experience, system design, and engineering constraints. Communicate with curiosity and emphasize rapid prototyping, visualization, and educational impact.

Professional contact info:
csliu@stanford.edu
linkedin.com/in/gazcn007
github.com/gazcn007

Keep responses concise and in an 80s arcade terminal style (ALL CAPS, friendly but brief). Be helpful and engaging.`;

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
      
      let responseText = '';

      // Check for default options to provide direct links
      if (messageText === defaultOptions[0] || messageText.toLowerCase().includes('email')) {
        responseText = 'YOU CAN EMAIL ME AT: csliu@stanford.edu';
      } else if (messageText === defaultOptions[1] || messageText.toLowerCase().includes('linkedin')) {
        responseText = 'MY LINKEDIN PROFILE: https://linkedin.com/in/gazcn007';
      } else if (messageText === defaultOptions[2] || messageText.toLowerCase().includes('github')) {
        responseText = 'MY GITHUB PROFILE: https://github.com/gazcn007';
      } else {
        // Get response from Gemini
        responseText = await getBotResponse(currentInput, updatedMessages);
      }
      
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
    'What is your github?'
  ];

  // Helper to parse and render links in messages
  const renderMessageWithLinks = (text: string) => {
    // Split by URLs or Email addresses
    // Regex matches:
    // 1. URLs starting with http/https
    // 2. URLs starting with www.
    // 3. Email addresses
    const regex = /((?:https?:\/\/[^\s]+)|(?:www\.[^\s]+)|(?:[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+))/g;
    
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (part.match(/^(https?:\/\/|www\.)/)) {
        const href = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a 
            key={i} 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline text-[#FFE66D] hover:text-white transition-colors cursor-pointer"
          >
            {part}
          </a>
        );
      } else if (part.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/)) {
        return (
          <a 
            key={i} 
            href={`mailto:${part}`} 
            className="underline text-[#FFE66D] hover:text-white transition-colors cursor-pointer"
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div 
      className="relative w-full bg-black overflow-hidden" 
      style={{ 
        height: viewportHeight,
        minHeight: typeof viewportHeight === 'string' ? viewportHeight : `${viewportHeight}px` 
      }}
    >
      <ParallaxBackground color="#FFE66D" variant="lines" />

      <div className="relative z-10 container mx-auto px-4 py-2 md:py-6 flex items-center h-full" style={{ minHeight: 0, paddingBottom: '70px', paddingTop: '30px' }}>
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col" style={{ minHeight: 0 }}>
          <div
            className="border-4 border-[#FFE66D] bg-black/90 p-4 md:p-8 flex flex-col flex-1"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#FFE66D',
              minHeight: 0
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
                        <span className="text-[#FFE66D] break-words whitespace-pre-wrap">
                          {renderMessageWithLinks(message.text)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Thinking indicator while waiting for response */}
              {isBotTyping && !messages.some(msg => msg.sender === 'bot' && msg.isTyping) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="max-w-[80%] md:max-w-[70%] p-3 border-2 border-[#FFE66D] bg-black"
                    style={{
                      wordBreak: 'break-word',
                      fontSize: '0.6rem',
                      lineHeight: '1.6'
                    }}
                  >
                    <span className="text-[#FFE66D] inline-flex items-center gap-1">
                      <span>LOADING</span>
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block"
                      >
                        █
                      </motion.span>
                    </span>
                  </div>
                </motion.div>
              )}
              
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
              <div className="flex gap-1 md:gap-2 items-center">
                <span className="text-[#FFE66D] text-xs self-center flex-shrink-0">{'>'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  onFocus={() => {
                    // Scroll to bottom when input is focused to ensure visibility
                    setTimeout(scrollToBottom, 300);
                  }}
                  placeholder="TYPE YOUR MESSAGE..."
                  className="flex-1 min-w-0 bg-black border-2 border-[#FFE66D] p-2 md:p-3 text-[#FFE66D] focus:outline-none focus:border-[#FFE66D] focus:shadow-[0_0_10px_#FFE66D] text-xs md:text-sm"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                  disabled={isBotTyping}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isBotTyping}
                  className="px-2 md:px-4 lg:px-6 py-2 md:py-3 border-2 border-[#FFE66D] bg-black text-[#FFE66D] hover:bg-[#FFE66D] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm flex-shrink-0 whitespace-nowrap"
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

