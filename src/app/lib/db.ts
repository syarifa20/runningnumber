import knex from "knex";
import knexConfig from "../../../knexfile";

// Buat instance untuk MySQL
const db = knex(knexConfig.development);

// Buat instance untuk MSSQL
const dbMssql = knex(knexConfig.development2);

export { db, dbMssql };