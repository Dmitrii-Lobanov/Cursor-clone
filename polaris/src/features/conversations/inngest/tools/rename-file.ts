import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const paramsSchema = z.object({
    fileId: z.string().min(1, 'File ID is required'),
    name: z.string().min(1, 'File name is required'),
});

export const createRenameFileTool = () => {
    return createTool({
        name: 'renameFile',
        description: 'Rename a file or folder.',
        parameters: z.object({
            fileId: z.string().min(1, 'The ID of the file or folder to rename'),
            name: z.string().min(1, 'New name for the file or folder'),
        }),
        handler: async (params, { step: toolStep }) => {
            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error: ${parsed.error.issues[0].message}`;
            }

            const { fileId, name } = parsed.data;

            const file = await convex.query(api.system.getFileById, {
                fileId: fileId as Id<'files'>,
            });

            if (!file) {
                return `Error: File with ID ${fileId} not found. Use listFiles to get valid fileIDs.`;
            }

            try {
                return await toolStep?.run('rename-file', async () => {
                    await convex.mutation(api.system.renameFile, {
                        fileId: fileId as Id<'files'>,
                        newName: name,
                    });

                    return `Renamed ${file.name} with ID ${fileId} to ${name} successfully.`;
                });
            } catch (error) {
                return `Error renaming file: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        },
    });
}