// should contain all unit tests on FlatJS.Component.js

var __MVMockData = {
  HTML: '',
  customMV: FlatJS.Component || {}
}

$.ajax({

  url: 'Component/mock.html',
  success: function(data) {
    __MVMockData.HTML = data;
    $('#mock-area').append(data);
    __MVMockData.mockLoadedCallback()
  }

})

__MVMockData.mockLoadedCallback = function() {

  var $mock = $('#flat-mv-test-mock .first'),
      $moc2 = $('#flat-mv-test-mock .second'),
      mock  = $mock.get(0),
      mock2 = $moc2.get(0);

  new FlatJS.Runner({
    attr: 'data-js-mv-test-module'
  });

  var mvMod = mock.fjsComponents ? mock.fjsComponents['FlatJS.Component'] : undefined;
  var mvMod2 = mock2.fjsComponents ? mock2.fjsComponents['FlatJS.Component'] : undefined;

  QUnit.test("FlatJS.Component existence tests", function() {
    var $mock = $('#flat-mv-test-mock');
    QUnit.equal($mock.length, 1, 'Mock successfully AJAXed in');
    QUnit.equal(typeof FlatJS.Component, 'function', "FlatJS.Component exists, is a function");
    QUnit.ok(mvMod instanceof FlatJS.Widget, 'FlatJS.Component is an instance of FlatJS.Widget');
  });

  QUnit.test("FlatJS.Component tests - DOM loaded model generation & JSON data assembly from markup", function() {
    QUnit.equal(typeof APP.Todo, 'function', "APP.Todo model references should be automatically generated");
    QUnit.equal(typeof APP.Person, 'function', "APP.Person model references should be automatically generated");
    QUnit.equal(APP.Todo.fjsObjects.length, 3, "APP.Todo.fjsObjects has 3 todos in it");
    QUnit.equal(APP.Person.fjsObjects.length, 2, "APP.Person.fjsObjects has 2 people in it");
    QUnit.equal(APP.Person.fjsObjects[0].name, "Jane", "APP.Person.fjsObjects[0] has correct data on name")
    QUnit.equal(APP.Todo.fjsObjects[0].title, "Get Laundry", "APP.Todo.fjsObjects[0] has correct data on title")
    QUnit.equal(APP.Person.fjsObjects[0].title, undefined, "Person object does not inherit Todo information even though markup is nested.")
    QUnit.equal(APP.Todo.find(3).somethingExtra, "hey", "camel case conversion working on data-mv-key");

    QUnit.equal(APP.Todo.find(1).arbitrary, 'key values', "JSON extention of object via data-mv-json key on node successful");
    QUnit.equal($mock.find('h2').text(), "Jane", "Correct name applied to first instance of model in view, updated from entry of second");

    QUnit.equal(typeof mvMod.fjsData, "object", "JSON object created & attached to mod");
    QUnit.equal(mvMod.fjsData.you, APP.Person.find(2), "JSON object successfully creates pointers to related Person model objects")
    QUnit.equal(mvMod.fjsData.header.title, "Todo List", "Non model string data saved to JSON object as well")
    QUnit.equal(mvMod.fjsData.people[0].personObj, APP.Person.find(1), "Models are saved as relations to the JSON object, pushed onto array as well, camel case conversion working on data-json-obj")
    QUnit.equal(typeof mvMod.fjsData.people[0].todos, 'object', 'Todos successfully  added to individual people object');
    QUnit.equal(mvMod.fjsData.people[1].todos.length, 4, "Basic arrays are saving basic objects based on markup within arrays");
    QUnit.equal(mvMod.fjsData.people[1].todos[0].title, "Get Dinner", "Correct object in basic arrays within arrays");
    QUnit.equal(mvMod.fjsData.header.arbitraryTopTitle, "Hey now", "Camel case conversion taking place for data-json-key");
  });

  QUnit.test('FlatJS.Component - CSS Classes are added on attribute check', function() {
    QUnit.ok($mock.find('.first-todo:eq(0)').hasClass('completed'), 'Classes added if array passed to attribute defining a key value match and a class name.');
    QUnit.ok($moc2.find('li:eq(0)').hasClass('not-completed'), 'Default / secondary classes added if array passed to attribute defining a key value non match and a class name corrseponding to that lack of match. Words.');
    QUnit.ok($moc2.find('li:eq(1)').hasClass('not-completed') && $moc2.find('li:eq(1)').hasClass('whatever'), 'Multiple class assertions successfully made on object if double sided array passed.');
  });

  QUnit.test("FlatJS.Component - Changing model objects should update HTML", function() {
    APP.Todo.fjsObjects[0].set('title', 'Cook Dinner');
    APP.Todo.find(2).set('title', 'Cook Lasagana');
    QUnit.equal($('.first .first-todo span').text(), 'Cook Dinner', "HTML syncs on object change successfully - first item");
    QUnit.equal($('.second .first-todo span').text(), 'Cook Lasagana', "HTML syncs on object change successfully - first item");
  });

  QUnit.test("FlatJS.Component - Finding model object from HTML Nodes", function() {
    var node = $mock.find('h2').get(0);

    QUnit.equal(mvMod.findResourceFromNode($mock.find('h2').get(0)), APP.Person.find(2), "FlatJS.Component.findResourceFromNode works as expected");
    QUnit.equal(mvMod.findResourceFromNode($mock.find('li.first-todo:eq(0)').get(0)), APP.Todo.find(1));

    __MVMockData.startSecondTests();
  });

}

