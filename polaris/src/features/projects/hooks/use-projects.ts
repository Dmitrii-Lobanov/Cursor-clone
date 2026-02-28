import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

export const useProjects = () => {
    return useQuery(api.projects.get);
}

export const useProjectsPartial = (limit: number) => {
    return useQuery(api.projects.getPartial, { limit });
}

export const useCreateProject = () => {
    const userId = useAuth();

    return useMutation(api.projects.create).withOptimisticUpdate(
        (localStore, args) => {
            const existingProject = localStore.getQuery(api.projects.get);

            if (existingProject !== undefined) {
                const now = Date.now();

                const newProject = {
                    _id: crypto.randomUUID() as Id<"projects">,
                    _creationTime: now,
                    name: args.name,
                    ownerId: (userId || "anonymous") as unknown as string,
                    updatedAt: now,
                }

            localStore.setQuery(api.projects.get, {}, [newProject, ...existingProject]);
        }
    });
}