import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {QUALIFICATION_STEPS,safeCommercialQuestion,answerCommercialQuestion,qualificationSummary} from "../src/commercial/assistantEngine.mjs";

test("guided qualification is bounded to approved, non-sensitive choices",()=>{
  assert.deepEqual(QUALIFICATION_STEPS.map(s=>s.id),["profile","need","projects"]);
  assert.ok(QUALIFICATION_STEPS.every(s=>s.choices.length>=4));
  assert.match(qualificationSummary({profile:"Incorporadora",need:"Estudo de viabilidade",projects:"Um"}),/nenhum dado foi enviado ou registrado/i);
  assert.doesNotMatch(qualificationSummary({profile:"email@cliente.com"}),/email@cliente.com/i);
});
test("answers describe existing foundations and planned capabilities without claiming readiness",()=>{
  assert.match(answerCommercialQuestion("Como funciona a viabilidade?").message,/não está homologado/i);
  assert.match(answerCommercialQuestion("Como funciona a carteira de recebíveis?").message,/não está disponível/i);
  assert.match(answerCommercialQuestion("Gostaria de conhecer os projetos").message,/homologação/i);
  assert.match(answerCommercialQuestion("Existem agentes de IA?").message,/não uma IA generativa/i);
  assert.match(answerCommercialQuestion("Quero um piloto").message,/bloqueado/i);
});
test("browser-only assistant rejects common PII and extremely long input",()=>{
  for(const q of [
    "meu email: cliente@empresa.com","Meu número é 51999998888",
    "Contato https://exemplo.com","CPF 123.456.789-01","Senha: secreta",
    "a".repeat(241)]) assert.equal(safeCommercialQuestion(q).ok,false,q);
  assert.equal(safeCommercialQuestion("Como será a análise de cenários?").ok,true);
});
test("no network, storage, provider secrets or persistent lead submission in assistant files",()=>{
  const engine=fs.readFileSync("src/commercial/assistantEngine.mjs","utf8");
  const view=fs.readFileSync("src/commercial/PublicSalesAssistant.tsx","utf8");
  const landing=fs.readFileSync("src/routes/Landing.tsx","utf8");
  assert.doesNotMatch(engine+view,/\\b(fetch|localStorage|sessionStorage|sendBeacon|XMLHttpRequest|navigator\.sendBeacon)\s*\(/);
  assert.doesNotMatch(engine+view,/\/api\/public\/leads|api[_-]?key/i);
  assert.match(landing,/PublicSalesAssistant/);
  assert.match(landing,/salesOpen&&<PublicSalesAssistant/);
  assert.match(view,/Atendimento guiado e informativo/);
  assert.match(view,/role="dialog"/);
  assert.match(view,/onDemo/);
});
