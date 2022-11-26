import React, { useState } from "react";
import { useSelector } from "react-redux";
import "../assets/css/Home.css";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";

import DatePicker from "react-datepicker";
import SearchIcon from "@mui/icons-material/Search";

import { networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";
import NavBar from "../components/NavBar";

const Home = () => {
  const data = useSelector((state) => state.blockchain.value);

  const [info, setInfo] = useState({
    destination: "New York",
    checkIn: new Date(),
    checkOut: new Date(),
    guests: 2,
  });

  return (
    <div className="homeContainer">
      <div className="containerGradinet">
        <NavBar />
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="banner-title text-center">
                <h1>Find the best location for your trip</h1>
                <p className="opacity-full">
                  the decentralized version of Airbnb offers you the best
                  traveling opportunity
                </p>
              </div>
            </div>
            <form className="search-form-tour">
              <div className="field-search">
                <div className="row tour-row">
                  <div className="col-lg-4 col-md-12 pe-0 border-right procode-col">
                    <div className="promo-box">
                      <div className="form-group promo-code">
                        <label>City</label>
                        <input
                          type="text"
                          id="disabledTextInput"
                          className="d-lg-block form-control"
                          style={{ fontWeight: 700 }}
                          value={info.destination}
                          onChange={(e) => {
                            console.log("des :", e.target.value);
                            setInfo({ ...info, destination: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-12 border-right date-col">
                    <div className="check-form d-flex">
                      <div className="form-group">
                        <label>Check in</label>
                        <DatePicker
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                          selected={info.checkIn}
                          onChange={(date) =>
                            setInfo({ ...info, checkIn: date })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Check out</label>
                        <DatePicker
                          className="form-control"
                          dateFormat="dd/MM/yyyy"
                          selected={info.checkOut}
                          onChange={(date) =>
                            setInfo({ ...info, checkOut: date })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-12 pe-0 procode-col">
                    <div className="promo-box d-flex">
                      <div className="form-group promo-code">
                        <label>Guests</label>
                        <input
                          type="text"
                          id="disabledTextInput"
                          className="d-lg-block form-control"
                          style={{ fontWeight: 700 }}
                          value={info.guests}
                          onChange={(e) => {
                            setInfo({ ...info, guests: e.target.value });
                          }}
                        />
                      </div>
                      <div className="form-group p-0">
                        {data.network === networksMap[networkDeployedTo] ? (
                          <Link
                            to={"/rentals"}
                            state={{
                              destination: info.destination,
                              checkIn: info.checkIn,
                              checkOut: info.checkOut,
                              guests: info.guests,
                            }}
                          >
                            <button className="tour-search">
                              <SearchIcon sx={{ color: "white" }} />
                              <span className="tour-searchtext">
                                Search Now
                              </span>
                            </button>
                          </Link>
                        ) : (
                          <button
                            className="tour-search"
                            onClick={() => {
                              window.alert(
                                `Please Switch to the ${networksMap[networkDeployedTo]} network`
                              );
                            }}
                          >
                            <SearchIcon sx={{ color: "white" }} />
                            <span className="tour-searchtext">Search Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
