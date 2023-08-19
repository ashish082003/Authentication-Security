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
const password = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');



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
    password: String
});

 userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get('/login', (req, res) => {
    res.render("login");
});


app.get('/register', (req, res) => {
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

