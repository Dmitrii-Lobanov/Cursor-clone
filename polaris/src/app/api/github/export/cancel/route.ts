import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { convex } from "@/lib/convex-client";
import { inngest } from "@/inngest/client";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const requestSchema = z.object({
  projectId: z.string(),
});

export const POST = async (request: Request) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId } = requestSchema.parse(body);

  const event = await inngest.send({
    name: "github/export.cancel",
    data: {
      projectId,
    },
  });

  // Update status to cancelled
  await convex.mutation(api.system.updateExportStatus, {
    projectId: projectId as Id<"projects">,
    status: "cancelled",
  });

  return NextResponse.json({ 
    success: true, 
    projectId, 
    eventId: event.ids[0]
  });
};