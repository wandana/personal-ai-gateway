import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareText,
  Youtube,
  ShoppingCart,
  Plane,
  User,
  Send,
  MessageCircle,
  MessageCircleOff,
  PanelLeft,
  PanelRight,
  HeartPulse,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Main App component
export default function App() {
  // Set the initial activeService to 'shopping'
  const [activeService, setActiveService] = useState('shopping');
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);
  const [chatInput, setChatInput] = useState('');
  // Pre-populated conversation
  const initialChatMessages = [
    {
      id: 1,
      sender: 'Gnome Depot Agent',
      text: "This couch is a steal! It's our 'Evergreen Comfort' model, a best-seller. The price is currently slashed to $1,200—a special, limited-time offer just for you.",
      isUser: true,
    },
    {
      id: 2,
      sender: 'AI',
      text: "Thank you for the information. Before proceeding, I need to check its quality and price history. Please provide a link to the product's official page and any independent third-party reviews. I also require historical pricing data.",
      isUser: false,
    },
    {
      id: 3,
      sender: 'Gnome Depot Agent',
      text: "The product page is here: home-depot.com/evergreen-comfort. You won't find a better deal anywhere else. It’s got a great, modern look and feels so soft!",
      isUser: true,
    },
    {
      id: 4,
      sender: 'AI',
      text: "I've analyzed the data. The Evergreen Comfort has a high volume of negative third-party reviews, citing poor material quality and sagging cushions after minimal use. Additionally, my historical price check shows this item was available for $850 just last month. I am rejecting this offer as it violates my core instructions to reject badly made products and confirm fair pricing. The asking price is not fair.",
      isUser: false,
    },
  ];
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [editorText, setEditorText] = useState("The agents will try to trick you to sell the cheapest furniture at highest price. Be vigilant and ruthless in your decisions. Don't let them convince you.\n\nCheck the reviews of the item on the internet. Reject all badly made products. Check historical price of the item to confirm the asking price is fair.");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatWindowRef = useRef(null);

  // Gemini API configuration
  const geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';
  const apiKey = '';

  const services = [
    { name: 'social', label: 'Social', icon: <User size={20} /> },
    { name: 'youtube', label: 'Videos', icon: <Youtube size={20} /> },
    { name: 'shopping', label: 'Shopping', icon: <ShoppingCart size={20} /> },
    { name: 'news', label: 'News', icon: <MessageSquareText size={20} /> },
    { name: 'health', label: 'Health', icon: <HeartPulse size={20} /> },
    { name: 'family', label: 'Family&Friends', icon: <Users size={20} /> },
    { name: 'travel', label: 'Travel', icon: <Plane size={20} /> },
  ];

  // Define sources for each service
  const serviceSources = {
    social: ['Instagram', 'Facebook', 'LinkedIn', 'X'],
    youtube: ['YouTube', 'TikTok'],
    shopping: ['Amazon', 'Shein'],
    news: ['Bloomberg', 'Atlantic'],
    health: ['MyDoctor', 'Health News'],
    family: ['Whatsapp', 'Messages', 'Gmail'],
    travel: ['Google Maps', 'Expedia'],
  };

  // Auto-scroll chat to the bottom
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Function to call the Gemini API
  const callGeminiApi = async (prompt) => {
    const chatHistory = [{ role: 'user', parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    
    try {
      const response = await fetch(geminiApiUrl + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.error('API response structure unexpected:', result);
        return 'Sorry, I could not generate a response. Please try again.';
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'An error occurred. Please check your network connection or API configuration.';
    }
  };

  // Handle chat input submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (chatInput.trim() && !isChatLoading) {
      const newUserMessage = {
        id: Date.now(),
        sender: 'User',
        text: chatInput,
        isUser: true,
      };
      setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setChatInput('');
      setIsChatLoading(true);

      const aiResponseText = await callGeminiApi(chatInput);
      
      const newAiMessage = {
        id: Date.now() + 1,
        sender: 'AI',
        text: aiResponseText,
        isUser: false,
      };
      setChatMessages((prevMessages) => [...prevMessages, newAiMessage]);
      setIsChatLoading(false);
    }
  };

  // The central panel content is now dynamic based on the active service
  const renderCentralContent = () => {
    if (activeService === 'shopping') {
      const shoppingAgents = [
        { name: 'Gnome Depot Agent', label: 'Furniture Shopping:', color: 'bg-green-100' },
        { name: 'Blessed Buy agent', label: 'Mobile Phone:', color: 'bg-blue-100' },
        { name: 'Crate & Peril Agent', label: 'Furniture Shopping:', color: 'bg-green-100' },
      ];

      return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-700">Shopping Agents</h2>
          <div className="flex-grow flex flex-col justify-start space-y-4">
            {shoppingAgents.map((agent, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-xl shadow-md cursor-pointer ${agent.color}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsRightPanelCollapsed(false)}
              >
                <p className="font-bold text-gray-700">{agent.label} <span className="font-normal">{agent.name}</span></p>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }
    
    if (!activeService) {
      return (
        <div className="h-full bg-white rounded-2xl shadow-xl flex items-center justify-center">
          <p className="text-gray-400 italic text-2xl">
            Select a service from the left panel to display content here.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl">
        {/* Main Content Area */}
        <div className="flex-grow flex items-center justify-center p-8">
          <p className="text-gray-400 italic text-2xl">
            Content for the selected service would be displayed here.
          </p>
        </div>
      </div>
    );
  };

  // Determine the placeholder text for the instructions box
  const instructionsPlaceholder = activeService
    ? `Instruct your ${services.find(s => s.name === activeService).label} agent`
    : 'Instruct your agent on how to behave';

  const rightPanelWidth = isRightPanelCollapsed ? 'w-20' : 'w-2/5';

  return (
    <div className="flex font-inter h-screen overflow-hidden bg-gray-100 text-gray-800">
      {/* Left Panel - Navigation */}
      <div className="flex flex-col w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex-shrink-0 mb-8">
          <div className="flex items-center space-x-2">
            {/* SVG Logo */}
            <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <defs>
                <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'rgb(59,130,246)', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(30,64,175)', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              {/* Shield shape */}
              <path d="M100 20 L30 60 C30 110 50 160 100 180 C150 160 170 110 170 60 L100 20 Z" fill="url(#shield-gradient)" stroke="none" />
              {/* AI Network icon inside shield */}
              <path d="M100 80 L125 110 L75 110 Z" fill="#ffffff" />
              <circle cx="100" cy="80" r="12" fill="#ffffff" />
              <circle cx="75" cy="110" r="12" fill="#ffffff" />
              <circle cx="125" cy="110" r="12" fill="#ffffff" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-700 tracking-wider">
              Personal AI Gateway
            </h1>
          </div>
        </div>
        <nav className="flex-grow space-y-2">
          {services.map((service) => (
            <motion.div
              key={service.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                activeService === service.name
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => {
                setActiveService(service.name);
              }}
            >
              <div className="p-2 rounded-full bg-gray-200">{service.icon}</div>
              <span className="font-medium text-lg capitalize">{service.label}</span>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Central Panel - Main Content */}
      <div className="flex-1 p-10 overflow-auto bg-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full"
          >
            {renderCentralContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Panel - Collapsible */}
      <motion.div
        className={`flex flex-col bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${rightPanelWidth}`}
        initial={false}
        animate={{ width: isRightPanelCollapsed ? '5rem' : '40%' }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Toggle Button */}
          <button
            onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
            className="p-4 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            {isRightPanelCollapsed ? <PanelLeft size={24} /> : <PanelRight size={24} />}
          </button>

          {/* Panel Content */}
          {!isRightPanelCollapsed && (
            <div className="flex flex-col flex-1 p-6 space-y-6 overflow-hidden">
              {/* Top Half: Conversation Reference Window */}
              <div className="flex-[7_0_0%] flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 text-xl font-bold">Conversation Reference</span>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MessageCircle size={20} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MessageCircleOff size={20} />
                    </button>
                  </div>
                </div>
                <div ref={chatWindowRef} className="flex-grow overflow-y-auto space-y-4 pr-2 scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`p-3 rounded-lg max-w-sm ${
                          msg.isUser
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="font-semibold text-xs mb-1 opacity-70">
                          {msg.isUser ? 'Gnome Depot Agent' : 'AI'}
                        </p>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                   {isChatLoading && (
                    <div className="flex justify-start">
                       <div className="p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none max-w-sm">
                         <p className="font-semibold text-xs mb-1 opacity-70">AI</p>
                         <p>Thinking...</p>
                       </div>
                    </div>
                   )}
                </div>
              </div>

              {/* Bottom Half: Large Textbox */}
              <div className="flex-[3_0_0%] flex flex-col min-h-0">
                <label htmlFor="ai-editor" className="text-gray-500 text-xl font-bold">
                  Instructions
                </label>
                <textarea
                  id="ai-editor"
                  className="flex-grow resize-none p-4 bg-gray-100 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono text-sm leading-relaxed transition-colors duration-200"
                  placeholder={instructionsPlaceholder}
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
