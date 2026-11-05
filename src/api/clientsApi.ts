import { API_BASE_URL } from "./api"
import type { Client } from "../types/models"
import { isClient } from "../utils/dataGuards"

type ClientInput = Omit<Client, "id">
type ClientUpdates = Partial<Omit<Client , "id">>

export async function deleteClient(id: string): Promise<void>{
    const response = await fetch(`${API_BASE_URL}/api/clients/${id}` , {
        method: "DELETE"
    })
    if(!response.ok){
        throw new Error("Failed to delete client")
    }
}

export async function updateClient(
    id: string ,
    updates: ClientUpdates
): Promise<Client>{
    const response = await fetch(`${API_BASE_URL}/api/clients/${id}` , {
        method: "PATCH" ,
        headers:{
            "Content-type":"application/json"
        },
        body: JSON.stringify(updates)
    })
    if(!response.ok){
        throw new Error("Failed to update client")
    }
    const data: unknown = await response.json()
    if(!isClient(data)){
        throw new Error("Invalid client response")
    }
    return data
}

export async function createClient(input: ClientInput): Promise<Client>{
    const response = await fetch(`${API_BASE_URL}/api/clients`,{
        method: "POST" ,
        headers:{
            "Content-type":"application/json"
        },
        body: JSON.stringify(input)
    })
    if(!response.ok){
        throw new Error("Failed to create client")
    }
    const data: unknown = await response.json()
    if(!isClient(data)){
        throw new Error("Invalid client response")
    }
    return data
}

export async function getClients(): Promise<Client[]> {
    const response = await fetch(`${API_BASE_URL}/api/clients`)
    if(!response.ok){
        throw new Error("Failed to load clients")
    }
    const data: unknown = await response.json()
    if(!Array.isArray(data) || !data.every(isClient)){
        throw new Error("Invalid clients response")
    }
    return data
} 
