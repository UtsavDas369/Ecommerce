let express = require('express');
let session = require('express-session');
let route = express.Router();
let db = require('../database/config');
var Cryptr = require('cryptr');
var path= require('path')
const multer = require("multer");
/*var storage = multer.diskStorage({ 
    destination: function (req, file, cb) { 
  
         //Uploads is the Upload_folder_name 
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
}).single("mypic");*/        
      

//route.get('/', function(req, res) {
  //res.render('home', {title: 'Home'});
//});

route.get('/', function(req, res) {
  let products;
  let sql1="SELECT * FROM products WHERE display='banner'"
  db.query("SELECT * FROM products left join categories on categories.id=products.category", function (err, result, fields) {
  let query1=db.query(sql1,function(err,result1){  
    if (err) {
      throw err;
    } else {
      //console.log(result);
      res.render('home', {title: 'home', products: result,display:result1});
    }
  });
});
});

route.get('/product/:product', function(req, res) {
  let products;
  db.query("SELECT * FROM products left join categories on categories.id=products.category where pid='"+req.params.product+"'", function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      //console.log(result);
      res.render('product', {title: 'Product', products: result});
    }
  });
});


route.get('/add-to-cart/:product', function(req, res) {
  //Cart through session
  /*if (!Array.isArray(req.session.product)) {
    req.session.product = [];
  }
  req.session.cookie.expires = false;

  req.session.product.push({
    id: req.params.product,
    qnt: 1
  });*/
  //res.send('<h1>'+JSON.stringify(req.session.product)+'</h1>');

  let product = req.params.product.split("-")[1];
  //console.log(product)
  //Cart through cookie
  let products = [];
  if(req.cookies.node_express_ecommerce) {
    products = req.cookies.node_express_ecommerce;
  }
  /*products.push({
    id: req.params.product,
    qnt: 1
  });*/
  db.query("SELECT * FROM products left join categories on categories.id=products.category where pid='"+product+"'", function (err, result, fields) {
    if (err) {
      console.log(err)
      res.render('page', {title: 'About'});
    } else {
      let flag = 0;
      products.forEach(item => {
        if(item.pid == product) {
          flag = 1;
        }
      });
      //console.log(result);
      if(flag == 0) {
        products.push({
          pid: result[0].pid,
          title: result[0].title,
          name: result[0].name,
          price: result[0].price,
          picture: result[0].picture,
         
        });
      }
      var cart={
         pid: result[0].pid,
          title: result[0].title,
          name: result[0].name,
          price: result[0].price,
          picture: result[0].picture,
         

    }
db.query('INSERT INTO cart SET ?',cart, function (error, results, fields){
      if (error) {
      throw error;
      }else 
      console.log("sucess");
    });

      //res.send(products);
      res.cookie('node_express_ecommerce', products, {path:'/'});
      res.redirect('/cart');
    }
  });
});

route.get('/remove-from-cart/:index', function(req, res) {
  let products = req.cookies.node_express_ecommerce;
  let index = req.params.index.split("-")[1];
  products.splice(index, 1);
  res.cookie('node_express_ecommerce', products, {path:'/'});
  
  res.redirect('/cart');
});

route.get('/empty-cart', function(req, res) {
  let products = [];
  res.cookie('node_express_ecommerce', products, {path:'/'});
  //req.session.destroy();
  //res.clearCookie('node_express_ecommerce', {path:'/'});
  //console.log(req.cookies.node_express_ecommerce);
  
  res.redirect('/cart');
});

route.get('/cart', function(req, res) {
  let products = [];
  //let session_products = [];

  //Using cookies
  //console.log(req.cookies.node_express_ecommerce);
  if(req.cookies.node_express_ecommerce) {
    res.render('cart', {title: 'Cart', products: req.cookies.node_express_ecommerce});
  } else {
    res.render('cart', {title: 'Cart', products: products});
  }
  
  //Using session
  /*if(req.session.product) {
    req.session.product.forEach(function(product) {
      session_products.push(product.id);
    });
    session_products = session_products.join("\', \'");
    db.query("SELECT * FROM products left join categories on categories.id=products.category where pid in('"+session_products+"')", function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        //console.log(result);
        res.render('cart', {title: 'Cart', products: result});
      }
    });
  } else {
    res.render('cart', {title: 'Cart', products: products});
  }*/
});

route.post('/update-cart', function(req, res) {
  //console.log(req.cookies.node_express_ecommerce);
  let products = req.cookies.node_express_ecommerce;
  products.forEach(function(product, index) {
    product.qnt = req.body.qnt[index];
  });
  //console.log(req.body)
  res.clearCookie('node_express_ecommerce', {path:'/'});
  res.cookie('node_express_ecommerce', products);
  res.redirect('/cart');
});

