import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {getLocaleFromRequest} from '~/lib/i18n';

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
} as const;

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}
}

/**
 * Creates Hydrogen context compatible with both Oxygen (Cloudflare Workers)
 * and Node.js / Vercel deployments.
 */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext?: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  // waitUntil is Cloudflare Workers specific — use a no-op in Node.js
  const waitUntil =
    typeof executionContext?.waitUntil === 'function'
      ? executionContext.waitUntil.bind(executionContext)
      : (promise: Promise<unknown>) => {
          promise.catch(console.error);
        };

  // `caches` is a Cloudflare Workers / Service Worker global.
  // In Node.js it is not available, so we pass undefined.
  const cache =
    typeof caches !== 'undefined' ? await caches.open('hydrogen') : undefined;

  const session = await AppSession.init(request, [env.SESSION_SECRET]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      i18n: getLocaleFromRequest(request),
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}
