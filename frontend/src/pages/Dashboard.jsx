import { useState, useEffect } from "react";
import Meeting from "./Meeting";
import "../css/Dashboard.css";

function Dashboard({ onLogout }) {
    const user = JSON.parse(localStorage.getItem("user"));

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [meetings, setMeetings] = useState([]);
    const [activeMeeting, setActiveMeeting] = useState(null);

    const fetchMeetings = async () => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/meetings", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                setMeetings(data.meetings);
            } else {
                console.log(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const startMeeting = async (meetingId) => {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:5000/api/meetings/${meetingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: "ongoing" }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Meeting started!");
                setActiveMeeting(data.meeting);
                fetchMeetings();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/meetings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description, date }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Meeting created successfully!");
                setTitle("");
                setDescription("");
                setDate("");
                fetchMeetings();
                console.log(data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    if (activeMeeting) {
        return (
            <div className="app-bg">
                <div className="page">
                    <Meeting
                        meeting={activeMeeting}
                        onBack={() => setActiveMeeting(null)}
                        onMeetingFinished={() => {
                            setActiveMeeting(null);
                            fetchMeetings();
                        }}
                    />
                </div>
            </div>
        );
    }

    const total = meetings.length;
    const scheduled = meetings.filter((m) => m.status === "scheduled").length;
    const ongoing = meetings.filter((m) => m.status === "ongoing").length;

    return (
        <div className="app-bg">
            <nav className="navbar">
                <div className="brand">
                    AI<span>-</span>MEET
                </div>

                <div className="nav-right">
                    <div className="user-info">
                        <div className="name">{user?.name}</div>
                        <div className="email">{user?.email}</div>
                    </div>
                    <button className="btn btn-ghost btn-danger" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="page">
                <header className="hero">
                    <div className="eyebrow">Real-time meeting assistant</div>
                    <h1>DASHBOARD</h1>
                    <div className="tagline">Connect · Create · Collaborate</div>
                </header>

                <div className="stats">
                    <div className="stat-card">
                        <div className="num">{total}</div>
                        <div className="label">Total Meetings</div>
                    </div>
                    <div className="stat-card">
                        <div className="num">{scheduled}</div>
                        <div className="label">Scheduled</div>
                    </div>
                    <div className="stat-card">
                        <div className="num">{ongoing}</div>
                        <div className="label">Ongoing</div>
                    </div>
                </div>

                <h3 className="section-title">Create Meeting</h3>

                <form className="glass" onSubmit={handleCreateMeeting}>
                    <div className="form-grid">
                        <div className="form-group full">
    <label>Title</label>
    <input
        className="input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
    />
</div>

<div className="form-group full">
    <label>Date</label>
    <input
        className="input"
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
    />
</div>

                        <div className="form-group full">
                            <label>Description</label>
                            <textarea
                                className="textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group full">
                            <div>
                                <button className="btn" type="submit">
                                    Create Meeting →
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <h3 className="section-title">My Meetings</h3>

                {meetings.length === 0 ? (
                    <p className="empty">No meetings found.</p>
                ) : (
                    <div className="meeting-grid">
                        {meetings.map((meeting) => (
                            <div className="meeting-card" key={meeting._id}>
                                <span className={`badge ${meeting.status}`}>
                                    {meeting.status}
                                </span>

                                <h4>{meeting.title}</h4>

                                <p className="desc">{meeting.description}</p>

                                <p className="date">
                                    {new Date(meeting.date).toLocaleString()}
                                </p>

                                {meeting.status === "scheduled" && (
                                    <button
                                        className="btn"
                                        onClick={() => startMeeting(meeting._id)}
                                    >
                                        Start Meeting
                                    </button>
                                )}

                                {meeting.status === "ongoing" && (
                                    <button
                                        className="btn"
                                        onClick={() => setActiveMeeting(meeting)}
                                    >
                                        Open Meeting
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;