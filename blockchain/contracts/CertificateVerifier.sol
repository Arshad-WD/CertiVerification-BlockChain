// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateVerifier is Ownable {

    struct Certificate {
        bytes32 contentHash;
        address issuer;
        uint256 timestamp;
        bool isValid;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bool) public authorizedIssuers;

    uint256 public totalIssued;
    uint256 public totalRevoked;

    event CertificateIssued(
        bytes32 indexed hash, 
        address indexed issuer, 
        string name, 
        string title, 
        string cid, 
        uint256 timestamp
    );
    event CertificateRevoked(bytes32 indexed hash);
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);

    constructor() Ownable(msg.sender) {
        authorizedIssuers[msg.sender] = true;
    }

    function addIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = true;
        emit IssuerAdded(_issuer);
    }

    function removeIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = false;
        emit IssuerRemoved(_issuer);
    }

    function issueCertificate(
        bytes32 _contentHash, 
        string memory _name, 
        string memory _title, 
        string memory _cid
    ) external {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Caller not authorized"
        );
        require(certificates[_contentHash].timestamp == 0, "Exists");

        certificates[_contentHash] = Certificate({
            contentHash: _contentHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isValid: true
        });

        totalIssued++;

        emit CertificateIssued(_contentHash, msg.sender, _name, _title, _cid, block.timestamp);
    }

    function revokeCertificate(bytes32 _contentHash) external {
        require(
            authorizedIssuers[msg.sender] || msg.sender == owner(),
            "Caller not authorized"
        );
        require(certificates[_contentHash].timestamp != 0, "Not found");
        require(
            msg.sender == certificates[_contentHash].issuer || msg.sender == owner(),
            "Unauthorized"
        );

        certificates[_contentHash].isValid = false;
        totalRevoked++;
        emit CertificateRevoked(_contentHash);
    }

    function verifyCertificate(bytes32 _contentHash) external view returns (
        bool exists,
        bool valid,
        address issuer,
        uint256 timestamp
    ) {
        Certificate memory cert = certificates[_contentHash];
        exists = cert.timestamp != 0;
        valid = cert.isValid;
        issuer = cert.issuer;
        timestamp = cert.timestamp;
    }
}
