import {useEffect,useMemo,useState} from "react";
import {Link} from "react-router-dom";
import Shell from "../components/Shell";
import {api} from "../api";

export default function IntelligenceChat(){
  const [threads,setThreads]=useState<any[]>([]);
  const [messages,setMessages]=useState<any[]>([]);
  const [projects,setProjects]=useState<any[]>([]);
  const [threadId,setThreadId]=useState("");
  const [projectId,setProjectId]=useState("");
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [status,setStatus]=useState<any>();

  async function refresh(){
    const [ts,ps,st]=await Promise.all([api.chatThreads(),api.projects(),api.chatStatus()]);
    setThreads(ts);setProjects(ps);setStatus(st);
    if(!threadId && ts[0]?.id){
      setThreadId(ts[0].id);
      setMessages(await api.chatMessages(ts[0].id));
    }
  }

  useEffect(()=>{refresh().catch(e=>setError(e.message))},[]);

  async function choose(id:string){
    setThreadId(id);setError("");
    setMessages(await api.chatMessages(id));
    const t=threads.find(x=>x.id===id);
    setProjectId(t?.project_id||"");
  }

  async function newThread(){
    setError("");
    const t=await api.createChatThread({project_id:projectId||null});
    setThreads(x=>[t,...x]);
    setThreadId(t.id);
    setMessages([]);
  }

  async function send(){
    const text=input.trim();
    if(!text||busy)return;
    setBusy(true);setError("");
    try{
      let id=threadId;
      if(!id){
        const t=await api.createChatThread({project_id:projectId||null});
        setThreads(x=>[t,...x]);setThreadId(t.id);id=t.id;
      }
      setInput("");
      const out=await api.sendChatMessage(id,text);
      setMessages(x=>[...x,out.user_message,out.assistant_message]);
      const ts=await api.chatThreads();setThreads(ts);
    }catch(e:any){
      setError(e.message||"chat_error");
      setInput(text);
    }finally{setBusy(false)}
  }

  const projectName=useMemo(
    ()=>projects.find(x=>x.id===projectId)?.name||"Contexto geral",
    [projects,projectId]
  );

  return <Shell>
    <div className="page-head">
      <div>
        <span className="section-kicker">GLIP INTELLIGENCE</span>
        <h1>Converse com o seu projeto.</h1>
        <p>Chat interno, persistente e contextualizado pelos dados autorizados do GLIP.</p>
      </div>
      <Link className="button ghost" to="/app/status">Status técnico</Link>
    </div>

    {error&&<div className="notice error" style={{marginBottom:14}}>{error}</div>}

    <div style={{display:"grid",gridTemplateColumns:"280px minmax(0,1fr)",gap:16,alignItems:"stretch"}}>
      <aside className="glass panel" style={{minHeight:"68vh",padding:18}}>
        <small style={{color:"#777"}}>CONTEXTO</small>
        <select
          value={projectId}
          onChange={e=>setProjectId(e.target.value)}
          style={{width:"100%",margin:"12px 0",padding:12,borderRadius:12,background:"#0d0d0f",color:"#eee",border:"1px solid var(--line)"}}
        >
          <option value="">Geral do tenant</option>
          {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="button primary wide" onClick={newThread}>Nova conversa</button>

        <div style={{display:"grid",gap:8,marginTop:18}}>
          {threads.map(t=><button
            key={t.id}
            onClick={()=>choose(t.id)}
            style={{
              textAlign:"left",padding:12,borderRadius:12,cursor:"pointer",
              border:"1px solid var(--line)",color:t.id===threadId?"#fff":"#8f8a81",
              background:t.id===threadId?"#ffffff0d":"transparent"
            }}
          >
            <strong style={{display:"block",fontSize:12,fontWeight:600}}>{t.title}</strong>
            <small style={{color:"#666"}}>{projects.find(p=>p.id===t.project_id)?.name||"Geral"}</small>
          </button>)}
          {!threads.length&&<div className="empty">Nenhuma conversa ainda.</div>}
        </div>
      </aside>

      <section className="glass panel" style={{minHeight:"68vh",display:"grid",gridTemplateRows:"auto 1fr auto",padding:0,overflow:"hidden"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between"}}>
          <div><strong>GLIP Intelligence</strong><small style={{display:"block",color:"#777",marginTop:4}}>{projectName}</small></div>
          <span className="pill">{status?.configured?"IA disponível":"Configuração pendente"}</span>
        </div>

        <div style={{padding:22,overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
          {!messages.length&&<div className="empty">
            <p>Comece perguntando sobre prioridades, tarefas, prazos, memória ou riscos do projeto.</p>
          </div>}
          {messages.map(m=><div key={m.id} style={{
            maxWidth:"82%",alignSelf:m.role==="user"?"flex-end":"flex-start",
            padding:"14px 16px",borderRadius:16,lineHeight:1.65,whiteSpace:"pre-wrap",
            background:m.role==="user"?"rgba(232,197,126,.12)":"#ffffff09",
            border:m.role==="user"?"1px solid rgba(232,197,126,.24)":"1px solid var(--line)"
          }}>
            <small style={{display:"block",color:m.role==="user"?"var(--gold)":"#73e6a5",marginBottom:6}}>
              {m.role==="user"?"Você":"GLIP Intelligence"}
            </small>
            {m.content}
          </div>)}
          {busy&&<div style={{color:"#777",padding:10}}>GLIP está analisando…</div>}
        </div>

        <div style={{padding:18,borderTop:"1px solid var(--line)"}}>
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}}
            placeholder="Pergunte ao GLIP…"
            rows={3}
            style={{width:"100%",resize:"vertical",border:"1px solid var(--line)",borderRadius:14,background:"#0d0d0f",color:"#eee",padding:14,outline:"none"}}
          />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
            <small style={{color:"#666"}}>Enter envia · Shift+Enter quebra linha · MVP somente leitura</small>
            <button className="button primary" disabled={busy||!input.trim()} onClick={send}>
              {busy?"Pensando…":"Enviar"}
            </button>
          </div>
        </div>
      </section>
    </div>
  </Shell>
}
