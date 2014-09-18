var FlatJS = {};

FlatJS.Classy = function() {
    var fnStore = [], varStore = [], initializing = false;
    fnTest = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;
    var Classy = function() {
        this._ = function(fn, val) {
            if (typeof fn === "function") {
                var self = this, store = fnStore[self] = fnStore[self] || [];
                this.icnt = this.icnt || store.length + 1;
                store = store[this.icnt] = store[this.icnt] || [];
                var finalVal = store[fn] = store[fn] || function() {
                    store[fn][self.icnt] = this;
                    return fn.apply(self, arguments);
                };
            } else {
                var finalVal = this._(handlePrivateVariableStorage)(fn, val);
            }
            return finalVal;
        };
    };
    Classy.extend = function(prop) {
        if (typeof prop === "function") {
            prop = prop();
        }
        var _super = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? function(name, fn) {
                return function() {
                    var tmp = this._super;
                    this._super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            }(name, prop[name]) : prop[name];
        }
        function Class() {
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
            Class.fjsObjects.push(this);
        }
        for (var name in this) {
            if (!Class[name]) {
                Class[name] = this[name];
            }
        }
        Class.prototype = prototype;
        Class.prototype.constructor = Class;
        Class.extend = arguments.callee;
        Class.fjsObjects = [];
        return Class;
    };
    function handlePrivateVariableStorage(key, val) {
        var store = varStore[this] = varStore[this] || [];
        store = store[key] = store[key] || [];
        this.varcnt = this.varcnt || store.length + 1;
        store[this.varcnt] = typeof val !== "undefined" ? val : store[this.varcnt] || null;
        return store[this.varcnt];
    }
    return Classy;
}();

FlatJS.Runner = function runner(opts) {
    opts = opts || {};
    var context = opts.context || window, node = opts.node || document, init = opts.init !== undefined ? opts.init : true, attr = opts.attr || "fjs-component", objKey = opts.objKey || "fjsComponents", findFn = opts.findFn || function(fn) {
        fn();
    }, callFn = opts.callFn || false;
    var getAllElementsWithAttribute = FlatJS.Helpers.getAllElementsWithAttribute;
    this.init = function(_node) {
        _node = _node || node;
        var elems = getAllElementsWithAttribute(attr, _node), elemLength = elems.length;
        for (var i = 0; i < elemLength; i++) {
            moduleInit(elems[i]);
        }
    };
    function moduleInit(objNode) {
        var controllers = objNode.getAttribute(attr);
        if (typeof controllers !== "string") {
            return;
        }
        controllers = controllers.split(" ");
        var conCount = controllers.length;
        for (var i = 0; i < conCount; i++) {
            (function() {
                var c = controllers[i];
                var camel = FlatJS.Helpers.convertDashedToCamelCase(c);
                findFn(function() {
                    findAndCallModuleByString(objNode, camel, context);
                }, objNode, c);
            })();
        }
    }
    function findAndCallModuleByString(objNode, origName, parent) {
        var fn = FlatJS.Helpers.findFunctionByString(origName, parent);
        return runMethodOnObj(fn, objNode, origName);
    }
    function runMethodOnObj(fn, objNode, name) {
        if (!objNode[objKey]) {
            objNode[objKey] = {};
        }
        if (typeof callFn === "function") {
            var obj = callFn(fn, objNode);
        } else {
            var obj = new fn(objNode);
        }
        objNode[objKey][name] = obj;
        return obj;
    }
    if (init) {
        this.init();
    }
};

