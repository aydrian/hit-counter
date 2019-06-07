import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const domain = "aydrian.moolumi.io"

// Create an AWS resource (DynamoDB Table)
const pageViews = new aws.dynamodb.Table('page-views', {
  attributes: [
    { name: 'id', type: 'S'}
  ],
  hashKey: 'id',
  billingMode: 'PAY_PER_REQUEST'
});

// Create an Internet-facing HTTP API
const endpoint = new awsx.apigateway.API("hit-counter", {
  stageName: pulumi.getStack(),
  staticRoutesBucket: {
    website: {
      indexDocument: "index.html",
      errorDocument: "index.html"
    }
  },
  routes: [
    {
      path: '/',
      localPath: "../build"
    },
    {
      path: '/views',
      method: 'GET',
      eventHandler: async event => {
        try {
          const client = new aws.sdk.DynamoDB.DocumentClient()
          // Get hits to return
          const scanResult = await client.scan({TableName: pageViews.name.get()}).promise()
          return {
            statusCode: 200,
            body: JSON.stringify({
              items: scanResult.Items,
              count: scanResult.Count
            })
          }
        } catch (err) {
          console.log(`POST /hit-me error: $err.stack}`)
          return {
            statusCode: 500,
            body: 'An error occurred, please check the Pulumi Logs'
          }
        }
      }
    },
    {
      path: '/hit-me',
      method: 'POST',
      eventHandler: async event => {
        const { headers: { "User-Agent": userAgent}, requestContext: {requestTime, requestId, identity: { sourceIp } }} = event;
        try {
          const client = new aws.sdk.DynamoDB.DocumentClient()
          // Write new hit
          await client.put({
            TableName: pageViews.name.get(),
            Item: {
              id: requestId,
              userAgent,
              requestTime,
              sourceIp
            }
          }).promise()
          return {
            statusCode: 201,
            body: ""
          }
        } catch (err) {
          console.log(`POST /hit-me error: $err.stack}`)
          return {
            statusCode: 500,
            body: 'An error occurred, please check the Pulumi Logs'
          }
        }
      }
    }
  ]
});

export const url = endpoint.url;