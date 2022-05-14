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

     
        // {
        //   $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        // }
      
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  creat_Trade: function(event) {
    event.preventDefault();
    // var petId = parseInt($(event.target).data('sellerAddress'));

    var trade_index = $('#tradeIndex').val();
    var seller_adrress = $('#sellerAddress').val();
    var buyer_adrress = $('#buyerAddress').val();
    var seller_amount = $('#sellerAmount').val();
    var buyer_amount = $('#buyerAmount').val();
    var expired_time = $('#expiredTime').val();
    
    if(seller_adrress !="" && seller_amount !=""&& seller_amount!="" && expired_time !=""){

      var EscrowManagerInstance;

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
        
        App.contracts.EscrowManager.deployed().then(function(instance) {
          EscrowManagerInstance = instance;
          console.log(EscrowManagerInstance);
          // Execute adopt as a transaction by sending account
          return EscrowManagerInstance.createTrade(trade_index,seller_adrress,buyer_adrress,seller_amount,buyer_amount,expired_time,{from: account});
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
        // Execute adopt as a transaction by sending account
        return EscrowManagerInstance.getTradeById(contractId,{from: account});
      }).then(function(result) {
        $('#message1').text("Escrow adrress: "+result.logs[0].args._tradeAddress);
          $('#message2').text("Escrow Id: "+result.logs[0].args._tradeIndex);
          $('#message3').text("Escrow state: "+result.logs[0].args._step);
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


