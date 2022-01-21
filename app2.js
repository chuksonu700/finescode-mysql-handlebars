//importing the required modules
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const session = require('express-session');
const mysql = require('mysql');
const mySqlStore = require('express-mysql-session')(session);
const passport = require('passport')
const Strategy = require('passport-local').Strategy;
const morgan  =require('morgan');
const cookieParser = require('cookie-parser');
const Handlebars = require('handlebars');
const {engine} = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const path = require('path');
//Setting up env files
dotenv.config();

//setting up passport
require('./helpers/passport')(passport)

//mysql database connection
const db = require('./helpers/db');
const connection = mysql.createConnection(db.options);
const sessionStore = new mySqlStore({},connection)

const app = express()

//setting up express
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(morgan('dev'));

app.engine('.handlebars', engine({
    defaultLayout: 'main',
    extname: '.handlebars',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
// // Setting up the middle ware
app.set('view engine', 'handlebars');
app.set('views','./views')

// ..public folders
const dir = path.join(__dirname, 'public');
app.use(express.static(dir));

//sesion setup
app.use(session({
    resave:true,
    saveUninitialized: true,
    store:sessionStore,
    secret: db.secret
}));

app.use(passport.initialize())
app.use(passport.session())

// Setting up user as local variable so you can use it any where
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});
//testing 
app.get('/', (req,res,next)=>{
    if(req.user){
        res.redirect('/dashboard')
    } else{
        res.render('land')
    }
})

//setting up cookies parser
app.use(cookieParser())
//importing our routes
const api= require('./routes/routes');
app.use(api);
const PORTS = process.env.PORT || 3035

// starting the server
app.listen(PORTS,()=>{
    console.log(`Server started on ${PORTS}`)
})