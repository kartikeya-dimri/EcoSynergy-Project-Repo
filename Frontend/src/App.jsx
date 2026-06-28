import {
  Route,
  RouterProvider,
  createRoutesFromElements,
  createBrowserRouter,
} from "react-router-dom";

// Citizen layout
import CitizenLayout from "./citizen/layouts/CitizenLayout.jsx";

// Citizen pages
import HomePage from "./citizen/pages/HomePage.jsx";
import AIChatPage from "./citizen/pages/AIChatPage.jsx";
import MyInitiatives from "./citizen/pages/MyInitiatives.jsx";
import CommunityInitiatives from "./citizen/pages/CommunityInitiatives.jsx";
import DiscussionForum from "./citizen/pages/DiscussionForum.jsx";
import ImpactBoard from "./citizen/pages/ImpactBoard.jsx";
import ViewSummary from "./citizen/pages/ViewSummary.jsx";

// for login
import Login from "./login/Login";
import AuthCallback from "./login/AuthCallback";
import ProtectedRoute from "./auth/ProtectedRoute";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
       <Route element={<ProtectedRoute citizenOnly={true} />}>
          <Route path="/" element={<CitizenLayout />}>
            <Route index element={<HomePage />} />
            <Route path="eco-bot" element={<AIChatPage />} />
            <Route path="my-initiatives" element={<MyInitiatives />} />
            <Route path="community-initiatives" element={<CommunityInitiatives />} />
            <Route path="discussion/:driveId" element={<DiscussionForum />} />
            <Route path="impact-board/:driveId" element={<ImpactBoard />} />
            <Route path="view-summary/:driveId" element={<ViewSummary />} />
          </Route>
        </Route>

       <Route path="/login" element={<Login />} />
       <Route path="/auth/callback" element={<AuthCallback />} />

    </>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
