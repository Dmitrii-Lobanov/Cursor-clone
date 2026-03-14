import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import { NonRetriableError } from "inngest";
import { CODING_AGENT_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { createAgent, gemini } from '@inngest/agent-kit';

interface MessageEvent {
    messageId: Id<'messages'>;
    conversationId: Id<'conversations'>;
    projectId: Id<'projects'>;
    message: string;
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
            conversationId,
            projectId,
            message,
        } = event.data as MessageEvent;

        await step.sleep('wait-for-db-sync', '1s');

        // Get conversation for title generation check
        const converation = await step.run('get-conversation', async () => {
            return await convex.query(api.system.getConversationById, {
                conversationId,
            });
        });

        if (!converation) {
            throw new NonRetriableError('Conversation not found');
        }

        // Fetch recent messages for conversation context
        const recentMessages = await step.run('get-recent-messages', async () => {
            return await convex.query(api.system.getRecentMessages, {
                conversationId,
                limit: 10,
            });
        });

        // Build system prompt with conversation history 
        // (exclude the current processing message)
        let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;

        // Filter out the current processing message and empty messages
        const contextMessages = recentMessages
            .filter((m) => m._id !== messageId && m.content.trim() !== '');

        if (contextMessages.length > 0) {
            const history = contextMessages
                .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
                .join('\n');

            systemPrompt += `\n\n##Previous Conversation (for context only - do NOT repeat those 
            responses):\n${history}\n\n##Current Request:\nRespond ONLY to the user's new message below.
            Do not repeat or referenceyour  previous responses.`;
        }

        // Generate conversation title if it's still the default
        const shouldGenerateTitle = converation.title === DEFAULT_CONVERSATION_TITLE;

        if (shouldGenerateTitle) {
            const titleAgent = createAgent({
                name: 'title-generator',
                system: TITLE_GENERATOR_SYSTEM_PROMPT,
                model: gemini({
                    model: 'gemini-2.0-flash-lite',
                    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
                })
            });

            const { output } = await titleAgent.run(
                message, { step }
            );

            const textMessage = output.find((m) => m.type === 'text' && m.role === 'assistant');

            if (textMessage?.type === 'text') {
                const title = typeof textMessage.content === 'string'
                    ? textMessage.content.trim()
                    : textMessage.content.map((c) => c.text)
                        .join('')
                        .trim();

                if (title) {
                    await step.run('update-conversation-title', async () => {
                        await convex.mutation(api.system.updateConversationTitle, {
                            conversationId,
                            title,
                        });
                    });
                }
            }
        }

        await step.run('update-assistant-mesage', async () => {
            await convex.mutation(api.system.updateMessageContent, {
                messageId,
                content: 'AI processed this message',
            });
        });
    },
);