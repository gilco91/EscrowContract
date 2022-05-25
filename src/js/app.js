$(function () {
  $(window).load(function () {
    App.init();
  });
});

App = {
  params: null,
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    /*

     * Replace me...
     */
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    /*
     * Replace me...
     */
    $.getJSON('EscrowManager.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var EscrowManagerArtifact = data;
      App.contracts.EscrowManager = TruffleContract(EscrowManagerArtifact);

      // Set the provider for our contract
      App.contracts.EscrowManager.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {

    App.params = searchToObject()
    
    console.log(App.params);
    $('#description').text(" " + App.params.description);
    $('#email').text(" " + App.params.email);
    $('#sellerAddress').text(App.params.walletAddressSeller);
    $('#buyerAddress').text(App.params.walletAddressBuyer);
    $('#sellerAmount').text(App.params.depositSeller);
    $('#buyerAmount').text(App.params.depositBuyer);
    $('#expiredTime').text(App.params.date);


    $(document).on('click', '.btn-createTrade', App.creat_Trade);
    $(document).on('click', '.btn-escrowBalance', App.get_TradeById);
    $(document).on('click', '.btn-setAgreement', App.set_Agreement);
  },

  markAdopted: function () {
    /*
     * Replace me...
     */
    var EscrowManagerInstance;

    App.contracts.EscrowManager.deployed().then(function (instance) {
      EscrowManagerInstance = instance;


      // {
      //   $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
      // }

    }).catch(function (err) {
      console.log(err.message);
    });
  },

  creat_Trade: function (event) {
    event.preventDefault();

    App.params.date = convetDateToTimStamp(App.params.date);
    var trade_index = 0;
    var expired_time = 3;
    var EscrowManagerInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.EscrowManager.deployed().then(function (instance) {
        EscrowManagerInstance = instance;
        // Execute adopt as a transaction by sending account
        return EscrowManagerInstance.createTrade(trade_index, App.params.walletAddressSeller, App.params.walletAddressBuyer, 
               App.params.depositSeller, App.params.depositBuyer, expired_time, { from: account });
      }).then(function (result) {
        console.log(result.logs[0].args);
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  get_TradeById: function (event) {
    event.preventDefault();

    var contractId = $('#contractId').val();

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.EscrowManager.deployed().then(function (instance) {
        EscrowManagerInstance = instance;
        console.log(EscrowManagerInstance);
        // Execute adopt as a transaction by sending account
        return EscrowManagerInstance.getTradeById(contractId, { from: account });
      }).then(function (result) {
        $('#message1').text("Escrow adrress: " + result.logs[0].args._tradeAddress);
        $('#message2').text("Escrow Id: " + result.logs[0].args._tradeIndex);
        $('#message3').text("Escrow state: " + result.logs[0].args._step);
        $('#message4').text("Contract balance " + result.logs[0].args.contractBalance);
        $('#message5').text("seller paid:" + result.logs[0].args._sellerPaid);
        $('#message6').text("buyer paid:" + result.logs[0].args._buyerPaid);
        console.log(result.logs[0]);
        // var msg="Contract addr :"+ result.logs[0].args._tradeAddress
        // msg+= "\nContract id is: "+result.logs[0].args._tradeIndex
        // msg+="\nContract balance : "+result.logs[0].args.contractBalance
        // msg+="\nEscrow Contract stat : "+result.logs[0].args._step
        // alert(msg)
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  set_Agreement: function (event) {
    event.preventDefault();

    var contractId = $('#contractId_getAgreement').val();

    var EscrowManagerInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];


      App.contracts.EscrowManager.deployed().then(function (instance) {
        EscrowManagerInstance = instance;
        // Execute adopt as a transaction by sending account
        return EscrowManagerInstance.setAgreement(contractId, { from: account });
      }).then(function (result) {
        alert("Deal is done, The money is back")
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

};

function searchToObject() {
  var pairs = window.location.search.substring(1).split("&"),
    obj = {},
    pair,
    i;

  for (i in pairs) {
    if (pairs[i] === "") continue;

    pair = pairs[i].split("=");
    obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }

  return obj;
}

function convetDateToTimStamp(date) {
  var date = date.split("/");
  var newDate = new Date( date[2], date[1] - 1, date[0]);
  return newDate.getTime();
}




