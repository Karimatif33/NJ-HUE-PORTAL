const { pool } = require("../../db/dbConnect");

async function fetchDataByIdFromDB(code) {
  const query = `
    SELECT 
      questionnaire.qus_stu.subject, 
      questionnaire.qus_stu.faculty,
      UserData.users.courseid AS courseid,
      questionnaire.qus_stu.academicyear,
      questionnaire.qus_stu.semester, 
      coursesubjects.subjects.name AS SubName,
      staffdata.staff.name AS StaffName
    FROM questionnaire.qus_stu
    LEFT JOIN UserData.users ON questionnaire.qus_stu.student = UserData.users.id
    LEFT JOIN coursesubjects.subjects ON questionnaire.qus_stu.subject = coursesubjects.subjects.id
    LEFT JOIN staffdata.staff ON questionnaire.qus_stu.faculty = staffdata.staff.id
    WHERE questionnaire.qus_stu.student = $1;
  `;

  let client;
  try {
    client = await pool.connect();
    
    // Validate and parse the `code` parameter
    if (code === null || isNaN(code)) {
      code = 0; // Default value if code is invalid
    } else {
      code = parseInt(code, 10);
      console.log("Fetching data for id:", code); // Replace with a logger if preferred
    }

    const result = await client.query(query, [code]);

    // Initialize a map to store subjects and their details
    const subjectsMap = new Map();
    
    // Iterate through the query result to populate the subjects map
    result.rows.forEach((row) => {
      const subjectId = row.subject;
      const subjectName = row.subname;
      const staffName = row.staffname;
      const faculty = row.faculty;
      const courseid = row.courseid;

      if (!subjectsMap.has(subjectId)) {
        subjectsMap.set(subjectId, {
          subjectid: subjectId,
          academicyearid: row.academicyear,
          semesterid: row.semester,
          courseid: courseid,
          subjectName: subjectName,
          faculty: faculty,
          instructors: [],
        });
      }

      subjectsMap.get(subjectId).instructors.push({ Name: staffName, Id: faculty });
    });

    // Convert subjects map to array of objects
    const subjectsData = Array.from(subjectsMap.values());

    return subjectsData;
  } catch (error) {
    console.error("Error fetching data:", error.message); // Replace with a logger if preferred
    return [];
  } finally {
    // Ensure the client is released even if an error occurs
    if (client) 
      client.release();
    console.log("Qus-Stu Client released"); // Replace with a logger if preferred
  }
}

module.exports = { fetchDataByIdFromDB };
