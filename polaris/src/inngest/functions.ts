import { generateText } from "ai";
import { inngest } from "./client";
import { google } from "@ai-sdk/google";
import { firecrawl } from "@/lib/firecrawl";
import { fi } from "date-fns/locale";
// import { anthropic } from "@ai-sdk/anthropic";

const URL_REGEX = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    const { prompt } = event.data as { prompt: string };

        const urls = await step.run('extract-urls', async () => {
            return prompt.match(URL_REGEX) ?? [];
        }) as string[];

        const scrapedContent = await step.run('scrape-urls', async () => {
            const results = await Promise.all(
                urls.map(async (url) => {
                    const result = await firecrawl.scrape(
                        url,
                        { formats: ['markdown'] }
                    )

                    return result?.markdown ?? null;
            }));

            return results.filter(Boolean).join('\n\n');
        });

        const finalPrompt = scrapedContent ? 
        `Context:\n${scrapedContent}\n\nQuestion:\n${prompt}` : 
        prompt;

    await step.run("generate-text", async () => {
        return await generateText({
            model: google('gemini-2.5-flash'),
            prompt: finalPrompt,
        })

        // Anthropic integration
        // return await generateText({
        //     model: anthropic('claude-3-haiku-20240307'),
        //     prompt: 'Write a vegetarian lasagna recipe for 4 people.',
        // })
    });
  },
);

export const demoError = inngest.createFunction(
    { id: "demo-error" },
    { event: "demo/error" },
    async ({ step }) => {
        await step.run('fail', async () => {
            throw new Error('Inngest error: Background job failed!');
        })
    },
)