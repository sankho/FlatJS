FlatJS.Widget = (function() {

  var Widget = FlatJS.Classy.extend({

    init: function(obj) {
      this.obj = obj;

      if (this.renderOnInit !== false && typeof this.render === 'function') {
        this.render();
      }
    },

    render:      function() {
      this.initializer();
      this.renderUI();
      this.bindUI();
      this.syncUI();
    },

    initializer: function() {},

    renderUI:    function() {},

    bindUI:      function() {},

    syncUI:      function() {}

  });

  return Widget;

}());
