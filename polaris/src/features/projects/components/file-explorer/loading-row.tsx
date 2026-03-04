import { cn } from "@/lib/utils";
import { getItemPadding } from "./constants";
import { Spinner } from "@/components/ui/spinner";

interface Props {
    className?: string;
    level?: number;
}

export const LoadingRow = ({ className, level = 0 }: Props) => {
    return (
        <div 
            className={cn(
                'h-5.5 flex items-center text-muted-foreground',
                className
            )}
            style={{
                paddingLeft: getItemPadding(level, true)
            }}
        >
            <Spinner className="size-4 text-ring ml-0.5" />
        </div>
    )
}