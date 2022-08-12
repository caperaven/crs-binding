// src/events/compiler.js
var AsyncFunction = Object.getPrototypeOf(async function() {
}).constructor;
function compileExp(exp, parameters, options) {
  parameters = parameters || [];
  let sanitize2 = true;
  let async = false;
  let ctxName = "context";
  if (options != null) {
    if (options.sanitize != null)
      sanitize2 = options.sanitize;
    if (options.async != null)
      async = options.async;
    if (options.ctxName != null)
      ctxName = options.ctxName;
  }
  if (crsbinding._expFn.has(exp)) {
    const x = crsbinding._expFn.get(exp);
    x.count += 1;
    return x;
  }
  let src = exp;
  let san;
  if (sanitize2 == true) {
    san = crsbinding.expression.sanitize(exp, ctxName);
    if (crsbinding._expFn.has(san.expression)) {
      const x = crsbinding._expFn.get(san.expression);
      x.count += 1;
      return x;
    }
    src = san.isLiteral === true ? ["return `", san.expression, "`"].join("") : `return ${san.expression}`;
    const parts = san.expression.split(".");
    if (parts.length > 2) {
      src = `try { ${src} } catch(error) { return null }`;
    }
  } else {
    san = {
      expression: exp
    };
  }
  const fn = async == true ? new AsyncFunction(ctxName, ...parameters, src) : new Function(ctxName, ...parameters, src);
  const result = {
    function: fn,
    parameters: san,
    count: 1
  };
  crsbinding._expFn.set(san.expression, result);
  return result;
}
function releaseExp(exp) {
  if (exp == null || typeof exp != "object")
    return;
  const key = exp.parameters.expression;
  if (crsbinding._expFn.has(key)) {
    const x = crsbinding._expFn.get(key);
    x.count -= 1;
    if (x.count == 0) {
      crsbinding.utils.disposeProperties(x);
      crsbinding._expFn.delete(key);
    }
  }
}

// src/expressions/exp-tokenizer.js
var TokenTypes = Object.freeze({
  WORD: "word",
  LITERAL: "literal",
  FUNCTION: "function",
  PROPERTY: "property",
  OBJECT: "object",
  KEYWORD: "keyword",
  OPERATOR: "operator",
  NUMBER: "number",
  SPACE: "space",
  STRING: "string"
});
function tokenize(exp, isLiteral) {
  const result = [];
  let word = [];
  let i = 0;
  function step(type, value) {
    if (word.length > 0) {
      const value2 = word.join("");
      pushWord(value2);
    }
    result.push({ type, value });
  }
  function pushWord(value) {
    let wordType = TokenTypes.WORD;
    if (keywords.indexOf(value) != -1) {
      wordType = TokenTypes.KEYWORD;
    }
    if (isNaN(Number(value)) == false) {
      wordType = TokenTypes.NUMBER;
    }
    result.push({ type: wordType, value });
    word.length = 0;
  }
  for (i; i < exp.length; i++) {
    const char = exp[i];
    if (char == " ") {
      step(TokenTypes.SPACE, " ");
      continue;
    }
    if (char == "`") {
      step(TokenTypes.LITERAL, "`");
      continue;
    }
    if (char == "$") {
      if (exp[i + 1] == "{") {
        step(TokenTypes.KEYWORD, "${");
        i++;
        continue;
      }
    }
    if (char == "'" || char == '"') {
      const lastIndex = i + exp.length - i;
      let hasLiteral = false;
      if (exp[i + 1] == void 0) {
        step(TokenTypes.STRING, char);
        break;
      }
      let j = i + 1;
      for (j; j < lastIndex; j++) {
        if (exp[j] == "$" && exp[j + 1] == "{") {
          hasLiteral = true;
          break;
        }
        if (exp[j] == char) {
          const value = exp.substring(i, j + 1);
          step(TokenTypes.STRING, value);
          break;
        }
      }
      if (hasLiteral == true) {
        step(TokenTypes.STRING, char);
      } else {
        i = j;
      }
      continue;
    }
    if (keywords.indexOf(char) != -1) {
      step(TokenTypes.KEYWORD, char);
      continue;
    }
    if (operatorStart.indexOf(char) != -1) {
      for (let j = i; j < i + 4; j++) {
        const charNext = exp[j];
        if (operatorStart.indexOf(charNext) == -1) {
          const value = exp.substring(i, j);
          step(TokenTypes.OPERATOR, value);
          i = j - 1;
          break;
        }
      }
      continue;
    }
    word.push(char);
  }
  if (word.length > 0) {
    pushWord(word.join(""));
  }
  return postProcessTokens(result, isLiteral);
}
function postProcessTokens(tokens, isLiteral) {
  if (tokens.length == 1 && tokens[0].type == TokenTypes.WORD) {
    tokens[0].type = TokenTypes.PROPERTY;
    return tokens;
  }
  let state = [];
  let isObject = false;
  let i = 0;
  while (tokens[i] != void 0) {
    const token = tokens[i];
    const currentState = state.length == 0 ? "none" : state[state.length - 1];
    const index = token.value.indexOf(".");
    if (token.type == TokenTypes.WORD) {
      if (currentState == TokenTypes.LITERAL) {
        if (token.value[0] == "." && tokens[i + 1].value == "(") {
          token.type = TokenTypes.FUNCTION;
          i++;
          continue;
        }
        token.type = TokenTypes.PROPERTY;
      } else if (index != -1) {
        if (tokens[i - 1]?.value === ")" && index === 0) {
          token.type = TokenTypes.FUNCTION;
        } else {
          token.type = TokenTypes.PROPERTY;
        }
      } else if (isOperator(tokens[i + 1]) || isOperator(tokens[i + 2])) {
        if (isLiteral !== true && currentState !== TokenTypes.OBJECT) {
          token.type = TokenTypes.PROPERTY;
        }
      } else if (isLiteral !== true && isOperator(tokens[i - 1]) || isOperator(tokens[i - 2])) {
        if (currentState !== TokenTypes.OBJECT) {
          token.type = TokenTypes.PROPERTY;
        }
      } else if (i === 0 && tokens[i + 1]?.value === "(") {
        token.type = TokenTypes.PROPERTY;
      }
    }
    if (token.type == TokenTypes.KEYWORD && token.value == "(" && (tokens[i - 1] && tokens[i - 1].type == TokenTypes.PROPERTY && tokens[i - 1].value[0] != "$")) {
      const path2 = tokens[i - 1].value;
      if (path2.indexOf(".") == -1) {
        tokens[i - 1].type = TokenTypes.FUNCTION;
      } else {
        let dotIndex = path2.length - 1;
        for (let i2 = path2.length - 1; i2 >= 0; i2--) {
          if (path2[i2] == ".") {
            dotIndex = i2;
            break;
          }
        }
        if (dotIndex > 0) {
          const property = path2.substring(0, dotIndex);
          const fnName = path2.substring(dotIndex, path2.length);
          tokens[i - 1].value = property;
          tokens.splice(i, 0, { type: TokenTypes.FUNCTION, value: fnName });
          i++;
        } else {
          tokens[i - 1].type = TokenTypes.FUNCTION;
        }
      }
    }
    if (token.value == "${") {
      state.push(TokenTypes.LITERAL);
    } else if (token.value == "{") {
      state.push(TokenTypes.OBJECT);
    } else if (token.value == "}") {
      state.pop();
    }
    i++;
  }
  if (tokens[0].type === TokenTypes.FUNCTION) {
    tokens[0].type = TokenTypes.PROPERTY;
  }
  return tokens;
}
function isOperator(token) {
  if (token == null)
    return false;
  return token.type == TokenTypes.OPERATOR;
}
var operatorStart = ["=", "!", "<", ">", "+", "-", "*", "/", "&", "|", "?", ":"];
var keywords = ["{", "}", "(", ")", ",", "true", "false", "null", "undefined", "[]"];

// src/expressions/exp-sanitizer.js
var sanitizeKeywords = ["false", "true", "null"];
function sanitizeExp(exp, ctxName = "context", cleanLiterals = false) {
  let isHTML = false;
  if (typeof exp == "string" && exp.indexOf("$html") != -1) {
    isHTML = true;
    exp = exp.split("$html.").join("");
  }
  if (exp == null || exp == "null" || exp == "undefined" || sanitizeKeywords.indexOf(exp.toString()) != -1 || isNaN(exp) == false || exp.trim() == ctxName) {
    return {
      isLiteral: true,
      expression: exp,
      isHTML
    };
  }
  const namedExp = ctxName != "context";
  if (namedExp == true && exp == ["${", ctxName, "}"].join("")) {
    return {
      isLiteral: true,
      expression: exp
    };
  }
  const properties = /* @__PURE__ */ new Set();
  const isLiteral = exp.indexOf("${") != -1;
  const tokens = tokenize(exp, isLiteral);
  const expression = [];
  for (let token of tokens) {
    if (token.type == "property") {
      if (token.value.indexOf("$globals") != -1) {
        expression.push(token.value.replace("$globals", "crsbinding.data.globals"));
      } else if (token.value.indexOf("$event") != -1) {
        expression.push(token.value.replace("$event", "event"));
      } else if (token.value.indexOf("$context") != -1) {
        expression.push(token.value.replace("$context", "context"));
      } else if (token.value.indexOf("$data") != -1) {
        expression.push(token.value.replace("$data", "crsbinding.data.getValue"));
      } else if (token.value.indexOf("$parent") != -1) {
        expression.push(token.value.replace("$parent", "parent"));
      } else if (ctxName !== "context" && token.value.indexOf(`${ctxName}.`) != -1) {
        expression.push(token.value);
      } else {
        expression.push(`${ctxName}.${token.value}`);
      }
      addProperty(properties, token.value, ctxName);
    } else {
      expression.push(token.value);
    }
  }
  return {
    isLiteral,
    isHTML,
    expression: expression.join(""),
    properties: Array.from(properties)
  };
}
var fnNames = [".trim", ".toLowerCase", "toUpperCase"];
var ignoreProperties = ["$data", "$event"];
function addProperty(set, property, ctxName) {
  if (property.length == 0)
    return;
  for (let ignore2 of ignoreProperties) {
    if (property.indexOf(ignore2) != -1)
      return;
  }
  let propertyValue = property;
  const ctxPrefix = `${ctxName}.`;
  if (propertyValue.indexOf(ctxPrefix) == 0) {
    propertyValue = propertyValue.replace(ctxPrefix, "");
  }
  for (let fnName of fnNames) {
    if (propertyValue.indexOf(fnName) != -1) {
      propertyValue = propertyValue.split(fnName).join("");
    }
  }
  set.add(propertyValue);
}

// src/binding/providers/provider-base.js
var ProviderBase = class {
  get data() {
    return crsbinding.data.getValue(this._context);
  }
  constructor(element, context, property, value, ctxName, parentId, changeParentToContext = true) {
    this._cleanEvents = [];
    this._element = element;
    this._context = context;
    this._property = property;
    this._value = value;
    this._ctxName = ctxName || "context";
    this._eventsToRemove = [];
    this._isNamedContext = this._ctxName != "context";
    this._parentId = parentId;
    if (this._value && this._value.indexOf("$parent") != -1 && changeParentToContext == true) {
      this._value = this._value.split("$parent.").join("");
      this._context = parentId;
    }
    if (this._value && this._value.indexOf("$self") != -1) {
      this._value = this._value.split("$self.").join("");
      this._context = this._element._dataId;
    }
    this.init && this.init();
    crsbinding.providerManager.register(this);
    this.initialize().catch((error) => {
      throw error;
    });
    if (this._element.nodeName.indexOf("-") != -1 && this._property == this._ctxName) {
      this._element[this._property] = this._context;
    }
  }
  dispose() {
    this._eventsToRemove.length = 0;
    this._eventsToRemove = null;
    this._element = null;
    this._context = null;
    this._property = null;
    this._value = null;
    this._ctxName = null;
    crsbinding.events.removeOnPath(this._cleanEvents);
    this._cleanEvents = null;
  }
  async initialize() {
  }
  listenOnPath(property, callback) {
    const collection = Array.isArray(property) == true ? property : [property];
    for (let p of collection) {
      const events = crsbinding.events.listenOnPath(this._context, p, callback);
      this._cleanEvents = [...this._cleanEvents, ...events];
    }
  }
};

// src/binding/providers/code-constants.js
var setElementProperty = `requestAnimationFrame(() => element.__property__ = value);`;
var setElementValueProperty = `requestAnimationFrame(() => element.__property__ = value == null ? "" : value);`;
var setElementConditional = "requestAnimationFrame(() => element.__property__ = (__exp__) ? __true__ : __false__)";
var setDataset = `element.dataset["__property__"] = value == null ? "" : value`;
var setClassListRemove = `
if (element.__classList!=null) {
    const remove = Array.isArray(element.__classList) ? element.__classList : [element.__classList];
    remove.forEach(cls => element.classList.remove(cls));
}`;
var setClassListValue = `
element.__classList = value;
const add = Array.isArray(value) ? value : [value];
add.forEach(cls => element.classList.add(cls));`;
var setClassList = `${setClassListRemove} ${setClassListValue}`;
var setClassListCondition = `
    ${setClassListRemove}

    if (__exp__) {
        ${setClassListValue.split("value").join("__true__")}
    }
    else {
        ${setClassListValue.split("value").join("__false__")}
    }
`;

