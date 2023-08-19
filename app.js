require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose =require('mongoose');
// const encrypt=require("mongoose-encryption");
// const md5=require("md5");
const bcrypt=require('bcrypt');
const saltBounds=10;



const app=express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

// userSchema.plugin(encrypt,{secret:process.env.secret,encryptedFields:["password"]});
const User=new mongoose.model("User",userSchema);


app.get("/",(req,res)=>{
    res.render("home");
});

app.get('/login',(req,res)=>{
    res.render("login");
});

app.get('/register',(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{

    bcrypt.hash(req.body.password,saltBounds).then((hash)=>{
        const newUser=new User({
            email:req.body.username,
            password:hash
        });

        newUser.save().then(function(){
            res.render("secrets");
        }).catch(function(err){
            console.log(err);
        })
    }).catch((err)=>{
        console.log(err);
    });

   
})

app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({email:username}).then(function(founduser){
        bcrypt.compare(password, founduser.password).then(function(result) {
          if(result==true){
            res.render("secrets")
          }else{
                console.log("Incorrect password");
          }
        });
    }).catch(function(err){
        console.log(err);
    })
})
// app.get("/:logout",(req,res)=>{
//     res.render("home");
// })
app.listen(3000,()=>{
    console.log("server is listed on port 3000");
});

