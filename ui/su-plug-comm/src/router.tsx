import { createBrowserRouter } from "react-router-dom"
import { Layout } from "./components/layout/Layout"
import Home from "./features/home/Home"
import Models from "./features/models/Models"
import ModelDetail from "./features/models/ModelDetail"
import Content from "./features/content/Content"
import VideoDetail from "./features/content/VideoDetail"
import ArticleDetail from "./features/content/ArticleDetail"

import Profile from "./features/profile/Profile"
import MyModels from "./features/profile/MyModels"
import MyContent from "./features/profile/MyContent"
import PurchaseHistory from "./features/profile/PurchaseHistory"
import Favorites from "./features/profile/Favorites"
import History from "./features/profile/History"
import WalletPage from "./features/profile/Wallet"
import HelpCenter from "./features/profile/HelpCenter"
import SettingsPage from "./features/profile/Settings"
import PublishContent from "./features/profile/PublishContent"
import AuthorProfile from "./features/author/AuthorProfile"
import Login from "./features/auth/Login"
import Register from "./features/auth/Register"
import SearchResults from "./features/search/SearchResults"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/models", element: <Models /> },
      { path: "/content", element: <Content /> },
      { path: "/profile", element: <Profile /> },
      { path: "/search", element: <SearchResults /> },
    ],
  },
  {
    path: "/models/:id",
    element: <ModelDetail />,
  },
  {
    path: "/content/video/:id",
    element: <VideoDetail />,
  },
  {
    path: "/content/article/:id",
    element: <ArticleDetail />,
  },
  {
    path: "/profile/my-models",
    element: <MyModels />,
  },
  {
    path: "/profile/my-content",
    element: <MyContent />,
  },
  {
    path: "/profile/purchases",
    element: <PurchaseHistory />,
  },
  {
    path: "/profile/favorites",
    element: <Favorites />,
  },
  {
    path: "/profile/history",
    element: <History />,
  },
  {
    path: "/profile/wallet",
    element: <WalletPage />,
  },
  {
    path: "/profile/help",
    element: <HelpCenter />,
  },
  {
    path: "/profile/settings",
    element: <SettingsPage />,
  },
  {
    path: "/profile/publish",
    element: <PublishContent />,
  },
  {
    path: "/author/:id",
    element: <AuthorProfile />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
])