// src/lib/utils.js
function fragmentToText(fragment) {
  const text = [];
  for (let child of fragment.children) {
    text.push(child.outerHTML);
  }
  return text.join("");
}
function cloneTemplate(element) {
  return element.content != null ? element.content.cloneNode(true) : element.children[0].cloneNode(true);
}
function measureElement(element) {
  return new Promise((resolve) => {
    let el = element;
    let result;
    if (element.nodeName === "#document-fragment") {
      el = document.createElement("div");
      el.appendChild(element);
      el.style.width = "max-content";
      el.style.height = "max-content";
      el.style.position = "fixed";
      el.style.transform = "translate(-100px, -100px)";
      document.body.appendChild(el);
      result = el.getBoundingClientRect();
      document.body.removeChild(el);
    } else {
      result = el.getBoundingClientRect();
    }
    resolve(result);
  });
}
var ignoreDispose = ["_element"];
function disposeProperties(obj) {
  if (obj == null || Object.isFrozen(obj))
    return;
  const properties = Object.getOwnPropertyNames(obj).filter((name) => ignoreDispose.indexOf(name) == -1);
  for (let property of properties) {
    const pObj = obj[property];
    if (typeof pObj == "object") {
      if (pObj == null || pObj.autoDispose == false) {
        continue;
      }
      if (Array.isArray(pObj) != true) {
        disposeProperties(pObj);
      }
    }
    delete obj[property];
  }
}
function setElementCleanupProperty(element, property, value) {
  element[property] = value;
  element.__cleanup = element.__cleanup || [];
  element.__cleanup.push(property);
}
function getPathOfFile(file) {
  if (file == null)
    return file;
  if (file[file.length - 1] == "/") {
    return file;
  }
  const parts = file.split("/");
  parts.pop();
  return `${parts.join("/")}/`;
}
function relativePathFrom(source, target) {
  const folder = getPathOfFile(source);
  const processParts = ["", "."];
  const targetParts = target.split("./");
  const sourceParts = folder.split("/");
  sourceParts.pop();
  let count = 0;
  for (let i = 0; i < targetParts.length; i++) {
    const str = targetParts[i];
    if (processParts.indexOf(str) === -1) {
      break;
    }
    if (str == ".") {
      sourceParts.pop();
    }
    count += 1;
  }
  targetParts.splice(0, count);
  const targetStr = targetParts.join("/");
  const sourceStr = sourceParts.join("/");
  return `${sourceStr}/${targetStr}`;
}
function forStatementParts(value) {
  const parts = value.split("of");
  const singular = parts[0].trim();
  const plural = parts[1].trim();
  return {
    singular,
    plural
  };
}
function flattenPropertyPath(prefix, obj, target) {
  if (typeof obj === "string") {
    if (prefix[0] === ".") {
      prefix = prefix.substring(1);
    }
    target[prefix] = obj;
  } else {
    const keys = Object.keys(obj);
    for (let key of keys) {
      flattenPropertyPath(`${prefix}.${key}`, obj[key], target);
    }
  }
}

// src/binding/providers/one-way-utils.js
function getExpForProvider(provider) {
  let result;
  if (provider._property.toLocaleLowerCase() == "classlist") {
    return setClassList;
  }
  if (provider._property.indexOf("data-") != -1) {
    const prop = provider._property.replace("data-", "");
    return setDataset.split("__property__").join(prop);
  }
  result = provider._property == "value" || provider._property == "placeholder" ? setElementValueProperty : setElementProperty;
  provider._property = crsbinding.utils.capitalizePropertyPath(provider._property);
  return result.split("__property__").join(provider._property);
}
function setContext(element, property, context) {
  if (element != null && property != null) {
    const fn = () => {
      element.removeEventListener("ready", fn);
      const value = crsbinding.data.getValue(context);
      setElementCleanupProperty(element, property, value);
    };
    if (element.isReady == true) {
      fn();
    } else {
      element.addEventListener("ready", fn);
    }
  }
}

// src/binding/providers/one-way-provider.js
var OneWayProvider = class extends ProviderBase {
  dispose() {
    const contextPrefix = `${this._ctxName}.`;
    if (this._value.indexOf(contextPrefix) == 0) {
      this._value = this._value.replace(contextPrefix, "");
    }
    if (this._expObj != null) {
      crsbinding.expression.release(this._expObj);
      delete this._expObj;
    }
    this._exp = null;
    this._eventHandler = null;
    super.dispose();
  }
  async initialize() {
    if (this._value == "$context" || this._value == this._ctxName) {
      return setContext(this._element, this._property, this._context);
    }
    this._eventHandler = this.propertyChanged.bind(this);
    this._exp = getExpForProvider(this);
    this._expObj = crsbinding.expression.compile(this._exp, ["element", "value"], { sanitize: false, ctxName: this._ctxName });
    let path2 = this._value;
    if (this._isNamedContext == true) {
      path2 = this._value.split(`${this._ctxName}.`).join("");
    }
    this.listenOnPath(path2, this._eventHandler);
    const value = crsbinding.data.getValue(this._context, path2);
    if (value != null) {
      this.propertyChanged(path2, value);
    }
  }
  propertyChanged(prop, value) {
    if (this._expObj == null)
      return;
    if (this._isLinked != true && this._element._dataId != null) {
      crsbinding.data.link(this._context, prop, this._element._dataId, this._property, value);
      this._isLinked = true;
    }
    crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element, value));
  }
};

// src/binding/providers/bind-provider.js
var changeElements = ["INPUT", "SELECT", "TEXTAREA"];
var BindProvider = class extends OneWayProvider {
  dispose() {
    this._element.removeEventListener(this._eventName, this._changeHandler);
    this._eventName = null;
    this._changeHandler = null;
    super.dispose();
  }
  async initialize() {
    await super.initialize();
    this._changeHandler = this._change.bind(this);
    this._eventName = changeElements.indexOf(this._element.nodeName) !== -1 ? "change" : `${this._property}Change`;
    this._element.addEventListener(this._eventName, this._changeHandler);
    if (this._value.indexOf("$globals.") !== -1) {
      this._context = crsbinding.$globals;
      this._value = this._value.split("$globals.").join("");
    }
  }
  _change(event) {
    let value = event.target[this._property];
    const type = event.target.type || "text";
    const typeFn = `_${type}`;
    if (this[typeFn] != null) {
      value = this[typeFn](value, event.target);
    }
    const oldValue = crsbinding.data.getValue(this._context, this._value);
    crsbinding.data._setContextProperty(this._context, this._value, value, { oldValue, ctxName: this._ctxName, dataType: type == "text" ? "string" : type });
    event.stopPropagation();
  }
  _number(value) {
    return Number(value);
  }
  _date(value) {
    return new Date(value);
  }
  _checkbox(value, element) {
    return element.checked == true;
  }
};

// src/binding/providers/one-way-string-provider.js
var OneWayStringProvider = class extends ProviderBase {
  dispose() {
    if (this._expObj != null) {
      crsbinding.expression.release(this._expObj);
      delete this._expObj;
    }
    this._exp = null;
    this._getValueFn = null;
    this._eventHandler = null;
    super.dispose();
  }
  async initialize() {
    this._eventHandler = this.propertyChanged.bind(this);
    this._exp = getExpForProvider(this);
    this._expObj = crsbinding.expression.compile(this._exp, ["element", "value"], { sanitize: false, ctxName: this._ctxName });
    const san = crsbinding.expression.sanitize(this._value, this._ctxName);
    this._getValueFn = new Function(this._ctxName, `return ${san.expression}`);
    ;
    for (let property of san.properties) {
      this.listenOnPath(property, this._eventHandler);
    }
    this.propertyChanged();
  }
  propertyChanged() {
    const value = this._getValueFn(this.data);
    crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element, value));
  }
};

// src/binding/providers/once-provider.js
function OnceProvider(element, context, property, value, ctxName = "context", parentId) {
  if (ctxName == "context") {
    setContext2(element, context, property, value, parentId);
  } else {
    setItem(element, context, property, value, ctxName, parentId);
  }
  return null;
}
function setContext2(element, context, property, value) {
  setProperty(element, property, crsbinding.data.getValue(context, value));
}
function setItem(element, context, property, value, ctxName) {
  if (ctxName != "context") {
    value = value.split(`${ctxName}.`).join("");
  }
  const data = crsbinding.data.getValue(context, value);
  setProperty(element, property, data);
}
function setProperty(element, property, value) {
  if (property.indexOf("data-") == -1) {
    property = crsbinding.utils.capitalizePropertyPath(property);
    setElementCleanupProperty(element, property, value);
  } else {
    const prop = property.replace("data-", "");
    element.dataset[prop] = value;
  }
}

// src/binding/providers/call-provider.js
var CallProvider = class extends ProviderBase {
  constructor(element, context, property, value, ctxName, parentId) {
    super(element, context, property, value, ctxName, parentId);
    this._eventHandler = this.event.bind(this);
    this._element.addEventListener(this._property, this._eventHandler);
  }
  dispose() {
    this._element.removeEventListener(this._property, this._eventHandler);
    this._eventHandler = null;
    this._fn = null;
    super.dispose();
  }
  async initialize() {
    let src = `context.${this._value}`.split("$event").join("event");
    if (src.indexOf(")") == -1) {
      src = `${src}.call(context, event)`;
    }
    this._fn = new Function("context", "event", src);
  }
  event(event) {
    const context = crsbinding.data.getContext(this._context);
    crsbinding.idleTaskManager.add(this._fn(context, event));
  }
};

// src/binding/providers/inner-provider.js
var InnerProvider = class extends ProviderBase {
  constructor(element, context, property, value, ctxName, parentId) {
    super(element, context, property, value, ctxName, parentId);
    const elementText = element.textContent;
    if (elementText.indexOf("$parent.") != -1) {
      element.textContent = elementText.split("$parent.").join("");
      this._context = parentId;
    }
    this._value = elementText;
    this._eventHandler = this._change.bind(this);
    this._expObj = crsbinding.expression.compile(this._value, null, { ctxName: this._ctxName });
    for (let prop of this._expObj.parameters.properties) {
      this.listenOnPath(prop, this._eventHandler);
    }
    this._change();
  }
  dispose() {
    crsbinding.expression.release(this._expObj);
    this._expObj = null;
    super.dispose();
    this._eventHandler = null;
  }
  _change() {
    if (this._expObj == null)
      return;
    let value = this._expObj.function(this.data);
    value = value == null ? "" : value.split("undefined").join("");
    let target = "textContent";
    if (this._expObj.parameters.isHTML == true) {
      target = "innerHTML";
    }
    this._element[target] = value;
  }
};

// src/binding/providers/attr-provider.js
var AttrProvider = class extends ProviderBase {
  constructor(element, context, property, value, ctxName, parentId) {
    super(element, context, property, value, ctxName, parentId);
    this._eventHandler = this._change.bind(this);
    this._expObj = crsbinding.expression.compile(this._value, null, { ctxName: this._ctxName });
    for (let prop of this._expObj.parameters.properties) {
      this.listenOnPath(prop, this._eventHandler);
    }
    this._change();
  }
  dispose() {
    crsbinding.expression.release(this._expObj);
    this._expObj = null;
    super.dispose();
    this._eventHandler = null;
  }
  _change() {
    const value = this._expObj.function(this.data);
    if (value == null) {
      this._element.removeAttribute(this._property);
    } else {
      this._element.setAttribute(this._property, value);
    }
  }
};

// src/binding/providers/repeat-base-provider.js
var RepeatBaseProvider = class extends ProviderBase {
  dispose() {
    this._singular = null;
    this._plural = null;
    this._container = null;
    this._collectionChangedHandler = null;
    this.positionStruct.addAction = null;
    this.positionStruct.removeAction = null;
    this.positionStruct = null;
    super.dispose();
  }
  async initialize() {
    this._container = this._element.parentElement;
    this._shouldClearAll = this._container.children.length == 1;
    this._determineInsertParameters();
    const parts = this._value.split("of");
    this._singular = parts[0].trim();
    this._plural = parts[1].trim();
    this._collectionChangedHandler = this._collectionChanged.bind(this);
    this.listenOnPath(this._plural, this._collectionChangedHandler);
  }
  async _collectionChanged(context, newValue) {
    if (newValue == null)
      return this._clear();
    await this._renderItems(newValue);
  }
  _determineInsertParameters() {
    const nSibling = this._element.nextElementSibling;
    const pSibling = this._element.previousElementSibling;
    this.positionStruct = {
      startIndex: Array.from(this._container.children).indexOf(this._element),
      addAction: nSibling != null ? this._insertBefore.bind(nSibling) : this._appendItems.bind(this._element),
      removeAction: () => this._removeBetween.call(this._element, pSibling, nSibling)
    };
  }
  _appendItems(element) {
    this.parentElement.appendChild(element);
  }
  _insertBefore(element) {
    this.parentElement.insertBefore(element, this);
  }
  _removeBetween(beforeElement, afterElement) {
    const elements = Array.from(this.parentElement.children);
    let startIndex = elements.indexOf(beforeElement);
    let endIndex = elements.indexOf(afterElement);
    if (startIndex == -1)
      startIndex = 0;
    if (endIndex == -1)
      endIndex = elements.length;
    const elementsToRemove = [];
    for (let i = startIndex + 1; i < endIndex; i++) {
      if (elements[i].nodeName.toLowerCase() != "template") {
        elementsToRemove.push(elements[i]);
      }
    }
    for (let element of elementsToRemove) {
      element.parentElement.removeChild(element);
    }
  }
  _clear() {
    if (this._shouldClearAll == true) {
      this._clearAll();
    } else {
      this._clearPartial();
    }
  }
  _clearAll() {
    const elements = Array.from(this._container.children).filter((el) => el.nodeName.toLowerCase() != "template");
    for (let child of elements) {
      child.parentElement.removeChild(child);
      crsbinding.observation.releaseBinding(child);
    }
  }
  _clearPartial() {
    this.positionStruct.removeAction();
  }
  async _renderItems() {
    this._clear();
  }
  async createElement(item, arrayId) {
    const reference = this._element.dataset.reference || "array-item";
    const id = crsbinding.data.createReferenceTo(this._context, `${this._context}-${reference}-${arrayId}`, this._plural, arrayId);
    const element = crsbinding.utils.cloneTemplate(this._element);
    await crsbinding.parsers.parseElement(element, id, {
      ctxName: this._singular,
      parentId: this._context
    });
    item.__uid = id;
    for (let child of element.children) {
      child.dataset.uid = id;
    }
    return element;
  }
  updateAttributeProviders(element) {
    for (let p of element.__providers || []) {
      const provider = crsbinding.providerManager.items.get(p);
      if (provider instanceof AttrProvider) {
        provider._change();
      }
    }
  }
};