__MVMockData.startSecondTests = function() {
  QUnit.test("FlatJS.Component - JSON update syncing", function() {
    // reset everything
    $('#flat-mv-test-mock').remove();
    $('#mock-area').append(__MVMockData.HTML);

    var $mock    = $('#flat-mv-test-mock'),
        $mockOne = $mock.find('.first'),
        mockOne  = $mockOne.get(0),
        $mockTwo = $mock.find('.second'),
        mockTwo  = $mockTwo.get(0);

    new FlatJS.Runner({
      attr: 'data-js-mv-test-module'
    });

    var mvModOne = mockOne.fjsComponents ? mockOne.fjsComponents['FlatJS.Component'] : undefined,
        mvModTwo = mockTwo.fjsComponents ? mockTwo.fjsComponents['FlatJS.Component'] : undefined;

    mvModOne.fjsData.set('header.title', "Todo List - Updated");
    mvModOne.fjsData.set('people', [
      {
        personObj: APP.Person.find(2),
        todos: [
          APP.Todo.find(1)
        ]
      }
    ]);

    QUnit.equal(mvModOne.fjsData.header.title, "Todo List - Updated", "Updating fjsData extends the inner JSON object as expected");
    QUnit.equal(mvModOne.fjsData.people[0].personObj.name, "Jane", "Updating fjsData updates the inner JSON object as expected");

    QUnit.equal($mockOne.find('h1').text(), "Todo List - Updated", "Updating JSON object on model updates HTML in view");
    QUnit.equal($mockOne.find('.person:eq(0) a').text(), 'Jane', "Array of models imported & muted successfully w/ renderFromJson");
    QUnit.equal($mockOne.find('.first-todo:eq(0) span').text(), 'Get Laundry', "Todos translated over");

    $.ajax({

      url: 'Component/mock2.html',
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

  QUnit.test("FlatJS.Component - Relational information drawn from mockup", function() {
    var $mock    = $('#flat-mv-test-mock-2'),
        $mockOne = $mock.find('.first'),
        mockOne  = $mockOne.get(0),
        $mockTwo = $mock.find('.second'),
        mockTwo  = $mockTwo.get(0);

    new FlatJS.Runner({
      attr: 'data-js-mv-test-module'
    });

    var mvModOne = mockOne.fjsComponents ? mockOne.fjsComponents['FlatJS.Component'] : undefined,
        mvModTwo = mockTwo.fjsComponents ? mockTwo.fjsComponents['FlatJS.Component'] : undefined;

    QUnit.deepEqual(APP.Person.find(1).todos, [APP.Todo.find(1), APP.Todo.find(3)], "Object relations are set up via markup if objects are nested within each other's nodes");
    QUnit.equal(APP.Person.find(1).todos.length, 2, "Object relations append correctly onto Model via markup, doesn't re-write existing objects");
    QUnit.equal(APP.Person.find(2).todos.length, 1, "Object relations don't double up on assemblage");


    QUnit.test("FlatJS.Component - JSON Injection / Auto Template creation on relational models", function() {
      // copy pasted from above set of tests, adjusting the object a bit
      mvModOne.fjsData.set('header.title', "Todo List - Updated");
      mvModOne.fjsData.set('people', [
        {
          personObj: APP.Person.find(1)
        }
      ]);

      QUnit.equal(mvModOne.fjsData.header.title, "Todo List - Updated", "updateJSON extends the inner JSON object as expected");

      QUnit.equal($mockOne.find('h1').text(), "Todo List - Updated", "Updating JSON object on model updates HTML in view");
      QUnit.equal($mockOne.find('.person:eq(0) a').text(), 'Bill', "Array of models imported & muted successfully w/ renderFromJson");
      QUnit.equal($mockOne.find('.first-todo:eq(0) span').text(), 'Get Laundry', "Todos translated over");

      $.ajax({

        url: 'Component/mock3.html',
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

  QUnit.test("FlatJS.Component - Testing inputs & various node types for getter / setter functionality", function() {

    new FlatJS.Runner({
      attr: 'data-js-mv-test-module'
    });

    var $mock    = $('#flat-mv-test-mock-3'),
        mvMod    = $mock.get(0).fjsComponents['FlatJS.Component'];

    QUnit.equal(mvMod.fjsData.form.input, $mock.find('#text-input').val(), "Text input value converted to JSON");
    QUnit.equal(mvMod.fjsData.form.radio, "test-radio", "Selected radio field value saved as JSON, not picking up on unselected buttons");
    QUnit.equal(mvMod.fjsData.form.radioOff, false, "Radio field value converted to JSON, dashed key selectors converted to camel case");
    QUnit.equal(mvMod.fjsData.form.checkbox, $mock.find('#checkbox').val(), "Checkbox value converted to JSON");
    QUnit.equal(mvMod.fjsData.form.checkboxOff, false, "Checkbox value converted to JSON");
    QUnit.equal(mvMod.fjsData.form.textarea, "Microphone check one two what is this", "Textarea values converted to JSON");

    mvMod.fjsData.set('form', {
      radio:       "test-radio-2",
      radioOff:    true,
      checkbox:    false,
      checkboxOff: true,
      textarea:    "The five foot assassin with the roughneck business"
    });

    mvMod.fjsData.set('form.input', 'Heyo');

    QUnit.equal($mock.find('#text-input').val(), "Heyo", "Text input updated from JSON");
    QUnit.equal($('#radio').is(':checked'), false, "Selected radio field turned off via JSON");
    QUnit.equal($('#radio-2').is(':checked'), true, "Radio field value changed via JSON");
    QUnit.equal($('#radio-off').is(':checked'), true, "Unselected radio field turned on via JSON");
    
    QUnit.equal(mvMod.fjsData.form.radioOff, 'test-radio-off', "Unselected radio field turned on via JSON, value is imported");
    QUnit.equal($('#checkbox').is(':checked'), false, "Selected checkbox turned off via JSON");
    QUnit.equal($('#checkbox-off').is(':checked'), true, "Unselected checkbox turned on via JSON");
    QUnit.equal(mvMod.fjsData.form.checkboxOff, 'test-checkbox-off', "Unselected checkbox text value imported via JSON.");
    QUnit.equal($mock.find('textarea').val(), "The five foot assassin with the roughneck business", "Textarea values converted to JSON");

    mvMod.fjsData.set('form.checkbox', "new value");

    QUnit.equal($('#checkbox').val(), "new value", "New value set onto checkbox");
    QUnit.ok($('#checkbox').is(':checked'), "Checkbox set on by setting a non false value");

    $mock.remove();
    __MVMockData.startFifthTests();
  });
}

__MVMockData.startFifthTests = function() {

  QUnit.test("FlatJS.Component - Deleting and updating model object behavoir & cleanup", function() {
    
    APP = {};
    $('#mock-area').append(__MVMockData.HTML);

    new FlatJS.Runner({
      attr: 'data-js-mv-test-module'
    });

    var $mock = $('#flat-mv-test-mock'),
        mvMod = $mock.find('.first').get(0).fjsComponents['FlatJS.Component'];

    APP.Person.find(2).delete();

    QUnit.equal($mock.find('.first h2').length, 0, "Deleting model object also removes references in dom");
    QUnit.equal($mock.find('.first [fjs-obj="you"]').length, 0, "Deleting model object also removes references in dom");
    QUnit.equal($mock.find('.first [fjs-resource="APP.Person"][fjs-id="2"]').length, 0, "Deleting model object also removes references in dom");
    QUnit.equal(mvMod.fjsData.you, undefined, "Related object is removed from component's fjsData if model is removed");
    QUnit.equal(mvMod.fjsData.people[1].personObj, undefined, "Related object is removed from component's fjsData if model is removed");

    $mock.remove();
    // TODO: Figure out how to make the below work in a cross browser
    // manner. Also figure out if the functionality really matters -
    // maybe checking whether nodes exist or not on the obj.watch call
    // set in Flat.MV somewhere will work.

    //$('#mock-area').append(__MVMockData.HTML);

    //new FlatJS.Runner({
    //  attr: 'data-js-mv-test-module'
    //});

    //var $mock = $('#flat-mv-test-mock'),
    //    mvMod = $mock.find('.first').get(0).fjsComponents['FlatJS.Component'];

    //var nameNode   = $mock.find('.first h2').get(0),
    //    personNode = $mock.find('.first .person:eq(1)').get(0),
    //    person     = APP.Person.find(2);

    //QUnit.ok(person._('FJSnodes').indexOf(nameNode) !== -1, "Initial name node exists within _('FJSnodes') array");
    //QUnit.ok(person._('FJSnodes').indexOf(personNode) !== -1, "Initial person node exists within _('FJSnodes') array");

    //nameNode.parentNode.removeChild(nameNode);
    //personNode.parentNode.removeChild(personNode);

    //QUnit.equal(person._('FJSnodes').indexOf(nameNode), -1, "DOM Node reference no longer exists within _('FJSnodes') array after being removed from document");
    //QUnit.equal(person._('FJSnodes').indexOf(personNode), -1, "DOM Node reference no longer exists within _('FJSnodes') array after being removed from document");
  })

}
