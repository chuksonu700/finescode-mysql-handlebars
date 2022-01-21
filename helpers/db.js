const ENV=process.env;

//export the db connection
module.exports = {
    options: {
        host: ENV.HOST,
        user: ENV.USER,
        password: ENV.PASSWORD,
        database: ENV.DATABASE,
        port: ENV.MYSQL_PORTS,
    },
    secret: ENV.SECRET
}