// src/binding/providers/for-provider.js
var ForProvider = class extends RepeatBaseProvider {
  init() {
    this._itemsAddedHandler = this._itemsAdded.bind(this);
    this._itemsDeletedHandler = this._itemsDeleted.bind(this);
  }
  dispose() {
    this._itemsAddedHandler = null;
    this._itemsDeletedHandler = null;
    super.dispose();
  }
  async initialize() {
    super.initialize();
    crsbinding.data.setArrayEvents(this._context, this._plural, this._itemsAddedHandler, this._itemsDeletedHandler);
  }
  async _renderItems(array) {
    await super._renderItems();
    const fragment = document.createDocumentFragment();
    for (let item of array) {
      item.__aId = crsbinding.data.nextArrayId();
      const element = await this.createElement(item, item.__aId);
      fragment.appendChild(element);
    }
    this.positionStruct.addAction(fragment);
    if (this._container.__providers == null) {
      this._container.__providers = [];
    }
    if (this._container.__providers.indexOf(this.id) == -1) {
      this._container.__providers.push(this.id);
    }
    this._container.dispatchEvent(new CustomEvent("rendered"));
  }
  _itemsAdded(added, collection) {
    for (let i = 0; i < added.length; i++) {
      const item = added[i];
      const index = collection.indexOf(item);
      item.__aId = crsbinding.data.nextArrayId();
      this.createElement(item, item.__aId).then((element) => {
        const update = element.children[0];
        const child = this._container.children[index + this.positionStruct.startIndex + 1];
        this._container.insertBefore(element, child);
        this.updateAttributeProviders(update);
      });
    }
  }
  _itemsDeleted(removed, collection) {
    if (removed == null)
      return;
    const elements = [];
    const array = Array.isArray(removed) ? removed : [removed];
    for (let item of array) {
      const uid = item.__uid;
      const result = this._container.querySelectorAll([`[data-uid="${uid}"]`]);
      result.forEach((element) => elements.push(element));
      crsbinding.data.removeObject(uid);
    }
    for (let element of elements) {
      if (element != null) {
        element.parentElement.removeChild(element);
        crsbinding.observation.releaseBinding(element);
      }
    }
  }
};

// src/binding/providers/if-provider.js
var IfProvider = class extends ProviderBase {
  constructor(element, context, property, value, ctxName, parentId) {
    super(element, context, property, value, ctxName, parentId, false);
  }
  dispose() {
    crsbinding.expression.release(this._expObj);
    delete this._expObj.parentObj;
    delete this._expObj;
    this._eventHandler = null;
    super.dispose();
  }
  async initialize() {
    this._sanitizeProperties = ["fill", "stroke"];
    this._eventHandler = this.propertyChanged.bind(this);
    let sanProp;
    if (this._value.indexOf("?") == -1) {
      sanProp = this._initCndAttr();
    } else if (this._value.indexOf(":") != -1) {
      sanProp = this._initCndValue();
    } else {
      sanProp = this._initCndAttrValue();
    }
    if (this._value.indexOf("$parent") != -1) {
      this._expObj.parentObj = crsbinding.data.getValue(this._parentId);
      sanProp.properties.forEach((path2) => {
        if (path2.indexOf("$parent.") != -1) {
          const p = path2.replace("$parent.", "");
          const events = crsbinding.events.listenOnPath(this._parentId, p, this._eventHandler);
          this._cleanEvents = [...this._cleanEvents, events];
        }
      });
    }
    this.propertyChanged();
  }
  _initCndAttr() {
    const value = crsbinding.expression.sanitize(this._value, this._ctxName);
    const fnCode = initCndAttrExp.split("__exp__").join(value.expression).split("__attr__").join(this._property).split("__attr-value__").join(this._property);
    this._expObj = crsbinding.expression.compile(fnCode, ["element", "parent"], { sanitize: false, ctxName: this._ctxName });
    this.listenOnPath(value.properties.filter((item) => item.indexOf("$parent") == -1), this._eventHandler);
    return value;
  }
  _initCndValue() {
    const value = crsbinding.expression.sanitize(this._value, this._ctxName);
    const parts = value.expression.split("?");
    const valueParts = parts[1].split(":");
    const tval = this._sanitizeValue(valueParts[0].trim());
    const fval = this._sanitizeValue(valueParts[1].trim());
    const fnCode = initCndValueExp.split("__exp__").join(parts[0].trim()).split("__attr__").join(this._property).split("__true__").join(tval).split("__false__").join(fval);
    this._expObj = crsbinding.expression.compile(fnCode, ["element", "parent"], { sanitize: false, ctxName: this._ctxName });
    this.listenOnPath(value.properties, this._eventHandler);
    return value;
  }
  _initCndAttrValue() {
    const value = crsbinding.expression.sanitize(this._value, this._ctxName);
    const parts = value.expression.split("?");
    const fnCode = initCndAttrExp.split("__exp__").join(parts[0].trim()).split("__attr__").join(this._property).split("__attr-value__").join(parts[1].trim());
    this._expObj = crsbinding.expression.compile(fnCode, ["element", "parent"], { sanitize: false, ctxName: this._ctxName });
    this.listenOnPath(value.properties, this._eventHandler);
    this.propertyChanged();
    return value;
  }
  _sanitizeValue(value) {
    if (this._sanitizeProperties.indexOf(this._property) == -1)
      return value;
    return value.split("'").join("");
  }
  propertyChanged() {
    try {
      crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element, this._expObj.parentObj));
    } catch {
      return;
    }
  }
};
var initCndAttrExp = `
if (__exp__) {
    element.setAttribute("__attr__", "__attr-value__");
}
else {
    element.removeAttribute("__attr__");
}
`;
var initCndValueExp = `
if (__exp__) {
    element.setAttribute("__attr__", __true__);
}
else {
    element.setAttribute("__attr__", __false__);
}
`;

// src/binding/providers/if-classlist-provider.js
var IfClassProvider = class extends ProviderBase {
  constructor(element, context, property, value, ctxName, parentId) {
    super(element, context, property, value, ctxName, parentId);
  }
  dispose() {
    crsbinding.expression.release(this._expObj);
    delete this._expObj;
    this._eventHandler = null;
    super.dispose();
  }
  async initialize() {
    this._eventHandler = this.propertyChanged.bind(this);
    const parts = this._value.split("?");
    const value = crsbinding.expression.sanitize(parts[0], this._ctxName);
    const condition = value.expression;
    const values = parts[1].split(":");
    const trueValue = values[0].trim();
    const falseValue = values.length > 1 ? values[1].trim() : "[]";
    const fnCode = setClassListCondition.split("__property__").join(this._property).split("__exp__").join(condition).split("__true__").join(trueValue).split("__false__").join(falseValue);
    this._expObj = crsbinding.expression.compile(fnCode, ["element"], { sanitize: false, ctxName: this._ctxName });
    this.listenOnPath(value.properties, this._eventHandler);
    this.propertyChanged();
  }
  propertyChanged() {
    try {
      crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element));
    } catch {
      return;
    }
  }
};

// src/binding/providers/if-styles-provider.js
var IfStylesProvider = class extends ProviderBase {
  constructor(element, context, property, value, ctxName, parentId) {
    super(element, context, property, value, ctxName, parentId);
  }
  dispose() {
    crsbinding.expression.release(this._expObj);
    delete this._expObj;
    this._eventHandler = null;
    super.dispose();
  }
  async initialize() {
    this._eventHandler = this.propertyChanged.bind(this);
    const value = crsbinding.expression.sanitize(this._value, this._ctxName);
    const parts = value.expression.split("?");
    const condition = parts[0].trim();
    const values = parts[1].split(":");
    const trueValue = values[0].trim();
    const falseValue = values.length > 1 ? values[1].trim() : '""';
    const fnCode = setElementConditional.split("__property__").join(crsbinding.utils.capitalizePropertyPath(this._property)).split("__exp__").join(condition).split("__true__").join(trueValue).split("__false__").join(falseValue);
    this._expObj = crsbinding.expression.compile(fnCode, ["element"], { sanitize: false, ctxName: this._ctxName });
    this.listenOnPath(value.properties, this._eventHandler);
    this.propertyChanged();
  }
  propertyChanged() {
    try {
      crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element));
    } catch {
      return;
    }
  }
};

// src/binding/providers/for-once-provider.js
function ForOnceProvider(element, context, property, value, ctxName = "context", parentId) {
  if (value.indexOf("$parent.") != -1) {
    value = value.split("$parent.").join("");
    context = parentId;
  }
  const parts = forStatementParts(value);
  const singular = parts.singular;
  const plural = parts.plural;
  const key = `for-once-${singular}`;
  crsbinding.inflationManager.register(key, element, singular);
  const data = crsbinding.data.getValue(context, plural);
  const elements = crsbinding.inflationManager.get(key, data);
  crsbinding.inflationManager.unregister(key);
  element.parentElement.appendChild(elements);
  element.parentElement.removeChild(element);
}

// src/binding/providers/for-map-provider.js
var ForMapProvider = class extends RepeatBaseProvider {
  dispose() {
    super.dispose();
  }
  async _renderItems(array) {
    await super._renderItems();
    const fragment = document.createDocumentFragment();
    const keys = array.keys();
    for (let key of keys) {
      const value = array.get(key);
      value.__aId = key;
      fragment.appendChild(await this.createElement(value, key));
    }
    this.positionStruct.addAction(fragment);
    if (this._container.__providers == null) {
      this._container.__providers = [];
    }
    if (this._container.__providers.indexOf(this.id) == -1) {
      this._container.__providers.push(this.id);
    }
  }
};

// src/binding/providers/emit-provider.js
var EmitProvider = class extends CallProvider {
  async initialize() {
    const fnParts = this._value.split("(");
    const name = fnParts[0];
    const argsStr = [`{`];
    if (fnParts.length > 0) {
      this._getParametersCode(fnParts[1], argsStr);
    }
    argsStr.push("}");
    const src = this._getSource(name, argsStr.join(""));
    this._fn = new Function("context", src);
  }
  _getSource(name, args) {
    return `crsbinding.events.emitter.emit("${name}", ${args});`;
  }
  _getParametersCode(parameters, args) {
    if (parameters == null)
      return;
    const argParts = parameters.split(")").join("").split(",");
    for (let i = 0; i < argParts.length; i++) {
      const ap = argParts[i];
      const v = ap.trim();
      if (this[v] != null) {
        this[v](args);
      } else {
        this._processArg(v, args);
      }
      if (i < argParts.length - 1) {
        args.push(",");
      }
    }
  }
  "$event"(args) {
    args.push("event: event");
  }
  "$context"(args) {
    args.push("context: context");
  }
  _processArg(value, args) {
    const parts = value.split("=");
    const property = parts[0].trim();
    const code = this._processValue(parts[1]);
    args.push(`${property}:${code}`);
  }
  _processValue(value) {
    if (value.indexOf("${") != -1) {
      return value.split("${").join("context.").split("}").join("");
    }
    return value;
  }
};

// src/binding/providers/post-provider.js
var PostProvider = class extends EmitProvider {
  async initialize() {
    const queryStartIndex = this._value.indexOf("[");
    const queryEndIndex = this._value.indexOf("]");
    const queries = this._value.substring(queryStartIndex + 1, queryEndIndex).split(" ").join("").split(",");
    const name = this._value.substring(0, queryStartIndex).trim();
    const argsStr = [`{key: "${name}",`];
    const argsStartIndex = this._value.indexOf("(");
    const argsEndIndex = this._value.indexOf(")");
    if (argsStartIndex != -1) {
      const args = this._value.substring(argsStartIndex + 1, argsEndIndex);
      this._getParametersCode(args, argsStr);
    }
    argsStr.push("}");
    const src = this._getSource(queries, argsStr.join(""));
    this._fn = new Function("context", src);
  }
  _getSource(queries, args) {
    const code = [];
    for (let query of queries) {
      query = query.split("'").join("").split('"').join("");
      code.push(`crsbinding.events.emitter.postMessage("${query}", ${args});`);
    }
    return code.join("\n");
  }
};

// src/binding/providers/setvalue-provider.js
var SetValueProvider = class extends CallProvider {
  async initialize() {
    const src = this._createSource();
    this._fn = new Function("context", "event", "setProperty", src);
  }
  _createSource() {
    if (this._value.trim()[0] != "[") {
      return this._createSourceFrom(this._value);
    }
    const result = [];
    const exps = this._value.substr(1, this._value.length - 2);
    const parts = exps.split(";");
    for (let part of parts) {
      result.push(this._createSourceFrom(part.trim()));
    }
    return result.join("\n");
  }
  _createSourceFrom(exp) {
    const parts = exp.split("=");
    const value = this._processRightPart(parts[1].trim());
    const src = this._processLeftPart(parts[0].trim(), value);
    return src;
  }
  _processRightPart(part) {
    return crsbinding.expression.sanitize(part, this._ctxName, true).expression;
  }
  _processLeftPart(part, value) {
    if (part.indexOf("$globals") != -1) {
      return this._getGlobalSetter(part, value);
    } else {
      return this._getContextSetter(part, value);
    }
  }
  _getGlobalSetter(part, value) {
    const path2 = part.replace("$globals.", "");
    return `crsbinding.data.setProperty({_dataId: crsbinding.$globals}, "${path2}", ${value});`;
  }
  _getContextSetter(part, value) {
    part = part.replace("$context.", "");
    if (value.indexOf("context.") != -1) {
      const parts = value.split("context.");
      const property = parts[parts.length - 1];
      let prefix = parts[0] == "!" ? "!" : "";
      value = `${prefix}crsbinding.data.getValue({_dataId: ${this._context}}, "${property}")`;
    }
    return `crsbinding.data.setProperty({_dataId: ${this._context}}, "${part}", ${value});`;
  }
  event(event) {
    const context = crsbinding.data.getContext(this._context);
    crsbinding.idleTaskManager.add(this._fn(context, event, this._setProperty));
    event.stopPropagation();
  }
  _setProperty(obj, property, value) {
    if (value !== void 0) {
      crsbinding.data.setProperty(this, property, value);
    }
  }
};

