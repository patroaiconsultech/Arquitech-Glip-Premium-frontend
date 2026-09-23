import {Link} from "react-router-dom";
import {useEffect,useRef} from "react";
import ImmersiveHero from "../landing/ImmersiveHero";
import CaseReel from "../landing/CaseReel";
import CognitiveStory from "../landing/CognitiveStory";

const journey=["Estratégia","Público","Ponto","Viabilidade","Projeto","Orçamento","Obra","Experiência","Abertura","Ajustes"];

export default function Landing(){
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=root.current;if(!el)return;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse=matchMedia("(pointer: coarse)").matches;
    if(reduce||coarse)return;
    const move=(e:PointerEvent)=>{
      el.style.setProperty("--mx",`${e.clientX/window.innerWidth*100}%`);
      el.style.setProperty("--my",`${e.clientY/window.innerHeight*100}%`);
    };
    addEventListener("pointermove",move,{passive:true});
    return()=>removeEventListener("pointermove",move);
  },[]);
  return <div className="landing glip-v5" ref={root}>
    <div className="v5-cursor-light"/>
    <header className="landing-nav landing-nav-v5">
      <div className="brand glip-brand-v4"><span className="brand-orb-v4" aria-hidden="true"/><span>GLIP</span></div>
      <nav className="nav-links"><a href="#cases-v5">Projetos</a><a href="#journey-v5">Jornada</a><a href="#kernel-v5">Inteligência</a><a href="#sabrina-v5">Sabrina</a><Link className="button ghost" to="/app">Entrar</Link></nav>
    </header>

    <ImmersiveHero/>
    <CaseReel/>

    <section id="journey-v5" className="section journey-v5 v5-lazy-section">
      <div className="section-kicker">DA INTENÇÃO À OPERAÇÃO</div>
      <div className="journey-v5-head"><h2>Uma linha contínua<br/>de contexto.</h2><p>As fases mudam. A memória do projeto não precisa se perder entre planilhas, mensagens, reuniões, documentos e pessoas.</p></div>
      <div className="journey-v5-track">{journey.map((item,i)=><div className="journey-v5-item" key={item}><span>{String(i+1).padStart(2,"0")}</span><i/><h3>{item}</h3></div>)}</div>
    </section>

    <CognitiveStory/>

    <section id="sabrina-v5" className="section sabrina-v5 v5-lazy-section">
      <div className="sabrina-v5-copy">
        <div className="section-kicker">HYPER SABRINA</div>
        <h2>Elegância na voz.<br/>Rigor no que está por trás.</h2>
        <p>O Ghostwriter não “vira” Sabrina. Ele prepara textos na voz aprovada dela, usando somente o contexto daquele projeto e parando sempre antes de uma decisão que exige autoridade humana.</p>
        <div className="sabrina-v5-rules">
          <div><b>01</b><span>fatos autorizados</span></div><div><b>02</b><span>risk scan</span></div>
          <div><b>03</b><span>draft versionado</span></div><div><b>04</b><span>approval SHA-256</span></div>
        </div>
      </div>
      <div className="glass sabrina-v5-console">
        <div className="sv5-top"><span className="status-dot"/> HYPER SABRINA <small>PROJECT / LOJA JARDINS</small></div>
        <div className="sv5-path"><span>contextualized</span><i>→</i><span>drafted</span><i>→</i><span>criticized</span><i>→</i><strong>awaiting approval</strong></div>
        <div className="sv5-input">Solicite um retorno do fornecedor sobre a iluminação, com elegância e objetividade.</div>
        <div className="sv5-draft"><small>RASCUNHO PARA APROVAÇÃO</small><p>Olá! Tudo bem? Gostaria de retomar o alinhamento sobre a iluminação para preservarmos o ritmo das próximas etapas do projeto. Quando puder, me atualize sobre esse ponto. Obrigada!</p></div>
        <div className="sv5-safety"><span>external_write=false</span><span>no auto-send</span><span>project memory isolated</span></div>
        <Link className="button primary wide" to="/app/approvals">Abrir Approval Center</Link>
      </div>
    </section>

    <section className="section memory-story-v5 v5-lazy-section">
      <div className="memory-v5-orb" aria-hidden="true"><span>APPROVED</span></div>
      <div><div className="section-kicker">MEMORY PLANE</div><h2>A GLIP não aprende<br/>com qualquer rascunho.</h2><p>Somente uma versão aprovada pode originar um candidato de memória. E o candidato ainda precisa de promoção humana antes de se tornar memória ativa do projeto.</p>
      <div className="memory-v5-flow"><span>approved version</span><i>→</i><span>memory candidate</span><i>→</i><span>human promote</span><i>→</i><strong>project memory</strong></div></div>
    </section>

    <section className="section statement-v5 v5-lazy-section">
      <div className="statement-777">777</div>
      <div><div className="section-kicker">GLIP × EFATÀ</div><h2>A inteligência é compartilhada.<br/>A autoridade do projeto, não.</h2><p>O domínio continua GLIP. A inteligência continua Efatà. A decisão continua humana.</p></div>
    </section>

    <section className="section final-v5">
      <div className="v5-final-halo"/>
      <small>GLIP • PROJECT INTELLIGENCE EXPERIENCE</small>
      <h2>O projeto deixa de ser<br/>uma coleção de arquivos.<br/><em>Ele ganha continuidade.</em></h2>
      <Link className="button primary" to="/app">Entrar na plataforma</Link>
    </section>

    <footer className="footer-v3"><b>GLIP</b><span>Project Intelligence Experience · V5</span><small>domain plane × Efatà 777</small></footer>
  </div>
}
