import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("all app routes inherit one protected membership boundary",()=>{
  const app=fs.readFileSync("src/App.tsx","utf8");

  assert.match(
    app,
    /<Route path="\/app" element={<Protected><Outlet\/><\/Protected>}>/
  );

  const requiredRoutes=[
    "/app/today",
    "/app/clients",
    "/app/providers",
    "/app/status",
    "/app/projects/:projectId",
    "/app/projects/:projectId/operations",
    "/app/projects/:projectId/ghostwriter",
    "/app/projects/:projectId/artifacts",
    "/app/approvals",
    "/app/projects/:projectId/memory",
  ];

  for(const route of requiredRoutes){
    assert.ok(app.includes(`path="${route}"`),route);
  }
});

test("protected boundary proves api.me before rendering",()=>{
  const source=fs.readFileSync("src/auth/Protected.tsx","utf8");
  assert.match(source,/api\.me\(\)/);
  assert.match(source,/beginLogin/);
});

test("protected boundary validates once per protected app mount",()=>{
  const source=fs.readFileSync("src/auth/Protected.tsx","utf8");
  assert.match(source,/useRef\(location\.pathname\+location\.search\)/);
  assert.match(source,/\},\[\]\);/);
});

test("session frontend persists no access refresh or m2m token",()=>{
  const source=[
    fs.readFileSync("src/auth/Protected.tsx","utf8"),
    fs.readFileSync("src/auth/session.ts","utf8"),
    fs.readFileSync("src/api.ts","utf8"),
  ].join("\n");
  assert.equal(/localStorage|sessionStorage/.test(source),false);
  assert.equal(/refresh_token|access_token|m2m_token|client_secret/i.test(source),false);
});

test("return path forbids protocol-relative redirect",()=>{
  const source=fs.readFileSync("src/auth/session.ts","utf8");
  assert.match(source,/!value\.startsWith\("\/\/"\)/);
});
