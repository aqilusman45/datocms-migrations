module.exports = {
  transformModel,
  transformField,
  transformFieldSets,
  transformAddon
};

function transformField(field, fieldSets) {
  delete field.id;
  delete field.itemType;
  delete field.appeareance;

  const fieldset = fieldSets.find(({ ref }) => field.fieldset === ref);

  return {
    ...field,
    fieldset: fieldset ? fieldset.id : null,
  };
}

function transformModel(model) {
  delete model.id;
  return {
    ...model,
    titleField: null,
  };
}

function transformFieldSets(field) {
  delete field.id;
  return {
    ...field,
  };
}

function transformAddon(addon) {
  delete addon.id;
  return {
    ...addon,
  };
}
