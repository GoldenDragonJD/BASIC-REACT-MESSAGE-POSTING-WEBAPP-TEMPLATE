import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import "../CSS/CreatePost.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronLeft, faSquareCheck } from "@fortawesome/free-solid-svg-icons";

const hostIp = process.env.REACT_APP_HOST_IP;

export default function CreatePost() {
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const [title, setTitle] = useState("");
    const [postMessage, setPostMessage] = useState("");
    const navigate = useNavigate();
    const { commentUsername, commentId } = useParams();
    const [commentUsernameVar, setCommentUsernameVar] = useState("");
    const [commentIdVar, setCommentIdVar] = useState("");

    function getCookies() {
        const cookiesArray = document.cookie.split("; ");
        const cookieObj = {};

        cookiesArray.forEach((cookie) => {
            const [key, value] = cookie.split("=");
            cookieObj[key] = value;
        });

        setUsername(cookieObj.username);
        setToken(cookieObj.token);
    }

    function makePost(event) {
        event.preventDefault();
        fetch(hostIp + "/createPost", {
            method: "PUT",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                parentPost: commentUsernameVar ? `${commentUsernameVar}:${commentIdVar}` : null,
                username: username,
                token: token,
                title: title,
                postMessage: postMessage,
            }),
        })
            .then((response) => response.json())
            .then((postData) => {
                if (postData.message !== "Post Created") {
                    alert(postData.message);
                    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    navigate("/login");
                    return;
                }

                navigate("/home");
            })
            .catch((err) => console.log(err));
    }

    useEffect(() => {
        setCommentUsernameVar(commentUsername);
        setCommentIdVar(commentId);
        getCookies();

        console.log(commentUsernameVar);

        if (username === "") return;
        if (token === "") return;
        if (commentUsername === "") return;
        if (commentId === "") return;
    }, [username, token, commentUsernameVar, commentIdVar, commentUsername, commentId]);

    return (
        <div id="Create-post">
            {commentUsernameVar && commentIdVar ? (
                <h1 id="Create-post-title">REPLY TO {commentUsernameVar}</h1>
            ) : (
                <h1 id="Create-post-title">POST YOUR OPINION</h1>
            )}
            <form onSubmit={makePost} id="Post-form">
                <input
                    id="Post-title-input"
                    className="Post-input"
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Title:"
                    minLength="1"
                    maxLength="60"
                    required
                />
                <textarea
                    id="Post-postMessage-input"
                    className="Post-input"
                    onChange={(event) => setPostMessage(event.target.value)}
                    placeholder="Body:"
                    minLength="1"
                    maxLength="1200"
                    required
                />
                <div id="Post-button-container">
                    <Link to="/home" id="Post-back">
                        <FontAwesomeIcon icon={faCircleChevronLeft} size="2xl" id="Post-icon" /> BACK
                    </Link>
                    <button type="submit" id="Post-submit">
                        POST <FontAwesomeIcon icon={faSquareCheck} size="2xl" />
                    </button>
                </div>
            </form>
        </div>
    );
}
