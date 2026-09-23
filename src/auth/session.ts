function safeReturnTo(value:string){
  return value.startsWith("/") && !value.startsWith("//") ? value : "/app";
}

export function beginLogin(returnTo="/app"){
  const target=safeReturnTo(returnTo);
  if(import.meta.env.VITE_GLIP_DEV_MODE==="true"){
    location.assign(target);
    return;
  }
  location.assign(`/login?return_to=${encodeURIComponent(target)}`);
}
