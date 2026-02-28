import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST() {
    const response = await generateText({
  model: google('gemini-2.5-flash'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  experimental_telemetry: {
    isEnabled: true,
    recordInputs: true,
    recordOutputs: true,
  }
});

return Response.json({  response });
}

// Anthropic integration
// export async function POST() {
//     const response = await generateText({
//   model: anthropic('claude-3-haiku-20240307'),
//   prompt: 'Write a vegetarian lasagna recipe for 4 people.',
// });

// return Response.json({  response });
// }