// should contain all unit tests on FlatJS.Classy.js


QUnit.test("FlatJS.Classy existence tests", function() {

  QUnit.equal(typeof FlatJS.Classy, 'function', "FlatJS.Classy exists, is a function");

  QUnit.equal(typeof FlatJS.Classy.extend, 'function', 'FlatJS.Classy.extend exists, is a function');

});

QUnit.test("FlatJS.Classy OOP tests - class extension, basic functionality", function() {

  var Shape = FlatJS.Classy.extend({

    area: 0,

    init: function(area) {
      this.area = area;
    },

    getArea: function() {
      return this.area;
    }

  });

  var Rect = Shape.extend({

    init: function(width, height) {
      this.width  = width;
      this.height = height;

      this._super(width * height);
    },

    width:  0,
    height: 0,

  });

  var Square = Rect.extend({

    init: function(side) {
      this._super(side, side);
    }

  });

  var exRect   = new Rect(5, 2);
  var exSquare = new Square(5);

  QUnit.ok(typeof Rect === 'function', "Rect is a class")
  QUnit.ok(typeof Rect.extend === 'function', "Rect is extendable")

  QUnit.ok(exRect instanceof Rect, "exRect identified as an instance of class Rect")
  QUnit.ok(exRect instanceof Shape, "exRect identified as an instance of class Shape")

  QUnit.equal(exRect.width, 5, "Rectangle width should be 5")
  QUnit.equal(exRect.height, 2, "Rectangle height should be 2")
  QUnit.equal(exRect.getArea(), 10, "Rectangle area should be 10");

  QUnit.ok(exSquare instanceof Rect, "exSquare identified as an instance of class Rect")
  QUnit.ok(exSquare instanceof Square, "exSquare identified as an instance of class Square")
  QUnit.ok(exSquare instanceof Shape, "exSquare identified as an instance of class Shape")

  QUnit.equal(exSquare.width, 5, "Square width should be 5")
  QUnit.equal(exSquare.height, 5, "Square height should be 5")
  QUnit.equal(exSquare.getArea(), 25, "Square area should be 25")

});

QUnit.test("FlatJS.Classy OOP tests - private member functions & psuedo private storage", function(assert) {

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

  var exObj  = new exClass("boosh");
  var exObj2 = new exClass("boosy");

  QUnit.equal(typeof exObj.callPrivateFunction, 'function', "FlatJS.Classy objects can be extended by passing a function as well");

  QUnit.equal(exObj.callPrivateFunction(), "boosh", "exObj can call a private function from a public function, get private variable set on init")
  QUnit.equal(exObj._('string'), "boosh", "psuedo private storage working on object")

  QUnit.equal(exObj2.callPrivateFunction(), "boosy", "exObj2 can call a private function from a public function, get private variable set on init")
  QUnit.equal(exObj2._('string'), "boosy", "psuedo private storage working on object")
  QUnit.equal(typeof privateFunction, 'undefined', "Private function should be out of this scope");

});

QUnit.test("FlatJS.Classy storage tests - created objects should be retained & referenceable statically", function() {

  var exClass = FlatJS.Classy.extend(),
      exChild = new exClass();

  QUnit.equal(typeof exClass.objects, 'object', "Created classes should have an array attached called objects");
  QUnit.equal(exClass.objects[0], exChild, "First item in created class's objects array matches created chidl");

});
