var FlatJS = FlatJS || {};

FlatJS.Component = FlatJS.Widget.extend(function() {

  var ATTR = {
    resource: 'fjs-resource',
    json:     'fjs-json',
    id:       'fjs-id',
    class:    'fjs-class',
    key:      'fjs-key',
    array:    'fjs-array',
    object:   'fjs-obj'
  }

  var api = {

    fjsTmpl: undefined,
    fjsData: undefined,

    init: function(node) {
      this.obj = node;
      this._(internalInitializer)();
      this._(findAndInitializeModels)();
      this._(assembleJSON)();
      this._(createTemplateFromMarkup)();
      this._(syncMVKeys)();
      this._super(node);
    },

    render: function() {
      this.initializer();
      this.renderUI();
      this._(findAndInitializeModels)();
      this._(applyCSSChanges)();
      this.syncUI();
      this._(bindMVKeys)();
      this.bindUI();
    },

    updateJSON: function(obj) {
      this.fjsData = this.fjsData.extend(obj);
      return this.fjsData;
    },

    renderFromJSON: function(node, parentObj, returnParent) {
      node         = node || this.fjsTmpl;
      parentObj    = parentObj || this.fjsData;
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
        this.obj.textContent ? this.obj.textContent = '' : this.obj.innerHTML = '' ;
        this.obj.appendChild(this.fjsTmpl);
      }
    },

    findResourceFromNode: function(node) {
      if (node.hasAttribute && node.hasAttribute(ATTR.resource) && node.hasAttribute(ATTR.id)) {
        // ugly.
        var model = FlatJS.Helpers.findFunctionByString(FlatJS.Helpers.convertDashedToCamelCase(node.getAttribute(ATTR.resource)));

        return model.find(node.getAttribute(ATTR.id));
      } else if (node === document) {
        return false;
      } else {
        return this.findResourceFromNode(node.parentNode);
      }
    }
  };

  function applyCSSChanges() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.class, this.obj);

    for (var i = 0; i < nodes.length; i++) {
      this._(makeCSSChangeOnNode)(nodes[i]);
    }
  }

  function makeCSSChangeOnNode(node) {
    var obj   = this.findResourceFromNode(node),
        rules = JSON.parse(node.getAttribute(ATTR.class)),
        rules = rules[0].push ? rules : [rules];

    for (var i = 0; i < rules.length; i++) {
      var rule      = rules[i],
          prop      = rule[0],
          val       = rule[1],
          className = rule[2],
          secondary = rule[3],
          match     = obj[prop] == val;

      if (match && node.className.indexOf(className) === -1) {
        node.className = node.className + ' ' + className + ' ';
      } else if (!match && secondary && node.className.indexOf(secondary) === -1) {
        node.className = node.className + ' ' + secondary + ' ';
      }
    }
  }

  function getValueFromNode(node) {
    var type = node.getAttribute('type');

    if (node.innerHTML) {
      return node.innerHTML;
    } else if (type == 'checkbox' || type == 'radio') {
      return node.checked ? node.value !== 'on' ? node.value : true : node.checked;
    } else if (node.value) {
      return node.value;
    }
  }

  function setValueOnNode(node, value) {
    var type = node.getAttribute('type');

    if (type == 'checkbox' || type == 'radio') {
      if (typeof value === 'boolean') {
        node.checked = value;
      } else if (typeof value === 'string') {
        node.checked = true;
        node.value   = value ? value : node.value;
      } else if (typeof value === 'object') {
        node.checked = value.selected;
        node.value   = value.value;
      }
    } else if (type == 'text' || type == 'textarea') {
      node.value = value;
    } else {
      node.innerHTML = value;
    }
  }

  function renderJSONArrayOntoNode(arr, cnnr) {
    var children = cnnr.childNodes,
        tmpl     = false,
        nodes    = [];

    for (var i = 0; i < children.length && !tmpl; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        tmpl = child.cloneNode(true);
      }
    }

    cnnr.innerHTML = '';

    for (var j = 0; j < arr.length; j++) {
      var _tmpl = tmpl.cloneNode(true),
          node  = this.renderFromJSON(_tmpl, arr[j], true);
      if (arr[j].id) {
        node.setAttribute(ATTR.id, arr[j].id);
      }
      cnnr.appendChild(node);
    }
  }

  function renderJSONOntoNode(child, parentObj) {
    var key;

    if (child.hasAttribute(ATTR.key)) {
      key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.key));
      this._(setValueOnNode)(child, parentObj[key]);
      if (parentObj[key] == true && (child.getAttribute('type') === 'radio' || child.getAttribute('type') === 'checkbox')) {
        parentObj[key] = this._(getValueFromNode)(child);
      }
    } else if (child.hasAttribute(ATTR.object)) {
      key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.object));
      this.renderFromJSON(child, parentObj[key]);
    } else if (child.getAttribute(ATTR.resource)) {
      key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.resource));
      if (parentObj[key].id) {
        child.setAttribute(ATTR.id, parentObj[key].id);
      }
      this.renderFromJSON(child, parentObj[key]);
    } else if (child.hasAttribute(ATTR.array)) {
      var key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.array)),
          arr = parentObj[key];
      if (arr && child.childNodes) {
        this._(renderJSONArrayOntoNode)(arr, child);
      }
    } else if (child.childNodes && child.childNodes.length > 0) {
      this.renderFromJSON(child, parentObj);
    }
  }

  function internalInitializer() {
    this.fjsData = this.fjsData || new FlatJS.Resource();
  }

  function createTemplateFromMarkup(tmplNode) {
    var tmpl     = tmplNode ? tmplNode : this.obj.cloneNode(true),
        children = tmpl.childNodes;
    this.fjsTmpl = this.fjsTmpl || tmpl;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        if (child.hasAttribute(ATTR.key) || child.hasAttribute(ATTR.key)) {
          this._(setValueOnNode)(child, '');
        } else if (child.hasAttribute(ATTR.id)) {
          child.removeAttribute(ATTR.id);
        } else if (child.hasAttribute(ATTR.array)) {
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
        _child.parentNode.removeChild(_child);
      }
    }
  }

  function findAndInitializeModels() {
    var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.resource, this.obj);

    for (var i = 0; i < modelNodes.length; i++) {
      var node      = modelNodes[i];

      this._(createModelObjectFromNode)(node);
    }
  }

  function createModelObjectFromNode(node) {
    var id        = node.getAttribute(ATTR.id),
        modelName = FlatJS.Helpers.convertDashedToCamelCase(node.getAttribute(ATTR.resource)),
        model     = FlatJS.Helpers.findFunctionByString(
                      modelName,
                      window,
                      FlatJS.Resource.extend({})
                    ),
        obj       = false;

    obj = model.find(id) || new model({ id: id });

    obj.modelName  = obj.modelName  || modelName;
    obj._('fjsNodes', obj._('fjsNodes') || []);
    obj._('fjsNodes').push(node);
    node.object = obj;

    if (node.hasAttribute(ATTR.json)) {
      obj.extend(JSON.parse(node.getAttribute(ATTR.json)));
    }

    this._(stripDataFromNodeAndUpdateObject)(obj, node);

    return obj;
  }

  function stripDataFromNodeAndUpdateObject(obj, node) {
    var children = node.childNodes;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child && child.hasAttribute) {
        if (child.hasAttribute(ATTR.key)) {
          this._(getKeyAndValueFromNodeAndAddToObject)(obj, child);
        } else if (child.hasAttribute(ATTR.array)) {
          this._(checkArrayForModelRelations)(obj, child);
        }
      }

      if (child.childNodes && child.childNodes.length > 0) {
        if (child.hasAttribute && !child.hasAttribute(ATTR.resource)) {
          this._(stripDataFromNodeAndUpdateObject)(obj, child);
        }
      }
    }
  }

  function checkArrayForModelRelations(obj, node) {
    var children  = node.childNodes,
        key       = FlatJS.Helpers.convertDashedToCamelCase(node.getAttribute(ATTR.array)),
        parentObj = obj[key] = obj[key] || [];

    for (var i = 0; i < children.length; i++) {
      var child     = children[i];

      if (child.hasAttribute && child.hasAttribute(ATTR.resource)) {
        var _obj = this._(createModelObjectFromNode)(child);
        if (parentObj.indexOf(_obj) == -1) {
          parentObj.push(_obj);
        }
      }
    }
  }

  function getKeyAndValueFromNodeAndAddToObject(obj, node) {
    var key = FlatJS.Helpers.convertDashedToCamelCase(node.getAttribute(ATTR.key)),
        val = this._(getValueFromNode)(node);

    node.object = obj;
    obj._('fjsNodes').push(node);
    obj[key] = val;
  }

  function syncMVKeyOnObjectChange(prop, oldVal, newVal, obj) {
    for (var i = 0; i < obj._('fjsNodes').length; i++) {
      var node = obj._('fjsNodes')[i];

      if (node && node.getAttribute(ATTR.key) && node.getAttribute(ATTR.key) === prop) {
        this._(setValueOnNode)(node, newVal);
      }
    }
  }

  function syncMVKeys() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.key, this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node && node.object) {
        key  = FlatJS.Helpers.convertDashedToCamelCase(node.getAttribute(ATTR.key)),
        attr = node.object[key];
        if (attr) {
          this._(setValueOnNode)(node, attr);
        }
      }
    }
  }

  function bindMVKeys() {
    var nodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.key, this.obj);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (node && node.object && !node.object._('fjsWatchSet')) {
        node.object._('fjsWatchSet', true);
        node.object.watch(node.getAttribute(ATTR.key), this._(syncMVKeyOnObjectChange));
      }
    }
  }

  function assembleJSON(parentObj, children) {
    children        = children || this.obj.childNodes;
    parentObj       = parentObj || this.fjsData;

    var parentIsArray   = FlatJS.Helpers.isArray(parentObj);

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (child.hasAttribute) {
        var isModel = child.hasAttribute(ATTR.resource);
        if (child.hasAttribute(ATTR.key)) {
          var key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.key));
          if (child.getAttribute('type') === 'radio') {
            parentObj[key] = parentObj[key] || this._(getValueFromNode)(child);
          } else {
            parentObj[key] = this._(getValueFromNode)(child);
          }
        } else if (isModel || child.hasAttribute(ATTR.object)) {
          this._(constructJSONfromNode)(child, parentObj, isModel, parentIsArray);
        } else if (child.hasAttribute(ATTR.array)) {
          this._(constructJSONfromArray)(child, parentObj, parentIsArray);
        } else {
          this._(assembleJSONIfChildren)(child, parentObj);
        }
      }
    }
  }

  function constructJSONfromArray(cnnr, parentObj, parentIsArray) {
    var children  = cnnr.childNodes,
        stop      = false,
        key       = FlatJS.Helpers.convertDashedToCamelCase(cnnr.getAttribute(ATTR.array));
        parentObj = parentObj[key] = [];

    for (var i = 0; i < children.length && !stop; i++) {
      var child = children[i];
      if (child && child.hasAttribute) {
        if (child.hasAttribute(ATTR.resource)) {
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
    var isObj = child.hasAttribute(ATTR.object),
        key   = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(isObj ? ATTR.object : ATTR.array));
    if (isModel) {
      var modelClass = FlatJS.Helpers.findFunctionByString(FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.resource))),
          obj        = modelClass ? modelClass.find(child.getAttribute(ATTR.id)) : false;
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

  FlatJS.Resource.prototype.delete = function() {
    if (this._('fjsNodes')) {
      for (n in this._('fjsNodes')) {
        var node = this._('fjsNodes')[n];
        if (node && node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }
    }
  }

  return api;

});
