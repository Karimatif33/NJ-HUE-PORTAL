const { pool } = require("../db/dbConnect");

const schemaName = "Levels";
const TableName = "levels";

// SQL Queries
const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schemaName};`;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ${schemaName}.${TableName} (
    ID SERIAL PRIMARY KEY,
    Name VARCHAR(255),
    last_updated_by VARCHAR(255), -- or INTEGER, depending on your user ID type
    last_updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '3 hours'
  );
`;

// Function to create schema and table
const createSchemaAndTable = async () => {
  const client = await pool.connect();
  try {
    console.log("DB Connected Successfully");

    // Create the schema
    await client.query(createSchemaQuery);

    // Create the table within the schema
    await client.query(createTableQuery);

    console.log(`Schema '${schemaName}' and table '${TableName}' created successfully.`);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    client.release(); // Ensure the client is released
  }
};

// Update record function
const updateRecord = async (id, name, updatedBy) => {

  const updateQuery = `
    UPDATE ${schemaName}.${TableName}
    SET 
      Name = $1,
      last_updated_by = $2,
      last_updated_on = CURRENT_TIMESTAMP + INTERVAL '3 hours'
    WHERE ID = $3;
  `;

  const client = await pool.connect();
  try {
    await client.query(updateQuery, [name, updatedBy, id]);
    console.log('Record updated successfully.');
  } catch (err) {
    console.error('Error updating record:', err.message);
  } finally {
    client.release(); // Ensure the client is released
  }
};

module.exports = {
  pool,
  createSchemaAndTable,
  updateRecord,
};
