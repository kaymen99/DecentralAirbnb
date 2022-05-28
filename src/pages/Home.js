import React, { useState } from "react";
import { useSelector } from "react-redux";
import "./Home.css";
import Account from "../components/Account";
import { Link } from "react-router-dom";
import bg from "../images/home-bg.jpg";
import logo from "../images/airbnbRed.png";
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { TextField, Button, Input } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

import { networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const Home = () => {
  const data = useSelector((state) => state.blockchain.value)

  const [info, setInfo] = useState(
    { destination: "", checkIn: new Date(), checkOut: new Date(), guests: 2 }
  )

  return (
    <>
      <div className="homeContainer" style={{
        backgroundImage: `url(${bg})`,
        width: "100%"
      }}>
        <div className="containerGradinet"></div>
      </div>
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
          <Account />
        </div>
      </div>
      <div className="tabContent">
        <div className="searchFields">
          <div className="inputs">
            <Input
              required={true}
              placeholder="Location"
              type="text"
              onChange={(e) => {
                setInfo({ ...info, destination: e.target.value })
              }}
            />
          </div>
          <div className="vl" />
          <div className='inputs'>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                inputFormat="dd/MM/yyyy"
                value={info.checkIn}
                onChange={(newValue) => {
                  setInfo({ ...info, checkIn: newValue })
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>

          </div>

          <div className="vl" />
          <div className='inputs'>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                inputFormat="dd/MM/yyyy"
                value={info.checkOut}
                onChange={(newValue) => {
                  setInfo({ ...info, checkOut: newValue })
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>

          </div>

          <div className="vl" />
          <div className="inputs">
            <Input
              required={true}
              name="AddGuests"
              placeholder="Guests"
              type="number"
              onChange={(e) => {
                setInfo({ ...info, guests: e.target.value })
              }}
            />
          </div>
          {data.network === networksMap[networkDeployedTo] ? (
            <Link to={"/rentals"} state={{
              destination: info.destination,
              checkIn: info.checkIn,
              checkOut: info.checkOut,
              guests: info.guests
            }}>
              <div className="searchButton">
                <SearchIcon sx={{ color: "white" }} />
              </div>
            </Link>
          ) : (
            <div className="searchButton"
              onClick={() => { window.alert(`Please Switch to the ${networksMap[networkDeployedTo]} network`) }}>
              <SearchIcon sx={{ color: "white" }} />
            </div>
          )}
        </div>
      </div>
      <div className="randomLocation">
        <div className="title">Feel Adventurous</div>
        <div className="text">
          Let us decide and discover new places to stay, live, work or just
          relax.
        </div>
        <Button
          text="Explore A Location"
          onClick={() => console.log(info.checkOut)}
        />
      </div>

    </>
  );
};

export default Home;
