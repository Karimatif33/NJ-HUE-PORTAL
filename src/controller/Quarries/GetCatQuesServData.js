const { connect } = require("../../db/dbConnect");

// Example method to handle HTTPS request
exports.GetCatQuesServData = async (req, res) => {
  const schemaAndTable = "questionnaire.ques_services_data";

  let client;
  try {
    client = await connect();
    const selectQuery = `
      SELECT * 
      FROM ${schemaAndTable};
    `;

    const result = await client.query(selectQuery);

    res.json(result.rows); // Send the fetched data as JSON
  } catch (error) {
    console.error("Error selecting data:", error);
    res.status(500).json({ message: "Error retrieving service data" }); // Send an error response to the client
  } finally {
    if (client) client.release(); // Ensure the client is released even if an error occurs
    console.log("GetCatQuesServData client release")
  }
};
