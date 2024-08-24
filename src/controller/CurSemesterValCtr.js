const { connect } = require("../db/dbConnect");
const AsyncHandler = require("express-async-handler");
const { createSchemaAndTable } = require("../model/CurSemesterValSchema");

exports.CurSemesterValCtr = AsyncHandler(async (req, res) => {
  const client = await connect();
  const { selectedSemesterValue, selectedSemesterrName } = req.body;
  const id = 1; // Assuming ID is always 1; adjust logic if needed
  const updatedBy = req.session.user?.userId || 'unknown'; // Use userId from session

  try {
    await createSchemaAndTable();
    const SchemaAndTable = "Cur_Semester.Semester"; // Adjust schema name as needed

    const insertQuery = `
        INSERT INTO ${SchemaAndTable} (ID, selectedSemesterValue, selectedSemesterrName, last_updated_by, last_updated_on) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '3 hours')
        ON CONFLICT (ID) DO UPDATE
        SET 
          selectedSemesterValue = $2,
          selectedSemesterrName = $3,
          last_updated_by = $4,
          last_updated_on = CURRENT_TIMESTAMP + INTERVAL '3 hours';
      `;

    await client.query(insertQuery, [id, selectedSemesterValue, selectedSemesterrName, updatedBy]);

    console.log("Data inserted or updated successfully");
    res.json({
      message: "POST request received and data inserted or updated successfully",
    });
  } catch (error) {
    console.error("Error inserting or updating data", error);
    res.status(500).json({
      error: "Error inserting or updating data in the database",
      details: error.message,
    });
  } finally {
    // Remember to release the client to the pool after use
    client.release();
  }
});
