import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../CSS/Register.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUser,
    faLock,
    faKey,
    faCircleChevronLeft,
} from "@fortawesome/free-solid-svg-icons";

const hostIp = process.env.REACT_APP_HOST_IP;

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const navigate = useNavigate();

    function containsSpecialCharacters(inputString) {
        // Define a regular expression to match special characters
        const specialCharsRegex = /[@=\[\];]/;

        // Check if the input string contains any special characters
        return specialCharsRegex.test(inputString);
    }

    const handleRegister = (event) => {
        event.preventDefault();
        if (password !== rePassword) return alert("Passwords doesn't match!");
        if (containsSpecialCharacters(username))
            return alert(`Restricted Characters! Not Allowed.`);
        fetch(hostIp + "/createAccount", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message !== "Account Created.")
                    return alert(data.message);

                navigate("/login");
                alert("Account Created Successfully! Now Please Login.");
            });
    };

    return (
        <form id="Register-form" onSubmit={handleRegister}>
            <h1 className="Form-title">Your Opinion</h1>
            <h2 id="Register-sub-title">Create Your Account</h2>

            <div className="Form-input-container">
                <div className="Form-input-icon-container">
                    <FontAwesomeIcon
                        icon={faUser}
                        size="xl"
                        style={{
                            color: "var(--secondary-link-color)",
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
                            color: "var(--secondary-link-color)",
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

            <div className="Form-input-container">
                <div className="Form-input-icon-container">
                    <FontAwesomeIcon
                        icon={faKey}
                        size="xl"
                        style={{
                            color: "var(--secondary-link-color)",
                            transition: "var(--transition-time) ease-in-out",
                        }}
                    />
                </div>

                <input
                    type="password"
                    value={rePassword}
                    onChange={(event) => setRePassword(event.target.value)}
                    minLength="8"
                    maxLength="16"
                    className="Form-password-input"
                    id="retype-password-input"
                    placeholder="Retype Password"
                    autoComplete="current-password"
                    required
                />
            </div>

            <input value="Create" id="Register-submit" type="submit" />

            <Link to="/login" id="Register-link">
                <FontAwesomeIcon icon={faCircleChevronLeft} />
                Back To Login
            </Link>
        </form>
    );
}
