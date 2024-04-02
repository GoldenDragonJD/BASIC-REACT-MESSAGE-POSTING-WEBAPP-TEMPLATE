import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../CSS/Home.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment,
    faEye,
    faUser,
    faPenToSquare,
    faX,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as emptyHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as fullHeart } from "@fortawesome/free-solid-svg-icons";

const hostIp = process.env.REACT_APP_HOST_IP;

export default function Home() {
    const [posts, setPosts] = useState(null);
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const navigate = useNavigate();

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

    async function fetchPosts() {
        fetch(hostIp + "/getAllPosts/1", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                token: token,
            }),
        })
            .then((response) => response.json())
            .then(async (postData) => {
                if (postData.message) {
                    alert("Fetching Data:", postData.message);
                    document.cookie =
                        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    navigate("/login");
                    return;
                }
                setPosts(postData.showPosts);
            })
            .catch((err) => console.error(err));
    }

    function handleLike(account, postID, thisPost, thisButton) {
        fetch(hostIp + `/addRemoveLike/${account}/${postID}`, {
            method: "PUT",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                token: token,
            }),
        })
            .then((response) => response.json())
            .then((postData) => {
                if (
                    postData.message !== "Success" &&
                    postData.message !== "Target user Post couldn't be found"
                ) {
                    alert(postData.message);
                    document.cookie =
                        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    navigate("/login");
                    return;
                }

                fetchPosts();
            })
            .catch((err) => console.log(err));

        if (thisPost.likes.includes(username)) {
            thisButton.classList.add("Post-like-no");
            thisButton.classList.remove("Post-like-yes");
            setTimeout(() => {
                thisButton.classList.remove("Post-like-no");
                thisButton.classList.remove("Post-like-yes");
            }, 200);
        } else {
            thisButton.classList.remove("Post-like-no");
            thisButton.classList.add("Post-like-yes");
            setTimeout(() => {
                thisButton.classList.remove("Post-like-yes");
                thisButton.classList.remove("Post-like-no");
            }, 200);
        }
    }

    function removePost(postID) {
        fetch(hostIp + "/removePost", {
            method: "DELETE",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                token: token,
                postId: postID,
            }),
        })
            .then((response) => response.json())
            .then((serverMessage) => {
                if (serverMessage.message !== "Post Removed") {
                    alert(serverMessage.message);
                    document.cookie =
                        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    navigate("/login");
                    return;
                }

                fetchPosts();
            });
    }

    useEffect(() => {
        getCookies();

        if (username === "") return;
        if (token === "") return;

        fetchPosts();
    }, [username, token]);

    return (
        <div id="Home-page">
            {username !== "" ? (
                <Link
                    to={`/profile/${username}/0`}
                    className="Home-profile"
                >
                    <FontAwesomeIcon
                        icon={faUser}
                        size="xl"
                        color="var(--primary-text-color)"
                    />
                </Link>
            ) : (
                <></>
            )}
            <h1 id="Home-title">Your Opinion</h1>

            <Link to="/home/post" className="Home-post-message-button">
                <FontAwesomeIcon
                    icon={faPenToSquare}
                    color="var(--text-color)"
                    size="2xl"
                    className="Main-post-icon"
                />
            </Link>

            <main className="Home-main">
                {posts ? (
                    posts.map((post) => {
                        return (
                            <div
                                key={post.username + ":" + post.id}
                                className="Home-post-container"
                            >
                                <Link
                                    to={`/profile/${post.username}/0`}
                                    className="Home-post-user-link"
                                >
                                    <h2 className="Home-post-user">
                                        @{post.username}
                                    </h2>
                                </Link>

                                {post.username === username ? (
                                    <button
                                        className="Home-remove-post"
                                        onClick={() => removePost(post.id)}
                                    >
                                        <FontAwesomeIcon icon={faX} />
                                    </button>
                                ) : (
                                    <></>
                                )}

                                <h3 className="Home-post-title">
                                    {post.title}
                                </h3>

                                <p className="Home-post-message">
                                    {post.postMessage}
                                </p>
                                <div className="Home-post-info-container">
                                    <Link
                                        className="Home-post-comment"
                                        to={`/home/comment/${post.username}/${post.id}`}
                                    >
                                        <FontAwesomeIcon
                                            icon={faComment}
                                            size="xl"
                                            color="var(--link-color)"
                                            className="Post-buttons"
                                        />
                                        {"  "}
                                        {post.comments != null &&
                                        post.comments >= 0 ? (
                                            <b>{post.comments}</b>
                                        ) : (
                                            <>Loading...</>
                                        )}
                                    </Link>
                                    <button
                                        className="Home-post-likes"
                                        onClick={(event) => {
                                            handleLike(
                                                post.username,
                                                post.id,
                                                post,
                                                event.target
                                            );
                                        }}
                                    >
                                        {post.likes.includes(username) ? (
                                            <FontAwesomeIcon
                                                icon={fullHeart}
                                                color="var(--link-color)"
                                                size="xl"
                                                className="Post-buttons"
                                            />
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={emptyHeart}
                                                color="var(--link-color)"
                                                size="xl"
                                                className="Post-buttons"
                                            />
                                        )}{" "}
                                        <b>{post.likes.length}</b>
                                    </button>
                                    <p>
                                        <b className="Home-post-views">
                                            <FontAwesomeIcon
                                                icon={faEye}
                                                size="xl"
                                                color="var(--link-color)"
                                                className="Post-info"
                                            />{" "}
                                            {post.views.length}
                                        </b>
                                    </p>
                                    <span className="Home-post-date">
                                        {post.date}
                                    </span>
                                </div>
                                {post === posts[posts.length - 1] ? (
                                    <></>
                                ) : (
                                    <div className="Home-separator" />
                                )}
                            </div>
                        );
                    })
                ) : (
                    <FontAwesomeIcon icon={faSpinner} spinPulse />
                )}
            </main>
        </div>
    );
}
