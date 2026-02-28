// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://034de80bab06ec25a1d3ce6fe3707a99@o4510964701986816.ingest.us.sentry.io/4510964707622912",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  integrations: [
      Sentry.vercelAIIntegration,
      Sentry.consoleLoggingIntegration({
        // Capture logs of all levels (debug, info, warning, error)
        levels: ["debug", "warn", "error"],
      }),
    ]
});
