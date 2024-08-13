const express = require("express");
const mongoose = require("mongoose");
// const cors = require("cors");
const bcrypt = require("bcrypt");
const sha256 = require("sha256");
const User = require("./models/TC-users");
const helmet = require("helmet");
const profanity = require("@2toad/profanity");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

mongoose
    .connect(process.env.DB_HOST)
    .then(() => {
        console.log("Connected to DataBase!!!");
    })
    .catch((error) => {
        console.error("Error:", error);
    });

app.use(express.json());
// app.use(cors());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://your-opinion.onrender.com");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Private-Network", true);
    //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
    res.setHeader("Access-Control-Max-Age", 7200);

    next();
});

// Set preflight
app.options("*", (req, res) => {
    console.log("preflight");
    if (
        req.headers.origin === "https://badmintown.onrender.com" &&
        allowMethods.includes(req.headers["access-control-request-method"]) &&
        allowHeaders.includes(req.headers["access-control-request-headers"])
    ) {
        console.log("pass");
        return res.status(204).send();
    } else {
        console.log("fail");
    }
});
app.use(helmet());

async function createToken(password) {
    const token = password + process.env.TOKEN_PASS;
    return sha256(token).toString();
}

async function authAccount(username, token) {
    if (!token) token = "";
    const user = await User.findOne({ username: username });

    if (!user) return false;
    if ((await createToken(user.password)) !== token) return false;
    return true;
}

function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const day = date.getDate();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const month = months[date.getMonth()];

    return `${month} ${day}, ${year}`;
}

app.post("/createAccount", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (profanity.exists(username)) return res.json({ message: "Profanity Detected!" });

    const user = await User.findOne({ username: username });

    if (user) return res.json({ message: "Username is Taken!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username: username,
        password: hashedPassword,
        dateCreated: getFormattedDate(),
        lastPostId: 0,
        posts: [],
    });

    newUser
        .save()
        .then(() => {
            res.json({ message: "Account Created." });
        })
        .catch((error) => {
            console.log(error);
            res.json({ message: "Account Failed to Create." });
        });
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({ username: username });

    if (!user) return res.json({ message: "Username not Found!" });

    if (!(await bcrypt.compare(password, user.password))) return res.json({ message: "Incorrect Password" });

    const createdToken = await createToken(user.password);

    res.json({
        message: "Login Successful",
        username: username,
        token: createdToken,
    });
});

app.delete("/deleteAccount", async (req, res) => {
    const username = req.body.username;
    const token = req.body.token;

    if (await !authAccount(username, token)) return res.json({ message: "Authentication Failed." });

    const user = await User.findOneAndDelete({ username: username });
    console.log("This Account Has Been Deleted:", user);
    res.json("Account Deleted!");
});

app.put("/createPost", async (req, res) => {
    const username = req.body.username;
    const token = req.body.token;
    const parentPost = req.body.parentPost;
    const title = req.body.title;
    const postMessage = req.body.postMessage;

    if (profanity.exists(title) || profanity.exists(postMessage)) return res.json({ message: "Profanity Detected!" });

    if (!(await authAccount(username, token))) {
        console.log("auth failed");
        return res.json({ message: "Authentication Failed." });
    }

    const user = await User.findOne({ username: username });

    let postId = 0;

    if (user.posts.length) postId = user.lastPostId + 1;

    const newPost = {
        parentPost: parentPost || null,
        id: postId,
        username: username,
        title: title,
        postMessage: postMessage,
        date: getFormattedDate(),
        likes: [],
        views: [],
        comments: 0,
        exactTime: Date.now(),
    };

    const updatedUser = await User.findOneAndUpdate({ username: username }, { $push: { posts: newPost }, $set: { lastPostId: postId } }, { new: true });

    if (parentPost) {
        const updateComments = await User.findOne({
            username: parentPost.split(":")[0],
        });

        if (updateComments) {
            const updatePostIndex = updateComments.posts.findIndex((post) => post.id == parentPost.split(":")[1]);
            if (updatePostIndex !== -1) {
                updateComments.posts[updatePostIndex].comments += 1;
                updateComments.markModified("posts");
                await updateComments.save().catch((error) => console.log("Error:", error.message));
            }
        }
    }

    res.json({ message: "Post Created" });
});

app.delete("/removePost", async (req, res) => {
    const username = req.body.username;
    const token = req.body.token;
    const postId = req.body.postId;

    if (!(await authAccount(username, token))) return res.json({ message: "Authentication Failed." });

    const user = await User.findOne({ username: username });
    const postIndex = user.posts.findIndex((post) => post.id == postId);
    const updatedUser = await User.findOneAndUpdate({ username: username }, { $pull: { posts: user.posts[postIndex] } }, { new: true });

    res.json({ message: "Post Removed" });
});

