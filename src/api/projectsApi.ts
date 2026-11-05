import { API_BASE_URL, readError } from "./api";
import type { Project } from "../types/models";
import { isProject } from "../utils/dataGuards";

type ProjectInput = Omit<Project, "id">
type ProjectUpdates = Partial<Omit<Project , "id">>

export async function deleteProject(
    id: string
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}` , {
        method: "DELETE"
    })
    if(!response.ok){
        throw await readError(response, "Failed to delete project")
    }
}

export async function updateProject(
    id: string,
    updates: ProjectUpdates
): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects/${id}` , {
        method: "PATCH" ,
        headers: {
            "Content-type":"application/json"
        },
        body: JSON.stringify(updates)
    })
    if(!response.ok){
        throw await readError(response, "Failed to update projects")
    }
    const data: unknown = await response.json()
    if(!isProject(data)){
        throw new Error("Invalid project data")
    }
    return data
}

export async function createProject(
    input: ProjectInput
): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/api/projects` , {
        method: "POST" ,
        headers: {
            "Content-type":"application/json"
        },
        body: JSON.stringify(input)
    })
    if(!response.ok){
        throw await readError(response, "Failed to create projects")
    }
    const data: unknown = await response.json()
    if(!isProject(data)){
        throw new Error("Invalid project data")
    }
    return data
}

export async function getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/api/projects`)
    if(!response.ok){
        throw await readError(response, "Failed to load projects")
    }
    const data: unknown = await response.json()
    if(!Array.isArray(data) || !data.every(isProject)){
        throw new Error("Invalid data")
    }
    return data
}