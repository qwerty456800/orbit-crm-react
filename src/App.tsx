import { useState, useEffect } from "react"
import NotFound from "./components/notfound"
import Settings from "./components/settings"
import Reports from "./components/reports"
import Projects from "./components/projects/projects"
import { Routes, Route } from "react-router-dom"
import Sidebar from "./components/sidebar"
import Topbar from "./components/topbar"
import Dashboard from "./components/dashboard"
import Clients from "./components/clients/clients"
import WakeBanner from "./components/wakeBanner"
import { normalizeDeadline } from "./components/projects/dateUtils"
import { SettingsProvider } from "./context/SettingsContext"
import "./App.css"
import type { Client, Project, Activity, ActivityType } from "./types/models"
import { getClients } from "./api/clientsApi"
import { getProjects } from "./api/projectsApi"

type ProjectUpdater = (project: Project) => Partial<Project>

function loadActivity(): Activity[] {
  try {
    const savedActivity = localStorage.getItem("orbitActivity")
    const activity = savedActivity === null ? [] : JSON.parse(savedActivity)
    return activity.map((item: Activity) => ({
      ...item,
      id: String(item.id),
      ...(item.clientId !== undefined
        ? { clientId: String(item.clientId) }
        : {}),
      ...(item.projectId !== undefined
        ? { projectId: String(item.projectId) }
        : {}),
    }))
  } catch {
    return []
  }
}

function App() {
  const [isClientsLoading , setIsClientsLoading] = useState<boolean>(true)
  const [clientsError , setClientsError] = useState<string|null>(null)
  const [isProjectsLoading , setIsProjectsLoading] = useState<boolean>(true)
  const [projectsError , setProjectsError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activity, setActivity] = useState<Activity[]>(loadActivity)
  useEffect(() => {
    localStorage.setItem("orbitActivity", JSON.stringify(activity))
  }, [activity])
  useEffect(() =>{
    async function fetchProjectsFromApi(){
      try{
      const data = await getProjects()
      setProjects(data)
      setIsProjectsLoading(false)
    }catch(error){
    setProjectsError(
      error instanceof Error
      ? error.message
      :"Failed to load projects"
    ) 
    setIsProjectsLoading(false)}
    }
    fetchProjectsFromApi()
    async function fetchClientsFromApi() {
      try{
    const data = await getClients()
    setClients(data)
    setIsClientsLoading(false)
    }catch(error){
    setClientsError(
    error instanceof Error ? error.message: "Failed to load clients" 
  )
  setIsClientsLoading(false)
  }}
    fetchClientsFromApi()
  }, [])

  function addActivity(
    type: ActivityType,
    title: string,
    detail: string
  ): void {
    const newActivity = {
      id: crypto.randomUUID(),
      type,
      title,
      detail,
      createdAt: new Date().toISOString(),
    }
    setActivity((currentActivity) =>
      [newActivity, ...currentActivity].slice(0, 30)
    )
  }
  function addClient(client: Client): void {
    setClients((current) => [...current, client])
  }
  function updateClient(id: string, data: Partial<Client>): void {
    setClients((current) =>
      current.map((client) =>
        client.id === id ? { ...client, ...data } : client
      )
    )
  }
  function deleteClient(id: string): void {
    setClients((current) => current.filter((client) => client.id !== id))
  }
  function addProject(project: Project): void {
    setProjects((current) => [...current, project])
  }
  function updateProject(id: string, updater: ProjectUpdater): void {
    setProjects((current) =>
      current.map((project) =>
        project.id === id ? { ...project, ...updater(project) } : project
      )
    )
  }
  function deleteProject(id: string): void {
    setProjects((current) => current.filter((project) => project.id !== id))
  }
  return (
    <SettingsProvider>
      <div className="app-shell">
        <Sidebar clientCount={clients.length} projectCount={projects.length} />
        <div className="main-wrap">
          <Topbar />
          <WakeBanner isLoading={isClientsLoading || isProjectsLoading} />
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  clients={clients}
                  projects={projects}
                  activity={activity}
                />
              }
            />
            <Route
              path="/clients"
              element={
                <Clients
                  isLoading={isClientsLoading}
                  error={clientsError}
                  clients={clients}
                  addClient={addClient}
                  updateClient={updateClient}
                  deleteClient={deleteClient}
                  addActivity={addActivity}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <Projects
                  projects={projects}
                  clients={clients}
                  addProject={addProject}
                  updateProject={updateProject}
                  deleteProject={deleteProject}
                  addActivity={addActivity}
                  isLoading={isProjectsLoading}
                  error={projectsError}
                />
              }
            />
            <Route
              path="/reports"
              element={<Reports clients={clients} projects={projects} />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </SettingsProvider>
  )
}

export default App
