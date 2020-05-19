'use strict'

const aws = require('aws-sdk')

const dynamoDB = new aws.DynamoDB.DocumentClient()

module.exports.getallelements = (event, context, callback) => {
    var params = {
        TableName: 'lambda-textract-dev'
    };

    const onScan = (err, data) => {

        if (err) {
            return callback(err, {
                statusCode: 500,
                body: JSON.stringify({
                    isSuccess: false,
                    data: []
                })
            });
        } else {
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    isSuccess: true,
                    data: data.Items
                })
            });
        }

    };

    dynamoDB.scan(params, onScan);
};