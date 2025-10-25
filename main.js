import mongoose from 'mongoose';
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import {  BlogData } from "./models/BlogData.js";
import multer from 'multer';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';






// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: 'uploads/' })

const storage = multer.diskStorage({
  destination : function (req, file, cb){
    cb(null, "./uploads");
  },
  filename: function(req, file, cb ){
     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})


const upload1 = multer({ storage: storage })



let a = await mongoose.connect("mongodb://localhost:27017/BlogData")


const app = express()
const port = 3000

app.set('view engine', 'ejs');
app.use("/uploads", express.static("uploads"));
app.use(session(
  {
   secret: "supersecretkey",
   resave: false,
   saveUninitialized : false,
   store : MongoStore.create({mongoUrl:"mongodb://localhost:27017/BlogData"}),
   cookie : {maxAge: 1000*60*60} 
  }
))




app.use(express.urlencoded({ extended: true }));
app.use(express.json());




console.log("main js has started")

app.get("/signup",(req,res)=>{
  res.render("signup")
})

app.post("/signup",async(req,res)=>{
  const{username, email, password }=req.body;

  const hashedPassword = await bcrypt.hash(password,10)

  try{

const user = new User({userName:username, email:email, password:hashedPassword});
await user.save();
res.redirect("/login");
  }catch(err){
    console.log(err);
    res.status(500).send("Error registering user.");
  }
})

app.get("/login",(req,res)=>{
  res.render("login");
})

app.post("/login",async(req,res)=>{
  const {email, password} = req.body;

  const user = await User.findOne({email})

  if(!user){
   return res.status(400).send("User doesn't exist, create account first.")
  }

  const isMatch = await bcrypt.compare(password,user.password)

  if(!isMatch){
    res.send(400).send("Invalid credentials");
  }

  req.session.userId = user._id;
  res.redirect("/home");


})


function requiredLoginFirst(req,res,next){
  if(!req.session.userId){
  return res.redirect("/login")
  }
  next();
}







app.get('/home', requiredLoginFirst, (req, res) => {
    
   res.sendFile("templates/home.html", {root:__dirname})

})

app.get('/create', requiredLoginFirst, (req, res)=>{
    res.sendFile("templates/createBlog.html", {root:__dirname})
})

console.log("chatGPT")

app.get('/single/:id',  async(req, res)=>{
 
      try {
    const blog = await BlogData.findById(req.params.id);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    res.render('singleBlog', { blog: blog });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching blog");
  }
    
   
})


app.post('/create',  upload.single('yourImage'), async (req, res) => {
    try {
        const BlogIn = new BlogData({
            Category:req.body.category,
            Title: req.body.title,
            Excerpt: req.body.excerpt,
            Content: req.body.content,
            Image : req.file ? req.file.path.replace(/\\/g, "/") : ""  

        });

        await BlogIn.save();
        res.send("Blog saved Successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error Saving Blog");
    }
});






app.get('/travel',  async(req, res)=>{
    try{
  const travelBlog = await BlogData.find({
    Category: {$in: ["Travel"]}
  })
  res.render('allVlogs',{travelBlog:travelBlog})
    } catch(err){
        console.log(err)
        res.send("Any travel blog data is not found.")
    }
})

app.get('/food',async(req,res)=>{
    try{
        const foodBlog = await BlogData.find({
    Category: {$in: ["Food"]}
  })
        res.render('allVlogs1',{foodBlog:foodBlog})
    } catch(err){
        console.log(err)
        res.send("Any food blog data is not found.")
    }
})

app.get('/festival',async(req, res)=>{
    try{
        const festivalBlog =await BlogData.find({
    Category: {$in: ["Festival"]}
  }) ;
        res.render('allVlogs2',{festivalBlog:festivalBlog})
    } catch(err){
        console.log(err)
        res.send("Any festival blog data is not found.")
    }
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})





