// npm i passport passport-local passport-local-mongoose express-session
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const { redirect, append } = require("express/lib/response");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// no need to require passport local it will be required passportLocalMongoose

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://Prapul:Saiprapul02@cluster0.xfdyn.mongodb.net/blogDB");

const postSchema = new mongoose.Schema({
  name: String,
  post: String
})

const Post = mongoose.model('Post',postSchema);

const defaultHome = new Post({
  name: "Home",
  post: homeStartingContent
})

const userSchema = new mongoose.Schema({
  email: String ,
  password: String
});

userSchema.plugin(passportLocalMongoose);
//passportLocalMongoose is used to hash and salt

const User = new mongoose.model("User",userSchema);


// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// seralise creates a cookie
// Deserialise breaks cookie and get to know info init

app.get("/", function(req,res){
  res.render('home');
})

/*
// The below line was added so we can't display the "/secrets" page
// after we logged out using the "back" button of the browser, which
// would normally display the browser cache and thus expose the 
// "/secrets" page we want to protect. Code taken from this post.

    res.set(
      'Cache-Control', 
      'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
    );
*/


app.get("/allPosts",function(req , res){

  res.set(
    'Cache-Control', 
    'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
  );

  if(req.isAuthenticated()){
    Post.find({},function(err , foundPosts){
      if(err) console.log(err);
      else{
        if(foundPosts.length === 0){
          Post.insertMany(defaultHome,function(err){
            if(err) console.log(err);
            else console.log("Success");
          });
          res.redirect("/");
        }else
        res.render('allPosts',{ posts: foundPosts });
      }
    })
  }else{
    res.redirect("/");
  }
})

app.get("/about",function(req , res){

  res.set(
    'Cache-Control', 
    'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
  );

  if(req.isAuthenticated()){
    res.render('about',{ para: aboutContent});
  }else{
    res.redirect("/");
  }
})

app.get("/contact",function(req , res){

  res.set(
    'Cache-Control', 
    'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
  );

  if(req.isAuthenticated()){
    res.render('contact',{ para: contactContent});
  }else{
    res.redirect("/");
  }
})

app.get("/compose",function(req , res){

  res.set(
    'Cache-Control', 
    'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
  );

  if(req.isAuthenticated()){
    res.render('compose');
  }else{
    res.redirect("/");
  }
})

app.post("/compose",function(req , res){
  const newPost = new Post({
    name: req.body.title,
    post: req.body.post
  });
  newPost.save(function(err){
    if(!err) res.redirect("/");
  });
})

app.get("/posts/:title",function(req , res){

  res.set(
    'Cache-Control', 
    'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
  );

  if(req.isAuthenticated()){
    let requestedTitle = req.params.title;

    Post.find({},function(err , foundPosts){
      for(var i = 0;i < foundPosts.length;i++){
        const post = foundPosts[i];
        if(_.lowerCase(post.name) === _.lowerCase(requestedTitle))
          return res.render('post',{ post: post});
      }
      if(i === foundPosts.length) res.redirect("/allPosts");
    });
  }else{
    res.redirect("/");
  }
})

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function( req ,res ){
  User.register({ username: req.body.username } , req.body.password ,function( err , user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }else{
        passport.authenticate("local")(req , res , function(er){
          if(er) res.redirect("/");
          res.redirect("/allPosts");
        })
    }
  })

})

// this is the new login route, which authenticates first and THEN
// does the login (which is required to create the session
app.post("/login", 
    passport.authenticate("local"), function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password     
    });
    req.login(user, function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/allPosts");
        }
    });
});

app.get("/logout",function(req, res){
  req.logout(function(request , response){
    res.redirect("/");
  });
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
