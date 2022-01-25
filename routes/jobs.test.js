"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

//u1Token has admin access! usToken is a regular user!
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");
const Job = require("../models/job");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {

  const newJob = {
    title:"accountant",
    companyHandle: "c1",
    salary: 86300,
    equity: 0.08,
  };

  test("ok for users with Admin access", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body["job"]["id"]).toEqual(expect.any(Number))
    });
  });

  const newJob2 = {
    title:"accountant",
    companyHandle: "c1",
    salary: 120000,
    equity: 0.18,
  };

  test("users without admin access cannot create new company", async function () {
    const resp2 = await request(app)
        .post("/jobs")
        .send(newJob2)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp2.statusCode).toEqual(401);
    
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          company_handle: "c1",
          title:"accountant"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title:"accountant",
            companyHandle: "c1",
            salary: 120000,
            equity: 0.18,
            extraField: "extraField",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });


/************************************** GET /companies */

describe("GET /jobs", function () {
  test("TEST WITHOUT ANY FILTER: (ok for anon)", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {   
                id:expect.any(Number),
                title:"j1",
                salary:123000,
                equity:"0.55",
                companyHandle: "c1",
               
              },
              {
                id:expect.any(Number),
                title:"j2",
                salary:77000,
                equity:"0.02",
                companyHandle: "c2",
              
              },
              {
                id:expect.any(Number),
                title:"j3",
                salary:52500,
                equity:"0",
                companyHandle: "c3", 
              }
          ],
    });
  });

  test("TEST NAME FILTER: (ok for anon)", async function () {
    const resp = await request(app).get("/jobs").send({"title":"j1"});
    expect(resp.body).toEqual({
      jobs:
          [
            {id:expect.any(Number),
                title:"j1",
                salary:123000,
                equity:"0.55",
                companyHandle: "c1",
            }
          ],
    });
  });

  test("TEST minSalary & hasEquity FILTER: (ok for anon)", async function () {
    const resp = await request(app).get("/jobs").send({"minSalary":75000});
    expect(resp.body).toEqual({
        jobs:
        [
          {   
              id:expect.any(Number),
              title:"j1",
              salary:123000,
              equity:"0.55",
              companyHandle: "c1",
             
            },
            {
              id:expect.any(Number),
              title:"j2",
              salary:77000,
              equity:"0.02",
              companyHandle: "c2",
            
            },
            
        ],
    });

    const resp2 = await request(app).get("/jobs").send({"minSalary":100000,"hasEquity":true});
    expect(resp2.body).toEqual({
      jobs:
          [
            {   
                id:expect.any(Number),
                title:"j1",
                salary:123000,
                equity:"0.55",
                companyHandle: "c1",
               
              },
              
            
          ],
    });


    const resp4 = await request(app).get("/jobs").send({"minSalary":-3});
    expect(resp4.statusCode).toEqual(400);
    
  });

  test("ALL FILTERS TOGETHER: (ok for anon)", async function () {
    const resp = await request(app).get("/jobs").send({"title":"j","hasEquity":true,"minSalary":50000});
    expect(resp.body).toEqual({
      jobs:
          [
            {   
                id:expect.any(Number),
                title:"j1",
                salary:123000,
                equity:"0.55",
                companyHandle: "c1",
               
              },
              {
                id:expect.any(Number),
                title:"j2",
                salary:77000,
                equity:"0.02",
                companyHandle: "c2",
              
              },
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */


describe("GET /jobs/:id",function () {

    
    

  test("works for anon", async function () {


    let newJob= await Job.create({title:'j6', salary:1230000, equity:0.75, companyHandle:'c1'});

    const resp = await request(app).get(`/jobs/${newJob.id}`);
    expect(resp.body).toEqual({
      job: {
        id:expect.any(Number),
                title:"j6",
                salary:1230000,
                equity:"0.75",
                companyHandle: "c1",
      },
    });
  });


  test("not found for no such company", async function () {
    const resp = await request(app).get(`/jobs/231321`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for users", async function () {

    let newJob= await Job.create({title:'j6', salary:1230000, equity:0.75, companyHandle:'c1'});

    const resp = await request(app)
        .patch(`/jobs/${newJob.id}`)
        .send({
          title: "real-job",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id:expect.any(Number),
                title:"real-job",
                salary:1230000, equity:"0.75", companyHandle:'c1'
      },
    });
  });

  test("without admin access, companies cannot be updated", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401)
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          name: "j1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such company", async function () {
    const resp = await request(app)
        .patch(`/companies/21312`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {

    let newJob= await Job.create({title:'j6', salary:1230000, equity:0.75, companyHandle:'c1'});

    const resp = await request(app)
        .patch(`/jobs/${newJob.id}`)
        .send({
          id: 10,
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {

    let newJob= await Job.create({title:'j6', salary:1230000, equity:0.75, companyHandle:'c1'});

    const resp = await request(app)
        .patch(`/jobs/${newJob.id}`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {




  test("works for users", async function () {

    let newJob= await Job.create({title:'j6', salary:1230000, equity:0.75, companyHandle:'c1'});

    const resp = await request(app)
        .delete(`/jobs/${newJob.id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: `${newJob.id}` });
  });

  test("without admin access, jobs cannot be deleted", async function () {

    let newJob= await Job.create({title:'j6', salary:1230000, equity:0.75, companyHandle:'c1'});

    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {

    let newJob= await Job.create({title:'j6', salary:1230000, equity:0.75, companyHandle:'c1'});

    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {

    let newJob= await Job.create({title:'j6', salary:1230000, equity:0.75, companyHandle:'c1'});

    const resp = await request(app)
        .delete(`/jobs/32131`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
