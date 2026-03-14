import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface ListFilesToolsOptions {
    projectId: Id<'projects'>;
}


export const createListFilesTool = ({ projectId }: ListFilesToolsOptions) => {
    return createTool({
        name: 'listFiles',
        description: `List all files and folders in the project. Returns names, IDs, types, and parentId
         for each item. Items with parentId: null are at root level. Use the parentId to understand the
         folder structure - items with the same parentId are in the same folder.`,
        parameters: z.object({}),
        handler: async (_, { step: toolStep }) => {
            try {
                return await toolStep?.run('list-files', async () => {
                    const files = await convex.query(api.system.getProjectFiles, {
                        projectId,
                    });

                    // Sort: folders first, then files, alphabetically
                    const sorted = files.sort((a, b) => {
                        if (a.type !== b.type) {
                            return a.type === 'folder' ? -1 : 1;
                        }

                        return a.name.localeCompare(b.name);
                    });

                    const fileList = sorted.map((file) => ({
                        id: file._id,
                        name: file.name,
                        type: file.type,
                        parentId: file.parentId ?? null,
                    }));

                    return JSON.stringify(fileList);
                });
            } catch (error) {
                return `Error listing files: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        },
    });
}