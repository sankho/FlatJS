// tests for FlatJS.Widget

var __widgetMockData = {

  HTML: '',
  exampleWidget: FlatJS.Widget.extend({
    initializer: function() {
      this.initialized = true;
    },
    renderUI: function() {
      this.renderUIed = true;
    },
    syncUI: function() {
      this.syncUIed = true;
    },
    bindUI: function() {
      this.bindUIed = true;
    }
  })

};

QUnit.asyncTest("FlatJS.Widget - Loads Mock File", function(assert) {

  $.ajax({

    url: 'Widget/mock.html',
    success: function(data) {
      __widgetMockData.HTML = data;
      $('#mock-area').append(data);

      __widgetMockData.mockLoaded();
    }

  })

});

__widgetMockData.mockLoaded = function() {
  QUnit.start();

  QUnit.ok(true, "mock widget file loaded");

  $mock = $('#flat-widget-mock');

  QUnit.equal($mock.length, 1, "Mock object exists in DOM")

  QUnit.test("FlatJS.Widget - Tests lifecycle", function() {
    var x = new __widgetMockData.exampleWidget($mock.get);

    QUnit.equal(x.initialized, true, "x.initializer() fires on object construction");
    QUnit.equal(x.renderUIed, true, "x.renderUI() fires on object construction");
    QUnit.equal(x.syncUIed, true, "x.syncUI() fires on object construction");
    QUnit.equal(x.bindUIed, true, "x.bindUI() fires on object construction");
  });
}
