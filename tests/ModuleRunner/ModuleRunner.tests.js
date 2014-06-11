// tests for module runner

// stores info for tests

var __moduleRunnerMockData = {

  HTML: '',

  moduleOne: function(obj) {
    this.int1 = 33;
    this.int2 = 55;

    obj.innerHTML = obj.innerHTML + '<p>Module One.</p>';
  },

  moduleTwo: FlatJS.Classy.extend({
    init: function(obj) {
      this.int1 = 23;
      this.int2 = 89;

      obj.innerHTML = obj.innerHTML + '<p>Module Two.</p>';
    }
  })

}

QUnit.asyncTest("FlatJS.ModuleRunner Loads Mock File", function(assert) {

  $.ajax({

    url: 'ModuleRunner/mock.html',
    success: function(data) {
      __moduleRunnerMockData.HTML = data;
      $('#mock-area').append(data);

      __moduleRunnerMockData.mockLoaded();
    }

  })

});

__moduleRunnerMockData.mockLoaded = function() {

  QUnit.ok($('#module-runner-test-mock').length > 0, "Module runner mock HTML loads and appends via ajax");

  QUnit.start();

  QUnit.test("FlatJS.ModuleRunner default functionality", function(assert) {

    var $mock = $('#module-runner-test-mock'),
        mock  = $mock.get(0);

    var runner = new FlatJS.ModuleRunner();

    QUnit.ok(mock.jsModules, "jsModules array attaches to <div> on init, init runs by default");
    QUnit.ok(mock.jsModules['__moduleRunnerMockData.moduleOne'] instanceof __moduleRunnerMockData.moduleOne, "moduleOne module executed on div, retrieves object and is instance of __moduleRunnerMockData.moduleOne");

  });

};
