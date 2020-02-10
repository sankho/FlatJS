// should contain all tests for FlatJS.Resource

describe('FlatJS.Resource', function()
{
it("FlatJS.Resource existence tests", function() {

  assert.equal(typeof FlatJS.Resource, 'function', 'FlatJS.Resource exists and is a function');
  assert.equal(typeof FlatJS.Resource.extend, 'function', 'FlatJS.Resource exists and has an inherited extend function');
  assert.ok(FlatJS.Resource.prototype instanceof FlatJS.Classy, 'FlatJS.Resource inherits FlatJS.Classy');

});

it("FlatJS.Resource construction, setter, watch, and unwatch functionality", function(done) {

  // adds an object with an ID to ensure
  // object X does some work
  var y = new FlatJS.Resource({
    id: 1,
    nest: {
      val: 'heh'
    }
  });
  var x      = new FlatJS.Resource();

  function watchCallback(val, oldVal, name, obj) {
    assert.ok(true, "callback on watch function successful");
    assert.equal(val, 3, "callback on watch function successfully returns changed new value");
    assert.equal(typeof x.id, "number", "temporary ID created");
    assert.equal(oldVal, undefined, "callback on watch function successfully retains old value");
    assert.equal(name, 'g', "callback on watch function successfully retains name of property");
    assert.equal(obj, x, "initial object passed through callback");
  }

  function watchNumArrayCallback(val, oldVal, name, obj) {
    assert.ok(true, "Pushing an object triggers the callback");
    assert.deepEqual(val, [2,3,5], "FlatJS.Resource.prototype.push function works as expected");
    assert.deepEqual(oldVal, [2,3], "Old value retained on push");
  }

  function getNestedValueCallback(val, oldVal, name, obj) {
    assert.ok(true, "Nested values can be set and trigger callbacks");
    assert.equal(val, 'heyo', "Nested value changed in callback");
    assert.deepEqual(obj.nest, { val: 'heyo' }, "Nested object changed on object");
    //QUnit.start();
    done();
  }

  x.watch('g', watchCallback);

  x.set('g', 3);

  assert.equal(x.g, 3, "x.set() sets a variable on the object, successfully mutes actual object");

  x.unwatch('g', watchCallback);

  // will trigger errors if above unwatch call was unsucessful due to check on oldVal.
  x.set('g', 3);

  x.watch('g', watchCallback);

  // check to see if all handlers get deleted by key
  x.unwatch('g');

  // will trigger errors if above unwatch call was unsucessful due to check on oldVal.
  x.set('g', 3);

  x.set('numArray', [2,3]);

  x.watch('numArray', watchNumArrayCallback);

  x.push('numArray', 5);

  y.watch('nest.val', getNestedValueCallback);

  y.set('nest.val', 'heyo');
});

it("FlatJS.Resource static query functions", function() {

  var exClass = FlatJS.Resource.extend();

  for (var id = 0; id < 10; id++) {
    new exClass({
      id: id
    });
  }

  assert.equal(exClass.find(1), exClass.fjsObjects[1], "Objects have static find method which looks in class' objects variable for matching ID values");

});
});
