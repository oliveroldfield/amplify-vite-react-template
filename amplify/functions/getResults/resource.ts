import { defineFunction } from '@aws-amplify/backend';

export const getResults = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'getResults',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts'
});