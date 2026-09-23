import {ReactNode} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {api} from "../api";

export default function Shell({children}:{children:ReactNode}){
  const l=useLocation();
  const nav=useNavigate();

  async function logout(){
    try{await api.logout()}finally{nav("/login",{replace:true})}
  }

  return <div className="app-shell"><aside className="sidebar">
    <Link className="brand" to="/"><span className="brand-mark">G</span><span>GLIP</span></Link>
    <nav>
      <Link className={l.pathname==="/app/today"?"active":""} to="/app/today">Hoje</Link>
      <Link className={l.pathname==="/app"?"active":""} to="/app">Projetos</Link>
      <Link className={l.pathname==="/app/clients"?"active":""} to="/app/clients">Clientes</Link>
      <Link className={l.pathname==="/app/providers"?"active":""} to="/app/providers">Prestadores</Link>
      <Link className={l.pathname.includes("approvals")?"active":""} to="/app/approvals">Aprovações</Link>
      <Link className={l.pathname.includes("/status")?"active":""} to="/app/status">Inteligência</Link>
    </nav>
    <div className="sidebar-foot">
      <span><span className="status-dot"/>GLIP domain plane</span>
      <button className="button ghost" onClick={logout}>Sair</button>
    </div>
  </aside><main className="workspace">{children}</main></div>
}
