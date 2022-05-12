import React, { useState, useEffect } from "react";
import "./Rentals.css";
import { Link, useNavigate } from "react-router-dom";
import { ethers, utils } from "ethers"
import { useLocation } from "react-router";
import logo from "../images/airbnbRed.png";
import RentalsMap from "../components/RentalsMap";
import SearchIcon from '@mui/icons-material/Search';
import { Button } from "@mui/material";
import Account from "../components/Account";


import DecentralAirbnb from "../artifacts/contracts/DecentralAirbnb.sol/DecentralAirbnb.json"
import { contractAddress } from "../utils/contracts-config"

const Rentals = () => {
    let navigate = useNavigate();

    const { state: searchFilters } = useLocation();
    const [highLight, setHighLight] = useState();
    const [rentalsList, setRentalsList] = useState([]);
    const [coordinates, setCoordinates] = useState([]);

    const getRentalsList = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner()
        const AirbnbContract = new ethers.Contract(contractAddress, DecentralAirbnb.abi, signer);

        const rentals = await AirbnbContract.getRentals()

        const items = rentals.map((r) => {
            return {
                id: Number(r[0]),
                name: r[2],
                city: r[3],
                description: r[6],
                imgUrl: r[7],
                price: utils.formatUnits(r[9], "ether")
            }
        })

        const matchedItems = items.filter(p => p.city.toLowerCase().includes(searchFilters.destination))
        setRentalsList(matchedItems)

        let cords = rentals.map((r) => {
            return {
                lat: Number(r[4]),
                lng: Number(r[5])
            }
        })

        setCoordinates(cords)
    }

    const bookProperty = async (_id, _price) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner()
        const AirbnbContract = new ethers.Contract(contractAddress, DecentralAirbnb.abi, signer);

        const _datefrom = Math.floor(searchFilters.checkIn.getTime() / 1000)
        const _dateto = Math.floor(searchFilters.checkOut.getTime() / 1000)

        const dayToSeconds = 86400
        const bookPeriod = (_dateto - _datefrom) / dayToSeconds
        const totalBookingPriceUSD = Number(_price) * bookPeriod
        const totalBookingPriceETH = await AirbnbContract.convertFromUSD(utils.parseEther(totalBookingPriceUSD.toString(), "ether"))

        const book_tx = await AirbnbContract.bookDates(
            _id,
            _datefrom,
            _dateto,
            { value: totalBookingPriceETH }
        )
        await book_tx.wait()
        navigate("/dashboard")
    }

    useEffect(() => {
        getRentalsList()

    }, [])

    return (
        <>
            <div className="topBanner">
                <div>
                    <Link to="/">
                        <img className="logo" src={logo} alt="logo"></img>
                    </Link>
                </div>
                <div className="searchReminder">
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
                    <div className="searchFiltersIcon">
                        <SearchIcon sx={{ color: "white" }} />
                    </div>
                </div>
                <div className="lrContainers">
                    <Account />
                </div>
            </div>

            <hr className="line" />
            <div className="rentalsContent">
                <div className="rentalsContentL">
                    {rentalsList.length !== 0 ? (
                        rentalsList.map((e, i) => {
                            return (
                                <>
                                    Stays Available For Your Destination
                                    <hr className="line2" />
                                    <div className={highLight == i ? "rentalDivH " : "rentalDiv"}>
                                        <img className="rentalImg" src={e.imgUrl}></img>
                                        <div className="rentalInfo">
                                            <div className="rentalTitle">{e.name}</div>
                                            <div className="rentalDesc">
                                                {e.description}
                                            </div>
                                            <div className="bottomButton">
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => { bookProperty(e.id, e.price) }}>Stay Here</Button>
                                                <div className="price">
                                                    {e.price}$
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })) : (
                        <div style={{ textAlign: "center", paddingTop: "30%" }}>
                            <p>No properties found for your search</p>
                        </div>
                    )
                    }
                </div>
                <div className="rentalsContentR">
                    <RentalsMap locations={coordinates} setHighLight={setHighLight} />
                </div>
            </div>
        </>
    );
};

export default Rentals;