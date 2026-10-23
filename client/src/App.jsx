import { Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "react-hot-toast";
import { AuthContext} from "../context/AuthContext";
import AuthProvider from "../context/AuthProvider";
import { ChatProvider } from "../context/ChatProvider";
import { useContext } from "react";

const AppRoutesContent = () => {
    const { authUser } = useContext(AuthContext);
    return (
        <div className="bg-[url('/bgImage.svg')] bg-contain min-h-screen">
            <Toaster />
            <Routes>
                <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
                <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
            </Routes>
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <ChatProvider>
                <AppRoutesContent />
            </ChatProvider>
        </AuthProvider>
    );
}