import { inngest } from "@/inngest/client";

export async function POST() {
    await inngest.send({
      name: "demo/generate",
      data: {},
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
    }
    })

return Response.json({  status: 'started' });
}