App = {
  web3Provider: null,
  contracts: {},
  account:'',
  timeclock:{},

  init: function() {
    // Load pets.

    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    web3.eth.getAccounts(function(e, r){
        console.log(r)
        $('#ethAccountID').html(r[0])
        App.account = r[0];
        web3.eth.getBalance(r[0].toString(),function(e, r){
          console.log(e)
          console.log(r.toNumber())
          $('#currentBalance').html(web3.fromWei(r.toNumber()))

        })
      })

    return App.initContract();
  },

  initContract: function() {

      var timeclockContract = web3.eth.contract([
  {
    "constant": true,
    "inputs": [],
    "name": "get_employee_count",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "get_employee",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "bool"
      },
      {
        "name": "",
        "type": "uint256[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "does_employee_exist",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "add_employee",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "clock_in",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "_from",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_name",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "_time",
        "type": "uint256"
      }
    ],
    "name": "clock_in_event",
    "type": "event"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "clock_out",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "_from",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_name",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "_time",
        "type": "uint256"
      }
    ],
    "name": "clock_out_event",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "_id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "name": "_from",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "_name",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "_time",
        "type": "uint256"
      }
    ],
    "name": "employee_added_event",
    "type": "event"
  }
])

      App.timeclock = timeclockContract.at("0x9b77083f0fcee81e3c0f7c3ea421dff76fe07fbf")
