var express = require('express');
var router = express.Router();
const userModel = require("./users"); //1
const postModel = require("./post")
const passport = require('passport'); //1
const localStrategy = require("passport-local"); //1
const upload = require("./multer"); //8

//3 
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  //ab saare posts layenge pehle
  // const posts = await postModel.find(); //ab sirf users ki id ayi hai data ni toh data laane k liye krna hoga
  const posts = await postModel.find().populate("user"); // jo bhi field ka name hai yahan user tha posts.js mai isliye user kia
  // and remember populate wohi field hoti hai jismai id store krai hai apne
  console.log(posts)
  res.render('feed', {footer: true, posts, user});
});

router.get('/profile', isLoggedIn, async function(req, res) {
  //11
  // const user = await userModel.findOne({username: req.session.passport.user}); //login in user liya
  const user = await userModel.findOne({username: req.session.passport.user}).populate("posts") //saare posts populate krdiye
  //12
  res.render('profile', {footer: true, user});

});

router.get('/search', isLoggedIn, function(req, res) {
  res.render('search', {footer: true});
});

// 
router.get('/like/post/:id', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});

  // if already liked remove like
  // if not liked, like it
  if(post.likes.indexOf(user._id) === -1 ){
    post.likes.push(user._id);
  }else{
    post.likes.splice(post.likes.indexOf(user._id),1);
  }

  await post.save();
  res.redirect("/feed");
});

router.get('/edit',isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})  //9
  res.render('edit', {footer: true, user:user}); //10
});

router.get('/upload', isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});

//
router.get('/username/:username', isLoggedIn, async function(req, res) {
  const regex = new RegExp(`^${req.params.username}`, 'i');
   const users = await userModel.find({username: regex});
   res.json(users);
});

//2
router.post("/register", function(req,res,next){
  const userData = new userModel({
    username : req.body.username,
    name:req.body.name,
    email:req.body.email
  });

  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })
})

//4
router.post("/login", passport.authenticate("local", {
  successRedirect:"/profile" ,
  failureRedirect: "/login"
}),function(req,res){

})

//5

router.get("/logout", function(req,res,next){
  req.logout(function(err){
    if(err) {return next(err);}
    res.redirect("/");
  })
})


//7
router.post("/update", upload.single("image"),async function(req,res){ //abhi tk image upload ho chuki hai but details ni hui hai update
     const user = await userModel.findOneAndUpdate(
      {username: req.session.passport.user},    //is line sai woh bnda mil jayega jiska dp change hora hai ie: logedin user
      {username:req.body.username, name:req.body.name, bio:req.body.bio}, //updated data
      {new:true}
      
    ) 

   if(req.file){ //agr req.file exist krta hai toh run kro ye

   
    user.profileImage = req.file.filename;  //user ki profile picture update hui hai
  }
    await user.save();

    res.redirect("/profile");
     
})

router.post("/upload", isLoggedIn, upload.single("image"),async (req,res)=>{
  // upload.single("image")  issai image upload hojayegi ab mai upload hone
  // k baad ka kaam kr ra hu

  //ye line mujhe logged in bnda degi and woh user k andr hai
  const user = await userModel.findOne({username: req.session.passport.user})  
  const post = await postModel.create({
    picture: req.file.filename,
    user: user._id, //  ye loggedin user ki id bhej dega 
    //post ko ye pta lg gya ye kiske dwara likha hua hai
    caption: req.body.caption,
    


  })

  //ab data and likes default hai mujhe ni pass krna 
    
    //abhi tk post ko  pta hai user kon hai jisne
    // post kia hai but user ko ni pta ki usnai post kia hai
    // isliye ab woh kaam krenge
   // toh humne usersSchema k posts wale array mai bola hua hai
   // save krne ko user ki id
   // isliye ab ye krenge

   user.posts.push(post._id); // user k post array mai is post ki id store krdenge
   await user.save(); // ab hath sai kia hai user mai change toh user.save()

   res.redirect("/feed");

})


//6 

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login")
}


module.exports = router;
