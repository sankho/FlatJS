// should contain all unit tests on FlatJS.MV.js

var __MVMockData = {
  HTML: ''
}

QUnit.stop();

$.ajax({

  url: 'MV/mock.html',
  success: function(data) {
    __MVMockData.HTML = data;
    $('#mock-area').append(data);
     QUnit.start();
  }

})


QUnit.test("FlatJS.MV existence tests", function() {

  QUnit.equal(typeof FlatJS.MV, 'function', "FlatJS.MV exists, is a function");

  QUnit.equal(typeof FlatJS.MV.extend, 'function', 'FlatJS.MV.extend exists, is a function');

});

QUnit.test("FlatJS.MV tests - class extension, basic functionality", function() {



});
