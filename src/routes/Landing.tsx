import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import {Link} from "react-router-dom";
import "../construtech-landing.css";
import PublicSalesAssistant from "../commercial/PublicSalesAssistant";

const offerings = [
  {tag:"01 · PRIORIDADE",title:"Viabilidade imobiliária",desc:"Estudos de terrenos, cenários financeiros, VGV, fluxo de caixa, VPL e TIR com premissas verificáveis.",status:"Em desenvolvimento"},
  {tag:"02 · PRÓXIMA ETAPA",title:"Gestão de recebíveis",desc:"Carteira de contratos, parcelas, inadimplência e projeções por empreendimento.",status:"Planejado"},
  {tag:"03 · BASE EXISTENTE",title:"Projetos e documentos",desc:"Organização de projetos, tarefas, documentos, versões, aprovações e histórico operacional.",status:"Em homologação"},
  {tag:"04 · EVOLUÇÃO",title:"Engenharia e BIM",desc:"Fundações para arquivos IFC/DXF, quantitativos, orçamentos e informações técnicas.",status:"Fundação técnica"},
];

const specialists = [
  {name:"Incorporação",description:"Estruturação de terrenos, permutas e oportunidades."},
  {name:"Viabilidade",description:"Cenários, fluxo de caixa e indicadores determinísticos."},
  {name:"Financeiro",description:"Funding, capital, custos e recebíveis."},
  {name:"Engenharia",description:"Orçamento, quantitativos e acompanhamento."},
  {name:"Jurídico documental",description:"Triagem, pendências e riscos contratuais."},
  {name:"Comercial",description:"Vendas, preços, projeções e relacionamento."},
];

type FormState="idle"|"sending"|"success"|"error";
type LeadPayload={
  name:string;company:string;email:string;phone:string;
  profile:string;need:string;projects:string;source:string;
  consent:boolean;website:string;
};

