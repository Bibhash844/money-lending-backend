// requirements and app uses
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const db = require("./config/config").get(process.env.NODE_ENV);
const User = require("./models/User.js");
const {auth} = require("./middlewares/auth.js");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// database connection
async function connectDB() {
    try {
        await mongoose.connect(db.DATABASE);
        console.log("Database is connected");
    } catch (err) {
        console.error("Failed to connect to database:", err);
    }
}
// calling function to connect to DB 
connectDB();

// not asked in assigment so please ignore
app.get("/", function (req, res) {
    res.status(200).send(`Welcome to login, sign-up API`);
});


// signup route
app.post('/signup', async function(req, res) {
    const newuser = new User(req.body);

    try {
        const user = await User.findOne({ email: newuser.email });
        if (user) {
            return res.status(400).json({ auth: false, message: "email exists" });
        }

        const today = new Date();
        const birthDate = new Date(newuser.dob);
        // calculating age of client
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        // reducing a year if dob is upcoming months
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // checking if client is in proper age range
        if (age < 20) {
            return res.status(400).json({ success: false, message: "Age must be at least 20 years old" });
        }

        // checking if client have salary 25k or more
        if (newuser.monthlySalary <= 25) {
            return res.status(400).json({ success: false, massage: "Salary must be 25k or more" });
        }

        // adding to database
        const doc = await newuser.save();
        // displaying status
        res.status(200).json({
            success: true,
            user: doc
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
    }
});


// login route
app.post('/login', async function(req, res) {
    let token = req.cookies.auth;
    try {
        // checking if user is still logged in
        let user = await User.findByToken(token);
        if (user) {
            return res.status(400).json({
                error: true,
                message: "You are already logged in"
            });
        }

        // checking for email id present in database or not
        user = await User.findOne({ 'email': req.body.email });
        if (!user) {
            return res.status(404).json({ isAuth: false, message: 'Auth failed, email not found' });
        }

        // comparing password entred by user with password in Db
        const isMatch = await user.comparepassword(req.body.password);
        if (!isMatch) {
            return res.status(401).json({ isAuth: false, message: "password doesn't match" });
        }

        // everything passed then creating token
        const userToken = await user.generateToken();
        // displaying status
        res.cookie('auth', userToken).status(200).json({
            isAuth: true,
            id: user._id,
            email: user.email
        });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});



// loggined user details (user route)
app.get('/user', auth, async function(req, res) {
    try {
        // calling function to calculate purchasing power
        await req.user.calculatePurchasePower();
        // displaying asked data of client
        res.json({
            isAuth: true,
            id: req.user._id,
            purchasePower: req.user.purchasePower,   
            phoneNumber: req.user.phoneNumber,
            email: req.user.email,
            dateOfRegistration: req.user.dateOfRegistration,
            dob: req.user.dob,
            monthlySalary: req.user.monthlySalary,
        });
    } catch (error) {
        console.error("Error in profile route:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// borrow route
app.post('/borrow', auth, async function(req, res) {
    try {
        // tenure is asked by client if not given anything than 12 month
        const { amount, tenure = 12 } = req.body;
        // checking amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        // changing purchasing power w.r.t. amount
        const user = req.user;
        const purchasePower = user.purchasePower;
        const newPurchasePower = purchasePower - amount;

        // checking changed purchasing power
        if (newPurchasePower < 0) {
            return res.status(400).json({ error: "Insufficient purchase power" });
        }

        // updating it in Db
        user.purchasePower = newPurchasePower;
        await user.save();

        // 8% interest rate
        const interestRate = 0.08;      
        // Calculate monthly repayment
        const monthlyRepayment = (amount * (1 + interestRate)) / tenure;
        // displaying info
        res.json({
            isAuth: true,
            updatedPurchasePower: newPurchasePower,
            monthlyRepayment: monthlyRepayment.toFixed(2),
        });
    } catch (error) {
        console.error("Error in borrow route:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//logout route (personal addition for testing)
app.get('/logout', auth, async function(req, res) {
    try {
        // deleting client token when logout 
        await req.user.deleteToken(req.token);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});


// listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server active at ${PORT}`);
});