// should contain all unit tests on FlatJS.MV.js

var __MVMockData = {
  HTML: '',
  customMV: FlatJS.MV || {}
}

var APP = {};

$.ajax({

  url: 'MV/mock.html',
  success: function(data) {
    __MVMockData.HTML = data;
    $('#mock-area').append(data);
    __MVMockData.mockLoadedCallback()
  }

})


__MVMockData.mockLoadedCallback = function() {

  // init the MV default behavoir in mock
  new FlatJS.ModuleRunner().init();

  var $mock = $('#flat-mv-test-mock'),
      mock  = $mock.get(0),
      mvMod = mock.jsModules ? mock.jsModules['FlatJS.MV'] : undefined;

  QUnit.test("FlatJS.MV existence tests", function() {
    var $mock = $('#flat-mv-test-mock');
    QUnit.equal($mock.length, 1, 'Mock successfully AJAXed in');
    QUnit.equal(typeof FlatJS.MV, 'function', "FlatJS.MV exists, is a function");
    QUnit.ok(FlatJS.MV instanceof FlatJS.Widget, 'FlatJS.MV is an instance of FlatJS.Widget');
  });

  QUnit.test("FlatJS.MV tests - DOM loaded model generation", function() {

    QUnit.equal(typeof APP.Person, 'object', "APP.Person & APP.Todo model references should be automatically generated");
    QUnit.equal(typeof APP.Todo, 'object', "APP.Person & APP.Todo model references should be automatically generated");
    QUnit.equal(APP.PERSON.objects.length, 2, "APP.PERSON.objects has 2 people in it");

  });

};
