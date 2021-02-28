const { getArgs } = require("./src/utils/getArgs");
const { DatoHelpers } = require("./src/utils/datoHelpers");
const { from, model, to } = getArgs();

const datoClient = new DatoHelpers(from, to);

datoClient
  .migrateModel(model)
  .then(() => {
    console.log("Migration Successful!");
  })
  .catch(err=> {
      err.body.data.forEach(element => {
         console.log(element); 
      });
  });
