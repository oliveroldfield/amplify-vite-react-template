import { defineAuth } from '@aws-amplify/backend';
import { defineFunction } from '@aws-amplify/backend-function';
import { RekognitionClient, CreateFaceLivenessSessionCommand } from '@aws-sdk/client-rekognition';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */

// Define the createFaceLiveNessSession Lambda function
export const createFaceLiveNessSession = defineFunction({
  name: 'createFaceLiveNessSession',
  handler: async (event) => {
    const rekognition = new RekognitionClient({ region: 'us-east-1' }); // Replace with your desired region
    /* const input = {         
        Settings: { 
          OutputConfig: { // LivenessOutputConfig
            S3Bucket: "STRING_VALUE", // required
            S3KeyPrefix: "STRING_VALUE",
          },
          AuditImagesLimit: Number("4"),
        },
        ClientRequestToken: "STRING_VALUE",
      }; */
    try {
      //const command = new CreateFaceLivenessSessionCommand(input);
      const command = new CreateFaceLivenessSessionCommand({});
      const response = await rekognition.send(command);

      return {
        statusCode: 200,
        body: JSON.stringify({
          sessionId: response.SessionId,
          // Include other relevant session details if needed
        }),
      };
    } catch (error) {
      console.error('Error creating face liveness session:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to create face liveness session' }),
      };
    }
  },
});