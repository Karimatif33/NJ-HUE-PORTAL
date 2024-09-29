import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import Spinner from "../components/Spinner";

const CoursesQuestionnaire = () => {
  const { DBUser, user, devAutFill } = useStateContext();
  const navigate = useNavigate();
  const initialFetchDone = useRef(false);

  const [view, setView] = useState("course"); // 'course' or 'instructors'
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [instructors, setInstructors] = useState([]);
  const [activeInstructorIndex, setActiveInstructorIndex] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedOptionsInstructor, setSelectedOptionsInstructor] = useState({});
  const [comments, setComments] = useState({});
  const [commentsInstructor, setCommentsInstructor] = useState({});
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [answeredInstructorsData, setAnsweredInstructorsData] = useState([]);
  const [answeredSubjectData, setAnsweredSubjectData] = useState([]);
  const [fetchTrigger, setFetchTrigger] = useState(false);
  const [isAllInstructorsAnswered, setIsAllInstructorsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allInstructorsAnswered, setAllInstructorsAnswered] = useState(false);
  const [mappedSubjects, setMappedSubjects] = useState([]);
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(null);
  const [courseButtonDisabled, setCourseButtonDisabled] = useState(false);
  const [showMessage, setShowMessage] = useState(false); // New state for showing message
  const [answeredSubjects, setAnsweredSubjects] = useState({});

  // Fetches instructor data and updates state based on DBUser and fetchTrigger changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://knj.horus.edu.eg/api/hue/portal/v1/Qus-CheckInstractorsExs/${DBUser}`
        );
        // console.log('Fetched data:', response.data);
        setAnsweredInstructorsData(response.data);

        // Find the first unanswered instructor
        const firstUnansweredIndex = response.data.findIndex(
          (instructor) => !instructor.answered
        );
        if (firstUnansweredIndex !== -1) {
          setActiveInstructorIndex(firstUnansweredIndex);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // console.log('Fetch trigger changed:', fetchTrigger);
  }, [DBUser, fetchTrigger]);



// Fetches subject data based on DBUser and fetchTrigger changes
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://knj.horus.edu.eg/api/hue/portal/v1/Qus-CheckSubjectsExs/${DBUser}`
      );
      console.log("Fetched data CheckSubjectsExs:", response.data);
      setAnsweredSubjectData(response.data);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
  console.log("Fetch trigger changed:", fetchTrigger);
}, [DBUser, fetchTrigger]);

// Function to check if a subject and all its instructors are fully answered
const checkIfAllAnswered = (subjectId, subjectInstructors) => {
  const isSubjectAnswered = checkIfSubjectAnswered(subjectId);
  const areAllInstructorsAnswered = subjectInstructors.every((instructor) => instructor.answered);

  return isSubjectAnswered && areAllInstructorsAnswered;
};

// useEffect to check all subjects and their instructors after fetching data
useEffect(() => {
  if (subjects.length > 0 && instructors.length > 0 && answeredSubjectData.length > 0) {
    const updatedAnsweredSubjects = {};

    subjects.forEach((subject) => {
      const subjectInstructors = instructors.filter(
        (instructor) => instructor.subjectId === subject.subjectid
      );
      
      // Check if both subject and instructors are answered
      updatedAnsweredSubjects[subject.subjectid] = checkIfAllAnswered(subject.subjectid, subjectInstructors);
    });

    setAnsweredSubjects(updatedAnsweredSubjects);
    console.log("Updated answered subjects:", updatedAnsweredSubjects);
  }
}, [subjects, instructors, answeredSubjectData]);

