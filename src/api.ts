const API=(import.meta.env.VITE_GLIP_API_BASE_URL||"").replace(/\/$/,"");

function headers(){
  const h:Record<string,string>={
    "Content-Type":"application/json",
    "X-Request-ID":crypto.randomUUID(),
    "X-Correlation-ID":crypto.randomUUID()
  };
  if(import.meta.env.VITE_GLIP_DEV_MODE==="true"){
    h["X-GLIP-Tenant-ID"]=import.meta.env.VITE_GLIP_DEV_TENANT_ID||"tenant-demo";
    h["X-GLIP-User-ID"]=import.meta.env.VITE_GLIP_DEV_USER_ID||"user-demo";
  }
  return h;
}

async function req<T>(path:string,init:RequestInit={}):Promise<T>{
  const r=await fetch(`${API}${path}`,{
    ...init,
    credentials:"include",
    headers:{...headers(),...(init.headers||{})}
  });
  if(!r.ok){
    let d=`HTTP_${r.status}`;
    try{d=(await r.json()).detail||d}catch{}
    throw new Error(d)
  }
  return r.json();
}
const post=(path:string,body:any)=>req<any>(path,{method:"POST",body:JSON.stringify(body)});

async function upload<T>(path:string,form:FormData):Promise<T>{
  const h=headers();
  delete h["Content-Type"];
  const r=await fetch(`${API}${path}`,{
    method:"POST",body:form,credentials:"include",headers:h
  });
  if(!r.ok){
    let d=`HTTP_${r.status}`;
    try{d=(await r.json()).detail||d}catch{}
    throw new Error(d)
  }
  return r.json();
}

async function download(path:string):Promise<{blob:Blob;filename:string}>{
  const h=headers();
  delete h["Content-Type"];
  const r=await fetch(`${API}${path}`,{credentials:"include",headers:h});
  if(!r.ok){
    let d=`HTTP_${r.status}`;
    try{d=(await r.json()).detail||d}catch{}
    throw new Error(d)
  }
  const cd=r.headers.get("content-disposition")||"";
  const match=cd.match(/filename="?([^"]+)"?/i);
  return {blob:await r.blob(),filename:match?.[1]||"artifact"};
}

