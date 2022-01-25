# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i


### SqlforPartialUpdate

Format the given data into a specific form to update the database. 

Parameters:

1) dataToUpdate: columns that you want to update. (JSON object)

2) jsToSQL: it is an object that changes the name of the key(s) in the dataToUpdate object with its corresponding value(s) if there are any matching keys. (JS uses camel Case to name variables, on the other hand, the naming convention of SQL is using “_".) 

Returns:

The function returns an object with two keys:
 1) "setCols": column(s) to be updated.
 2) "values": values of the updated fields.'

Example:

const dataToUpdate={"firstName": 'Aliya', "age": 32}
const jsToSQL={firstName:"first_name"}

sqlForPartialUpdate(dataToUpdate,jsToSQL)
>> { setCols: '"first_name"=$1, "age"=$2', values: [ 'Aliya', 32 ] }

sqlForPartialUpdate({},jsToSQL)
>> throws Bad Request Error: No Data

### Company.findAll(name,minEmployees,maxEmployees)

Add filter to your queries. 

Parameters:

1) name (optional): it searches entered value in the name column of the companies table. (Case insensitive)
2) minEmployees (optional): filter companies based on their employee number, the company has to have at least given number of employees. 
3) maxEmployees (optional): filter companies based on their employee number, the company has to have max given number of employees.

Returns: companies that satisfy criteria. {"companies":[{comp1Info},....]}


### GET company/ route

New filter feature is added to the route. Users will be able to add name,minEmployees and maxEmployees filters to their requests. (See Company.findAll function above.)

Returns: companies that satisfy criteria. {"companies":[{comp1Info},....]}

If minEmployees is greater than maxEmployees, the app will give you a BadRequest Error (400).







