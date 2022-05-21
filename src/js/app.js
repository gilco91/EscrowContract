$(function() {
  $(window).load(function() {
    App.init();
  });
});

App = {
  web3Provider: null,
  contracts: {},
  
  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
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

  initContract: function() {
    /*
     * Replace me...
     */
    $.getJSON('EscrowManager.json', function(data) {
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

  bindEvents: function() {
    $(document).on('click', '.btn-createTrade', App.creat_Trade);
    $(document).on('click', '.btn-escrowBalance', App.get_TradeById);
    $(document).on('click', '.btn-setAgreement', App.set_Agreement);
  },

  markAdopted: function() {
    /*
     * Replace me...
     */
    var EscrowManagerInstance;

    App.contracts.EscrowManager.deployed().then(function(instance) {
      EscrowManagerInstance = instance;

    }).catch(function(err) {
      console.log(err.message);
    });
  },

  creat_Trade: async function(event) {
    event.preventDefault();

    var trade_index = 0;
    var description = $('#description').val();
    var depositSeller = $('#depositSeller').val();
    var depositBuyer = $('#depositBuyer').val();
    var walletAddressSeller = $('#walletAddressSeller').val();
    var walletAddressBuyer = $('#walletAddressBuyer').val();
    var email = $('#email').val();
    var expired_time = $('#expiredTime').val();
    var date = new Date();
    var status = 'wating';
    var buyerID = '627fe49e580a2def6ec850b0'
    var creator = '627fe49e580a2def6ec850b0'

    //--Post to backend-------------------------------------------------------
    const result = await fetch('http://localhost:3000/api/contracts/add', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
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
//--Post to backend-------------------------------------------------------
    console.log(date);

    console.log(trade_index);
    console.log(walletAddressSeller);
    console.log(walletAddressBuyer);
    console.log(depositSeller);
    console.log(depositBuyer);
    console.log(expired_time);
    


    
    if(seller_adrress !="" && seller_amount !=""&& seller_amount!="" && expired_time !=""){

      var EscrowManagerInstance;

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
        
        App.contracts.EscrowManager.deployed().then(function(instance) {
          EscrowManagerInstance = instance;
          // Execute adopt as a transaction by sending account
          return EscrowManagerInstance.createTrade(trade_index,walletAddressSeller,walletAddressBuyer,depositSeller,depositBuyer,expired_time,{from: account});
        }).then(function(result) {
          $('#message1').text("Escrow adrress: "+result.logs[0].args._tradeAddress);
          $('#message2').text("Escrow Id: "+result.logs[0].args._tradeIndex);
          $('#message3').text("Escrow state: "+result.logs[0].args._step);
          $('#message4').text("");
          $('#message5').text("");
          $('#message6').text("");

          console.log(result.logs[0]);
          // alert('please send money to escrow contract address: '+ result.logs[0].args._tradeAddress 
          // +"\n Your contract id is: "+result.logs[0].args._tradeIndex +
          // "Escrow Contract stat: " +result.logs[0].args._step)
          
          return App.markAdopted();
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    }
    
  },

  get_TradeById: function(event) {
    event.preventDefault();

    var contractId = $('#contractId').val();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.EscrowManager.deployed().then(function(instance) {
        EscrowManagerInstance = instance;
        console.log(EscrowManagerInstance);
       
        return EscrowManagerInstance.getTradeById(contractId,{from: account});
      }).then(function(result) {
        $('#message1').text("Escrow adrress: "+result.logs[0].args._tradeAddress);
          $('#message2').text("Escrow Id: "+result.logs[0].args._tradeIndex);
          $('#message3').text("Escrow state: "+result.logs[0].args._step);
          $('#message4').text("Contract balance " + result.logs[0].args.contractBalance);
          $('#message5').text("seller paid:" + result.logs[0].args._sellerPaid);
          $('#message6').text("buyer paid:" + result.logs[0].args._buyerPaid);
        console.log(result.logs[0]);
  
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  set_Agreement: function(event) {
    event.preventDefault();

    var contractId = $('#contractId_getAgreement').val();

    var EscrowManagerInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      

      App.contracts.EscrowManager.deployed().then(function(instance) {
        EscrowManagerInstance = instance;
        // Execute adopt as a transaction by sending account
        return EscrowManagerInstance.setAgreement(contractId,{from: account});
      }).then(function(result) {
        alert("Deal is done, The money is back")
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

};


