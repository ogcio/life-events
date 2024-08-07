const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config();

const configPath = path.join(__dirname, "database.json");
const config_ = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const key = config_.defaultEnv;
const config = config_[key];

const user = process.env[config.user.ENV];
const host = process.env[config.host.ENV];
const password = process.env[config.password.ENV];
const port = process.env[config.port.ENV];

const createDatabase = async (dbName) => {
  const client = new Client({
    user,
    host,
    password,
    port,
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Check if the database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname='${dbName}'`;
    const res = await client.query(checkDbQuery);

    if (res.rowCount === 0) {
      // Create the database if it doesn't exist
      const createDbQuery = `CREATE DATABASE ${dbName}`;
      await client.query(createDbQuery);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (err) {
    console.error("Error creating database", err);
  } finally {
    await client.end();
    console.log("Disconnected from PostgreSQL");
  }
};

// Get the database name from command line arguments
const dbName = process.argv[2];

if (!dbName) {
  console.error("Please provide a database name");
  process.exit(1);
}

createDatabase(dbName);
