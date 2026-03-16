import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const paramsSchema = z.object({
    fileIds: z.array(z.string()).min(1, 'FileId cannot be empty')
        .min(1, 'Provide at least one file ID'),
});

export const createDeleteFilesTool = () => {
    return createTool({
        name: 'deleteFiles',
        description: `Delete files or folders from the project. If deleting a floder, all contents will be deleted recursively.`,
        parameters: z.object({
            fileIds: z.array(z.string()).describe(`Array of file or folder IDs to delete.`),
        }),

        handler: async (params, { step: toolStep }) => {
            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error: ${parsed.error.issues[0].message}`;
            }

            const { fileIds } = parsed.data;

            // Validate if all files exist
            const filesToDelete: { id: string, name: string, type: 'file' | 'folder' }[] = [];

            for (const fileId of fileIds) {
                const file = await convex.query(api.system.getFileById, { fileId: fileId as Id<'files'> });

                if (!file) {
                    return `Error: File with ID ${fileId} not found. Use listFiles to get valid file IDs.`;
                }

                filesToDelete.push({ id: file._id, name: file.name, type: file.type });
            }

            try {
                return await toolStep?.run('delete-files', async () => {
                    const results: string[] = [];

                    for (const file of filesToDelete) {
                        await convex.mutation(api.system.deleteFile, { fileId: file.id as Id<'files'> });
                        results.push(`Deleted ${file.type} ${file.name} successfully`);
                    }

                    return results.join('\n');
                });
            } catch (error) {
                return `Error deleting files: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        },
    });
}