
// tests for FlatJS.Widget
describe('FlatJS.Widget', function()
{
  var __widgetMockData;
  
  beforeEach(function(done)
  {
    __widgetMockData = {

      HTML: '',
      exampleWidget: FlatJS.Widget.extend({
        initializer: function() {
          this.initialized = true;
        },
        renderUI: function() {
          this.renderUIed = true;
        },
        syncUI: function() {
          this.syncUIed = true;
        },
        bindUI: function() {
          this.bindUIed = true;
        }
      })

    }

    __widgetMockData.nonRenderingWidget =  __widgetMockData.exampleWidget.extend(
    {
      renderOnInit: false
    });
    
    $.ajax({
      url: './Widget/mock.html',
      success: function(data) 
      {
        __widgetMockData.HTML = data;
        $('#mock-area').append(data);
        // Mark as completed
        done();
      }
    });
  });


  it("FlatJS.Widget - Tests lifecycle", function(done) {    
    var $mock = $('#flat-widget-mock');

    assert.ok(true, "mock widget file loaded");
    assert.equal($mock.length, 1, "Mock object exists in DOM")

    var x = new __widgetMockData.exampleWidget($mock.get(0));

    assert.equal(x.initialized, true, "x.initializer() fires on object construction");
    assert.equal(x.renderUIed, true, "x.renderUI() fires on object construction");
    assert.equal(x.syncUIed, true, "x.syncUI() fires on object construction");
    assert.equal(x.bindUIed, true, "x.bindUI() fires on object construction");
    assert.equal(x.fjsRootNode, $mock.get(0), "x.fjsRootNode is equal to the node passed on constructing x");

    var y = new __widgetMockData.nonRenderingWidget($mock.get(0));

    assert.equal(y.initialized, undefined, "y should not render immediately");
    assert.equal(y.fjsRootNode, $mock.get(0), "y.fjsRootNode is equal to the node passed on constructing y");

    y.render();

    assert.equal(y.initialized, true, "y.initializer() fires on object construction");
    assert.equal(y.renderUIed, true, "y.renderUI() fires on object construction");
    assert.equal(y.syncUIed, true, "y.syncUI() fires on object construction");
    assert.equal(y.bindUIed, true, "y.bindUI() fires on object construction");
    
    done();
  });

});
