const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getAmountInWei, getAmountFromWei } = require("../utils/helper-scripts");

describe("DecentralAirbnb.sol", () => {
  let contractFactory;
  let contract;
  var mockAddress;
  let admin;
  let adminAddress;
  let user1;
  let user2;
  let dayToSeconds = 86400;
  let listingFee = getAmountInWei(0.001);

  const DECIMALS = "8";
  const INITIAL_PRICE = "200000000000";

  const testRentalName = "SKY VIEW STUDIO CLOSE TO CENTRAL PARK";
  const testRentalCity = "NEW YORK";
  const testRentalLatitude = "10";
  const testRentalLongitude = "10";
  const testRentaldescription = "2 guests · 1 bedroom · 1 bed · 1 bath";
  const testRentalImageURL = "https://testipfsimageurl";
  const testRentalGuestNumber = 2;
  const testRentalPricePerDay = getAmountInWei(100); // 100$

  beforeEach(async () => {
    [admin, user1, user2] = await ethers.getSigners();

    // Deploy price feed mock
    const Mock = await hre.ethers.getContractFactory("MockV3Aggregator");
    const mockContract = await Mock.deploy(DECIMALS, INITIAL_PRICE);
    await mockContract.deployed();
    mockAddress = mockContract.address;

    // Deploy DecentralAirbnb contract
    contractFactory = await ethers.getContractFactory("DecentralAirbnb");
    contract = await contractFactory.deploy(listingFee, mockAddress);
    adminAddress = await admin.getAddress();
  });

  describe("Correct Deployement", () => {
    it("should have correct admin address", async () => {
      const contractAdmin = await contract.admin();
      expect(contractAdmin).to.equal(adminAddress);
    });
    it("should have correct listing fee", async () => {
      const fee = await contract.listingFee();
      expect(fee).to.equal(listingFee);
    });
    it("should have the correct price feed address", async () => {
      const priceFeedAddress = await contract.priceFeedAddress();
      expect(priceFeedAddress).to.equal(mockAddress);
    });
  });

  describe("Core Functions", () => {
    it("user should be able to add new rental", async () => {
      await contract
        .connect(user1)
        .addRental(
          testRentalName,
          testRentalCity,
          testRentalLatitude,
          testRentalLongitude,
          testRentaldescription,
          testRentalImageURL,
          testRentalGuestNumber,
          testRentalPricePerDay,
          { value: listingFee }
        );

      const rentalId = 0;
      const rentalsList = await contract.getRentals();
      const userRental = rentalsList[rentalId];

      const contractBalance = await ethers.provider.getBalance(
        contract.address
      );

      expect(contractBalance).to.equal(listingFee);
      expect(rentalsList.length).to.equal(1);
      expect(userRental[0]).to.equal(rentalId);
      expect(userRental[1]).to.equal(user1.address);
      expect(userRental[2]).to.equal(testRentalName);
      expect(userRental[3]).to.equal(testRentalCity);
      expect(userRental[4]).to.equal(testRentalLatitude);
      expect(userRental[5]).to.equal(testRentalLongitude);
      expect(userRental[6]).to.equal(testRentaldescription);
      expect(userRental[7]).to.equal(testRentalImageURL);
      expect(userRental[8]).to.equal(testRentalGuestNumber);
      expect(userRental[9]).to.equal(testRentalPricePerDay);
    });

    it("it should fail by must pay exact listing fee", async () => {
      const wrongListingFee = getAmountInWei(0.0005);
      await expect(
        contract
          .connect(user1)
          .addRental(
            testRentalName,
            testRentalCity,
            testRentalLatitude,
            testRentalLongitude,
            testRentaldescription,
            testRentalImageURL,
            testRentalGuestNumber,
            testRentalPricePerDay,
            { value: wrongListingFee }
          )
      ).to.be.revertedWithCustomError(contract, "DecentralAirbnb__InvalidFee");
    });

    it("user 2 should be able to rent", async () => {
      await contract
        .connect(user1)
        .addRental(
          testRentalName,
          testRentalCity,
          testRentalLatitude,
          testRentalLongitude,
          testRentaldescription,
          testRentalImageURL,
          testRentalGuestNumber,
          testRentalPricePerDay,
          { value: listingFee }
        );

      const rentalId = 0;
      const startDateTimestamp = Math.floor(
        new Date("2022.05.10").getTime() / 1000
      );
      const endDateTimestamp = Math.floor(
        new Date("2022.05.25").getTime() / 1000
      );

      const numberOfDays =
        (endDateTimestamp - startDateTimestamp) / dayToSeconds;
      const rentalInfo = await contract.getRentalInfo(rentalId);
      const totalBookingPriceUSD =
        (numberOfDays * Number(rentalInfo[9])) / 10 ** 18;
      const totalBookingPriceInETH = await contract.convertFromUSD(
        getAmountInWei(totalBookingPriceUSD)
      );

      await contract
        .connect(user2)
        .bookDates(rentalId, startDateTimestamp, endDateTimestamp, {
          value: totalBookingPriceInETH,
        });
      const rentalBookings = await contract.getRentalBookings(rentalId);
      const bookId = 0;
      const user2Booking = rentalBookings[bookId];

      expect(rentalBookings.length).to.equal(1);
      expect(user2Booking[0]).to.equal(user2.address);
      expect(user2Booking[1]).to.equal(startDateTimestamp);
      expect(user2Booking[2]).to.equal(endDateTimestamp);
    });

    it("it should fail by insuffisant amount", async () => {
      await contract
        .connect(user1)
        .addRental(
          testRentalName,
          testRentalCity,
          testRentalLatitude,
          testRentalLongitude,
          testRentaldescription,
          testRentalImageURL,
          testRentalGuestNumber,
          testRentalPricePerDay,
          { value: listingFee }
        );
      const rentalId = 0;
      const startDateTimestamp = Math.floor(
        new Date("2022.05.10").getTime() / 1000
      );
      const endDateTimestamp = Math.floor(
        new Date("2022.05.25").getTime() / 1000
      );

      const numberOfDays =
        (endDateTimestamp - startDateTimestamp) / dayToSeconds;
      const rentalInfo = await contract.getRentalInfo(rentalId);

      // put wrong number of days to get wrong total price
      const totalBookingPrice =
        ((numberOfDays - 1) * Number(rentalInfo[9])) / 10 ** 18;

      await expect(
        contract
          .connect(user2)
          .bookDates(rentalId, startDateTimestamp, endDateTimestamp, {
            value: getAmountInWei(totalBookingPrice),
          })
      ).to.be.revertedWithCustomError(
        contract,
        "DecentralAirbnb__InsufficientAmount"
      );
    });

    it("it should fail by invalid booking period", async () => {
      await contract
        .connect(user1)
        .addRental(
          testRentalName,
          testRentalCity,
          testRentalLatitude,
          testRentalLongitude,
          testRentaldescription,
          testRentalImageURL,
          testRentalGuestNumber,
          testRentalPricePerDay,
          { value: listingFee }
        );
      const rentalId = 0;

      // put same start and end date
      const startDateTimestamp = Math.floor(
        new Date("2022.05.10").getTime() / 1000
      );
      const endDateTimestamp = Math.floor(
        new Date("2022.05.10").getTime() / 1000
      );

      const numberOfDays =
        (endDateTimestamp - startDateTimestamp) / dayToSeconds;

      const rentalInfo = await contract.getRentalInfo(rentalId);

      const totalBookingPrice =
        (numberOfDays * Number(rentalInfo[9])) / 10 ** 18;

      await expect(
        contract
          .connect(user2)
          .bookDates(rentalId, startDateTimestamp, endDateTimestamp, {
            value: getAmountInWei(totalBookingPrice),
          })
      ).to.be.revertedWithCustomError(
        contract,
        "DecentralAirbnb__InvalidBookingPeriod"
      );
    });

    it("it should fail by already booked for given dates", async () => {
      await contract
        .connect(user1)
        .addRental(
          testRentalName,
          testRentalCity,
          testRentalLatitude,
          testRentalLongitude,
          testRentaldescription,
          testRentalImageURL,
          testRentalGuestNumber,
          testRentalPricePerDay,
          { value: listingFee }
        );

      const rentalId = 0;
      const startDateTimestamp = Math.floor(
        new Date("2022.05.10").getTime() / 1000
      );
      const endDateTimestamp = Math.floor(
        new Date("2022.05.25").getTime() / 1000
      );

      const numberOfDays =
        (endDateTimestamp - startDateTimestamp) / dayToSeconds;
      const rentalInfo = await contract.getRentalInfo(rentalId);
      const totalBookingPriceUSD =
        (numberOfDays * Number(rentalInfo[9])) / 10 ** 18;
      const totalBookingPriceInETH = await contract.convertFromUSD(
        getAmountInWei(totalBookingPriceUSD)
      );

      await contract
        .connect(user2)
        .bookDates(rentalId, startDateTimestamp, endDateTimestamp, {
          value: totalBookingPriceInETH,
        });
      const user3 = (await ethers.getSigners())[3];

      const startDateTimestamp_2 = Math.floor(
        new Date("2022.05.12").getTime() / 1000
      );
      const endDateTimestamp_2 = Math.floor(
        new Date("2022.05.14").getTime() / 1000
      );

      const numberOfDays_2 =
        (endDateTimestamp_2 - startDateTimestamp_2) / dayToSeconds;
      const totalBookingPriceUSD_2 =
        (numberOfDays_2 * Number(rentalInfo[9])) / 10 ** 18;
      const totalBookingPriceInETH_2 = await contract.convertFromUSD(
        getAmountInWei(totalBookingPriceUSD_2)
      );

      await expect(
        contract
          .connect(user3)
          .bookDates(rentalId, startDateTimestamp_2, endDateTimestamp_2, {
            value: totalBookingPriceInETH_2,
          })
      ).to.be.revertedWithCustomError(
        contract,
        "DecentralAirbnb__AlreadyBooked"
      );
    });
  });

  describe("Admin Functions", () => {
    it("it should allow admin to change listing fee", async () => {
      const newListingFee = getAmountInWei(0.005);
      await contract.connect(admin).changeListingFee(newListingFee);
      const fee = await contract.listingFee();

      expect(fee).to.equal(newListingFee);
    });

    it("it should transfer contract balance to admin", async () => {
      await contract
        .connect(user1)
        .addRental(
          testRentalName,
          testRentalCity,
          testRentalLatitude,
          testRentalLongitude,
          testRentaldescription,
          testRentalImageURL,
          testRentalGuestNumber,
          testRentalPricePerDay,
          { value: listingFee }
        );
      const previousAdminBalance = await admin.getBalance();
      await contract.connect(admin).withdrawBalance();
      const finalAdminBalance = await admin.getBalance();
      const expectedBalance =
        Number(previousAdminBalance) / 10 ** 18 + Number(listingFee) / 10 ** 18;

      // use only 3 decimals because the withdraw transaction cost some gas
      // so admin previous balance is not the same
      expect(
        parseFloat(getAmountFromWei(finalAdminBalance)).toFixed(3)
      ).to.equal(parseFloat(Number(expectedBalance)).toFixed(3));
    });
  });
});
