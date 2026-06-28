// src/layouts/RootLayout.jsx
import { Outlet } from "react-router-dom";
import { SocketProvider } from "../context/SocketContext";

const RootLayout = () => {
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
};

export default RootLayout;