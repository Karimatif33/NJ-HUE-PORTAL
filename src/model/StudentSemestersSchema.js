const { pool } = require("../db/dbConnect");

const schemaName = "StudentSemesters";
const tableName = "students";

const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schemaName};`;

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ${schemaName}.${tableName} (
    ID INTEGER PRIMARY KEY,
    StudentID INTEGER,
    CourseID INTEGER,
    AcadYear INTEGER,
    Semester INTEGER,
    SemesterGPA FLOAT,
    SemesterHR FLOAT,
    CurrentGPA FLOAT,
    FinalGrade VARCHAR(255),
    Blocked BOOLEAN NOT NULL,
    last_updated_by VARCHAR(255), -- or INTEGER, depending on your user ID type
    last_updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '3 hours',
    CONSTRAINT fk_course FOREIGN KEY (CourseID) REFERENCES CourseData.courses(id),
    CONSTRAINT fk_acad_year FOREIGN KEY (AcadYear) REFERENCES AcadYearData.acadyeardata(id),
    CONSTRAINT fk_semester FOREIGN KEY (Semester) REFERENCES SemesterData.semesterdata(id)
  );
`;

const createSchemaAndTable = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log("DB Connected Successfully");

    // Create the schema
    await client.query(createSchemaQuery);

    // Create the table within the schema
    await client.query(createTableQuery);

    console.log(`Schema '${schemaName}' and table '${tableName}' created successfully.`);
  } catch (err) {
    console.error("Error creating schema and table:", err.message);
  } finally {
    // Ensure the client is released
    if (client) {
      client.release();
    }
  }
};

// Update record function
const updateRecord = async (id, updatedBy) => {
  const updateQuery = `
    UPDATE ${schemaName}.${tableName}
    SET 
      last_updated_by = $1,
      last_updated_on = CURRENT_TIMESTAMP + INTERVAL '3 hours'
    WHERE ID = $2;
  `;

  let client;
  try {
    client = await pool.connect();
    await client.query(updateQuery, [updatedBy, id]);
    console.log('Record updated successfully.');
  } catch (err) {
    console.error('Error updating record:', err.message);
  } finally {
    // Ensure the client is released
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  pool,
  createSchemaAndTable,
  updateRecord,
};
