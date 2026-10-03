const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const WebSocket = require("ws");
const axios = require("axios");
const FormData = require("form-data");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const aiRoutes = require("./routes/aiRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "AI_meet"
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
    console.log("WebSocket client connected");

    socket.on("message", async (data) => {
    console.log("MESSAGE RECEIVED");
    console.log("Data size:", data.length);

    try {
        const form = new FormData();

        form.append("file", data, {
            filename: "audio.webm",
            contentType: "audio/webm"
        });

        const response = await axios.post(
            "http://127.0.0.1:8000/audio",
            form,
            {
                headers: form.getHeaders()
            }
        );

        
        console.log("FastAPI response:", response.data);

 socket.send(
                JSON.stringify({
                    type: "transcript",
                    transcript: response.data.transcript,
                    speaker_transcript: response.data.speaker_transcript
                })
            );

    } catch (error) {
        console.error(
            "Failed to send audio to FastAPI:",
            error.message
        );
    }
});

    socket.on("close", () => {
        console.log("WebSocket client disconnected");
    });
});