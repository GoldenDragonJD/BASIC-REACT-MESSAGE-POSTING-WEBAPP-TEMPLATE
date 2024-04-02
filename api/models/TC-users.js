const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tcUsers = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: String,
    },
    lastPostId: {
        type: Number,
    },
    posts: [],
});

const User = mongoose.model("TCUsers", tcUsers);

module.exports = User;
