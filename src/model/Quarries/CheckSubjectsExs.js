const { pool } = require("../../db/dbConnect");

async function fetchDataByIdFromDB(code) {
  const query = `
    SELECT 
      answers.subjects.student_id, 
      answers.subjects.subject_id,
      answers.subjects.courseid AS courseid,
      answers.subjects.academic_year,
      answers.subjects.semester, 
      answers.subjects.answered
    FROM answers.subjects
    WHERE answers.subjects.student_id = $1;
  `;

  let client;
  try {
    client = await pool.connect();
    
    // Validate the `code` parameter
    if (!code || isNaN(code)) {
      code = 0; // Default value if code is invalid
    } else {
      code = parseInt(code, 10);
      // Replace with a logger in production
      console.log("Fetching data for id:", code);
    }

    const result = await client.query(query, [code]);

    // Initialize a map to store subjects and their details
    const subjectsMap = new Map();
    
    // Iterate through the query result to populate the subjects map
    result.rows.forEach((row) => {
      const { student_id, subject_id, courseid, academic_year, semester, answered } = row;
      
      if (!subjectsMap.has(subject_id)) {
        subjectsMap.set(subject_id, {
          studentid: student_id,
          subjectid: subject_id,
          academicyearid: academic_year,
          semesterid: semester,
          courseid: courseid,
          answered: answered,
        });
      }
      
      // Additional data handling if necessary
    });

    // Convert subjects map to an array of objects
    const subjectsData = Array.from(subjectsMap.values());

    return subjectsData;
  } catch (error) {
    // Replace with a logger in production
    console.error("Error fetching data:", error.message);
    return [];
  } finally {
    if (client) {
      try {
        client.release();
        // Replace with a logger in production
        console.log("CheckSubjectsExs Client released");
      } catch (releaseError) {
        // Replace with a logger in production
        console.error("Error releasing client:", releaseError.message);
      }
    }
  }
}

module.exports = { fetchDataByIdFromDB };
