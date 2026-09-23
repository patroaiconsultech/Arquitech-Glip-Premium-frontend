import {useEffect,useState} from "react";import {Link} from "react-router-dom";import Shell from "../components/Shell";import {api} from "../api";
export default function Workspace(){const [projects,setProjects]=useState<any[]>([]),[name,setName]=useState(""),[error,setError]=useState("");
const load=()=>api.projects().then(setProjects).catch(e=>setError(e.message));useEffect(load,[]);
async function create(e:React.FormEvent){e.preventDefault();if(!name.trim())return;try{await api.createProject(name);setName("");load()}catch(e:any){setError(e.message)}}
return <Shell><div className="page-head"><div><span className="section-kicker">WORKSPACE</span><h1>Projetos</h1><p>Contexto operacional, inteligência e decisões em um único fluxo.</p></div>
<Link className="button ghost" to="/app/approvals">Central de aprovações</Link></div>{error&&<div className="notice error">{error}</div>}
<form className="new-project" onSubmit={create}><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do novo projeto"/><button className="button primary">Criar projeto</button></form>
<div className="project-grid">{projects.map(p=><Link key={p.id} to={`/app/projects/${p.id}`} className="glass project-card"><div><span className="pill">{p.status}</span><small>CTX v{p.context_version}</small></div>
<h3>{p.name}</h3><p>{p.description||"Pronto para receber contexto, tarefas e inteligência."}</p><b>Abrir projeto →</b></Link>)}</div></Shell>}
