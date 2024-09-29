const { pool } = require("../../db/dbConnect");

async function fetchDataByIdFromDB(code) {
  const query = `
    SELECT 
      answers.instructors.student_id, 
      answers.instructors.subject_id,
      answers.instructors.instructor_id,
      answers.instructors.courseid AS courseid,
      answers.instructors.academic_year,
      answers.instructors.semester, 
      answers.instructors.answered
    FROM answers.instructors
    WHERE answers.instructors.student_id = $1;
  `;

  let client;
  try {
    client = await pool.connect();

    // Validate and parse the code parameter
    if (code === null || isNaN(code)) {
      code = 0; // Default value if code is invalid
    } else {
      code = parseInt(code, 10);
      console.log("Fetching data for id:", code); // Replace with a logger if preferred
    }

    const result = await client.query(query, [code]);

    // Initialize an array to store subjects and their instructors
    const subjectsArray = [];

    // Populate the subjects array with query results
    result.rows.forEach((row) => {
      const { student_id, subject_id, instructor_id, courseid, academic_year, semester, answered } = row;
      
      subjectsArray.push({
        studentid: student_id,
        subjectid: subject_id,
        instructorid: instructor_id,
        answered: answered,
        // Uncomment these if needed
        // academicyearid: academic_year,
        // semesterid: semester,
        // courseid: courseid,
      });
    });

    return subjectsArray;
  } catch (error) {
    console.error("Error fetching data:", error.message); // Replace with a logger if preferred
    return [];
  } finally {
    if (client) {
      try {
        client.release();
        console.log("CheckInstractorsExs Client released"); // Replace with a logger if preferred
      } catch (releaseError) {
        console.error("Error releasing client:", releaseError.message); // Replace with a logger if preferred
      }
    }
  }
}

module.exports = { fetchDataByIdFromDB };
