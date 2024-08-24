import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import HUELogoMainSidebar from "../utiltis/IMG/HUE.png"; // Adjust the path as necessary
import HUELogoDarkSidebar from "../utiltis/IMG/Logo-dark.png"; // Adjust the path as necessary

function Unauthorized() {
  const { user, currentMode } = useStateContext();
  const navigate = useNavigate();

  console.log("currentMode:", currentMode); // Debugging

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-main-dark-bg">
      <div className="text-center p-8 bg-white dark:bg-secondary-dark-bg shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-red-800 dark:text-red-300">Unauthorized</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">You do not have access to this page. <br />Please contact your Admin!</p>
        {/* <img className="w-[20rem] h-[10rem]" */}
        <img className={currentMode === "Dark" ? "w-[20rem] h-[10rem]" : ""}
          src={currentMode === "Dark" ? HUELogoDarkSidebar : HUELogoMainSidebar}
          alt="HUE"
        />
      </div>
    </div>
  );
}

export default Unauthorized;
