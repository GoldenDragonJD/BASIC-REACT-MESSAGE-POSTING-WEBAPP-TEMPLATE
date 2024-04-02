import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";

import Login from "./Components/Login";
import { ErrorPage } from "./Components/ErrorPage";
import Register from "./Components/Register";
import Home from "./Components/Home";
import CreatePost from "./Components/CreatePost";
import Comment from "./Components/Comment";
import Profile from "./Components/Profile";

import "./CSS/Colors.css";
import "./CSS/Index.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

function SwitchMode() {
    const [mode, setMode] = useState(localStorage.getItem("mode") || "dark");

    async function switchToLightMode() {
        document.documentElement.style.setProperty(
            "--background-color",
            "var(--background-color-light)"
        );
        document.documentElement.style.setProperty(
            "--primary-text-color",
            "var(--primary-text-color-light)"
        );
        document.documentElement.style.setProperty(
            "--link-color",
            "var(--link-color-light)"
        );
        document.documentElement.style.setProperty(
            "--error-color",
            "var(--error-color-light)"
        );
        document.documentElement.style.setProperty(
            "--link-hover-color",
            "var(--link-hover-color-light)"
        );
        document.documentElement.style.setProperty(
            "--secondary-text-color",
            "var(--secondary-text-color-light)"
        );
        document.documentElement.style.setProperty(
            "--secondary-link-color",
            "var(--secondary-link-color-light)"
        );
        document.documentElement.style.setProperty(
            "--link-secondary-hover-color",
            "var(--link-secondary-hover-color-light)"
        );
        document.documentElement.style.setProperty(
            "--link-text-color",
            "var(--link-text-color-light)"
        );
        document.documentElement.style.setProperty(
            "--input-background-color",
            "var(--input-background-color-light)"
        );
        document.documentElement.style.setProperty(
            "--input-text-color",
            "var(--input-text-color-light)"
        );
        document.documentElement.style.setProperty(
            "--mode-switch-color",
            "var(--dark-mode-background-color)"
        );
        document.documentElement.style.setProperty(
            "--mode-switch-color-hover",
            "var(--light-mode-background-color-hover)"
        );
        document.documentElement.style.setProperty(
            "--main-background-color",
            "var(--main-background-color-light)"
        );
    }

    async function switchToDarkMode() {
        document.documentElement.style.setProperty(
            "--background-color",
            "var(--background-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--primary-text-color",
            "var(--primary-text-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--link-color",
            "var(--link-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--error-color",
            "var(--error-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--link-hover-color",
            "var(--link-hover-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--secondary-text-color",
            "var(--secondary-text-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--secondary-link-color",
            "var(--secondary-link-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--link-secondary-hover-color",
            "var(--link-secondary-hover-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--link-text-color",
            "var(--link-text-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--input-background-color",
            "var(--input-background-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--input-text-color",
            "var(--input-text-color-dark)"
        );
        document.documentElement.style.setProperty(
            "--mode-switch-color",
            "var(--light-mode-background-color)"
        );
        document.documentElement.style.setProperty(
            "--mode-switch-color-hover",
            "var(--dark-mode-background-color-hover)"
        );
        document.documentElement.style.setProperty(
            "--main-background-color",
            "var(--main-background-color-dark)"
        );
    }

    const switchModes = async () => {
        if (mode === "Moon") {
            localStorage.setItem("mode", "Sun");
            setMode("Sun");
            switchToLightMode();
            slowTime();
            setTimeout(resetTime, 1000);
        } else if (mode === "Sun") {
            localStorage.setItem("mode", "Moon");
            setMode("Moon");
            switchToDarkMode();
            slowTime();
            setTimeout(resetTime, 1000);
        }
    };

    function resetTime() {
        document.documentElement.style.setProperty("--transition-time", "0.2s");
    }

    function slowTime() {
        document.documentElement.style.setProperty("--transition-time", "1s");
    }

    useEffect(() => {
        if (mode === "Moon") {
            switchToDarkMode();
            slowTime();
            setTimeout(resetTime, 2000);
        } else if (mode === "Sun") {
            switchToLightMode();
            slowTime();
            setTimeout(resetTime, 2000);
        }
    }, [mode]);

    useEffect(() => {
        document.documentElement.style.setProperty("--transition-time", "0s");
        if (!localStorage.getItem("mode")) {
            localStorage.setItem("mode", "Moon");
            setMode("Moon");
        }
    }, []);

    return (
        <button id="Light-Dark-Button" onClick={switchModes}>
            <FontAwesomeIcon
                size="2xl"
                icon={mode === "Sun" ? faMoon : faSun}
            />
        </button>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <div
                style={{
                    display: "flex",
                    margin: "20px auto",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                Coming Soon! Head to login page{" "}
                <Link
                    style={{
                        margin: "10px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        textDecoration: "none",
                        backgroundColor: "var(--link-color)",
                        color: "var(--link-text-color)",
                        padding: "10px",
                        borderRadius: "10px",
                    }}
                    to="/login"
                >
                    To Login
                </Link>
            </div>
        ),
        errorElement: <ErrorPage />,
    },

    {
        path: "/login",
        element: <Login />,
    },

    {
        path: "/register",
        element: <Register />,
    },

    {
        path: "/home",
        element: <Home />,
    },

    {
        path: "/home/post",
        element: <CreatePost />,
    },

    {
        path: "/home/post/:commentUsername/:commentId",
        element: <CreatePost />,
    },

    {
        path: "/home/comment/:commentUsername/:commentId",
        element: <Comment />,
    },

    {
        path: "/profile/:targetProfile/:targetPage",
        element: <Profile />,
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <SwitchMode />
        <RouterProvider router={router} />
    </React.StrictMode>
);
