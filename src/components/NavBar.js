import React from "react";
import Connect from "./Connect";
import logo from "../assets/images/airbnbRed.png";

import "../assets/css/Home.css";

function NavBar() {
  return (
    <div className="topBanner">
      <div>
        <img className="logo" src={logo} alt="logo"></img>
      </div>
      <div className="tabs">
        <div className="selected">Places To Stay</div>
        <div>Experiences</div>
        <div>Online Experiences</div>
      </div>
      <div className="lrContainers">
        <Connect />
      </div>
    </div>
  );
}

export default NavBar;
