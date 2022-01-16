var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); 
var session = require('express-session');
var cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.set('views','./views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Your secret key"}));

var Users = [];


//testing code *****************************************************************************
let noerror = true;

app.get('/',mymiddleware, tryanothermiddlware, function(r,r,next) {
    console.log('almost done') 
    next()}, 
    (req,res) => { console.log('initial get after middleware')
})

function mymiddleware(req,res,next) {
    console.log('in mymiddlware')
    if(noerror) next();
    else
    {
        var err = new Error("trial defined Error!");
        next(err);
    }
}

function tryanothermiddlware(r,r,next){
    console.log('another middlewware tried!')
    next();
}

//testing code *****************************************************************************







app.get('/signup', function(req, res){
   res.render('signup');
});

app.post('/signup', function(req, res){

   if(!req.body.id || !req.body.password){
      res.status("400");
      res.send("Invalid details!");
   }
   
   else {
      Users.filter(function(user){
         if(user.id === req.body.id){
            res.render('signup', {
               message: "User Already Exists! Login or choose another user id"});
         }
      });
   
      var newUser = {id: req.body.id, password: req.body.password};
      Users.push(newUser);
      req.session.user = newUser;
      res.redirect('/protected');
   }
});





function checkSignIn(req, res, next){
   if(req.session.user){
      next();     //If session exists, proceed to page
   } else {
        console.log('in checkSignIn function')
        var err = new Error("Not logged in silly goose!");
        console.log('req session user: ', req.session.user);
        
        //will call default error handling function if middleware is not below!
        next(err);  //Error, trying to access unauthorized page!
   }
}
app.get('/protected', checkSignIn, function(req, res, next){
   res.render('protected', {id: req.session.user.id})
});

app.get('/login', function(req, res){
   res.render('login');
});

app.post('/login', function(req, res){
   console.log(Users);
   if(!req.body.id || !req.body.password){
      res.render('login', {message: "Please enter both id and password"});
   } else {
      Users.filter(function(user){
         if(user.id === req.body.id && user.password === req.body.password){
            req.session.user = user;
            res.redirect('/protected');
         }
      });
      res.render('login', {message: "Invalid credentials!"});
   }
});

// app.use((req,res,next) => {
//     console.log('middleware in middle of nowhere')
//     next();
// })

app.get('/logout', function(req, res){
   req.session.destroy(function(){
      console.log("user logged out.")
   });
   
   res.redirect('/login');
});

app.use('/protected', function(err, req, res, next){
    console.log("err is:", err);

    //note, if you call next() with err, it will use default error handling unless you define another function like the other use function below!
    next(err);
    //User should be authenticated! RedirectF him to log in.
   res.redirect('/login');
   
});

//NOTE: this will ONLY get called by next(err) if it has the 4 parameters in it
app.use('/protected', (err,req,res,next) => {
    console.log('non error handling function')
    next(err)
})

app.use((err,req,res,next) => {
    console.log('general error handling function for any route.')
    next(err)
})

//have to have all 4 parameters to be called
app.use('/protected', (err,req,res,next) => {
    console.log('middleware trial function');
    
    //since nothing else defined below, this will now call the default error handling function
    next(err)
});








app.listen(4000);