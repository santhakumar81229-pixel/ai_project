const express = require("express");
const Meeting = require("../models/Meeting");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, date } = req.body;

        const meeting = await Meeting.create({
            title,
            description,
            date,
            createdBy: req.userId
        });

        res.status(201).json({
            message: "Meeting created successfully",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create meeting",
            error: error.message
        });
    }
});


router.get("/", authMiddleware, async (req, res) => {
    try {
        const meetings = await Meeting.find({
            createdBy: req.userId
        }).sort({ date: 1 });

        res.status(200).json({
            meetings
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch meetings",
            error: error.message
        });
    }
});


router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        const meeting = await Meeting.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.userId
            },
            {
                status: status
            },
            {
                new: true
            }
        );

        if (!meeting) {
            return res.status(404).json({
                message: "Meeting not found"
            });
        }

        res.status(200).json({
            message: "Meeting status updated",
            meeting
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update meeting",
            error: error.message
        });
    }
});


router.put("/:id/transcript", authMiddleware, async (req, res) => {
    try {
        const { transcript, speakerTranscript } = req.body;

        const meeting = await Meeting.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.userId
            },
            {
                transcript,
                speakerTranscript
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
            message: "Transcript saved successfully",
            meeting
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to save transcript"
        });
    }
});


router.put("/:id/ai-results", authMiddleware, async (req, res) => {
    try {
        const {
            summary,
            actionItems,
            decisions
        } = req.body;

        const meeting = await Meeting.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.userId
            },
            {
                summary,
                actionItems,
                decisions
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
            message: "AI results saved successfully",
            meeting
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to save AI results"
        });
    }
});


module.exports = router;