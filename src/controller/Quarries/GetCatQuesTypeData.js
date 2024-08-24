
const { pool, connect } = require("../../db/dbConnect");

// Example method to handle HTTPS request
exports.GetCatQuesTypeData = async (req, res) => {
    const SchemaAndTable = "questionnaire.ques_type_data";
  
try {
    const Client = await connect();
    const selectQuery = `
      SELECT * 
      FROM ${SchemaAndTable};
    `;
  
    const result = await Client.query(selectQuery);
  
    const data = result.rows;

    res.json(result.rows);
    // console.log('Selected data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error selecting data:', error);
  }
};
