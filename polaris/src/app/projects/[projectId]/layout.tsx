import { ProjectIdLayout } from "@/features/projects/components/project-id-layout";
import { Id } from "../../../../convex/_generated/dataModel";

interface Props {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>
}

const Layout = async ({ children, params }: Props) => {
    const { projectId } = await params;

    return (
        <ProjectIdLayout projectId={projectId as Id<"projects">}>
            {children}
        </ProjectIdLayout>
    )
}

export default Layout;