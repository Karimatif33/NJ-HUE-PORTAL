const { pool } = require("../db/dbConnect");

const schemaName = "Acad_year";
const tableName = "BlockTime";

// SQL Queries
const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schemaName};`;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ${schemaName}.${tableName} (
    ID SERIAL PRIMARY KEY,
    selectedAcadYearValue INTEGER,
    selectedAcadYearName VARCHAR,
    last_updated_by VARCHAR(255), -- or INTEGER, depending on your user ID type
    last_updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '3 hours'
  );
`;

// Function to create schema and table
const createSchemaAndTable = async () => {
  const client = await pool.connect(); // Get a client from the pool
  try {
    console.log("Connected to the database");

    // Create the schema
    await client.query(createSchemaQuery);

    // Create the table within the schema
    await client.query(createTableQuery);

    console.log(`Schema '${schemaName}' and table '${tableName}' created successfully`);
  } catch (err) {
    console.error("Error creating schema and table:", err.message);
  } finally {
    // Ensure the client is released
    client.release();
  }
};

// Function to update a record with last updated information
const updateRecord = async (id, acadYearValue, acadYearName, updatedBy) => {
  const updateQuery = `
    UPDATE ${schemaName}.${tableName}
    SET 
      selectedAcadYearValue = $1,
      selectedAcadYearName = $2,
      last_updated_by = $3,
      last_updated_on = CURRENT_TIMESTAMP + INTERVAL '3 hours'
    WHERE ID = $4;
  `;

  const client = await pool.connect(); // Get a client from the pool
  try {
    await client.query(updateQuery, [acadYearValue, acadYearName, updatedBy, id]);
    console.log('Record updated successfully.');
  } catch (err) {
    console.error('Error updating record:', err.message);
  } finally {
    // Ensure the client is released
    client.release();
  }
};

module.exports = {
  createSchemaAndTable,
  updateRecord,
};
