import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Bot, User } from "lucide-react";

const commands = [
  { command: "/createcourse", description: "Generate a new AI-powered course" },
  // Add more commands if needed
];

export default function Chatbot() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setShowSuggestions(false);

    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, session }),
    });

    const data = await res.json();
    const botMsg = { role: "bot", content: data.reply };
    setMessages((prev) => [...prev, botMsg]);
    setInput("");
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    // Detect /command at any word boundary
    const hasCommand = /\B\/\w*/.test(input);
    setShowSuggestions(hasCommand);
  }, [input]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded mb-3 text-sm shadow-sm">
        💡 Tip: You can use commands like{" "}
        <code className="bg-yellow-200 px-1 rounded">/createcourse</code> to
        generate new courses using AI.
      </div>

      <div
        ref={containerRef}
        className="border rounded-lg p-4 h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] overflow-y-auto bg-white shadow-md mb-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex mb-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "bot" && (
              <Bot className="text-green-500 mr-2 mt-1" size={20} />
            )}
            <div
              className={`px-4 py-2 rounded-xl max-w-[70%] break-words ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <User className="text-blue-500 ml-2 mt-1" size={20} />
            )}
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="flex mt-2 space-x-2">
          <textarea
            className="border p-3 rounded-md flex-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message or try /createcourse..."
            rows={2}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? "Thinking..." : "Send"}
          </button>
        </div>

        {showSuggestions && (
          <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded shadow-md z-10">
            {commands.map((cmd, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  // Replace any current /command in the text with the selected one
                  const newText = input.replace(/\B\/\w*/, cmd.command);
                  setInput(newText);
                  setShowSuggestions(false);
                }}
              >
                <span className="font-medium">{cmd.command}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {cmd.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
