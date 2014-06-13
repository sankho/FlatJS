var FlatJS = FlatJS || {};

FlatJS.MV = FlatJS.Widget.extend(function() {

  var api = {

    render: function() {
      this._(internalInitializer)();
      this.initializer();
      this._(findAndInitializeModels)();
      this._(syncMVKeys)();
      this._(assembleJSON)();
      this.renderUI();
      this.syncUI();
      this._(bindMVKeys)();
      this.bindUI();
    }

  };

  function internalInitializer() {
    this.JSON = this.JSON || {};
  }

  function findAndInitializeModels() {
    var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-model', this.obj);

    for (var i = 0; i < modelNodes.length; i++) {
      var node      = modelNodes[i],
          modelName = node.getAttribute('data-mv-model'),
          model     = FlatJS.Helpers.findFunctionByString(modelName, window, FlatJS.Object.extend({}));

      this._(createModelObjectFromNode)(model, node, modelName);
    }
  }

  function createModelObjectFromNode(model, node, modelName) {
    var id     = node.getAttribute('data-mv-id'),
        obj    = false;

    obj = model.find(id) || new model({ id: id });

    obj.nodes     = obj.nodes || [];
    obj.modelName = obj.modelName || modelName;

    this._(stripDataFromNodeAndUpdateObject)(obj, node);
  }

  function stripDataFromNodeAndUpdateObject(obj, node) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child && child.hasAttribute && child.hasAttribute('data-mv-key')) {
        this._(getKeyAndValueFromNodeAndAddToObject)(obj, child);
      }

      if (child.childNodes && child.childNodes.length > 0) {
        if (child.hasAttribute && !child.hasAttribute('data-mv-model')) {
          this._(stripDataFromNodeAndUpdateObject)(obj, child);
        }
      }
    }
  }

  function getKeyAndValueFromNodeAndAddToObject(obj, node) {
    var key = node.getAttribute('data-mv-key'),
        val = node.innerHTML;

    obj.watch(key, this._(syncMVKeysOnObjectChange));
    obj.nodes.push(node);
    obj.set(key, val);
  }

  function syncMVKeysOnObjectChange(prop, oldVal, newVal, obj) {
    for (var i = 0; i < obj.nodes.length; i++) {
      var node = obj.nodes[i];

      if (node && node.getAttribute('data-mv-key') && node.getAttribute('data-mv-key') === prop) {
        node.innerHTML = newVal;
      }
    }
  }

  function syncMVKeys() {

  }

  function assembleJSON() {

  }

  function bindMVKeys() {

  }

  return api;

});
