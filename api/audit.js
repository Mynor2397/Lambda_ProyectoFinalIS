// password from database
// AKIAR6WS7TRTU2DNEYXF
const AWS = require('aws-sdk')
const MysqlConnect = require('./database/mysqlConfig')
const sqs = new AWS.SQS({
    region: 'us-east-1'
})

module.exports.auditSQS = (event, context, callback) => {
    console.info(event.body)
    const queueUrl = `https://sqs.us-east-1.amazonaws.com/134660201575/audit`;
    const responseBody = {
        message: ""
    };
    let responseCode = 200;
    const params = {
        MessageBody: event.body,
        QueueUrl: queueUrl,
    };
    sqs.sendMessage(params, (error, data) => {
        if (error) {
            console.info(error)
            responseCode = 500;
        } else {
            console.info(data.MessageId)
            responseBody.message = `Enviado a ${queueUrl}`;
            responseBody.messageId = data.MessageId;
        }
        const response = {
            statusCode: responseCode,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(responseBody),
        };

        callback(null, response);
    });
}

module.exports.SaveOnMysql = async(event, context, callback) => {
    const data = event.Records[0].body;
    console.info(data)
    const datato = JSON.parse(data)
    console.info(datato.name)
    console.info(datato.password)
    console.info(datato.action)

    console.info('nombre: ', datato.name, 'password: ', datato.password, 'action: ', datato.action)
    try {
        const result = await MysqlConnect.query('CALL audit.addaudit(?,?,?)', [datato.name, datato.password, datato.action])
        await MysqlConnect.end();
        if (result) {
            console.info(result);
        } else {
            console.info('Failed query')
        }

    } catch (error) {
        console.info('Este es el: ', error);
    }
}