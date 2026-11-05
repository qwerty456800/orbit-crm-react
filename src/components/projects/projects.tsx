import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import ProjectCard from "./ProjectCard"
import ProjectFilters from "./ProjectFilters"
import ProjectModal from "./ProjectModal"
import ProjectSummary from "./ProjectSummary"
import { parseDeadline } from "./dateUtils"
import type { Client, Project, ProjectStatus } from "../../types/models"
import type { ActivityType } from "../../types/models"
import type { ProjectForm } from "./ProjectModal"
import { createProject } from "../../api/projectsApi"
import { updateProject as updateProjectRequest } from "../../api/projectsApi"
import { deleteProject as deleteProjectRequest } from "../../api/projectsApi"
import { showApiError } from "../../utils/showApiError"

type ProjectProps = {
  projects: Project[]
  clients: Client[]
  addProject: (project: Project) => void
  deleteProject: (id: string) => void
  updateProject: (id: string, project: ProjectUpdater) => void
  addActivity: (type: ActivityType, title: string, detail: string) => void
  isLoading: boolean
  error: string | null
}

type ProjectUpdater = (project: Project) => Partial<Project>

const emptyForm: ProjectForm = {
  clientId: "",
  title: "",
  status: "In progress",
  progress: 1,
  deadline: "",
}

