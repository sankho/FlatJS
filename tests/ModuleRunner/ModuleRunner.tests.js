// tests for module runner


QUnit.asyncTest("FlatJS.ModuleRunner Loads Mock File", function(assert) {

  $.ajax({

    url: 'ModuleRunner/mock.html',
    success: function(data) {
      $('#mock-area').append(data);

      mockLoaded();
    }

  })

  function mockLoaded() {

    QUnit.ok($('#module-runner-test-mock').length > 0, "Module runner mock HTML loads and appends via ajax");

    QUnit.start();

  }

});

QUnit.asyncTest("FlatJS.ModuleRunner default functionality", function(assert) {

  QUnit.start();



});
