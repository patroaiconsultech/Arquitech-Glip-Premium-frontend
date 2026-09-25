import {Outlet,Route,Routes} from "react-router-dom";
import Landing from "./routes/Landing";
import Workspace from "./routes/Workspace";
import ProjectPage from "./routes/ProjectPage";
import Ghostwriter from "./routes/Ghostwriter";
import Approvals from "./routes/Approvals";
import MemoryCenter from "./routes/MemoryCenter";
import IntelligenceStatus from "./routes/IntelligenceStatus";
import ProjectOperations from "./routes/ProjectOperations";
import Today from "./routes/Today";
import Clients from "./routes/Clients";
import Providers from "./routes/Providers";
import Protected from "./auth/Protected";
import Login from "./routes/Login";
import ArtifactStudio from "./routes/ArtifactStudio";

export default function App(){
  return <Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/login" element={<Login/>}/>

    <Route path="/app" element={<Protected><Outlet/></Protected>}>
      <Route index element={<Workspace/>}/>
      <Route path="/app/today" element={<Today/>}/>
      <Route path="/app/clients" element={<Clients/>}/>
      <Route path="/app/providers" element={<Providers/>}/>
      <Route path="/app/status" element={<IntelligenceStatus/>}/>
      <Route path="/app/projects/:projectId" element={<ProjectPage/>}/>
      <Route path="/app/projects/:projectId/operations" element={<ProjectOperations/>}/>
      <Route path="/app/projects/:projectId/ghostwriter" element={<Ghostwriter/>}/>
      <Route path="/app/projects/:projectId/artifacts" element={<ArtifactStudio/>}/>
      <Route path="/app/approvals" element={<Approvals/>}/>
      <Route path="/app/projects/:projectId/memory" element={<MemoryCenter/>}/>
    </Route>
  </Routes>
}
