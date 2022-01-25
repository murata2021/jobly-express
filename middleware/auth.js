"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);

      console.log(res.locals.user)
      console.log("****************************************8")
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function isAdmin(req, res, next) {
  try {
    if (res.locals.user.isAdmin) {
      return next();
    } else {
      return next({ status: 401, message: " Unauthorized: Admin access required!" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized: Admin access required!" });
  }
}

function ensureCorrectUser(req, res, next) {
  try {
    if (res.locals.user.isAdmin || res.locals.user.username===req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: " Unauthorized: only be permitted either by an admin, or by that user!" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized: only be permitted either by an admin, or by that user!" });
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  isAdmin,
  ensureCorrectUser
};
