// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

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
    // ERRORS

    error DecentralAirbnb__OnlyAdmin();
    error DecentralAirbnb__InvalidFee();
    error DecentralAirbnb__InvalidRentalId();
    error DecentralAirbnb__InvalidBookingPeriod();
    error DecentralAirbnb__AlreadyBooked();
    error DecentralAirbnb__InsufficientAmount();
    error DecentralAirbnb__TransferFailed();

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier onlyAdmin() {
        if(msg.sender != admin) revert DecentralAirbnb__OnlyAdmin();
        _;
    }

    modifier isRental(uint _id) {
        if(_id >= _rentalIds) revert DecentralAirbnb__InvalidRentalId();
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
    ) external payable {
        if(msg.value != listingFee) revert DecentralAirbnb__InvalidFee();
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
    ) external payable isRental(_id) {

        RentalInfo memory _rental = rentals[_id];

        uint256 bookingPeriod = (_toDateTimestamp - _fromDateTimestamp) /
            1 days;
        // can't book less than 1 day
        if(bookingPeriod < 1) revert DecentralAirbnb__InvalidBookingPeriod();
        
        uint256 _amount = convertFromUSD(_rental.pricePerDay) * bookingPeriod;

        if(msg.value != _amount) revert DecentralAirbnb__InsufficientAmount();
        if(checkIfBooked(_id, _fromDateTimestamp, _toDateTimestamp)) revert DecentralAirbnb__AlreadyBooked();

        rentalBookings[_id].push(
            Booking(msg.sender, _fromDateTimestamp, _toDateTimestamp)
        );

        (bool success,) = payable(_rental.owner).call{value: msg.value}("");
        if (!success) revert DecentralAirbnb__TransferFailed();

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

        Booking[] memory _rentalBookings = rentalBookings[_id];

        // Make sure the rental is available for the booking dates
        for (uint256 i = 0; i < _rentalBookings.length;) {
            if (
                ((_fromDateTimestamp >= _rentalBookings[i].fromTimestamp) &&
                    (_fromDateTimestamp <= _rentalBookings[i].toTimestamp)) ||
                ((_toDateTimestamp >= _rentalBookings[i].fromTimestamp) &&
                    (_toDateTimestamp <= _rentalBookings[i].toTimestamp))
            ) {
                return true;
            }
            unchecked {
                ++i;
            }
        }
        return false;
    }

    function getRentals() external view returns (RentalInfo[] memory) {
        return rentals;
    }

    // Return the list of booking for a given rental
    function getRentalBookings(uint256 _id)
        external
        view
        isRental(_id)
        returns (Booking[] memory)
    {
        return rentalBookings[_id];
    }

    function getRentalInfo(uint256 _id)
        external
        view
        isRental(_id)
        returns (RentalInfo memory)
    {
        return rentals[_id];
    }

    // ADMIN FUNCTIONS

    function changeListingFee(uint256 _newFee) external onlyAdmin {
        listingFee = _newFee;
    }

    function withdrawBalance() external onlyAdmin {
        (bool success,) = payable(admin).call{value: address(this).balance}("");
        if (!success) revert DecentralAirbnb__TransferFailed();
    }
}
