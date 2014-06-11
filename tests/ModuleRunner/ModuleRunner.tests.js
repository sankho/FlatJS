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
  }),

  basicImplentationTests: function(mock, obj2, nodeSet) {
      QUnit.ok(mock.jsModules, "jsModules array attaches to <div> on init, init runs by default, works without provided scope");
      QUnit.ok(mock.jsModules[!nodeSet ? '__moduleRunnerMockData.moduleOne' : 'moduleOne'] instanceof __moduleRunnerMockData.moduleOne, "moduleOne module executed on div, retrieves object and is instance of __moduleRunnerMockData.moduleOne");

      QUnit.ok(obj2.jsModules, "jsModules array attaches to <div> on inner <div> recursively");
      QUnit.ok(obj2.jsModules[!nodeSet ? '__moduleRunnerMockData.moduleTwo' : 'moduleTwo'] instanceof __moduleRunnerMockData.moduleTwo, "moduleTwo is assigned appropriately to inner <div>");
      QUnit.equal(obj2.jsModules[!nodeSet ? '__moduleRunnerMockData.moduleTwo' : 'moduleTwo'].int1, 23, "reference to inner object returns correctly set variable retrieved from data attribute");
  }

}

QUnit.stop();

$.ajax({

  url: 'ModuleRunner/mock.html',
  success: function(data) {
    __moduleRunnerMockData.HTML = data;
    $('#mock-area').append(data);

    QUnit.start();
  }

})

QUnit.test("FlatJS.ModuleRunner default functionality", function(assert) {

  var $mock = $('#module-runner-test-mock'),
      $two  = $mock.find('.module-two'),
      mock  = $mock.get(0),
      obj2  = $two.get(0);

  var runner = new FlatJS.ModuleRunner();

  QUnit.ok($('#module-runner-test-mock').length > 0, "Module runner mock HTML loads and appends via ajax");

  __moduleRunnerMockData.basicImplentationTests(mock, obj2);

});

// reset
QUnit.test('FlatJS.ModuleRunner - extended functionality', function(assert) {

  var $mock = $('#module-runner-test-mock');

  //reset
  $mock.remove();
  $('#mock-area').append(__moduleRunnerMockData.HTML);

  var $mock = $('#module-runner-test-mock'),
      $two  = $mock.find('.module-two'),
      mock  = $mock.get(0),
      obj2  = $two.get(0);

  // edit attributes
  $mock.attr('data-new-js-module', 'module-one');
  $two.attr('data-new-js-module', 'module-two');

  var runner = new FlatJS.ModuleRunner({
    init:    false,
    context: __moduleRunnerMockData,
    attr:    'data-new-js-module',
    node:    mock
  })

  QUnit.equal(obj2.jsModules, undefined, "ModuleRunner does not automatically init if false flag is passed");

  runner.init();

  __moduleRunnerMockData.basicImplentationTests(mock, obj2, true);

  $mock.remove();

});
