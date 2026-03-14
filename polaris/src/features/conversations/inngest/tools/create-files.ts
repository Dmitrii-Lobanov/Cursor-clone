import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface CreateFilesTooloptions {
    projectId: Id<'projects'>;
}

const paramsSchema = z.object({
    parentId: z.string(),
    files: z.array(z.object({
        name: z.string().min(1, 'File name cannot be empty'),
        content: z.string(),
    })).min(1, 'At least one file must be provided'),
});

export const createCreateFilesTool = ({ projectId }: CreateFilesTooloptions) => {
    return createTool({
        name: 'createFiles',
        description: `Create multiple files at once in the same folder. Use this to batch create
        files that share the same parent folder. More efficient than creating files one by one.`,
        parameters: z.object({
            parentId: z.string().describe(`The ID of the parent folder. Use empty string for root level. 
                Must be a valid folder ID from listFiles.`),
            files: z.array(z.object({
                name: z.string().describe('The file name including the extension'),
                content: z.string().describe('The content of the file'),
            })).describe('An array of files to create'),
        }),
        handler: async (params, { step: toolStep }) => {
            const parsed = paramsSchema.safeParse(params);

            if (!parsed.success) {
                return `Error: ${parsed.error.issues[0].message}`;
            }

            const { parentId, files } = parsed.data;

            const parentFolder = await convex.query(api.system.getFileById, {
                fileId: parentId as Id<'files'>,
            });

            try {
                return await toolStep?.run('create-files', async () => {
                    let resolvedParentId: Id<'files'> | undefined = undefined;

                    if (parentId && parentId !== '') {
                        try {
                            resolvedParentId = parentId as Id<'files'>;

                            const parentFolder = await convex.query(
                                api.system.getFileById, {
                                fileId: resolvedParentId,
                            }
                            );

                            if (!parentFolder) {
                                return `Error: Folder with ID ${parentId} not found. Use listFiles to get valid folder IDs.`;
                            }

                            if (parentFolder.type !== 'folder') {
                                return `Error: File with ID ${parentId} is a file, not a folder. Use a folder ID as parentId.`;
                            }
                        } catch {
                            return `Error: Invalid parentId ${parentId}. Use listFiles to get valid folder IDs, or use empty 
                            string for root.`;
                        }
                    }

                    const results = await convex.mutation(api.system.createFiles, {
                        projectId,
                        parentId: resolvedParentId,
                        files,
                    });

                    const created = results.filter((f) => !f.error);
                    const failed = results.filter((f) => f.error);

                    let response = `Created ${created.length} files`;

                    if (created.length > 0) {
                        response += `: ${created.map((f) => f.name).join(', ')}`;
                    }

                    if (failed.length > 0) {
                        response += `\nFailed: ${failed.map((f) => `${f.name}: ${f.error}`).join(', ')}`;
                    }

                    return response;
                });
            } catch (error) {
                return `Error creating files: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        },
    });
}