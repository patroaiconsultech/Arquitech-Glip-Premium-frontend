# GLIP Frontend — Railway deployment contract

Serviço: frontend GLIP.

O browser deve falar apenas com o frontend. `server.mjs` faz proxy de `/api/*`
para o backend configurado exclusivamente no servidor via `GLIP_BACKEND_URL`.

## Variáveis

Obrigatória no servidor:

```text
GLIP_BACKEND_URL=<backend GLIP autorizado para o ambiente>
```

Variáveis `VITE_*` são públicas por definição e não podem conter segredo.

O contrato de exemplo canônico é:

```text
.env.example
```

`env.example` permanece apenas como mirror transitório idêntico durante este gate e deve ser
removido em patch posterior depois que um build Railway provar que `.env.example` está presente
no build context.

## Health / provenance

`GET /health` deve retornar, sem segredo:

- `status`
- `service`
- `version`
- `backend_proxy_configured`
- `deployment_id`
- `commit`

Após cada deploy candidato, registrar:

```text
Git commit
Git tree
GitHub Actions run
Railway deployment id
Railway commit
/health response
deployment timestamp
```

GitHub, ZIP, build artifact e Railway não devem ser presumidos equivalentes.

## Release gate P0-002

O source agora exige:

```bash
npm run verify:release
npm ci --no-audit --no-fund
npm test
node --check server.mjs
npm run build
npm run build:evidence
npm run release:provenance
```

Docker e GitHub Actions usam `npm ci` sem fallback para `npm install`.

Package lock esperado neste candidato:

```text
SHA256 f16603eac1121abd24b1c1911c8e4f95f173eed83372351c6fbb410efe210245
```

## Estado de aprovação

```text
source_contract_local=PASS
source_tests_local=50_PASS
server_syntax_local=PASS
npm_ci_networked=PENDING_CI
vite_build_networked=PENDING_CI
railway_runtime_provenance=PENDING_DEPLOY
production_approved=false
human_approval_required=true
```
