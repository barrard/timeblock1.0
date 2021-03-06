App = {
  web3Provider: null,
  contracts: {},
  account:'',
  employee_array:[],

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
    $.getJSON('tc.json', function(data) {
    // $.getJSON('TimeClock.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      App.contracts.TimeClock = TruffleContract(data);
      // Set the provider for our contract
      App.contracts.TimeClock.setProvider(App.web3Provider);
      // Use our contract to retrieve and mark the adopted pets
      App.list_all_employees()
      return App.setUI();
    });
    
  },
  list_all_employees:function(){
    App.contracts.TimeClock.deployed().then(function(instance) {
      return instance.get_employee_count.call({from:App.account});
    }).then(function(employees){
      toastr.success('Employee Count '+employees.toNumber())

      App.handle_employee_list(employees.toNumber())
    }).catch(function(e){
      toastr.error(e, 'Failed to get all employees')
      console.log('error....')
      console.log(e)
    })
  },
  handle_employee_list:function(_count){
    console.log('handle listL')
    console.log(_count)
    for(let x = 0; x<_count;x++){
      let result = App.get_employee_by_id(x, function(result){
        console.log(result)
        App.add_employee_to_list(result)
        // var emp = result._name
        // $('#employee_list').append(`
        //   <li onclick=App.get_time_stamps_for_name("${emp}")>${emp}</li>
        //   <button onclick=App.clock_in("${emp}")>Clock in</button>
        //   <button onclick=App.clock_out("${emp}")>Clock out</button>`)        
      })

    }
  },
  get_employee_by_id:function(_id, callback){
    App.contracts.TimeClock.deployed().then(function(instance) {
      return instance.get_employee.call(_id);
    }).then(function(_employee){
      var _id = _employee[0].toNumber();
      var _name = _employee[1]
      var _isClockedIn = _employee[2]
      var _timesStamp_array = _employee[3]
      // console.log({_id, _name, _isClockedIn, _timesStamp_array})
      callback( {_id, _name, _isClockedIn, _timesStamp_array})
      // console.log(_employee)
    }).catch(function(e){
      console.log('error')
      console.log(e)
    })

  },
  add_employee_to_list:function(employee){
    var e=employee
    var _name = e._name
    var _id = e._id
    var _isClockedIn = e._isClockedIn
    var _timesStamp_array = e._timesStamp_array
    console.log(_name)
    var clock_in_class;
    var employee_object = {_id, _name, _isClockedIn, _timesStamp_array}
    App.employee_array.push(employee_object)
     // var emp = _name.slice(2)
     // emp = emp.slice(0, emp.indexOf(0))
     // emp = App.hex2a(emp)
     if(_isClockedIn){clock_in_class = "clock_out_btn"}
      else{clock_in_class = "clock_in_btn"}
     $('#employee_list').append(`
       <li class="employee_list_item">
        <p  data-id=${_id} onclick=App.get_time_stamps(event)>${_name}</p>
      </li>
      <button class="${clock_in_class}" data-id=${_id} onclick=App.clock_in_out(event)></button>
      <br>

        
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
    //using web3 bignimber do math to cast date as seconds since epoch
    var new_date_obj = new web3.BigNumber(new Date()/1000)
    console.log(new_date_obj)
    App.employee_array[_id]._timesStamp_array.push(new_date_obj)

  },
  clock_in:function(_name){
    App.contracts.TimeClock.deployed().then(function(instance) {
      console.log(_name)
      return instance.clock_in(_name, {from:App.account, gas: "2000000", gasPrice:"200000000000"});
    }).then(function(time_stamp_data){
      console.log(time_stamp_data)
      var logs = time_stamp_data.logs[0]
      var _from = logs.args._from
      var _name = logs.args._name
      var _time = logs.args._time.toNumber()
      App.add_punch(true,_time)
      console.log({_from, _name, _time})
    }).catch(function(e){
      console.log('error....')
      console.log(e)
    })

  },
  clock_out:function(_name){
    App.contracts.TimeClock.deployed().then(function(instance) {
      return instance.clock_out(_name, {from:App.account, gas: "200000", gasPrice:"20000000000000"});
    }).then(function(time_stamp_data){
      console.log(time_stamp_data)
      var logs = time_stamp_data.logs[0]
      var _from = logs.args._from
      var _name = logs.args._name
      var _time = logs.args._time.toNumber()
      console.log({_from, _name, _time})
      App.add_punch(false,_time)
    }).catch(function(e){
      console.log('error....')
      console.log(e)
    })


  },
  //clock_in === true
  add_punch:function(clock_in_out, _time){
    if (clock_in_out) {
      var time_stamp_list = $('#time_stamps_for_current_selected_employee')
      var color = 'class=clock-in'
      time_stamp_list.append(`<li ${color}>${new Date(_time*1000)}</li>`)


    }else{
      var time_stamp_list = $('#time_stamps_for_current_selected_employee')
      var color = 'class=clock-out'
      time_stamp_list.append(`<li ${color}>${new Date(_time*1000)}</li>`)      
    }

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
  get_time_stamps:function(e){
    console.log(e.target)
    var _id = e.target.getAttribute("data-id")
    var time_stamp_array = App.employee_array[_id]._timesStamp_array
    var time_stamp_list = $('#time_stamps_for_current_selected_employee')
    time_stamp_list.html('')
    for(let x = 0 ; x < time_stamp_array.length ; x++){
      var color;
      if(x%2==0){color = 'class=clock-in'}
      else{color = 'class=clock-out'}
      var time = time_stamp_array[x].toNumber() * 1000
      time = new Date(time)
      time_stamp_list.append(`<li ${color}>${time}</li>`)
    }   
  },
  add_employee:function(_name){
    console.log(_name)
    var inst;
    App.contracts.TimeClock.deployed().then(function(instance) {
      inst = instance
      console.log(inst)
      // return instance.add_employee(App.a2hex(_name));
      // return instance.add_employee(App.a2hex(_name), {from:App.account});
      // return inst.add_employee.call(_name);
    // }).then(function(result){
      // console.log(result)
      return inst.add_employee(_name, {from:App.account, gas:"2000000", gasPrice: "200000000000"})
    }).then(function(result){
      console.log(result)
      // App.call_when_mined(result.tx, function(){console.log('has been mined!!! '+result.tx)})

      var logs = result.logs[0]
      var _from = logs.args._from
      var _id = logs.args._id.toNumber()
      var _name = logs.args._name
      var _timesStamp_array=[]
      console.log({_from, _id, _name, _timesStamp_array})
      App.add_employee_to_list({_from, _id, _name, _timesStamp_array})
    })
    .catch(function(e){
      console.log('error....')
      console.log(e)
      toastr.warning(e, `failed to add ${_name}`)

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
      if(r!=4){alert("Use Rinkeby test network")}
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
    App.listen_to_events()
  },
  listen_to_events:function(){
    // App.contracts.TimeClock.deployed().then(function(instance) {
    //    instance.employee_added_event().watch(function(e, r){
    //     console.log(e)
    //     console.log(r)
    //    })
    // }).catch(function(err){
    //   console.log(err)
    // })
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
