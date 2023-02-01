import React, { useState, useEffect } from "react";
import "../assets/css/Rentals.css";
import logo from "../assets/images/airbnbRed.png";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ethers, utils } from "ethers";
import { useLocation } from "react-router";
import RentalsMap from "../components/RentalsMap";
import { Button, CircularProgress } from "@mui/material";
import Connect from "../components/Connect";

import DecentralAirbnb from "../artifacts/DecentralAirbnb.sol/DecentralAirbnb.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const Rentals = () => {
  let navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const data = useSelector((state) => state.blockchain.value);

  const { state: searchFilters } = useLocation();
  const [highLight, setHighLight] = useState();
  const [rentalsList, setRentalsList] = useState([]);
  const [coordinates, setCoordinates] = useState([]);

  const getRentalsList = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    const signer = provider.getSigner();
    const AirbnbContract = new ethers.Contract(
      contractAddress,
      DecentralAirbnb.abi,
      signer
    );

    const rentals = await AirbnbContract.getRentals();

    const items = rentals.map((r) => {
      const imgUrl = r[7].replace(
        "ipfs://",
        "https://gateway.pinata.cloud/ipfs/"
      );
      return {
        id: Number(r[0]),
        name: r[2],
        city: r[3],
        description: r[6],
        imgUrl: imgUrl,
        price: utils.formatUnits(r[9], "ether"),
      };
    });

    const matchedItems = items.filter((p) =>
      p.city.toLowerCase().includes(searchFilters.destination.toLowerCase())
    );

    setRentalsList(matchedItems);

    let cords = rentals.map((r) => {
      return {
        lat: Number(r[4]),
        lng: Number(r[5]),
      };
    });

    setCoordinates(cords);
  };

  const bookProperty = async (_id, _price) => {
    if (data.network == networksMap[networkDeployedTo]) {
      try {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        const signer = provider.getSigner();
        const AirbnbContract = new ethers.Contract(
          contractAddress,
          DecentralAirbnb.abi,
          signer
        );

        const _datefrom = Math.floor(searchFilters.checkIn.getTime() / 1000);
        const _dateto = Math.floor(searchFilters.checkOut.getTime() / 1000);

        const dayToSeconds = 86400;
        const bookPeriod = (_dateto - _datefrom) / dayToSeconds;
        const totalBookingPriceUSD = Number(_price) * bookPeriod;
        const totalBookingPriceETH = await AirbnbContract.convertFromUSD(
          utils.parseEther(totalBookingPriceUSD.toString(), "ether")
        );

        const book_tx = await AirbnbContract.bookDates(
          _id,
          _datefrom,
          _dateto,
          { value: totalBookingPriceETH }
        );
        await book_tx.wait();

        setLoading(false);
        navigate("/dashboard");
      } catch (err) {
        setLoading(false);
        window.alert("An error has occured, please try again");
      }
    } else {
      setLoading(false);
      window.alert(
        `Please Switch to the ${networksMap[networkDeployedTo]} network`
      );
    }
  };

  useEffect(() => {
    getRentalsList();
  }, []);

  return (
    <>
      <div className="topBanner">
        <div>
          <Link to="/">
            <img className="logo" src={logo} alt="logo"></img>
          </Link>
        </div>
        <div className="search-reminder">
          <div className="filter">{searchFilters.destination}</div>
          <div className="vl" />
          <div className="filter">
            {`${searchFilters.checkIn.toLocaleString("default", {
              month: "short",
            })} ${searchFilters.checkIn.toLocaleString("default", {
              day: "2-digit",
            })}  -  ${searchFilters.checkOut.toLocaleString("default", {
              month: "short",
            })}  ${searchFilters.checkOut.toLocaleString("default", {
              day: "2-digit",
            })} `}
          </div>
          <div className="vl" />
          <div className="filter">{searchFilters.guests} Guest</div>
        </div>
        <div className="lrContainers">
          <Connect />
        </div>
      </div>

      <hr className="line" />
      <div className="RentalsContent">
        <div className="RentalsContent-box">
          Stays Available For Your Destination
          <hr className="line2" />
          {rentalsList.length !== 0 ? (
            rentalsList.map((e, i) => {
              return (
                <>
                  <div className="rental-div" key={i}>
                    <img className="rental-img" src={e.imgUrl}></img>
                    <div className="rental-info">
                      <div className="rental-title">{e.name}</div>
                      <div className="rental-desc">in {e.city}</div>
                      <div className="rental-desc">{e.description}</div>
                      <div className="bottomButton">
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => {
                            bookProperty(e.id, e.price);
                          }}
                        >
                          {loading ? (
                            <CircularProgress color="inherit" />
                          ) : (
                            "Book"
                          )}
                        </Button>
                        <div className="price">{e.price}$</div>
                      </div>
                    </div>
                  </div>
                  <hr className="line2" />
                </>
              );
            })
          ) : (
            <div style={{ textAlign: "center", paddingTop: "30%" }}>
              <p>No properties found for your search</p>
            </div>
          )}
        </div>
        <div className="RentalsContent-box hide">
          <RentalsMap locations={coordinates} setHighLight={setHighLight} />
        </div>
      </div>
    </>
  );
};

export default Rentals;
