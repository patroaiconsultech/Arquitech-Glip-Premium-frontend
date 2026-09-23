# GLIP Frontend RC4 Native Auth — Railway

Recommended service name: `glip-frontend`.

The browser talks only to this service. `server.mjs` proxies `/api/*` to the GLIP backend
over Railway private networking.

Required server-side variable:
`GLIP_BACKEND_URL=http://${{glip-backend.RAILWAY_PRIVATE_DOMAIN}}:${{glip-backend.PORT}}`

Health:
`/health`

Public domain:
frontend only for the preferred initial topology.

## Auth
The public login page is `/login`.
No external identity provider variables are required.

## Release gate
This source candidate still has no `package-lock.json` because the current local environment
cannot reach npm registry reliably.

Bootstrap/networked staging build may be used to materialize the lock and build evidence.
Production release approval still requires:
1. generated and reviewed `package-lock.json`;
2. committed lock;
3. clean `npm ci`;
4. green Vite production build;
5. local/optimized case assets required by `PERFORMANCE_BUDGET.md`.
