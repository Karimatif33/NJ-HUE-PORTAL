const { pool } = require("../db/dbConnect");
const AsyncHandler = require("express-async-handler");
const fetch = require("node-fetch").default;
const { createSchemaAndTable, updateRecord } = require("../model/LevelsSchema");
require("dotenv").config();

exports.fetshingLevels = AsyncHandler(async (req, res) => {
  const apiUrl = `${process.env.HORUS_API_DOMAIN}/WSNJ/HUELevels?index=LevelsData`;

  let client;
  try {
    // Call the function to create schema and table before fetching data
    await createSchemaAndTable();

    // Fetch data from the API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch data from API. Status: ${response.status}`);
    }

    const apiData = await response.json();
    const leveldata = apiData.leveldata;

    // Connect to the database
    client = await pool.connect();
    const SchemaAndTable = "levels.levels";

    try {
      for (const item of leveldata) {
        const IDValue = item.ID;
        const nameValue = item.Name;

        // Insert or update data into the database
        const insertQuery = `
          INSERT INTO ${SchemaAndTable} (ID, Name) 
          VALUES ($1, $2)
          ON CONFLICT (ID) DO UPDATE
          SET Name = $2;
        `;

        await client.query(insertQuery, [IDValue, nameValue]);
        console.log("Data inserted into the database successfully");

        // Update record with user information
        const updatedBy = 'Admin Test'        ; // Get the user from the session
        await updateRecord(IDValue, nameValue, updatedBy);
      }

      // Select all data from the 'levels' table
      const selectQuery = "SELECT * FROM Levels.levels";
      const result = await client.query(selectQuery);

      // Return the retrieved data as JSON
      res.json(result.rows);
    } catch (error) {
      console.error(`Error processing data:`, error.message);
      res.status(500).json({ error: `Error processing data` });
    } finally {
      if (client) {
        client.release();
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Error connecting to the database" });
  }
});
