// tests for module runner

// stores info for tests
var __moduleRunnerMockData;

describe('Runner test',  function()
{

  before(function(done)
  {

    __moduleRunnerMockData = {

      HTML: '',

      moduleOne: function(obj) {
        this.int1 = 33;
        this.int2 = 55;

        obj.innerHTML = obj.innerHTML + '<p>Module One.</p>';
      },

      nested: {
        moduleTwo: FlatJS.Classy.extend({
          init: function(obj) {
            this.int1 = 23;
            this.int2 = 89;

            obj.innerHTML = obj.innerHTML + '<p>Module Two.</p>';
          }
        }),
      },

      basicImplentationTests: function(mock, obj2, nodeSet, done) {
          assert.ok(mock.fjsComponents, "fjsComponents array attaches to <div> on init, init runs by default, works without provided scope");
          assert.ok(mock.fjsComponents[!nodeSet ? '__moduleRunnerMockData.moduleOne' : 'moduleOne'] instanceof __moduleRunnerMockData.moduleOne, "moduleOne module executed on div, retrieves object and is instance of __moduleRunnerMockData.moduleOne");

          assert.ok(obj2.fjsComponents, "jsModules array attaches to <div> on inner <div> recursively");

          assert.ok(obj2.fjsComponents[!nodeSet ? '__moduleRunnerMockData.nested.moduleTwo' : 'nested.moduleTwo'] instanceof __moduleRunnerMockData.nested.moduleTwo, "moduleTwo is assigned appropriately to inner <div>");
          assert.equal(obj2.fjsComponents[!nodeSet ? '__moduleRunnerMockData.nested.moduleTwo' : 'nested.moduleTwo'].int1, 23, "reference to inner object returns correctly set variable retrieved from data attribute");
          
          // Completed
          done();
      }

    };
    
    // Ajax call
    $.ajax({
      url: './Runner/mock.html',
      success: function(data) {
        __moduleRunnerMockData.HTML = data;
        $('#mock-area').append(data);
        //__moduleRunnerMockData.mockLoadedCallback()
        done();
      }
    });
  });


  it("FlatJS.Runner default functionality", function(done) {

    var $mock = $('#module-runner-test-mock'),
        $two  = $mock.find('.module-two'),
        mock  = $mock.get(0),
        obj2  = $two.get(0);

    var runner = new FlatJS.Runner();

    assert.ok($('#module-runner-test-mock').length > 0, "Module runner mock HTML loads and appends via ajax");

    __moduleRunnerMockData.basicImplentationTests(mock, obj2, false, done);

  });

  // reset
  it('FlatJS.Runner - extended functionality', function(done) {

    var $mock = $('#module-runner-test-mock');

    assert.equal(__moduleRunnerMockData.HTML.length, 188)
    //reset
    $mock.remove();
    $('#mock-area').append(__moduleRunnerMockData.HTML);

    var $mock = $('#module-runner-test-mock'),
        $two  = $mock.find('.module-two'),
        mock  = $mock.get(0),
        obj2  = $two.get(0);

    // edit attributes
    $mock.attr('data-new-js-module', 'module-one');
    $two.attr('data-new-js-module', 'nested.module-two');

    var runner = new FlatJS.Runner({
      init:    false,
      context: __moduleRunnerMockData,
      attr:    'data-new-js-module',
      node:    mock
    })

   //TODO fix it
     assert.equal(typeof obj2.jsModules, 'undefined', "Runner does not automatically init if false flag is passed");

    runner.init();

    __moduleRunnerMockData.basicImplentationTests(mock, obj2, true, done);

    $mock.remove();

  });
});
