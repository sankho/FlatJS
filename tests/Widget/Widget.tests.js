// tests for FlatJS.Widget

var __widgetMockData = {
  HTML: ''
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

  });
}
