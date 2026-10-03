const express = require("express");
const axios = require("axios");
const Meeting = require("../models/Meeting");

const router = express.Router();


// Test Node.js → FastAPI
router.get("/test", async (req, res) => {
    try {
        const response = await axios.get(
            "http://127.0.0.1:8000/"
        );

        res.json({
            message: "Node.js connected to FastAPI",
            aiResponse: response.data
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Failed to connect to AI service"
        });
    }
});


// Node.js → Ollama
router.post("/generate", async (req, res) => {
    try {
        const { meetingId, transcript } = req.body;

        if (!meetingId || !transcript) {
            return res.status(400).json({
                message: "Meeting ID and transcript are required"
            });
        }

        const prompt = `
Analyze the following meeting transcript.

Return the result in exactly this JSON format:

{
    "summary": "Brief summary of the meeting",
    "actionItems": [
        "Action item 1",
        "Action item 2"
    ],
    "decisions": [
        "Decision 1",
        "Decision 2"
    ]
}

Meeting transcript:
${transcript}
`;

        const response = await axios.post(
            "http://localhost:11434/api/generate",
            {
                model: "llama3.2:3b",
                prompt: prompt,
                stream: false,
                format: "json"
            }
        );

        const result = JSON.parse(response.data.response);

        // Save AI results to MongoDB
        const meeting = await Meeting.findByIdAndUpdate(
            meetingId,
            {
                summary: result.summary,
                actionItems: result.actionItems,
                decisions: result.decisions
            },
            {
                returnDocument: "after"
            }
        );

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        res.json({
            message: "AI results generated and saved successfully",
            summary: result.summary,
            actionItems: result.actionItems,
            decisions: result.decisions
        });

    } catch (error) {
        console.error("AI generation error:", error.message);

        res.status(500).json({
            message: "Failed to generate and save AI results"
        });
    }
});


module.exports = router;