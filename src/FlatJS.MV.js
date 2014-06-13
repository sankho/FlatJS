var FlatJS = FlatJS || {};

FlatJS.MV = FlatJS.Widget.extend(function() {

  var api = {

    render: function() {
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

  function findAndInitializeModels() {
    var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-model', this.obj);

    for (var i = 0; i < modelNodes.length; i++) {
      var node      = modelNodes[i],
          modelName = node.getAttribute('data-mv-model'),
          model     = FlatJS.Helpers.findFunctionByString(modelName, window, FlatJS.Object.extend({}));

      this._(createModelObjectFromNode)(model, node);
    }
  }

  function createModelObjectFromNode(model, node) {
    var id     = node.getAttribute('data-mv-id'),
        obj    = false;

    obj = model.find(id) || new model({ id: id });

    this._(stripDataFromNodeAndUpdateObject)(obj, node);
  }

  function stripDataFromNodeAndUpdateObject(obj, node) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child && child.hasAttribute && child.hasAttribute('data-mv-key')) {
        this._(getKeyAndValueFromNodeAndAddToObject)(obj, child);
      }
    }
  }

  function getKeyAndValueFromNodeAndAddToObject(obj, node) {
    var key = node.getAttribute('data-mv-key'),
        val = node.innerHTML;

    obj.set(key, val);
  }

  function syncMVKeys() {

  }

  function assembleJSON() {

  }

  function bindMVKeys() {

  }

  return api;

});
