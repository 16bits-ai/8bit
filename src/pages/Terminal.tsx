import React, { useState, useRef, useEffect } from 'react';
import ParallaxBackground from '../components/ParallaxBackground';
import JourneyVisualization from '../components/JourneyVisualization';
import MarkdownDocumentContent from '../components/MarkdownDocumentContent';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, RotateCcw, X } from 'lucide-react';
import { findDocumentByPath } from '../data/documents';

// Project Logos
import NativePod from '../assets/projects/NativePod.png';
import OOTD from '../assets/projects/OOTD.png';
import patternizeLogo from '../assets/projects/Patternize.png';
import carlTechReviewsLogo from '../assets/projects/CarlTechReview.png';

const linkRegex =
  /((?:https?:\/\/[^\s]+)|(?:www\.[^\s]+)|(?:\/(?:documents|pdf)\/[a-zA-Z0-9/_.-]+)|(?:[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+))/gi;
const markdownLinkRegex =
  /\[([^\]]+)\]\(((?:https?:\/\/[^\s)]+)|(?:www\.[^\s)]+)|(?:\/(?:documents|pdf)\/[a-zA-Z0-9/_.-]+)|(?:[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+))\)/gi;
const terminalMessagesStorageKey = 'carlrocks-terminal-messages';

interface MessageLink {
  href: string;
  label: string;
  isExternal: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isTyping?: boolean;
  type?: 'text' | 'projects';
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'HELLO! I\'M CARL. ASK ME ANYTHING ABOUT ME!',
    sender: 'bot',
    isTyping: false
  }
];

const loadStoredMessages = () => {
  try {
    const storedMessages = window.localStorage.getItem(terminalMessagesStorageKey);
    if (!storedMessages) return initialMessages;

    const parsed = JSON.parse(storedMessages);
    if (!Array.isArray(parsed)) return initialMessages;

    const messages = parsed.filter((message): message is Message => (
      typeof message?.id === 'string' &&
      typeof message?.text === 'string' &&
      (message?.sender === 'user' || message?.sender === 'bot') &&
      (!message?.type || message.type === 'text' || message.type === 'projects')
    ));

    return messages.length
      ? messages.map((message) => ({
          ...message,
          isTyping: false,
        }))
      : initialMessages;
  } catch {
    return initialMessages;
  }
};

const formatLinkLabel = (href: string, label?: string) => {
  if (label?.trim()) return label.trim();
  if (href.startsWith('/pdf/')) return 'Open resume';
  if (href.startsWith('/documents/')) {
    const pathParts = href.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1] ?? 'document';
    return `Open ${slug.replace(/[-_]+/g, ' ')}`;
  }
  if (href.includes('@')) return 'Email Carl';
  return href.replace(/^https?:\/\//, '').replace(/^www\./, '');
};

const normalizeHref = (href: string) => {
  if (href.startsWith('www.')) return `https://${href}`;
  if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/.test(href)) return `mailto:${href}`;
  return href;
};

const isEmailHref = (href: string) => href.startsWith('mailto:') || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/.test(href);

const collectMessageLinks = (text: string) => {
  const links: MessageLink[] = [];
  const seen = new Set<string>();

  const addLink = (href: string, label?: string) => {
    const normalizedHref = normalizeHref(href);
    if (seen.has(normalizedHref)) return;
    seen.add(normalizedHref);
    links.push({
      href: normalizedHref,
      label: formatLinkLabel(href, label),
      isExternal: normalizedHref.startsWith('http'),
    });
  };

  text.replace(markdownLinkRegex, (_match, label: string, href: string) => {
    if (isEmailHref(href)) return '';
    addLink(href, label);
    return '';
  });

  text.replace(linkRegex, (href) => {
    if (isEmailHref(href)) return '';
    addLink(href);
    return '';
  });

  return links;
};

