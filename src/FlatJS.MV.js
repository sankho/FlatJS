var FlatJS = FlatJS || {};

FlatJS.MV = FlatJS.Widget.extend(function() {

  var api = {

    render: function() {
      this._(internalInitializer)();
      this.initializer();
      this._(findAndInitializeModels)();
      this._(assembleJSON)();
      this._(createTemplateFromMarkup)();
      this.renderUI();
      this._(syncMVKeys)();
      this.syncUI();
      this._(bindMVKeys)();
      this.bindUI();
    },

    JSON: "",

    updateJSON: function(obj) {
      this.JSON = this.JSON.extend(obj);
      return this.JSON;
    },

    renderFromJSON: function(node, parentObj, returnParent) {
      node         = node || this.tmpl;
      parentObj    = parentObj || this.JSON;
      var children = node.childNodes;

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.hasAttribute) {
          this._(renderJSONOntoNode)(child, parentObj);
        }
      }

      if (returnParent) {
        return node;
      } else {
        this.obj.innerHTML = '';
        this.obj.appendChild(this.tmpl);
      }
    }
  };

  function getValueFromNode(node) {
    var type = node.getAttribute('type');

    if (node.innerHTML) {
      return node.innerHTML;
    } else if (type == 'checkbox' || type == 'radios') {
      return {
        value:    node.value,
        selected: node.checked
      };
    } else if (node.value) {
      return node.value;
    }
  }

  function setValueOnNode(node, value) {
    node.innerHTML = value;
  }

  function renderJSONArrayOntoNode(arr, cnnr) {
    var children = cnnr.childNodes,
        tmpl     = false,
        nodes    = [];

    for (var i = 0; i < children.length && !tmpl; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        tmpl = child;
      }
    }

    cnnr.innerHTML = '';

    for (var j = 0; j < arr.length; j++) {
      cnnr.appendChild(this.renderFromJSON(tmpl.cloneNode(true), arr[j], true));
    }
  }

  function renderJSONOntoNode(child, parentObj) {
    var key;

    if (child.hasAttribute('data-json-key')) {
      key = child.getAttribute('data-json-key');
      this._(setValueOnNode)(child, parentObj[key]);
    } else if (child.getAttribute('data-mv-key')) {
      key = child.getAttribute('data-mv-key');
      this._(setValueOnNode)(child, parentObj[key]);
    } else if (child.hasAttribute('data-json-obj')) {
      key = child.getAttribute('data-json-obj');
      this.renderFromJSON(child, parentObj[key]);
    } else if (child.getAttribute('data-mv-model')) {
      this.renderFromJSON(child, parentObj);
    } else if (child.hasAttribute('data-json-array')) {
      var arr = parentObj[child.getAttribute('data-json-array')];
      if (arr && child.childNodes) {
        this._(renderJSONArrayOntoNode)(arr, child);
      }
    } else if (child.childNodes && child.childNodes.length > 0) {
      this.renderFromJSON(child, parentObj);
    }
  }

  function internalInitializer() {
    this.JSON = this.JSON || new FlatJS.Object();
  }

  function createTemplateFromMarkup(tmplNode) {
    var tmpl     = tmplNode ? tmplNode : this.obj.cloneNode(true),
        children = tmpl.childNodes;

    if (!this.tmpl) {
      this.tmpl = tmpl;
    }

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        if (child.hasAttribute('data-mv-key') || child.hasAttribute('data-json-key')) {
          this._(setValueOnNode)(child, '');
        } else if (child.hasAttribute('data-mv-id')) {
          child.removeAttribute('data-mv-id');
        } else if (child.hasAttribute('data-json-array')) {
          this._(pruneArrayToOneElementForTemplate)(child);
        }
      }

      if (child.childNodes && child.childNodes.length > 0) {
        this._(createTemplateFromMarkup)(child);
      }
    }
  }

  function pruneArrayToOneElementForTemplate(child) {
    var children = child.childNodes,
        gotFirst = false;

    for (var i = 0; i < children.length; i++) {
      var _child = children[i];

      if (_child.hasAttribute && !gotFirst) {
        gotFirst = true;
      } else if (_child.hasAttribute) {
        _child.remove();
      }
    }
  }

  function findAndInitializeModels() {
    var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-model', this.obj);

    for (var i = 0; i < modelNodes.length; i++) {
      var node      = modelNodes[i];

      this._(createModelObjectFromNode)(node);
    }
  }

  function createModelObjectFromNode(node) {
    var id        = node.getAttribute('data-mv-id'),
        modelName = node.getAttribute('data-mv-model'),
        model     = FlatJS.Helpers.findFunctionByString(
                      modelName,
                      window,
                      FlatJS.Object.extend({})
                    ),
        obj       = false;

    obj = model.find(id) || new model({ id: id });

    obj.nodes     = obj.nodes || [];
    obj.modelName = obj.modelName || modelName;

    if (node.hasAttribute('data-mv-json')) {
      obj.extend(JSON.parse(node.getAttribute('data-mv-json')));
    }

    this._(stripDataFromNodeAndUpdateObject)(obj, node);

    return obj;
  }

  function stripDataFromNodeAndUpdateObject(obj, node) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child && child.hasAttribute) {
        if (child.hasAttribute('data-mv-key')) {
          this._(getKeyAndValueFromNodeAndAddToObject)(obj, child);
        } else if (child.hasAttribute('data-json-array')) {
          this._(checkArrayForModelRelations)(obj, child);
        }
      }

      if (child.childNodes && child.childNodes.length > 0) {
        if (child.hasAttribute && !child.hasAttribute('data-mv-model')) {
          this._(stripDataFromNodeAndUpdateObject)(obj, child);
        }
      }
    }
  }

  function checkArrayForModelRelations(obj, node) {
    var children  = node.childNodes,
        parentObj = obj[node.getAttribute('data-json-array')] = obj[node.getAttribute('data-json-array')] || [];

    for (var i = 0; i < children.length; i++) {
      var child     = children[i];

      if (child.hasAttribute && child.hasAttribute('data-mv-model')) {
        var _obj = this._(createModelObjectFromNode)(child);
        parentObj.push(_obj);
      }
    }
  }

  function getKeyAndValueFromNodeAndAddToObject(obj, node) {
    var key = node.getAttribute('data-mv-key'),
        val = this._(getValueFromNode)(node);

    node.object = obj;
    obj.nodes.push(node);
    obj[key] = val;
  }

  function syncMVKeyOnObjectChange(prop, oldVal, newVal, obj) {
    for (var i = 0; i < obj.nodes.length; i++) {
      var node = obj.nodes[i];

      if (node && node.getAttribute('data-mv-key') && node.getAttribute('data-mv-key') === prop) {
        this._(setValueOnNode)(node, newVal);
      }
    }
  }

  function syncMVKeys() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-key', this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i],
          attr = node.object[node.getAttribute('data-mv-key')];
      if (attr) {
        this._(setValueOnNode)(node, attr);
      }
    }
  }

  function bindMVKeys() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute('data-mv-key', this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (!node.object._('FJSwatchSet')) {
        node.object._('FJSwatchSet', true);
        node.object.watch(node.getAttribute('data-mv-key'), this._(syncMVKeyOnObjectChange));
      }
    }
  }

  function assembleJSON(parentObj, children) {
    children        = children || this.obj.childNodes;
    parentObj       = parentObj || this.JSON;

    var parentIsArray   = FlatJS.Helpers.isArray(parentObj);

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        var isModel = child.hasAttribute('data-mv-model');
        if (child.hasAttribute('data-json-key')) {
          var key = child.getAttribute('data-json-key');
          parentObj[key] = this._(getValueFromNode)(child);
        } else if (isModel || child.hasAttribute('data-json-obj')) {
          this._(constructJSONfromNode)(child, parentObj, isModel, parentIsArray);
        } else if (child.hasAttribute('data-json-array')) {
          this._(constructJSONfromArray)(child, parentObj, parentIsArray);
        } else {
          this._(assembleJSONIfChildren)(child, parentObj);
        }
      }
    }
  }

  function constructJSONfromArray(cnnr, parentObj, parentIsArray) {
    var children  = cnnr.childNodes,
        stop      = false;
        parentObj = parentObj[cnnr.getAttribute('data-json-array')] = [];

    for (var i = 0; i < children.length && !stop; i++) {
      var child = children[i];
      if (child && child.hasAttribute) {
        if (child.hasAttribute('data-mv-model')) {
          stop = true;
          this._(assembleJSON)(parentObj, children);
        } else {
          var obj = {};
          parentObj.push(obj);
          this._(assembleJSON)(obj, child.childNodes);
        }
      }
    }
  }

  function constructJSONfromNode(child, parentObj, isModel, parentIsArray) {
    var isObj = child.hasAttribute('data-json-obj'),
        key   = child.getAttribute(isObj ? 'data-json-obj' : 'data-json-array');
    if (isModel) {
      var modelClass = FlatJS.Helpers.findFunctionByString(child.getAttribute('data-mv-model')),
          obj        = modelClass ? modelClass.find(child.getAttribute('data-mv-id')) : false;
      if (obj && parentIsArray) {
        parentObj.push(obj);
      } else if (obj) {
        parentObj[key] = obj;
      }
    } else {
      this._(assembleJSONIfChildren)(child, parentObj, key, isObj);
    }
  }

  function assembleJSONIfChildren(child, parentObj, key, isObj) {
    if (child.childNodes && child.childNodes.length > 0) {
      if (key) {
        parentObj = parentObj[key] = isObj ? {} : [];
      }

      this._(assembleJSON)(parentObj, child.childNodes);
    }
  }

  return api;

});
