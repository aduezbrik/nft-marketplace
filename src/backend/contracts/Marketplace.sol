// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    struct Item {
        uint256 itemId;
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool sold;
    }

    address payable public immutable feeAccount;
    uint256 public immutable feePercent;
    uint256 public itemCount;

    mapping(uint256 => Item) public items;

    event Offered(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller
    );

    event Bought(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    constructor(uint256 _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(
        IERC721 _nft,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");

        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function purchaseItem(uint256 _itemId) external payable nonReentrant {
        require(_itemId > 0 && _itemId <= itemCount, "Item doesn't exist");

        uint256 _totalPrice = getTotalPrice(_itemId);
        require(
            msg.value >= _totalPrice,
            "Not enough ether to cover item price and market fee"
        );

        Item storage item = items[_itemId];
        require(!item.sold, "Item already sold");

        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);

        item.sold = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function getTotalPrice(uint256 _itemId) public view returns (uint256) {
        return (items[_itemId].price * (100 + feePercent)) / 100;
    }
}