// src/binding/providers/process-provider.js
var ProcessProvider = class extends ProviderBase {
  constructor(element, context, property, value, ctxName, parentId) {
    super(element, context, property, value, ctxName, parentId);
    this._eventHandler = this.event.bind(this);
    this._element.addEventListener(this._property, this._eventHandler);
  }
  dispose() {
    this._element.removeEventListener(this._property, this._eventHandler);
    this._eventHandler = null;
    super.dispose();
  }
  event() {
    if (globalThis.crs?.process == null) {
      return console.error("crs-process-api not present or running at this time");
    }
    if (this._value[0] == "{") {
      executeStep(this);
    } else {
      const left = this._value.split("{")[0];
      if (left.indexOf("[") == -1) {
        executeFunction(this);
      } else {
        executeProcess(this);
      }
    }
  }
};
function executeStep(provider) {
  const exp = sanitize(provider._value, provider._context);
  const step = getObject(exp, provider._context);
  const ctx = crsbinding.data.getContext(provider._context);
  crs.process.runStep(step, ctx, null, null);
}
function executeFunction(provider) {
  const exp = sanitize(provider._value, provider._context);
  const parts = exp.split("(");
  const fnParts = parts[0].split(".");
  const stepStr = `{type: "${fnParts[0]}", action: "${fnParts[1]}", args: ${parts[1]}}`.replace(")", "");
  const step = getObject(stepStr, provider._context);
  const ctx = crsbinding.data.getContext(provider._context);
  crs.process.runStep(step, ctx, null, null);
}
function executeProcess(provider) {
  const exp = sanitize(provider._value, provider._context);
  const schemaParts = exp.split("[");
  const schema = schemaParts[0];
  const processParts = schemaParts[1].replace("]", "").split("(");
  const process = processParts[0];
  const parameters = getParameters(processParts[1].replace(")", "").trim(), provider._context);
  const ctx = crsbinding.data.getContext(provider._context);
  const args = {
    context: ctx,
    step: {
      action: process,
      args: {
        schema
      }
    }
  };
  if (parameters != null) {
    args.parameters = parameters;
  }
  crsbinding.events.emitter.emit("run-process", args);
}
function getObject(str, id) {
  if (str.indexOf("{") == -1) {
    str = `{${str}}`;
  }
  const fn = new Function("context", `return ${str};`);
  const context = crsbinding.data.getContext(id);
  const binding = crsbinding.data.getData(id).data;
  let ctx = {};
  Object.assign(ctx, binding);
  Object.assign(ctx, context);
  const result = fn(ctx);
  ctx = null;
  return result;
}
function getParameters(str, id) {
  if (str.length == 0)
    return null;
  return getObject(str, id);
}
function sanitize(str, bId) {
  return str.replace("bId", `bId: ${bId}`).split("$context.").join("context.");
}

// src/binding/provider-factory.js
var ProviderFactory = class {
  static "bind"(element, context, property, value, ctxName, attr, parentId) {
    if (["value", "checked"].indexOf(property) != -1) {
      return new BindProvider(element, context, property, value, ctxName, parentId);
    } else {
      return this["one-way"](element, context, property, value, ctxName, parentId);
    }
  }
  static "two-way"(element, context, property, value, ctxName, attr, parentId) {
    return new BindProvider(element, context, property, value, ctxName, parentId);
  }
  static "one-way"(element, context, property, value, ctxName, attr, parentId) {
    if (value[0] == "`") {
      return new OneWayStringProvider(element, context, property, value, ctxName, parentId);
    }
    return new OneWayProvider(element, context, property, value, ctxName, parentId);
  }
  static "once"(element, context, property, value, ctxName, attr, parentId) {
    return OnceProvider(element, context, property, value, ctxName, parentId);
  }
  static "call"(element, context, property, value, ctxName, attr, parentId) {
    return new CallProvider(element, context, property, value, ctxName, parentId);
  }
  static "delegate"(element, context, property, value, ctxName, attr, parentId) {
    return new CallProvider(element, context, property, value, ctxName, parentId);
  }
  static "emit"(element, context, property, value, ctxName, attr, parentId) {
    return new EmitProvider(element, context, property, value, ctxName, parentId);
  }
  static "post"(element, context, property, value, ctxName, attr, parentId) {
    return new PostProvider(element, context, property, value, ctxName, parentId);
  }
  static "setvalue"(element, context, property, value, ctxName, attr, parentId) {
    return new SetValueProvider(element, context, property, value, ctxName, parentId);
  }
  static "inner"(element, context, property, value, ctxName, attr, parentId) {
    return new InnerProvider(element, context, property, value, ctxName, parentId);
  }
  static "for"(element, context, property, value, ctxName, attr, parentId) {
    const parts = attr.name.split(".");
    const customProvider = parts.length > 1 ? crsbinding.providerManager.providers.for[parts[1]] : null;
    if (customProvider != null) {
      return new customProvider(element, context, property, value, ctxName, parentId);
    } else {
      return new ForProvider(element, context, property, value, ctxName, parentId);
    }
  }
  static "if"(element, context, property, value, ctxName, attr, parentId) {
    if (property.toLowerCase() == "classlist") {
      return new IfClassProvider(element, context, property, value, ctxName, parentId);
    }
    if (property.toLowerCase().indexOf("style.") != -1) {
      return new IfStylesProvider(element, context, property, value, ctxName, parentId);
    }
    return new IfProvider(element, context, property, value, ctxName, parentId);
  }
  static "attr"(element, context, property, value, ctxName, attr, parentId) {
    return new AttrProvider(element, context, property, value, ctxName, parentId);
  }
  static "process"(element, context, property, value, ctxName, attr, parentId) {
    return new ProcessProvider(element, context, property, value, ctxName, parentId);
  }
};

// src/binding/parse-element.js
var ignore = ["style", "script"];
async function parseElements(collection, context, options) {
  for (let element of collection || []) {
    await crsbinding.parsers.parseElement(element, context, options);
  }
}
async function parseElement(element, context, options) {
  let ctxName = "context";
  let parentId = null;
  let folder = null;
  if (options != null) {
    ctxName = options.ctxName || "context";
    parentId = options.parentId || null;
    folder = options.folder || null;
  }
  if (element.__inflated == true)
    return;
  const nodeName = element.nodeName.toLowerCase();
  if (ignore.indexOf(nodeName) != -1)
    return;
  if (nodeName != "template" && nodeName != "perspective-element" && element.children?.length > 0) {
    await parseElements(element.children, context, options);
  }
  if (nodeName == "template" && element.getAttribute("src") != null) {
    return await parseHTMLFragment(element, context, options);
  }
  const attributes = Array.from(element.attributes || []);
  const boundAttributes = attributes.filter(
    (attr) => attr.ownerElement.tagName.toLowerCase() == "template" && attr.name == "for" || attr.name.indexOf(".") != -1 || (attr.value || "").indexOf("${") == 0 || (attr.value || "").indexOf("&{") == 0
  );
  await parseAttributes(boundAttributes, context, ctxName, parentId);
  if (element.textContent.indexOf("&{") !== -1) {
    element.textContent = await crsbinding.translations.get_with_markup(element.textContent);
  } else if (element.children && element.children.length == 0 && (element.textContent || "").indexOf("${") != -1) {
    ProviderFactory["inner"](element, context, null, null, ctxName, null, parentId);
  } else if (nodeName === "svg") {
    crsbinding.svgCustomElements.parse(element);
  }
}
async function parseAttributes(collection, context, ctxName, parentId) {
  for (let attr of collection) {
    if (attr.nodeValue.indexOf("&{") !== -1) {
      attr.nodeValue = await crsbinding.translations.get_with_markup(attr.nodeValue);
    } else {
      await parseAttribute(attr, context, ctxName, parentId);
    }
  }
}
async function parseAttribute(attr, context, ctxName, parentId) {
  const parts = attr.name.split(".");
  let prop = parts.length == 2 ? parts[0] : parts.slice(0, parts.length - 1).join(".");
  let prov = prop == "for" ? prop : parts[parts.length - 1];
  if (prop.length == 0 && attr.value[0] == "$") {
    prop = prov;
    prov = "attr";
  }
  const provider = ProviderFactory[prov](attr.ownerElement, context, prop, attr.value, ctxName, attr, parentId);
  if (provider == null || provider.constructor.name != "AttrProvider" || attr.nodeName.indexOf(".attr") != -1) {
    attr.ownerElement.removeAttribute(attr.nodeName);
  }
  return provider;
}
async function parseHTMLFragment(element, context, options) {
  if (options?.folder == null)
    return;
  const file = crsbinding.utils.relativePathFrom(options.folder, element.getAttribute("src"));
  const tpl = document.createElement("template");
  tpl.innerHTML = await fetch(file).then((result) => result.text());
  const instance = tpl.content.cloneNode(true);
  await parseElements(instance.children, context, options);
  const parent = element.parentElement;
  parent.insertBefore(instance, element);
  parent.removeChild(element);
}
function releaseBinding(element) {
  crsbinding.providerManager.releaseElement(element);
}
function releaseChildBinding(element) {
  for (let child of element.children) {
    releaseBinding(child);
  }
}

// src/binding/providers/for-radio-provider.js
var ForRadioProvider = class extends ProviderBase {
  dispose() {
    for (let input of this.inputs) {
      input.removeEventListener("change", this._changeHandler);
    }
    this.inputs = null;
    this._changeHandler = null;
    this._propertyToSet = null;
    super.dispose();
  }
  async initialize() {
    this._propertyToSet = this._element.getAttribute("property");
    this._changeHandler = this._change.bind(this);
    const parts = this._value.split("of");
    const singular = parts[0].trim();
    const plural = parts[1].trim();
    const key = `for-group-${singular}`;
    crsbinding.inflationManager.register(key, this._element, singular);
    const data = crsbinding.data.getValue(this._context, plural);
    const elements = crsbinding.inflationManager.get(key, data);
    crsbinding.inflationManager.unregister(key);
    const currentSelectedValue = crsbinding.data.getProperty(this._context, this._propertyToSet);
    this.inputs = elements.querySelectorAll("input");
    for (let input of this.inputs) {
      input.setAttribute("type", "radio");
      input.setAttribute("name", plural);
      input.addEventListener("change", this._changeHandler);
      if (currentSelectedValue && input.getAttribute("value") == currentSelectedValue.toString()) {
        input.setAttribute("checked", "checked");
      }
    }
    this._element.parentElement.appendChild(elements);
    this._element.parentElement.removeChild(this._element);
  }
  async _change(event) {
    crsbinding.data.setProperty(this._context, this._propertyToSet, event.target.value);
  }
};

// src/managers/provider-manager.js
var ProviderManager = class {
  constructor() {
    this._nextId = 0;
    this.items = /* @__PURE__ */ new Map();
    this.providers = {
      for: {
        map: ForMapProvider,
        once: ForOnceProvider,
        radio: ForRadioProvider
      }
    };
  }
  async register(provider) {
    provider.id = this._nextId;
    if (provider._element.__providers == null) {
      Reflect.set(provider._element, "__providers", []);
    }
    provider._element.__providers.push(this._nextId);
    this.items.set(this._nextId, provider);
    this._nextId += 1;
  }
  async releaseElement(element) {
    if (element.nodeName.toLowerCase() == "svg") {
      crsbinding.svgCustomElements.release(element);
    }
    for (let property of element.__cleanup || []) {
      element[property] = null;
    }
    for (let child of element.children || []) {
      await this.releaseElement(child);
    }
    if (element.__providers == null)
      return;
    for (let id of element.__providers) {
      let provider = this.items.get(id);
      this.items.delete(id);
      provider && provider.dispose();
      provider = null;
    }
    delete element.__providers;
    if (this.items.size == 0) {
      this._nextId = 0;
    }
  }
};

// src/idle/idleCallback.js
globalThis.requestIdleCallback = globalThis.requestIdleCallback || function(cb) {
  const start = Date.now();
  return setTimeout(function() {
    cb({
      didTimeout: false,
      timeRemaining: function() {
        return Math.max(0, 50 - (Date.now() - start));
      }
    });
  }, 1);
};
globalThis.cancelIdleCallback = globalThis.cancelIdleCallback || function(id) {
  clearTimeout(id);
};

// src/idle/idleTaskManager.js
var IdleTaskManager = class {
  constructor() {
    this.processing = false;
    this._list = [];
  }
  dispose() {
    this._list = null;
  }
  async add(fn) {
    if (typeof fn != "function")
      return;
    if (requestIdleCallback == null)
      return await fn();
    this._list.push(fn);
    if (this.processing == true)
      return;
    await this._processQueue();
  }
  async _processQueue() {
    this.processing = true;
    try {
      requestIdleCallback(async () => {
        while (this._list.length > 0) {
          const fn = this._list.shift();
          try {
            await fn();
          } catch (e) {
            console.error(e);
          }
        }
      }, { timeout: 1e3 });
    } finally {
      this.processing = false;
    }
  }
};

// src/binding/listen-on.js
function listenOnPath(id, property, callback) {
  if (typeof id == "object") {
    id = id.__uid || id._dataId;
  }
  const collection = Array.isArray(property) == true ? property : [property];
  const cleanEvents = [];
  for (let p of collection) {
    if (p.indexOf("$globals.") != -1) {
      id = crsbinding.$globals;
      p = p.replace("$globals.", "");
      addCleanUp(cleanEvents, crsbinding.$globals, p, callback);
    }
    addCallback(id, p, callback, cleanEvents);
  }
  return cleanEvents;
}
function removeOnPath(itemsToRemove) {
  for (let item of itemsToRemove) {
    crsbinding.data.removeCallback(item.context, item.path, item.callback);
    delete item.context;
    delete item.path;
    delete item.callback;
  }
  itemsToRemove.length = 0;
}
function addCallback(context, path2, callback, cleanEvents) {
  crsbinding.data.addCallback(context, path2, callback);
  addCleanUp(cleanEvents, context, path2.split("$parent.").join("").split("$context.").join(""), callback);
}
function addCleanUp(collection, context, path2, callback) {
  collection.push({
    context,
    path: path2,
    callback
  });
}

