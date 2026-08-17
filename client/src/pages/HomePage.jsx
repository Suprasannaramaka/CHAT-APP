import Sidebar from "../pages/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import {ChatProvider} from "../../context/ChatContext";

const Home = () => {
  return (
    <div className="w-full h-screen sm:px-[5%] sm:py-[3%]">
      <div className="w-full h-full backdrop-blur-xl border-2 border-gray-600 rounded-lg overflow-hidden">
          <ChatProvider>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr] h-full">
            <Sidebar/>
          <ChatContainer/>
          <RightSidebar/>
          </div>
          </ChatProvider>
        </div>
      </div>    
  );
};

export default Home;