"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title:"accountant",
    companyHandle: "c1",
    salary: 86300,
    equity: "0.08",
  };

  test("works", async function () {
    let job = await Job.create(newJob);

    const result = await db.query(
          `SELECT id, title, company_handle, salary, equity
           FROM jobs
           WHERE id = ${job.id}`);
    expect(result.rows).toEqual([
      {
        id:job.id,
        company_handle: "c1",
        title: "accountant",
        salary: 86300,
        equity: '0.08',
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {

    let title="";
    let minSalary;
    let hasEquity;

    let jobs = await Job.findAll(title,minSalary,hasEquity);
    expect(jobs.length).toEqual(3);
  });

  test("works: title filter", async function () {
    let title="j1";
    let minSalary;
    let hasEquity;
    let jobs = await Job.findAll(title,minSalary,hasEquity);
    expect(jobs).toEqual([
      {
        id:1,
        title:"j1",
        salary:123000,
        equity:"0.55",
        companyHandle: "c1",
      }
    ]);
  });

  test("works: minSalary & hasEquity", async function () {
    let title="";
    let minSalary=60000;
    let hasEquity;
    let jobs = await Job.findAll(title,minSalary,hasEquity);
    expect(jobs).toEqual([
        {
            id:1,
            title:"j1",
            salary:123000,
            equity:"0.55",
            companyHandle: "c1",
          },
      {
        id:2,
        title:"j2",
        salary:77000,
        equity:"0.02",
        companyHandle: "c2",
      },
    ]);

    let job2 = await Job.findAll(title,minSalary=20000,hasEquity=true);
    expect(job2).toEqual([
      {
        id:1,
            title:"j1",
            salary:123000,
            equity:"0.55",
            companyHandle: "c1",
           
          },
          {
            id:2,
            title:"j2",
            salary:77000,
            equity:"0.02",
            companyHandle: "c2",
          
          },
      
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
        id:1,
        title:"j1",
        salary:123000,
        equity:"0.55",
        companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(100);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title:"j1",
    salary:123000,
    equity:"0.55",
    companyHandle: "c2",
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
        id:1,
        title:"j1",
        salary:123000,
        equity:"0.55",
        companyHandle: "c2",
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
        id:1,
        title:"j1",
        salary:123000,
        equity:"0.55",
        company_handle: "c2",
    }]);
});

  test("works: null fields", async function () {
    const updateDataSetNulls = {
        title:"j1",
        salary:null,
        equity:null,
        companyHandle: "c2",
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
        id:1,
        title:"j1",
        salary:null,
        equity:null,
        companyHandle: "c2",
    });

    const result = await db.query(
        `SELECT id, title, salary, equity, company_handle 
         FROM jobs
         WHERE id = 1`);
    expect(result.rows).toEqual([{
        id:1,
        title:"j1",
        salary:null,
        equity:null,
        company_handle: "c2",
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(1000, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(10000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
    });
});
