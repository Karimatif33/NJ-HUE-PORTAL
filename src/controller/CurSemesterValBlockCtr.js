const { pool } = require("../db/dbConnect");
const AsyncHandler = require("express-async-handler");
const { createSchemaAndTable } = require("../model/CurSemesterValBlockTimeSchema");

// Initialize schema and table at startup or through a dedicated initialization script
// await createSchemaAndTable(); 

exports.CurSemesterValBlockCtr = AsyncHandler(async (req, res) => {
  const client = await pool.connect(); // Use the pool directly
  const { selectedSemesterValue, selectedSemesterName } = req.body;
  const id = 1;
  const updatedBy = req.session.user?.userId || 'unknown'; // Use userId from session

  try {
    const SchemaAndTable = "Cur_Semester.BlockTime"; // Ensure this is accurate

    const insertQuery = `
        INSERT INTO ${SchemaAndTable} (ID, selectedSemesterValue, selectedSemesterName, last_updated_by, last_updated_on) 
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '3 hours')
        ON CONFLICT (ID) DO UPDATE
        SET 
          selectedSemesterValue = $2,
          selectedSemesterName = $3,
          last_updated_by = $4,
          last_updated_on = CURRENT_TIMESTAMP + INTERVAL '3 hours';
      `;

    await client.query(insertQuery, [id, selectedSemesterValue, selectedSemesterName, updatedBy]);

    console.log("Data inserted successfully");
    res.json({
      message: "POST request received and data inserted successfully",
    });
  } catch (error) {
    console.error("Error inserting data", error);
    res.status(500).json({
      error: "Error inserting data into database",
      details: error.message,
    });
  } finally {
    client.release(); // Ensure client is released
  }
});
