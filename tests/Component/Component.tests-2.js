(function() {

  var mockData = {
    HTML: '',
    customMV: FlatJS.Component || {}
  }

  $.ajax({

    url: 'Component/mock4.html',
    success: function(data) {
      mockData.HTML = data;
      $('#mock-area').append(data);
      mockData.mockLoadedCallback();
    }

  })

  mockData.mockLoadedCallback = function() {

  }
}()) 
