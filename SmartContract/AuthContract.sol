// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13; // Updated to match ConvertStuff's pragma

contract AuthContract {
    event Authenticated(address indexed user);

    function authenticate(address user, string memory challenge, string memory signature) external {
        // Verify signature on-chain
        bytes32 messageHash = keccak256(abi.encodePacked(challenge));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = recoverSigner(ethSignedMessageHash, signature);
        require(signer == user, "Signature mismatch");
        emit Authenticated(user);
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, string memory _signature) internal pure returns (address) {
        // Convert hex string to bytes and recover signer
        bytes memory sigBytes = hexStringToBytes(_signature);
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(sigBytes);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    function hexStringToBytes(string memory _hex) internal pure returns (bytes memory) {
        bytes memory hexBytes = bytes(_hex);
        uint256 len = hexBytes.length;
        // Skip '0x' prefix if present
        uint256 start = (len >= 2 && hexBytes[0] == bytes1('0') && hexBytes[1] == bytes1('x')) ? 2 : 0;
        require((len - start) % 2 == 0, "Invalid hex string length");
        uint256 resultLength = (len - start) / 2;
        bytes memory result = new bytes(resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            uint256 pos = start + i * 2;
            // Convert two hex characters to a byte
            uint8 highNibble = numberFromAscII(hexBytes[pos]);
            uint8 lowNibble = numberFromAscII(hexBytes[pos + 1]);
            result[i] = bytes1(uint8(highNibble * 16 + lowNibble));
        }
        return result;
    }

    function numberFromAscII(bytes1 b) private pure returns (uint8 res) {
        if (b >= bytes1("0") && b <= bytes1("9")) {
            return uint8(b) - uint8(bytes1("0"));
        } else if (b >= bytes1("A") && b <= bytes1("F")) {
            return 10 + uint8(b) - uint8(bytes1("A"));
        } else if (b >= bytes1("a") && b <= bytes1("f")) {
            return 10 + uint8(b) - uint8(bytes1("a"));
        }
        revert("Invalid hex char");
    }
}