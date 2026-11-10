import {FormEvent,useCallback,useEffect,useRef,useState} from "react";
import {QUALIFICATION_STEPS,answerCommercialQuestion,qualificationSummary} from "./assistantEngine.mjs";
import "./public-sales-assistant.css";

type Answers = {profile?:string;need?:string;projects?:string};
type Talk = {id:number;who:"visitor"|"assistant";content:string};

export default function PublicSalesAssistant({onClose,onDemo}:{
  onClose:()=>void;
  onDemo:()=>void;
}){
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Answers>({});
  const [query,setQuery]=useState("");
  const [tab,setTab]=useState<"profile"|"questions">("profile");
  const [messages,setMessages]=useState<Talk[]>([
    {id:0,who:"assistant",content:"Olá! Este é o atendimento comercial guiado da CONSTRUTECH. Posso apresentar recursos e ajudar a identificar sua necessidade. Não informe dados pessoais, credenciais ou informações sigilosas."}
  ]);
  const [error,setError]=useState("");
  const title=useRef<HTMLHeadingElement>(null);
  const pane=useRef<HTMLElement>(null);
  const history=useRef<HTMLDivElement>(null);
  const previousFocus=useRef<HTMLElement|null>(null);
  const nextId=useRef(1);

  const append=useCallback((who:"visitor"|"assistant",content:string)=>{
    setMessages(old=>[...old.slice(-15),{id:nextId.current++,who,content}]);
  },[]);

  useEffect(()=>{
    previousFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    title.current?.focus();
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="Escape"){e.preventDefault();onClose();return;}
      if(e.key!=="Tab"||!pane.current)return;
      const focusable=[...pane.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]")];
      const first=focusable[0],last=focusable.at(-1);
      if(!first||!last)return;
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===title.current)){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    document.addEventListener("keydown",onKey);
    return ()=>{
      document.removeEventListener("keydown",onKey);
      previousFocus.current?.focus();
    };
  },[onClose]);

  useEffect(()=>{if(history.current)history.current.scrollTop=history.current.scrollHeight;},[messages,tab]);

  function choose(value:string){
    const current=QUALIFICATION_STEPS[step];
    if(!current||!current.choices.includes(value))return;
    const newer={...answers,[current.id]:value} as Answers;
    setAnswers(newer);
    append("visitor",value);
    if(step+1<QUALIFICATION_STEPS.length){
      setStep(step+1);
      append("assistant",QUALIFICATION_STEPS[step+1].question);
    }else{
      setStep(QUALIFICATION_STEPS.length);
      append("assistant","Obrigado! A pré-qualificação terminou. "+qualificationSummary(newer)+" Você pode consultar as dúvidas frequentes ou verificar a disponibilidade do piloto.");
    }
  }

  function ask(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const response=answerCommercialQuestion(query);
    if(!response.accepted){setError(response.message);return;}
    setError("");
    append("visitor",query.trim());
    append("assistant",response.message);
    setQuery("");
  }

  function reset(){
    setAnswers({});setStep(0);setError("");
    setMessages([{id:nextId.current++,who:"assistant",content:"Vamos iniciar de novo. "+QUALIFICATION_STEPS[0].question}]);
  }

  return <div className="csa-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="csa-panel" role="dialog" aria-modal="true" aria-labelledby="csa-title" ref={pane}>
      <header className="csa-header">
        <div>
          <span className="csa-eyebrow">CONSTRUTECH · ATENDIMENTO COMERCIAL</span>
          <h2 id="csa-title" ref={title} tabIndex={-1}>Como podemos orientar seu empreendimento?</h2>
          <p>Atendimento guiado e informativo · sem IA generativa ativa</p>
        </div>
        <button type="button" className="csa-icon-button" aria-label="Fechar atendimento" onClick={onClose}>×</button>
      </header>
      <div className="csa-switch" role="group" aria-label="Modo de atendimento">
        <button type="button" className={tab==="profile"?"active":""} aria-pressed={tab==="profile"} onClick={()=>setTab("profile")}>Meu perfil</button>
        <button type="button" className={tab==="questions"?"active":""} aria-pressed={tab==="questions"} onClick={()=>setTab("questions")}>Perguntas sobre a plataforma</button>
      </div>
      <div className="csa-messages" role="log" aria-label="Conversa comercial" aria-live="polite" ref={history}>
        {messages.map(m=><p key={m.id} className={"csa-bubble "+(m.who==="visitor"?"csa-visitor":"csa-assistant")}>{m.content}</p>)}
      </div>
      {tab==="profile"?
        <div className="csa-actions">
          {step<QUALIFICATION_STEPS.length?<>
            <h3>{QUALIFICATION_STEPS[step].question}</h3>
            <div className="csa-choices">{QUALIFICATION_STEPS[step].choices.map(c=><button type="button" key={c} onClick={()=>choose(c)}>{c}</button>)}</div>
          </>:<>
            <p className="csa-summary" role="status">{qualificationSummary(answers)}</p>
            <button type="button" className="csa-light" onClick={reset}>Refazer perguntas</button>
          </>}
        </div>:
        <form className="csa-form" onSubmit={ask}>
          <label htmlFor="csa-question">Pergunte sobre os módulos ou sobre a fase do produto</label>
          <div className="csa-field"><input id="csa-question" value={query} maxLength={240}
              onChange={e=>{setQuery(e.target.value);setError("");}}
              placeholder="Ex.: Como funcionará a viabilidade?" autoComplete="off"/>
            <button type="submit" disabled={!query.trim()}>Perguntar</button></div>
          {error&&<p className="csa-error" role="alert">{error}</p>}
        </form>}
      <footer className="csa-footer">
        <p>Esta conversa permanece apenas nesta tela e não é enviada ao servidor. Não compartilhe dados pessoais nem conteúdo confidencial.</p>
        <button type="button" className="csa-cta" onClick={onDemo}>Ver disponibilidade do piloto</button>
      </footer>
    </section>
  </div>;
}
