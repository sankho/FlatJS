// should contain all unit tests on FlatJS.Classy.js
describe('All unit tests on FlatJS.Classy.js', function() {
  
  it("FlatJS.Classy existence tests", function() {

    assert.equal(typeof FlatJS.Classy, 'function', "FlatJS.Classy exists, is a function");
    assert.equal(typeof FlatJS.Classy.extend, 'function', 'FlatJS.Classy.extend exists, is a function');

  });

  it("FlatJS.Classy OOP tests - class extension, basic functionality", function() {

    var Shape = FlatJS.Classy.extend({

      area: 0,

      init: function(area) {
        this.area = area;
      },

      getArea: function() {
        return this.area;
      }

    });

    Shape.staticFn = function() {
      return "static string";
    }

    var Rect = Shape.extend({

      init: function(width, height) {
        this.width = width;
        this.height = height;

        this._super(width * height);
      },

      width: 0,
      height: 0,

    });

    var Square = Rect.extend({

      init: function(side) {
        this._super(side, side);
      }

    });

    Square.staticFn = function() {
      return "overridden string";
    }

    var exRect = new Rect(5, 2);
    var exSquare = new Square(5);

    assert.ok(typeof Rect === 'function', "Rect is a class")
    assert.ok(typeof Rect.extend === 'function', "Rect is extendable")

    assert.ok(exRect instanceof Rect, "exRect identified as an instance of class Rect")
    assert.ok(exRect instanceof Shape, "exRect identified as an instance of class Shape")

    assert.equal(Rect.staticFn(), "static string", "Static functions are extended")
    assert.equal(Square.staticFn(), "overridden string", "Static functions can be overriden")

    assert.equal(exRect.width, 5, "Rectangle width should be 5")
    assert.equal(exRect.height, 2, "Rectangle height should be 2")
    assert.equal(exRect.getArea(), 10, "Rectangle area should be 10");

    assert.ok(exSquare instanceof Rect, "exSquare identified as an instance of class Rect")
    assert.ok(exSquare instanceof Square, "exSquare identified as an instance of class Square")
    assert.ok(exSquare instanceof Shape, "exSquare identified as an instance of class Shape")

    assert.equal(exSquare.width, 5, "Square width should be 5")
    assert.equal(exSquare.height, 5, "Square height should be 5")
    assert.equal(exSquare.getArea(), 25, "Square area should be 25")

  });

  it("FlatJS.Classy OOP tests - private member functions & psuedo private storage", function() {

    var exClass = FlatJS.Classy.extend(function() {

      function privateFunction() {
        return this._('string');
      }

      return {
        init: function(string) {
          this._('string', string);
        },

        callPrivateFunction: function() {
          return this._(privateFunction)();
        }

      }

    });

    var exObj = new exClass("boosh");
    var exObj2 = new exClass("boosy");

    assert.equal(typeof exObj.callPrivateFunction, 'function', "FlatJS.Classy objects can be extended by passing a function as well");

    assert.equal(exObj.callPrivateFunction(), "boosh", "exObj can call a private function from a public function, get private variable set on init")
    assert.equal(exObj._('string'), "boosh", "psuedo private storage working on object")

    assert.equal(exObj2.callPrivateFunction(), "boosy", "exObj2 can call a private function from a public function, get private variable set on init")
    assert.equal(exObj2._('string'), "boosy", "psuedo private storage working on object")
    assert.equal(typeof privateFunction, 'undefined', "Private function should be out of this scope");

  });

  it("FlatJS.Classy storage tests - created objects should be retained & referenceable statically", function() {

    var exClass = FlatJS.Classy.extend(),
      exChild = new exClass();

    assert.equal(typeof exClass.fjsObjects, 'object', "Created classes should have an array attached called objects");
    assert.equal(exClass.fjsObjects[0], exChild, "First item in created class's objects array matches created chidl");

  });

});
