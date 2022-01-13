const { request } = require("express");
const Strategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const db = require('./db')

const connection = mysql.createConnection(db.options);

module.exports = function(passport) {
    // setting up the local strategy
    passport.use(
        "local-login",
        new Strategy({
                usernameField: "email",
                passwordField: "password",
                passReqToCallback: true
            },
            function(req, email, password, done) {
                connection.query(
                    "SELECT * FROM users WHERE email=?",[email],
                    function(err, rows) {
                        if (err) return done(err);
                        if (!rows.length) {
                            console.log("loginMessage No user found.")
                            return done(
                                null,
                                false,
                                req.flash("loginMessage", "No user found.")
                            );
                        }
                        bcrypt.compare(password, rows[0].password, (err, isMatch) => {
                            if (err) throw err;
                            if (isMatch) {
                                return done(null, rows[0])
                            } else {
                                console.log("loginMessage Incorrect Password")
                                return done(null, false, { message: "Password Is Not Correct" })
                            }
                        })
                    }
                );
            }
        )
    );

    // Passport session
    // Required for persistent login sessions
    // Serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    });
    // Deserialize the user
    passport.deserializeUser(function(id, done) {
        connection.query("select * from users where id =? ",[id], function( err,rows) {
            console.log(rows)
            done(null, rows[0]);
        });
    });

}