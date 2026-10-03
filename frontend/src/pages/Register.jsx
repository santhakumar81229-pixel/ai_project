
import { useState } from "react";
import "../css/Login.css";

function Register({ onBackToLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful!");

                // Go back to login
                onBackToLogin();
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card">

                <div className="auth-header">
                    <h1 className="auth-brand">
                        AI<span>-</span>MEET
                    </h1>

                    <div className="auth-eyebrow">
                        Register
                    </div>

                    <p className="auth-sub">
                        Create your AI-MEET account
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleRegister}
                >
                    <div className="auth-field">
                        <label>Name</label>

                        <input
                            className="auth-input"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Email</label>

                        <input
                            className="auth-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>

                        <input
                            className="auth-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <button
                        className="auth-btn"
                        type="submit"
                    >
                        Create Account →
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <button
                            type="button"
                            className="auth-link"
                            onClick={onBackToLogin}
                        >
                            Login
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Register;

