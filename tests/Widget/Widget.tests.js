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

}

__widgetMockData.nonRenderingWidget =  __widgetMockData.exampleWidget.extend({
    renderOnInit: false
  })

QUnit.stop();

$.ajax({

  url: 'Widget/mock.html',
  success: function(data) {
    __widgetMockData.HTML = data;
    $('#mock-area').append(data);
    QUnit.start();
  }

})

QUnit.test("FlatJS.Widget - Tests lifecycle", function() {
  $mock = $('#flat-widget-mock');

  QUnit.ok(true, "mock widget file loaded");
  QUnit.equal($mock.length, 1, "Mock object exists in DOM")

  var x = new __widgetMockData.exampleWidget($mock.get(0));

  QUnit.equal(x.initialized, true, "x.initializer() fires on object construction");
  QUnit.equal(x.renderUIed, true, "x.renderUI() fires on object construction");
  QUnit.equal(x.syncUIed, true, "x.syncUI() fires on object construction");
  QUnit.equal(x.bindUIed, true, "x.bindUI() fires on object construction");
  QUnit.equal(x.obj, $mock.get(0), "x.obj is equal to the node passed on constructing x");

  var y = new __widgetMockData.nonRenderingWidget($mock.get(0));

  QUnit.equal(y.initialized, undefined, "y should not render immediately");
  QUnit.equal(y.obj, $mock.get(0), "y.obj is equal to the node passed on constructing y");

  y.render();

  QUnit.equal(y.initialized, true, "y.initializer() fires on object construction");
  QUnit.equal(y.renderUIed, true, "y.renderUI() fires on object construction");
  QUnit.equal(y.syncUIed, true, "y.syncUI() fires on object construction");
  QUnit.equal(y.bindUIed, true, "y.bindUI() fires on object construction");
});
