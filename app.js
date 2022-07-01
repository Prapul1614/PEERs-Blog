// npm i mongoose-encryption
// npm i dotenv
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
const { redirect } = require("express/lib/response");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
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


userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });

const User = new mongoose.model("User",userSchema);

app.get("/", function(req,res){
  res.render('home');
})

app.get("/allPosts",function(req , res){

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
})

app.get("/about",function(req , res){
  res.render('about',{ para: aboutContent});
})

app.get("/contact",function(req , res){
  res.render('contact',{ para: contactContent});
})

app.get("/compose",function(req , res){
  res.render('compose');
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
  let requestedTitle = req.params.title;

  Post.find({},function(err , foundPosts){
    for(var i = 0;i < foundPosts.length;i++){
      const post = foundPosts[i];
      if(_.lowerCase(post.name) === _.lowerCase(requestedTitle))
        return res.render('post',{ post: post});
    }
    if(i === foundPosts.length) res.redirect("/");
  });
})

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function( req ,res ){
  const newUser = new User({
      email: req.body.username,
      password: req.body.password
  })
  User.findOne({email: newUser.email}, function(err , foundUser){
    if(foundUser){
      if(foundUser.password === newUser.password)  
        res.redirect("/allPosts");
      else{ console.log("Incorrect Password");  res.redirect("/");}
    }
    else{
        newUser.save(function(er){
          if(er){
              console.log(er); res.redirect("/");
          }else{
              res.redirect("/allPosts");
          }
        });
    }
  })
  
})

// if password is incorrect say so
// if email not found redirect them
app.post("/login", function( req , res ){
  const email = req.body.username;
  const password = req.body.password;

  User.findOne({email: email}, function(err , foundUser){
      if(err){ console.log(err);  res.redirect("/");}
      else{
          if(foundUser.password === password) 
          res.redirect("/allPosts");
          else{ console.log("Incorrect Password");  res.redirect("/");}
      }
  })
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
