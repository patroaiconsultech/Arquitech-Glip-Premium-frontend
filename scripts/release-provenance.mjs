import fs from "node:fs";
import crypto from "node:crypto";
import {execFileSync} from "node:child_process";

const sha256=(path)=>crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
const safeGit=(args)=>{
  try{return execFileSync("git",args,{encoding:"utf8"}).trim()||null;}
  catch{return null;}
};

const commit=process.env.GLIP_PROVENANCE_COMMIT_SHA||safeGit(["rev-parse","HEAD"]);
const tree=commit?safeGit(["rev-parse",`${commit}^{tree}`]):null;

const evidence={
  generated_at:new Date().toISOString(),
  repository:"patroaiconsultech/Arquitech-Glip-Premium-frontend",
  commit_sha:commit,
  tree_sha:tree,
  ref:process.env.GLIP_PROVENANCE_REF||safeGit(["branch","--show-current"]),
  github_run_id:process.env.GLIP_PROVENANCE_RUN_ID||null,
  github_run_attempt:process.env.GLIP_PROVENANCE_RUN_ATTEMPT||null,
  package_lock_sha256:fs.existsSync("package-lock.json")?sha256("package-lock.json"):null,
  source_manifest_sha256:fs.existsSync("SOURCE_MANIFEST.json")?sha256("SOURCE_MANIFEST.json"):null,
  build_evidence_sha256:fs.existsSync("BUILD_EVIDENCE.json")?sha256("BUILD_EVIDENCE.json"):null
};

fs.writeFileSync("RELEASE_PROVENANCE.json",JSON.stringify(evidence,null,2)+"\n");
console.log(`release_provenance commit=${commit||"unknown"} tree=${tree||"unknown"}`);
