const mysql = require('serverless-mysql')({
    config: {
        host: 'database-proyectois.crd0mpjwh4ir.us-east-1.rds.amazonaws.com',
        user: 'admin',
        password: 'AKIAR6WS7TRTU2DNEYXF',
        port: 3305,
        database: 'audit'
    }
})
module.exports = mysql;