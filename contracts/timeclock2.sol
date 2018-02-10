pragma solidity ^0.4.0;


contract TimeClock{
    
    uint employee_count = 0;
    bytes32[] employees;

    //TODO ADD EVENTS
    event employee_added_event( 
        uint _id,
        address _from,
        string _name,
        uint _time
        );
    event clock_in_event(
        address _from,
        uint _id,
        string _name,
        uint _time
        );

    event clock_out_event(
        address _from,
        uint _id,
        string _name,
        uint _time
        );
    

    
    
    struct Employee {
        uint id;
        string name;
        bool clocked_in;
        uint[] time_stamps;
    }
    
    mapping(uint=>string) id_to_name;
    mapping (uint => Employee) Employees;
    mapping (string => bool) Employee_exists;
    
    function get_employee_count() public constant returns(uint){
        return employee_count;
    }
    
    function get_employee(uint _id) public view returns (uint, string, bool, uint[]){
        return (Employees[_id].id, Employees[_id].name, Employees[_id].clocked_in, Employees[_id].time_stamps);
        
    }
    
    function does_employee_exist(string _name) public constant returns (bool){
        return Employee_exists[_name];
    }
    
    function add_employee(string _name) public returns(uint){
        bool flag = Employee_exists[_name];
        require(!flag);
        Employee_exists[_name] = true;
        id_to_name[employee_count]=_name;
        Employee storage _employee = Employees[employee_count];
        _employee.id = employee_count;
        _employee.name = _name;
        _employee.clocked_in = false;
        employee_count++;
        employee_added_event(_employee.id, msg.sender, _name, now);
        return employee_count;
    }
    
    function clock_in(uint _id) public {
        string memory _name = id_to_name[_id];
        require(Employee_exists[_name]);
        Employee storage _employee = Employees[_id];
        require(!_employee.clocked_in);
        _employee.clocked_in = true;
        _employee.time_stamps.push(now);
        clock_in_event(msg.sender, _id, _name, now );
    }
    
    function clock_out(uint _id) public {
        string memory _name = id_to_name[_id];
        require(Employee_exists[_name]);
        Employee storage _employee = Employees[_id];
        require(_employee.clocked_in);
        _employee.clocked_in = false;
        _employee.time_stamps.push(now);
        clock_out_event(msg.sender, _id, _name, now );

    }
    

    
    
    
}
