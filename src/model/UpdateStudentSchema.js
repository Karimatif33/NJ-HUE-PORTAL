const { pool } = require("../db/dbConnect");

const schemaName = "UpdateStudent";
const tableName = "Check";

const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schemaName};`;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ${schemaName}.${tableName} (
    ID SERIAL PRIMARY KEY,
    Active BOOLEAN NOT NULL,
    last_updated_by VARCHAR(255), -- or INTEGER, depending on your user ID type
    last_updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '3 hours'
  );
`;

const createSchemaAndTable = async () => {
  let client; // Declare client outside of try block to ensure it's in scope in finally
  try {
    client = await pool.connect();
    console.log("DB Connected Successfully");

    // Create the schema
    await client.query(createSchemaQuery);

    // Create the table within the schema
    await client.query(createTableQuery);

    console.log(
      `Schema '${schemaName}' and table '${tableName}' created successfully`
    );
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    // Ensure the client is released
    if (client) {
      client.release();
      console.log("Client released after schema and table creation.");
    }
  }
};

// Function to update a record with last updated information
const updateRecord = async (id, active, updatedBy) => {
  let client; // Declare client outside of try block to ensure it's in scope in finally
  const updateQuery = `
    UPDATE ${schemaName}.${tableName}
    SET 
      Active = $1,
      last_updated_by = $2,
      last_updated_on = CURRENT_TIMESTAMP + INTERVAL '3 hours'
    WHERE ID = $3;
  `;

  try {
    client = await pool.connect(); // Get a client from the pool
    await client.query(updateQuery, [active, updatedBy, id]);
    console.log('Record updated successfully.');
  } catch (err) {
    console.error('Error updating record:', err.message);
  } finally {
    // Ensure the client is released
    if (client) {
      client.release();
      console.log("Client released after record update.");
    }
  }
};

module.exports = {
  pool,
  createSchemaAndTable,
  updateRecord,
};
