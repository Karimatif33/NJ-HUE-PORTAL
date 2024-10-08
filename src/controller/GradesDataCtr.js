const { pool, connect } = require("../db/dbConnect");
const AsyncHandler = require("express-async-handler");
const fetch = require("node-fetch").default;
const { createSchemaAndTable } = require("../model/GradesDataSchema");
require("dotenv").config();
exports.fetshingGradesData = AsyncHandler(async (req, res) => {
  const apiUrl = `${process.env.HORUS_API_DOMAIN}/WSNJ/HUEGrades?index=GradesData`;

  try {
    // Call the function to create schema and table before fetching data
    await createSchemaAndTable();
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from API. Status: ${response.status}`
      );
    }
    const apiData = await response.json();
    // console.log(apiData)
    const gradesdata = apiData.gradesdata;
    // Connect to the database
    const client = await connect();
    const SchemaAndTable = "GradesData.gradesdata";

    try {
      for (const item of gradesdata) {
        const IDValue = item.ID;
        const nameValue = item.Name;
        const ActiveValue = item.Active;

        // Insert data into the database (replace 'Levels' with your actual table name)
        const insertQuery = `
        INSERT INTO ${SchemaAndTable} (ID, Name, Active) 
        VALUES ($1, $2, $3)
        ON CONFLICT (ID) DO UPDATE
        SET 
            Name = $2,
            Active = $3
      `;

        await client.query(insertQuery, [IDValue, nameValue, ActiveValue]);
        console.log("Data inserted into the database successfully");
      }

      // Select all data from the 'levels' table
      const selectQuery = "SELECT * FROM GradesData.gradesdata";
      const result = await client.query(selectQuery);

      // Return the retrieved data as JSON
      res.json(result.rows);
      // client.release();
      return { status: "success" };
    } catch (error) {
      console.error(`Error fetching data from ${apiUrl}:`, error.message);
      return { status: "fail", error: `Error fetching data from ${apiUrl}` };
    }
  } finally {
    if (client) {
      client.release();
      console.log("fetshingGradesData Client released");
    }  }
});
