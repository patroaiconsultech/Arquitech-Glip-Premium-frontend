export const QUALIFICATION_STEPS: readonly {readonly id:"profile"|"need"|"projects";readonly question:string;readonly choices:readonly string[]}[];
export function safeCommercialQuestion(question:unknown):{ok:boolean;message?:string};
export function answerCommercialQuestion(question:unknown):{topic:string;message:string;accepted:boolean};
export function qualificationSummary(answers:{profile?:string;need?:string;projects?:string}):string;