function DemoDialog({close}:{close:()=>void}){
  const [available,setAvailable]=useState(false);
  const [checking,setChecking]=useState(true);
  const [privacyPath,setPrivacyPath]=useState<string|null>(null);
  const [state,setState]=useState<FormState>("idle");
  const [error,setError]=useState("");
  const dialog=useRef<HTMLDivElement>(null);
  const key=useRef<string|null>(null);
  const priorPayload=useRef<string|null>(null);
  const [consent,setConsent]=useState(false);

  useEffect(()=>{
    dialog.current?.focus();
    const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")close()};
    document.addEventListener("keydown",esc);
    document.body.style.overflow="hidden";
    let mounted=true;
    fetch("/api/public/config",{headers:{Accept:"application/json"}})
      .then(async r=>r.ok ? r.json():null)
      .then(data=>{
        if(!mounted)return;
        // Activation requires an approved, same-origin privacy notice from backend.
        const path=data?.privacy_notice_path;
        const approved=data?.privacy_notice_approved===true &&
          typeof data?.privacy_notice_version==="string" &&
          /^[A-Za-z0-9_.-]{1,80}$/.test(data.privacy_notice_version) &&
          typeof path==="string" && /^\/privacy(?:\.html)?$/.test(path);
        setAvailable(data?.lead_capture===true && approved);
        setPrivacyPath(approved?path:null);
      })
      .catch(()=>{if(mounted)setAvailable(false)})
      .finally(()=>{if(mounted)setChecking(false)});
    return ()=>{mounted=false;document.removeEventListener("keydown",esc);document.body.style.overflow=""};
  },[close]);

  async function send(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!available||!consent||state==="sending")return;
    const form=event.currentTarget;
    if(!form.reportValidity())return;
    const fields=new FormData(form);
    const payload:LeadPayload={
      name:String(fields.get("name")||"").trim(),company:String(fields.get("company")||"").trim(),
      email:String(fields.get("email")||"").trim(),phone:String(fields.get("phone")||"").trim(),
      profile:String(fields.get("profile")||""),need:String(fields.get("need")||""),
      projects:String(fields.get("projects")||""),source:"platform",
      consent:true,website:String(fields.get("website")||""),
    };
    const serialized=JSON.stringify(payload);
    if(!key.current || priorPayload.current!==serialized){
      key.current=crypto.randomUUID().replace(/-/g,"");
      priorPayload.current=serialized;
    }
    setState("sending");setError("");
    try{
      const r=await fetch("/api/public/leads",{
        method:"POST",credentials:"same-origin",
        headers:{"Content-Type":"application/json","X-Idempotency-Key":key.current},
        body:serialized,
      });
      if(!r.ok)throw new Error("lead_api_not_ready");
      const body=await r.json();
      if(body?.received!==true)throw new Error("lead_not_confirmed");
      setState("success");
    }catch{
      setState("error");
      setError("Não foi possível registrar sua solicitação. Nenhuma confirmação foi emitida.");
    }
  }

  return <div className="cst-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
    <div className="cst-modal" role="dialog" aria-modal="true" aria-labelledby="cst-dialog-title" tabIndex={-1} ref={dialog}>
      <button className="cst-close" type="button" onClick={close} aria-label="Fechar formulário">×</button>
      <span className="cst-eyebrow">CONSTRUTECH · PILOTO ASSISTIDO</span>
      <h2 id="cst-dialog-title">Vamos conversar sobre seu próximo empreendimento.</h2>
      {checking && <p role="status">Verificando disponibilidade do atendimento…</p>}
      {!checking&&!available&&<div className="cst-availability" role="status">
        <b>Canal comercial em homologação.</b>
        <p>O formulário será liberado somente após a integração segura de interessados e a aprovação do aviso de privacidade. Nenhum dado é enviado nesta etapa.</p>
      </div>}
      {available&&state==="success"&&<div className="cst-availability" role="status">
        <b>Solicitação registrada.</b><p>Seu interesse foi recebido pelo canal comercial.</p>
      </div>}
      {available&&state!=="success"&&<form className="cst-demo-form" onSubmit={send}>
        <label>Nome completo<input name="name" autoComplete="name" minLength={2} maxLength={100} required/></label>
        <label>Empresa<input name="company" autoComplete="organization" minLength={2} maxLength={120} required/></label>
        <label>E-mail corporativo<input type="email" name="email" autoComplete="email" maxLength={180} required/></label>
        <label>Telefone / WhatsApp<input type="tel" name="phone" autoComplete="tel" minLength={10} maxLength={30} required/></label>
        <label>Perfil<select name="profile" defaultValue="" required>
          <option value="" disabled>Selecione</option><option value="incorporadora">Incorporadora</option>
          <option value="loteadora">Loteadora</option><option value="construtora">Construtora</option>
          <option value="investidor">Investidor</option><option value="consultoria">Consultoria</option><option value="outro">Outro</option>
        </select></label>
        <label>Prioridade<select name="need" defaultValue="viabilidade" required>
          <option value="viabilidade">Viabilidade imobiliária</option>
          <option value="documentos">Documentação</option><option value="projetos">Gestão de projetos</option>
          <option value="capital">Capital e funding</option><option value="outros">Conhecer a plataforma</option>
        </select></label>
        <label>Empreendimentos<select name="projects" defaultValue="1" required>
          <option value="1">1 empreendimento</option><option value="2-5">2 a 5</option>
          <option value="6+">6 ou mais</option><option value="planejamento">Em planejamento</option>
        </select></label>
        <label className="cst-honeypot" aria-hidden="true">Site<input name="website" tabIndex={-1} autoComplete="off"/></label>
        <label className="cst-checkbox">
          <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/>
          Autorizo contato referente à solicitação e li o <a href={privacyPath||"#"} target="_blank" rel="noopener noreferrer">aviso de privacidade</a>. Este aceite não autoriza marketing adicional.
        </label>
        <p className="cst-micro">Contato restrito à demonstração solicitada. O envio depende da disponibilidade confirmada pela API.</p>
        {error&&<p role="alert" className="cst-error">{error}</p>}
        <button className="cst-button cst-button-primary" type="submit" disabled={!consent||state==="sending"}>
          {state==="sending"?"Enviando…":"Solicitar demonstração"}
        </button>
      </form>}
    </div>
  </div>;
}

