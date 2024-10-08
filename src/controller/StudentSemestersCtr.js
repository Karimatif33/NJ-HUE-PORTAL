const { pool, connect } = require("../db/dbConnect");
const AsyncHandler = require("express-async-handler");
const fetch = require("node-fetch").default;
const { createSchemaAndTable, updateRecord } = require("../model/StudentSemestersSchema");
require("dotenv").config();
exports.fetshingStudentSemesters = AsyncHandler(async (req, res) => {
  const courseId = req.params.courseId;
  const apiUrl = `${process.env.HORUS_API_DOMAIN}/WSNJ/HUESemesters?index=StudentSemesters&course_id=${courseId}`;

  try {
    // Call the function to create schema and table before fetching data
    await createSchemaAndTable();
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data from API. Status: ${response.status}`
      );
    }
    const apiData = await response.json();

    const students = apiData.students;

    // Connect to the database
    const client = await connect();
    const SchemaAndTable = "StudentSemesters.students";

    try {
      for (const item of students) {
        const IDValue = item.ID;
        const StudentIDValue = item.StudentID;
        const CourseIDValue = item.CourseID;
        const AcadYearValue = item.AcadYear;
        const SemesterValue = item.Semester;
        const SemesterHRValue = item.SemesterHR;
        const SemesterGPAValue = item.SemesterGPA;
        const CurrentGPAValue =
          typeof item.CurrentGPA === "number"
            ? Number(item.CurrentGPA.toFixed(2))
            : null;
        const final_gradeValue = item.final_grade;
        const blockedValue = item.blocked;

        // console.log(nameValue, IDValue);

        // Insert data into the database (replace 'Levels' with your actual table name)
        const insertQuery = `
          INSERT INTO ${SchemaAndTable} (ID, StudentID, CourseID, AcadYear, Semester, SemesterHR, SemesterGPA, CurrentGPA, FinalGrade, Blocked) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (ID) DO UPDATE
          SET 
          StudentID = $2,
          CourseID = $3,
          AcadYear = $4,
          Semester = $5,
          SemesterHR = $6,
          SemesterGPA = $7,
          CurrentGPA = $8,
          FinalGrade = $9,
          Blocked = $10;
      `;

        await client.query(insertQuery, [
          IDValue,
          StudentIDValue,
          CourseIDValue,
          AcadYearValue,
          SemesterValue,
          SemesterHRValue,
          SemesterGPAValue,
          CurrentGPAValue,
          final_gradeValue,
          blockedValue,
        ]);
        console.log("Data inserted into the database successfully");
        const updatedBy = req.session.user.userId; // Get the user from the session
        await updateRecord(IDValue, updatedBy);
      }

      // Select all data from the 'levels' table
      const selectQuery = "SELECT * FROM StudentSemesters.students";
      const result = await client.query(selectQuery);

      // Return the retrieved data as JSON
      res.json(result.rows);
      // client.release();
      return { status: "success" };
    } catch (error) {
      console.error(`Error fetching data from ${apiUrl}:`, error.message);
      return { status: "fail", error: `Error fetching data from ${apiUrl}` };
    }
  } finally {
    if (client) {
      client.release();
      console.log("fetshingStudentSemesters Client released");
    }
  
  }

  //       catch (error) {
  //     console.error("Error fetching data:", error.message);

  //     // Handle or respond to the error appropriately
  //     // If there is an error fetching from the API, return data from the database
  //     const selectQuery = "SELECT * FROM StudentSemesters.students";
  //     const result = await pool.query(selectQuery);
  //     res.json(result.rows);
  //     console.log("getting data from DB");
  //   }
});