const Terminal: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(loadStoredMessages);
  const [inputValue, setInputValue] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [activeDocumentPath, setActiveDocumentPath] = useState<string | null>(null);
  const [isJourneyPaneOpen, setIsJourneyPaneOpen] = useState(false);
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
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storableMessages = messages.map((message) => ({ ...message, isTyping: false }));
    window.localStorage.setItem(terminalMessagesStorageKey, JSON.stringify(storableMessages));
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

  // Stream a bot response from /api/chat (SSE).
  const streamBotResponse = async (
    botMessageId: string,
    history: { role: 'user' | 'assistant'; content: string }[],
  ) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const appendDelta = (text: string) => {
      setMessages(prev =>
        prev.map(msg => (msg.id === botMessageId ? { ...msg, text: msg.text + text } : msg)),
      );
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);

        let eventName = 'message';
        let dataLine = '';
        for (const line of rawEvent.split('\n')) {
          if (line.startsWith('event: ')) eventName = line.slice(7);
          else if (line.startsWith('data: ')) dataLine += line.slice(6);
        }
        if (!dataLine) continue;

        try {
          const payload = JSON.parse(dataLine);
          if (eventName === 'delta' && typeof payload.text === 'string') {
            appendDelta(payload.text);
          } else if (eventName === 'error') {
            throw new Error(payload.message || 'stream error');
          }
        } catch (err) {
          if (eventName === 'error') throw err;
        }
      }
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

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    try {
      // Default-option shortcuts: instant canned responses, no API hit.
      let cannedText = '';
      let isProjectResponse = false;
      let shouldOpenJourneyPane = false;
      if (messageText === defaultOptions[0] || messageText.toLowerCase().includes('email')) {
        cannedText = 'YOU CAN EMAIL ME AT: csliu@stanford.edu';
      } else if (messageText === defaultOptions[1] || messageText.toLowerCase().includes('project')) {
        cannedText = 'HERE ARE MY CURRENT PROJECTS:';
        isProjectResponse = true;
      } else if (
        messageText === defaultOptions[2] ||
        /\b(places|travel|journey|visited|been)\b/i.test(messageText)
      ) {
        cannedText = 'HERE IS MY WORLD JOURNEY MAP';
        shouldOpenJourneyPane = true;
      } else if (/\b(resume|résumé|cv)\b/i.test(messageText)) {
        cannedText = 'MY RESUME: /pdf/CARL-CV.pdf';
      }

      const botMessageId = (Date.now() + 1).toString();

      if (cannedText) {
        await new Promise(resolve => setTimeout(resolve, 300));

        const botResponse: Message = {
          id: botMessageId,
          text: cannedText,
          sender: 'bot',
          isTyping: true,
          type: isProjectResponse ? 'projects' : 'text',
        };
        setMessages(prev => [...prev, botResponse]);
        if (shouldOpenJourneyPane) {
          if (window.matchMedia('(max-width: 767px)').matches) {
            window.location.href = '/documents/lifestyle/journey';
          } else {
            setActiveDocumentPath(null);
            setIsJourneyPaneOpen(true);
          }
        }
        setIsBotTyping(false);
        const typingDuration = isProjectResponse ? 500 : cannedText.length * 30 + 500;
        setTimeout(() => {
          setMessages(prev =>
            prev.map(msg => (msg.id === botMessageId ? { ...msg, isTyping: false } : msg))
          );
        }, typingDuration);
        return;
      }

      // Streaming response: insert empty bot message, then append deltas.
      const botResponse: Message = {
        id: botMessageId,
        text: '',
        sender: 'bot',
        isTyping: true,
        type: 'text',
      };
      setMessages(prev => [...prev, botResponse]);

      const history = [...messages, userMessage]
        .filter(m => m.type !== 'projects')
        .map(m => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text,
        }))
        .filter(m => m.content.length > 0);
      history.push({ role: 'user', content: currentInput });

      await streamBotResponse(botMessageId, history);

      setMessages(prev =>
        prev.map(msg => (msg.id === botMessageId ? { ...msg, isTyping: false } : msg))
      );
      setIsBotTyping(false);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 2).toString(),
        text: 'ERROR: FAILED TO GET RESPONSE. PLEASE TRY AGAIN.',
        sender: 'bot',
        isTyping: false,
        type: 'text'
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

  const handleClearConversation = () => {
    setMessages(initialMessages);
    setInputValue('');
    setIsConfirmingClear(false);
    window.localStorage.removeItem(terminalMessagesStorageKey);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleDocumentAction = (path: string) => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      window.location.href = path;
      return;
    }

    setActiveDocumentPath(path);
    setIsJourneyPaneOpen(false);
  };

  const handleJourneyAction = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      window.location.href = '/documents/lifestyle/journey';
      return;
    }

    setActiveDocumentPath(null);
    setIsJourneyPaneOpen(true);
  };

  // Check if it's the initial conversation (no user messages yet)
  const hasUserMessages = messages.some(msg => msg.sender === 'user');
  const defaultOptions = [
    'What is your email?',
    'What projects are you working on?',
    'What places have you been to?'
  ];

  const isJourneyMapMessage = (message: Message) =>
    message.sender === 'bot' && message.text.trim().toUpperCase() === 'HERE IS MY WORLD JOURNEY MAP';

  // Helper to parse and render links in messages
  const renderMessageWithLinks = (text: string) => {
    const parts = text.split(linkRegex);
    
    return parts.map((part, i) => {
      if (part.match(/^(https?:\/\/|www\.)/i)) {
        const href = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a 
            key={i} 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline text-[var(--accent)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            {part}
          </a>
        );
      } else if (part.match(/^\/(?:documents|pdf)\//i)) {
        return (
          <a
            key={i}
            href={part}
            className="underline text-[var(--accent)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            {part}
          </a>
        );
      } else if (part.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+$/i)) {
        return (
          <a 
            key={i} 
            href={`mailto:${part}`} 
            className="underline text-[var(--accent)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part.toUpperCase()}</span>;
    });
  };

  const renderLinkActions = (links: MessageLink[]) => {
    const recommendedLinks = links.slice(0, 3);
    if (!recommendedLinks.length) return null;

    return (
      <div className="mt-4 space-y-2">
        {recommendedLinks.map((link, index) => {
          const label = (
            <>
              <span className="mr-2">{index + 1}.</span>
              {link.label.toUpperCase()}
            </>
          );

          if (link.href.startsWith('/documents/') && findDocumentByPath(link.href.replace(/^\/documents\/?/, ''))) {
            return (
              <button
                key={link.href}
                type="button"
                onClick={() => handleDocumentAction(link.href)}
                className={`block w-full border-2 px-3 py-2 text-left text-[0.55rem] leading-5 transition-all md:text-xs ${
                  activeDocumentPath === link.href
                    ? 'border-[var(--ink)] bg-[var(--accent)] text-[var(--paper)]'
                    : 'border-[var(--accent)] bg-[var(--panel)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--paper)]'
                }`}
              >
                {label}
              </button>
            );
          }

          return (
            <a
              key={link.href}
              href={link.href}
              target={link.isExternal ? '_blank' : undefined}
              rel={link.isExternal ? 'noopener noreferrer' : undefined}
              className="block border-2 border-[var(--accent)] bg-[var(--panel)] px-3 py-2 text-[0.55rem] leading-5 text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-[var(--paper)] md:text-xs"
            >
              {label}
            </a>
          );
        })}
      </div>
    );
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'projects') {
      return (
        <div className="space-y-6 w-full">
          <div className="text-[var(--accent)] mb-4">HERE ARE MY CURRENT PROJECTS:</div>
          {[
            { id: 1, logo: patternizeLogo, title: 'Patternize.io', description: 'Helps people visualize Computer Science concepts', url: 'https://patternize.github.io/' },
            { id: 2, logo: carlTechReviewsLogo, title: 'Carl Tech Reviews', description: 'A blog about technology and software development', url: 'https://gazcn007.github.io/' },
            { id: 3, logo: NativePod, title: 'NativePod', description: 'Translate podcasts into other languages', url: 'https://nativepod.co/' },
            { id: 4, logo: OOTD, title: 'OOTD.ai', description: 'Your outfit Stylist that gives you fashion advice', url: 'https://apps.apple.com/us/app/ootd-ai/id6504292959' },
          ].map((project) => (
            <a
              key={project.id}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div
                className="border-2 border-[var(--accent)] bg-[var(--panel)] p-4 hover:bg-[var(--accent-soft)] transition-all cursor-pointer flex flex-col md:flex-row gap-4 items-center md:items-start"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  color: 'var(--accent)',
                  lineHeight: '1.6'
                }}
              >
                {project.logo && (
                  <img
                    src={project.logo}
                    alt={`${project.title} logo`}
                    className="h-12 w-auto pixelated flex-shrink-0"
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'var(--glow-drop)'
                    }}
                  />
                )}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-sm md:text-base mb-2 text-[var(--accent)] group-hover:text-[var(--ink)] transition-colors">
                    {project.title.toUpperCase()}
                  </h3>
                  <p className="text-[0.6rem] md:text-xs opacity-80 text-[var(--accent)]">
                    {project.description.toUpperCase()}
                  </p>
                </div>
              </div>
            </a>
          ))}
          <a
            href="https://github.com/gazcn007"
            target="_blank"
            rel="noopener noreferrer"
            className="block border-2 border-[var(--accent)] bg-[var(--panel)] p-3 text-[0.6rem] leading-5 text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-[var(--paper)] md:text-xs"
          >
            VISIT MY GITHUB FOR MORE INFO
          </a>
        </div>
      );
    }

    const messageLinks = message.sender === 'bot' ? collectMessageLinks(message.text) : [];
    const displayText = message.text;

    if (message.sender === 'bot' && message.isTyping) {
      return (
        <div className="text-[var(--accent)] break-words whitespace-pre-wrap">
          <span>
            {renderMessageWithLinks(displayText)}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
              className="ml-1 inline-block"
            >
              █
            </motion.span>
          </span>
          {renderLinkActions(messageLinks)}
        </div>
      );
    }

    return (
      <div className="text-[var(--accent)] break-words whitespace-pre-wrap">
        {renderMessageWithLinks(displayText)}
        {renderLinkActions(messageLinks)}
      </div>
    );
  };

  const activeDocument = activeDocumentPath
    ? findDocumentByPath(activeDocumentPath.replace(/^\/documents\/?/, ''))
    : null;
  const isSidePaneOpen = Boolean(activeDocument || isJourneyPaneOpen);

  return (
    <div 
      className="relative w-full bg-[var(--paper)] overflow-hidden"  
      style={{ 
        height: viewportHeight,
        minHeight: typeof viewportHeight === 'string' ? viewportHeight : `${viewportHeight}px` 
      }}
    >
      <ParallaxBackground color="var(--accent)" variant="lines" />

      <div
        className="relative z-10 mx-auto flex h-full w-full max-w-[1800px] items-center px-4 py-2 md:px-6 md:py-6"
        style={{ minHeight: 0, paddingBottom: '70px', paddingTop: '30px' }}
      >
        <div
          className="relative mx-auto h-full w-full"
          style={{ minHeight: 0 }}
        >
          <div
            className={`flex h-full w-full flex-col border-4 border-[var(--accent)] bg-[var(--panel)] p-4 transition-[left,width,max-width,transform] duration-500 ease-out md:absolute md:bottom-0 md:top-0 md:p-8 ${
              isSidePaneOpen
                ? 'md:left-0 md:w-[38%] md:max-w-[620px] md:translate-x-0'
                : 'md:left-1/2 md:w-full md:max-w-4xl md:-translate-x-1/2'
            }`}
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: 'var(--accent)',
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
                      role={isJourneyMapMessage(message) ? 'button' : undefined}
                      tabIndex={isJourneyMapMessage(message) ? 0 : undefined}
                      onClick={isJourneyMapMessage(message) ? handleJourneyAction : undefined}
                      onKeyDown={(event) => {
                        if (!isJourneyMapMessage(message)) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleJourneyAction();
                        }
                      }}
                      className={`max-w-[90%] md:max-w-[85%] p-3 border-2 text-left disabled:cursor-default ${
                        message.sender === 'user'
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                          : 'border-[var(--accent)] bg-[var(--panel)]'
                      } ${isJourneyMapMessage(message) ? 'cursor-pointer transition-colors hover:bg-[var(--accent-soft)] hover:shadow-[var(--glow-box)]' : ''}`}
                      style={{
                        wordBreak: 'break-word',
                        fontSize: '0.6rem',
                        lineHeight: '1.6',
                        fontFamily: '"Press Start 2P", cursive',
                        color: 'var(--accent)'
                      }}
                    >
                      {renderMessageContent(message)}
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
                    className="max-w-[80%] md:max-w-[70%] p-3 border-2 border-[var(--accent)] bg-[var(--panel)]"
                    style={{
                      wordBreak: 'break-word',
                      fontSize: '0.6rem',
                      lineHeight: '1.6'
                    }}
                  >
                    <span className="text-[var(--accent)] inline-flex items-center gap-1">
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
                    className="w-full text-left p-3 border-2 border-[var(--accent)] bg-[var(--panel)] hover:bg-[var(--accent-soft)] transition-all"
                    style={{
                      fontFamily: '"Press Start 2P", cursive',
                      fontSize: '0.5rem',
                      lineHeight: '1.6',
                      color: 'var(--accent)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-[var(--accent)] mr-2">{index + 1}.</span>
                    <span className="text-[var(--accent)]">{option.toUpperCase()}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t-2 border-[var(--accent)] pt-4">
              <div className="flex gap-1 md:gap-2 items-center">
                <span className="text-[var(--accent)] text-xs self-center flex-shrink-0">{'>'}</span>
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
                  className="flex-1 min-w-0 bg-[var(--panel)] border-2 border-[var(--accent)] p-2 md:p-3 text-[var(--accent)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--glow-box)] text-xs md:text-sm"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                  disabled={isBotTyping}
                  autoFocus
                />
                <button
                  type="button"
                  disabled={isBotTyping || !hasUserMessages}
                  onClick={() => setIsConfirmingClear(true)}
                  aria-label="Clear conversation history"
                  title="Clear conversation history"
                  className="px-2 md:px-3 py-2 md:py-3 border-2 border-[var(--accent)] bg-[var(--panel)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--paper)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm flex-shrink-0 whitespace-nowrap"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                >
                  <RotateCcw size={16} strokeWidth={2.5} />
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isBotTyping}
                  className="px-2 md:px-4 lg:px-6 py-2 md:py-3 border-2 border-[var(--accent)] bg-[var(--panel)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--paper)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm flex-shrink-0 whitespace-nowrap"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                >
                  SEND
                </button>
              </div>
            </form>
          </div>

          <AnimatePresence>
            {isSidePaneOpen && (
            <motion.aside
              initial={{ x: '110%' }}
              animate={{ x: 0 }}
              exit={{ x: '110%' }}
              transition={{ type: 'spring', stiffness: 180, damping: 28 }}
              className="hidden border-4 border-[var(--accent)] bg-[var(--panel)] text-[var(--accent)] shadow-[var(--glow-box)] md:absolute md:bottom-0 md:right-0 md:top-0 md:flex md:w-[calc(62%_-_1rem)] md:flex-col"
              style={{ minHeight: 0 }}
            >
              <div className="flex items-start justify-between gap-4 border-b-2 border-[var(--accent)] p-4">
                <div className="min-w-0">
                  {activeDocument && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {activeDocument.tags.slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          className="border border-[var(--accent)] px-2 py-1 text-[0.48rem]"
                          style={{ fontFamily: '"Press Start 2P", cursive' }}
                        >
                          {tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2
                    className="text-sm leading-6 md:text-base"
                    style={{ fontFamily: '"Press Start 2P", cursive' }}
                  >
                    {(activeDocument?.title ?? 'World Journey').toUpperCase()}
                  </h2>
                  <p className="mt-2 text-xs text-[var(--accent-dim)]">
                    {activeDocument?.date ?? 'PLACES, PHOTOS, AND LIFE TIMELINE'}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <a
                    href={activeDocumentPath ?? '/documents/lifestyle/journey'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open document in new tab"
                    title="Open document in new tab"
                    className="border-2 border-[var(--accent)] bg-[var(--panel)] p-2 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--paper)]"
                  >
                    <Maximize2 size={16} strokeWidth={2.5} />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDocumentPath(null);
                      setIsJourneyPaneOpen(false);
                    }}
                    aria-label="Close document pane"
                    title="Close document pane"
                    className="border-2 border-[var(--accent)] bg-[var(--panel)] p-2 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--paper)]"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 terminal-scrollbar" style={{ minHeight: 0 }}>
                {activeDocument ? (
                  <MarkdownDocumentContent markdown={activeDocument.content} compact />
                ) : (
                  <JourneyVisualization />
                )}
              </div>
            </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isConfirmingClear && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg border-4 border-[var(--accent)] bg-[var(--panel)] p-5 text-[var(--accent)] shadow-[var(--glow-box)] md:p-8"
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              style={{ fontFamily: '"Press Start 2P", cursive' }}
            >
              <h2 className="mb-4 text-sm md:text-base">CLEAR CONVERSATION?</h2>
              <p className="mb-6 text-[0.6rem] leading-6 md:text-xs">
                THIS WILL DELETE YOUR SAVED TERMINAL CHAT HISTORY ON THIS DEVICE.
              </p>
              <div className="flex flex-col gap-3 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="border-2 border-[var(--accent)] bg-[var(--panel)] px-4 py-3 text-xs text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleClearConversation}
                  className="border-2 border-[var(--accent)] bg-[var(--accent)] px-4 py-3 text-xs text-[var(--paper)] hover:bg-white"
                >
                  CLEAR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Terminal;

