// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Patreon is Initializable, OwnableUpgradeable {

    event NewSupport(address indexed from, uint256 timestamp, string name, string message);
    struct Support { 
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    Support[] _supports;
    uint256[49] __gap;

    function initialize() public initializer {
        __Ownable_init();
    }

    /**
     * @dev fetches all stored supports
     */
    function getSupports() public view returns (Support[] memory) {
        return _supports;
    }

    /**
     * @dev sends an ETH tip and leave a support
     * @param _name name of the supporter
     * @param _message the support message
     */
    function sendSupport(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Support donation must be higher 0.");
        _supports.push(Support(msg.sender, block.timestamp, _name, _message));
        emit NewSupport(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev sends the entire balance stored in this contract to the owner
     */
    function withdrawSupports() public onlyOwner {
        require(payable(owner()).send(address(this).balance));
    }
}
