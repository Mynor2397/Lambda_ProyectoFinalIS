'use strict'

const uuid = require('uuid')
const aws = require('aws-sdk')

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
        TableName: 'lambda-textract-dev',
        Item: contratoIns
    }

    return dynamoDB.put(contratoInfo).promise()
        .then(res => contratoIns)
}

const contratoInfo = (Contrato, URL) => {
    const timestamp = new Date().getTime();
    const AddInfo = {
        url: URL,
        id: uuid.v1(),
        submitedAt: timestamp,
        updateAt: timestamp,
    };

    const elementContrato = Object.assign(Contrato, AddInfo);
    return elementContrato;
}

module.exports = InsertObject;