route.get('/checkout', function(req, res) {
  let sql5 = "SELECT * FROM cart";
  let sql1= "SELECT sum(price) as total FROM cart"
  let query5 = db.query(sql5, (err, rows) => {
  let query1=db.query(sql1,(err,result)=>{


  

  res.render('checkout', {title: 'Checkout',users : rows,count:result[0].total});
});
});
  })
route.post('/checkoutdetails',function(req, res){ 
    
    let data = {fname:req.body.fname,
        lname:req.body.lname,
        phone:req.body.number,
        email:req.body.email,
        address:req.body.add,
        city:req.body.city,
        zip:req.body.zip};

    let sql = "INSERT INTO checkout SET ?";
    let query = db.query(sql, data,(err, results) => {
    if(err) throw err;

      res.redirect('/checkout');
    });
});

route.post('/contactdetails',function(req, res){ 
    
    let data = {message:req.body.message,
        name:req.body.name,
        email:req.body.email,
        subject:req.body.subject,
        };

    let sql = "INSERT INTO contact SET ?";
    let query = db.query(sql, data,(err, results) => {
    if(err) throw err;

      res.redirect('/contact');
    });
});        
    
      
route.get('/about', function(req, res) {
  //res.send('<h1>About page</h1>');
  res.render('page', {title: 'About'});
});

route.get('/contact', function(req, res) {
  res.render('contact', {title: 'Contact'});
});

route.get('/confirmation', function(req, res) {
  res.render('confirmation', {title: 'Confirmation'});
});

route.get('/login', function(_req, res) {
  res.render('login', {title: 'Login'});
});

route.get('/tracking', function(req, res) {
  res.render('tracking', {title: 'Tracking'});
});

route.get('/category', function(req, res) {
  let products;
  db.query("SELECT * FROM products left join categories on categories.id=products.category", function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      //console.log(result);
      res.render('category', {title: 'Category', products: result});
    }
  });
});
  

//route.get('/single-product', function(req, res) {
  //res.render('single-product', {title: 'Single-product'});
//});

route.get('/registration', function(req, res) {
  res.render('registration', {title: 'Registration'});
});
route.get('/registration-admin', function(req, res) {
  res.render('admin/register', {title: 'Admin-Registration'});
});
route.get('/admin', function(req, res) {
  res.render('admin/login', {title: 'Admin-login'});
});
route.get('/admin/dashboard', function(req, res) {
  let sql="SELECT count(*) as total FROM users";
  let sql2="SELECT count(*) as total1 from categories";
  let sql3="SELECT count(*) as total2 from products";
  let sql4="SELECT count(*) as total3 from admin";
  let sql5 = "SELECT * FROM users";
  let sql6= "SELECT * FROM categories";
  let sql7= "SELECT * FROM products";
  let sql8= "SELECT * FROM contact";
  
  let query=db.query(sql,function(err,result){
  let query2=db.query(sql2,function(err,result1){
  let query3=db.query(sql3,function(err,result2){
  let query4=db.query(sql4,function(err,result3){
  
  let query5 = db.query(sql5, (err, rows) => {
  let query6 = db.query(sql6, (err, rows1) =>{
  let query7 = db.query(sql7, (err, rows2) =>{
  let query8 = db.query(sql7, (err, rows3) =>{
    if(err){
      throw err;
    }else{
    
      res.render('admin/index', 
        {title: 'Admin-Dashborad',
        count:result[0].total,
        count1:result1[0].total1,
        count2:result2[0].total2,
        count3:result3[0].total3,
        users : rows,
        cat:rows1,
        pro:rows2,
        con:rows3
             });
    }
  });
  });
  });
});
});
});
});
});
});
route.get('/admin/tables', function(req, res) {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM users";
     let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('admin/tables', {
            title : 'Admin-tables',
            users : rows
        });
    });
});
route.get('/admin/checkout', function(req, res) {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM checkout";
     let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('admin/tables7', {
            title : 'Admin-Checkout',
            users : rows
        });
    });
});
route.get('/admin/cart', function(req, res) {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM cart";
     let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('admin/tables1', {
            title : 'Admin-cart',
            users : rows
        });
    });
});
route.get('/admin/categories', function(req, res) {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM categories";
     let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('admin/tables3', {
            title : 'Admin-categories',
            cat : rows
        });
    });
});
route.get('/admin/products', function(req, res) {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM products";
     let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('admin/tables2', {
            title : 'Admin-products',
            pro : rows
        });
    });
});
route.get('/admin/banners', function(req, res) {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM products WHERE display='banner'";
     let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('admin/tables4', {
            title : 'Admin-banner',
            users : rows
        });
    });
});
route.get('/admin/awesome', function(req, res) {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM products WHERE display='awesome'";
     let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('admin/tables5', {
            title : 'Admin-awesome',
            users : rows
        });
    });
});
route.get('/admin/bestseller', function(req, res) {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT * FROM products WHERE display='bestseller'";
     let query = db.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('admin/tables6', {
            title : 'Admin-bestseller',
            users : rows
        });
    });
});
route.get('/admin/tables/add',function(req, res){
    res.render('admin/user_add', {
        title : 'Admin-tables'
    });
});
 route.get('/admin/products/add',function(req, res){
   
    res.render('admin/Product_add', {
        title : 'Admin-Products'
    });
});
 route.get('/admin/category/add',function(req, res){
   
    res.render('admin/cat_add', {
        title : 'Admin-Category'
    });
});
 route.post('/admin/products/save',(req, res,next) => { 
    

    let data1 = {
      category:req.body.category,
      title:req.body.title,
        details:req.body.details,
        price:req.body.price,
        picture:req.body.picture,
        display:req.body.display};
    let sql1 = "INSERT INTO products SET ?";
    let query = db.query(sql1, data1,(err, results) => {
      if(err) throw err;
      res.redirect('/admin/products');
    });
      });
    route.post('/admin/category/save',(req, res,next) => { 
    

    let data1 = {
      name:req.body.name,
      };
    let sql1 = "INSERT INTO categories SET ?";
    let query = db.query(sql1, data1,(err, results) => {
      if(err) throw err;
      res.redirect('/admin/categories');
    });
      });