FlatJS.Helpers = {
    convertDashedToCamelCase: function(string) {
        if (string) {
            string = string.replace(/-([a-z0-9])/g, function(g) {
                return g[1].toUpperCase();
            }).replace(/\s+/g, "");
        }
        return string;
    },
    isArray: function(someVar) {
        return Object.prototype.toString.call(someVar) === "[object Array]";
    },
    getAllElementsWithAttribute: function(attribute, node) {
        var matchingElements = [], allElements = node.getElementsByTagName("*"), elemLength = allElements.length;
        for (var i = 0; i < elemLength; i++) {
            if (allElements[i].getAttribute(attribute) !== null) {
                matchingElements.push(allElements[i]);
            }
        }
        if (node !== document && node.getAttribute && node.getAttribute(attribute) !== null) {
            matchingElements.push(node);
        }
        return matchingElements;
    },
    findFunctionByString: function(c, parent, defaultValue) {
        parent = parent || window;
        if (c.indexOf && c.indexOf(".") !== -1) {
            c = c.split(".");
        }
        if (typeof c === "string" && typeof parent[c] === "function") {
            return parent[c];
        } else if (typeof c !== "object") {
            return false;
        }
        var obj = parent[c[0]] || {}, fn = obj[c[1]];
        if (typeof obj === "object" && typeof fn === "function") {
            return fn;
        } else if (typeof fn === "object" && c[2]) {
            c.splice(0, 1);
            return this.findFunctionByString(c, obj, defaultValue);
        } else if (defaultValue && c[1]) {
            var obj = parent[c[0]] = parent[c[0]] || {};
            c.splice(0, 1);
            return this.findFunctionByString(c, obj, defaultValue);
        } else if (defaultValue) {
            parent[c[0]] = defaultValue;
            return parent[c[0]];
        }
    }
};

FlatJS.Widget = function() {
    var Widget = FlatJS.Classy.extend({
        init: function(node) {
            this.fjsRootNode = node;
            if (this.renderOnInit !== false && typeof this.render === "function") {
                this.render();
            }
        },
        render: function() {
            if (!this._("fjsHasRendered")) {
                this._("fjsHasRendered", true);
            } else {
                this.unbindUI();
            }
            this.initializer();
            this.renderUI();
            this.bindUI();
            this.syncUI();
        },
        initializer: function() {},
        renderUI: function() {},
        bindUI: function() {},
        unbindUI: function() {},
        syncUI: function() {}
    });
    return Widget;
}();

FlatJS.Dispatch = function() {
    var cache = {};
    var api = {
        publish: function(topic, args) {
            if (cache[topic]) {
                for (var i = 0; i < cache[topic].length; i++) {
                    if (cache[topic][i]) {
                        cache[topic][i].fn.apply(this, args);
                    }
                }
            }
        },
        subscribe: function(topic, callback) {
            if (!cache[topic]) {
                cache[topic] = [];
            }
            cache[topic].push({
                instance: this,
                fn: callback
            });
        },
        unsubscribe: function(topic, callback) {
            if (cache[topic]) {
                if (callback) {
                    for (var i = 0; i < cache[topic].length; i++) {
                        var obj = cache[topic][i];
                        if (obj && obj.fn && obj.fn === callback) {
                            cache[topic].splice(obj, 1);
                        }
                    }
                } else {
                    if (this !== api) {
                        for (var i = 0; i < cache[topic].length; i++) {
                            var obj = cache[topic][i];
                            if (obj && obj.instance && obj.instance === this) {
                                cache[topic].splice(obj, 1);
                            }
                        }
                    } else {
                        cache[topic] = [];
                    }
                }
            } else if (!topic && !callback && this !== api) {
                for (var topicKey in cache) {
                    var topic = cache[topicKey];
                    for (var cb in topic) {
                        var obj = topic[cb];
                        if (typeof obj.fn === "function" && obj.instance === this) {
                            topic.splice(obj, 1);
                        }
                    }
                }
            }
        }
    };
    if (FlatJS.Classy) {
        FlatJS.Classy.prototype.publish = function(topic, args) {
            this._(api.publish)(topic, args);
        };
        FlatJS.Classy.prototype.subscribe = function(topic, callback) {
            this._(api.subscribe)(topic, callback);
        };
        FlatJS.Classy.prototype.unsubscribe = function(topic, callback) {
            this._(api.unsubscribe)(topic, callback);
        };
    }
    if (FlatJS.Widget) {
        FlatJS.Widget.prototype.destroy = function() {
            this.unsubscribe();
        };
    }
    return api;
}();

