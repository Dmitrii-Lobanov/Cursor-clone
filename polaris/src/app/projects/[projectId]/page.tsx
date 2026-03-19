import { ProjectIdView } from "@/features/projects/components/project-id-view";
import { Id } from "../../../../convex/_generated/dataModel";

interface Props {
    params: Promise<{ projectId: string }>
}

const ProjectIdPage = async ({
    params
}: Props) => {
    const { projectId } = await params;

    return <ProjectIdView projectId={projectId as Id<"projects">} />
}

export default ProjectIdPage;