App.list_all_employees()
return App.setUI()


    
  },
  list_all_employees:function(){
    App.timeclock.get_employee_count.call(function(e, r){
      console.log(e)
      console.log(r.toNumber())
      App.handle_employee_list(r.toNumber())

    })

  },
  handle_employee_list:function(_count){
    console.log('handle listL')
    console.log(_count)
    for(let x = 0; x<_count;x++){
      let result = App.get_employee_by_id(x, function(result){
        App.add_employee_to_list(result)
      })
    }
  },
  get_employee_by_id:function(_id, callback){
    App.timeclock.get_employee.call(_id, function(e, _employee){
      if(!e){
        var _id = _employee[0].toNumber();
        var _name = _employee[1]
        var _isClockedIn = _employee[2]
        var _timesStamp_array = _employee[3]
        // console.log({_id, _name, _isClockedIn, _timesStamp_array})
        callback( {_id, _name, _isClockedIn, _timesStamp_array})      
      }else{return e}
    })
  },
  add_employee_to_list:function(employee){
    console.log(employee)
     var e=employee
     var _name = App.hex2a(e._name)
     var _id = e._id
     var _isClockedIn = e._isClockedIn
     var clock_in_class;
     // var emp = _name.slice(2)
     // emp = emp.slice(0, emp.indexOf(0))
     // emp = App.hex2a(emp)
     if(_isClockedIn){clock_in_class = "clock_out_btn"}
      else{clock_in_class = "clock_in_btn"}
     $('#employee_list').append(`
       <li onclick=App.get_time_stamps_for_name("${_name}")>${_name}</li>
        <button class="${clock_in_class}" data-id=${_id} onclick=App.clock_in_out(event)></button>
         `)


  },
  echo:function(_string){
    App.contracts.TimeClock.deployed().then(function(instance) {
      return instance.echo.call(_string, {from: App.account});
    }).then(function(time_stamp){
      console.log(time_stamp)
    }).catch(function(e){
      console.log('error....')
      console.log(e)
    })
  },
  clock_in_out:function(e){
    var _is_clocked_in = e.target.classList.contains('clock_out_btn')
    var _id = e.target.getAttribute('data-id')
    var _class = e.target.classList
    if(_is_clocked_in){
      console.log('clock out!')
      App.clock_out(_id)
      e.target.classList.replace('clock_out_btn', 'clock_in_btn')
    }else{
      console.log('clock in!')
      App.clock_in(_id)
      e.target.classList.replace('clock_in_btn', 'clock_out_btn')
    }

  },
  clock_in:function(_id){
    App.timeclock.clock_in(_id, {from:App.account, gas: "2000000"}, function(e,r) {
      if(!e){
        console.log('Clock in')
      }else{
        console.log('error....')
        console.log(e)
    }
  })

  },
  clock_out:function(_id){
    App.timeclock.clock_out(_id, {from:App.account, gas: "200000"}, function(e, r){
      if(!e){
        console.log('Clock out')
      }else{
        console.log('error....')
        console.log(e)
      }
    })


  },
  // get_time_stamps_for_name:function(_name){
  //   App.contracts.TimeClock.deployed().then(function(instance) {
  //     return instance.get_time_stamps_for_name.call(_name);
  //   }).then(function(time_stamp_array){
  //     console.log(time_stamp_array)
  //     var time_stamp_list = $('#time_stamps_for_current_selected_employee')
  //     time_stamp_list.html('')
  //     for(let x = 0 ; x < time_stamp_array.length ; x++){
  //       var color;
  //       if(x%2==0){color = 'class=clock-in'
  //       }else{color = 'class=clock-out'
  //       }
  //       var time = time_stamp_array[x].toNumber() * 1000
  //       time = new Date(time)
  //       time_stamp_list.append(`<li ${color}>${time}</li>`)

  //       console.log()
  //     }

  //   }).catch(function(e){
  //     console.log('error....')
  //     console.log(e)
  //   })
  // },
  add_employee:function(_name){
    console.log('add '+_name)
    App.timeclock.add_employee(App.a2hex(_name), {
      from:App.account,
      gas:"2000000",
      gasPrice:"2000000"
    }, function(e, r){
      console.log(e)
      App.call_when_mined(r, function(){console.log('has been mined!!! '+r)})
    })
  },
  call_when_mined:function(txHash, callback){
    web3.eth.getTransactionReceipt(txHash, function(e, r){
      if(e){console.log(e)}
        else{
          if(r==null){
            setTimeout(function(){
              App.call_when_mined(txHash, callback)
            }, 500)
          }else{
            callback();
          }
        }
    })
  },
  a2hex:function(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i ++) {
      var hex = Number(str.charCodeAt(i)).toString(16);
      arr.push(hex);
    }
    return arr.join('');
  },

  hex2a:function(hexx) {
      var hex = hexx.toString();//force conversion
      var str = '';
      for (var i = 0; i < hex.length; i += 2)
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
  },

  setUI:function(){


    var add_emp_btn = $('#add_employee_btn')
    var emp_name_input = $('#employee_name_input')
    $(add_emp_btn).on('click', function(){App.add_employee(emp_name_input.val())})


    //Event watchers
    var employee_added_event = App.timeclock.employee_added_event({}, {fromBlock:'latest', toBlock:'latest'})
    employee_added_event.watch(function(e, r){
        if(e){
          console.log('error')
          console.log(e)
        }else if (r){
          console.log(r)
          console.log(App.hex2a(r.args._name))
          console.log('employee_added_event')
        }else{
          console.log('employee_added_event error')
        }
      })

      var clock_in_event = App.timeclock.clock_in_event({}, {fromBlock:'latest', toBlock:'latest'})
      clock_in_event.watch(function(e, r){
          if(e){
            console.log('error')
            console.log(e)
          }else if (r){
            console.log(r)
            console.log(App.hex2a(r.args._name))
            console.log('clock_in_event')
            var time_stamp_data = r
            console.log(time_stamp_data)
            var args = time_stamp_data.args
            var _from = args._from
            var _name = args._name
            var _time = args._time.toNumber()
            console.log({_from, _name, _time})
            var time_stamp_list = $('#time_stamps_for_current_selected_employee')
            color = 'class=clock-in'
            time_stamp_list.append(`<li ${color}>${new Date(_time)}</li>`)
          }else{
            console.log('clock_in_event error')
          }
        })

      var clock_out_event = App.timeclock.clock_out_event({}, {fromBlock:'latest', toBlock:'latest'})
      clock_out_event.watch(function(e, r){
          if(e){
            console.log('error')
            console.log(e)
          }else if (r){
            console.log(r)
            console.log(App.hex2a(r.args._name))
            console.log('clock_out_event')
            var time_stamp_data = r
            console.log(time_stamp_data)
            var args = time_stamp_data.args
            var _from = args._from
            var _name = args._name
            var _time = args._time.toNumber()
            console.log({_from, _name, _time})
            var time_stamp_list = $('#time_stamps_for_current_selected_employee')
            color = 'class=clock-out'
            time_stamp_list.append(`<li ${color}>${new Date(_time)}</li>`)
          }else{
            console.log('clock_out_event error')
          }
        })

    function handleBasicCallback(e, r, options){
      for (let k in options){
        $('#'+k).html(options[k])
      }
      if(e){console.log(e)
      }else if(r){console.log(r)
      }else{console.log('error getting peer count')
        console.log(options)
      }
    }
    $('#web3APIVersion').html(web3.version.api)
    web3.net.getPeerCount(function(e, r){
      handleBasicCallback(e, r, {peerCount:r})
    })
    web3.version.getNetwork(function(e, r){
      handleBasicCallback(e, r, {web3versionNetwork:r})
    })
    web3.version.getEthereum(function(e, r){    //parse the returned hexedecimal
      handleBasicCallback(e, r, {web3EthereumVersion:parseInt(r, 16)})
    })
    $('#web3ConnectionStatus').html(web3.isConnected())
    web3.net.getListening(function(e, r){
      handleBasicCallback(e, r, {webisListening:r})
    })
    var ethFunction = web3.eth
    for(let k in ethFunction){
      var option = "<option value='"+k+"'>"+k+"</option>"
      $('#ethFunctions').append(option)
    }


    //see latest block and time since last block
    var newestBlockTimer;
    var blockTimerStart=0;
    var currentBlockID;
    $('#timeSinceLastBlock').html(blockTimerStart);
    initLatestBlockTimer()
    function initLatestBlockTimer(){
      newestBlockTimer = setInterval(function(){
        web3.eth.getBlockNumber(function(e, r){

          if(r==$('#currentBlockID').html()){

            $('#timeSinceLastBlock').html(blockTimerStart);
            blockTimerStart++
          }else{

            $('#currentBlockID').html(r)
            clearInterval(newestBlockTimer)
            blockTimerStart=0
            initLatestBlockTimer()

          }
          })
      }, 1000)
    }
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
