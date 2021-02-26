const { getArgs } = require("./src/utils/getArgs");
const { DatoHelpers } = require("./src/utils/datoHelpers");
const { from, model, to } = getArgs();

const datoClient = new DatoHelpers(from, to);

datoClient
  .migrateModel(model)
  .then(() => {
    console.log("Migration Successful!");
  })
  .catch(console.log);

// de5b2aefeacf0e0e086a32e67efff1 project a
// 61641c972033d780152051b64b8601 project b
