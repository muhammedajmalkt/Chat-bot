import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:9001");

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on("reply", (data) => {
      setMessages((prev) => [...prev, { from: "Gemini", text: data }]);
      setLoading(false);
    });

    return () => socket.off("reply");
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "You", text: input }]);
    socket.emit("message", input);
    setInput("");
    setLoading(true);
  };
console.log(messages);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 text-purple-600">Gemini Chatbot</h1>
      <div className="bg-white w-full max-w-xl p-4 rounded shadow-md flex-1 overflow-auto mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.from === "You" ? "text-right" : "text-left"}`}>
            <strong>{msg.from}:</strong> {msg.text}
          </div>
        ))}
        {loading && <p className="text-gray-400">Gemini is typing...</p>}
      </div>
      <div className="w-full max-w-xl flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything..."
        />
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
