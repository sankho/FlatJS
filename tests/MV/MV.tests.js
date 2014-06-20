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

  QUnit.test("FlatJS.MV tests - DOM loaded model generation & JSON data assembly from markup", function() {
    QUnit.equal(typeof APP.Todo, 'function', "APP.Todo model references should be automatically generated");
    QUnit.equal(typeof APP.Person, 'function', "APP.Person model references should be automatically generated");
    QUnit.equal(APP.Todo.objects.length, 3, "APP.Todo.objects has 3 todos in it");
    QUnit.equal(APP.Person.objects.length, 2, "APP.Person.objects has 2 people in it");
    QUnit.equal(APP.Person.objects[0].name, "Jane", "APP.Person.objects[0] has correct data on name")
    QUnit.equal(APP.Todo.objects[0].title, "Get Laundry", "APP.Todo.objects[0] has correct data on title")
    QUnit.equal(APP.Person.objects[0].title, undefined, "Person object does not inherit Todo information even though markup is nested.")
    QUnit.equal(APP.Todo.find(3).somethingExtra, "hey", "camel case conversion working on data-mv-key");

    QUnit.equal(APP.Todo.find(1).arbitrary, 'key values', "JSON extention of object via data-mv-json key on node successful");
    QUnit.equal($mock.find('h2').text(), "Jane", "Correct name applied to first instance of model in view, updated from entry of second");

    QUnit.equal(typeof mvMod.JSON, "object", "JSON object created & attached to mod");
    QUnit.equal(mvMod.JSON.you, APP.Person.find(2), "JSON object successfully creates pointers to related Person model objects")
    QUnit.equal(mvMod.JSON.header.title, "Todo List", "Non model string data saved to JSON object as well")
    QUnit.equal(mvMod.JSON.people[0].personObj, APP.Person.find(1), "Models are saved as relations to the JSON object, pushed onto array as well, camel case conversion working on data-json-obj")
    QUnit.equal(typeof mvMod.JSON.people[0].todos, 'object', 'Todos successfully  added to individual people object');
    QUnit.equal(mvMod.JSON.people[1].todos.length, 4, "Basic arrays are saving basic objects based on markup within arrays");
    QUnit.equal(mvMod.JSON.people[1].todos[0].title, "Get Dinner", "Correct object in basic arrays within arrays");
    QUnit.equal(mvMod.JSON.header.arbitraryTopTitle, "Hey now", "Camel case conversion taking place for data-json-key");
  });

  QUnit.test("FlatJS.MV - Changing model objects should update HTML", function() {
    APP.Todo.objects[0].set('title', 'Cook Dinner');
    APP.Todo.find(2).set('title', 'Cook Lasagana');
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
      },
      people: [
        {
          personObj: APP.Person.find(2),
          todos: [
            APP.Todo.find(1)
          ]
        }
      ]
    });

    QUnit.equal(mvModOne.JSON.header.title, "Todo List - Updated", "updateJSON extends the inner JSON object as expected");

    QUnit.ok(mvModOne.tmpl, "Template created from original markup");
    QUnit.ok($(mvModOne.tmpl).find('.first-todo').length > 0, "Template markup is as expected");

    mvModOne.renderFromJSON();

    QUnit.equal($mockOne.find('h1').text(), "Todo List - Updated", "Updating JSON object on model updates HTML in view");
    QUnit.equal($mockOne.find('.person:eq(0)').text().trim(), 'Jane', "Array of models imported & muted successfully w/ renderFromJson");
    QUnit.equal($mockOne.find('.first-todo:eq(0) span').text().trim(), 'Get Laundry', "Todos translated over");

    $.ajax({

      url: 'MV/mock2.html',
      success: function(data) {
        $mock.remove();
        __MVMockData.HTML2 = data
        $('#mock-area').append(data);
        __MVMockData.startThirdTests(data)
      }

    })
  });
}

