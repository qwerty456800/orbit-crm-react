import { Pool } from "pg";
import "dotenv/config"

const pool = new Pool({
    host: "localhost" ,
    port: 5432 ,
    database: "orbit_crm" ,
    user: "postgres",
    password: process.env.DB_PASSWORD 
})

export default pool