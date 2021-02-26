const { SiteClient } = require("datocms-client");
const { transformModel, transformField } = require("./transform");

module.exports.DatoHelpers = class {
  constructor(fromProjectAPI, toProjectAPI) {
    console.log(fromProjectAPI, toProjectAPI);
    this.from = new SiteClient(fromProjectAPI);
    this.to = new SiteClient(toProjectAPI);
  }

  getModel = async (model) => {
    try {
      console.log("Retrieving model...");
      const data = await this.from.itemTypes.all();
      const res = data.find((node) => node.name === model);
      if (!res) throw new Error("Model not found!");
      return res;
    } catch (error) {
      throw error;
    }
  };

  getFields = async (model) => {
    try {
      console.log("Retrieving Fields...");
      return await this.from.fields.all(model);
    } catch (error) {
      throw error;
    }
  };

  migrateModel = async (model) => {
    try {
      console.log("Initiating migration...");
      const data = await this.getModel(model);
      const fields = await this.getFields(data.apiKey);
      await this.to.itemTypes.create(transformModel(data));
      fields.forEach(async (node) => {
          await this.to.fields.create(data.apiKey, transformField(node));
      });
    } catch (error) {
      throw error;
    }
  };
};
