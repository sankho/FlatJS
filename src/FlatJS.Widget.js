FlatJS.Widget = (function() {

  var Widget = FlatJS.Classy.extend({

    init: function(node) {
      this.fjsRootNode = node;

      if (this.renderOnInit !== false && typeof this.render === 'function') {
        this.render();
      }
    },

    render:      function() {
      if (!this._('fjsHasRendered')) {
        this._('fjsHasRendered', true);
      } else {
        this.unbindUI();
      }

      this.initializer();
      this.renderUI();
      this.bindUI();
      this.syncUI();
    },

    initializer: function() {},

    renderUI:    function() {},

    bindUI:      function() {},

    unbindUI:    function() {},

    syncUI:      function() {}

  });

  return Widget;

}());
