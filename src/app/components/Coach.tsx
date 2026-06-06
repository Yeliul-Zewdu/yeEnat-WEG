import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

export function Coach() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Selam! I'm your YeEnat Weg AI wellness coach. How can I help you today?",
    },
    {
      role: "user",
      content: "Is fasting for Orthodox lent safe for my blood sugar?",
    },
    {
      role: "assistant",
      content: "That's a great question. During Tsome (fasting), you'll be eating a vegan diet. This can actually be very beneficial for blood sugar, provided you focus on high-fiber foods like Shiro, Miser (lentils), and Kik (split peas), while minimizing excessive white bread or pasta. Would you like a fasting-friendly meal plan?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    
    // Mock response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I've noted that! I'm generating some personalized recommendations for you based on our conversation.",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="bg-primary px-6 pt-12 pb-6 text-primary-foreground shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">YeEnat Weg AI</h1>
            <p className="text-xs text-primary-foreground/70">Always here for you</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-auto ${
              msg.role === "user" ? "bg-secondary text-white" : "bg-primary/10 text-primary"
            }`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user" 
                ? "bg-primary text-primary-foreground rounded-br-none" 
                : "bg-card border border-border text-foreground rounded-bl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-background border-t border-border mt-auto">
        <div className="flex items-center gap-2 bg-input-background border border-border rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your coach..."
            className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-foreground"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
