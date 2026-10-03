import { useState } from "react";
import "../css/Login.css";

function Login({ onLogin, onRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                alert("Login successful!");
                onLogin();
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
                        Login
                    </div>

                    <p className="auth-sub">
                        Sign in to continue to your dashboard
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleLogin}
                >
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
                        Login →
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <button
                            type="button"
                            className="auth-link"
                            onClick={onRegister}
                        >
                            Register
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Login;