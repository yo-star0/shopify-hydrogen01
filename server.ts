import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';

/**
 * Export a fetch handler compatible with both Oxygen (Cloudflare Workers)
 * and Node.js / Vercel deployments.
 */
export default {
  async fetch(
    request: Request,
    env?: Env,
    executionContext?: ExecutionContext,
  ): Promise<Response> {
    try {
      /**
       * In Cloudflare Workers / Oxygen, environment variables are passed
       * as the `env` binding object.  In Node.js / Vercel, they live in
       * `process.env`.  Merge both so this entry works in either runtime.
       */
      const nodeEnv: Record<string, string> =
        typeof process !== 'undefined'
          ? (Object.fromEntries(
              Object.entries(process.env).map(([k, v]) => [k, v ?? '']),
            ) as Record<string, string>)
          : {};
      const effectiveEnv = {...nodeEnv, ...(env ?? {})} as Env;

      const hydrogenContext = await createHydrogenRouterContext(
        request,
        effectiveEnv,
        executionContext,
      );

      // Debug: verify context and env
      console.log('[DEBUG] effectiveEnv keys:', Object.keys(effectiveEnv).filter(k => k.startsWith('PUBLIC') || k === 'SESSION_SECRET'));
      console.log('[DEBUG] PUBLIC_STORE_DOMAIN:', effectiveEnv.PUBLIC_STORE_DOMAIN);
      console.log('[DEBUG] hydrogenContext.storefront:', hydrogenContext.storefront);

      /**
       * Create a Hydrogen request handler that internally
       * delegates to React Router for routing and rendering.
       */
      const handleRequest = createRequestHandler({
        build: serverBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          'Set-Cookie',
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({
          request,
          response,
          storefront: hydrogenContext.storefront,
        });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response('An unexpected error occurred', {status: 500});
    }
  },
};
