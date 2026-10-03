import { useEffect, useRef, useState } from "react";
import "../css/Meeting.css";

function Meeting({ meeting, onBack, onMeetingFinished }) {

    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState("");
    const [transcript, setTranscript] = useState("");
    const [speakerTranscript, setSpeakerTranscript] = useState([]);
    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        return () => {
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        };
    }, [audioURL]);

    const startRecording = async () => {
        try {
            const socket = new WebSocket("ws://localhost:5000");

            socket.onopen = () => {
                console.log("WebSocket connected");
            };

            socket.onmessage = async (event) => {
                const data = JSON.parse(event.data);

                console.log("Transcript received:", data.transcript);
                console.log("Speaker transcript received:", data.speaker_transcript);

                setTranscript(data.transcript);
                setSpeakerTranscript(data.speaker_transcript || []);
                try {
                    await fetch(
                        `http://localhost:5000/api/meetings/${meeting._id}/transcript`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                transcript: data.transcript,
                                speakerTranscript: data.speaker_transcript || []
                            })
                        }
                    );

                    console.log("Transcript saved to MongoDB");

                } catch (error) {
                    console.error("Failed to save transcript:", error);
                }
            };

            socket.onclose = () => {
                console.log("WebSocket disconnected");
            };

            socketRef.current = socket;
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.start(1000);

            mediaRecorderRef.current = recorder;

            setIsRecording(true);

            console.log("Recording started");

        } catch (error) {
            console.error("Microphone access failed:", error);
            alert("Please allow microphone access.");
        }
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;

        if (recorder && recorder.state !== "inactive") {

            recorder.onstop = () => {

                // Combine all recorded chunks
                const audioBlob = new Blob(
                    audioChunksRef.current,
                    {
                        type: "audio/webm"
                    }
                );

                console.log("Final audio:", audioBlob);
                console.log("Final audio size:", audioBlob.size);

                // Send complete audio to Node.js
                if (
                    socketRef.current &&
                    socketRef.current.readyState === WebSocket.OPEN
                ) {
                    socketRef.current.send(audioBlob);

                    console.log("Complete audio sent to Node.js");
                }

                // Create audio URL for playback
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);

                // Stop WebSocket

            };

            recorder.stop();

            // Stop microphone
            recorder.stream.getTracks().forEach((track) => {
                track.stop();
            });

            mediaRecorderRef.current = null;

            setIsRecording(false);

            console.log("Recording stopped");
            console.log("Microphone stopped");
        }
    };

    const handleStopMeeting = async () => {

        // If recording is still active, stop it first
        if (mediaRecorderRef.current) {
            stopRecording();
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:5000/api/meetings/${meeting._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: "completed"
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Meeting completed!");
                onMeetingFinished();
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <div>

            <header className="mt-header">
                <button className="mt-back" onClick={onBack}>
                    ← Back to Dashboard
                </button>

                <div>
                    <span className={`badge ${meeting.status}`}>
                        {meeting.status}
                    </span>
                </div>

                <h1 className="mt-title">{meeting.title}</h1>

                <p className="mt-desc">{meeting.description}</p>
            </header>

            <h3 className="section-title">Meeting in Progress</h3>

            <div className="glass mt-record">
                <div className={`mt-status ${isRecording ? "live" : ""}`}>
                    <span className="mt-dot"></span>
                    {isRecording ? "Recording live" : "Not recording"}
                </div>

                {!isRecording ? (
                    <button className="btn mt-rec-btn" onClick={startRecording}>
                        Start<br />Rec
                    </button>
                ) : (
                    <button className="btn mt-rec-btn stop" onClick={stopRecording}>
                        Stop<br />Rec
                    </button>
                )}

                <p className="mt-hint">
                    {isRecording
                        ? "Speak clearly. Press stop when you are done."
                        : "Press start to begin capturing audio."}
                </p>
            </div>

            <h3 className="section-title">Transcript</h3>

            <div className="glass">
                {transcript ? (
                    <p className="mt-transcript">{transcript}</p>
                ) : (
                    <div className="mt-empty">
                        Transcript will appear here after you stop recording.
                    </div>
                )}
            </div>

            <h3 className="section-title">Speaker Transcript</h3>

            <div className="glass">
                {speakerTranscript.length === 0 ? (
                    <div className="mt-empty">
                        No speaker data yet.
                    </div>
                ) : (
                    <div className="mt-speakers">
                        {speakerTranscript.map((item, index) => (
                            <div className="mt-speaker" key={index}>
                                <span className="mt-speaker-name">{item.speaker}</span>
                                <span className="mt-speaker-text">{item.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {audioURL && (
                <>
                    <h3 className="section-title">Recorded Audio</h3>

                    <div className="glass">
                        <audio className="mt-audio" controls src={audioURL}></audio>
                    </div>
                </>
            )}

            <div className="mt-actions">
                <button className="btn btn-ghost btn-danger" onClick={handleStopMeeting}>
                    Stop Meeting
                </button>

                <button className="btn btn-ghost" onClick={onBack}>
                    Back to Dashboard
                </button>
            </div>

        </div>
    );
}

export default Meeting;