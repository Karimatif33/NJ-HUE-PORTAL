const { connect } = require("../db/dbConnect");
const AsyncHandler = require("express-async-handler");
const { createSchemaAndTable, updateRecord } = require("../model/UpdateStudentSchema");

exports.UpdateStudentCtr = AsyncHandler(async (req, res) => {
  const client = await connect();
  const { selectedCurrentValue } = req.body;
  const id = 1; // Example ID
  const updatedBy = req.session.user?.userId || 'unknown'; // Use userId from session or default to 'unknown'

  try {
    await createSchemaAndTable(); // Ensure the schema and table are created

    const SchemaAndTable = "UpdateStudent.Check"; // Adjust schema and table name as needed

    const insertQuery = `
        INSERT INTO ${SchemaAndTable} (ID, Active, last_updated_by, last_updated_on) 
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '3 hours')
        ON CONFLICT (ID) DO UPDATE
        SET 
          Active = $2,
          last_updated_by = $3,
          last_updated_on = CURRENT_TIMESTAMP + INTERVAL '3 hours'
      `;

    await client.query(insertQuery, [id, selectedCurrentValue, updatedBy]);

    console.log("Data inserted or updated successfully");
    res.json({
      message: "POST request received and data inserted or updated successfully",
    });
  } catch (error) {
    console.error("Error inserting or updating data", error);
    res.status(500).json({
      error: "Error inserting or updating data into database",
      details: error.message,
    });
  } finally {
    // Ensure the client is released to the pool
    if (client) {
      client.release();
      console.log("UpdateStudentCtr Client released.");
    }
  }
});