export const api={
  authMode:()=>req<any>("/api/v1/auth/mode"),
  nativeLogin:(tenant_id:string,email:string,password:string)=>post("/api/v1/auth/login",{tenant_id,email,password}),
  logout:()=>post("/api/v1/auth/logout",{}),
  me:()=>req<any>("/api/v1/me"),
  today:()=>req<any>("/api/v1/dashboard/today"),
  systemStatus:()=>req<any>("/api/v1/system/status"),
  orkioStatus:()=>req<any>("/api/v1/integrations/orkio/status"),
  clients:()=>req<any[]>("/api/v1/clients"),
  createClient:(body:any)=>post("/api/v1/clients",body),
  providers:()=>req<any[]>("/api/v1/providers"),
  createProvider:(body:any)=>post("/api/v1/providers",body),
  projects:()=>req<any[]>("/api/v1/projects"),
  project:(id:string)=>req<any>(`/api/v1/projects/${id}`),
  overview:(id:string)=>req<any>(`/api/v1/projects/${id}/overview`),
  createProject:(name:string)=>post("/api/v1/projects",{name}),
  context:(id:string,purpose="general")=>req<any>(`/api/v1/projects/${id}/context?purpose=${encodeURIComponent(purpose)}`),
  summary:(id:string)=>post(`/api/v1/projects/${id}/capabilities/project-summary`,{}),
  draft:(id:string,body:any)=>post(`/api/v1/projects/${id}/capabilities/draft-message`,body),
  editDraft:(p:string,d:string,content:string)=>post(`/api/v1/projects/${p}/drafts/${d}/versions`,{content}),
  draftDiff:(p:string,d:string)=>req<any>(`/api/v1/projects/${p}/drafts/${d}/diff`),
  requestApproval:(p:string,d:string,v:string)=>post(`/api/v1/projects/${p}/drafts/${d}/request-approval`,{draft_version_id:v}),
  approve:(p:string,d:string,v:string)=>post(`/api/v1/projects/${p}/drafts/${d}/approve`,{draft_version_id:v}),
  reject:(p:string,d:string,v:string,reason?:string)=>post(`/api/v1/projects/${p}/drafts/${d}/reject`,{draft_version_id:v,reason}),
  approvals:()=>req<any[]>("/api/v1/approvals"),
  knowledge:(p:string)=>req<any[]>(`/api/v1/projects/${p}/knowledge`),
  addKnowledge:(p:string,body:any)=>post(`/api/v1/projects/${p}/knowledge`,body),
  memory:(p:string)=>req<any[]>(`/api/v1/projects/${p}/memory`),
  memoryCandidates:(p:string)=>req<any[]>(`/api/v1/projects/${p}/memory/candidates`),
  promoteMemory:(p:string,c:string,body:any)=>post(`/api/v1/projects/${p}/memory/candidates/${c}/promote`,body),
  approvedVersions:(p:string)=>req<any[]>(`/api/v1/projects/${p}/approved-versions`),
  budgets:(p:string)=>req<any[]>(`/api/v1/projects/${p}/budgets`),
  schedule:(p:string)=>req<any[]>(`/api/v1/projects/${p}/schedule`),
  stages:(p:string)=>req<any[]>(`/api/v1/projects/${p}/stages`),
  tasks:(p:string)=>req<any[]>(`/api/v1/projects/${p}/tasks`),
  milestones:(p:string)=>req<any[]>(`/api/v1/projects/${p}/milestones`),
  documents:(p:string)=>req<any[]>(`/api/v1/projects/${p}/documents`),
  decisions:(p:string)=>req<any[]>(`/api/v1/projects/${p}/decisions`),
  assets:(p:string)=>req<any[]>(`/api/v1/projects/${p}/assets`),
  communications:(p:string)=>req<any[]>(`/api/v1/projects/${p}/communications`),
  projectProviders:(p:string)=>req<any[]>(`/api/v1/projects/${p}/providers`),
  executions:(p:string)=>req<any[]>(`/api/v1/projects/${p}/executions`),
  artifactCapabilities:(p:string)=>req<any>(`/api/v1/projects/${p}/artifact-capabilities`),
  artifacts:(p:string)=>req<any[]>(`/api/v1/projects/${p}/artifacts`),
  renderArtifact:(p:string,body:any)=>post(`/api/v1/projects/${p}/artifacts/render`,body),
  artifactUsage:(p:string)=>req<any>(`/api/v1/projects/${p}/artifact-usage`),
  downloadArtifact:(p:string,a:string)=>download(`/api/v1/projects/${p}/artifacts/${a}/download`),
  architectureCapabilities:(p:string)=>req<any>(`/api/v1/projects/${p}/architecture/capabilities`),
  architectureSources:(p:string)=>req<any[]>(`/api/v1/projects/${p}/architecture/sources`),
  uploadArchitectureSource:(p:string,file:File,classification="project_internal")=>{
    const form=new FormData(); form.append("file",file); form.append("classification",classification);
    return upload<any>(`/api/v1/projects/${p}/architecture/sources`,form);
  },
  architectureScenes:(p:string)=>req<any[]>(`/api/v1/projects/${p}/architecture/scenes`),
  bimJobs:(p:string)=>req<any[]>(`/api/v1/projects/${p}/architecture/bim-jobs`),
  queueBimExtraction:(p:string,sourceId:string)=>post(`/api/v1/projects/${p}/architecture/sources/${sourceId}/semantic-extractions`,{}),
  cadJobs:(p:string)=>req<any[]>(`/api/v1/projects/${p}/architecture/cad-jobs`),
  queueCadExtraction:(p:string,sourceId:string)=>post(`/api/v1/projects/${p}/architecture/sources/${sourceId}/cad-extractions`,{}),
  geometryJobs:(p:string)=>req<any[]>(`/api/v1/projects/${p}/architecture/geometry-jobs`),
  queueGeometryBuild:(p:string,sceneId:string)=>post(`/api/v1/projects/${p}/architecture/scenes/${sceneId}/geometry-builds`,{build_kind:"preview_glb"}),
  downloadArchitectureModel:(p:string,a:string)=>download(`/api/v1/projects/${p}/architecture/models/${a}/download`)
};
