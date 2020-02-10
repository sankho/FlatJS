// should contain all unit tests on FlatJS.Component.js
describe('FlatJS.Component.js', function() {
  
    var __MVMockData;
    var $mock, $moc2, mock, mock2;
    var mvMod, mvMod2;

    before(function(done) {
      __MVMockData = {
        HTML: '',
        customMV: FlatJS.Component || {}
      }

      $.ajax({

        url: 'Component/mock.html',
        success: function(data) {
          __MVMockData.HTML = data;
          $('#mock-area').append(data);
          
          $mock = $('#flat-mv-test-mock .first'),
          $moc2 = $('#flat-mv-test-mock .second'),
          mock = $mock.get(0),
          mock2 = $moc2.get(0);

          new FlatJS.Runner({
            attr: 'data-js-mv-test-module'
          });

          mvMod = mock.fjsComponents ? mock.fjsComponents['FlatJS.Component'] : null;
          mvMod2 = mock2.fjsComponents ? mock2.fjsComponents['FlatJS.Component'] : null;
          
          done();
        }
      });
    });

    it("FlatJS.Component existence tests", function() {
      var $mock = $('#flat-mv-test-mock');
      assert.equal($mock.length, 1, 'Mock successfully AJAXed in');
      assert.equal(typeof FlatJS.Component, 'function', "FlatJS.Component exists, is a function");
      assert.ok(mvMod instanceof FlatJS.Widget, 'FlatJS.Component is an instance of FlatJS.Widget');
    });

    it("FlatJS.Component tests - DOM loaded model generation & JSON data assembly from markup", function() {
      assert.equal(typeof APP.Todo, 'function', "APP.Todo model references should be automatically generated");
      assert.equal(typeof APP.Person, 'function', "APP.Person model references should be automatically generated");
      assert.equal(APP.Todo.fjsObjects.length, 4, "APP.Todo.fjsObjects has 4 todos in it");
      assert.equal(APP.Person.fjsObjects.length, 2, "APP.Person.fjsObjects has 2 people in it");
      assert.equal(APP.Person.fjsObjects[0].name, "Jane", "APP.Person.fjsObjects[0] has correct data on name")
      assert.equal(APP.Todo.fjsObjects[0].title, "Get Laundry", "APP.Todo.fjsObjects[0] has correct data on title")
      assert.equal(APP.Person.fjsObjects[0].title, undefined, "Person object does not inherit Todo information even though markup is nested.")
      assert.equal(APP.Todo.find(3).somethingExtra, "hey", "camel case conversion working on data-mv-key");

      assert.equal(APP.Todo.find(1).arbitrary, 'key values', "JSON extention of object via data-mv-json key on node successful");
      assert.equal($mock.find('h2').text(), "Jane", "Correct name applied to first instance of model in view, updated from entry of second");

      assert.equal(typeof mvMod.fjsData, "object", "JSON object created & attached to mod");
      assert.equal(mvMod.fjsData.you, APP.Person.find(2), "JSON object successfully creates pointers to related Person model objects")
      assert.equal(mvMod.fjsData.header.title, "Todo List", "Non model string data saved to JSON object as well")
      assert.equal(mvMod.fjsData.people[0].personObj, APP.Person.find(1), "Models are saved as relations to the JSON object, pushed onto array as well, camel case conversion working on data-json-obj")
      assert.equal(typeof mvMod.fjsData.people[0].todos, 'object', 'Todos successfully  added to individual people object');
      assert.equal(mvMod.fjsData.people[1].todos.length, 4, "Basic arrays are saving basic objects based on markup within arrays");
      assert.equal(mvMod.fjsData.people[1].todos[0].title, "Get Dinner", "Correct object in basic arrays within arrays");
      assert.equal(mvMod.fjsData.header.arbitraryTopTitle, "Hey now", "Camel case conversion taking place for data-json-key");

    });

    it('FlatJS.Component - CSS Classes are added on attribute check', function() {
      assert.ok($mock.find('.first-todo:eq(0)').hasClass('completed'), 'Classes added if array passed to attribute defining a key value match and a class name.');
      assert.ok($moc2.find('li:eq(0)').hasClass('not-completed'), 'Default / secondary classes added if array passed to attribute defining a key value non match and a class name corrseponding to that lack of match. Words.');
      assert.ok(APP.Todo.find(31).completed, "Model set by fjs-class statement + class existence");
      assert.ok($moc2.find('li:eq(1)').hasClass('not-completed') && $moc2.find('li:eq(1)').hasClass('whatever'), 'Multiple class assertions successfully made on object if double sided array passed.');

      APP.Todo.find(31).set('completed', true);
      assert.ok($('[fjs-id="31"]').hasClass('completed'), "fjs-class attributes are bound to resource object changes");

      assert.ok($mock.find('#root-class-swap').hasClass('false'), "fjs-class attribtues updates class HTML when given markup that isn't consistent with data model")
      mvMod.fjsData.set('arbitraryRootKey', 'Not Valuable');
      assert.ok($mock.find('#root-class-swap').hasClass('true'), "fjs-class attributes work when set to listen to objects on the root of fjsData variable");

      mvMod.fjsData.set('header.arbitraryTopTitle2', 'Hey Hey');
      assert.equal($mock.find('h5:eq(1)').text(), 'Hey Hey', 'Dom elements bound to nested variables off root fjsData variable');
      assert.ok($mock.find('#inner-item-class-swap').hasClass('true'), 'fjs-class attributes work when set to listen to objects nested within the root fjsData variable');

    });

    it("FlatJS.Component - Changing model objects should update HTML", function() {
      APP.Todo.fjsObjects[0].set('title', 'Cook Dinner');
      APP.Todo.find(2).set('title', 'Cook Lasagana');
      assert.equal($('.first .first-todo span').text(), 'Cook Dinner', "HTML syncs on object change successfully - first item");
      assert.equal($('.second .first-todo span').text(), 'Cook Lasagana', "HTML syncs on object change successfully - first item");
    });

    it("FlatJS.Component - Finding model object from HTML Nodes", function() {
      var node = $mock.find('h2').get(0);

      assert.equal(mvMod.findResourceFromNode($mock.find('h2').get(0)), APP.Person.find(2), "FlatJS.Component.findResourceFromNode works as expected");
      assert.equal(mvMod.findResourceFromNode($mock.find('li.first-todo:eq(0)').get(0)), APP.Todo.find(1));
    });

    describe('Start Second Tests', function(done) 
    {
      it("FlatJS.Component - JSON update syncing", function() {
      // reset everything
      $('#flat-mv-test-mock').remove();
      $('#mock-area').append(__MVMockData.HTML);

      var $mock = $('#flat-mv-test-mock'),
        $mockOne = $mock.find('.first'),
        mockOne = $mockOne.get(0),
        $mockTwo = $mock.find('.second'),
        mockTwo = $mockTwo.get(0);

      new FlatJS.Runner({
        attr: 'data-js-mv-test-module'
      });

      var mvModOne = mockOne.fjsComponents ? mockOne.fjsComponents['FlatJS.Component'] : undefined,
        mvModTwo = mockTwo.fjsComponents ? mockTwo.fjsComponents['FlatJS.Component'] : undefined;

      mvModOne.fjsData.set('header.title', "Todo List - Updated");
      mvModOne.fjsData.set('people', [{
        personObj: APP.Person.find(2),
        todos: [
          APP.Todo.find(1)
        ]
      }]);

      assert.equal(mvModOne.fjsData.header.title, "Todo List - Updated", "Updating fjsData extends the inner JSON object as expected");
      assert.equal(mvModOne.fjsData.people[0].personObj.name, "Jane", "Updating fjsData updates the inner JSON object as expected");

      assert.equal($mockOne.find('h1').text(), "Todo List - Updated", "Updating JSON object on model updates HTML in view");
      assert.equal($mockOne.find('.person:eq(0) a').text(), 'Jane', "Array of models imported & muted successfully w/ renderFromJson");
      assert.equal($mockOne.find('.first-todo:eq(0) span').text(), 'Get Laundry', "Todos translated over");

    });
    
    describe('Start Third Tests', function() {
      
      var mvModOne, mvModTwo;
      var $mockOne; 
      
      before(function(done) {
        $.ajax({

          url: 'Component/mock2.html',
          success: function(data) {
            $mock.remove();
            __MVMockData.HTML2 = data
            $('#mock-area').append(data, done);
            
             // Initialize 
             $mock = $('#flat-mv-test-mock-2');
       
             $mockOne = $mock.find('.first'),
             mockOne = $mockOne.get(0),
             $mockTwo = $mock.find('.second'),
             mockTwo = $mockTwo.get(0);
        
             new FlatJS.Runner({
               attr: 'data-js-mv-test-module'
             });

             mvModOne = mockOne.fjsComponents ? mockOne.fjsComponents['FlatJS.Component'] : undefined,
             mvModTwo = mockTwo.fjsComponents ? mockTwo.fjsComponents['FlatJS.Component'] : undefined;
          
            // Completed
            done();
          }
        });
      });
      
      it("FlatJS.Component - Relational information drawn from mockup", function() 
      {
         
          assert.deepEqual(APP.Person.find(1).todos, [APP.Todo.find(1), APP.Todo.find(3)], "Object relations are set up via markup if objects are nested within each other's nodes");
          assert.equal(APP.Person.find(1).todos.length, 2, "Object relations append correctly onto Model via markup, doesn't re-write existing objects");
          assert.equal(APP.Person.find(2).todos.length, 1, "Object relations don't double up on assemblage");

        });

        it("FlatJS.Component - JSON Injection / Auto Template creation on relational models", function() {
          // copy pasted from above set of tests, adjusting the object a bit
          mvModOne.fjsData.set('header.title', "Todo List - Updated");
          mvModOne.fjsData.set('people', [{
            personObj: APP.Person.find(1)
          }]);

          assert.equal(mvModOne.fjsData.header.title, "Todo List - Updated", "updateJSON extends the inner JSON object as expected");

          assert.equal($mockOne.find('h1').text(), "Todo List - Updated", "Updating JSON object on model updates HTML in view");
          assert.equal($mockOne.find('.person:eq(0) a').text(), 'Bill', "Array of models imported & muted successfully w/ renderFromJson");
          assert.equal($mockOne.find('.first-todo:eq(0) span').text(), 'Get Laundry', "Todos translated over");

        });
        
        describe('Start Four test', function() {
          before(function(done){
            $.ajax({

              url: 'Component/mock3.html',
              success: function(data) {
                  $mock.remove();
                  __MVMockData.HTML3 = data;
                  $('#mock-area').append(data);
                  done();
                }
            });
          });
          
          it("FlatJS.Component - Testing inputs & various node types for getter / setter functionality", function() {

            new FlatJS.Runner({
              attr: 'data-js-mv-test-module'
            });

            var $mock = $('#flat-mv-test-mock-3'),
              mvMod = $mock.get(0).fjsComponents['FlatJS.Component'];

            assert.equal(mvMod.fjsData.form.input, $mock.find('#text-input').val(), "Text input value converted to JSON");
            assert.equal(mvMod.fjsData.form.radio, "test-radio", "Selected radio field value saved as JSON, not picking up on unselected buttons");
            assert.equal(mvMod.fjsData.form.radioOff, false, "Radio field value converted to JSON, dashed key selectors converted to camel case");
            assert.equal(mvMod.fjsData.form.checkbox, $mock.find('#checkbox').val(), "Checkbox value converted to JSON");
            assert.equal(mvMod.fjsData.form.checkboxOff, false, "Checkbox value converted to JSON");
            assert.equal(mvMod.fjsData.form.textarea, "Microphone check one two what is this", "Textarea values converted to JSON");

            mvMod.fjsData.set('form', {
              radio: "test-radio-2",
              radioOff: true,
              checkbox: false,
              checkboxOff: true,
              textarea: "The five foot assassin with the roughneck business"
            });

            mvMod.fjsData.set('form.input', 'Heyo');

            assert.equal($mock.find('#text-input').val(), "Heyo", "Text input updated from JSON");
            assert.equal($('#radio').is(':checked'), false, "Selected radio field turned off via JSON");
            assert.equal($('#radio-2').is(':checked'), true, "Radio field value changed via JSON");
            assert.equal($('#radio-off').is(':checked'), true, "Unselected radio field turned on via JSON");

            assert.equal(mvMod.fjsData.form.radioOff, 'test-radio-off', "Unselected radio field turned on via JSON, value is imported");
            assert.equal($('#checkbox').is(':checked'), false, "Selected checkbox turned off via JSON");
            assert.equal($('#checkbox-off').is(':checked'), true, "Unselected checkbox turned on via JSON");
            assert.equal(mvMod.fjsData.form.checkboxOff, 'test-checkbox-off', "Unselected checkbox text value imported via JSON.");
            assert.equal($mock.find('textarea').val(), "The five foot assassin with the roughneck business", "Textarea values converted to JSON");

            mvMod.fjsData.set('form.checkbox', "new value");

            assert.equal($('#checkbox').val(), "new value", "New value set onto checkbox");
            assert.ok($('#checkbox').is(':checked'), "Checkbox set on by setting a non false value");

            $mock.remove();
          });

          it("FlatJS.Component - Testing 2 way binding on input types", function() {
            $('#mock-area').append(__MVMockData.HTML3);

            new FlatJS.Runner({
              attr: 'data-js-mv-test-module'
            });

            var $mock = $('#flat-mv-test-mock-3'),
              mvMod = $mock.get(0).fjsComponents['FlatJS.Component'];

            var e = jQuery.Event("keyup");
            e.which = 50;
            e.keyCode = 50;
            $('#text-input').val($('#text-input').val() + 'a');
            $('#text-input').trigger(e);

            assert.equal(mvMod.fjsData.form.input, "testa", "Internal JSON data object updated when text input is updated on keyup");

            var e = jQuery.Event("keyup");
            e.which = 50;
            e.keyCode = 50;
            $('#text-input').val($('#text-input').val() + 'a');
            $('#text-input').trigger(e);
            assert.equal(mvMod.fjsData.form.input, "testaa", "Internal JSON data object updated when text input is updated on keyup");

            $('#radio-2').trigger('click');
            assert.equal(mvMod.fjsData.form.radio, "test-radio-2", "Internal JSON data object updated when radio button is updated on click");

            $('#checkbox').trigger('click');
            $('#checkbox-off').trigger('click');
            assert.equal(mvMod.fjsData.form.checkbox, false, "Internal JSON data object updated when checkbox button is updated on click");
            assert.equal(mvMod.fjsData.form.checkboxOff, "test-checkbox-off", "Internal JSON data object updated when checkbox button is updated on click");

            var e = jQuery.Event("keyup");
            e.which = 50;
            e.keyCode = 50;
            $mock.find('textarea').val($('textarea').val() + 'a');
            $mock.find('textarea').trigger(e);
            assert.equal(mvMod.fjsData.form.textarea, "Microphone check one two what is thisa", "Internal JSON data object updated when textarea is updated on keyup");

            $mock.remove();
          });
          
          describe('Start fifth tests', function() {
              
              before(function(done)
              {
                $('#mock-area').append(__MVMockData.HTML);

                new FlatJS.Runner({
                  attr: 'data-js-mv-test-module'
                });

                $mock = $('#flat-mv-test-mock'),
                mvMod = $mock.find('.first').get(0).fjsComponents['FlatJS.Component'];
                
                done();
              });
            
              it("FlatJS.Component - Deleting and updating model object behavoir & cleanup", function() {
                APP.Person.find(2).remove();

                assert.equal($mock.find('.first h2').length, 0, "Deleting model object also removes references in dom");
                assert.equal($mock.find('.first [fjs-obj="you"]').length, 0, "Deleting model object also removes references in dom");
                assert.equal($mock.find('.first [fjs-resource="APP.Person"][fjs-id="2"]').length, 0, "Deleting model object also removes references in dom");
                assert.equal(mvMod.fjsData.you, undefined, "Related object is removed from component's fjsData if model is removed");
                // Minor tweak: people is undefined, and not people.persObj
                assert.equal(typeof mvMod.fjsData.people[1], 'undefined', "Related object is removed from component's fjsDataif model is removed");
          //
                mvMod.fjsData.push('people', {
                  personObj: APP.Person.find(1),
                  todos: [
                    APP.Person.find(1).todos
                  ]
                });
                APP.Person.find(1).remove();

                assert.equal($mock.find('.first [fjs-resource="APP.Person"][fjs-id="1"]').length, 0, "Deleting model object also removes references in dom");

                $mock.remove();
              });
            });
          });
        
    });
  });
});
