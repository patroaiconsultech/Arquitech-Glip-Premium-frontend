# Lockfile gate — obrigatório antes de staging/produção

Este seed foi materializado em um ambiente sem acesso ao registry npm e, portanto, não foi possível
gerar `package-lock.json` aqui.

No PRIMEIRO checkout com acesso ao registry:

```bash
npm install
npm test
npm run build
git add package-lock.json
git commit -m "chore: materialize deterministic npm lockfile"
```

Depois do lockfile estar commitado:

1. substitua `npm install --no-audit --no-fund` no Dockerfile por `npm ci`;
2. mantenha CI usando `npm ci`;
3. registre o SHA do `package-lock.json` no release manifest;
4. não aprove staging/produção sem clean install + build verde.

`package-lock.json` ausente = BOOTSTRAP permitido; RELEASE = NO-GO.
