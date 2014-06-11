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

  }

  function bindMVKeys() {

  }

  return api;

});
