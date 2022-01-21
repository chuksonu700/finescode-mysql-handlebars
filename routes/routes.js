const router = require('express').Router();
const async = require('async');
const bcrypt = require('bcrypt');
const mySql = require('mysql');
const passport = require('passport');
const { ensureAuthenticated } = require('../helpers/auth')

const db = require('../helpers/db');
const connection = mySql.createConnection(db.options)

router.route('/login')
    .get((req, res, next) => {
        res.render('login')
    })
    .post((req, res, next) => {
        passport.authenticate('local-login', {
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next)
    });


// creating admin account
router.route('/signup')
    .post((req, res, next) => {
        console.log(req.body)
        //making Sure email and password are unique
        connection.query("SELECT * FROM users WHERE mobile_number=? or email=?",[req.body.phone_no,req.body.email], function(err,data){

        if (err) {
            console.log(err);
            res.status(500).send('internal server error')
        } else {
              
             if (data.length>0){
                if(data[0].email===req.body.email){
                    let message={
                        error:'Email already exist please Login'
                    }
                    res.send(message);
                    return
                } else{
                    let message={
                        error:'Phone number already exist please Login'
                    }
                    res.send(message);
                    return
                }
            } else{
                // check if there is a referal
            const referal = Object.keys(req.body);
            if (referal.indexOf('refered_by')>-1 && req.body.refered_by.length>0){
                connection.query("SELECT * FROM users WHERE id=?",[req.body.refered_by], function(err,rows){
                    if (err) {
                        console.log(err);
                        res.status(500).send('internal server error')
                    } else {
                        if(rows.length>0){

                        }else {

                        }

                        
                        const previousEntry = rows[0].entry;
                        const newEntry= previousEntry+10;
                         connection.query("UPDATE users set entry=? where id=?",[newEntry,req.body.refered_by], function(err,rows){
                            if (err) {
                                console.log(err);
                                res.status(500).send('internal server error')
                            } else {
                                const full_name= req.body.firstname+' '+req.body.lastname;
                                let password = req.body.password
                                // password bcrypt.hash
                                bcrypt.genSalt(10, (err, salt) => {
                                    // hashing the password
                                    bcrypt.hash(password, salt, (err, hash) => {
                                         // store in database
                                         if (err) throw err;
                                         password = hash;
                                         connection.query("INSERT INTO users(full_name,email,mobile_number,password,refered_by) values(?,?,?,?,?)",[full_name,req.body.email,req.body.phone_no,password,req.body.refered_by], function(err, rows){
                                            if (err) {
                                               console.log(err);
                                              res.status(500).send('internal server error')
                                            } else {
                                                connection.query("SELECT id from users where email=?",[req.body.email,], function(err, rows){
                                                    if (err) {
                                                       console.log(err);
                                                      res.status(500).send('internal server error')
                                                    } else {
                                                        //creating share links for the new user
                                                        let userId=rows[0].id;
                                                        let newLink = `https://warm-peak-58434.herokuapp.com?r=${rows[0].id}`;
                
                                                        connection.query("UPDATE users SET share_link=? where id=?",[newLink,userId], function(err, rows){
                                                            if (err) {
                                                               console.log(err);
                                                              res.status(500).send('internal server error')
                                                            } else {
                                                                console.log('finished')
                                                                res.redirect('./login')
                                                            }})
                                                        
                                                    } });
                                            }
                                         });
                                    })
                                })
                            }
                        });
                    };
                });
            } else{
                const full_name= req.body.firstname+' '+req.body.lastname;
                let password = req.body.password
                // password bcrypt.hash
                bcrypt.genSalt(10, (err, salt) => {
                    // hashing the password
                    bcrypt.hash(password, salt, (err, hash) => {
                         // store in database
                         if (err) throw err;
                         password = hash;
                         connection.query("INSERT INTO users(full_name,email,mobile_number,password) values(?,?,?,?)",[full_name,req.body.email,req.body.phone_no,password], function(err, rows){
                            if (err) {
                               console.log(err);
                              res.status(500).send('internal server error')
                            } else {

                                connection.query("SELECT id from users where email=?",[req.body.email,], function(err, rows){
                                    if (err) {
                                       console.log(err);
                                      res.status(500).send('internal server error')
                                    } else {
                                        //creating share links for the new user
                                        let userId=rows[0].id;
                                        let newLink = `https://warm-peak-58434.herokuapp.com?r=${rows[0].id}`;

                                        connection.query("UPDATE users SET share_link=? where id=?",[newLink,userId], function(err, rows){
                                            if (err) {
                                               console.log(err);
                                              res.status(500).send('internal server error')
                                            } else {
                                                console.log('finished')
                                                res.redirect('./login')
                                            }})
                                        
                                    } });
                            }
                         });
                    })
                })
            }
            }
             
        }            
    })    
})

router.get('/dashboard', ensureAuthenticated, (req, res, next) => {
    connection.query("SELECT entry, role, share_link, full_name FROM users WHERE id=?",[req.user.id],function(err,rows){
        if (err) {
            console.log(err);
            res.status(500).send('internal server error')
        } else {
            res.render('dashboard',{rows:rows})
        }
    })
});



router.get('/admin-view-results',(req,res,next)=>{
    connection.query("SELECT entry, full_name, email, mobile_number FROM users ORDER BY entry DESC LIMIT 15",function(err,data){
        if (err) {
            console.log(err);
            res.status(500).send('internal server error')
        } else {
            res.render('admin',{rows:data})
        }
    })
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
    return
});

module.exports = router;