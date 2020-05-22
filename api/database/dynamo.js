'use strict'

const uuid = require('uuid')
const aws = require('aws-sdk')
const moment = require('moment')

aws.config.setPromisesDependency(require('bluebird'))

const dynamoDB = new aws.DynamoDB.DocumentClient();

const InsertObject = (Object, URL) => {
    console.info('Objeto function insertObject: ', Object)
    return new Promise((respond, errorobj) => {
        submitContratoC(contratoInfo(Object, URL))
            .then(res => {
                respond({
                    statusCode: 200,
                    contrato: res
                })
            })
            .catch(err => {
                console.info(err)
                errorobj({
                    statusCode: 500,

                })
            })
    })

}

const submitContratoC = contratoIns => {
    const contratoInfo = {
        TableName: 'proyectofinalIS-dev',
        Item: contratoIns
    }

    return dynamoDB.put(contratoInfo).promise()
        .then(res => contratoIns)
}

const contratoInfo = (Contrato, URL) => {
    let timeInsert = moment().format('YYYY-MM-DD')
    let timeStamp = new Date().getTime()
    const AddInfo = {
        url: URL,
        id: uuid.v1(),
        submitedAt: timeInsert,
        updateAt: timeInsert,
        exactSubmitted: timeStamp,
        exactUpdated: timeStamp,
    };

    const elementContrato = Object.assign(Contrato, AddInfo);
    return elementContrato;
}

module.exports = InsertObject;