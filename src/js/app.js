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

  creat_Trade:  function (event) {
    event.preventDefault();

    var expired_time = convetDateToTimStamp(App.params.date);
    var trade_index = 0;
    var status = "waiting;";
    var EscrowManagerInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
//       var description = App.params.description;
//       var depositSeller = App.params.depositSeller;
//       var depositBuyer = App.params.depositBuyer;
//       var walletAddressSeller = App.params.walletAddressSeller;
//       var walletAddressBuyer = App.params.walletAddressBuyer;
//       var date = App.params.date;
//       var email = App.params.email;
//       var creator = "626ed80d799270f5d99bbd05"
//       var buyerID = "null"
//       var authorization = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imltb3JrcmF2aXR6QGdtYWlsLmNvbSIsInVzZXJJZCI6IjYyNmVkODBkNzk5MjcwZjVkOTliYmQwNSIsImlhdCI6MTY1MzQ5NTk0NSwiZXhwIjoxNjUzNDk2ODQ1fQ.tkttyMn0Kwpi_n8Wg_C1ip62VswZ9cvU1WdsmTr6XRw"


//  //  --Post to backend-------------------------------------------------------
//     const result =  fetch('http://localhost:3000/api/contracts/add', {
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/json',
//           authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imltb3JrcmF2aXR6QGdtYWlsLmNvbSIsInVzZXJJZCI6IjYyNmVkODBkNzk5MjcwZjVkOTliYmQwNSIsImlhdCI6MTY1MzQ5NzA0MiwiZXhwIjoxNjUzNDk3OTQyfQ.vImRRffRvu9vypHAK71vDEYIRWvvevClOoj0XWLYOY4'
//       },
//       body: JSON.stringify({
//         description,
//         depositSeller,
//         depositBuyer,
//         walletAddressSeller,
//         walletAddressBuyer,
//         date,
//         email,
//         creator,
//         status,
//         buyerID
//       })
//   }).then((res) => res.json())
//   if (result.error) {
//       alert(result.error);
//   } else if (result.status == 'ok') {
//       alert("succses!")
//   }

      postTransaction()
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

async function postTransaction() {
  var description = App.params.description;
      var depositSeller = App.params.depositSeller;
      var depositBuyer = App.params.depositBuyer;
      var walletAddressSeller = App.params.walletAddressSeller;
      var walletAddressBuyer = App.params.walletAddressBuyer;
      var date = App.params.date;
      var email = App.params.email;
      var creator = "626ed80d799270f5d99bbd05"
      var buyerID = "null"
      console.log("in the function - " + description +"-" + depositSeller + "-"  +email+ "-" + date);
      var status = "waiting;";

  const result = await fetch('http://localhost:3000/api/contracts/add', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imltb3JrcmF2aXR6QGdtYWlsLmNvbSIsInVzZXJJZCI6IjYyNmVkODBkNzk5MjcwZjVkOTliYmQwNSIsImlhdCI6MTY1MzQ5NzA0MiwiZXhwIjoxNjUzNDk3OTQyfQ.vImRRffRvu9vypHAK71vDEYIRWvvevClOoj0XWLYOY4'
      },
      body: JSON.stringify({
        description,
        depositSeller,
        depositBuyer,
        walletAddressSeller,
        walletAddressBuyer,
        date,
        email,
        creator,
        status,
        buyerID
      })
  }).then((res) => res.json())
  if (result.error) {
      alert(result.error);
  } else if (result.status == 'ok') {
      alert("succses!")
  }

} 


