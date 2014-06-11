// tests for module runner

var mockHTML = '';

var moduleOne = function(obj) {
  this.int1 = 33;
  this.int2 = 55;

  obj.innerHTML = obj.innerHTML + '<p>Module One.</p>';
}

var moduleTwo = FlatJS.Classy.extend({
  init: function(obj) {
    this.int1 = 23;
    this.int2 = 89;

    obj.innerHTML = obj.innerHTML + '<p>Module Two.</p>';
  }
});

QUnit.asyncTest("FlatJS.ModuleRunner Loads Mock File", function(assert) {

  $.ajax({

    url: 'ModuleRunner/mock.html',
    success: function(data) {
      mockHTML = data;
      $('#mock-area').append(mockHTML);

      mockLoaded();
    }

  })

});



function mockLoaded() {

  QUnit.ok($('#module-runner-test-mock').length > 0, "Module runner mock HTML loads and appends via ajax");

  QUnit.start();

  QUnit.test("FlatJS.ModuleRunner default functionality", function(assert) {

    var $mock = $('#module-runner-test-mock'),
        mock  = $mock.get(0);

    var runner = new FlatJS.ModuleRunner();

    QUnit.ok(mock.jsModules, "jsModules array attaches to <div> on init, init runs by default");
    QUnit.ok(mock.jsModules['moduleOne'] instanceof moduleOne, "moduleOne module executed on div");

  });
}
