module.exports = {
  transformModel,
  transformField,
};

function transformField(field) {
  delete field.id;
  delete field.itemType;
  delete field.appeareance;
  return {
    ...field,
  };
}

function transformModel(model) {
  delete model.id;
  return {
    ...model,
    titleField: null,
  };
}
