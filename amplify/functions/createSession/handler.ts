import {
  RekognitionClient,
  CreateFaceLivenessSessionCommand,
} from '@aws-sdk/client-rekognition';
import type { Handler } from 'aws-lambda';

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

export const handler: Handler = async (event, context) => {
  console.log({ context });
  console.log({ event });
  const client = new RekognitionClient({ region: 'us-east-1' });
  const command = new CreateFaceLivenessSessionCommand({});
  const response = await client.send(command);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
    body: JSON.stringify({
      sessionId: response.SessionId,
    }),
  };
};