// should contain all unit tests on FlatJS.MV.js

var __MVMockData = {
  HTML: '',
  customMV: FlatJS.MV || {}
}

$.ajax({

  url: 'MV/mock.html',
  success: function(data) {
    __MVMockData.HTML = data;
    $('#mock-area').append(data);
    __MVMockData.mockLoadedCallback()
  }

})


__MVMockData.mockLoadedCallback = function() {

  var $mock = $('#flat-mv-test-mock'),
      mock  = $mock.get(0);

  new FlatJS.ModuleRunner({
    attr: 'data-js-mv-test-module'
  });

  var mvMod = mock.jsModules ? mock.jsModules['FlatJS.MV'] : undefined;

  QUnit.test("FlatJS.MV existence tests", function() {
    var $mock = $('#flat-mv-test-mock');
    QUnit.equal($mock.length, 1, 'Mock successfully AJAXed in');
    QUnit.equal(typeof FlatJS.MV, 'function', "FlatJS.MV exists, is a function");
    QUnit.ok(mvMod instanceof FlatJS.Widget, 'FlatJS.MV is an instance of FlatJS.Widget');
  });

  QUnit.test("FlatJS.MV tests - DOM loaded model generation", function() {
    QUnit.equal(typeof APP.Todo, 'function', "APP.Todo model references should be automatically generated");
    QUnit.equal(typeof APP.Person, 'function', "APP.Person model references should be automatically generated");
    QUnit.equal(APP.Todo.objects.length, 2, "APP.Todo.objects has 2 people in it");
    QUnit.equal(APP.Person.objects.length, 2, "APP.Person.objects has 2 people in it");
    QUnit.equal(APP.Person.objects[0].name, "Jane", "APP.Person.objects[0] has correct data on name")
    QUnit.equal(APP.Todo.objects[0].title, "Get Laundry", "APP.Todo.objects[0] has correct data on title")
    QUnit.equal(APP.Person.objects[0].title, undefined, "Person object does not inherit Todo information even though markup is nested.")
    QUnit.equal($mock.find('h1').text(), "Jane", "Correct name applied to first instance of model in view, updated from entry of second");
    QUnit.equal(typeof mvMod.JSON, "object", "JSON object created & attached to mod");
    QUnit.equal(mvMod.JSON.you, APP.Person.find(2), "JSON object successfully creates pointers to related Person model objects")
  });

};
