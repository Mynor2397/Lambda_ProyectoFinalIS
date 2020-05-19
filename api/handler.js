'use strict';

const _ = require('lodash')
const aws = require('aws-sdk')
const pipe = require('./helper/pipes')
const dynamoContrato = require('./database/dynamo')

const textract = new aws.Textract();
var s3 = new aws.S3()

const getText = (result, blocksMap) => {
    let text = "";

    if (_.has(result, "Relationships")) {
        result.Relationships.forEach(relationship => {

            if (relationship.Type === "CHILD") {

                relationship.Ids.forEach(childId => {

                    const word = blocksMap[childId];
                    if (word.BlockType === "WORD") {
                        text += `${word.Text} `;
                    }

                    if (word.BlockType === "SELECTION_ELEMENT") {
                        if (word.SelectionStatus === "SELECTED") {
                            text += `X `;
                        }
                    }

                });

            }

        });

    }

    return text.trim();
};

const findValueBlock = (keyBlock, valueMap) => {
    let valueBlock;
    keyBlock.Relationships.forEach(relationship => {
        if (relationship.Type === "VALUE") {

            relationship.Ids.every(valueId => {
                if (_.has(valueMap, valueId)) {
                    valueBlock = valueMap[valueId];
                    return false;
                }
            });
        }
    });

    return valueBlock;
};

const getKeyValueRelationship = (keyMap, valueMap, blockMap) => {
    // console.info('Esto es keyMap: ', keyMap)
    // console.info('Esto es valueMap: ', valueMap)
    // console.info('Esto es blockMap: ', blockMap)

    const keyValues = {};

    const keyMapValues = _.values(keyMap);
    keyMapValues.forEach(keyMapValue => {

        const valueBlock = findValueBlock(keyMapValue, valueMap);
        const key = getText(keyMapValue, blockMap);
        const value = getText(valueBlock, blockMap);

        keyValues[key] = value;
    });

    // console.info('Esto es keyvalues: ', keyValues);

    return keyValues;
};

const getKeyValueMap = blocks => {
    const keyMap = {};
    const valueMap = {};
    const blockMap = {};

    let blockId;
    blocks.forEach(block => {
        blockId = block.Id;
        blockMap[blockId] = block;

        if (block.BlockType === "KEY_VALUE_SET") {
            if (_.includes(block.EntityTypes, "KEY")) {
                keyMap[blockId] = block;
            } else {
                valueMap[blockId] = block;
            }
        }
    });

    // console.info('Function getKeyValueMap', keyMap, valueMap, blockMap)
    return { keyMap, valueMap, blockMap };
};


module.exports.uploadfile = (event, context, callback) => {
    const data = JSON.parse(event.body);
    console.info("Esto es la data", data.name, data.type)
    let s3 = new aws.S3();

    var s3Params = {
        Bucket: 'filesproyectismacm',
        Key: data.name,
        ContentType: data.type,
        ACL: 'public-read',
    };

    console.info(s3Params)
    var uploadURL = s3.getSignedUrl('putObject', s3Params)

    callback(null, {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ uploadURL: uploadURL })
    });
};


module.exports.contratos = async(event, context, callback) => {
    // console.info("Data del event: ", event);
    const data = JSON.parse(event.body);
    // console.info("Data en el event.body: ", data)
    const url = `https://filesproyectismacm.s3.amazonaws.com/${data.name}`

    var paramsObject = { Bucket: 'filesproyectismacm', Key: data.name }
    let dataBuffer = s3.getObject(paramsObject, function(err, data) {
        return data;
    });

    const buffer = await dataBuffer.promise()
    console.info(buffer.Body);

    const params = {
        Document: {
            Bytes: buffer.Body
        },
        FeatureTypes: ["FORMS"]
    }

    const request = textract.analyzeDocument(params);
    const resData = await request.promise();
    const textractResponse = JSON.parse(JSON.stringify(resData))

    if (textractResponse && textractResponse.Blocks) {
        const { keyMap, valueMap, blockMap } = getKeyValueMap(textractResponse.Blocks);

        const keyValues = getKeyValueRelationship(keyMap, valueMap, blockMap);
        let dataClear = await pipe(keyValues)


        try {
            const insertedObject = await dynamoContrato(dataClear, url);
            console.info('Esta es la respuesta del dynamoinsert-', insertedObject);

            return {
                statusCode: 200,
                body: JSON.stringify(insertedObject.contrato)
            }

        } catch (error) {

            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: error.message
                })
            }
        }

    }
}