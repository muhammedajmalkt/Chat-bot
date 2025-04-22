import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("message", async (message) => {
    try {
      const chat = model.startChat({ history: [] });
      const result = await chat.sendMessage(message);
      let text = result.response.text();
       text = text 
       .replace(/\*\*(.*?)\*\*/g, "$1") // remove **bold**
       .replace(/\*(.*?)\*/g, "$1")     // remove *italic*
       .replace(/^- /gm, "")            // remove bullet dashes at start of line
       .replace(/^\s*[\*\-]\s?/gm, "")  // remove leading bullets like *, -
      //  .replace(/\n{2,}/g, "\n\n");     // reduce multiple newlines
      .replace(/\*\*.*?\*\*/g, ""); // Removes bolded markdown headings

      socket.emit("reply", text);
    } catch (err) {
      console.error("Gemini Error:", err);
      socket.emit("reply", "❌ Error getting response from Gemini.");
    }
  });

  socket.on("disconnect", () => {
    console.log("🚫 User disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Gemini Chatbot Backend Running!");
});

server.listen(9001 , () => console.log("✅ Server running on http://localhost:9001"));
