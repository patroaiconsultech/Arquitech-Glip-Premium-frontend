import {FormEvent,useEffect,useState} from "react";
import {useLocation,useNavigate} from "react-router-dom";
import {api} from "../api";

function safeReturnTo(value:string|null){
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

export default function Login(){
  const nav=useNavigate();
  const location=useLocation();
  const q=new URLSearchParams(location.search);
  const returnTo=safeReturnTo(q.get("return_to"));
  const [tenant,setTenant]=useState(import.meta.env.VITE_GLIP_DEFAULT_TENANT_ID||"");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    api.me().then(()=>nav(returnTo,{replace:true})).catch(()=>{});
  },[]);

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!tenant.trim()||!email.trim()||!password){
      setError("Informe tenant, e-mail e senha.");
      return;
    }
    setBusy(true); setError("");
    try{
      await api.nativeLogin(tenant.trim(),email.trim(),password);
      await api.me();
      nav(returnTo,{replace:true});
    }catch{
      setPassword("");
      setError("Credenciais inválidas.");
    }finally{
      setBusy(false);
    }
  }

  return <div className="center"><form className="glass auth-card" onSubmit={submit}>
    <div className="brand"><span className="brand-mark">G</span>GLIP</div>
    <span className="section-kicker">ACESSO NATIVO</span>
    <h2>Entrar no GLIP</h2>
    <p>Use a conta criada para o seu tenant GLIP.</p>
    <label>Tenant
      <input
        autoComplete="organization"
        value={tenant}
        onChange={e=>setTenant(e.target.value)}
        placeholder="tenant"
        required
      />
    </label>
    <label>E-mail
      <input
        type="email"
        autoComplete="username"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        placeholder="voce@empresa.com"
        required
      />
    </label>
    <label>Senha
      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        required
      />
    </label>
    {error&&<div className="notice error">{error}</div>}
    <button className="button primary wide" disabled={busy}>
      {busy?"Validando…":"Entrar"}
    </button>
  </form></div>;
}
