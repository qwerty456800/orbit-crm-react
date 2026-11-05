import  express from "express";
import cors from "cors"
import type { Client } from "../src/types/models";
import type { Project } from "../src/types/models";
import { randomUUID } from "node:crypto"
import type { ProjectStatus } from "../src/types/models";
import pool from "./db";
   
pool.query("SELECT 1")
 .then(() => console.log("PosgtreSQL connected"))
 .catch((error) => console.error("PostgreSQL connection failed" , error))

const app = express()
app.use(cors())
app.use(express.json())
app.use((_request , response , next) => {
    response.set("Cache-Control" , "no-store")
    next()
})
app.get("/", (request, response) =>{
    response.send("Orbit Api is running")
})
app.get("/api/clients" , async (request, response) =>{
    const result = await pool.query(
  "SELECT id, name, email, company, status, value::float8 AS value FROM clients"
)
    response.json(result.rows)
})
app.get("/api/projects" ,(request, response) =>{
    response.json(projects)
})
app.post("/api/projects" , (request, response) =>{
    const input: ProjectInput = request.body
    if(input.status !== "In progress" && input.status !== "In review" && input.status !== "Completed"){
        return response.status(400).json()
    }
    if(typeof input.progress !== "number"){
        return response.status(400).json()
    }
    if(input.progress  <1 || input.progress  >100){
        return response.status(400).json()
    }
    if(!clients.some((client)=> client.id === input.clientId)){
        return response.status(400).json()
    }
    if(typeof input.deadline !== "string"){
        return response.status(400).json()
    }
    if(Number.isNaN(Date.parse(input.deadline))){
        return response.status(400).json()
    }
    const newProject: Project ={
        id: randomUUID() ,
        ...input
    }
    projects.push(newProject)
    response.status(201).json(newProject)
})
app.post("/api/clients" , async (request, response) =>{
    const input: ClientInput = request.body
    if(input.status !== "Active" && input.status !== "Lead"){
       return response.status(400).json()
    }
    if(typeof input.value !== "number"){
        return response.status(400).json()
    }
    const newClient: Client = {
        id: randomUUID() ,
        ...input
    }
    const result = await pool.query(
        `INSERT INTO clients (id, name , email, company, status, value)
        VALUES ($1 , $2, $3, $4, $5, $6)
        RETURNING *` ,
        [
            newClient.id ,
            newClient.name ,
            newClient.email ,
            newClient.company ,
            newClient.status ,
            newClient.value ,
        ]
    )
    const client = {
        ...result.rows[0],
        value: Number(result.rows[0].value),
    }
    response.status(201).json(client)
    console.log(input)
})
app.patch("/api/projects/:id" , (request , response) => {
    const project = projects.find((project) => project.id === request.params.id)
    if(!project){
        return response.status(404).json()
    }
    const updates: Partial<ProjectInput> = request.body ?? {}
    if(updates.progress !== undefined){
        if(
            typeof updates.progress !== "number" ||
            updates.progress <1 ||
            updates.progress >100
        ){
            return response.status(400).json()
        }
    }
    if(updates.status !== undefined){
        if(
            typeof updates.status !== "string" &&
            updates.status !== "In progress"  &&
            updates.status !== "In review"  &&
            updates.status !== "Completed" 
        ){
            return response.status(400).json()
        }
    }
    if(updates.clientId !== undefined){
        if(!clients.some((client) => client.id === updates.clientId)){
            return response.status(400).json()
        }
    }
    if(updates.deadline !== undefined){
        if(
            typeof updates.deadline !== "string" ||
            Number.isNaN(Date.parse(updates.deadline))
        ){
            return response.status(400).json()
        }
    }
    Object.assign(project, updates)
    response.status(200).json(project)
})
app.patch("/api/clients/:id", async (request, response) => {
  const updates: Partial<ClientInput> = request.body

  const result = await pool.query(
    `UPDATE clients
     SET
       name = COALESCE($1, name),
       email = COALESCE($2, email),
       company = COALESCE($3, company),
       status = COALESCE($4, status),
       value = COALESCE($5, value)
     WHERE id = $6
     RETURNING id, name, email, company, status, value::float8 AS value`,
    [
      updates.name ?? null,
      updates.email ?? null,
      updates.company ?? null,
      updates.status ?? null,
      updates.value ?? null,
      request.params.id,
    ]
  )

  if (result.rows.length === 0) {
    return response.status(404).json()
  }

  response.status(200).json(result.rows[0])
})
app.delete("/api/projects/:id" , (request, response) => {
    const projectIndex = projects.findIndex((project) => project.id === request.params.id)
    if(projectIndex === -1){
        return response.status(404).json()
    }
    projects.splice(projectIndex , 1)
    response.status(200).json()
})
app.delete("/api/clients/:id", async (request, response) => {
  const result = await pool.query(
    `DELETE FROM clients
     WHERE id = $1
     RETURNING id`,
    [request.params.id]
  )

  if (result.rows.length === 0) {
    return response.status(404).json()
  }

  response.status(200).json()
})

const clients: Client[] = [
    {
        id: "client-1",
        name: "Nora Stein" ,
        email: "nora@example.com" , 
        company: "Northstar Labs" , 
        status: "Active" ,
        value: 18400
    }
]

const projects: Project[] = [
    {
       id: "project-1" ,
       clientId: "client-1" ,
       title: "CRM redesign" ,
       status: "In progress" ,
       progress: 45  ,
       deadline: "2026-11-15"
    }
]

type ClientInput = {
    name: string
    email: string
    company: string
    status: "Active"|"Lead"
    value: number
}
type ProjectInput = {
    clientId: string
    title: string
    status: ProjectStatus
    progress: number
    deadline: string
}

app.listen(3000)
