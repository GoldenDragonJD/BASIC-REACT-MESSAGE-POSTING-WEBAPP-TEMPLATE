import React, { useState, useEffect } from "react";
import "../CSS/Login.css";
import { Link, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faLock,
    faCircleChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const hostIp = process.env.REACT_APP_HOST_IP;

export default function LoginForm() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (event) => {
        event.preventDefault();
        fetch(hostIp + "/login", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        }).then((response) =>
            response.json().then((newData) => {
                if (newData.message !== "Login Successful")
                    return alert(newData.message);

                document.cookie = "username=" + newData.username;
                document.cookie = "token=" + newData.token;
                navigate("/home");
            })
        );
    };

    useEffect(() => {
        // if (document.cookie !== "") navigate("/home");
    }, []);

    return (
        <form onSubmit={handleLogin} id="Login-form">
            <h1 className="Form-title">Your Opinion</h1>

            <div className="Form-input-container">
                <div className="Form-input-icon-container">
                    <FontAwesomeIcon
                        icon={faUser}
                        size="xl"
                        style={{
                            color: "var(--link-color)",
                            transition: "var(--transition-time) ease-in-out",
                        }}
                    />
                </div>

                <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    minLength="1"
                    maxLength="16"
                    className="Form-username-input"
                    placeholder="Username"
                    autoComplete="username"
                    required
                />
            </div>

            <div className="Form-input-container">
                <div className="Form-input-icon-container">
                    <FontAwesomeIcon
                        icon={faLock}
                        size="xl"
                        style={{
                            color: "var(--link-color)",
                            transition: "var(--transition-time) ease-in-out",
                        }}
                    />
                </div>

                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength="8"
                    maxLength="16"
                    className="Form-password-input"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                />
            </div>

            <input type="submit" value="Login" id="Login-submit" />

            <div id="Login-line-container">
                <div className="Login-line" />
                <h2>or</h2>
                <div className="Login-line" />
            </div>

            <Link to="/register" id="Login-link">
                REGISTER ACCOUNT
                <FontAwesomeIcon icon={faCircleChevronRight} size="xl" />
            </Link>
        </form>
    );
}
