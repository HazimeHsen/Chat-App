import "./App.css";
import Register from "./pages/Register/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import ProtectedRoute from "./components/useAuthentication/useAuthentication";
import Gg from "./pages/Gg/Gg";
import Login from "./pages/Login/Login";
import ChatPage from "./pages/ChatPage/ChatPage";
function App() {
  return (
    <BrowserRouter>
      <div>
        <ToastContainer position="bottom-center" limit={1} />
        <Routes>
          <Route
            path="/gg"
            element={
              <ProtectedRoute>
                <Gg />
              </ProtectedRoute>
            }
          />

          <Route path="/chat" element={<ChatPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