// src/events/dom-events.js
function domEnableEvents(element) {
  element._domEvents = [];
  element.registerEvent = registerEvent;
  element.unregisterEvent = unregisterEvent;
}
function domDisableEvents(element) {
  if (element._domEvents == null)
    return;
  for (let event of element._domEvents) {
    element.removeEventListener(event.event, event.callback);
    delete event.element;
    delete event.callback;
    delete event.event;
  }
  element._domEvents.length = 0;
  delete element._domEvents;
  delete element.registerEvent;
  delete element.unregisterEvent;
}
function registerEvent(element, event, callback, eventOptions = null) {
  element.addEventListener(event, callback, eventOptions);
  this._domEvents.push({
    element,
    event,
    callback
  });
}
function unregisterEvent(element, event, callback) {
  const item = this._domEvents.find((item2) => item2.element == element && item2.event == event && item2.callback == callback);
  if (item == null)
    return;
  element.removeEventListener(item.event, item.callback);
  this._domEvents.splice(this._domEvents.indexOf(item), 1);
  delete item.element;
  delete item.callback;
  delete item.event;
}

// src/managers/inflation-manager.js
var InflationManager = class {
  constructor() {
    this._items = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._items.clear();
    this._items = null;
  }
  register(id, template, ctxName = "context", measure = false) {
    template = template.cloneNode(true);
    const generator = new InflationCodeGenerator(ctxName, id);
    const result = generator.generateCodeFor(template);
    const templates = generator.templateKeys;
    generator.dispose();
    crsbinding.elementStoreManager.register(id, template, measure);
    this._items.set(id, {
      id,
      childCount: result.childCount,
      inflate: result.inflate,
      deflate: result.deflate,
      templates
    });
  }
  unregister(id) {
    const item = this._items.get(id);
    if (item != null) {
      item.inflate = null;
      item.defaulte = null;
      if (item.templates != null) {
        item.templates.forEach((tplId) => this.unregister(tplId));
      }
      this._items.delete(id);
    }
    crsbinding.elementStoreManager.unregister(id);
  }
  get(id, data, elements, start) {
    const item = this._items.get(id);
    if (item == null)
      return null;
    if (elements != null) {
      return this._getWithElements(item, data, elements, start || 0);
    }
    const length = Array.isArray(data) ? data.length * item.childCount : 1;
    const fragment = crsbinding.elementStoreManager.getElements(id, length);
    this._inflateElements(item, fragment, data);
    return fragment;
  }
  _getWithElements(item, data, elements, start) {
    if (data.length == 0)
      return null;
    const diff = elements.length - data.length * item.childCount;
    let fragment = null;
    if (diff < 0) {
      const length = -1 * diff;
      fragment = crsbinding.elementStoreManager.getElements(item.id, length);
      const offset = length / item.childCount;
      const sub_start_index = data.length - offset;
      const subData = data.slice(sub_start_index, data.length);
      this._inflateElements(item, fragment, subData);
      data = data.slice(0, sub_start_index);
    }
    let index = 0;
    let elementsCollection = [];
    for (let record of data) {
      elementsCollection.length = 0;
      let start_index = start * item.childCount + index * item.childCount;
      for (let i = 0; i < item.childCount; i++) {
        elementsCollection.push(elements[start_index + i]);
      }
      item.inflate(elementsCollection.length > 1 ? elementsCollection : elementsCollection[0], record);
      index += 1;
    }
    if (start == 0 && diff > 0) {
      elementsCollection = Array.from(elements);
      for (let i = diff; i > 0; i--) {
        const element = elementsCollection.pop();
        element.parentElement.removeChild(element);
      }
    }
    return fragment;
  }
  _inflateSingleElement(item, fragment, data) {
    this.inflate(item.id, item.childCount == 1 ? fragment.children[0] : Array.from(fragment.children), data, item.inflate);
  }
  _inflateSingleChildFragment(item, fragment, data) {
    const isArray = Array.isArray(fragment);
    data = Array.isArray(data) ? data : [data];
    for (let i = 0; i < data.length; i++) {
      const child = isArray ? fragment[i] : fragment.children[i];
      this.inflate(item.id, child, data[i], item.inflate);
      child.__inflated = true;
      const attrAttributes = Array.from(child.attributes).filter((attr) => attr.name.indexOf(".attr") != -1);
      for (let attr of attrAttributes) {
        child.removeAttribute(attr.name);
      }
    }
  }
  _inflateMultiChildFragment(item, fragment, data) {
    const srcElements = Array.from(fragment.children);
    let index = 0;
    for (let i = 0; i < data.length; i++) {
      const elements = srcElements.slice(index, index + item.childCount);
      this.inflate(item.id, elements, data[i], item.inflate, false);
      index += item.childCount;
    }
    srcElements.forEach((child) => {
      child.__inflated = true;
      const attrAttributes = Array.from(child.attributes).filter((attr) => attr.name.indexOf(".attr") != -1);
      for (let attr of attrAttributes) {
        child.removeAttribute(attr.name);
      }
    });
    srcElements.filter((el) => el.getAttribute("remove") == "true").forEach((rem) => rem.parentNode.removeChild(rem));
  }
  _inflateElements(item, fragment, data) {
    if (Array.isArray(data) == false) {
      this._inflateSingleElement(item, fragment, data);
    } else if (item.childCount == 1) {
      this._inflateSingleChildFragment(item, fragment, data);
    } else {
      this._inflateMultiChildFragment(item, fragment, data);
    }
  }
  inflate(id, element, data, inflate = null, removeMarked = true) {
    const fn = inflate || this._items.get(id).inflate;
    fn(element, data);
    if (removeMarked == true) {
      this._removeElements(element);
    }
  }
  _removeElements(element) {
    let removedElements = [];
    if (Array.isArray(element)) {
      element.forEach((el) => {
        const removed = el.querySelectorAll('[remove="true"]');
        if (removed.length > 0) {
          removedElements = [...removedElements, ...removed];
        }
      });
    } else {
      removedElements = element.querySelectorAll('[remove="true"]');
    }
    for (let rel of removedElements) {
      rel.parentElement.removeChild(rel);
    }
  }
  deflate(id, elements) {
    const fn = this._items.get(id).deflate;
    if (Array.isArray(elements)) {
      for (let element of elements) {
        fn(element);
      }
    } else {
      fn(elements);
    }
  }
  returnElements(id, elements, restore = false) {
    crsbinding.elementStoreManager.returnElements(id, elements, restore);
  }
};
var InflationCodeGenerator = class {
  constructor(ctxName, parentKey) {
    this.parentKey = parentKey;
    this.templateKeys = [];
    this.inflateSrc = [];
    this.deflateSrc = [];
    this._ctxName = ctxName;
  }
  dispose() {
    this.inflateSrc = null;
    this.deflateSrc = null;
  }
  generateCodeFor(template) {
    const children = template.content == null ? template.children : template.content.children;
    const childCount = children.length;
    if (childCount == 1) {
      this.path = "element";
      for (let element of children) {
        this._processElement(element);
      }
    } else {
      for (let i = 0; i < children.length; i++) {
        this.path = `element[${i}]`;
        this._processElement(children[i]);
      }
    }
    const inflateCode = this.inflateSrc.join("\n");
    const deflateCode = this.deflateSrc.join("\n");
    return {
      childCount,
      inflate: new Function("element", this._ctxName, inflateCode),
      deflate: new Function("element", this._ctxName, deflateCode)
    };
  }
  _processElement(element) {
    this._processTextContent(element);
    this._processAttributes(element);
    const path2 = this.path;
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      if (child.nodeName == "TEMPLATE") {
        this._processTemplate(child);
      } else {
        this.path = `${path2}.children[${i}]`;
        this._processElement(element.children[i]);
      }
    }
  }
  _processTemplate(element) {
    const key = `${this.parentKey}_${this.templateKeys.length + 1}`;
    this.templateKeys.push(key);
    element.dataset.key = key;
    const value = element.getAttribute("for.once");
    if (value != null) {
      const parts = forStatementParts(value);
      const code = `${this.path}.appendChild(crsbinding.inflationManager.get("${key}", ${parts.plural}));`;
      this.inflateSrc.push(code);
      crsbinding.inflationManager.register(key, element, parts.singular);
      element.parentElement.removeChild(element);
    }
  }
  _processTextContent(element) {
    if (element.children == null || element.children.length > 0 || element.textContent.indexOf("${") == -1)
      return;
    const text = (element.innerHTML || "").trim();
    let target = "textContent";
    let exp = text;
    const san = crsbinding.expression.sanitize(exp, this._ctxName);
    exp = san.expression;
    if (san.isHTML == true) {
      target = "innerHTML";
    }
    this.inflateSrc.push([`${this.path}.${target} = \`` + exp + "`"].join(" "));
    this.deflateSrc.push(`${this.path}.${target} = "";`);
  }
  _processAttributes(element) {
    const attributes = Array.from(element.attributes).filter(
      (attr) => attr.value.indexOf("${") != -1 || attr.name.indexOf(".if") != -1 || attr.name.indexOf(".attr") != -1 || attr.name.indexOf("style.") != -1 || attr.name.indexOf("classlist." != -1)
    );
    for (let attr of attributes) {
      if (attr.name.indexOf(".attr") != -1) {
        this._processAttr(attr);
      } else if (attr.value.indexOf("${") != -1) {
        this._processAttrValue(attr);
      } else {
        this._processAttrCondition(attr);
      }
    }
  }
  _processAttr(attr) {
    const attrName = attr.name.replace(".attr", "");
    const exp = crsbinding.expression.sanitize(attr.value, this._ctxName).expression;
    this.inflateSrc.push(`${this.path}.setAttribute("${attrName}", ${exp})`);
  }
  _processAttrValue(attr) {
    const text = attr.value.trim();
    let exp = text.substr(2, text.length - 3);
    exp = crsbinding.expression.sanitize(exp, this._ctxName).expression;
    if (attr.name == "xlink:href") {
      this.inflateSrc.push(`${this.path}.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", ${exp});`);
    } else {
      const parts = exp.split("?");
      this.inflateSrc.push(`if (${parts[0].trim()} != null) {${this.path}.setAttribute("${attr.name}", ${exp});}`);
    }
    this.deflateSrc.push(`${this.path}.removeAttribute("${attr.name}");`);
    attr.ownerElement.removeAttribute(attr.name);
  }
  _processAttrCondition(attr) {
    if (attr.name.trim().indexOf("style.") == 0) {
      return this._processStyle(attr);
    }
    if (attr.name.trim().indexOf("classlist") == 0) {
      return this._processClassList(attr);
    }
    if (attr.name.trim().indexOf(".if") != -1) {
      return this._processConditional(attr);
    }
  }
  _processStyle(attr) {
    const parts = attr.name.split(".");
    const prop = crsbinding.utils.capitalizePropertyPath(parts[1]);
    const value = crsbinding.expression.sanitize(attr.value.trim(), this._ctxName).expression;
    this.inflateSrc.push(`${this.path}.style.${prop} = ${value};`);
    this.deflateSrc.push(`${this.path}.style.${prop} = "";`);
    attr.ownerElement.removeAttribute(attr.name);
  }
  _processClassList(attr) {
    const parts = attr.value.split("?");
    const condition = crsbinding.expression.sanitize(parts[0], this._ctxName).expression;
    const values = parts[1].split(":");
    const trueValue = values[0].trim();
    const falseValue = values.length > 1 ? values[1].trim() : "";
    const trueCode = trueValue.indexOf("[") == -1 ? trueValue : `...${trueValue}`;
    let code = `if (${condition}) {${this.path}.classList.add(${trueCode});}`;
    if (falseValue.length > 0) {
      let falseCode = falseValue.indexOf("[") == -1 ? falseValue : `...${falseValue}`;
      code += `else {${this.path}.classList.add(${falseCode});}`;
    }
    const deflateCode = `while (${this.path}.classList.length > 0) {${this.path}.classList.remove(${this.path}.classList.item(0));}`;
    this.inflateSrc.push(code);
    this.deflateSrc.push(deflateCode);
    attr.ownerElement.removeAttribute(attr.name);
  }
  _processConditional(attr) {
    const attrName = attr.name.split(".if")[0].trim();
    const expParts = attr.value.split("?");
    const condition = crsbinding.expression.sanitize(expParts[0].trim(), this._ctxName).expression;
    let code = [`if(${condition})`];
    const expValue = expParts.length > 1 ? expParts[1].trim() : `"${attrName}"`;
    if (expValue.indexOf(":") == -1) {
      code.push("{");
      code.push(`${this.path}.setAttribute("${attrName}", ${expValue});`);
      code.push("}");
      code.push(`else {${this.path}.removeAttribute("${attrName}")}`);
    } else {
      const condParts = expParts[1].split(":");
      code.push("{");
      code.push(`${this.path}.setAttribute("${attrName}", ${condParts[0].trim()});`);
      code.push("}");
      code.push(`else {${this.path}.setAttribute("${attrName}", ${condParts[1].trim()})}`);
    }
    this.inflateSrc.push(code.join(""));
    this.deflateSrc.push(`${this.path}.removeAttribute("${attrName}")`);
    attr.ownerElement.removeAttribute(attr.name);
  }
};

// src/lib/clone.js
function clone(obj) {
  if (obj == null)
    return obj;
  const result = cleanClone(Object.assign({}, obj));
  return result;
}
function cleanClone(obj) {
  let properties = Object.getOwnPropertyNames(obj).filter((item) => item.indexOf("__") == 0);
  for (let property of properties) {
    delete obj[property];
  }
  properties = Object.getOwnPropertyNames(obj).filter((item) => item.indexOf("__") == -1 && typeof obj[item] == "object");
  for (let property of properties) {
    cleanClone(obj[property]);
  }
  return obj;
}

// src/lib/path-utils.js
function getValueOnPath(object, path2) {
  let obj = object;
  if (path2.indexOf(".") == -1) {
    return obj[path2];
  }
  const parts = path2.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    obj = obj[part];
    if (obj == null)
      return null;
  }
  return obj[parts[parts.length - 1]];
}

