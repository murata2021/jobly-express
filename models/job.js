"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be {title, salary, equity, companyHandle}
   *
   * Returns {id,title, salary, equity, companyHandle}
   *
   * Throws BadRequestError if company already in database.
   * */
   static async create({ title, salary, equity, companyHandle }) {
    

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id,title, salary, equity, company_handle AS "companyHandle"`,
        [
            title, salary, equity, companyHandle
        ],
    );
    const job= result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{id,title, salary, equity, companyHandle}, ...]
   * */

  static async findAll(title, minSalary,hasEquity) {
    
    if (!minSalary && !hasEquity){
      const jobsRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE title ILIKE '%${title}%'
           ORDER BY title`);

           return jobsRes.rows;
      }

      else {

        let qString;

        if (minSalary && hasEquity){
          qString=` salary >=${minSalary} AND equity > 0  AND`

        }
        else if (minSalary && !hasEquity){
            qString=` salary>=${minSalary} AND `
  
          }
       
        else if (!minSalary && hasEquity){
          qString=` equity > 0 AND`

        }

        console.log(qString)
        const jobsRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE ${qString} title ILIKE '%${title}%'
           ORDER BY title`);

           return jobsRes.rows;
      }


  }

  /** Given a job id, return data about job.
   *
   * Returns {id,title, salary, equity, companyHandle}
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
                `SELECT id,
                        title,
                        salary,
                        equity,
                        company_handle AS "companyHandle"
                FROM jobs
                WHERE id = $1`,
                [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, companyHandle}
   *
   * Returns {id,title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle"
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary,
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job= result.rows[0];

    if (!job) throw new NotFoundError(`No company with id: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);
  }

}


module.exports = Job;