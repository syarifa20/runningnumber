import { Knex } from "knex";
import * as dotenv from "dotenv";

dotenv.config();

const mysqlConnection = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE_NAME,
};
const mssqlConnection = {
  server: process.env.SSMS_HOST || "192.168.3.224",
  user: process.env.SSMS_USER || "sa",
  password: process.env.SSMS_PASSWORD || "Aa123456",
  database: process.env.SSMS_DATABASE_NAME || "truckingmdn",
  port: 1433,
  options: {
    encrypt: false, 
    enableArithAbort: true, // Diperlukan untuk mencegah error aritmatika
    requestTimeout: 50000000,  // Mengatur timeout permintaan ke 30 detik

  },
  pool: {
    min: 2,  // Minimum number of connections in the pool
    max: 50, // Maximum number of connections in the pool
  },
  acquireConnectionTimeout: 60000,
};

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: mysqlConnection,
    migrations: {
      tableName: "migrations",
      directory: "./src/app/database/migrations",
    },
    seeds: {
      directory: "./src/app/database/seeds",
    },
  },
  development2: {
    client: "mssql",
    connection:mssqlConnection,
    migrations: {
      tableName: "migrations",
      directory: "./src/app/database/migrations",
    },
    seeds: {
      directory: "./src/app/database/seeds",
    },
  },
};

export default knexConfig;