// useEffect to check the currently selected subject and its instructors
useEffect(() => {
  if (selectedSubject && instructors.length > 0) {
    const subjectInstructors = instructors.filter(
      (instructor) => instructor.subjectId === selectedSubject.subjectid
    );

    const isAllAnswered = checkIfAllAnswered(selectedSubject.subjectid, subjectInstructors);
    setCourseButtonDisabled(isAllAnswered);
    console.log(`Is the course button disabled for subject ${selectedSubject.subjectid}:`, isAllAnswered);
  }
}, [selectedSubject, instructors, answeredSubjectData, answeredInstructorsData]);


  // Fetches subjects data based on DBUser and fetchTrigger changes
  useEffect(() => {
    axios
      .get(`https://knj.horus.edu.eg/api/hue/portal/v1/Qus-Stu/${DBUser}`)
      .then((response) => setSubjects(response.data))
      .catch((error) => console.error("Error fetching subjects:", error));
    // console.log('Fetch trigger changed:', fetchTrigger);
  }, [DBUser, fetchTrigger]);



  // Fetches and groups categories and questions data based on the 'view' state
  useEffect(() => {
    axios
      .get(`https://knj.horus.edu.eg/api/hue/portal/v1/GetCatQuesServData`)
      .then((categoryResponse) => {
        axios
          .get(`https://knj.horus.edu.eg/api/hue/portal/v1/GetQuestionsData`)
          .then((questionsResponse) => {
            const categories = categoryResponse.data;
            const questions = questionsResponse.data;

            const grouped = categories.reduce((acc, category) => {
              if (
                (view === "course" && category.type === "subject") ||
                (view === "instructors" &&
                  (category.type === "assistant" || category.type === "doctor"))
              ) {
                acc[category.id] = {
                  name: category.name,
                  type: category.type,
                  questions: [],
                };
              }
              return acc;
            }, {});

            questions.forEach((question) => {
              if (grouped[question.question_type]) {
                grouped[question.question_type].questions.push({
                  ...question,
                  options: [
                    { id: 1, text: "أوافق" },
                    { id: 2, text: "إلى حد ما" },
                    { id: 3, text: "لا أوافق" },
                  ],
                });
              }
            });

            setGroupedQuestions(grouped);
          })
          .catch((error) => console.error("Error fetching questions:", error));
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, [view]);



  // Redirects to the dashboard if DBUser is null
  useEffect(() => {
    if (DBUser === null) {
      navigate("/dashboard");
    }
  }, [DBUser, navigate]);


  // Checks if a subject has been answered based on the subject ID
  const checkIfSubjectAnswered = (subjectId) => {
    return answeredSubjectData.some(
      (answered) => answered.subjectid === subjectId
    );
  };


  // Function to check if all instructors in a subject are answered
  const checkIfInstructorAnswered = (subjectId, instructorId) => {
    return answeredInstructorsData.some(
      (instructor) =>
        instructor.subjectid === subjectId &&
        instructor.instructorid === instructorId
    );
  };
  // console.log(activeInstructorIndex)




  // Fetches and maps subjects, then updates state with the mapped subjects and active subject index
  const fetchSubjects = () => {
    if (subjects.length === 0) {
      console.warn("No subjects found");
      return;
    }
    // Map the subjects array to a new array with additional 'answered' information
    const mappedSubjects = subjects.map((subject) => ({
      id: subject.subjectid,
      name: subject.name,
      answered: checkIfSubjectAnswered(subject.subjectid),
    }));

    setMappedSubjects(mappedSubjects);

    // Set the first subject as active, if available
    const firstSubject = mappedSubjects[0];
    if (firstSubject) {
      setActiveSubjectIndex(firstSubject.id);
    } else {
      console.warn("No subjects found");
      setActiveSubjectIndex(null);
    }
    console.log(mappedSubjects, "mappedSubjects");
  };



  // Fetches and maps instructors for a given subject, then updates state with the mapped instructors and active instructor index
  const fetchInstructors = (subjectId) => {
    // Find the subject with the given subjectId
    const subject = subjects.find((subject) => subject.subjectid === subjectId);
    if (subject) {
      // Use a Map to track unique instructor IDs and avoid duplicates
      const uniqueInstructors = new Map();

      // Iterate over instructors for the found subject
      subject.instructors.forEach((instructor) => {
        // Add instructor to the Map if not already present
        if (!uniqueInstructors.has(instructor.Id)) {
          uniqueInstructors.set(instructor.Id, {
            id: instructor.Id,
            name: instructor.Name,
            answered: checkIfInstructorAnswered(subjectId, instructor.Id),
          });
        }
      });
      // Convert the Map values to an array
      const mappedInstructors = Array.from(uniqueInstructors.values());

      setInstructors(mappedInstructors); // Update state with mapped instructors

      // Set the active instructor index to the ID of the first instructor by default
      const firstInstructor = mappedInstructors[0];
      if (firstInstructor) {
        setActiveInstructorIndex(firstInstructor.id);
      } else {
        console.warn(`No instructors found for subject with id ${subjectId}`);
        setActiveInstructorIndex(null); // Optionally set to null or handle accordingly
      }
      console.log(mappedInstructors, "mappedInstructors");
    } else {
      console.error(`Subject with id ${subjectId} not found`);
    }
  };



  // Updates the selected option for a given question and checks if all questions are answered
  const handleRadioChange = (questionId, value) => {
    // Update selected options state with the new value for the given questionId
    setSelectedOptions((prevSelected) => ({
      ...prevSelected,
      [questionId]: value,
    }));

    // Check if all questions in groupedQuestions have been answered
    const allAnswered = Object.values(groupedQuestions).every((group) =>
      group.questions.every((question) => selectedOptions[question.id])
    );

    // Enable or disable the submit button based on whether all questions are answered
    setSubmitEnabled(allAnswered);
  };

  // Updates the selected option for a given instructor question and checks if all questions are answered
  const handleRadioChangeInstructor = (questionId, value) => {
    // Update selected options for instructors state with the new value for the given questionId
    setSelectedOptionsInstructor((prevSelected) => ({
      ...prevSelected,
      [questionId]: value,
    }));

    // Check if all instructor questions in groupedQuestions have been answered
    const allAnswered = Object.values(groupedQuestions).every((group) =>
      group.questions.every(
        (question) => selectedOptionsInstructor[question.id]
      )
    );

    // Enable or disable the submit button based on whether all questions are answered
    setSubmitEnabled(allAnswered);
  };

  // Updates the comment for a given category
  const handleCommentChange = (categoryId, value) => {
    // Update comments state with the new value for the given categoryId
    setComments((prevComments) => ({
      ...prevComments,
      [categoryId]: value,
    }));
  };

  // Updates the comment for a given category for instructors
  const handleCommentChangeInstructor = (categoryId, value) => {
    // Update comments for instructors state with the new value for the given categoryId
    setCommentsInstructor((prevComments) => ({
      ...prevComments,
      [categoryId]: value,
    }));
  };




  // Handles the submission of the subjects
  const handleSubmit = async () => {
    // Check if the subject has been answered
    if (checkIfSubjectAnswered(selectedSubject.subjectid)) {
      setShowMessage(true); // Show a message if the subject is already answered
      return; // Exit the function
    }

    setShowMessage(false); // Hide the message if the subject is not answered

    // Prepare formatted options for submission
    const formattedOptions = [];
    Object.keys(selectedOptions).forEach((questionId) => {
      let optionValue = selectedOptions[questionId];
      console.log(questionId, "e");

      // Check if optionValue is a valid object with 'id' and 'text' properties
      if (
        typeof optionValue === 'object' &&
        optionValue !== null &&
        optionValue.hasOwnProperty('id') &&
        optionValue.hasOwnProperty('text')
      ) {
        const optionId = optionValue.id; // Extract the option ID
        const optionText = optionValue.text; // Extract the option text
        const qusId = Number(questionId); // Convert question ID to number
        formattedOptions.push({
          qusId,
          id: optionId,
          text: optionText,
        });
      } else {
        // Log an error if the option value format is invalid
        console.error(`Invalid option value format for question ID ${questionId}: ${optionValue}`);
      }
    });

    console.log(formattedOptions);

    // Prepare the data object for submission
    const data = {
      selectedOptions: formattedOptions,
      comments,
      type: "course",
      subjectId: selectedSubject.subjectid,
      courseid: selectedSubject.courseid,
      userDB: DBUser,
      userCode: Number(user),
    };
    console.log("Submitting course questionnaire...", data);

    try {
      // Submit the questionnaire data to the API
      const response = await axios.post(
        "https://knj.horus.edu.eg/api/hue/portal/v1/SubmitQuestions",
        data
      );

      console.log("Response:", response.data);

      // Update the subjects state to mark the selected subject as answered
      const updatedSubjects = subjects.map((subject) =>
        subject.subjectid === selectedSubject.subjectid
          ? { ...subject, answered: true }
          : subject
      );
      setSubjects(updatedSubjects);

      const answered = new Set(updatedSubjects.filter(sub => sub.answered).map(sub => sub.subjectid));
      setAnsweredSubjects(answered);



      // Disable the course button and trigger re-fetch
      setCourseButtonDisabled(true);
      setFetchTrigger((prev) => !prev);
      // Navigate to the instructors view
      setView("instructors");

      // Check if all instructors for the selected subject have been answered
      const subjectInstructors = instructors.filter(
        (instructor) => instructor.subjectId === selectedSubject.subjectid
      );

      if (subjectInstructors.length > 0) {
        const allInstructorsAnswered = subjectInstructors.every(
          (instructor) => instructor.answered
        );

        if (allInstructorsAnswered) {
          // Find the next unanswered subject and navigate back to course view
          const nextSubject = updatedSubjects.find(
            (subject) => !subject.answered
          );

          if (nextSubject) {
            setSelectedSubject(nextSubject);
            setView("course"); // Go back to course view
          } else {
            console.log("All subjects have been answered.");
          }
        } else {
          // Find the first unanswered instructor and set it as active
          const firstUnansweredInstructor = subjectInstructors.find(
            (instructor) => !instructor.answered
          );
          if (firstUnansweredInstructor) {
            setActiveInstructorIndex(firstUnansweredInstructor.id);
            clearSelectedOptions(); // Clear selected options
            window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to top
          }
        }
      }
    } catch (error) {
      // Handle errors during submission
      console.error("Error submitting questionnaire:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Request data:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);
      setError("Failed to submit the questionnaire. Please try again later.");
    }
  };




  // Handles the submission of the Instructors
  const handleSubmitInstructor = async () => {
    const formattedOptions = [];
    // Iterate over each question in the selectedOptionsInstructor object
    Object.keys(selectedOptionsInstructor).forEach((questionId) => {
      let optionValue = selectedOptionsInstructor[questionId];
      // Check if optionValue is a valid object with 'id' and 'text' properties
      if (
        typeof optionValue === "object" &&
        optionValue !== null &&
        optionValue.hasOwnProperty("id") &&
        optionValue.hasOwnProperty("text")
      ) {
        const optionId = optionValue.id;
        const optionText = optionValue.text;
        const qusId = Number(questionId);

        formattedOptions.push({
          qusId,
          id: optionId,
          text: optionText,
        });
      } else {
        console.error(
          `Invalid option value format for question ID ${questionId}: ${optionValue}`
        );
      }
    });

    const data = {
      selectedOptions: formattedOptions,
      comments: commentsInstructor,
      type: "instructors",
      subjectId: selectedSubject.subjectid,
      instructorId: activeInstructorIndex,
      courseid: selectedSubject.courseid,
      userDB: DBUser,
      userCode: Number(user),
    };

    console.log("Submitting instructor questionnaire...", data);

    try {
      await axios.post(
        "https://knj.horus.edu.eg/api/hue/portal/v1/SubmitQuestions",
        data
      );
      // Update the instructors state to mark the active instructor as answered
      const updatedInstructors = instructors.map((instructor) =>
        instructor.id === activeInstructorIndex
          ? { ...instructor, answered: true }
          : instructor
      );
      setInstructors(updatedInstructors);
      setFetchTrigger((prev) => !prev);

      // Find the next available instructor who has not been answered yet
      const nextInstructor = updatedInstructors.find(
        (instructor) => !instructor.answered
      );

      if (nextInstructor) {
        // Set the next instructor as active
        setActiveInstructorIndex(nextInstructor.id);
        clearSelectedOptions(); // Clear selected options for the next instructor
        window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
      } else {
        // No more instructors to handle, reset the active instructor index
        setActiveInstructorIndex(null);
      }

      console.log("Questionnaire submitted successfully!");
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      if (error.response) {
        // The request was made and the server responded with a status code outside the 2xx range
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request data:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);

      setError("Failed to submit the questionnaire. Please try again later.");
    }
  };



  // Function to clear all selected options and reset state
  const clearSelectedOptions = () => {
    setSelectedOptionsInstructor({}); // Clear selected options for instructors
    setSelectedOptions({}); // Clear selected options for general questions
    setCommentsInstructor({}); // Clear comments for instructors
    setComments({}); // Clear general comments
    setSubmitEnabled(false); // Disable submit button
  };

  // Function to handle subject click events
  const handleSubjectClick = async (subject) => {

    setView("course"); // Set the view to "course"
    setSelectedSubject(subject); // Set the currently selected subject
    setActiveInstructorIndex(null); // Reset the active instructor index
    clearSelectedOptions(); // Clear all selected options and comments
    await fetchInstructors(subject.subjectid); // Fetch instructors for the selected subject

    // Check if all instructors for the selected subject have been answered
    const allAnswered = checkIfAllInstructorsAnswered(subject.subjectid);
    setAllInstructorsAnswered(allAnswered); // Update the state with the result
  };

  // Function to handle instructor click events
  const handleInstructorClick = (index) => {
    if (!isAllInstructorsAnswered) { // Only proceed if not all instructors are answered
      setActiveInstructorIndex(index); // Set the index of the active instructor
      setView("instructors"); // Switch view to "instructors"
      clearSelectedOptions(); // Clear all selected options and comments
    }
  };



  // Find the first instructor that is not answered
  useEffect(() => {
    const firstNotAnsweredIndex = instructors.findIndex(
      (instructor) => !instructor.answered
    );

    // Set active instructor to the first not answered one, if found
    if (firstNotAnsweredIndex !== -1) {
      setActiveInstructorIndex(instructors[firstNotAnsweredIndex].id);
    }
  }, [instructors]);


  // Check if all instructors have been answered
  const checkIfAllInstructorsAnswered = () => {
    const answered = instructors.every((instructor) =>
      answeredInstructorsData.some(
        (answered) => answered.instructorid === instructor.id
      )
    );
    setAllInstructorsAnswered(answered); // Update state with the result
  };



  // Effect to check if all instructors are answered on component mount
  useEffect(() => {
    if (instructors.length > 0 && answeredInstructorsData.length > 0) {
      checkIfAllInstructorsAnswered();
    }
  }, [instructors, answeredInstructorsData, subjects, handleSubjectClick]);


  // Check if initial fetch is not done and subjects have data
  useEffect(() => {
    if (!initialFetchDone.current && subjects.length > 0) {
      fetchSubjects(); // Fetch subjects
      initialFetchDone.current = true; // Mark the initial fetch as done
    }
  }, [subjects, answeredSubjectData]);



  // Log the current state of subjects and answeredSubjectData to the console
  useEffect(() => {
    console.log("Subjects:", subjects);
    console.log("Answered Subjects Data:", answeredSubjectData);
  }, [subjects, answeredSubjectData]); // Dependencies: subjects and answeredSubjectData






  return (
    <div className="flex flex-col items-center min-h-screen text-gray-800 dark:text-gray-100 p-4">
      {error && <p>{error}</p>}
      {isLoading ? (
        <Spinner />  /* Show spinner if data is still loading */
      ) : (
        <>
          {" "}
          <h1 className="text-2xl font-bold mb-4">Courses Questionnaire</h1>
          <button
            onClick={() => navigate("/services-questionnaire")}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:ring-opacity-75 mb-4"
          >
            Go to Services Questionnaire
          </button>
          <div className="flex flex-wrap justify-center space-x-4 mb-8">
            {subjects.map((subject) => (
              <button
                key={subject.subjectid}
                // disabled={answeredSubjects[subject.subjectid] || false}
                onClick={() => handleSubjectClick(subject)}
                style={{
                  backgroundColor: answeredSubjects[subject.subjectid]
                    ? "#FFA500" // Orange for answered subjects
                    : selectedSubject && selectedSubject.subjectid === subject.subjectid
                    ? "#3B82F6" // Blue if selected
                    : "#6B7280", // Gray otherwise
                  color: selectedSubject && selectedSubject.subjectid === subject.subjectid
                    ? "#FFFFFF" // White text if selected
                    : "#F3F4F6", // Lighter gray text otherwise
                }}
                className={`px-4 py-2 m-2 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-opacity-75`}
              >
                {subject.subjectName}
              </button>
            ))}
          </div>
          {selectedSubject && (
            <div className="w-full max-w-5xl">
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => setView("course")}
                  className={`px-4 py-2 ${view === "course"
                    ? "bg-blue-500 dark:bg-blue-700"
                    : "bg-[#6B7280] dark:bg-gray-700"
                    } text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:ring-opacity-75`}
                  style={{
                    backgroundColor: checkIfSubjectAnswered(selectedSubject.subjectid)
                      ? "#c2410c" // Orange if answered
                      : (view === "course" ? "#3B82F6" : "#6B7280"), // Blue if active, gray otherwise
                    cursor: checkIfSubjectAnswered(selectedSubject.subjectid)
                      ? "not-allowed"
                      : "pointer", // Pointer if not answered, not-allowed if answered
                    opacity: checkIfSubjectAnswered(selectedSubject.subjectid) ? 0.5 : 1, // Reduced opacity if answered
                  }}
                  disabled={checkIfSubjectAnswered(selectedSubject.subjectid)} // Disable button if courseButtonDisabled or subject is answered
                >
                  Course {checkIfSubjectAnswered(selectedSubject.subjectid) ? "(Answered)" : ""}
                </button>
                {!allInstructorsAnswered ? (
                  <button
                    onClick={() => {
                      setView("instructors");
                    }}
                    className={`px-4 py-2 ${view === "instructors"
                      ? "bg-blue-500 dark:bg-blue-700"
                      : "bg-[#6B7280] dark:bg-gray-700"
                      } text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:ring-opacity-75`}
                  >
                    Instructors
                  </button>
                ) : (
                  <button
                    className={`px-4 py-2 ${view === "instructors"
                      ? "bg-blue-500 dark:bg-blue-700"
                      : "bg-orange-500 dark:bg-orange-700 cursor-not-allowed"
                      } text-white font-semibold rounded-lg shadow-md`}
                    style={{
                      cursor: "not-allowed",
                      opacity: 0.5,
                    }}
                    disabled
                  >
                    Instructors (Answered)
                  </button>
                )}
              </div>
              {view === "course" ? (
                <div>
                  <h2 className="text-xl font-bold mb-4">Course Questions</h2>

                  {Object.entries(groupedQuestions).map(
                    ([headId, group]) =>
                      group.type === "subject" && (
                        <div
                          key={headId}
                          className="mb-6 bg-gray-100 p-8 rounded-2xl w-full wid dark:text-gray-200 dark:bg-secondary-dark-bg "
                        >
                          <h3 className="text-2xl font-semibold mb-2 text-right dark:text-gray-200 dark:bg-secondary-dark-bg ">
                            {group.name}
                          </h3>
                          <hr />
                          {group.questions.map((question) => (
                            <div
                              key={question.id}
                              className="mb-4 mt-2 bg-gray-200 py-5 rounded-2xl flex justify-between align-middle px-5 dark:text-gray-200 dark:bg-[#4d525e4f]"
                            >
                              <div className="flex space-x-2 justify-center mt-2 wid80hun w-[50%]">
                                {question.options.map((option) => (
                                  <div key={`${question.id}_${option.id}`}>
                                    <input
                                      type="radio"
                                      id={`${option.id}_${question.id}`}
                                      name={`opinion_${question.id}`}
                                      value={option.id} // Use option.id to ensure value is properly set
                                      checked={
                                        selectedOptions[question.id]?.id ===
                                        option.id
                                      } // Check if the selected option matches the current option's id
                                      onChange={() =>
                                        handleRadioChange(question.id, option)
                                      }
                                      className={`mr-2 ${devAutFill}`}
                                    />
                                    <label
                                      htmlFor={`${option.id}_${question.id}`}
                                      className={`px-4 py-2 rounded-lg cursor-pointer ${selectedOptions[question.id]?.id ===
                                        option.id
                                        ? "bg-blue-500 text-white" // Active style for selected option
                                        : "bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                                        } qusbox`}
                                    >
                                      {option.text}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <p className="mb-5 text-center textpx dark:text-gray-200">
                                {question.description}
                              </p>
                            </div>
                          ))}
                          <div className="mt-4">
                            <label
                              htmlFor={`comment_${headId}`}
                              className="block mb-2 font-semibold"
                            >
                              Write a comment
                            </label>
                            <textarea
                              id={`comment_${headId}`}
                              value={comments[headId] || ""}
                              onChange={(e) =>
                                handleCommentChange(headId, e.target.value)
                              }
                              className="dark:text-gray-200 dark:bg-[#424349] w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:ring-opacity-75"
                              rows="3"
                            />
                          </div>
                        </div>
                      )
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!submitEnabled}
                    className={`mt-4 px-4 py-2 font-semibold rounded-lg shadow-md ${submitEnabled
                      ? "bg-green-500 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-900"
                      : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      } text-white focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600 focus:ring-opacity-75`}
                  >
                    Submit
                  </button>
                </div>
              ) : (
                <div>
                  {isLoading && <p>Loading...</p>}
                  {error && <p>{error}</p>}
                  {allInstructorsAnswered ? (
                    <p>All instructors have already answered.</p>
                  ) : instructors.length > 0 ? (
                    <>
                      <div>
                        {instructors.map((instructor) => (
                          <button
                            key={instructor.id}
                            onClick={() => handleInstructorClick(instructor.id)}
                            className={`px-5 py-2 m-2 font-semibold rounded-lg shadow-md mb-5 ${activeInstructorIndex === instructor.id
                              ? "bg-blue-500 dark:bg-blue-700 text-white"
                              : "bg-gray-400 dark:bg-gray-600 text-black dark:text-white"
                              } ${instructor.answered
                                ? "bg-orange-500 dark:bg-orange-700 cursor-not-allowed"
                                : "hover:bg-blue-900 dark:hover:bg-blue-900"
                              } focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:ring-opacity-75`}
                            disabled={instructor.answered}
                            style={{ position: "relative" }}
                          >
                            {instructor.answered
                              ? `(Answered) - ${instructor.name} `
                              : instructor.name}
                          </button>
                        ))}
                      </div>

                      {activeInstructorIndex !== null && (
                        <div>
                          {Object.entries(groupedQuestions).map(
                            ([headId, group]) =>
                              (group.type === "assistant" ||
                                group.type === "doctor") && (
                                <div
                                  key={headId}
                                  className="mb-6 bg-gray-100 p-8 rounded-2xl w-full wid dark:text-gray-200 dark:bg-secondary-dark-bg"
                                >
                                  <h3 className="text-2xl font-semibold mb-2 text-right">
                                    {group.name}
                                  </h3>
                                  <hr />
                                  {group.questions.map((question) => (
                                    <div
                                      key={question.id}
                                      className="mb-4 mt-2 bg-gray-200 py-5 rounded-2xl flex justify-between align-middle px-5 dark:text-gray-200 dark:bg-[#4d525e4f]"
                                    >
                                      <div className="flex space-x-2 justify-center mt-2 wid80hun w-[50%]">
                                        {question.options.map((option) => (
                                          <div
                                            key={`${question.id}_${option.id}`}
                                          >
                                            <input
                                              type="radio"
                                              id={`${option.id}_${question.id}`}
                                              name={`opinion_${question.id}`}
                                              value={option.id}
                                              checked={
                                                selectedOptionsInstructor[
                                                  question.id
                                                ]?.id === option.id
                                              }
                                              onChange={() =>
                                                handleRadioChangeInstructor(
                                                  question.id,
                                                  option
                                                )
                                              }
                                              className={`mr-2 ${devAutFill}`}
                                            />
                                            <label
                                              htmlFor={`${option.id}_${question.id}`}
                                              className={`px-4 py-2 rounded-lg cursor-pointer ${selectedOptionsInstructor[
                                                question.id
                                              ]?.id === option.id
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                                                } qusbox`}
                                            >
                                              {option.text}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                      <p className="mb-5 text-center textpx">
                                        {question.description}
                                      </p>
                                    </div>
                                  ))}
                                  <div className="mt-4">
                                    <label
                                      htmlFor={`comment_${headId}`}
                                      className="block mb-2 font-semibold"
                                    >
                                      Write a comment
                                    </label>
                                    <textarea
                                      id={`comment_${headId}`}
                                      value={commentsInstructor[headId] || ""}
                                      onChange={(e) =>
                                        handleCommentChangeInstructor(
                                          headId,
                                          e.target.value
                                        )
                                      }
                                      className="dark:text-gray-200 dark:bg-[#424349] w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 focus:ring-opacity-75"
                                      rows="3"
                                    />
                                  </div>
                                </div>
                              )
                          )}
                          <button
                            onClick={handleSubmitInstructor}
                            disabled={!submitEnabled}
                            className={`mt-4 px-4 py-2 font-semibold rounded-lg shadow-md ${submitEnabled
                              ? "bg-green-500 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-900"
                              : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                              } text-white focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600 focus:ring-opacity-75`}
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    answeredInstructorsData.length === 0 ||
                    (!isLoading && !error && <p>No data available.</p>)
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CoursesQuestionnaire;
