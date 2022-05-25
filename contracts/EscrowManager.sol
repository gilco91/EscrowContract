// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

pragma experimental ABIEncoderV2;

contract Escrow {
    address payable public buyer;
    address payable public seller;
    uint256 public buyerAmount;
    uint256 public sellerAmount;
    uint256 public totalAmount;
    uint256 public deployTime;
    uint256 public expiredTime = 0;
    uint256 public index;
    uint256 public balanceCheck;

    EscrowManager parentContract;

    event TotalAmount(uint256 amount);

    constructor(
        EscrowManager _parentContract,
        address payable _seller,
        address payable _buyer,
        uint256 _buyerAmount,
        uint256 _sellerAmount,
        uint256 _index,
        uint256 _expiredTime
    ) public {
        parentContract = _parentContract;
        seller = _seller;
        buyer = _buyer;
        buyerAmount = _buyerAmount;
        sellerAmount = _sellerAmount;
        expiredTime = _expiredTime;
        deployTime = block.timestamp;
        index = _index;
    }

    //when the item receive the money he should send it back to the item manager for sombody can withdraw the item later
    //we sending only money without ang data
    receive() external payable {
        require(
            (msg.sender == seller && msg.value == sellerAmount) ||
                (msg.sender == buyer && msg.value == buyerAmount),
            "You are not allowed OR you try to send unsuitable funds"
        );
        totalAmount += msg.value;
        balanceCheck = address(this).balance;
        emit TotalAmount(totalAmount);
        parentContract.triggerPayment(index, msg.sender);

        // (bool success,)=address(parentContract).call{value :msg.value}(abi.encodeWithSignature("triggerPayment(uint256,address)",index,msg.sender));
        // require(success,"The transaction wasnt successful, canceling");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //pivot 1 = seller paid, pivot 2 = buyer paid, pivot 3 = seller and puyer paid
    function moneyRetur(uint256 pivot) public {
        if (pivot == 1) {
            require(
                address(this).balance >= sellerAmount,
                "You have not money enough money in the contract! (pivot 1)"
            );
            seller.transfer(sellerAmount);
        } else if (pivot == 2) {
            require(
                address(this).balance >= buyerAmount,
                "You have not money enough money in the contract! (pivot 2)"
            );
            buyer.transfer(buyerAmount);
        } else {
            require(
                address(this).balance >= buyerAmount + sellerAmount,
                "You have not money enough money in the contract! (pivot 3)"
            );
            seller.transfer(sellerAmount);
            buyer.transfer(buyerAmount);
        }
    }

    fallback() external {}
}

contract EscrowManager {
    uint256 my_number;

    struct EscrowStruct {
        Escrow _escrow;
        bool _buyerPaid;
        bool _sellerPaid;
        bool buyerConfirmed;
        bool sellerConfirmed;
        EscrowManager.tradeState _state;
    }
    enum tradeState {
        Created,
        Paid,
        Confirmed,
        Canceld
    }

    mapping(uint256 => EscrowStruct) public trades;

    // uint256 tradeIndex;
    event TradeStep(
        uint256 _tradeIndex,
        uint256 _step,
        address _tradeAddress,
        uint256 contractBalance
    );
    event ViewTrade(
        uint256 _tradeIndex,
        uint256 _step,
        address _tradeAddress,
        uint256 contractBalance,
        address _sellerAddress,
        address _buyerAddress,
        bool _sellerPaid,
        bool _buyerPaid,
        bool sellerConfirmed,
        bool buyerConfirmed
    );

    function createTrade(
        uint256 tradeIndex,
        address payable seller,
        address payable buyer,
        uint256 sellerAmount,
        uint256 buyerAmount,
        uint256 expiredTime
    ) public payable returns (string memory) {
        Escrow escrow = new Escrow(
            this,
            seller,
            buyer,
            buyerAmount,
            sellerAmount,
            tradeIndex,
            expiredTime
        );
        trades[tradeIndex]._escrow = escrow;
        trades[tradeIndex]._state = tradeState.Created;
        emit TradeStep(
            tradeIndex,
            uint256(trades[tradeIndex]._state),
            address(trades[tradeIndex]._escrow),
            trades[tradeIndex]._escrow.getBalance()
        );
        // tradeIndex++;

        return "This is a test";
    }

    function triggerPayment(uint256 _tradeIndex, address sender) public {
        //payable
        require(
            trades[_tradeIndex]._state == tradeState.Created,
            "Escrow is further in the chain"
        );
        if (trades[_tradeIndex]._escrow.buyer() == sender) {
            trades[_tradeIndex]._buyerPaid = true;
        }
        if (trades[_tradeIndex]._escrow.seller() == sender) {
            trades[_tradeIndex]._sellerPaid = true;
        }
        if (
            trades[_tradeIndex]._buyerPaid == true &&
            trades[_tradeIndex]._sellerPaid == true
        ) {
            trades[_tradeIndex]._state = tradeState.Paid;
        }
        emit TradeStep(
            _tradeIndex,
            uint256(trades[_tradeIndex]._state),
            address(trades[_tradeIndex]._escrow),
            trades[_tradeIndex]._escrow.getBalance()
        );
    }

    //Get  escrow balance by ID
    function getBalanceEscrow(uint256 _tradeIndex)
        public
        payable
        returns (uint256 money)
    {
        emit TradeStep(
            _tradeIndex,
            uint256(trades[_tradeIndex]._state),
            address(trades[_tradeIndex]._escrow),
            trades[_tradeIndex]._escrow.getBalance()
        );
        return address(trades[_tradeIndex]._escrow).balance;
    }

    function getBalance() public view returns (uint256 money) {
        return address(this).balance;
    }

    // trades[_tradeIndex]._escrow.index

    function getTradeById(uint256 _tradeIndex)
        public
        payable
        returns (EscrowStruct memory)
    {
        emit ViewTrade(
            _tradeIndex,
            uint256(trades[_tradeIndex]._state),
            address(trades[_tradeIndex]._escrow),
            trades[_tradeIndex]._escrow.getBalance(),
            trades[_tradeIndex]._escrow.seller(),
            trades[_tradeIndex]._escrow.buyer(),
            trades[_tradeIndex]._sellerPaid,
            trades[_tradeIndex]._buyerPaid,
            trades[_tradeIndex].sellerConfirmed,
            trades[_tradeIndex].buyerConfirmed
        );
        return trades[_tradeIndex];
    }

    //pivot 1 = seller paid, pivot 2 = buyer paid, pivot 3 = seller and puyer paid
    function setAgreement(uint256 _index) public payable {
        require(checkExpiry(_index), "The contract has expired!");
        require(
            trades[_index]._state == tradeState.Created ||
                trades[_index]._state == tradeState.Paid,
            "Escrow is further in the chain"
        );

        if (trades[_index]._escrow.getBalance() > 0) {
            if (
                trades[_index]._buyerPaid == true &&
                trades[_index]._sellerPaid == true
            ) {
                // pivot 3 = bouth sides paids
                require(
                    trades[_index]._state == tradeState.Paid,
                    "Escrow is further in the chain"
                );

                trades[_index]._state = tradeState.Confirmed;
                trades[_index].buyerConfirmed = true;
                trades[_index].sellerConfirmed = true;
                trades[_index]._escrow.moneyRetur(3);
            } else {
                if (trades[_index]._sellerPaid) {
                    // pivot 1 = only seller paid
                    trades[_index]._state = tradeState.Canceld;
                    trades[_index]._escrow.moneyRetur(1);
                } else {
                    // pivot 2 = only buyer paid
                    trades[_index]._state = tradeState.Canceld;
                    trades[_index]._escrow.moneyRetur(2);
                }
            }
        }
    }

    function checkExpiry(uint256 _index) public view returns (bool success) {
        // uint256 days_left = trades[_index]._escrow.expiredTime();

        if (trades[_index]._escrow.expiredTime()>block.timestamp

            // trades[_index]._escrow.deployTime() + (days_left) * (1 days) >
            // block.timestamp
        ) {
            return true;
        } else {
            return false;
        }
    }
}