export default function Landing(){
  const [dialog,setDialog]=useState(false);
  const [salesOpen,setSalesOpen]=useState(false);
  const closeDialog=useCallback(()=>setDialog(false),[]);
  const closeSales=useCallback(()=>setSalesOpen(false),[]);
  const openDemoFromSales=useCallback(()=>{setSalesOpen(false);setDialog(true);},[]);
  const video=useRef<HTMLVideoElement>(null);

  useEffect(()=>{
    const el=video.current;if(!el)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry?.isIntersecting)void el.play().catch(()=>{});
      else el.pause();
    },{threshold:0.2});
    observer.observe(el);
    return ()=>observer.disconnect();
  },[]);

  return <div className="cst-landing">
    <a className="cst-skip" href="#conteudo">Pular para conteúdo</a>
    <header className="cst-header">
      <a className="cst-brand" href="#inicio" aria-label="CONSTRUTECH — início">
        <span className="cst-logo" aria-hidden="true">C<span>+</span></span>
        <span>CONSTRUTECH<small>by PATROAI CONSULTECH</small></span>
      </a>
      <nav aria-label="Navegação principal">
        <a href="#plataforma">Plataforma</a>
        <a href="#viabilidade">Viabilidade</a>
        <a href="#especialistas">Especialistas IA</a>
        <a href="#seguranca">Segurança</a>
      </nav>
      <div className="cst-header-actions">
        <Link to="/login?return_to=/app" className="cst-button cst-button-outline">Entrar</Link>
        <button type="button" className="cst-button cst-button-outline" onClick={()=>setSalesOpen(true)}>Atendimento comercial</button>
        <button type="button" className="cst-button cst-button-primary" onClick={()=>setDialog(true)}>Solicitar piloto ↗</button>
      </div>
    </header>
    <main id="conteudo">
      <section className="cst-hero" id="inicio">
        <div className="cst-hero-copy">
          <span className="cst-eyebrow"><span className="cst-signal"/> INTELIGÊNCIA IMOBILIÁRIA · SAAS B2B</span>
          <h1>A inteligência de <em>todo o empreendimento.</em></h1>
          <p>Uma visão integrada para incorporadoras, construtoras e loteadoras — da análise do terreno à gestão financeira, com dados, documentos e especialistas digitais.</p>
          <div className="cst-hero-buttons">
            <button type="button" className="cst-button cst-button-primary" onClick={()=>setSalesOpen(true)}>Conversar com atendimento comercial ↗</button>
            <button type="button" className="cst-button cst-button-outline" onClick={()=>setDialog(true)}>Ver disponibilidade do piloto</button>
            <a className="cst-button cst-button-outline" href="#viabilidade">Explorar viabilidade ↓</a>
          </div>
          <div className="cst-hero-proof"><span>Viabilidade como prioridade</span><span>Decisão humana</span><span>Dados autorizados</span></div>
          <p className="cst-stage">Prévia comercial · recursos financeiros e multiagentes em desenvolvimento</p>
        </div>
        <div className="cst-hero-media">
          <img src="/construtech/media/edificio-poster.webp" alt="Visualização conceitual de edifício, não representa obra real" width="1280" height="720"/>
          <video ref={video} muted loop playsInline preload="none" aria-hidden="true" poster="/construtech/media/edificio-poster.webp">
            <source src="/construtech/media/edificio-cinematico.mp4" type="video/mp4"/>
          </video>
          <div className="cst-media-note cst-media-top">VISÃO 360º<br/><strong>DO EMPREENDIMENTO</strong></div>
          <div className="cst-media-note cst-media-bottom">CONCEITO DIGITAL · DADOS ILUSTRATIVOS</div>
        </div>
        <a className="cst-scroll" href="#plataforma">DESCUBRA A PLATAFORMA ↓</a>
      </section>

      <section id="plataforma" className="cst-section">
        <span className="cst-eyebrow">01 / UMA PLATAFORMA, VÁRIAS DECISÕES</span>
        <div className="cst-section-heading"><h2>Do terreno à gestão.<br/><em>Sem perder o contexto.</em></h2>
          <p>Fundações já desenvolvidas para projetos, documentos e orçamentos. A evolução será orientada por impacto econômico real e validação com clientes.</p>
        </div>
        <div className="cst-feature-grid">
          {offerings.map(item=><article className="cst-feature" key={item.title}>
            <span>{item.tag}</span><h3>{item.title}</h3><p>{item.desc}</p><small>{item.status}</small>
          </article>)}
        </div>
      </section>

      <section id="viabilidade" className="cst-section cst-viability">
        <div className="cst-section-copy"><span className="cst-eyebrow">02 / FOCO DE DESENVOLVIMENTO</span>
          <h2>Viabilidade antes de <em>comprometer capital.</em></h2>
          <p>Uma futura jornada de estudo com premissas versionadas, cenários e cálculos verificáveis — apoiada por orçamento, projeções de vendas e fluxo de caixa.</p>
          <div className="cst-chips"><span>VGV</span><span>VPL</span><span>TIR</span><span>Fluxo de caixa</span><span>Sensibilidade</span></div>
          <p className="cst-micro">O motor de viabilidade ainda não foi homologado. Indicadores abaixo são estritamente fictícios.</p>
        </div>
        <div className="cst-viability-card">
          <div className="cst-card-top"><span>ESTUDO CONCEITUAL</span><small>EXEMPLO FICTÍCIO</small></div>
          <div className="cst-main-metric"><small>VGV EXEMPLIFICATIVO</small><strong>R$ 12,4 mi</strong><span>NÃO É UMA SIMULAÇÃO REAL</span></div>
          <div className="cst-bars" aria-hidden="true">{[36,53,49,68,72,87,60,94,74,80,66,93].map((v,i)=><i key={i} style={{height:`${v}%`}}/>)}</div>
          <div className="cst-card-metrics"><div><small>BASE DE CUSTOS</small><strong>Em integração</strong></div><div><small>CENÁRIOS</small><strong>Em desenvolvimento</strong></div></div>
        </div>
      </section>

      <section id="especialistas" className="cst-section cst-ai">
        <span className="cst-eyebrow">03 / CONSTRUTECH AI SPECIALIST TEAM</span>
        <div className="cst-section-heading"><h2>Uma equipe de especialistas.<br/><em>Uma decisão mais informada.</em></h2>
          <p>Agentes especializados que deverão colaborar sobre informações autorizadas. A equipe será implantada em fases, com revisão humana e ferramentas verificáveis.</p>
        </div>
        <div className="cst-specialists">{specialists.map((agent,i)=><article key={agent.name}><span>{String(i+1).padStart(2,"0")}</span><h3>{agent.name}</h3><p>{agent.description}</p></article>)}</div>
        <p className="cst-micro">Especialistas digitais planejados. Não substituem responsabilidade técnica, jurídica ou decisões de crédito.</p>
      </section>

      <section id="seguranca" className="cst-section cst-trust">
        <div><span className="cst-eyebrow">04 / GOVERNANÇA POR PROJETO</span><h2>Informações valiosas.<br/><em>Acesso responsável.</em></h2>
          <p>Dados empresariais exigem controles de identidade, isolamento entre organizações, autorizações explícitas e registros de aceite contratual. A homologação jurídica e técnica é parte do desenvolvimento.</p></div>
        <div className="cst-trust-list">
          <div><b>01</b><span>Identidade e permissões verificadas no backend</span></div>
          <div><b>02</b><span>Compromisso de confidencialidade versionado, em implementação</span></div>
          <div><b>03</b><span>Auditoria e aprovação humana em operações sensíveis</span></div>
        </div>
      </section>

      <section className="cst-section cst-final">
        <span className="cst-eyebrow">05 / CONSTRUA COM INTELIGÊNCIA</span>
        <h2>Seu próximo empreendimento<br/><em>merece uma visão integrada.</em></h2>
        <p>Conheça nosso programa de piloto assistido e participe da validação da plataforma.</p>
        <div><button type="button" className="cst-button cst-button-primary" onClick={()=>setDialog(true)}>Solicitar demonstração ↗</button>
          <Link to="/login?return_to=/app" className="cst-button cst-button-outline">Acesso à plataforma</Link></div>
      </section>
    </main>
    <footer className="cst-footer"><div className="cst-footer-brand">CONSTRUTECH <small>by PATROAI CONSULTECH</small></div>
      <span>Plataforma em desenvolvimento · funcionalidades sujeitas à homologação</span>
      <a href="#inicio">Voltar ao topo ↑</a></footer>
    <button type="button" className="cst-sales-floating" onClick={()=>setSalesOpen(true)}
      aria-label="Abrir atendimento comercial guiado">Atendimento comercial</button>
    {salesOpen&&<PublicSalesAssistant onClose={closeSales} onDemo={openDemoFromSales}/>}
    {dialog&&<DemoDialog close={closeDialog}/>}
  </div>;
}
