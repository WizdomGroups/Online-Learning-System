import React from "react";
import { RootState } from "./store";
import { useSelector } from "react-redux";
import Router from "./Router";
import LoadingOverlay from "./components/LoadingOverlay";
function App() {
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);
  return (
    <>
      <Router />
      <LoadingOverlay isLoading={isLoading} />
    </>
  );
}

export default App;
