var FlatJS = FlatJS || {};

FlatJS.MV = FlatJS.Widget.extend(function() {

  var api = {

    render: function() {
      this._(findAndInitializeModels)();
      this.initializer();
      this.renderUI();
      this.syncUI();
      this._(bindMVKeys);
      this.bindUI();
    }

  };

  function findAndInitializeModels() {
    var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-model', this.obj);

    for (var i = 0; i < modelNodes.length; i++) {
      var node      = modelNodes[i],
          modelName = node.getAttribute('data-mv-model'),
          model     = FlatJS.Helpers.findFunctionByString(modelName, window, FlatJS.Object.extend({
            node: document.createElement('div')
          }));

      new model({
        node: node
      });
    }
  }

  function bindMVKeys() {

  }

  return api;

});
