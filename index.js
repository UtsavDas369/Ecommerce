
/**
 * Create express object.
 */
var express = require('express');
/**
 * Session object declear
 */
var session = require('express-session');
/**
 * Cookie object declear
 */
var cookieParser = require('cookie-parser');
/**
 * Create app object & assign express object.
 */
var app = express();
const path = require("path")
/**
 * Create reload object.
 */
var reload = require('reload');
const multer = require("multer");

/**
 * For set port or default 7000 posr.
 */
app.set('port', process.env.POST || 9031);
/**
 * Set view engine & point a view folder.
 */
app.set('view engine', 'ejs');
app.set('views', 'views');
/**
 * 
 * Register cookie
 */
app.use(cookieParser());
/**
 * Register session with secret key
 */
app.use(session({secret: 'kak',resave:'True',saveUninitialized:'True'}));
/**
 * Add & register body parser
 */
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
/**
 * Set site title.
 */
app.locals.siteTitle = 'Ecommerce';
/**
 * set public folder is static to use any where.
 * Public folder contents js, css, images
 */
app.use(express.static('public'));
app.use(express.static('uploads'));
/**
 * Add routes.
 */
app.use(require('./routers/pages'));
var storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
  let path
        // Uploads is the Upload_folder_name 
        cb(null, "uploads") 
    }, 
    filename: function (req, file, cb) { 
      cb(null, file.originalname) 
    } 
  }) 
const maxSize = 100 * 1000 * 1000; 
    
var upload = multer({  
    storage: storage, 
    limits: { fileSize: maxSize }, 
    fileFilter: function (req, file, cb){ 
    
        // Set the filetypes, it is optional 
        var filetypes = /jpeg|jpg|png/; 
        var mimetype = filetypes.test(file.mimetype); 
  
        var extname = filetypes.test(path.extname( 
                    file.originalname).toLowerCase()); 
        
        if (mimetype && extname) { 
            return cb(null, true); 
        } 
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes); 
      }  
  
// mypic is the name of file attribute 
}).single("mypic");        
  
app.get("/Signup",function(req,res){ 
    res.render("file"); 
}) 
    
app.post("/uploadProfilePicture",function (req, res, next) { 
        
    // Error MiddleWare for multer file upload, so if any 
    // error occurs, the image would not be uploaded! 
    upload(req,res,function(err) { 
  
        if(err) { 
  
            // ERROR occured (here it can be occured due 
            // to uploading image of size greater than 
            // 1MB or uploading different file type) 
            res.send(err) 
        } 
        //else { 
  
            // SUCCESS, image successfully uploaded 
          //  res.send("Success, Image uploaded!") 
        //} 
    }) 
}) 
/**
 * Cache
 */
/*app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  // -1 setting up request as expired and re-requesting before display again. 
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});*/
/**
 * Create server.
 */
var connection = require('./database/config');
var authenticateController=require('./controllers/authenticate-controller');
var registerController=require('./controllers/register-controller');
var AdminauthenticateController=require('./controllers/admin-controller');
var AdminregisterController=require('./controllers/admin-register-controller');
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', function (req, res) {  
   res.sendFile( __dirname + '/views/registration.ejs' );  
})  
 
app.get('/login', function (req, res) {  
   res.sendFile( __dirname + '/views/login.ejs');  
})  

 app.get('admin/login', function (req, res) {  
   res.sendFile( __dirname + '/views/admin/login.ejs');  
})  
 app.get('admin/register', function (req, res) {  
   res.sendFile( __dirname + '/views/admin/register.ejs');  
})  
/* route to handle login and registration */
app.post('/api/register',registerController.register);
app.post('/api/register',AdminregisterController.register);
app.post('/api/authenticate',authenticateController.authenticate);
app.post('/api/authenticate',AdminauthenticateController.authenticate);
 
console.log(authenticateController);
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authenticateController.authenticate);
app.post('/controllers/admin-controller', AdminauthenticateController.authenticate);
app.post('/controllers/admin-register-controller', AdminregisterController.register);

app.listen(3100);

var server = app.listen(9031, function() {
 console.log('Running server');
})
/**
 * Auto reload server.
 */
reload(server, app);
app.use(express.static(__dirname + '/public'));



