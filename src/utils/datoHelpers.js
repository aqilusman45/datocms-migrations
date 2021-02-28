const { SiteClient } = require("datocms-client");
const {
  transformModel,
  transformField,
  transformFieldSets,
  transformAddon,
} = require("./transform");
module.exports.DatoHelpers = class {
  constructor(fromProjectAPI, toProjectAPI) {
    this.from = new SiteClient(fromProjectAPI);
    this.to = new SiteClient(toProjectAPI);
  }

  getModels = async () => {
    try {
      const data = await this.from.itemTypes.all();
      return data;
    } catch (error) {
      throw error;
    }
  };

  getModel = async (model) => {
    try {
      const data = await this.from.itemTypes.all();
      const res = data.find((node) => node.name === model);
      if (!res) throw new Error("Model not found!");
      return res;
    } catch (error) {
      throw error;
    }
  };

  getTargetModels = async () => {
    try {
      const data = await this.to.itemTypes.all();
      return data;
    } catch (error) {
      throw error;
    }
  };

  getFields = async (model) => {
    try {
      return await this.from.fields.all(model);
    } catch (error) {
      throw error;
    }
  };

  getFieldSets = async (model) => {
    try {
      return await this.from.fieldsets.all(model);
    } catch (error) {
      throw error;
    }
  };

  getTargetFields = async (model) => {
    try {
      return await this.to.fields.all(model);
    } catch (error) {
      throw error;
    }
  };

  findAndCreateMissingModels = async (modelIds) => {
    const models = await this.getModels();
    const modelsToCompare = models.filter((node) => modelIds.includes(node.id));
    const targetModels = await this.getTargetModels();
    const missingModels = modelsToCompare.filter(
      (node) => !targetModels.some((ele) => node.name === ele.name)
    );
    const newModels = [];
    for (const model of missingModels) {
      const fields = await this.getFields(model.apiKey);
      const fieldsets = await this.getFieldSets(model.apiKey);
      const res = await this.to.itemTypes.create(transformModel(model));
      const fieldsetsRes = await this.createFieldSets(model.apiKey, fieldsets);
      await this.createFields(model.apiKey, fields, fieldsetsRes);
      newModels.push(res);
    }

    let newIds = [];
    targetModels.concat(newModels);
    for (let i = 0; i < modelIds.length; i++) {
      const a = modelsToCompare.find((node) => {
        return node.id === modelIds[i];
      });
      if (a) {
        const b = targetModels.find((node) => a.name === node.name);
        newIds[i] = b.id;
      }
    }
    return newIds;
  };

  createFieldSets = async (model, fieldsets) => {
    return await Promise.all(
      fieldsets.map(async (node) => {
        const ref = node.id;
        const res = await this.to.fieldsets.create(
          model,
          transformFieldSets(node)
        );
        return {
          ...res,
          ref,
        };
      })
    );
  };

  getAddons = async (plugins) => {
    return await Promise.all(
      plugins.map(async ({ id }) => {
        return await this.from.plugins.find(id);
      })
    );
  };

  getTargetAddon = async addon => {
    const targetPlugin = await this.to.plugins.all();
    return targetPlugin.find(node => node.packageName === addon.packageName)
  };

  findAndCreateMissingAddons = async (sourceAddons, sourceAddonsParams) => {
    let temp = [...sourceAddonsParams]
    for (const [idx, addon] of sourceAddons.entries()) {
      const targetAddon = await this.getTargetAddon(addon);
      if (!targetAddon) {
        const res = await this.to.plugins.create(transformAddon);
        temp[idx] = {
          ...temp[idx],
          id: res.id
        }
      } else {
        temp[idx] = {
          ...temp[idx],
          id: targetAddon.id
        }
      }
    }
    return temp
  };

  createFields = async (model, fields, fieldsets) => {
    try {
      for (const field of fields) {
        if ("structuredTextLinks" in field.validators) {
          const ids = await this.findAndCreateMissingModels(
            field.validators.structuredTextLinks.itemTypes
          );
          field.validators.structuredTextLinks.itemTypes = ids;
        }

        if ("structuredTextBlocks" in field.validators) {
          const ids = await this.findAndCreateMissingModels(
            field.validators.structuredTextBlocks.itemTypes
          );
          field.validators.structuredTextBlocks.itemTypes = ids;
        }

        if ("richTextBlocks" in field.validators) {
          const ids = await this.findAndCreateMissingModels(
            field.validators.richTextBlocks.itemTypes
          );
          field.validators.richTextBlocks.itemTypes = ids;
        }

        if ("slugTitleField" in field.validators) {
          const targetFields = await this.getTargetFields(model);
          const fld =
            targetFields.find((node) => node.appearance.type === "title") || "";
          field.validators.slugTitleField.titleFieldId = fld.id;
        }

        if ("itemItemType" in field.validators) {
          const ids = await this.findAndCreateMissingModels(
            field.validators.itemItemType.itemTypes
          );
          field.validators.itemItemType.itemTypes = ids;
        }

        if ("itemsItemType" in field.validators) {
          const ids = await this.findAndCreateMissingModels(
            field.validators.itemsItemType.itemTypes
          );
          field.validators.itemsItemType.itemTypes = ids;
        }

        if ("addons" in field.appearance) {
          const res = await this.getAddons(field.appearance.addons);
          const addons = await this.findAndCreateMissingAddons(res, field.appearance.addons);
          field.appearance.addons = addons;
        }

        await this.to.fields.create(model, transformField(field, fieldsets));
      }
    } catch (error) {
      throw error;
    }
  };

  migrateModel = async (model) => {
    try {
      console.log("Initiating Migration...");
      const data = await this.getModel(model);
      const fields = await this.getFields(data.apiKey);
      const fieldsets = await this.getFieldSets(data.apiKey);
      await this.to.itemTypes.create(transformModel(data));
      const fieldsetsRes = await this.createFieldSets(data.apiKey, fieldsets);
      await this.createFields(data.apiKey, fields, fieldsetsRes);
    } catch (error) {
      throw error;
    }
  };
};
