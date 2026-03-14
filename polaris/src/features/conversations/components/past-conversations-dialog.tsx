'use client';

import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConversations } from "../hooks/use-conversations";
import { CommandGroup } from "cmdk";
import { formatDistanceToNow } from "date-fns";

interface Props {
    projectId: Id<'projects'>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (conversationId: Id<'conversations'>) => void;
}

export const PastConversationsDialog = ({ projectId, open, onOpenChange, onSelect }: Props) => {
    const conversations = useConversations(projectId);

    const handleSelect = (conversationId: Id<'conversations'>) => {
        onSelect(conversationId);
        onOpenChange(false);
    };

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            title='Past Conversations'
            description="Search and select a past conversation"
        >
            <CommandInput placeholder="Search conversations..." />
            <CommandList>
                <CommandEmpty>No conversations found.</CommandEmpty>
                <CommandGroup heading="Conversations">
                    {conversations?.map((conversation) => (
                        <CommandItem
                            key={conversation._id}
                            value={`${conversation.title}-${conversation._id}`}
                            onSelect={() => handleSelect(conversation._id)}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span>{conversation.title}</span>
                                {formatDistanceToNow(conversation._creationTime, {
                                    addSuffix: true,
                                })}
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
