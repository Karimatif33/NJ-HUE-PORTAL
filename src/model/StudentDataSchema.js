// dbUtils.js
const { pool } = require("../db/dbConnect");

const schemaName = "UserData";
const TableName = "users";

// SQL Queries
const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schemaName};`;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ${schemaName}.${TableName} (
    ID SERIAL PRIMARY KEY,
    enName VARCHAR,
    UserName VARCHAR,
    Code INTEGER,
    NationalID VARCHAR(500),
    FacultyID INTEGER,
    CourseID INTEGER,
    IsAdmin BOOLEAN NOT NULL,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '3 hours',
    CONSTRAINT fk_course FOREIGN KEY (CourseID) REFERENCES CourseData.courses(id),
    CONSTRAINT fk_acad_year FOREIGN KEY (FacultyID) REFERENCES FacultyData.facultydata(id)
  );
`;

const createFunctionQuery = `
  CREATE OR REPLACE FUNCTION update_last_login()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.last_login = CURRENT_TIMESTAMP + INTERVAL '3 hours';
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
`;

const createTriggerQuery = `
  CREATE TRIGGER update_last_login_trigger
  BEFORE UPDATE ON ${schemaName}.${TableName}
  FOR EACH ROW
  WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
  EXECUTE FUNCTION update_last_login();
`;

// Function to create schema, table, function, and trigger
const createSchemaAndTable = async () => {
  const client = await pool.connect();
  try {
    console.log("DB Connected Successfully");

    // Create the schema
    await client.query(createSchemaQuery);

    // Create the table within the schema
    await client.query(createTableQuery);

    // Create the function to update last_login
    await client.query(createFunctionQuery);

    // Create the trigger for the function
    await client.query(createTriggerQuery);

    console.log(`Schema '${schemaName}' and table '${TableName}' created successfully.`);
    console.log('Trigger function and trigger created successfully.');

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  createSchemaAndTable,
};
