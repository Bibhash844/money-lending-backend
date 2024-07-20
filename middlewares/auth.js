const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const config = require("../config/config").get(process.env.NODE_ENV);

// Middleware function to authenticate users
const auth = async (req, res, next) => {
    const token = req.cookies.auth; // Get the token from cookies
    // checking if token is present or not
    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ isAuth: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, config.SECRET);
        // finding user by decoded token
        const user = await User.findOne({ "_id": decoded, "token": token });
        if (!user) {
            console.log("Invalid token");
            return res.status(401).json({ isAuth: false, message: "Invalid token" });
        }

        // attaching token and user to request object
        req.token = token;
        req.user = user;
        // proceeding to next route handler
        next();
    } catch (err) {
        console.error("Auth error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { auth };