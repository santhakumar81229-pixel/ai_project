const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            default: ""
        },

        date: {
            type: Date,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["scheduled", "ongoing", "completed"],
            default: "scheduled"
        },

        transcript: {
            type: String,
            default: ""
        },

        speakerTranscript: [
            {
                speaker: String,
                start: Number,
                end: Number,
                text: String
            }
        ],

        summary: {
            type: String,
            default: ""
        },

        actionItems: [
            {
                type: String
            }
        ],

        decisions: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Meeting", meetingSchema);