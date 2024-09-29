const { connect } = require("../db/dbConnect");
const AsyncHandler = require("express-async-handler");

exports.PostQust = AsyncHandler(async (req, res) => {
  const client = await connect();
  const query = `
    SELECT av.selectedacadyearvalue, av.selectedacadyearName, ot.selectedSemesterValue, ot.selectedSemesterrName
    FROM Acad_year.Acad_year_Value AS av
    INNER JOIN Cur_Semester.Semester AS ot ON av.id = ot.id;
  `;

  const result = await client.query(query);
  const selectedacadyearvalue = result.rows[0]?.selectedacadyearvalue;
  const selectedsemestervalue = result.rows[0]?.selectedsemestervalue;

  const { selectedOptions, comments, type, subjectId, instructorId, userDB, userCode, courseid } = req.body;
  const newInstructorId = instructorId ?? 0;

  console.log("Selected Options:", selectedOptions);
  console.log("Comments:", comments);
  console.log("Type:", type);
  console.log("Subject ID:", subjectId);
  console.log("Instructor ID:", newInstructorId);
  console.log("User DB:", userDB);
  console.log("User Code:", userCode);
  console.log("Semester ID:", selectedsemestervalue);
  console.log("Academic Year ID:", selectedacadyearvalue);
  console.log("Course ID:", courseid);

  try {
    for (const option of selectedOptions) {
      const qusId = option.qusId;
      let columnToUpdate;

      console.log(`Question ID: ${qusId}`);

      // Determine which column to update based on the selected option id
      switch (option.id) {
        case 1:
          columnToUpdate = 'option1_count';
          break;
        case 2:
          columnToUpdate = 'option2_count';
          break;
        case 3:
          columnToUpdate = 'option3_count';
          break;
        default:
          console.error(`Invalid option selected for question ID ${qusId}`);
          continue; // Skip this iteration if option is invalid
      }

      // Perform an upsert using ON CONFLICT for the answers.questions table
      await client.query(
        `INSERT INTO answers.questions (question_id, ${columnToUpdate}, courseid, semester, academic_year, subject_id, instructor_id)
         VALUES ($1, 1, $2, $3, $4, $5, $6)
         ON CONFLICT (question_id, courseid, semester, academic_year, subject_id, instructor_id) 
         DO UPDATE SET ${columnToUpdate} = answers.questions.${columnToUpdate} + 1`,
        [qusId, courseid, selectedsemestervalue, selectedacadyearvalue, subjectId, newInstructorId]
      );
    }

    // Mark the subject or instructor as answered
    if (type === 'course') {
      await client.query(
        `INSERT INTO answers.subjects (subject_id, student_id, courseid, semester, academic_year, answered) 
         VALUES ($1, $2, $3, $4, $5, TRUE)
         ON CONFLICT (subject_id, student_id, courseid, semester, academic_year) 
         DO UPDATE SET answered = TRUE;`,
        [subjectId, userDB, courseid, selectedsemestervalue, selectedacadyearvalue]
      );
    }

    if (type === 'instructors') {
      await client.query(
        `INSERT INTO answers.instructors (subject_id, student_id, instructor_id, courseid, semester, academic_year, answered) 
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)
         ON CONFLICT (subject_id, student_id, instructor_id, courseid, semester, academic_year) 
         DO UPDATE SET answered = TRUE;`,
        [subjectId, userDB, newInstructorId, courseid, selectedsemestervalue, selectedacadyearvalue]
      );
    }

    res.status(200).send({ message: 'Questionnaire submitted successfully' });
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    res.status(500).send({ message: 'Error submitting questionnaire' });
  } finally {
    client.release(); // Ensure the client is released only once
  }
});
