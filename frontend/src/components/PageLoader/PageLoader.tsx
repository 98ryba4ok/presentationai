import "./PageLoader.css";
import React from "react";
import Loader from "../Loader/Loader";

const PageLoader: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Loader />
    </div>
  );
};

export default PageLoader;
