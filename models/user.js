// requirements
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const confiq = require('../config/config').get(process.env.NODE_ENV);
// salt is used in hashing
const salt = 10;

// creating user schema
const userSchema = new mongoose.Schema({
  phoneNumber: { 
    type: String, 
    required: true,
    maxlength: 10
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  dateOfRegistration: { 
    type: Date, 
    default: Date.now 
  },
  dob: { 
    type: Date, 
    required: true 
  },
  monthlySalary: { 
    type: Number, 
    required: true 
  },
  // status remains pending till amount not paid
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  password: { 
    type: String, 
    required: true 
  },
  purchasePower: { 
    type: Number, 
    default: 0 
  },
  token: {
    type: String
  }
});

// for hashing user password
userSchema.pre('save', function(next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(salt, function(err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        user.password2 = hash;
        next();
      })
    })
  } else {
    next();
  }
});

// function to check whether password is same or not
userSchema.methods.comparepassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// token generation
userSchema.methods.generateToken = function() {
    const user = this;
    const token = jwt.sign(user._id.toHexString(), confiq.SECRET);
    user.token = token;
    return user.save().then(() => token);
};

// find whether a user is logged-in or not
userSchema.statics.findByToken = function(token) {
  let user = this;
  return jwt.verify(token, confiq.SECRET, function(err, decode) {
    return user.findOne({ "_id": decode, "token": token });
  });
};

// delete token
userSchema.methods.deleteToken = function(token) {
    const user = this;
    return user.updateOne({ $unset: { token: 1 } }).exec();
}

// calculating purchasing power 
userSchema.methods.calculatePurchasePower = function() {
  const user = this;
  // Assuming purchase power is 50% of monthly salary
  this.purchasePower = this.monthlySalary * 0.5;
  return user.save().then(() => user.purchasePower);
};

module.exports = mongoose.model("User", userSchema);