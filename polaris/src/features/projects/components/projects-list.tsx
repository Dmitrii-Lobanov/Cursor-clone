import { Spinner } from "@/components/ui/spinner";
import { useProjectsPartial } from "../hooks/use-projects";
import { Kbd } from "@/components/ui/kbd";
import { Doc } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { AlertCircleIcon, ArrowRightIcon, GlobeIcon, Loader2Icon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FaGithub } from "react-icons/fa";
import { get } from "http";
import { Button } from "@/components/ui/button";

interface Props {
    onViewAll: () => void;
}

const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

const getProjectIcon = (project: Doc<"projects">) => {
    if (project.importStatus === 'completed') {
        return <FaGithub className="size-3.5 text-muted-foreground" />
    }

    if (project.importStatus === 'failed') {
        return <AlertCircleIcon className="size-3.5 text-muted-foreground" />
    }

    if (project.importStatus === 'importing') {
        return <Loader2Icon className="size-3.5 text-muted-foreground" />
    }

    return <GlobeIcon className="size-3.5 text-muted-foreground" />
}

const ContinueCard = ({ data }: { data: Doc<"projects"> }) => {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
                Last updated
            </span>

            <Button
                variant="outline"
                asChild
                className="h-auto items-start justify-start p-4
                    bg-background border flex flex-col gap-2 rounded-none"
            >
                <Link href={`/projects/${data._id}`} className="group">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            {getProjectIcon(data)}
                            <span className="font-medium truncate">
                                {data.name}
                            </span>
                        </div>

                        <ArrowRightIcon className="size-4 text-muted-foreground 
                            group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    <span className="text-xs text-muted-foreground">
                        {formatTimestamp(data.updatedAt)}
                    </span>
                </Link>
            </Button>
        </div>
    )
}

const ProjectItem: React.FC<{ data: Doc<"projects"> }> = ({ data }) => {
    return (
        <Link 
            href={`/projects/${data._id}`}
            className="text-sm text-foreground/60 font-medium hover:text-foreground
                py-1 flex items-center justify-between w-full group"
        >
            <div className="flex items-center gap-2">
                {getProjectIcon(data)}
                <span className="truncate">{data.name}</span>
            </div>

            <span className="text-xs text-muted-foreground 
                group-hover:text-foreground/60 transition-colors">
                {formatTimestamp(data.updatedAt)}
            </span>
        </Link>
    )
}

export const ProjectsList: React.FC<Props> = ({ onViewAll }) => {
    const projects = useProjectsPartial(6);

    if (projects === undefined) {
        return <Spinner className="size-4 text-ring" />
    }

    const [ mostRecent, ...rest ] = projects;

    return (
        <div className="flex flex-col gap-4">
            {mostRecent ? <ContinueCard data={mostRecent} /> : null}

            {rest.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                            Recent projects
                        </span>

                        <button
                            onClick={onViewAll}
                            className="flex items-center gap-2 text-muted-foreground text-xs
                                hover:text-foreground transition-colors"
                        >
                            <span>View All</span>
                            <Kbd className="bg-accent border">
                                ⌘K
                            </Kbd>
                        </button>
                    </div>

                    <ul className="flex flex-col">
                        {rest.map((project) => (
                            <ProjectItem
                                key={project._id}
                                data={project}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}