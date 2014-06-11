// should contain all unit tests on FlatJS.MV.js

var __MVMockData = {
  HTML: ''
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

  QUnit.test("FlatJS.MV existence tests", function() {

    var $mock = $('#flat-mv-test-mock');

    QUnit.equal($mock.length, 1, 'Mock successfully AJAXed in');
    QUnit.equal(typeof FlatJS.MV, 'function', "FlatJS.MV exists, is a function");
    QUnit.equal(typeof FlatJS.MV.extend, 'function', 'FlatJS.MV.extend exists, is a function');

  });

  QUnit.test("FlatJS.MV tests - basic functionality", function() {



  });

};
