import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createSession } from './functions/createSession/resource';
import { getResults } from './functions/getResults/resource';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";

const backend = defineBackend({
  auth,
  data,
  createSession,
  getResults
});

const livenessStack = backend.createStack("liveness-stack");

const livenessPolicy = new Policy(livenessStack, "LivenessPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["rekognition:*"],
      resources: ["*"],
    }),
  ],
});
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(livenessPolicy); // allows guest user access
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(livenessPolicy); // allows logged in user access

const myRestApi = new RestApi(livenessStack, "RestApi", {
  restApiName: "myRestApi",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: ["https://main.djrc89gikdzym.amplifyapp.com"], // Restrict this to domains you trust
    allowMethods: Cors.ALL_METHODS, // Specify only the methods you need to allow
    allowHeaders: Cors.DEFAULT_HEADERS, // Specify only the headers you need to allow
  },
});

const createSessionLambda = backend.createSession.resources.lambda;
const getResultsLambda = backend.getResults.resources.lambda;

const statement = new PolicyStatement({
  sid: "AllowRekognition",
  actions: ["regoknition:*"],
  resources: ["*"],
})

createSessionLambda.addToRolePolicy(statement);
getResultsLambda.addToRolePolicy(statement);

const createSessionLambdaIntegration = new LambdaIntegration(
  createSessionLambda
);
const getResultsLambdaIntegration = new LambdaIntegration(
  getResultsLambda
);


// create a new resource path with IAM authorization
const sessionPath = myRestApi.root.addResource("session", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});

// create a new resource path with IAM authorization
const resultsPath = myRestApi.root.addResource("results", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.IAM,
  },
});

sessionPath.addMethod("GET", createSessionLambdaIntegration);
sessionPath.addMethod("POST", createSessionLambdaIntegration);
sessionPath.addMethod("DELETE", createSessionLambdaIntegration);
sessionPath.addMethod("PUT", createSessionLambdaIntegration);

resultsPath.addMethod("GET", getResultsLambdaIntegration);
resultsPath.addMethod("POST", getResultsLambdaIntegration);
resultsPath.addMethod("DELETE", getResultsLambdaIntegration);
resultsPath.addMethod("PUT", getResultsLambdaIntegration);

// add a proxy resource path to the API
sessionPath.addProxy({
  anyMethod: true,
  defaultIntegration: createSessionLambdaIntegration,
});

// add a proxy resource path to the API
resultsPath.addProxy({
  anyMethod: true,
  defaultIntegration: getResultsLambdaIntegration,
});

// create a new IAM policy to allow Invoke access to the API
const apiRestPolicy = new Policy(livenessStack, "RestApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [
        `${myRestApi.arnForExecuteApi("*", "/items", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/items/*", "dev")}`,
        `${myRestApi.arnForExecuteApi("*", "/cognito-auth-path", "dev")}`,
      ],
    }),
  ],
});

backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  apiRestPolicy
);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [myRestApi.restApiName]: {
        endpoint: myRestApi.url,
        region: Stack.of(myRestApi).region,
        apiName: myRestApi.restApiName,
      },
    },
  },
});