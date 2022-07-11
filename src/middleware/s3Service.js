const { S3 } = require('aws-sdk')

exports.s3Upload = async files => {
  const s3 = new S3()
  const params = files.map(file => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${`${new Date().getTime()}.jpg`}`,
      Body: file.buffer
    }
  })
  return await Promise.all(params.map(param => s3.upload(param).promise()))
}

const { S3Client } = require('@aws-sdk/client-s3')
const REGION = process.env.AWS_REGION
const s3Client = new S3Client({ region: REGION })
module.exports = { s3Client }
