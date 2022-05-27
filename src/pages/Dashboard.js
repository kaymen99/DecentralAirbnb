import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import { ethers, utils } from "ethers";
import logo from "../images/airbnbRed.png";
import { useSelector } from "react-redux";
import Account from "../components/Account";


import DecentralAirbnb from "../artifacts/contracts/DecentralAirbnb.sol/DecentralAirbnb.json"
import { contractAddress } from "../utils/contracts-config"

const Dashboard = () => {
    const data = useSelector((state) => state.blockchain.value)

    const [rentalsList, setRentalsList] = useState([]);
    const [propertiesList, setPropertiesList] = useState([]);

    const getRentalsList = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        const signer = provider.getSigner()
        const AirbnbContract = new ethers.Contract(contractAddress, DecentralAirbnb.abi, signer);

        const rentals = await AirbnbContract.getRentals()

        const user_properties = rentals.filter((r) => r[1] == data.account)

        const items = user_properties.map((r) => {
            return {
                name: r[2],
                city: r[3],
                description: r[6],
                imgUrl: r[7],
                price: utils.formatUnits(r[9], "ether")
            }
        })
        setPropertiesList(items)

        const myRentals = [];
        await Promise.all(rentals.map(async (r) => {
            let _rentalBookings = await AirbnbContract.getRentalBookings(Number(r[0]))

            let myBookings = _rentalBookings.filter(
                (b) => b[0] == data.account
            )
            if (myBookings.length !== 0) {
                const latestBook = myBookings[0]
                const item = {
                    id: Number(r[0]),
                    name: r[2],
                    city: r[3],
                    imgUrl: r[7],
                    startDate: new Date(Number(latestBook[1]) * 1000),
                    endDate: new Date(Number(latestBook[2]) * 1000),
                    price: utils.formatUnits(r[9], "ether")
                }
                myRentals.push(item);
            }
        }))
        setRentalsList(myRentals)
    }

    useEffect(() => {
        getRentalsList()
    }, [data.account])

    return (
        <>
            <div className="topBanner">
                <div>
                    <Link to="/">
                        <img className="logo" src={logo} alt="logo"></img>
                    </Link>
                </div>
                <div className="lrContainers">
                    <Account />
                </div>
            </div>

            <hr className="line" />
            <div className="rentalsContent">
                <div className="rentalsContentL">
                    <h3 style={{ textAlign: "center" }}>Your properties</h3>
                    {propertiesList.length !== 0 ? (
                        propertiesList.map((e, i) => {
                            return (
                                <>
                                    <hr className="line2" />
                                    <div className="rentalDiv" key={i}>
                                        <img className="rentalImg" src={e.imgUrl}></img>
                                        <div className="rentalInfo">
                                            <div className="rentalTitle">
                                                {e.name}
                                            </div>
                                            <div className="rentalDesc">
                                                in {e.city}
                                            </div>
                                            <div className="rentalDesc">
                                                {e.description}
                                            </div>
                                            <br />
                                            <br />
                                            <div className="price">
                                                {e.price}$
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: "center", paddingTop: "30%" }}>
                            <p>You have no properties listed</p>
                        </div>
                    )
                    }
                    <div style={{ textAlign: "center", paddingTop: "15px" }}>
                        <a className="btn btn-danger" href={"/add-rental"} role="button">Add rental</a>
                    </div>

                </div>
                <div className="rentalsContentL">
                    <h3 style={{ textAlign: "center" }}>Your rentals</h3>
                    {rentalsList.length !== 0 ? (
                        rentalsList.map((e, i) => {
                            return (
                                <>
                                    <hr className="line2" />
                                    <div className="rentalDiv" key={i}>
                                        <img className="rentalImg" src={e.imgUrl}></img>
                                        <div className="rentalInfo">
                                            <div className="rentalTitle">
                                                {e.name}
                                            </div>
                                            <div className="rentalDesc">
                                                in {e.city}
                                            </div>
                                            <div className="rentalDesc">
                                                Booked dates:
                                                {` ${e.startDate.toLocaleString("default", {
                                                    month: "short",
                                                })} ${e.startDate.toLocaleString("default", {
                                                    day: "2-digit",
                                                })}  -  ${e.endDate.toLocaleString("default", {
                                                    month: "short",
                                                })}  ${e.endDate.toLocaleString("default", {
                                                    day: "2-digit",
                                                })} `}
                                            </div>
                                            <br />
                                            <br />
                                            <div className="price">
                                                {e.price}$
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: "center", paddingTop: "30%" }}>
                            <p>You have no reservation yet</p>
                        </div>

                    )
                    }
                </div>
            </div>
        </>
    );
};

export default Dashboard;
