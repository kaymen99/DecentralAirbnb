<div id="top"></div>

<!-- ABOUT THE PROJECT -->
## Decentral AirBnb

This is a decentralized web3.0 version of the AirBnb renting website built for EVM compatible blockchains(Ethereum, Polygon,...), it was inspired by the Moralis project ["Build Web 3.0 AirBNB Clone Using web3uikit, React, Moralis and Solidity - Full-Stack Blockchain App"](https://www.youtube.com/watch?v=rj-Mb-xz1Os&t=2443s)
 <p align="center">
  <img alt="Dark" src="https://user-images.githubusercontent.com/83681204/168179025-3a57abf4-e18b-45c2-a759-4e43fc293f3d.png" width="100%">
</p>
 
### Built With

* [Solidity](https://docs.soliditylang.org/)
* [Hardhat](https://hardhat.org/getting-started/)
* [React.js](https://reactjs.org/)
* [ethers.js](https://docs.ethers.io/v5/)
* [web3modal](https://github.com/Web3Modal/web3modal)
* [material ui](https://mui.com/getting-started/installation/)


<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
       <li><a href="#prerequisites">Prerequisites</a></li>
       <li><a href="#project-structure">Project structure</a></li>
       <li><a href="#initial-setup">Initial Setup</a></li>
      </ul>
    </li>
    <li>
      <a href="#how-it-works">How it Works</a>
     <ul>
       <li><a href="#contracts">Contracts</a></li>
       <li><a href="#user-interface">User interface</a></li>
      </ul>
    </li>
    <li>
      <a href="#how-to-use">How to Use</a>
    </li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Please install or have installed the following:
* [nodejs](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/en/)
* [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) Chrome extension installed in your browser
* [Ganache](https://trufflesuite.com/ganache/) for local smart contracts deployement and testing

### Project structure

This a full stack web3 decentralized application built using Hardhat/React js, so the project is devided into 2 main parts:
<ul>
 <li><b>Smart contract/backend side:</b></li>
 Located in the hardhat folder, it contains the blockchain developement envirenoment built using Hardhat, with all the smart contracts tests, deployement scripts and the plugins used (chainlink). 
  <li><b>front-end side:</b></li>
The code for the UI can be found in the src folder (as in all reactjs apps)
</ul>

### Initial Setup
1. Clone the repository and install all the required packages by running:
   ```sh
   git clone https://github.com/Aymen1001/DecentralAirbnb.git
   cd DecentralAirbnb
   yarn
   ```
2. Start the ganache network and export the private key of the first account to the hardhat.config.js file in the hardhat folder, it will be used as admin for deploying the Airbnb contract:
   ```sh
   ganache: {
      url: "http://127.0.0.1:7545",
      accounts: ["ganahce-private-key"]
    }
   ```
3. Get the Google maps api-key (it's free) [here](https://developers.google.com/maps/documentation/embed/get-api-key) and add it to the src/component/RentalsMap.js file:
   ```sh
    export default GoogleApiWrapper({
          apiKey: "api_key",
    })(RentalsMap);
   ```
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Working EXAMPLES -->
## How it Works

### contracts

The is built around the DecentralAirbnb.sol contract, which contains all the app logic and has the following features:

<h4>Core functions:</h4>
<ul>
  <li><b>addRental:</b> allow any user to add it's property on the rentals listing by paying a small fee</li>
  <li><b>bookDates:</b> given the vacation start and end dates, it book a reservation if the rantal is available</li>
  <li><b>chackIfBooked:</b> verify if a given rental is booked for the user dates</li>
</ul>

<h4>Admin functions: (admin is the only one that can call this functions)</h4>
<ul>
  <li><b>changeListingFee:</b> change the fee charged when adding new rental</li>
  <li><b>withdrawBalance:</b> the admin is able to withdraw th contract balance which is accumulated from the charged listing fee</li>
</ul>
<h4>ChainLink price feed:</h4>

As ETH or MATIC is a volatile currencies, the user need to set the renting price in $ and this price is converted using chainlink price feeds when a user is excuting the booking transaction.


### User interface
The app allows users to rent any place in the world and pay in crypto, it's structured in 4 pages:

* The home page is the landing page of the app, By entering the city, the duration of the holiday and the number of guest the user is able to check all the available properties and can compare their prices, and the different facilities.

* The Rentals page is where the user is redirected after entering the holiday information, it contains a list of all the properties that match the user 
requirements, and also shows the location of these on a map provided by Google-maps

![Capture d’écran 2022-05-12 à 23 16 45](https://user-images.githubusercontent.com/83681204/168185991-4dfd9476-e905-4ae0-bf85-cc84397db436.png)

* Each user has their own Dashboard, it can be accessed by clicking on the account button in the top of the page, this dashboard shows all the user properites listed for renting and the reservations he has booked.

![Capture d’écran 2022-05-12 à 23 18 10](https://user-images.githubusercontent.com/83681204/168186740-54ce2a06-8c8d-4a85-89dc-4c205ef2d33c.png)

* In the Dashboard page there is a button "Add rental", which redirect the user to the AddRental page where he can list a new rental by providing a set of metadata (property name, city, latitude, longitude, description, maximum number of guests, rent price per day in $), note that it's really important to give the exact property (latitude, longitude) as they are later user to shows the location on the Google map

![Capture d’écran 2022-05-12 à 23 15 13](https://user-images.githubusercontent.com/83681204/168187290-846d2123-3bb0-49fb-90b1-74a96fec1b88.png)


<p align="right">(<a href="#top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## How to Use

After going through all the installation and setup steps, you'll need to deploy the smart contract to the ganache network by running: 
   ```sh
   cd hardhat
   npx hardhat run scripts/deploy-airbnb.js --network ganache
   ```
This will create a config.js file and an artifacts folder and transfer them to the src folder to enable the interaction between the contract and the UI

If you want to test the functionnalities of the DecentralAirbnb contract you can run:
   ```sh
   npx hardhat test
   ```
To start the app you have to go back to the DecentralAirbnb folder and run the command:
   ```sh
   yarn start
   ```
   
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- FUTURE DEVELOPEMENT -->
## Furue developements

* Currently the only way to get the listed rantals is through getRentalList function, which is really inconvenient if a user want to filter rentals by owner, number of guests or price. So it's better to <b>create a subgraph API based on the emitted events</b> thus allowing quick access to the differnet requests.

* Perfom contracts audit using known tools such as slither.
   
<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Contact -->
## Contact

If you have any question or problem running this project just contact me: aymenMir1001@gmail.com

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