// src/store/binding-data-arrays.js
function createArrayProxy(array, id, property) {
  if (array == null)
    return null;
  array.__id = id;
  array.__property = property;
  return new Proxy(array, { get });
}
var deleteFunctions = ["pop", "splice"];
var addFunctions = ["push"];
function get(collection, property) {
  const value = collection[property];
  if (typeof value == "function") {
    return (...args) => {
      const result = collection[property](...args);
      if (deleteFunctions.indexOf(property) != -1) {
        itemsRemoved(collection, result);
        if (property == "splice" && args.length > 2) {
          args = args.splice(2, args.length);
          itemsAdded(collection, args);
        }
      } else if (addFunctions.indexOf(property) != -1) {
        itemsAdded(collection, args);
      }
      return result;
    };
  }
  return value;
}
function itemsRemoved(collection, items) {
  const id = collection.__id;
  const property = collection.__property;
  crsbinding.data.arrayItemsRemoved(id, property, items, collection);
}
function itemsAdded(collection, items) {
  const id = collection.__id;
  const property = collection.__property;
  crsbinding.data.arrayItemsAdded(id, property, items, collection);
}

// src/store/binding-data.js
var BindingData = class {
  constructor() {
    this._data = {};
    this._converters = {};
    this._callbacks = {};
    this._updates = {};
    this._triggers = /* @__PURE__ */ new Map();
    this._context = {};
    this._sync = {};
    this._frozenObjects = [];
    this._idStore = {
      nextId: 0,
      nextTriggerId: 0,
      nextArrayId: 0,
      nextSyncId: 0
    };
  }
  getConverter(id, path2) {
    const obj = this._converters[id];
    if (obj == null)
      return null;
    const key = getValueOnPath(obj, path2);
    if (key == null)
      return null;
    return crsbinding.valueConvertersManager.get(key);
  }
  _getContextId(id) {
    if (typeof id == "object") {
      return id.__uid || id._dataId;
    }
    return id;
  }
  getContext(id) {
    return this._context[id];
  }
  getData(id) {
    return this._data[id];
  }
  array(id, property) {
    id = this._getContextId(id);
    const value = this.getValue(id, property);
    return createArrayProxy(value, id, property);
  }
  setName(id, name) {
    this._data[id].name = name;
  }
  addObject(name, type = {}) {
    const id = this._getNextId();
    type.contextId = id;
    this._data[id] = {
      name,
      type: "data",
      data: type
    };
    this._callbacks[id] = {};
    return id;
  }
  removeObject(id) {
    delete this._context[id];
    const result = this._removeData(id);
    this._removeCallbacks(id);
    this._removeUpdates(id);
    this._removeTriggers(id);
    this._removeSync(id);
    this._removeConverters(id);
    return result;
  }
  getValue(id, property, convert = true) {
    if (id == "undefined" || id == null)
      return void 0;
    id = this._getContextId(id);
    if (property != null && property.indexOf("$globals.") !== -1) {
      id = crsbinding.$globals;
      property = property.replace("$globals.", "");
    }
    const obj = this._data[Number(id)];
    let value;
    if (obj.type == "data") {
      const data = obj.data;
      if (property == null)
        return data;
      value = property.indexOf(".") === -1 ? data[property] : getValueOnPath(data, property);
    } else {
      const refId = obj.refId;
      value = this._getReferenceValue(refId, property, obj.path, obj.aId);
    }
    if (convert == true) {
      const converter = this.getConverter(id, property);
      if (converter != null) {
        value = converter.get(value);
      }
    }
    return value;
  }
  makeShared(id, property, sharedItems) {
    id = this._getContextId(id);
    const obj = this._callbacks[id];
    for (let prop of sharedItems) {
      const path2 = `${property}.${prop}`;
      this._ensurePath(obj, path2, (triggerObject, triggerProperty) => {
        if (triggerObject[triggerProperty] == null) {
          triggerObject[triggerProperty] = {};
        }
        const nextId = this._getNextTriggerId();
        this._triggers.set(nextId, { values: [{ id, path: path2 }] });
        triggerObject[triggerProperty].__trigger = nextId;
      });
    }
  }
  getProperty(id, property, convert = true) {
    id = this._getContextId(id);
    let value = this.getValue(id, property, convert);
    if (Array.isArray(value)) {
      value = createArrayProxy(value, id, property);
    }
    return value;
  }
  setProperty(id, property, value, convert = true) {
    id = this._getContextId(id);
    let oldValue = this.getProperty(id, property, false);
    if (Array.isArray(oldValue)) {
      this.array(id, property).splice(0, oldValue.length);
      if (value != null) {
        if (oldValue.__syncId != null) {
          value.__syncId = oldValue.__syncId;
        } else {
          delete value.__syncId;
        }
      }
    }
    if (value && value.__uid != null) {
      oldValue && this._unlinkArrayItem(oldValue);
    }
    this._setContextProperty(id, property, value, { oldValue, convert });
    if (value && value.__uid) {
      this.linkToArrayItem(id, property, value.__uid);
    }
  }
  _setContextProperty(id, property, value, options) {
    const oldValue = options.oldValue;
    const ctxName = options.ctxName;
    const dataType = options.dataType;
    const convert = options.convert || true;
    id = this._getContextId(id);
    let obj = this._data[id];
    if (obj == null || obj.__frozen == true)
      return;
    if (convert == true) {
      const converter = this.getConverter(id, property);
      if (converter != null) {
        value = converter.set(value);
      }
    }
    if (dataType === "boolean" || typeof value === "boolean") {
      value = Boolean(value);
    } else if (dataType === "number" || dataType == null && typeof value !== "object" && (isNaN(value) == false && value != "")) {
      value = Number(value);
    }
    if (obj.type == "data") {
      obj = this._data[id].data;
      const changed = property.indexOf(".") === -1 ? this._setObjectProperty(obj, property, value) : this._setObjectPropertyPath(obj, property, value);
      if (changed == true) {
        this._performUpdates(id, property, value, oldValue);
        this.updateUI(id, property);
      }
    } else {
      this._setReferenceValue(id, property, value, obj.refId, obj.path, obj.aId, ctxName);
    }
  }
  _setReferenceValue(id, property, value, refId, refPath, refaId, ctxName) {
    const obj = this._data[refId];
    if (obj.type == "data") {
      let v = getValueOnPath(obj.data, refPath);
      const syncId = v.__syncId;
      if (refaId != null) {
        v = v.find((i) => i.__aId == refaId);
      }
      if (ctxName != "context") {
        property = property.split(`${ctxName}.`).join("");
      }
      this._setObjectPropertyPath(v, property, value);
      if (syncId != null) {
        if (this._frozenObjects.indexOf(v) === -1) {
          this._setSyncValues(syncId, property, value, v);
        }
      }
      this._callFunctionsOnPath(id, property);
    } else {
      let pString = `${obj.path}.${path}`;
      return this._getReferenceValue(obj.refId, property, pString);
    }
  }
  createReferenceTo(refId, name, path2, index) {
    const id = this._getNextId();
    const ref = {
      id,
      name,
      type: "ref",
      refId,
      path: path2
    };
    if (index !== void 0) {
      ref.aId = index;
    }
    this._data[id] = ref;
    this._callbacks[id] = {};
    return id;
  }
  _getReferenceValue(id, property, path2, aId) {
    const obj = this._data[id];
    if (obj.type == "data") {
      if (aId === void 0) {
        const p = property == null ? path2 : `${path2}.${property}`;
        return this.getValue(id, p);
      } else {
        const ar = this.getValue(id, path2);
        let result;
        if (Array.isArray(ar)) {
          result = ar.find((i) => i.__aId == aId);
        } else {
          const item = ar.get(aId);
          result = { key: aId, value: item };
        }
        return property == null || result == null ? result : getValueOnPath(result, property);
      }
    } else {
      let pString = `${obj.path}.${path2}`;
      return this._getReferenceValue(obj.refId, property, pString);
    }
  }
  _getNextId() {
    return this._nextId("nextId");
  }
  _getNextTriggerId() {
    return this._nextId("nextTriggerId");
  }
  nextArrayId() {
    return this._nextId("nextArrayId");
  }
  _nextId(idVariable) {
    const id = this._idStore[idVariable];
    this._idStore[idVariable] += 1;
    return id;
  }
  createArraySync(id, property, primaryKey, fields) {
    const array = this.getValue(id, property);
    const syncId = this._idStore.nextSyncId;
    this._idStore.nextSyncId += 1;
    const sync = {
      primaryKey,
      fields,
      collection: []
    };
    this._sync[syncId] = sync;
    return this.addArraySync(syncId, id, property, array);
  }
  removeArraySync(syncId, id, property) {
    const syncObj = this._sync[syncId];
    id = this._getContextId(id);
    if (syncObj != null) {
      const items = syncObj.collection.filter((item) => item.id == id && item.path == property);
      items.forEach((item) => syncObj.collection.splice(syncObj.collection.indexOf(item), 1));
      if (syncObj.collection.length == 0) {
        delete this._sync[syncId];
      }
      const array = this.getValue(id, property);
      if (array != null) {
        delete array.__syncId;
        array.filter((item) => item.__syncId == syncId).forEach((item) => delete item.__syncId);
      }
    }
  }
  addArraySync(syncId, id, property, array) {
    return new Promise((resolve) => {
      id = this._getContextId(id);
      this._ensurePath(id, property, () => {
        const sync = this._sync[syncId];
        if (sync.collection.filter((item) => item.id == id && item.path == property).length > 0) {
          return resolve(syncId);
        }
        sync.collection.push({
          id,
          path: property
        });
        if (array == null) {
          array = this.getValue(id, property);
        }
        array.__syncId = syncId;
        resolve(syncId);
      });
    });
  }
  _setSyncValues(syncId, property, value, source) {
    this._frozenObjects.push(source);
    const sync = this._sync[syncId];
    if (sync.fields.indexOf(property) !== -1) {
      const idValue = source[sync.primaryKey];
      for (let item of sync.collection) {
        const array = this.getValue(item.id, item.path);
        const data = array.find((item2) => item2[sync.primaryKey] == idValue);
        this._frozenObjects.push(data);
        if (data != source) {
          this.setProperty(data, property, value);
        }
      }
    }
    this._frozenObjects.length = 0;
  }
  addContext(id, obj) {
    this._context[id] = obj;
  }
  addCallback(id, property, callback) {
    const obj = this._callbacks[id];
    return property.indexOf(".") === -1 ? this._addCallbackToObject(obj, property, callback) : this._addCallbackToObjectOnPath(obj, property, callback);
  }
  _addCallbackToObject(obj, property, callback) {
    obj[property] = obj[property] || {};
    obj[property].__functions = obj[property].__functions || [];
    obj[property].__functions.push(callback);
  }
  _addCallbackToObjectOnPath(obj, path2, callback) {
    this._ensurePath(obj, path2, (obj2, prop) => {
      this._addCallbackToObject(obj2, prop, callback);
    });
  }
  _ensurePath(obj, path2, callback) {
    let cobj = obj;
    const parts = path2.split(".");
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (cobj[part] == null) {
        cobj[part] = {};
      }
      cobj = cobj[part];
    }
    callback && callback(cobj, parts[parts.length - 1]);
  }
  removeCallback(id, path2, callback) {
    const obj = this._callbacks[id];
    if (obj == null)
      return;
    const property = getValueOnPath(obj, path2);
    if (property.__functions) {
      const index = property.__functions.indexOf(callback);
      if (index !== -1) {
        property.__functions.splice(index, 1);
        if (property.__functions.length == 0) {
          delete property.__functions;
        }
      }
    }
  }
  async updateUI(id, property) {
    id = this._getContextId(id);
    const obj = this._callbacks[id];
    if (property == null) {
      const properties = this._getOwnProperties(obj);
      for (let prop of properties) {
        await this._callFunctionsOnObject(obj[prop], id, prop);
      }
    } else {
      if (property.indexOf(".") !== -1)
        return this._callFunctionsOnPath(id, property);
      if (obj == null)
        return;
      if (obj[property] == null)
        return;
      await this._callFunctionsOnObject(obj[property], id, property);
    }
  }
  async _callFunctionsOnObject(obj, id, property) {
    const functions = obj.__functions;
    if (functions != null) {
      for (let fn of obj.__functions) {
        const value = this.getValue(id, property);
        await fn(property, value);
      }
    }
    if (obj.__trigger != null) {
      const triggerObj = this._triggers.get(obj.__trigger);
      if (triggerObj.frozen != true) {
        triggerObj.frozen = true;
        for (let trigger of triggerObj.values) {
          if (trigger.id == id && trigger.path == property)
            continue;
          await this.updateUI(trigger.id, trigger.path);
        }
        delete triggerObj.frozen;
      }
    }
    const properties = this._getOwnProperties(obj);
    for (let prop of properties) {
      await this._callFunctionsOnObject(obj[prop], id, `${property}.${prop}`);
    }
  }
  async _callFunctionsOnPath(id, path2) {
    const obj = this._callbacks[id];
    const result = getValueOnPath(obj, path2);
    if (result != null) {
      await this._callFunctionsOnObject(result, id, path2);
    }
  }
  async _performUpdates(id, property, value, oldValue) {
    this._performUpdatesChanges(id, property, value);
    const ctx = this._context[id];
    if (ctx == null)
      return;
    const fnName = `${property}Changed`;
    if (ctx[fnName]) {
      await ctx[fnName](value, oldValue);
    } else if (ctx["propertyChanged"]) {
      await ctx["propertyChanged"](property, value, oldValue);
    }
  }
  _performUpdatesChanges(id, property, value) {
    const obj = this._updates[id];
    if (obj == null || obj[property] == null)
      return;
    this.setProperty(obj[property].originId, obj[property].originProperty, value);
  }
  link(sourceId, sourceProp, targetId, targetProp, value) {
    if (typeof value != "object" || value === null) {
      this._addUpdateOrigin(sourceId, sourceProp, targetId, targetProp);
      this._addUpdateOrigin(targetId, targetProp, sourceId, sourceProp);
      this._syncValueTrigger(sourceId, sourceProp, targetId, targetProp);
    } else {
      this._syncTriggers(sourceId, sourceProp, targetId, targetProp);
    }
  }
  linkToArrayItem(id, path2, itemId) {
    let sourceObj = getValueOnPath(this._callbacks[id], path2);
    if (sourceObj == null)
      return;
    let targetObj = this._callbacks[itemId];
    const properties = this._getOwnProperties(sourceObj);
    for (let property of properties) {
      this._copyTriggers(sourceObj, property, targetObj, property, itemId, property);
    }
  }
  _addUpdateOrigin(sourceId, sourceProp, targetId, targetProp) {
    const update = this._updates[targetId] || {};
    const source = update[targetProp] || {};
    if (source.originId == sourceId && source.originProperty == sourceProp)
      return;
    source.originId = sourceId;
    source.originProperty = sourceProp;
    update[targetProp] = source;
    this._updates[targetId] = update;
  }
  _unlinkArrayItem(object) {
    const clbObj = this._callbacks[object.__uid];
    this._removeTriggersOnCallbacks(clbObj, object.__uid);
  }
  setArrayEvents(id, path2, itemsAddedCallback, itemsDeletedCallback) {
    const cbObj = this._callbacks[id];
    this._ensurePath(cbObj, path2, (obj, property) => {
      obj[property] = obj[property] || {};
      obj[property].__itemsAdded = obj[property].itemsAdded || [];
      obj[property].__itemsAdded.push(itemsAddedCallback);
      obj[property].__itemsDeleted = obj[property].itemsDeleted || [];
      obj[property].__itemsDeleted.push(itemsDeletedCallback);
    });
  }
  arrayItemsAdded(id, prop, items, collection) {
    const obj = this._callbacks[id];
    const clbObj = getValueOnPath(obj, prop);
    if (clbObj == null)
      return;
    for (let callback of clbObj.__itemsAdded || []) {
      callback(items, collection);
    }
  }
  arrayItemsRemoved(id, prop, items, collection) {
    const obj = this._callbacks[id];
    const clbObj = getValueOnPath(obj, prop);
    if (clbObj == null)
      return;
    for (let callback of clbObj.__itemsDeleted || []) {
      callback(items, collection);
    }
  }
  _copyTriggers(sourceObj, sourceProp, targetObj, targetProp, targetId, targetPath) {
    const source = sourceObj[sourceProp];
    const target = targetObj[targetProp] = targetObj[targetProp] || {};
    if (source.__trigger != null) {
      target.__trigger = source.__trigger;
      const tr = this._triggers.get(source.__trigger);
      tr.values.push({ id: targetId, path: targetPath });
    }
    const properties = this._getOwnProperties(source);
    for (let property of properties) {
      this._copyTriggers(source, property, target, property, targetId, `${targetPath}.${property}`);
    }
  }
  _removeData(id) {
    const result = this._removeReferences(id);
    delete this._data[id];
    const length = Object.keys(this._data).length;
    if (length == 0) {
      this._idStore.nextId = 1;
      this._idStore.nextArrayId = 0;
    }
    result.push(id);
    return result;
  }
  _removeReferences(parentId) {
    const result = [];
    const keys = Object.keys(this._data);
    for (let key of keys) {
      const ref = this._data[key];
      if (ref.refId == parentId) {
        result.push(ref.id);
        this.removeObject(ref.id);
      }
    }
    return result;
  }
  _removeCallbacks(id) {
    delete this._callbacks[id];
  }
  _removeUpdates(id) {
    const remove = Array.from(this._updates).filter((item) => item[0] == id || item[1].value && item[1].value.originId == id);
    for (let rem of remove) {
      delete this._updates[rem[0]];
    }
  }
  _removeTriggers(id) {
    const tr = Array.from(this._triggers);
    for (let trigger of tr) {
      const index = trigger[1].values.findIndex((item) => item.id == id);
      if (index != -1) {
        trigger[1].values.splice(index, 1);
        if (trigger.values.length == 0) {
          this._triggers.delete(trigger[0]);
        }
      }
    }
    if (this._triggers.size == 0) {
      this._idStore.nextTriggerId = 0;
    }
  }
  _removeSync(id) {
    const keys = Object.keys(this._sync);
    for (let key of keys) {
      const value = this._sync[key];
      const items = value.collection.filter((item) => item.id == id);
      items.forEach((item) => value.collection.splice(value.collection.indexOf(item), 1));
      if (value.collection.length == 0) {
        delete this._sync[key];
      }
    }
  }
  _removeConverters(id) {
    delete this._converters[id];
  }
  _setObjectProperty(obj, property, value) {
    if (obj[property] !== value) {
      obj[property] = value;
      return true;
    }
    return false;
  }
  _setObjectPropertyPath(obj, path2, value) {
    let result = true;
    this._ensurePath(obj, path2, (obj2, prop) => result = this._setObjectProperty(obj2, prop, value));
    return result;
  }
  _getOwnProperties(obj) {
    return Object.getOwnPropertyNames(obj).filter((item) => item.indexOf("__") === -1);
  }
  _removeTriggersOnCallbacks(obj, id) {
    const properties = this._getOwnProperties(obj);
    for (let property of properties) {
      const trigger = obj[property].__trigger;
      if (trigger != null) {
        delete obj[property].__trigger;
        this._removeTriggersOnTriggers(id, trigger);
      }
      if (typeof obj[property] == "object") {
        this._removeTriggersOnCallbacks(obj[property]);
      }
    }
  }
  _removeTriggersOnTriggers(id, triggerId) {
    const obj = this._triggers.get(triggerId);
    const items = obj.values.filter((item) => item.id == id);
    for (let item of items) {
      const index = obj.values.indexOf(item);
      obj.values.splice(index, 1);
    }
  }
  _syncValueTrigger(sourceId, sourceProp, targetId, targetProp) {
    let sourceObj = this._callbacks[sourceId];
    let targetObj = this._callbacks[targetId];
    const trigger = getValueOnPath(sourceObj, `${sourceProp}.__trigger`);
    if (trigger != null) {
      targetObj[targetProp] = targetObj[targetProp] || {};
      targetObj[targetProp].__trigger = trigger;
      const tr = this._triggers.get(trigger);
      tr.values.push({ id: targetId, path: targetProp });
    }
  }
  _syncTriggers(sourceId, sourceProp, targetId, targetProp) {
    let sourceObj = this._callbacks[sourceId];
    let targetObj = this._callbacks[targetId];
    if (sourceProp.indexOf(".") === -1) {
      this._copyTriggers(sourceObj, sourceProp, targetObj, targetProp, targetId, targetProp);
    } else {
      this._ensurePath(targetObj, targetProp, (obj, prop) => {
        obj[prop] = obj[prop] || {};
        const parts = sourceProp.split(".");
        const sp = parts[parts.length - 1];
        const np = parts.splice(0, parts.length - 1).join();
        const so = getValueOnPath(sourceObj, np);
        this._copyTriggers(so, sp, obj, prop, targetId, targetProp);
      });
    }
  }
  setPropertyConverter(id, path2, converterKey, triggers) {
    if (converterKey != null) {
      id = this._getContextId(id);
      let obj = this._converters[id];
      if (obj == null) {
        obj = {};
        this._converters[id] = obj;
      }
      this._ensurePath(obj, path2, (triggerObject, triggerProperty) => {
        triggerObject[triggerProperty] = converterKey;
      });
    }
    if (triggers != null) {
      this.setPropertyConverterTriggers(id, path2, triggers);
    }
  }
  setPropertyConverterTriggers(id, path2, conversions) {
    id = this._getContextId(id);
    const code = [];
    for (let conversion of conversions) {
      const parts = conversion.split(":");
      const path3 = parts[0];
      const converter = parts[1];
      this.setPropertyConverter(id, path3, converter);
      code.push(`crsbinding.data.setProperty(${id}, "${path3}", value);`);
    }
    const fn = new Function("property", "value", code.join("\n"));
    this.addCallback(id, path2, fn);
  }
};

