const { pool, connect } = require("../db/dbConnect");
const AsyncHandler = require("express-async-handler");
const fetch = require("node-fetch").default;
const { createSchemaAndTable } = require("../model/QuestionsDataSchema");
require("dotenv").config();

exports.fetshingQuestionsData = AsyncHandler(async (req, res) => {
  const apiUrl = `${process.env.HORUS_API_DOMAIN}/WSNJ/HUEQuestions?index=QuestionsData`;

  let client;

  try {
    // Call the function to create schema and table before fetching data
    await createSchemaAndTable();

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from API. Status: ${response.status}`);
    }

    const apiData = await response.json();
    const questions_data = apiData.questions_data;

    if (!questions_data || questions_data.length === 0) {
      return res.status(404).json({ error: "No questions data found." });
    }

    // Connect to the database
    client = await connect();
    const SchemaAndTable = "questionnaire.ques_data";

    for (const item of questions_data) {
      const IDValue = item.id;
      const question_typeValue = item.question_type;
      const descriptionValue = item.description;

      // Insert or update data in the database
      const insertQuery = `
        INSERT INTO ${SchemaAndTable} (ID, question_type, description) 
        VALUES ($1, $2, $3)
        ON CONFLICT (ID) DO UPDATE
        SET 
            question_type = $2,
            description = $3;
      `;

      await client.query(insertQuery, [IDValue, question_typeValue, descriptionValue]);
    }

    console.log("Data inserted into the database successfully");

    // Retrieve and return all data from the 'ques_data' table
    const selectQuery = `SELECT * FROM ${SchemaAndTable}`;
    const result = await client.query(selectQuery);
    res.json(result.rows);

  } catch (error) {
    console.error(`Error during operation: ${error.message}`);
    res.status(500).json({ error: `Failed to fetch and store questions data: ${error.message}` });
  } finally {
    // Ensure the client is always released
    if (client) client.release();
  }
});
