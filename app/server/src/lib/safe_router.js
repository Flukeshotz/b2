/**
 * A ROUTER WHERE NO SINGLE HANDLER CAN HANG A REQUEST OR CRASH THE PROCESS.
 *
 * The audit found routes/b2.js and routes/api.js were almost entirely bare
 * `async (req,res) => {...}` handlers with no try/catch (0% in api.js, ~20%
 * in b2.js). Express 4 does not forward a rejected promise from a plain async
 * handler to error-handling middleware, so a thrown error became either an
 * unhandled rejection (which the process-level handlers in index.js catch,
 * but WITHOUT ever answering the request — it just hangs) or, before that fix
 * existed, a crashed process for every learner.
 *
 * Wrapping every handler by hand across ~55 routes is exactly the kind of
 * mechanical change worth doing once, centrally. `safeRouter()` is a drop-in
 * replacement for `express.Router()`: every `.get/.post/.put/.patch/.delete`
 * handler registered on it is automatically caught and forwarded to
 * `next(err)`, which index.js's centralized error middleware turns into a
 * real JSON response instead of a hang.
 */
const express = require("express");

const VERBS = ["get", "post", "put", "patch", "delete", "all"];

function wrap(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = function safeRouter(...args) {
  const router = express.Router(...args);
  for (const verb of VERBS) {
    const original = router[verb].bind(router);
    router[verb] = (path, ...handlers) => original(path, ...handlers.map(wrap));
  }
  return router;
};
