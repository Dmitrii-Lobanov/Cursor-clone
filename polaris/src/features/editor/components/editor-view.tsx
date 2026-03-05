import { Id } from "../../../../convex/_generated/dataModel"
import { TopNavigation } from "./top-navigation"

interface Props {
    projectId: Id<'projects'>
}

export const EditorView = ({ projectId }: Props) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center">
                <TopNavigation projectId={projectId} />
            </div>
        </div>
    )
}