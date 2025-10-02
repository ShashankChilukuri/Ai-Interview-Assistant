import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store.js";

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

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <RouteTracker />
          <Routes>
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
            {/* <Route path="/test-details/:testID" element={<TestDetails />} /> */}
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}
