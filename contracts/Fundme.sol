// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; // use yarn add --dev @chainlink/contracts
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
mapping(address => uint256) public addressToAmountFunded;
address[] public funders;
using PriceConverter for uint256;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface public priceFeed; //Matching AggregatorV3Interface ABI with a modular contract address gives you the ability to interact with a contract

    constructor(address priceFeedAddress) {
        i_owner = msg.sender; //updates the owner funtion so
        priceFeed = AggregatorV3Interface(priceFeedAddress); //here we create add our pricefeed adress so we can interact with the contract
    }

    function fund() public payable {
        require(msg.value.getConversionRate(priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");  //because it is a library msg.value already fills  the first parameter
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    // function getVersion() public view returns (uint256){
    //     AggregatorV3Interface priceFeedVersion  = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    //     return priceFeed .version();
    // }

    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    function withdraw() payable onlyOwner public {
        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
}

//explained at 10:27
// gas optimizations