import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faComment,
    faEye,
    faPenToSquare,
    faX,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as emptyHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as fullHeart } from "@fortawesome/free-solid-svg-icons";

import "../CSS/Profile.css";

const hostIp = process.env.REACT_APP_HOST_IP;

export default function Profile() {
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const [profile, setProfile] = useState("");
    const [page, setPage] = useState("");
    const [account, setAccount] = useState(null);
    let { targetProfile, targetPage } = useParams();
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

    function fetchProfile() {
        fetch(hostIp + "/getProfile", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                username: username,
                token: token,
                profile: profile,
                page: page,
            }),
        })
            .then((response) => response.json())
            .then((serverResponse) => {
                if (
                    serverResponse.message !== "Profile received." &&
                    serverResponse.message !== "Profile not found."
                ) {
                    alert(serverResponse.message);
                    document.cookie =
                        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    navigate("/login");
                    return;
                }

                if (serverResponse.message === "Profile not found.")
                    return navigate("/home");

                setAccount(serverResponse.profile);
            });
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

                fetchProfile();
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

                fetchProfile();
            });
    }

    useEffect(() => {
        getCookies();
        setProfile(targetProfile);
        setPage(targetPage);

        if (username === "") return;
        if (token === "") return;
        if (profile === "") return;
        if (targetPage === "") targetPage = "0";
        fetchProfile();
    }, [username, token, profile, page, targetProfile, targetPage]);

    function Logout() {
        document.cookie =
            "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/login");
    }

    function CreatePosts() {
        return (
            <main className="Home-main">
                {account ? (
                    account.posts.map((post) => {
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
                                <h2>{post.parentPost ? (
                                    <>
                                        {" "}
                                        reply for{" "}
                                        <Link
                                            className="reply-username"
                                            to={`/profile/${
                                                post.parentPost.split(":")[0]
                                            }/0`}
                                        >
                                            @{post.parentPost.split(":")[0]}
                                        </Link>
                                    </>
                                ) : (
                                    <></>
                                )}</h2>

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
                                    <button
                                        className="Home-post-comment"
                                        onClick={() =>
                                            (window.location = `/home/comment/${post.username}/${post.id}`)
                                        }
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
                                    </button>
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
                                {post ===
                                account.posts[account.posts.length - 1] ? (
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
        );
    }

    return (
        <div id="Profile">
            {username !== "" ? (
                <Link to={`/home`} className="Home-profile">
                    <FontAwesomeIcon
                        icon={faHouse}
                        size="xl"
                        color="var(--primary-text-color)"
                    />
                </Link>
            ) : (
                <></>
            )}

            {account ? (
                account.posts.length > 1 ? (
                    <h1 id="Profile-title">{account.username}'s OPINIONS</h1>
                ) : account.posts.length === 1 ? (
                    <h1 id="Profile-title">{account.username}'s OPINION</h1>
                ) : (
                    <h1 id="Profile-title">
                        {account.username}'s WOULD-BE OPINION
                    </h1>
                )
            ) : (
                <h1 id="Profile-title">Loading...</h1>
            )}
            {account ? <span>Joined on {account.dateCreated}</span> : <></>}
            {account ? (
                account.username === username ? (
                    <button id="Profile-logout" onClick={() => Logout()}>
                        Logout
                    </button>
                ) : (
                    <></>
                )
            ) : (
                <></>
            )}
            {account ? (
                account.username === username ? (
                    <Link to="/home/post" className="Home-post-message-button">
                        <FontAwesomeIcon
                            icon={faPenToSquare}
                            color="var(--text-color)"
                            size="2xl"
                            className="Main-post-icon"
                        />
                    </Link>
                ) : (
                    <></>
                )
            ) : (
                <></>
            )}

            <CreatePosts />
        </div>
    );
}