__MVMockData.startThirdTests = function() {

  QUnit.test("FlatJS.MV - Relational information drawn from mockup", function() {
    var $mock    = $('#flat-mv-test-mock-2'),
        $mockOne = $mock.find('.first'),
        mockOne  = $mockOne.get(0),
        $mockTwo = $mock.find('.second'),
        mockTwo  = $mockTwo.get(0);

    new FlatJS.ModuleRunner({
      attr: 'data-js-mv-test-module'
    });

    var mvModOne = mockOne.jsModules ? mockOne.jsModules['FlatJS.MV'] : undefined,
        mvModTwo = mockTwo.jsModules ? mockTwo.jsModules['FlatJS.MV'] : undefined;

    QUnit.deepEqual(APP.Person.find(1).todos, [APP.Todo.find(1), APP.Todo.find(3)], "Object relations are set up via markup if objects are nested within each other's nodes");
    QUnit.equal(APP.Person.find(1).todos.length, 2, "Object relations append correctly onto Model via markup, doesn't re-write existing objects");
    QUnit.equal(APP.Person.find(2).todos.length, 1, "Object relations don't double up on assemblage");


    QUnit.test("FlatJS.MV - JSON Injection / Auto Template creation on relational models", function() {
      // copy pasted from above set of tests, adjusting the object a bit
      mvModOne.updateJSON({
        header: {
          title: "Todo List - Updated"
        },
        people: [
          {
            personObj: APP.Person.find(1)
          }
        ]
      });

      QUnit.equal(mvModOne.JSON.header.title, "Todo List - Updated", "updateJSON extends the inner JSON object as expected");

      QUnit.ok(mvModOne.tmpl, "Template created from original markup");
      QUnit.ok($(mvModOne.tmpl).find('.first-todo').length > 0, "Template markup is as expected");

      mvModOne.renderFromJSON();

      QUnit.equal($mockOne.find('h1').text(), "Todo List - Updated", "Updating JSON object on model updates HTML in view");
      QUnit.equal($mockOne.find('.person:eq(0) a').text().trim(), 'Bill', "Array of models imported & muted successfully w/ renderFromJson");
      QUnit.equal($mockOne.find('.first-todo:eq(0) span').text().trim(), 'Get Laundry', "Todos translated over");

      $.ajax({

        url: 'MV/mock3.html',
        success: function(data) {
          $mock.remove();
          __MVMockData.HTML3 = data;
          $('#mock-area').append(data);
          __MVMockData.startFourthTests()
        }

      });
    });
  })
};

__MVMockData.startFourthTests = function() {

  QUnit.test("FlatJS.MV - Testing inputs & various node types for getter / setter functionality", function() {

    new FlatJS.ModuleRunner({
      attr: 'data-js-mv-test-module'
    });

    var $mock    = $('#flat-mv-test-mock-3'),
        mvMod    = $mock.get(0).jsModules['FlatJS.MV'];

    QUnit.equal(mvMod.JSON.form.input, $mock.find('#text-input').val(), "Text input value converted to JSON");
    QUnit.deepEqual(mvMod.JSON.form.radio, { value: "test-radio", selected: true }, "Selected radio field value saved as JSON");
    QUnit.deepEqual(mvMod.JSON.form.radioOff, { value: "test-radio-off", selected: false }, "Radio field value converted to JSON, dashed key selectors converted to camel case");
    QUnit.deepEqual(mvMod.JSON.form.checkbox, { value: $mock.find('#checkbox').val(), selected: true }, "Checkbox value converted to JSON");
    QUnit.deepEqual(mvMod.JSON.form.checkboxOff, { value: $mock.find('#checkbox-off').val(), selected: false }, "Checkbox value converted to JSON");
    QUnit.equal(mvMod.JSON.form.textarea, "Microphone check one two what is this", "Textarea values converted to JSON");

    mvMod.updateJSON({
      form: {
        input:    "Heyo",
        radio:    {
          selected: false,
          value:    "new value"
        },
        radioOff: {
          selected: true
        },
        checkbox:    {
          selected: false
        },
        checkboxOff: {
          selected: true
        },
        textarea: "The five foot assassin with the roughneck business"
      }
    });
    mvMod.renderFromJSON();

    QUnit.equal($mock.find('#text-input').val(), "Heyo", "Text input updated from JSON");
    QUnit.equal($('#radio').is(':checked'), false, "Selected radio field turned off via JSON");
    QUnit.equal($('#radio').val(), "new value", "Radio field value changed via JSON");
    QUnit.equal($('#radio-off').is(':checked'), true, "Unselected radio field turned on via JSON");
    QUnit.equal($('#checkbox').is(':checked'), false, "Selected checkbox turned off via JSON");
    QUnit.equal($('#checkbox-off').is(':checked'), true, "Unselected checkbox turned on via JSON");
    QUnit.equal(mvMod.JSON.form.textarea, "The five foot assassin with the roughneck business", "Textarea values converted to JSON");
  });

}
