const { pool } = require("../db/dbConnect");

const schemaName = "questionnaire";
const tableName = "ques_data";

const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schemaName};`;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ${schemaName}.${tableName} (
    ID SERIAL PRIMARY KEY,
    question_type INTEGER,
    description VARCHAR,
    CONSTRAINT fk_question_type FOREIGN KEY (question_type) REFERENCES questionnaire.ques_Services_data(id)
  );
`;

const createSchemaAndTable = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log("DB Connected Successfully");

    // Create the schema
    await client.query(createSchemaQuery);
    console.log(`Schema '${schemaName}' created or already exists.`);

    // Create the table within the schema
    await client.query(createTableQuery);
    console.log(`Table '${tableName}' created or already exists in schema '${schemaName}'.`);

  } catch (err) {
    console.error("Error creating schema or table:", err.message);
  } finally {
    // Ensure the client is released even if an error occurs
    if (client) client.release();
    console.log("Client released.");
  }
};

module.exports = {
  pool,
  createSchemaAndTable,
};