FlatJS.Resource = FlatJS.Classy.extend(function() {
    var api = {
        init: function(initialObject) {
            this._("fjsNodes", []);
            this._("fjsCbs", {});
            if (!this.id || initialObject && !initialObject.id) {
                this.id = this._(createTemporaryIdForObject)();
            }
            this.extend(initialObject);
        },
        get: function(prop, setter) {
            prop = prop.split(".");
            var obj = this;
            for (var i = 0; i < prop.length; i++) {
                if (setter !== undefined && i === prop.length - 1) {
                    obj[prop[i]] = setter;
                }
                obj = obj[prop[i]];
            }
            return obj;
        },
        set: function(prop, val) {
            var oldVal = this.get(prop);
            this.get(prop, val);
            if (this._("fjsCbs")) {
                var propCallbacks = this._("fjsCbs")[prop];
                for (var cba in propCallbacks) {
                    var cbs = propCallbacks[cba];
                    callAllFunctions(cbs, prop, oldVal, val, this);
                }
                if (this._("fjsCbs")["all"]) {
                    var cbs = this._("fjsCbs")["all"];
                    callAllFunctions(cbs, prop, oldVal, val, this);
                }
            }
        },
        watch: function(prop, handler) {
            var callbacks = this._("fjsCbs");
            callbacks[prop] = callbacks[prop] || {};
            callbacks[prop][handler] = callbacks[prop][handler] || [];
            callbacks[prop][handler].push(handler);
            this._("fjsCbs", callbacks);
        },
        unwatch: function(prop, handler) {
            var callbacks = this._("fjsCbs");
            if (callbacks && callbacks[prop]) {
                if (handler && callbacks[prop][handler]) {
                    delete callbacks[prop][handler];
                } else if (!handler) {
                    delete callbacks[prop];
                }
            } else {
                this._("fjsCbs", {});
            }
        },
        extend: function(obj) {
            return FlatJS.Resource.objExtend(this, obj);
        },
        push: function(propString, val) {
            var prop = this.get(propString);
            if (prop && typeof prop.push === "function" && typeof prop.slice === "function") {
                var arr = prop.slice();
                arr.push(val);
                this.set(propString, arr);
            }
        },
        remove: function() {
            for (n in this._("fjsNodes")) {
                var node = this._("fjsNodes")[n];
                if (node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
            var index = this.constructor.fjsObjects.indexOf(this);
            this.constructor.fjsObjects.splice(index, 1);
            this.set("fjsRemove", true);
        }
    };
    function createTemporaryIdForObject() {
        var temp_id = Math.floor(Math.random() * 9999 + 1) * -1;
        if (this.constructor.find(temp_id)) {
            return this._(createTemporaryIdForObject)();
        } else {
            return temp_id;
        }
    }
    function callAllFunctions(cbs, prop, oldVal, val, obj) {
        for (var i = 0; i < cbs.length; i++) {
            var cb = cbs[i];
            if (typeof cb == "function") {
                cb(val, oldVal, prop, obj);
            }
        }
    }
    return api;
});

FlatJS.Resource.find = function(id) {
    var obj;
    for (var i = 0; i < this.fjsObjects.length && !obj; i++) {
        var _obj = this.fjsObjects[i];
        if (_obj.id == id) {
            obj = _obj;
        }
    }
    return obj;
};

FlatJS.Resource.objExtend = function() {
    var _class2type = {};
    var _type = function(obj) {
        return obj == null ? String(obj) : _class2type[toString.call(obj)] || "object";
    };
    var _isWindow = function(obj) {
        return obj != null && obj == obj.window;
    };
    var _isFunction = function(target) {
        return toString.call(target) === "[object Function]";
    };
    var _isArray = Array.isArray || function(obj) {
        return _type(obj) === "array";
    };
    var _isPlainObject = function(obj) {
        if (!obj || _type(obj) !== "object" || obj.nodeType || _isWindow(obj)) {
            return false;
        }
        try {
            if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }
        var key;
        for (key in obj) {}
        return key === undefined || hasOwn.call(obj, key);
    };
    var _extend = function() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && !_isFunction(target)) {
            target = {};
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (;i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (_isPlainObject(copy) || (copyIsArray = _isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && _isArray(src) ? src : [];
                        } else {
                            clone = src && _isPlainObject(src) ? src : {};
                        }
                        target[name] = _extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    return _extend;
}();

FlatJS.Component = FlatJS.Widget.extend(function() {
    var ATTR = {
        resource: "fjs-resource",
        json: "fjs-json",
        id: "fjs-id",
        "class": "fjs-class",
        key: "fjs-key",
        array: "fjs-array",
        object: "fjs-obj"
    }, convertCamelCase = FlatJS.Helpers.convertDashedToCamelCase;
    var api = {
        fjsData: undefined,
        render: function() {
            this._(internalInitializer)();
            this._(findAndInitializeResources)();
            this._(assembleJSON)();
            this._(applyCSSChanges)(true);
            this._(bindNodes)();
            this._(syncBindedNodes)();
            this._super();
        },
        assembleFjsData: assembleJSON,
        findResourceFromNode: function(node) {
            if (node.hasAttribute && node.hasAttribute(ATTR.resource) && node.hasAttribute(ATTR.id)) {
                var model = findFn(node.getAttribute(ATTR.resource));
                return model.find(node.getAttribute(ATTR.id));
            } else if (node === document) {
                return false;
            } else {
                return this.findResourceFromNode(node.parentNode);
            }
        }
    };
    function findFn(string) {
        return FlatJS.Helpers.findFunctionByString(convertCamelCase(string));
    }
    function internalInitializer() {
        this.fjsData = this.fjsData || new FlatJS.Resource();
    }
    function applyCSSChanges(applyNodeValueToObj, obj) {
        obj = obj || this.fjsRootNode;
        var nodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.class, obj);
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i], _obj = this.findResourceFromNode(node) || this.fjsData;
            this._(makeCSSChangeOnNode)(node, _obj, applyNodeValueToObj);
        }
    }
    function makeCSSChangeOnNode(node, obj, applyNodeValueToObj) {
        var rules = JSON.parse(node.getAttribute(ATTR.class)), rules = rules[0].push ? rules : [ rules ];
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i], prop = rule[0], val = rule[1], className = rule[2], secondary = rule[3], match = obj[prop] == val;
            if (applyNodeValueToObj && node.className.indexOf(className) !== -1) {
                obj.set(prop, val);
            }
            this._(processCSSRuleOnNode)(node, match, className, secondary);
        }
    }
    function processCSSRuleOnNode(node, match, className, secondary) {
        if (match) {
            if (node.className.indexOf(className) === -1) {
                node.className = node.className + " " + className + " ";
            }
            node.className = node.className.replace(secondary, "");
        } else if (!match) {
            node.className = node.className.replace(className, "");
            node.className = node.className.replace(secondary, "");
            if (secondary && node.className.indexOf(secondary) === -1) {
                node.className = node.className + " " + secondary + " ";
            }
        }
    }
    function getValueFromNode(node) {
        var type = node.getAttribute("type");
        if (node.innerHTML && !node.value) {
            return node.innerHTML;
        } else if (type == "checkbox" || type == "radio") {
            return node.checked ? node.value !== "on" ? node.value : true : node.checked;
        } else if (node.value) {
            return node.value;
        }
    }
    function setValueOnNode(node, value) {
        var type = node.getAttribute("type"), value = value !== undefined ? value : "";
        if (type == "checkbox") {
            if (typeof value === "boolean") {
                node.checked = value;
            } else if (typeof value === "string") {
                node.checked = true;
                node.value = value ? value : node.value;
            } else if (typeof value === "object") {
                node.checked = value.selected;
                node.value = value.value;
            }
        } else if (type == "radio") {
            if (typeof value === "boolean") {
                node.checked = value;
            } else if (node.value == value) {
                node.checked = true;
            } else {
                node.checked = false;
            }
        } else if (type == "text" || typeof node.value !== "undefined") {
            node.value = value;
        } else if (typeof node.innerHTML !== "undefined") {
            node.innerHTML = value;
        }
    }
    function findAndInitializeResources(obj) {
        obj = obj || this.fjsRootNode;
        var modelNodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.resource, obj);
        for (var i = 0; i < modelNodes.length; i++) {
            var node = modelNodes[i];
            this._(createModelObjectFromNode)(node);
        }
    }
    function createModelObjectFromNode(node) {
        var id = node.getAttribute(ATTR.id), modelName = convertCamelCase(node.getAttribute(ATTR.resource)), model = FlatJS.Helpers.findFunctionByString(modelName, window, FlatJS.Resource.extend({})), obj = model.find(id) || new model({
            id: id
        });
        obj.modelName = obj.modelName || modelName;
        if (obj._("fjsNodes").indexOf(node) === -1) {
            obj._("fjsNodes").push(node);
        }
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
        var children = node.childNodes, key = convertCamelCase(node.getAttribute(ATTR.array)), parentObj = obj[key] = obj[key] || [];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.hasAttribute && child.hasAttribute(ATTR.resource)) {
                var _obj = this._(createModelObjectFromNode)(child);
                if (parentObj.indexOf(_obj) == -1) {
                    parentObj.push(_obj);
                }
            }
        }
    }
    function getKeyAndValueFromNodeAndAddToObject(obj, node) {
        var key = convertCamelCase(node.getAttribute(ATTR.key)), val = this._(getValueFromNode)(node);
        obj[key] = val;
    }
    function syncNodeOnObjectChange(newVal, oldVal, prop, obj) {
        for (var i = 0; i < obj._("fjsNodes").length; i++) {
            var node = obj._("fjsNodes")[i], lastKey = prop.split("."), lastKey = lastKey[lastKey.length - 1];
            if (node && node.getAttribute(ATTR.key) && convertCamelCase(node.getAttribute(ATTR.key)) === lastKey) {
                this._(setValueOnNode)(node, newVal);
            } else if (node && obj.get(prop) && obj.get(prop).length && obj.get(prop).push && node.hasAttribute(ATTR.array) && convertCamelCase(node.getAttribute(ATTR.array)) === lastKey) {
                this._(syncArrayOnObjectChange)(node, newVal, oldVal, obj);
            } else if (node && node.hasAttribute(ATTR.object) && convertCamelCase(node.getAttribute(ATTR.object)) === lastKey) {
                this._(renderJSONOntoNode)(node, obj);
            } else if (node && node.hasAttribute(ATTR.class)) {
                this._(applyCSSChanges)(false, node);
            }
        }
    }
    function syncArrayOnObjectChange(node, newVal, oldVal, obj) {
        this._(renderJSONArrayOntoNode)(newVal, node);
        this._(bindNodes)(node);
        this._(findAndInitializeResources)(node);
        this._(applyCSSChanges)();
    }
    function renderJSONArrayOntoNode(arr, cnnr) {
        var children = cnnr.childNodes, tmpl = cnnr.fjsTemplate, nodes = [];
        for (var i = 0; i < children.length && !tmpl; i++) {
            var child = children[i];
            if (child.hasAttribute) {
                tmpl = cnnr.fjsTemplate = child.cloneNode(true);
            }
        }
        cnnr.innerHTML = "";
        for (var j = 0; j < arr.length; j++) {
            var obj = arr[j];
            if (obj) {
                if (obj.id && !obj.constructor.find) {
                    var modelName = convertCamelCase(tmpl.getAttribute(ATTR.resource)), model = FlatJS.Helpers.findFunctionByString(modelName, window, FlatJS.Resource.extend({}));
                    obj = new model({
                        id: obj.id
                    });
                }
                if (!obj.id || obj.id && obj.constructor.find(obj.id)) {
                    var _tmpl = tmpl.cloneNode(true), node = this._(renderFromJSON)(_tmpl, obj, true);
                    if (obj.id) {
                        node.setAttribute(ATTR.id, obj.id);
                    }
                    cnnr.appendChild(node);
                }
            }
        }
    }
    function renderFromJSON(node, parentObj, returnParent) {
        var children = node.childNodes;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.hasAttribute) {
                this._(renderJSONOntoNode)(child, parentObj);
            }
        }
        if (returnParent) {
            return node;
        }
    }
    function renderJSONOntoNode(child, parentObj) {
        var key;
        if (child.hasAttribute(ATTR.key)) {
            key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.key));
            this._(setValueOnNode)(child, parentObj[key]);
            if (parentObj[key] == true && (child.getAttribute("type") === "radio" || child.getAttribute("type") === "checkbox")) {
                parentObj[key] = this._(getValueFromNode)(child);
            }
        } else if (child.hasAttribute(ATTR.object)) {
            key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.object));
            if (parentObj[key]) {
                this._(renderFromJSON)(child, parentObj[key]);
            }
        } else if (child.getAttribute(ATTR.resource)) {
            key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.resource));
            if (parentObj[key].id) {
                child.setAttribute(ATTR.id, parentObj[key].id);
            }
            this._(renderFromJSON)(child, parentObj[key]);
        } else if (child.hasAttribute(ATTR.array)) {
            var key = FlatJS.Helpers.convertDashedToCamelCase(child.getAttribute(ATTR.array)), arr = parentObj[key];
            if (arr && child.childNodes) {
                this._(renderJSONArrayOntoNode)(arr, child);
            }
        } else if (child.childNodes && child.childNodes.length > 0) {
            this._(renderFromJSON)(child, parentObj);
        }
    }
    function syncBindedNodes() {
        var nodes = FlatJS.Helpers.getAllElementsWithAttribute(ATTR.key, this.fjsRootNode);
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node && node.fjsObject) {
                key = convertCamelCase(node.getAttribute(ATTR.key)), attr = node.fjsObject[key];
                if (attr) {
                    this._(setValueOnNode)(node, attr);
                }
            }
        }
    }
    function bindNodes(obj) {
        obj = obj || this.fjsRootNode;
        this._(bindNodesByType)(ATTR.key, obj);
        this._(bindNodesByType)(ATTR.array, obj);
        this._(bindNodesByType)(ATTR.object, obj);
        this._(bindNodesByType)(ATTR.class, obj);
    }
    function bindNodesByType(attr, obj) {
        var nodes = FlatJS.Helpers.getAllElementsWithAttribute(attr, obj);
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i], model = this.findResourceFromNode(node) || this.fjsData;
            if (node && !node.fjsWatchSet) {
                node.fjsWatchSet = true;
                node.fjsObject = node.fjsObject || model;
                if (model._("fjsNodes").indexOf(node) === -1) {
                    model._("fjsNodes").push(node);
                }
                if (attr === ATTR.class) {
                    this._(bindClassNodes)(node, model);
                } else {
                    var key = convertCamelCase(node.getAttribute(attr)), str = node.parentNode && node.parentNode !== document ? this._(createObjectReferenceString)(key, node.parentNode) : key;
                    model.watch(str, this._(syncNodeOnObjectChange));
                    if (this._(isNodeInput)(node)) {
                        this._(setupCallbacksForInputNodes)(node);
                    }
                }
            }
        }
    }
    function bindClassNodes(node, obj) {
        var rules = JSON.parse(node.getAttribute(ATTR.class)), rules = rules[0].push ? rules : [ rules ];
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i], prop = rule[0], str = node.parentNode && node.parentNode !== document ? this._(createObjectReferenceString)(prop, node.parentNode) : prop, str = convertCamelCase(str);
            obj.watch(str, this._(syncNodeOnObjectChange));
        }
    }
    function setupCallbacksForInputNodes(node) {
        var text = node.getAttribute("type"), text = !text || text === "text", $ = typeof jQuery === "function" ? jQuery : false;
        if ($) {
            $(node).on(text ? "keyup" : "change", this._(inputChangeCallback));
        } else {
            node.addEventListener(text ? "keyup" : "change", this._(inputChangeCallback));
        }
    }
    function inputChangeCallback(e) {
        var node = e.currentTarget, val = this._(getValueFromNode)(node), key = convertCamelCase(node.getAttribute(ATTR.key)), str = node.parentNode && node.parentNode !== document ? this._(createObjectReferenceString)(key, node.parentNode) : key, model = this.findResourceFromNode(node) || this.fjsData;
        model.set(str, val);
    }
    function isNodeInput(node) {
        var type = node.tagName, retVal = false, types = [ "INPUT", "TEXTAREA" ];
        return types.indexOf(type) !== -1;
    }
    function createObjectReferenceString(key, node) {
        if (node.hasAttribute(ATTR.object)) {
            key = convertCamelCase(node.getAttribute(ATTR.object)) + "." + key;
        }
        if (node.parentNode && node.parentNode !== this.fjsRootNode && node.parentNode !== document) {
            return this._(createObjectReferenceString)(key, node.parentNode);
        } else {
            return key;
        }
    }
    function assembleJSON(parentObj, children) {
        children = children || this.fjsRootNode.childNodes;
        parentObj = parentObj || this.fjsData;
        var parentIsArray = FlatJS.Helpers.isArray(parentObj);
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.hasAttribute) {
                var isModel = child.hasAttribute(ATTR.resource);
                if (child.hasAttribute(ATTR.key)) {
                    var key = convertCamelCase(child.getAttribute(ATTR.key));
                    if (child.getAttribute("type") === "radio") {
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
        var children = cnnr.childNodes, stop = false, key = convertCamelCase(cnnr.getAttribute(ATTR.array));
        parentObj = parentObj[key] = [];
        for (var i = 0; i < children.length && !stop; i++) {
            var child = children[i];
            if (child && child.hasAttribute) {
                cnnr.fjsTemplate = cnnr.fjsTemplate || child.cloneNode(true);
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
        var isObj = child.hasAttribute(ATTR.object), key = convertCamelCase(child.getAttribute(isObj ? ATTR.object : ATTR.array));
        if (isModel) {
            var modelClass = findFn(child.getAttribute(ATTR.resource)), obj = modelClass ? modelClass.find(child.getAttribute(ATTR.id)) : false;
            if (obj) {
                if (parentIsArray) {
                    parentObj.push(obj);
                } else {
                    parentObj[key] = obj;
                }
                obj.watch("fjsRemove", this._(undefineModelReferenceOnDeletion));
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
    function undefineModelReferenceOnDeletion(val, oldVal, prop, obj) {
        this._(iterateThroughDataAndDeleteObject)(obj, this.fjsData);
    }
    function iterateThroughDataAndDeleteObject(obj, data, superData) {
        for (var n in data) {
            if (data[n] === obj) {
                data[n] = undefined;
                delete data[n];
            } else if (typeof data[n] === "object") {
                this._(iterateThroughDataAndDeleteObject)(obj, data[n], data);
            }
        }
    }
    return api;
});