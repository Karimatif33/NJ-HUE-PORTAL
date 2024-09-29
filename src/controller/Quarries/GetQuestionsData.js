const { connect } = require("../../db/dbConnect");

// Example method to handle HTTPS request
exports.GetQuestionsData = async (req, res) => {
  const schemaAndTable = "questionnaire.ques_data";
  let client; // Declare client in the outer scope for proper scoping

  try {
    client = await connect(); // Connect to the database
    const selectQuery = `
      SELECT * 
      FROM ${schemaAndTable};
    `;

    const result = await client.query(selectQuery); // Execute the query
    const data = result.rows; // Extract rows from the result

    res.json(data); // Send the fetched data as JSON
  } catch (error) {
    // Log the error (consider using a logging library in production)
    console.error("Error selecting data:", error.message);
    res.status(500).json({ message: "Error retrieving questions data" }); // Send an error response to the client
  } finally {
    if (client) {
      try {
        client.release(); // Release the client back to the pool
        // Log the release (consider using a logging library in production)
        console.log("GetQuestionsData client released");
      } catch (releaseError) {
        // Log any error that occurs during the release process
        console.error("Error releasing client:", releaseError.message);
      }
    }
  }
};
