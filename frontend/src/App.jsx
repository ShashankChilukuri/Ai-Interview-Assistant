import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store.js";

import Header from "./Header.jsx";
import Home from "./Home.jsx";
import ChatInterface from "./components/ChatInterface.jsx";
import Signup from "./SignUp.jsx";
import CreateTest from "./CreateTest.jsx";
import MyTests from "./MyTests.jsx";
import TestAnalysis from "./TestAnalysis.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    localStorage.setItem("lastRoute", location.pathname + location.search);
  }, [location]);
  return null;
}

function AppRoutes() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    // Get last visited route from localStorage
    const lastRoute = localStorage.getItem("lastRoute");
    if (lastRoute) setInitialRoute(lastRoute);
    else setInitialRoute("/"); // default home
  }, []);

  if (!initialRoute) return null; // Wait until initialRoute is loaded

  return (
    <Routes>
      {/* Redirect to last route if app is loaded first time */}
      <Route path="*" element={<Navigate to={initialRoute} replace />} />

      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/create-test"
        element={
          <ProtectedRoute>
            <CreateTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tests"
        element={
          <ProtectedRoute>
            <MyTests />
          </ProtectedRoute>
        }
      />
      <Route path="/start-test/:testID" element={<ChatInterface />} />
      <Route
        path="/analysis/:testID"
        element={
          <ProtectedRoute>
            <TestAnalysis />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <RouteTracker />
          <Header />
          <AppRoutes />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}