// src/events/event-emitter.js
var EventEmitter = class {
  constructor() {
    this._events = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._events.clear();
  }
  async on(event, callback) {
    let events = [];
    if (this._events.has(event)) {
      events = this._events.get(event);
    } else {
      this._events.set(event, events);
    }
    if (events.indexOf(callback) == -1) {
      events.push(callback);
    }
  }
  async emit(event, args) {
    if (this._events.has(event)) {
      const events = this._events.get(event);
      if (events.length == 1) {
        return await events[0](args);
      } else {
        for (let e of events) {
          await e(args);
        }
      }
    }
  }
  async remove(event, callback) {
    if (this._events.has(event)) {
      const events = this._events.get(event);
      const index = events.indexOf(callback);
      if (index != -1) {
        events.splice(index, 1);
      }
      if (events.length === 0) {
        this._events.delete(event);
      }
    }
  }
  async postMessage(query, args, scope) {
    const element = scope || document;
    const items = Array.from(element.querySelectorAll(query));
    const promises = [];
    for (let item of items) {
      promises.push(item.onMessage.call(item, args));
    }
    await Promise.all(promises);
  }
};

// src/binding/bindable-element.js
var BindableElement = class extends HTMLElement {
  get hasOwnContext() {
    return true;
  }
  constructor() {
    super();
    if (this.hasOwnContext == true) {
      this._dataId = crsbinding.data.addObject(this.constructor.name);
      crsbinding.data.addContext(this._dataId, this);
    }
    crsbinding.dom.enableEvents(this);
    this.__properties = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._disposing = true;
    crsbinding.utils.forceClean(this);
    crsbinding.dom.disableEvents(this);
    const properties = Object.getOwnPropertyNames(this);
    for (let property of properties) {
      delete this[property];
    }
  }
  async connectedCallback() {
    if (this._dataId == null || this.__isLoading == true)
      return;
    this.__isLoading = true;
    if (this.preLoad != null) {
      const setPropertyCallback = (path2, value) => {
        crsbinding.data.setProperty(this._dataId, path2, value);
      };
      await this.preLoad(setPropertyCallback);
    }
    if (this.html != null) {
      this.innerHTML = await crsbinding.templates.get(this.constructor.name, this.html);
      const path2 = crsbinding.utils.getPathOfFile(this.html);
      await crsbinding.parsers.parseElements(this.children, this._dataId, path2 ? { folder: path2 } : null);
    }
    requestAnimationFrame(() => {
      const name = this.getAttribute("name");
      if (name != null) {
        crsbinding.data.setName(this._dataId, name);
      }
    });
    this.__properties.forEach((value, key) => crsbinding.data.setProperty(this._dataId, key, value));
    this.__properties.clear();
    delete this.__properties;
    if (this.load != null) {
      this.load();
    }
    this.isReady = true;
    this.dispatchEvent(new CustomEvent("ready"));
    delete this.__isLoading;
  }
  async disconnectedCallback() {
    this.dispose();
    crsbinding.utils.disposeProperties(this);
    crsbinding.observation.releaseBinding(this);
  }
  getProperty(property) {
    return crsbinding.data.getProperty(this, property);
  }
  setProperty(property, value, once = false) {
    if (this.isReady != true && once === false && this.__properties) {
      return this.__properties.set(property, value);
    }
    crsbinding.data.setProperty(this, property, value);
  }
};

// src/binding/perspective-element.js
var PerspectiveElement = class extends HTMLElement {
  get hasOwnContext() {
    return true;
  }
  get ctx() {
    return this._dataId;
  }
  set ctx(newValue) {
    this._dataId = newValue;
    if (newValue != null) {
      const name = this.getAttribute("name");
      if (name != null) {
        crsbinding.data.setName(this._dataId, name);
      }
      this._loadView();
    }
  }
  get view() {
    return this._view;
  }
  set view(newValue) {
    if (this._view != newValue) {
      this._view = newValue;
      this._loadView();
    }
  }
  constructor() {
    super();
    const contextAttribute = this.getAttribute("ctx.one-way") || this.getAttribute("ctx.once");
    if (this.hasOwnContext == true && contextAttribute == null) {
      this._dataId = crsbinding.data.addObject(this.constructor.name);
      crsbinding.data.addContext(this._dataId, this);
    }
    crsbinding.dom.enableEvents(this);
  }
  dispose() {
    this._disposing = true;
    crsbinding.utils.forceClean(this);
    crsbinding.dom.disableEvents(this);
    crsbinding.templates.unload(this.store);
  }
  async connectedCallback() {
    await this._initialize();
  }
  async _initialize() {
    this.__isLoading = true;
    this.store = this.dataset.store || this.constructor.name;
    await crsbinding.templates.loadFromElement(this.store, this, this.html, async (fragment) => {
      if (this.preLoad != null) {
        await this.preLoad();
      }
      if (this.load != null) {
        this.load();
      }
      this.__isLoading = false;
      this.view = fragment.name;
    });
  }
  async disconnectedCallback() {
    this.dispose();
    crsbinding.utils.disposeProperties(this);
    crsbinding.observation.releaseBinding(this);
  }
  getProperty(property) {
    return crsbinding.data.getProperty(this, property);
  }
  setProperty(property, value, once = false) {
    if (this.isReady != true && once === false && this.__properties) {
      return this.__properties.set(property, value);
    }
    crsbinding.data.setProperty(this, property, value);
  }
  async _loadView() {
    if (this.__isLoading == true)
      return;
    if (this._view == null || this._dataId == null) {
      return;
    }
    crsbinding.observation.releaseChildBinding(this);
    this.innerHTML = "";
    const template = await crsbinding.templates.getById(this.store, this._view);
    this.appendChild(template);
    await crsbinding.parsers.parseElements(this.children, this._dataId, { folder: this.dataset.folder });
    requestAnimationFrame(() => {
      this.dataset.view = this._view;
      this.dispatchEvent(new CustomEvent("view-loaded"));
    });
  }
};
customElements.define("perspective-element", PerspectiveElement);

