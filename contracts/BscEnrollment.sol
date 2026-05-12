// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Ownable2StepUpgradeable} from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title BscEnrollment
 * @notice Minimal UUPS upgradeable contract demonstrating enrollment activity on BNB Smart Chain.
 * @dev Intended as a DappBay-ready reference: two-step ownership, pausable user actions, explicit upgrade authorization.
 */
contract BscEnrollment is
    Initializable,
    Ownable2StepUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    /// @notice Human-readable deployment / upgrade label (not a security boundary).
    string public version;

    event Enrolled(address indexed account, uint256 timestamp);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @param initialOwner Address that will own the proxy (two-step transfer supported).
     * @param initialVersion Initial version string stored on-chain.
     */
    function initialize(address initialOwner, string calldata initialVersion) external initializer {
        __Ownable_init(initialOwner);
        __Ownable2Step_init();
        __Pausable_init();
        version = initialVersion;
    }

    /// @notice Records an enrollment from the caller while the contract is not paused.
    function enroll() external whenNotPaused {
        emit Enrolled(msg.sender, block.timestamp);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    uint256[50] private __gap;
}
