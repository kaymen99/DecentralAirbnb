import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddRental.css";
import 'bootstrap/dist/css/bootstrap.css';
import { Link } from "react-router-dom";
import logo from "../images/airbnbRed.png";
import bg from "../images/add-image.jpg";
import { ethers, utils } from "ethers"
import { create } from "ipfs-http-client"
import { Buffer } from "buffer";
import { Form } from "react-bootstrap"
import { Button } from '@mui/material';
import Account from "../components/Account";


import DecentralAirbnb from "../artifacts/contracts/DecentralAirbnb.sol/DecentralAirbnb.json"
import { contractAddress } from "../utils/contracts-config"

const ipfsClient = create("https://ipfs.infura.io:5001/api/v0")
const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/"


const Rentals = () => {
    let navigate = useNavigate();

    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [formInput, setFormInput] = useState({
        name: "",
        city: "",
        latitude: "",
        longitude: "",
        description: "",
        numberGuests: 0,
        pricePerDay: 0,
    });

    const getImage = async (e) => {

        e.preventDefault()
        const reader = new window.FileReader();
        const file = e.target.files[0];

        if (file !== undefined) {
            reader.readAsArrayBuffer(file)

            reader.onloadend = () => {
                const buf = Buffer(reader.result, "base64")
                setImage(buf)
                setImagePreview(file)
            }
        }
    }

    const addRental = async () => {
        if (image !== undefined && window.ethereum !== undefined) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const AirbnbContract = new ethers.Contract(contractAddress, DecentralAirbnb.abi, signer);

                const listingFee = AirbnbContract.callStatic.listingFee()

                const addedFile = await ipfsClient.add(image)
                const imageURI = ipfsBaseUrl + addedFile.path

                const add_tx = await AirbnbContract.addRental(
                    formInput.name,
                    formInput.city,
                    formInput.latitude,
                    formInput.longitude,
                    formInput.description,
                    imageURI,
                    formInput.numberGuests,
                    utils.parseEther(formInput.pricePerDay, "ether"),
                    { value: listingFee }
                )
                await add_tx.wait();

                setImage(null)

                navigate("/dashboard")
            }
            catch (err) {
                window.alert("An error has occured")
                console.log(err)
            }
        }
        else {
            window.alert("Please Install Metamask")
        }
    }

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
            <br />
            <br />
            <div className="addRentalContent">
                <div className="addRentalContentL" style={{ alignItems: "center" }}>
                    <h2 style={{ textAlign: "center" }}>Add your Rental</h2>
                    <br />
                    <Form.Group className="mb-3">
                        <Form.Label>Property name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter rental title"
                            onChange={(e) => { setFormInput({ ...formInput, name: e.target.value }) }} required={true} />
                    </Form.Group>

                    <br />
                    <div>
                        <label>Property City: </label>
                        <Form.Control type="text" maxLength={30} placeholder="Enter your property city" onChange={(e) => { setFormInput({ ...formInput, city: e.target.value }) }} required />
                    </div>
                    <br />
                    <div>
                        <label>Property Latitude: </label>
                        <Form.Control type="text" maxLength={30} placeholder="Enter latitude" onChange={(e) => { setFormInput({ ...formInput, latitude: e.target.value }) }} />
                    </div>
                    <br />
                    <div>
                        <label>Property Longitude: </label>
                        <Form.Control type="text" maxLength={30} placeholder="Enter longitude" onChange={(e) => { setFormInput({ ...formInput, longitude: e.target.value }) }} />
                    </div>
                    <br />
                    <div>
                        <label>Property Description: </label>
                        <Form.Control as="textarea" rows={5} maxLength={200} placeholder="Enter a description of the place" onChange={(e) => { setFormInput({ ...formInput, description: e.target.value }) }} />
                    </div>
                    <br />
                    <div>
                        <label>Max number of guests: </label>
                        <Form.Control type="number" min={1} placeholder="Enter maximu number of guests"
                            onChange={e => setFormInput({ ...formInput, numberGuests: Number(e.target.value) })} />
                    </div>
                    <br />
                    <div>
                        <label>Price per day: </label>
                        <Form.Control type="number" min={0} placeholder="Enter rent price per day in $" onChange={e => setFormInput({ ...formInput, pricePerDay: e.target.value })} />
                    </div>
                    <br />
                    <div >
                        <Form.Control type="file" name="file" onChange={(e) => { getImage(e) }} />
                        <br />
                        {
                            imagePreview && (
                                <div style={{ textAlign: "center" }}>
                                    <img className="rounded mt-4" width="350" src={URL.createObjectURL(imagePreview)} />
                                </div>
                            )
                        }
                    </div>
                    <br />
                    <div style={{ textAlign: "center" }}>
                        <Button type="submit" variant="contained" color="error" onClick={addRental}>
                            Add
                        </Button>
                    </div>
                    <br />
                </div>
                <div className="addRentalContentR">
                    <img src={bg} style={{ height: "65vw", width: "45vw" }} alt="logo"></img>
                </div>
            </div>
        </>
    );
};

export default Rentals;