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

  var $mock = $('#flat-mv-test-mock .first'),
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
    QUnit.equal(APP.Todo.objects.length, 4, "APP.Todo.objects has 4 todos in it");
    QUnit.equal(APP.Person.objects.length, 4, "APP.Person.objects has 4 people in it");
    QUnit.equal(APP.Person.objects[0].name, "Jane", "APP.Person.objects[0] has correct data on name")
    QUnit.equal(APP.Todo.objects[0].title, "Get Laundry", "APP.Todo.objects[0] has correct data on title")
    QUnit.equal(APP.Person.objects[0].title, undefined, "Person object does not inherit Todo information even though markup is nested.")
    QUnit.equal(APP.Person.find(1).arbitrary, 'key values', "JSON extention of object via data-mv-json key on node successful");
    QUnit.equal($mock.find('h2').text(), "Jane", "Correct name applied to first instance of model in view, updated from entry of second");
    QUnit.equal(typeof mvMod.JSON, "object", "JSON object created & attached to mod");
    QUnit.equal(mvMod.JSON.you, APP.Person.find(2), "JSON object successfully creates pointers to related Person model objects")
    QUnit.equal(mvMod.JSON.header.title, "Todo List", "Non model string data saved to JSON object as well")
    QUnit.equal(mvMod.JSON.people[0], APP.Person.find(1), "Models are saved as relations to the JSON object, pushed onto array as well")
  });

  QUnit.test("FlatJS.MV - Changing model objects should update HTML", function() {
    APP.Todo.objects[0].set('title', 'Cook Dinner');
    APP.Todo.find(3).set('title', 'Cook Lasagana');
    QUnit.equal($('.first .first-todo span').text(), 'Cook Dinner', "HTML syncs on object change successfully - first item");
    QUnit.equal($('.second .first-todo span').text(), 'Cook Lasagana', "HTML syncs on object change successfully - first item");

    __MVMockData.startSecondTests();
  });

}

__MVMockData.startSecondTests = function() {
  QUnit.test("FlatJS.MV - JSON Injection / Auto Template creation", function() {
    // reset everything
    $('#flat-mv-test-mock').remove();
    $('#mock-area').append(__MVMockData.HTML);

    var $mock    = $('#flat-mv-test-mock'),
        $mockOne = $mock.find('.first'),
        mockOne  = $mockOne.get(0),
        $mockTwo = $mock.find('.second'),
        mockTwo  = $mockTwo.get(0);

    new FlatJS.ModuleRunner({
      attr: 'data-js-mv-test-module'
    });

    var mvModOne = mockOne.jsModules ? mockOne.jsModules['FlatJS.MV'] : undefined,
        mvModTwo = mockTwo.jsModules ? mockTwo.jsModules['FlatJS.MV'] : undefined;

    QUnit.ok(mvModOne.updateJSON, "FlatJS.MV.prototype.updateJSON exists");
    QUnit.ok(mvModOne.renderFromJSON, "FlatJS.MV.prototype.renderFromJSON exists");

    mvModOne.updateJSON({
      header: {
        title: "Todo List - Updated"
      }
    });

    QUnit.equal(mvModOne.JSON.header.title, "Todo List - Updated", "updateJSON extends the inner JSON object as expected");

    QUnit.ok(mvModOne.tmpl, "Template created from original markup");
    QUnit.ok($(mvModOne.tmpl).find('.first-todo').length > 0, "Template markup is as expected");

    mvModOne.renderFromJSON();

    QUnit.equal($mockOne.find('h1').text(), "Todo List - Updated", "Updating JSON object on model updates HTML in view");
    QUnit.equal($mockOne.find('.person:eq(0)').text().trim(), 'Bill', "Array of models imported successfully w/ renderFromJson");
    QUnit.equal($mockOne.find('.first-todo span').text().trim(), 'Get Laundry', "Inner array of array (todos in people array)");
  });

};
