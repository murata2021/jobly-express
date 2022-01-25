const {sqlForPartialUpdate} = require("./sql");
const {BadRequestError}=require("../expressError")


describe("sqlPartialUpdate", function () {
    test("works: sending ordinary parameters", function () {
        const dataToUpdate={"firstName": 'Aliya', "age": 32}
        const result=(sqlForPartialUpdate(dataToUpdate,{firstName:"first_name"}))
        expect(result).toEqual({ setCols: '"first_name"=$1, "age"=$2', values: [ 'Aliya', 32 ] })
    });
    test("passing empty object for jsToSql (second parameter)", function () {
        const dataToUpdate={"firstName": 'Aliya', "age": 32}
        const result=(sqlForPartialUpdate(dataToUpdate,{}))
        expect(result).toEqual({ setCols: '"firstName"=$1, "age"=$2', values: [ 'Aliya', 32 ] })
    });
    test("passing empty dataToUpdate raises error",function (){
        const dataToUpdate={};
        function emptyDataToUpdate() {
            sqlForPartialUpdate(dataToUpdate,{firstName:"first_name"});
        };
        expect(emptyDataToUpdate).toThrowError(BadRequestError);
    })
    
});