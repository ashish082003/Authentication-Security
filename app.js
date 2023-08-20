require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt=require("mongoose-encryption");
// const md5=require("md5");
// const bcrypt=require('bcrypt');
// const saltBounds=10;
const session = require("express-session");
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const  findOrCreate = require('mongoose-findorcreate');


const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId:String
});

 userSchema.plugin(passportLocalMongoose);
 userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id); 
   // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
))

app.get("/", (req, res) => {
    res.render("home");
});


app.get("/auth/google",
    passport.authenticate("google",{ scope: ["profile"] })
);

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login", (req, res) => {
    res.render("login");
});


app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});
app.post("/register", (req, res) => {

    User.register({username:req.body.username},req.body.password).then(function(){
        passport.authenticate("local")(req,res,()=>{
            res.redirect("/secrets");
        })
    }).catch(function(err){
        console.log(err)
        res.redirect("/register")
    })

})



app.post("/login", (req, res) => {
   const user=new User({
    username:req.body.username,
    password:req.body.password
   });

   req.login(user,()=>{
    passport.authenticate("local")(req,res,()=>{
        res.redirect("/secrets");
    })
   })
})

app.get("/logout",(req,res)=>{
    req.logOut(()=>{
        res.redirect("/");
    })
})
app.listen(3000, () => {
    console.log("server is listed on port 3000");
});