function Projects({
  projects,
  clients,
  addProject,
  updateProject,
  deleteProject,
  addActivity,
  isLoading ,
  error ,
}: ProjectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "All">(
    "All"
  )
  const [form, setForm] = useState(emptyForm)
  const [sortBy, setSortBy] = useState<"deadline" | "progress" | "title">(
    "deadline"
  )
  const normalizedSearch = search.trim().toLowerCase()
  const overdueCount = projects.filter((project) => {
    const deadline = parseDeadline(project.deadline)
    return (
      deadline &&
      deadline < new Date(new Date().setHours(0, 0, 0, 0)) &&
      project.status !== "Completed"
    )
  }).length
  const visibleProjects = projects
    .filter(
      (project) =>
        (selectedStatus === "All" || project.status === selectedStatus) &&
        [
          clients.find((client) => client.id === project.clientId)?.company ??
            "",
          project.title,
        ].some((field) => field.toLowerCase().includes(normalizedSearch))
    )
    .sort((first, second) =>
      sortBy === "progress"
        ? second.progress - first.progress
        : sortBy === "title"
          ? first.title.localeCompare(second.title)
          : (parseDeadline(first.deadline)?.getTime() ?? Infinity) -
            (parseDeadline(second.deadline)?.getTime() ?? Infinity)
    )
  const inProgressCount = projects.filter(
    (project) => project.status === "In progress"
  ).length
  const completedCount = projects.filter(
    (project) => project.status === "Completed"
  ).length

  useEffect(() => {
    if (!isModalOpen) return undefined
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [isModalOpen])

  function closeModal() {
    setIsModalOpen(false)
    setForm(emptyForm)
  }
  function updateForm(field: keyof ProjectForm, value: string | number) {
    setForm((current) => ({ ...current, [field]: value }))
  }
  function handleDraftProgressChange(progress: number) {
    updateForm("progress", progress)
    updateForm(
      "status",
      progress === 100
        ? "Completed"
        : form.status === "Completed"
          ? "In progress"
          : form.status
    )
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const newProject = {
    clientId: form.clientId,
    title: form.title.trim(),
    status: form.status,
    progress: form.status === "Completed" ? 100 : Number(form.progress),
    deadline: form.deadline,
  }

  let createdProject: Project
  try {
    createdProject = await createProject(newProject)
  } catch (error) {
    showApiError(error, "Failed to create project")
    return
  }

  addProject(createdProject)

  addActivity(
    "project",
    "New project created",
    `${newProject.title} · ${
      clients.find((client) => client.id === newProject.clientId)?.company ??
      "Unassigned client"
    }`
  )

  closeModal()
}
  async function handleDelete(id: string) {
  const deletedProject = projects.find((project) => project.id === id)

  try {
    await deleteProjectRequest(id)
  } catch (error) {
    showApiError(error, "Failed to delete project")
    return
  }

  deleteProject(id)

  if (deletedProject) {
    addActivity("project", "Project deleted", deletedProject.title)
  }
}
  function getNextStatus(status: ProjectStatus) {
    return status === "In progress"
      ? "In review"
      : status === "In review"
        ? "Completed"
        : "In progress"
  }
  async function handleStatusChange(id: string) {
  const selectedProject = projects.find((project) => project.id === id)

  if (!selectedProject) {
    throw new Error("Project not found")
  }

  const nextStatus: ProjectStatus = getNextStatus(selectedProject.status)

  const updates = {
    status: nextStatus,
    progress:
      nextStatus === "Completed"
        ? 100
        : selectedProject.status === "Completed"
          ? (selectedProject.progressBeforeCompleted ?? 0)
          : selectedProject.progress,
    progressBeforeCompleted:
      nextStatus === "Completed"
        ? selectedProject.progress
        : selectedProject.progressBeforeCompleted,
  }

  let updatedProject: Project
  try {
    updatedProject = await updateProjectRequest(id, updates)
  } catch (error) {
    showApiError(error, "Failed to update project")
    return
  }

  updateProject(id, () => ({
    status: updatedProject.status,
    progress: updatedProject.progress,
    progressBeforeCompleted: updatedProject.progressBeforeCompleted,
  }))

  addActivity(
    "project",
    "Project status changed",
    `${selectedProject.title} · ${updatedProject.status}`
  )
}
  async function handleProgressChange(id: string, newProgress: number) {
  const selectedProject = projects.find((project) => project.id === id)

  if(!selectedProject){
    throw new Error("Project not found")
  }

  const nextStatus: ProjectStatus = 
  newProgress === 100
    ? "Completed"
    : selectedProject.status === "Completed"
      ? "In progress"
      : selectedProject.status

  const updates = {
    progress: newProgress,
    status: nextStatus
  }

  let updatedProject: Project
  try {
    updatedProject = await updateProjectRequest(id, updates)
  } catch (error) {
    showApiError(error, "Failed to update project")
    return
  }

  updateProject(id, () => ({
    progress: updatedProject.progress,
    status: updatedProject.status,
    progressBeforeCompleted: updatedProject.progressBeforeCompleted,
  }))
}
if (isLoading) {
  return (
    <main className="projects-page">
      <p>Loading projects...</p>
    </main>
  )
}

if (error) {
  return (
    <main className="projects-page">
      <p>{error}</p>
    </main>
  )
}
  return (
    <main className="projects-page">
      <div className="page-heading projects-heading">
        <div>
          <p className="eyebrow">Delivery</p>
          <h1>Projects</h1>
          <p>Track progress and move every project toward completion.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setIsModalOpen(true)}
        >
          <span>＋</span> New project
        </button>
      </div>
      <ProjectSummary
        total={projects.length}
        inProgress={inProgressCount}
        completed={completedCount}
        overdue={overdueCount}
      />
      <section className="projects-panel">
        <ProjectFilters
          projects={projects}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        {visibleProjects.length === 0 ? (
          <div className="empty-state project-empty">
            <span>◇</span>
            <h2>
              {projects.length ? "No matching projects" : "No projects yet"}
            </h2>
            <p>
              {projects.length
                ? "Try another filter or search."
                : "Create your first project to get started."}
            </p>
          </div>
        ) : (
          <div className="project-grid">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                client={clients.find(
                  (client) => client.id === project.clientId
                )}
                onDelete={() => handleDelete(project.id)}
                onStatusChange={() => handleStatusChange(project.id)}
                onProgressChange={(value) =>
                  handleProgressChange(project.id, value)
                }
              />
            ))}
          </div>
        )}
      </section>
      {isModalOpen && (
        <ProjectModal
          clients={clients}
          fields={form}
          onChange={updateForm}
          onProgressChange={handleDraftProgressChange}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </main>
  )
}
export default Projects
