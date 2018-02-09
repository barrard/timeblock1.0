pragma solidity ^0.4.0;


contract TimeClock1{
    
    mapping(bytes32=>bytes5) private is_clocked_in;
    mapping(bytes32=>uint[]) private time_stamps;
    bytes32[] employees;

    event clock_in_event( 
        address _from,
        bytes32 _name,
        uint _time
        );
    event clock_out_event( 
        address _from,
        bytes32 _name,
        uint _time
        );
    event employee_added_event( 
        address _from,
        bytes32 _name,
        uint _time
        );

    // function echo(string _string) public returns(string){
    //   return _string;
    // }
        
    function list_all_employees() public view returns (bytes32[], uint){
        return (employees, employees.length);
    }
    
    function clock_in(bytes32 _name) public returns(uint){
        require( employee_exists(_name) && (is_clocked_in[_name] == bytes5("false"))) ;
        is_clocked_in[_name] = "true";
        time_stamps[_name].push(now);
        clock_in_event( msg.sender, _name, now);
        return now;
        
    }
    function clock_out(bytes32 _name) public returns(uint){
        require( employee_exists(_name) && (is_clocked_in[_name] == bytes5("true"))) ;
        is_clocked_in[_name] = "false";
        time_stamps[_name].push(now);
        clock_out_event( msg.sender, _name, now);
        return now;
        
    }
    function get_time_stamps_for_name(bytes32 _name) public view returns (uint[]){
        return time_stamps[_name];
    }
    
    function add_employee(bytes32 _name) public returns(bytes32[], uint){
        require( !employee_exists(_name) );
    
        employees.push(_name);
        is_clocked_in[_name]="false";
        employee_added_event( msg.sender, _name, now);
        return (employees, employees.length);

    }
    
    function employee_exists(bytes32 _name) public view returns (bool){
        if(((is_clocked_in[_name] != bytes5("false"))) && ((is_clocked_in[_name] != bytes5("true"))) ){
            return false;
        }
        else{
            return true;
        }
    }
    
    function get_employee(uint _index) public view returns(bytes32){
        bytes32 _emp = employees[_index];
        return(_emp);
    }
    
}