// src/view/view-base.js
var ViewBase = class {
  get title() {
    return this.getProperty("title");
  }
  set title(newValue) {
    this.setProperty("title", newValue);
  }
  get element() {
    return this._element;
  }
  set element(newValue) {
    this._element = newValue;
  }
  constructor(element) {
    this._dataId = crsbinding.data.addObject(this.constructor.name);
    crsbinding.data.addContext(this._dataId, this);
    this.element = element;
  }
  async connectedCallback() {
    if (this.preLoad != null) {
      const setPropertyCallback = (path3, value) => {
        crsbinding.data.setProperty(this._dataId, path3, value);
      };
      await this.preLoad(setPropertyCallback);
    }
    const path2 = crsbinding.utils.getPathOfFile(this.html);
    await crsbinding.parsers.parseElement(this.element, this._dataId, path2 ? { folder: path2 } : null);
    this.load();
  }
  async disconnectedCallback() {
    crsbinding.utils.forceClean(this._dataId);
    crsbinding.observation.releaseBinding(this.element);
    crsbinding.utils.disposeProperties(this);
    this.element = null;
  }
  getProperty(property, convert = true) {
    return crsbinding.data.getProperty(this, property, convert);
  }
  setProperty(property, value, convert = true) {
    crsbinding.data.setProperty(this, property, value, convert);
  }
  load() {
    this._element.style.visibility = "";
    this._loaded = true;
  }
};

// src/view/crs-widget.js
var Widget = class extends HTMLElement {
  disconnectedCallback() {
    this._clearElements();
    delete this._dataId;
  }
  async onMessage(args) {
    this._clearElements();
    let id = args.context;
    if (id && typeof id == "object") {
      id = id.__uid || id._dataId;
    }
    this._dataId = id;
    this.innerHTML = args.html;
    if (this._dataId != null) {
      const ctx = crsbinding.data._context[this._dataId];
      await crsbinding.parsers.parseElements(this.children, this._dataId, {
        folder: ctx.html
      });
    }
  }
  _clearElements() {
    for (let child of this.children) {
      crsbinding.observation.releaseBinding(child);
    }
  }
};
customElements.define("crs-widget", Widget);

// src/managers/element-store-manager.js
var ElementStoreManager = class {
  constructor() {
    this._items = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._items.clear();
    this._items = null;
  }
  register(id, template, measure = false) {
    const instance = crsbinding.utils.cloneTemplate(template);
    const result = {
      elements: [instance],
      template
    };
    if (measure === true) {
      crsbinding.utils.measureElement(instance).then((size) => result.size = size);
    }
    this._items.set(id, result);
  }
  getItemElement(item) {
    return item.elements.pop() || crsbinding.utils.cloneTemplate(item.template);
  }
  getElement(id) {
    const item = this._items.get(id);
    return this.getItemElement(item);
  }
  getElements(id, quantity) {
    const item = this._items.get(id);
    const fragment = document.createDocumentFragment();
    while (fragment.children.length < quantity) {
      fragment.appendChild(this.getItemElement(item));
    }
    return fragment;
  }
  async getBoundElement(id, context) {
    const item = this._items.get(id);
    const result = this.getItemElement(item);
    await crsbinding.parsers.parseElement(result, context);
    return result;
  }
  returnElements(id, elements) {
    const item = this._items.get(id);
    for (let element of elements) {
      item.elements.push(element);
    }
  }
  unregister(id) {
    const item = this._items.get(id);
    if (item != null) {
      this._items.delete(id);
      item.elements.length = 0;
      item.template = null;
    }
  }
};

// src/managers/value-converters-manager.js
var ValueConvertersManager = class {
  constructor() {
    this._converters = /* @__PURE__ */ new Map();
  }
  add(key, converter) {
    this._converters.set(key, converter);
  }
  get(key) {
    return this._converters.get(key);
  }
  remove(key) {
    this._converters.delete(key);
  }
  convert(value, key, direction) {
    const converter = this._converters.get(key);
    if (converter == null)
      return null;
    return converter[direction](value);
  }
};

// src/lib/cleanMemory.js
function forceClean(id) {
  if (typeof id == "object") {
    id = id.__uid || id._dataId;
  }
  if (id == null)
    return;
  const toRemove = crsbinding.data.removeObject(id);
  const elements = /* @__PURE__ */ new Set();
  for (let did of toRemove) {
    const providers = Array.from(crsbinding.providerManager.items).filter((item) => item[1]._context === did);
    for (let provider of providers) {
      elements.add(provider[1]._element);
    }
  }
  for (let element of elements) {
    crsbinding.providerManager.releaseElement(element);
  }
  elements.length = 0;
}

// src/lib/renderCollection.js
function renderCollection(template, data, elements = null, parentElement = null) {
  const id = "render-collection";
  crsbinding.inflationManager.register(id, template);
  let fragment = crsbinding.inflationManager.get(id, data, elements, 0);
  if (fragment != null && parentElement != null) {
    parentElement.appendChild(fragment);
  }
  crsbinding.inflationManager.unregister(id);
}

// src/managers/svg-elements-manager.js
var SvgElementsManager = class {
  constructor() {
    this._tagMap = /* @__PURE__ */ new Map();
    this._queue = [];
    this._observed = /* @__PURE__ */ new Map();
  }
  dispose() {
    this._tagMap.clear();
    this._tagMap = null;
  }
  define(tagName, proto) {
    if (this._tagMap.has(tagName) == false) {
      this._tagMap.set(tagName, proto);
    }
    this._processElements(tagName);
  }
  parse(svgElement) {
    const elements = svgElement.querySelectorAll("[is]");
    if (elements.length == 0)
      return;
    this._observe(svgElement);
    for (let element of elements) {
      const cName = element.getAttribute("is");
      if (this._tagMap.has(cName) == false) {
        this._queue.push({
          parent: svgElement,
          cName,
          el: element
        });
      } else {
        this._createComponent({
          parent: svgElement,
          cName,
          el: element
        });
      }
    }
  }
  removeComponent(element) {
    let svg = null;
    let parent = element;
    let count = 0;
    while (svg == null || count == 100) {
      count++;
      if (parent.nodeName.toLocaleString() == "svg") {
        svg = parent;
        break;
      }
      parent = parent.parentElement;
    }
    this._removeComponentFromSvg(svg, element);
  }
  _removeComponentFromSvg(svg, element) {
    const def = this._observed.get(svg);
    if (def == null)
      return;
    let component = def.children.get(element);
    if (component == null)
      return;
    component.disconnectedCallback();
    component.dispose();
    def.children.delete(element);
    element.parentElement.removeChild(element);
    component = null;
    element = null;
  }
  release(svgElement) {
    if (this._observed.size == 0)
      return;
    const elements = svgElement.querySelectorAll("[is]");
    for (let element of elements) {
      this._removeComponentFromSvg(svgElement, element);
    }
    const def = this._observed.get(svgElement);
    def.children.clear();
    def.children = null;
    this._observed.delete(svgElement);
  }
  _observe(element) {
    if (this._observed.has(element))
      return;
    const detail = {
      children: /* @__PURE__ */ new Map()
    };
    this._observed.set(element, detail);
  }
  _createComponent(def) {
    const proto = this._tagMap.get(def.cName);
    const svgDef = this._observed.get(def.parent);
    if (svgDef.children.has(def.el) == false) {
      const instance = new proto(def.el);
      svgDef.children.set(def.el, instance);
      instance.connectedCallback();
    }
    delete def.parent;
    delete def.cName;
    delete def.el;
  }
  _processElements(component) {
    const definitions = this._queue.filter((el) => el.cName == component);
    for (let def of definitions) {
      this._createComponent(def);
      this._queue.splice(this._queue.indexOf(def), 1);
    }
  }
};

// src/view/svg-element.js
var SvgElement = class {
  constructor(element) {
    this.element = element;
  }
  dispose() {
    this.element = null;
  }
  async connectedCallback() {
  }
  async suspend() {
  }
  async restore() {
  }
};

// src/store/templates.js
function addTemplate(componentName, template) {
  crsbinding.templates.data[componentName] = template;
}
function unloadTemplates(componentNames) {
  const collection = Array.isArray(componentNames) == true ? componentNames : [componentNames];
  for (let name of collection) {
    if (crsbinding.templates.data[name]?.count != null) {
      crsbinding.templates.data[name].count -= 1;
      if (crsbinding.templates.data[name].count == 0) {
        delete crsbinding.templates.data[name].templates;
        delete crsbinding.templates.data[name].style;
        delete crsbinding.templates.data[name];
      }
    } else {
      delete crsbinding.templates.data[name];
    }
  }
}
function unloadAllTemplates() {
  const keys = Object.keys(crsbinding.templates.data);
  for (let key of keys) {
    delete crsbinding.templates.data[key];
  }
}
async function getTemplate(componentName, url) {
  let template = crsbinding.templates.data[componentName];
  if (template == null) {
    template = await loadTemplate(componentName, url);
  }
  return template.cloneNode(true).innerHTML;
}
async function loadTemplate(componentName, url) {
  let template = crsbinding.templates.data[componentName];
  if (template != null)
    return template;
  template = document.createElement("template");
  template.innerHTML = await fetch(url).then((result) => result.text());
  crsbinding.templates.data[componentName] = template;
  return template;
}
async function loadFromElement(store, element, url, callback) {
  if (crsbinding.templates.data[store] != null) {
    crsbinding.templates.data[store].count += 1;
    crsbinding.templates.data[store].callbacks.push(callback);
    return;
  }
  const storeItem = {
    count: 1,
    templates: {},
    callbacks: [callback]
  };
  crsbinding.templates.data[store] = storeItem;
  let templates;
  let style;
  if (url != null) {
    const fragment = document.createElement("template");
    fragment.innerHTML = await fetch(url).then((result) => result.text());
    templates = fragment.content.querySelectorAll("template");
    style = fragment.content.querySelector("style");
  } else {
    templates = element.querySelectorAll("template");
    style = element.querySelector("style");
  }
  storeItem.style = style;
  let defaultTemplate;
  for (let template of templates) {
    storeItem.templates[template.dataset.id] = template;
    template.parentElement?.removeChild(template);
    if (template.dataset.default == "true") {
      defaultTemplate = template;
    }
  }
  for (let callback2 of storeItem.callbacks) {
    const instance = createInstance(defaultTemplate);
    if (style != null) {
      instance.insertBefore(style, instance.firstChild);
    }
    callback2(instance);
  }
  storeItem.callbacks.length = 0;
  delete storeItem.callbacks;
}
function createInstance(template) {
  const result = template.content.cloneNode(true);
  result.name = template.dataset.id;
  return result;
}
async function getTemplateById(store, id) {
  const storeItem = crsbinding.templates.data[store];
  const template = storeItem.templates[id];
  let instance = template.content.cloneNode(true);
  if (storeItem.style != null) {
    instance.insertBefore(storeItem.style, instance.firstChild);
  }
  return instance;
}

// src/managers/translations-manager.js
var TranslationsManager = class {
  constructor() {
    this.dictionary = {};
  }
  dispose() {
    this.dictionary = null;
  }
  async add(obj, context) {
    flattenPropertyPath(context || "", obj, this.dictionary);
  }
  async delete(context) {
    const filterKey = `${context}.`;
    const keys = Object.keys(this.dictionary).filter((item) => item.indexOf(filterKey) === 0);
    for (let key of keys) {
      delete this.dictionary[key];
    }
  }
  async parseElement(element) {
    if (element.children.length == 0 && element.textContent.indexOf("&{") != -1) {
      element.textContent = await this.get_with_markup(element.textContent.trim());
    }
    for (let attribute of element.attributes) {
      await this.parseAttribute(attribute);
    }
    for (let child of element.children) {
      await this.parseElement(child);
    }
  }
  async parseAttribute(attribute) {
    if (attribute.nodeValue.indexOf("&{") !== -1) {
      attribute.nodeValue = await this.get_with_markup(attribute.nodeValue);
    }
  }
  async get(key) {
    let result = this.dictionary[key];
    if (result != null) {
      return result;
    }
    result = this.fetch == null ? null : await this.fetch(key);
    if (result != null) {
      this.dictionary[key] = result;
    }
    return result;
  }
  async get_with_markup(key) {
    key = key.split("&{").join("").split("}").join("");
    return await this.get(key);
  }
};

// src/index.js
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
function capitalizePropertyPath(str) {
  const parts = str.split("-");
  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i].capitalize();
  }
  let result = parts.join("");
  if (result === "innerHtml") {
    result = "innerHTML";
  }
  return result;
}
var crsbinding2 = {
  _expFn: /* @__PURE__ */ new Map(),
  data: new BindingData(),
  idleTaskManager: new IdleTaskManager(),
  providerManager: new ProviderManager(),
  inflationManager: new InflationManager(),
  elementStoreManager: new ElementStoreManager(),
  svgCustomElements: new SvgElementsManager(),
  valueConvertersManager: new ValueConvertersManager(),
  translations: new TranslationsManager(),
  expression: {
    sanitize: sanitizeExp,
    compile: compileExp,
    release: releaseExp
  },
  observation: {
    releaseBinding,
    releaseChildBinding
  },
  parsers: {
    parseElement,
    parseElements
  },
  classes: {
    BindableElement,
    PerspectiveElement,
    ViewBase,
    RepeatBaseProvider,
    Widget,
    SvgElement
  },
  events: {
    listenOnPath,
    removeOnPath,
    emitter: new EventEmitter()
  },
  dom: {
    enableEvents: domEnableEvents,
    disableEvents: domDisableEvents
  },
  utils: {
    capitalizePropertyPath,
    clone,
    disposeProperties,
    fragmentToText,
    cloneTemplate,
    measureElement,
    forceClean,
    renderCollection,
    relativePathFrom,
    getPathOfFile,
    getValueOnPath,
    flattenPropertyPath
  },
  templates: {
    data: {},
    load: loadTemplate,
    add: addTemplate,
    get: getTemplate,
    unload: unloadTemplates,
    unloadAll: unloadAllTemplates,
    loadFromElement,
    getById: getTemplateById
  }
};
globalThis.crsbinding = crsbinding2;
crsbinding2.$globals = crsbinding2.data.addObject("globals");
crsbinding2.data.globals = crsbinding2.data.getValue(crsbinding2.$globals);
globalThis.crsb = crsbinding2;
