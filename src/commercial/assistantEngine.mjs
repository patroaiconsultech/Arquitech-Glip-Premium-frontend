/**
 * CONSTRUTECH P0-C: non-generative, browser-only commercial guidance.
 * No fetch, persistence, analytics, cookies, model calls, or PII submission.
 * IMPORTANT: Visitor text is only held in component memory until the drawer closes.
 */
export const QUALIFICATION_STEPS = Object.freeze([
  Object.freeze({id:"profile", question:"Qual é o perfil da sua operação?",
    choices:Object.freeze(["Incorporadora","Construtora","Loteadora","Investidor","Consultoria / outro"])}),
  Object.freeze({id:"need", question:"Qual desafio você quer resolver primeiro?",
    choices:Object.freeze(["Estudo de viabilidade","Recebíveis e fluxo de caixa","Projetos e documentos","Obras e orçamento","Conhecer a plataforma"])}),
  Object.freeze({id:"projects", question:"Quantos empreendimentos você acompanha?",
    choices:Object.freeze(["Um","De 2 a 5","Seis ou mais","Ainda estou planejando"])})
]);

const canonical = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const words = (value) => canonical(value).split(/[^a-z0-9]+/).filter(Boolean);

export function safeCommercialQuestion(value) {
  if(typeof value!=="string") return {ok:false, message:"Digite apenas uma pergunta sobre a plataforma."};
  const q=value.trim();
  if(q.length<3 || q.length>240) return {ok:false,message:"Use uma pergunta de 3 a 240 caracteres."};
  if(/[\u0000-\u001F\u007F]/.test(q)) return {ok:false,message:"A pergunta contém caracteres não permitidos."};
  if(/@|https?:\/\/|www\.|(?:\+?\d[\s().-]*){9,}|(?:cpf|cnpj|senha|password|token|api.key|endereco|telefone|celular|whatsapp|e-mail|email|meu nome|me chamo)\s*[:=]/i.test(q))
    return {ok:false,message:"Por privacidade, não informe nomes, e-mails, telefones, links ou outros dados pessoais neste atendimento."};
  return {ok:true};
}

const TOPICS = [
  {id:"viabilidade",terms:["viabilidade","tir","vpl","vgv","terreno","terrenos","permuta","cenarios","cenario","rentabilidade"],
   response:"O motor completo de viabilidade imobiliária é prioridade de desenvolvimento. Ele deverá reunir VGV, premissas, cenários, fluxo de caixa, VPL e TIR com cálculos verificáveis. Ainda não está homologado para uso comercial."},
  {id:"recebiveis",terms:["recebiveis","recebimento","receber","parcela","parcelas","inadimplencia","cobranca","carteira","indexador"],
   response:"A gestão de recebíveis está planejada como próxima etapa: contratos, parcelas, indexadores, inadimplência e projeções por empreendimento. O módulo não está disponível para operação comercial."},
  {id:"projetos",terms:["projeto","projetos","documentos","documentacao","aprovacao","aprovacoes","tarefas","historico"],
   response:"Já existem fundações de gestão de projetos, tarefas, documentos, versões e aprovações no software. Esses recursos ainda exigem integração e homologação antes de serem oferecidos comercialmente."},
  {id:"obra",terms:["engenharia","obra","obras","orcamento","custos","bim","cad","ifc","dxf","quantitativos"],
   response:"A plataforma possui fundações de orçamento, precificação, BIM/CAD e processamento técnico. A precisão dos quantitativos e a integração operacional ainda precisam ser homologadas."},
  {id:"agentes",terms:["agente","agentes","inteligencia","especialistas","ia","arquiteto","engenheiro","juridico","financeiro"],
   response:"A CONSTRUTECH planeja uma equipe de especialistas digitais coordenados para incorporação, engenharia, finanças e documentação. A equipe multiagente completa ainda não está disponível. Este atendimento é guiado, não uma IA generativa."},
  {id:"preco",terms:["preco","precos","valor","preços","planos","mensalidade","assinar","contratar"],
   response:"Os planos e preços estão em validação comercial. Ainda não há oferta contratual definitiva ou garantia de disponibilidade dos módulos. O canal de demonstração será habilitado após a homologação da privacidade e da API comercial."},
  {id:"seguranca",terms:["seguranca","privacidade","sigilo","nda","confidencialidade","lgpd","dados","protecao"],
   response:"A arquitetura prevê autenticação, permissões e isolamento entre organizações. O aceite contratual versionado ainda depende de homologação jurídica e técnica. Não envie documentos ou informações sensíveis neste chat."},
  {id:"piloto",terms:["piloto","demonstracao","demo","contato","comercial","reuniao","falar","conversar"],
   response:"Você pode consultar o botão 'Solicitar piloto'. O envio de dados ficará bloqueado até a API comercial confirmar a captação habilitada e o aviso de privacidade aprovado. Nada é registrado por este assistente."}
];
export function answerCommercialQuestion(question) {
  const valid=safeCommercialQuestion(question);
  if(!valid.ok) return {topic:"invalid",accepted:false,message:valid.message};
  const tokens=words(question);
  let winner;
  let max=0;
  for(const row of TOPICS){
    const score=row.terms.filter(t=>tokens.includes(canonical(t))).length;
    if(score>max){max=score;winner=row;}
  }
  return winner ? {topic:winner.id,accepted:true,message:winner.response}
    : {topic:"other",accepted:true,message:"Posso orientar sobre viabilidade, recebíveis, projetos, custos, especialistas digitais, segurança e pilotos. Que tema você gostaria de conhecer? Não compartilhe dados pessoais ou sigilosos."};
}
export function qualificationSummary(answers) {
  const parts=[];
  for(const item of QUALIFICATION_STEPS){
    const raw=answers?.[item.id];
    if(item.choices.includes(raw)) parts.push(`${item.id==="profile"?"Perfil":item.id==="need"?"Prioridade":"Empreendimentos"}: ${raw}`);
  }
  return parts.length ? `${parts.join(" · ")}. Pré-qualificação local; nenhum dado foi enviado ou registrado.`
    : "Nenhum dado foi informado.";
}
