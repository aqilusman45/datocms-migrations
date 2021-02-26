const yargs = require("yargs");

module.exports.getArgs = function () {
  return yargs.usage("Usage: -f <from> -m <model> -t <to>").options({
    from: {
      description:
        "Provide the API Key for the project you are importing model from.",
      required: true,
      alias: "f",
      string: true,
    },
    model: {
      description: "Provide the name of the model you want to migrate.",
      string: true,
      required: true,
      alias: "m",
    },
    to: {
      description:
        "Provide the API Key for the project you are importing model to.",
      required: true,
      alias: "t",
      string: true,
    },
  }).argv;
};
