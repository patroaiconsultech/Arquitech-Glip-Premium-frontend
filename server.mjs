import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),"dist");
const port=Number(process.env.PORT||8080);
const backend=(process.env.GLIP_BACKEND_URL||"").replace(/\/$/,"");
const version=process.env.GLIP_RELEASE_ID||"1.0.0rc3";
const types={".js":"text/javascript",".css":"text/css",".html":"text/html",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};

function security(res){
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","DENY");
  res.setHeader("Referrer-Policy","no-referrer");
  res.setHeader("Permissions-Policy","camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
}

function publicOrigin(req){
  const proto=String(req.headers["x-forwarded-proto"]||"https").split(",")[0].trim();
  const host=String(req.headers["x-forwarded-host"]||req.headers.host||"").split(",")[0].trim();
  return host?`${proto}://${host}`:"";
}

async function proxy(req,res){
  if(!backend){
    security(res);
    res.writeHead(503,{"Content-Type":"application/json"});
    return res.end(JSON.stringify({detail:"glip_backend_url_not_configured"}));
  }

  const target=new URL(req.url||"/",backend);
  const chunks=[];
  for await (const chunk of req)chunks.push(chunk);
  const body=chunks.length?Buffer.concat(chunks):undefined;

  const headers=new Headers();
  for(const [key,value] of Object.entries(req.headers)){
    if(value===undefined)continue;
    if(["host","content-length","connection","transfer-encoding"].includes(key.toLowerCase()))continue;
    if(Array.isArray(value))headers.set(key,value.join(", "));
    else headers.set(key,String(value));
  }
  const origin=publicOrigin(req);
  if(origin){
    headers.set("X-Forwarded-Proto",new URL(origin).protocol.replace(":",""));
    headers.set("X-Forwarded-Host",new URL(origin).host);
  }

  let upstream;
  try{
    upstream=await fetch(target,{
      method:req.method,
      headers,
      body:["GET","HEAD"].includes(req.method||"GET")?undefined:body,
      redirect:"manual",
    });
  }catch{
    security(res);
    res.writeHead(502,{"Content-Type":"application/json"});
    return res.end(JSON.stringify({detail:"glip_backend_unreachable"}));
  }

  security(res);
  for(const [key,value] of upstream.headers.entries()){
    if(["content-length","transfer-encoding","connection","set-cookie"].includes(key.toLowerCase()))continue;
    res.setHeader(key,value);
  }

  const cookies=typeof upstream.headers.getSetCookie==="function"
    ? upstream.headers.getSetCookie()
    : (upstream.headers.get("set-cookie")?[upstream.headers.get("set-cookie")]:[]);
  if(cookies.length)res.setHeader("Set-Cookie",cookies);

  const location=upstream.headers.get("location");
  if(location)res.setHeader("Location",location);

  res.statusCode=upstream.status;
  const data=Buffer.from(await upstream.arrayBuffer());
  res.end(data);
}

function serve(req,res){
  const u=new URL(req.url||"/","http://localhost");
  let f=path.join(root,u.pathname==="/"?"index.html":u.pathname);
  if(!f.startsWith(root)){
    security(res);res.writeHead(403);return res.end();
  }
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(root,"index.html");
  security(res);
  res.setHeader("Content-Type",types[path.extname(f)]||"application/octet-stream");
  res.setHeader("Cache-Control",f.endsWith("index.html")?"no-store":"public,max-age=31536000,immutable");
  fs.createReadStream(f).pipe(res);
}

http.createServer(async(req,res)=>{
  const u=new URL(req.url||"/","http://localhost");
  if(u.pathname==="/health"){
    security(res);
    res.writeHead(200,{"Content-Type":"application/json","Cache-Control":"no-store"});
    return res.end(JSON.stringify({
      status:"ok",
      service:"glip-frontend",
      version,
      backend_proxy_configured:Boolean(backend),
      deployment_id:process.env.RAILWAY_DEPLOYMENT_ID||null,
      commit:process.env.RAILWAY_GIT_COMMIT_SHA||null,
    }));
  }
  if(u.pathname.startsWith("/api/"))return proxy(req,res);
  return serve(req,res);
}).listen(port,"0.0.0.0",()=>console.log(`GLIP frontend ${port}`));
