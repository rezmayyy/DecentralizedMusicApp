pragma solidity ^0.8.0;

contract MyTunes {
    uint public nextSongId;
    address public owner;

    constructor() {
        owner = msg.sender;
        nextSongId = 1;
    }

    // Song info
    struct Song {
        uint id;
        string title;
        uint price; 
        string ipfsHash;
        address artist;
        address[] contributors;
        uint[] splits; 
    }

    // songId => Song
    mapping(uint => Song) public songs;

    // user => songId => purchased
    mapping(address => mapping(uint => bool)) public hasPurchased;

    // address => earnings
    mapping(address => uint) public balances;

    // Upload Song
    function uploadSong(
        string memory _title,
        uint _price,
        string memory _ipfsHash,
        address[] memory _contributors,
        uint[] memory _splits
    ) public {
        require(_contributors.length == _splits.length, "Contributors and splits mismatch");

        uint totalSplit = 0;
        for (uint i = 0; i < _splits.length; i++) {
            totalSplit += _splits[i];
        }
        require(totalSplit <= 100, "Total split must be <= 100");

        Song storage song = songs[nextSongId];
        song.id = nextSongId;
        song.title = _title;
        song.price = _price;
        song.ipfsHash = _ipfsHash;
        song.artist = msg.sender;
        song.contributors = _contributors;
        song.splits = _splits;

        nextSongId++;
    }

    // Purchase Song
    function purchaseSong(uint _songId) public payable {
        Song storage song = songs[_songId];
        require(bytes(song.ipfsHash).length > 0, "Song does not exist");
        require(msg.value == song.price, "Incorrect payment");
        require(!hasPurchased[msg.sender][_songId], "Already purchased");

        hasPurchased[msg.sender][_songId] = true;

        uint remaining = msg.value;

        // Distribute to contributors
        for (uint i = 0; i < song.contributors.length; i++) {
            uint share = (msg.value * song.splits[i]) / 100;
            balances[song.contributors[i]] += share;
            remaining -= share;
        }

        // Remaining to main artist
        balances[song.artist] += remaining;
    }

    // Withdraw Funds
    function withdrawFunds() public {
        uint amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    // Verify Purchase
    function verifyPurchase(uint _songId, address _buyer) public view returns (bool) {
        return hasPurchased[_buyer][_songId];
    }

    // Get Song Details
    function getSongDetails(uint _songId)
        public
        view
        returns (
            string memory title,
            uint price,
            string memory ipfsHash,
            address artist,
            address[] memory contributors,
            uint[] memory splits
        )
    {
        Song storage song = songs[_songId];
        return (
            song.title,
            song.price,
            song.ipfsHash,
            song.artist,
            song.contributors,
            song.splits
        );
    }
}
