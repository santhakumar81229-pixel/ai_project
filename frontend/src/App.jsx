
import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [showRegister, setShowRegister] = useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsLoggedIn(false);
    };

    const handleRegister = () => {
        setShowRegister(true);
    };

    const handleBackToLogin = () => {
        setShowRegister(false);
    };

    if (isLoggedIn) {
        return (
            <Dashboard
                onLogout={handleLogout}
            />
        );
    }

    if (showRegister) {
        return (
            <Register
                onBackToLogin={handleBackToLogin}
            />
        );
    }

    return (
        <Login
            onLogin={handleLogin}
            onRegister={handleRegister}
        />
    );
}

export default App;
