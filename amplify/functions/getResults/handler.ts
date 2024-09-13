import { RekognitionClient, GetFaceLivenessSessionResultsCommand } from "@aws-sdk/client-rekognition";
import type { APIGatewayProxyHandler, Handler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event, context) => {
    const rekognition = new RekognitionClient({ region: 'us-east-1' });
    const sessionId = event.sessionId;
    console.log({ context });

    try {
      const command = new GetFaceLivenessSessionResultsCommand({ SessionId: sessionId });
      const response = await rekognition.send(command);
      
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Restrict this to domains you trust
          "Access-Control-Allow-Headers": "*", // Specify only the headers you need to allow
        },
        body: JSON.stringify({ status: response.Status })
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to get session results' })
      };
    }
  };