app.put("/addRemoveLike/:account/:postID", async (req, res) => {
    const account = req.params.account;
    const postId = req.params.postID;
    const username = req.body.username;
    const token = req.body.token;

    if (!account) return res.json({ message: "Missing Important Information." });
    if (!postId) return res.json({ message: "Missing Important Information." });
    if (!(await authAccount(username, token))) return res.json({ message: "Authentication Failed." });

    const targetUser = await User.findOne({ username: account });
    if (!targetUser) return res.json({ message: "Couldn't Find Target User." });
    const targetPostIndex = targetUser.posts.findIndex((post) => post.id == postId);

    if (!targetUser.posts[targetPostIndex]) return res.json({ message: "Target user Post couldn't be found" });
    if (!targetUser.posts[targetPostIndex].likes.includes(username)) {
        targetUser.posts[targetPostIndex].likes.push(username);
    } else {
        const likeIndex = targetUser.posts[targetPostIndex].likes.indexOf(username);
        targetUser.posts[targetPostIndex].likes.splice(likeIndex, 1);
    }

    targetUser.markModified("posts");

    targetUser
        .save()
        .then(() => {
            res.json({ message: "Success" });
        })
        .catch((error) => {
            res.json({ error: error });
        });
});

app.get("/getAllAccounts", async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username) username = "";
    if (!password) password = "";

    const user = await User.findOne({ username: username });

    if (!user) return res.status(403).json({ message: "No User: Authentication Failed!" });

    if (!(await bcrypt.compare(password, user.password)) || username !== "admin")
        return res.status(403).json({ message: "Password Failed: Authentication Failed!" });

    const accounts = await User.find();
    return res.json(accounts);
});

app.post("/getAllPosts/:page", async (req, res) => {
    const users = await User.find();
    const pageNumber = Number(req.params.page);
    const username = req.body.username;
    const token = req.body.token;

    if (!(await authAccount(username, token))) return res.json({ message: "Authentication Failed." });

    const shownPosts = [];

    users.sort((a, b) => {
        const aLastPostTime = new Date(a.posts[a.posts.length - 1]?.exactTime || 0);
        const bLastPostTime = new Date(b.posts[b.posts.length - 1]?.exactTime || 0);
        return bLastPostTime - aLastPostTime;
    });

    for (const user of users) {
        for (let i = pageNumber - 1; i < pageNumber + 10; i++) {
            if (!user.posts[i]) break;
            if (user.posts[i].parentPost) continue;
            if (user.posts[i].username !== username) {
                if (!user.posts[i].views.includes(username)) {
                    user.posts[i].views.push(username);
                    user.markModified("posts");
                    await user.save().catch((error) => console.log({ message: error }));
                }
            }

            shownPosts.push(user.posts[i]);
        }
    }

    shownPosts.sort((a, b) => {
        if (a.exactTime > b.exactTime) return -1;
        if (a.exactTime < b.exactTime) return 1;
        return 0;
    });

    res.json({ showPosts: shownPosts });
});

app.post("/getAllComments/:page", async (req, res) => {
    const users = await User.find();
    const targetPost = req.body.parentPost;
    const username = req.body.username;
    const token = req.body.token;
    const page = Number(req.params.page);

    if (!(await authAccount(username, token))) return res.json({ message: "Authentication Failed." });

    const shownComments = [];
    let post;

    users.sort((a, b) => {
        const aLastPostTime = new Date(a.posts[a.posts.length - 1]?.exactTime || 0);
        const bLastPostTime = new Date(b.posts[b.posts.length - 1]?.exactTime || 0);
        return bLastPostTime - aLastPostTime;
    });

    for (const user of users) {
        for (const po of user.posts) {
            if (po.id == targetPost.split(":")[1] && po.username === targetPost.split(":")[0]) post = po;
        }

        for (let i = page - 1; i < 10 * page; i++) {
            if (!user.posts[i]) break;
            if (!user.posts[i].parentPost) continue;
            if (user.posts[i].username !== username) {
                if (!user.posts[i].views.includes(username)) {
                    user.posts[i].views.push(username);
                    user.markModified("posts");
                    await user.save().catch((error) => console.log({ message: error }));
                }
            }

            if (user.posts[i].parentPost === targetPost) {
                shownComments.push(user.posts[i]);
            }
        }
    }

    shownComments.sort((a, b) => {
        if (a.exactTime > b.exactTime) return -1;
        if (a.exactTime < b.exactTime) return 1;
        return 0;
    });

    res.json({ showComments: shownComments, post: post });
});

app.post("/getProfile", async (req, res) => {
    const users = await User.find();
    const username = req.body.username;
    const token = req.body.token;
    const profile = req.body.profile;
    const page = Number(req.body.page);

    if (!(await authAccount(username, token))) return res.json({ message: "Authentication Failed." });

    let found = false;

    for (const user of users) {
        if (user.username === profile) found = true;
    }

    if (!found) return res.json({ message: "Profile not found." });

    const profileObject = await User.findOne({ username: profile });

    res.json({ message: "Profile received.", profile: profileObject });
});

app.get("/", (req, res) => {
    res.json({ message: "Backend Is working!!!" });
});

app.listen(port, () => {
    console.log("Started Listening.");
});
