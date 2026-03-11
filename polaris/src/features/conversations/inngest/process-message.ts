import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { NonRetriableError } from "inngest";

interface MessageEvent {
    messageId: Id<'messages'>;
}

export const processMessage = inngest.createFunction(
    {
        id: 'process-message',
        cancelOn: [{
            event: 'message/cancel',
            if: "event.data.messageId == async.data.messageId",
        }],
        onFailure: async ({ event, step }) => {
            const { messageId } = event.data.event.data as MessageEvent;

            await step.run('update-message-on-failure', async () => {
                await convex.mutation(api.system.updateMessageContent, {
                    messageId,
                    content: `My apologies, I encountered an error while processing your request. 
                    Let me know if you need anything else.`
                });
            });
        },
    },
    {
        event: 'message/sent',
    },
    async ({ event, step }) => {
        const {
            messageId,
        } = event.data as MessageEvent;

        await step.sleep('wait-for-ai-processing', '5s');

        await step.run('update-assistant-mesage', async () => {
            await convex.mutation(api.system.updateMessageContent, {
                messageId,
                content: 'AI processed this message',
            });
        });
    },
);