route.post('/admin/tables/save',function(req, res){ 
    var today = new Date();
    var encryptedString = cryptr.encrypt(req.body.password);
    let data = {name:req.body.name,
        email:req.body.email,
        password:encryptedString,
        created_at:today,
        updated_at:today};

    let sql = "INSERT INTO users SET ?";
    let query = db.query(sql, data,(err, results) => {
      if(err) throw err;

      res.redirect('/admin/tables');
    });
});
route.get('/admin/tables/edit/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `Select * from users where id = ${userId}`;
    let query = db.query(sql,(err, result) => {
        if(err) throw err;
        res.render('admin/user_edit', {
            title : 'Admin-tables',
            user : result[0]
        });
    });
});
route.get('/admin/products/edit/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `Select * from products where pid = ${userId}`;
    let query = db.query(sql,(err, result) => {
        if(err) throw err;
        res.render('admin/Product_edit', {
            title : 'Admin-Products',
            user : result[0]
        });
    });
});
route.get('/admin/category/edit/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `Select * from categories where id = ${userId}`;
    let query = db.query(sql,(err, result) => {
        if(err) throw err;
        res.render('admin/cat_edit', {
            title : 'Admin-Categories',
            user : result[0]
        });
    });
});
route.post('/admin/tables/update',(req, res) => {
    const userId = req.body.id;
    let sql = "update users SET name='"+req.body.name+"',  email='"+req.body.email+"' where id ="+userId;
    let query = db.query(sql,(err, results) => {
      if(err) throw err;
      res.redirect('/admin/tables');
    });
});
route.post('/admin/products/update',(req, res) => {
    const userId = req.body.pid;
    let sql = "update products SET title='"+req.body.title+"',  details='"+req.body.details+"', price='"+req.body.price+"',picture='"+req.body.price+"',display='"+req.body.display+"' where pid ="+userId;
    let query = db.query(sql,(err, results) => {
      if(err) throw err;
      res.redirect('/admin/products');
    });
});

route.get('/admin/tables/delete/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from users where id = ${userId}`;
    let query = db.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/admin/tables');
    });
});
route.get('/admin/products/delete/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from products where pid = ${userId}`;
    let query = db.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/admin/products');
    });
});
route.post('/admin/category/update',(req, res) => {
    const userId = req.body.id;
    let sql = "update categories SET name='"+req.body.name+"' where id ="+userId;
    let query = db.query(sql,(err, results) => {
      if(err) throw err;
      res.redirect('/admin/categories');
    });
});
route.get('/admin/category/delete/:userId',(req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from categories where id = ${userId}`;
    let query = db.query(sql,(err, result) => {
        if(err) throw err;
        res.redirect('/admin/categories');
    });
});
module.exports = route;