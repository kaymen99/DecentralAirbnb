// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./PriceConverter.sol";

contract DecentralAirbnb is PriceConverter {
    //--------------------------------------------------------------------
    // VARIABLES

    address public admin;

    uint256 public listingFee;
    uint256 private _rentalIds;

    struct RentalInfo {
        uint256 id;
        address owner;
        string name;
        string city;
        string latitude;
        string longitude;
        string description;
        string imgUrl;
        uint256 maxNumberOfGuests;
        uint256 pricePerDay;
    }

    struct Booking {
        address renter;
        uint256 fromTimestamp;
        uint256 toTimestamp;
    }

    RentalInfo[] public rentals;

    mapping(uint256 => Booking[]) rentalBookings;

    //--------------------------------------------------------------------
    // EVENTS

    event NewRentalCreated(
        uint256 id,
        address owner,
        string name,
        string city,
        string latitude,
        string longitude,
        string description,
        string imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        uint256 timestamp
    );

    event NewBookAdded(
        uint256 rentalId,
        address renter,
        uint256 bookDateStart,
        uint256 bookDateEnd,
        uint256 timestamp
    );

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin Can Call This");
        _;
    }

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(uint256 _listingFee, address _priceFeedAddress) {
        admin = msg.sender;
        listingFee = _listingFee;
        priceFeedAddress = _priceFeedAddress;
    }

    //--------------------------------------------------------------------
    // FUNCTIONS

    function addRental(
        string memory _name,
        string memory _city,
        string memory _latitude,
        string memory _longitude,
        string memory _description,
        string memory _imgUrl,
        uint256 _maxGuests,
        uint256 _pricePerDay
    ) public payable {
        require(msg.value == listingFee, "must pay exact listing fee");
        uint256 _rentalId = _rentalIds;

        RentalInfo memory _rental = RentalInfo(
            _rentalId,
            msg.sender,
            _name,
            _city,
            _latitude,
            _longitude,
            _description,
            _imgUrl,
            _maxGuests,
            _pricePerDay
        );

        rentals.push(_rental);
        _rentalIds++;

        emit NewRentalCreated(
            _rentalId,
            msg.sender,
            _name,
            _city,
            _latitude,
            _longitude,
            _description,
            _imgUrl,
            _maxGuests,
            _pricePerDay,
            block.timestamp
        );
    }

    function bookDates(
        uint256 _id,
        uint256 _fromDateTimestamp,
        uint256 _toDateTimestamp
    ) public payable {
        require(_id < _rentalIds, "wrong rental id");

        RentalInfo memory _rental = rentals[_id];

        uint256 bookingPeriod = (_toDateTimestamp - _fromDateTimestamp) /
            1 days;
        // can't book 0 days
        require(bookingPeriod >= 1, "Invalid Booking Period");
        
        uint256 _amount = convertFromUSD(_rental.pricePerDay) * bookingPeriod;

        require(msg.value == _amount, "insuffisant amount");
        require(
            !checkIfBooked(_id, _fromDateTimestamp, _toDateTimestamp),
            "already booked for given dates"
        );

        rentalBookings[_id].push(
            Booking(msg.sender, _fromDateTimestamp, _toDateTimestamp)
        );

        payable(_rental.owner).transfer(msg.value);

        emit NewBookAdded(
            _id,
            msg.sender,
            _fromDateTimestamp,
            _toDateTimestamp,
            block.timestamp
        );
    }

    function checkIfBooked(
        uint256 _id,
        uint256 _fromDateTimestamp,
        uint256 _toDateTimestamp
    ) internal view returns (bool) {
        require(_id < _rentalIds, "Wrong rental id");

        Booking[] memory _rentalBookings = rentalBookings[_id];

        // Make sure the rental is available in the booking dates
        for (uint256 i = 0; i < _rentalBookings.length; i++) {
            if (
                (_fromDateTimestamp >= _rentalBookings[i].fromTimestamp) ||
                (_fromDateTimestamp <= _rentalBookings[i].toTimestamp) ||
                (_toDateTimestamp >= _rentalBookings[i].fromTimestamp) ||
                (_toDateTimestamp <= _rentalBookings[i].toTimestamp)
            ) {
                return true;
            }
        }
        return false;
    }

    function getRentals() public view returns (RentalInfo[] memory) {
        return rentals;
    }

    // Return the list of booking for a given rental
    function getRentalBookings(uint256 _id)
        public
        view
        returns (Booking[] memory)
    {
        require(_id < _rentalIds, "Wrong rental id");
        return rentalBookings[_id];
    }

    function getRentalInfo(uint256 _id)
        public
        view
        returns (RentalInfo memory)
    {
        require(_id < _rentalIds, "Wrong rental id");
        return rentals[_id];
    }

    // ADMIN FUNCTIONS

    function changeListingFee(uint256 _newFee) external onlyAdmin {
        listingFee = _newFee;
    }

    function withdrawBalance() external onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

