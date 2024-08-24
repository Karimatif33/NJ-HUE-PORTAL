// dbUtils.js
const { pool } = require("../db/dbConnect");

const schemaName = "ExamTimetable";
const TableName = "exams_data";

const createSchemaQuery = `CREATE SCHEMA IF NOT EXISTS ${schemaName};`;

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${schemaName}.${TableName} (
      Stu_ID INTEGER,
        ID SERIAL PRIMARY KEY,
        Exam INTEGER,
        Day VARCHAR(255),
        Date VARCHAR(255),
        Type VARCHAR(255),
        Subject VARCHAR(255),
        Place VARCHAR(255),
        "from" VARCHAR,
        "to" VARCHAR,
        SeatNo VARCHAR(255),
        CONSTRAINT fk_stuednt FOREIGN KEY (Stu_ID) REFERENCES UserData.users(id)
    );
`;

const createSchemaAndTable = async () => {
  let client;

  try {
    client = await pool.connect();
    console.log("DB Connected Successfully");

    await client.query(createSchemaQuery);
    await client.query(createTableQuery);

    console.log(
      `Check Schema '${schemaName}' and table ${TableName} successfully`
    );
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  pool,
  createSchemaAndTable,
};
