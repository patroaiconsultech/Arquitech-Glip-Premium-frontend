import {Link} from "react-router-dom";
import {useEffect,useRef} from "react";
import "../ux01.css";

const productCards=[
  {index:"01",title:"Projetos",text:"Centralize o contexto do projeto e acompanhe a evolução sem depender de conversas e arquivos dispersos."},
  {index:"02",title:"Operação",text:"Organize clientes, prestadores, aprovações e próximos passos a partir do mesmo ambiente de trabalho."},
  {index:"03",title:"Inteligência",text:"Converse com o GLIP Intelligence usando o contexto autorizado do workspace e de cada projeto."},
  {index:"04",title:"Continuidade",text:"Mantenha decisões, memória e histórico conectados para reduzir perda de contexto entre fases e pessoas."},
];

const journey=[
  ["01","Organize","O projeto nasce com um lugar único para contexto, responsáveis e informação operacional."],
  ["02","Acompanhe","Pendências, prestadores, aprovações e decisões permanecem próximas do projeto."],
  ["03","Converse","A inteligência trabalha sobre o contexto autorizado e ajuda a transformar informação em próximos passos."],
];

export default function Landing(){
  const root=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const el=root.current;
    if(!el)return;
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse=matchMedia("(pointer: coarse)").matches;
    if(reduce||coarse)return;
    const move=(e:PointerEvent)=>{
      el.style.setProperty("--ux01-mx",`${e.clientX/window.innerWidth*100}%`);
      el.style.setProperty("--ux01-my",`${e.clientY/window.innerHeight*100}%`);
    };
    addEventListener("pointermove",move,{passive:true});
    return()=>removeEventListener("pointermove",move);
  },[]);

  return <div className="ux01-public" ref={root}>
    <div className="ux01-ambient" aria-hidden="true"/>
    <header className="ux01-nav">
      <a className="ux01-brand" href="#top" aria-label="GLIP — início">
        <span className="ux01-brand-mark">G</span><span>GLIP</span>
      </a>
      <nav aria-label="Navegação principal">
        <a href="#produto">Produto</a>
        <a href="#como-funciona">Como funciona</a>
        <a href="#inteligencia">Inteligência</a>
        <a href="#seguranca">Segurança</a>
        <Link className="button ghost" to="/login?return_to=/app">Entrar</Link>
      </nav>
    </header>

    <main id="top">
      <section className="ux01-hero">
        <div className="ux01-hero-grid" aria-hidden="true"/>
        <div className="ux01-hero-copy">
          <span className="ux01-kicker">GLIP • PROJECT INTELLIGENCE FOR ARCHITECTURE</span>
          <h1>Projetos complexos.<br/><em>Contexto contínuo.</em><br/>Decisões mais claras.</h1>
          <p>A GLIP reúne o trabalho do escritório em torno do projeto para reduzir fragmentação, preservar contexto e apoiar decisões com inteligência.</p>
          <div className="ux01-actions">
            <Link className="button primary" to="/login?return_to=/app">Entrar na plataforma</Link>
            <a className="button ghost" href="#como-funciona">Conhecer a experiência</a>
          </div>
          <div className="ux01-proof" aria-label="Princípios da GLIP">
            <span>Contexto por projeto</span>
            <span>Memória governada</span>
            <span>Autoridade humana</span>
          </div>
        </div>
        <div className="ux01-orbit" aria-hidden="true">
          <div className="ux01-orbit-ring ring-a"/><div className="ux01-orbit-ring ring-b"/>
          <div className="ux01-orbit-core"><small>PROJECT</small><strong>GLIP</strong><span>context</span></div>
          <div className="ux01-orbit-card card-a"><small>01</small><b>Contexto</b><span>projeto, pessoas e histórico</span></div>
          <div className="ux01-orbit-card card-b"><small>02</small><b>Inteligência</b><span>leitura orientada ao projeto</span></div>
        </div>
      </section>

      <section id="produto" className="ux01-section">
        <div className="ux01-section-head">
          <div>
            <span className="ux01-kicker">UM AMBIENTE PARA O ESCRITÓRIO</span>
            <h2>Menos fragmentação.<br/>Mais continuidade.</h2>
          </div>
          <p>A experiência foi desenhada para manter o trabalho próximo do projeto, sem transformar cada etapa em uma ferramenta isolada.</p>
        </div>
        <div className="ux01-product-grid">
          {productCards.map(card=><article className="ux01-product-card" key={card.index}>
            <small>{card.index}</small><h3>{card.title}</h3><p>{card.text}</p>
          </article>)}
        </div>
      </section>

      <section id="como-funciona" className="ux01-section ux01-journey">
        <span className="ux01-kicker">DO BRIEFING À OPERAÇÃO</span>
        <h2>O projeto muda de fase.<br/>O contexto não precisa desaparecer.</h2>
        <div className="ux01-journey-grid">
          {journey.map(([index,title,text])=><article key={index}>
            <span>{index}</span><i/><h3>{title}</h3><p>{text}</p>
          </article>)}
        </div>
      </section>

      <section id="inteligencia" className="ux01-section ux01-intelligence">
        <div className="ux01-intelligence-copy">
          <span className="ux01-kicker">GLIP INTELLIGENCE</span>
          <h2>Inteligência que conhece o projeto — e respeita seus limites.</h2>
          <p>O chat interno pode trabalhar com o contexto autorizado do GLIP para ajudar a entender prioridades, riscos, tarefas e próximos passos. Ações críticas continuam dependendo de autoridade humana.</p>
          <div className="ux01-trust-list">
            <span><b>01</b> contexto autorizado</span>
            <span><b>02</b> escopo por workspace e projeto</span>
            <span><b>03</b> sem ação externa silenciosa</span>
          </div>
        </div>
        <div className="ux01-chat glass" aria-label="Exemplo visual do GLIP Intelligence">
          <div className="ux01-chat-top"><span className="status-dot"/> GLIP Intelligence <small>PROJETO ATIVO</small></div>
          <div className="ux01-message user">Quais pontos merecem atenção antes da próxima reunião?</div>
          <div className="ux01-message assistant">
            <small>ANÁLISE CONTEXTUAL</small>
            <p>Posso organizar os pontos em prioridades, pendências e decisões necessárias com base no contexto disponível do projeto.</p>
          </div>
          <div className="ux01-chat-foot"><span>read-only MVP</span><span>human authority</span></div>
        </div>
      </section>

      <section id="seguranca" className="ux01-section ux01-security">
        <div>
          <span className="ux01-kicker">GOVERNANÇA DESDE A BASE</span>
          <h2>O contexto é compartilhado.<br/>A autoridade não.</h2>
          <p>A GLIP separa workspaces e mantém autenticação, sessão e operações sensíveis sob controle do backend. Inteligência não substitui aprovação humana.</p>
        </div>
        <div className="ux01-security-grid">
          <div><small>WORKSPACE</small><strong>Contexto isolado</strong></div>
          <div><small>SESSION</small><strong>Acesso protegido</strong></div>
          <div><small>AUTHORITY</small><strong>Decisão humana</strong></div>
        </div>
      </section>

      <section className="ux01-final">
        <span className="ux01-kicker">GLIP • PROJECT INTELLIGENCE</span>
        <h2>Menos ruído entre as partes.<br/><em>Mais continuidade no projeto.</em></h2>
        <Link className="button primary" to="/login?return_to=/app">Entrar na GLIP</Link>
      </section>
    </main>

    <footer className="ux01-footer">
      <b>GLIP</b><span>Project Intelligence for Architecture</span><small>© 2026</small>
    </footer>
  </div>;
}
