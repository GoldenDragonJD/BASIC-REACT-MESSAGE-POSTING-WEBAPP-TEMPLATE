import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../CSS/Home.css";
import "../CSS/Comment.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment,
    faEye,
    faX,
    faSpinner,
    faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as emptyHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as fullHeart } from "@fortawesome/free-solid-svg-icons";

const hostIp = process.env.REACT_APP_HOST_IP;

export default function Comment() {
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState(null);
    const { commentUsername, commentId } = useParams();
    const [commentUsernameVar, setCommentUsernameVar] = useState("");
    const [commentIdVar, setCommentIdVar] = useState("");
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

                fetchInfo();
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

                fetchInfo();
            });
    }

    function fetchInfo() {
        fetch(hostIp + "/getAllComments/1", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                parentPost: `${commentUsernameVar}:${commentIdVar}`,
                username: username,
                token: token,
            }),
        })
            .then((response) => response.json())
            .then((serverInfo) => {
                if (serverInfo.message) {
                    alert(serverInfo.message);
                    document.cookie =
                        "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    navigate("/login");
                    return;
                }

                setPost(serverInfo.post);
                setComments(serverInfo.showComments);

                console.log(comments);
            });
    }

    function loadNewPage(commentUser, commentI) {
        window.location = `/home/comment/${commentUser}/${commentI}`;
    }

    useEffect(() => {
        setCommentUsernameVar(commentUsername);
        setCommentIdVar(commentId);
        getCookies();

        if (username === "") return;
        if (token === "") return;
        if (commentUsername === "") return;
        if (commentId === "") return;

        fetchInfo();
    }, [
        username,
        token,
        commentUsernameVar,
        commentIdVar,
        commentUsername,
        commentId,
    ]);

    function CreateMainPost() {
        return (
            <div
                key={post.username + ":" + post.id}
                className="Home-post-container"
            >
                <Link
                    to={`/profile/${post.username}/0`}
                    className="Home-post-user-link"
                >
                    <h2 className="Home-post-user">@{post.username}</h2>
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

                <h3 className="Home-post-title">{post.title}</h3>

                <p className="Home-post-message">{post.postMessage}</p>
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
                        {post.comments != null && post.comments >= 0 ? (
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
                    <span className="Home-post-date">{post.date}</span>
                </div>
            </div>
        );
    }

    function CreateComments() {
        return (
            <div className="Home-main" id="Comment-container">
                {comments ? (
                    comments.map((comment) => {
                        return (
                            <div
                                key={comment.username + ":" + comment.id}
                                className="Home-post-container"
                            >
                                <Link
                                    to={`/profile/${comment.username}/0`}
                                    className="Home-post-user-link"
                                >
                                    <h2 className="Home-post-user">
                                        @{comment.username}
                                    </h2>
                                </Link>

                                {comment.username === username ? (
                                    <button
                                        className="Home-remove-post"
                                        onClick={() => removePost(comment.id)}
                                    >
                                        <FontAwesomeIcon icon={faX} />
                                    </button>
                                ) : (
                                    <></>
                                )}

                                <h3 className="Home-post-title">
                                    {comment.title}
                                </h3>

                                <p className="Home-post-message">
                                    {comment.postMessage}
                                </p>
                                <div className="Home-post-info-container">
                                    <button
                                        className="Home-post-comment"
                                        to={`/home/comment/${comment.username}/${comment.id}`}
                                        onClick={() =>
                                            loadNewPage(
                                                comment.username,
                                                comment.id
                                            )
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={faComment}
                                            size="xl"
                                            color="var(--link-color)"
                                            className="Post-buttons"
                                        />
                                        {"  "}
                                        {comment.comments != null &&
                                        comment.comments >= 0 ? (
                                            <b>{comment.comments}</b>
                                        ) : (
                                            <>Loading...</>
                                        )}
                                    </button>
                                    <button
                                        className="Home-post-likes"
                                        onClick={(event) => {
                                            handleLike(
                                                comment.username,
                                                comment.id,
                                                comment,
                                                event.target
                                            );
                                        }}
                                    >
                                        {comment.likes.includes(username) ? (
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
                                        <b>{comment.likes.length}</b>
                                    </button>
                                    <p>
                                        <b className="Home-post-views">
                                            <FontAwesomeIcon
                                                icon={faEye}
                                                size="xl"
                                                color="var(--link-color)"
                                                className="Post-info"
                                            />{" "}
                                            {comment.views.length}
                                        </b>
                                    </p>
                                    <span className="Home-post-date">
                                        {comment.date}
                                    </span>
                                </div>
                                {comment === comments[comments.length - 1] ? (
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
            </div>
        );
    }

    return (
        <div id="Comment-post-container">
            <h1 id="Comment-post-title">COMMENT YOUR OPINION</h1>
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
            <main className="Home-main">
                {post ? <CreateMainPost /> : <></>}
                {post ? (
                    <Link
                        id="Comment-reply"
                        to={`/home/post/${post.username}/${post.id}`}
                    >
                        REPLY
                    </Link>
                ) : (
                    <></>
                )}

                <CreateComments />
            </main>
        </div>
    );
}
