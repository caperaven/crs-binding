const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

function compileExp(exp, parameters, options) {
    parameters = parameters || [];
    let sanitize = true;
    let async = false;
    let ctxName = "context";

    if (options != null) {
        if (options.sanitize != null) sanitize = options.sanitize;
        if (options.async != null) async = options.async;
        if (options.ctxName != null) ctxName = options.ctxName;
    }

    if (crsbinding._expFn.has(exp)) {
        const x = crsbinding._expFn.get(exp);
        x.count += 1;
        return x;
    }

    let src = exp;
    let san;

    if (sanitize == true) {
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
    }
    else {
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
    if (exp == null || typeof exp != "object") return;
    
    const key = exp.parameters.expression;
    if (crsbinding._expFn.has(key)) {
        const x = crsbinding._expFn.get(key);
        x.count -= 1;

        if (x.count == 0) {
            x.function = null;
            x.parameters = null;
            crsbinding._expFn.delete(key);
        }
    }
}

/**
 * Contextualize a expression and extract the properties defined in the expression
 * @param exp
 * @returns {{expression: *, properties: *}}
 */
function sanitizeExp(exp, ctxName = "context", cleanLiterals = false) {
    const namedExp = ctxName != "context";
    const prefix = `${ctxName}.`;
    const tokens = tokenize(exp, namedExp ? ctxName : null);

    if (tokens.length == 1) {
        return {
            isLiteral: false,
            expression: `${prefix}${tokens[0]}`,
            properties: [exp]
        }
    }

    const properties = [];
    const isLiteral = exp.indexOf("${") != -1;

    let oldToken = null;
    let path = [];
    let indexes = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (quotes.indexOf(oldToken) != -1 || (reserved.indexOf(token) != -1 && ignore.indexOf(token) == -1))
        {
            oldToken = token;

            if (path.length > 0) {
                if (isLiteral == false || oldToken == "}") {
                    if (isNaN(path)) {
                        if (ignoreTokens.indexOf(path[0]) == -1 && token != ":") {
                            indexes.push(i - path.length);
                        }
                        properties.push(extractProperty(`${path.join("")}`));
                    }
                }

                path.length = 0;
            }

            continue;
        }

        if (oldToken == "$" && reservedTokens.indexOf(token) != -1) {
            path.push(`$${token}`);
        }
        else {
            path.push(token);
        }

        oldToken = token;
    }

    if (namedExp && path.length > 0) {
        if (isLiteral == false || oldToken == "}") {
            if (isNaN(path)) {
                indexes.push(tokens.length - 1);
                properties.push(extractProperty(`${path.join("")}`));
            }
        }
    }

    if (indexes.length == 0 &&
        exp.indexOf(".") != -1 &&
        exp.indexOf("$globals") == -1 &&
        exp.indexOf("$context") == -1 &&
        exp.indexOf("$event") == -1 &&
        exp.indexOf("$parent") == -1 &&
        exp.indexOf("$data") == -1 &&
        exp.trim()[0] != "{") {
        indexes.push(0);
    }

    for (let i = 0; i < indexes.length; i++) {
        tokens.splice(i + indexes[i], 0, prefix);
    }

    if (cleanLiterals == true) {
        let i = 0;
        while (i < tokens.length) {
            if (tokens[i] == "$" && tokens[i+1] == "{") {
                tokens.splice(i, 2);
                removeNextToken(tokens, i, "}");
            }
            i++;
        }
    }

    return {
        isLiteral: isLiteral,
        expression: tokens.join("")
            .split("$globals").join("crsbinding.data.globals")
            .split("$event").join("event")
            .split("$context").join("context")
            .split("$data").join("crsbinding.data.getValue")
            .split("$parent").join("parent"),
        properties: properties
    }
}

function removeNextToken(collection, startIndex, token) {
    for (let i = startIndex; i < collection.length; i++) {
        if (collection[i] == token) {
            collection.splice(i, 1);
            break;
        }
    }
}

/**
 * Extract the property path up to where a function is being called.
 * @param property {string}
 * @returns {string|*}
 */
function extractProperty(property) {
    if (property.indexOf("(") == -1) return property;
    const result = [];

    for (let p of property.split(".")) {
        if (p.indexOf("(") != -1) {
            break;
        }
        result.push(p);
    }

    return result.join(".");
}

const reserved = ["true", "false", "-", "+", "=", "<", ">", "(", ")","{", "}", "/",  "&", "|", "=", "!", "'", "`", '"', " ", "$", ".", ",", "?", ":", "null", "undefined", "new", "Math"];
const ignore = [".", "(", ")", ","];
const reservedTokens = ["globals", "event", "context", "parent", "data"];
const ignoreTokens = ["$globals", "$event", "$context", "$parent", "$data"];
const quotes = ["'", '"', "`"];
const stdQuotes = ["'", '"'];

/**
 * Break the expression into expression tokens
 * @param exp
 * @returns {[]}
 */
function tokenize(exp, ctxName) {
    let tokens = [];
    let word = [];

    let isString = false;
    for (let i = 0; i < exp.length; i++) {
        const char = exp[i];

        if (isString == true && char == "$" && exp[i + 1] == "{") {
            isString = false;
        }

        if (isString == true) {
            if (stdQuotes.indexOf(char) == -1) {
                word.push(char);
            }
            else {
                pushToken(tokens, word, char);
                isString = false;
            }
        }
        else if (reserved.indexOf(char) != -1) {
            pushToken(tokens, word, char);
            if (stdQuotes.indexOf(char) != -1) {
                isString = true;
            }
        }
        else {
            word.push(char);
        }
    }

    if (word.length > 0) {
        tokens.push(word.join(""));
    }

    if (ctxName != null) {
        tokens = removeNamedCtx(tokens, ctxName);
    }

    return tokens;
}

function removeNamedCtx(collection, ctxName) {
    const index = collection.indexOf(ctxName);
    if (index == -1) return collection;

    if (collection[index + 1] == ".") {
        collection.splice(index, 2);
        if (collection.indexOf(ctxName) != -1) {
            removeNamedCtx(collection, ctxName);
        }    }

    return collection;
}

function pushToken(tokens, word, char) {
    if (word.length > 0) {
        tokens.push(word.join(""));
        word.length = 0;
    }

    tokens.push(char);
    return false;
}

class ProviderBase {
    get data() {
        return crsbinding.data.getValue(this._context);
    }

    constructor(element, context, property, value, ctxName, parentId, changeParentToContext = true) {
        this._cleanEvents = [];
        this._globals = {};

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

        this.init && this.init();

        crsbinding.providerManager.register(this);
        this.initialize().catch(error => {
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

        this._cleanEvents.forEach(item => {
            crsbinding.data.removeCallback(item.context, item.path, item.callback);
            delete item.context;
            delete item.path;
            delete item.callback;
        });

        this._cleanEvents = null;

        for (let key of Object.keys(this._globals)) {
            crsbinding.data.removeCallback(crsbinding.$globals, key, this._globals[key]);
            delete this._globals[key];
        }
    }

    /**
     * Override to perform starting process
     */
    async initialize() {
    }

    listenOnPath(property, callback) {
        const collection = Array.isArray(property) == true ? property : [property];

        for (let p of collection) {
            let context = this._context;

            if (p.indexOf("$globals.") != -1) {
                context = crsbinding.$globals;
                p = p.split("$globals.").join("");
                this._globals[p] = callback;
            }

            this._addCallback(context, p, callback);
        }
    }

    _addCallback(context, path, callback) {
        crsbinding.data.addCallback(context, path, callback);
        this._cleanEvents.push({
            context: context,
            path: path.split("$parent.").join("").split("$context.").join(""),
            callback: callback
        });
    }
}

const setElementProperty = `requestAnimationFrame(() => element.__property__ = value);`;
const setElementValueProperty = `requestAnimationFrame(() => element.__property__ = value == null ? "" : value);`;
const setElementConditional = "requestAnimationFrame(() => element.__property__ = (__exp__) ? __true__ : __false__)";
const setDataset = `element.dataset["__property__"] = value == null ? "" : value`;

const setClassListRemove = `
if (element.__classList!=null) {
    const remove = Array.isArray(element.__classList) ? element.__classList : [element.__classList];
    remove.forEach(cls => element.classList.remove(cls));
}`;

const setClassListValue = `
element.__classList = value;
const add = Array.isArray(value) ? value : [value];
add.forEach(cls => element.classList.add(cls));`;

const setClassList = `${setClassListRemove} ${setClassListValue}`;

const setClassListCondition = `
    ${setClassListRemove}

    if (__exp__) {
        ${setClassListValue.split("value").join("__true__")}
    }
    else {
        ${setClassListValue.split("value").join("__false__")}
    }
`;

class OneWayProvider extends ProviderBase {
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
            return this.setContext();
        }

        this._eventHandler = this.propertyChanged.bind(this);
        this._exp = getExpForProvider(this);

        this._expObj = crsbinding.expression.compile(this._exp, ["element", "value"], {sanitize: false, ctxName: this._ctxName});

        let path = this._value;
        if (this._isNamedContext == true) {
            path = this._value.split(`${this._ctxName}.`).join("");
        }

        this.listenOnPath(path, this._eventHandler);

        const value = crsbinding.data.getValue(this._context, path);
        if (value != null) {
            this.propertyChanged(path, value);
        }
    }

    setContext() {
        if (this._element != null && this._property != null) {
            const fn = () => {
                this._element.removeEventListener("ready", fn);
                this._element[this._property] = crsbinding.data.getValue(this._context);
            };

            if (this._element.isReady == true) {
                fn();
            }
            else {
                this._element.addEventListener("ready", fn);
            }
        }
    }

    propertyChanged(prop, value) {
        if (this._expObj == null) return;

        if (this._isLinked != true && this._element._dataId != null) {
            crsbinding.data.link(this._context, prop, this._element._dataId, this._property, value);
            this._isLinked = true;
        }

        crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element, value));
    }
}

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

const changeElements = ["INPUT", "SELECT", "TEXTAREA"];

class BindProvider extends OneWayProvider {
    dispose() {
        this._element.removeEventListener(this._eventName, this._changeHandler);
        this._eventName = null;
        this._changeHandler = null;

        super.dispose();
    }

    async initialize() {
        await super.initialize();
        this._changeHandler = this._change.bind(this);
        
        this._eventName = (changeElements.indexOf(this._element.nodeName) !== -1) ? "change" :  `${this._property}Change`; 
        this._element.addEventListener(this._eventName, this._changeHandler);
    }

    _change(event) {
        let value = event.target[this._property];
        const type = event.target.type || "text";
        const typeFn = `_${type}`;

        if (this[typeFn] != null) {
            value = this[typeFn](value, event.target);
        }

        crsbinding.data.setProperty(this._context, this._value, value, this._ctxName, type == "text" ? "string" : type);

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
}

function getValueOnPath(object, path) {
    let obj = object;
    if (path.indexOf(".") == -1) {
        return obj[path];
    }

    const parts = path.split(".");
    for (let i = 0; i < parts.length -1; i++) {
        const part = parts[i];
        obj = obj[part];
        if (obj == null) return null;
    }
    return obj[parts[parts.length -1]];
}

function OnceProvider(element, context, property, value, ctxName = "context", parentId) {
    if (ctxName == "context") {
        setContext(element, context, property, value);
    }
    else {
        setItem(element, context, property, value, ctxName);
    }

    return null;
}

function setContext(element, context, property, value) {
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
        if(property === "value" || property === "placeholder") return;

        const fn = new Function("element", "value", `element.${property} = value`);
        fn(element, value);
    }
    else {
        const prop = property.replace("data-", "");
        element.dataset[prop] = value;
    }
}

class CallProvider extends ProviderBase {
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
        event.stopPropagation();
    }
}

class InnerProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId);

        if (element.innerText && element.innerText.indexOf("$parent.") != -1) {
            element.innerText = element.innerText.split("$parent.").join("");
            this._context = parentId;
        }
        else if (element.textContent && element.textContent.indexOf("$parent.") != -1) {
            element.textContent = element.textContent.split("$parent.").join("");
            this._context = parentId;
        }

        this._value = element.innerText || element.textContent;
        this._eventHandler = this._change.bind(this);
        this._expObj = crsbinding.expression.compile(element.innerText || element.textContent, null, {ctxName: this._ctxName});

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
        if (this._expObj == null) return;
        const target = this._element.textContent ? "textContent" : "innerText";
        this._element[target] = this._expObj.function(this.data);
    }
}

class AttrProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId);

        this._eventHandler = this._change.bind(this);
        this._expObj = crsbinding.expression.compile(this._value, null, {ctxName: this._ctxName});

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
        this._element.setAttribute(this._property, value);
    }
}

class RepeatBaseProvider extends ProviderBase {
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
        // 1. get the container and remove the template
        this._container = this._element.parentElement;
        this._shouldClearAll = this._container.children.length == 1;
        this._determineInsertParameters();

        // 2. get the properties to work with and build the for loop
        const parts = this._value.split("of");
        this._singular = parts[0].trim();
        this._plural = parts[1].trim();

        // 3. listen to the collection property on the context changing
        this._collectionChangedHandler = this._collectionChanged.bind(this);
        this.listenOnPath(this._plural, this._collectionChangedHandler);
    }

    async _collectionChanged(context, newValue) {
        if (newValue == null) return this._clear();
        await this._renderItems(newValue);
    }

    /**
     * Determine what must happen when inserting or deleting the collection.
     * Where must it go.
     * @private
     */
    _determineInsertParameters() {
        const nSibling = this._element.nextElementSibling;
        const pSibling = this._element.previousElementSibling;

        this.positionStruct = {
            startIndex: Array.from(this._container.children).indexOf(this._element),
            addAction: nSibling != null ? this._insertBefore.bind(nSibling) : this._appendItems.bind(this._element),
            removeAction: () => this._removeBetween.call(this._element, pSibling, nSibling)
        };
    }

    /**
     * Append the items to the parent of the element defined as this
     * @param element
     * @private
     */
    _appendItems(element) {
        this.parentElement.appendChild(element);
    }

    /**
     * Insert the items before the element defined as this
     * @param element
     * @private
     */
    _insertBefore(element) {
        this.parentElement.insertBefore(element, this);
    }

    /**
     * Remove all elements between the two elements defined in the parameters.
     * This is bound to the _element property
     * @param beforeElement
     * @param afterElement
     * @private
     */
    _removeBetween(beforeElement, afterElement) {
        // 1. get the bounds to operate in
        const elements = Array.from(this.parentElement.children);
        let startIndex = elements.indexOf(beforeElement);
        let endIndex = elements.indexOf(afterElement);

        if (startIndex == -1) startIndex = 0;
        if (endIndex == -1) endIndex = elements.length;

        // 2. get the elements to remove
        const elementsToRemove = [];
        for (let i = startIndex + 1; i < endIndex; i++) {
            if (elements[i].nodeName != "TEMPLATE") {
                elementsToRemove.push(elements[i]);
            }
        }

        // 3. remove the elements earmarked for removal
        for (let element of elementsToRemove) {
            element.parentElement.removeChild(element);
        }
    }

    _clear() {
        if (this._shouldClearAll == true) {
            this._clearAll();
        }
        else {
            this._clearPartial();
        }
    }

    _clearAll() {
        const elements = Array.from(this._container.children).filter(el => el.nodeName != "TEMPLATE");

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

    createElement(item, arrayId) {
        const id = crsbinding.data.createReferenceTo(this._context, `${this._context}-array-item-${arrayId}`, this._plural, arrayId);
        const element = this._element.content.cloneNode(true);
        crsbinding.parsers.parseElement(element, id, this._singular, this._context);

        item.__uid = id;

        for (let child of element.children) {
            child.dataset.uid = id;
        }

        return element;
    }
}

class ForProvider extends RepeatBaseProvider {
    init() {
        this._itemsAddedHandler = this._itemsAdded.bind(this);
        this._itemsDeletedHandler = this._itemsDeleted.bind(this);
    }

    dispose() {
        crsbinding.expression.release(this._forExp);
        this._forExp = null;
        this._itemsAddedHandler = null;
        this._itemsDeletedHandler = null;

        super.dispose();
    }

    async initialize() {
        super.initialize();

        const forExp = "for (let i = 0; i < context.length; i++) { callback(context[i], i) }";
        this._forExp = crsbinding.expression.compile(forExp, ["callback"], {sanitize: false, async: true, ctxName: this._ctxName});
        crsbinding.data.setArrayEvents(this._context, this._plural, this._itemsAddedHandler, this._itemsDeletedHandler);
    }

    async _renderItems(array) {
        await super._renderItems();

        // create document fragment
        const fragment = document.createDocumentFragment();

        // loop through items and add them to fragment after being parsed
        await this._forExp.function(array, (item) => {
            item.__aId = crsbinding.data.nextArrayId();
            const element = this.createElement(item, item.__aId);
            fragment.appendChild(element);
        });

        this.positionStruct.addAction(fragment);

        // update the container's provider to this so that this can be freed when content changes
        if (this._container.__providers == null) {
            this._container.__providers = [];
        }

        if (this._container.__providers.indexOf(this.id) == -1) {
            this._container.__providers.push(this.id);
        }
    }

    _itemsAdded(added, collection) {
        for (let i = 0; i < added.length; i++) {
            const item = added[i];
            const index = collection.indexOf(item);

            item.__aId = crsbinding.data.nextArrayId();
            const element = this.createElement(item, item.__aId);
            const update = element.children[0];
            const child = this._container.children[index + this.positionStruct.startIndex + 1];
            this._container.insertBefore(element, child);

            for (let p of update.__providers || []) {
                const provider = crsbinding.providerManager.items.get(p);
                if (provider instanceof AttrProvider) {
                    provider._change();
                }
            }
        }
    }

    _itemsDeleted(removed, collection) {
        if (removed == null) return;

        const elements = [];
        const array = Array.isArray(removed) ? removed : [removed];

        for (let item of array) {
            const uid = item.__uid;
            const result = this._container.querySelectorAll([`[data-uid="${uid}"]`]);
            result.forEach(element => elements.push(element));
            crsbinding.data.removeObject(uid);
        }

        for (let element of elements) {
            if (element != null) {
                element.parentElement.removeChild(element);
                crsbinding.observation.releaseBinding(element);
            }
        }
    }
}

class IfProvider extends ProviderBase {
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
        }
        else if(this._value.indexOf(":") != -1) {
            sanProp = this._initCndValue();
        }
        else {
            sanProp = this._initCndAttrValue();
        }

        if (this._value.indexOf("$parent") != -1) {
            this._expObj.parentObj = crsbinding.data.getValue(this._parentId);

            sanProp.properties.forEach(path => {
                if (path.indexOf("$parent.") != -1) {
                    const p = path.replace("$parent.", "");
                    this._addCallback(this._parentId, p, this._eventHandler);
                }
            });
        }

        this.propertyChanged();
    }

    /**
     * There is no value to be set.
     * Add or remove the attribute.
     * Used for hidden.bind or disabled.bind
     * @private
     */
    _initCndAttr() {
        const value = crsbinding.expression.sanitize(this._value, this._ctxName);
        const fnCode = initCndAttrExp
            .split("__exp__").join(value.expression)
            .split("__attr__").join(this._property)
            .split("__attr-value__").join(this._property);

        this._expObj = crsbinding.expression.compile(fnCode, ["element", "parent"], {sanitize: false, ctxName: this._ctxName});
        this.listenOnPath(value.properties.filter(item => item.indexOf("$parent") == -1), this._eventHandler);
        return value;
    }

    /**
     * There is an attribute value that gets toggled do not remove the attribute
     * @private
     */
    _initCndValue() {
        const value = crsbinding.expression.sanitize(this._value, this._ctxName);
        const parts = value.expression.split("?");
        const valueParts = parts[1].split(":");
        const tval = this._sanitizeValue(valueParts[0].trim());
        const fval = this._sanitizeValue(valueParts[1].trim());

        const fnCode = initCndValueExp
            .split("__exp__").join(parts[0].trim())
            .split("__attr__").join(this._property)
            .split("__true__").join(tval)
            .split("__false__").join(fval);

        this._expObj = crsbinding.expression.compile(fnCode, ["element", "parent"], {sanitize: false, ctxName: this._ctxName});

        this.listenOnPath(value.properties, this._eventHandler);
        return value;
    }

    /**
     * if the expression passes set the attribute else remove the attribute
     * @private
     */
    _initCndAttrValue() {
        const value = crsbinding.expression.sanitize(this._value, this._ctxName);
        const parts = value.expression.split("?");

        const fnCode = initCndAttrExp
            .split("__exp__").join(parts[0].trim())
            .split("__attr__").join(this._property)
            .split("__attr-value__").join(parts[1].trim());

        this._expObj = crsbinding.expression.compile(fnCode, ["element", "parent"], {sanitize: false, ctxName: this._ctxName});

        this.listenOnPath(value.properties, this._eventHandler);
        this.propertyChanged();
        return value;
    }

    _sanitizeValue(value) {
        if (this._sanitizeProperties.indexOf(this._property) == -1) return value;
        return value.split("'").join("");
    }

    propertyChanged() {
        try {
            crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element, this._expObj.parentObj));
        }
        catch {
            return;
        }
    }
}

const initCndAttrExp = `
if (__exp__) {
    element.setAttribute("__attr__", "__attr-value__");
}
else {
    element.removeAttribute("__attr__");
}
`;

const initCndValueExp = `
if (__exp__) {
    element.setAttribute("__attr__", "__true__");
}
else {
    element.setAttribute("__attr__", "__false__");
}
`;

class IfClassProvider extends ProviderBase {
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
        const falseValue = values.length > 1 ? values[1].trim() : '[]';

        const fnCode = setClassListCondition
            .split("__property__").join(this._property)
            .split("__exp__").join(condition)
            .split("__true__").join(trueValue)
            .split("__false__").join(falseValue);

        this._expObj = crsbinding.expression.compile(fnCode, ["element"], {sanitize: false, ctxName: this._ctxName});
        this.listenOnPath(value.properties, this._eventHandler);
        this.propertyChanged();
    }

    propertyChanged() {
        try {
            crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element));
        }
        catch {
            return;
        }
    }
}

class IfStylesProvider extends ProviderBase {
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

        const fnCode = setElementConditional
            .split("__property__").join(crsbinding.utils.capitalizePropertyPath(this._property))
            .split("__exp__").join(condition)
            .split("__true__").join(trueValue)
            .split("__false__").join(falseValue);

        this._expObj = crsbinding.expression.compile(fnCode, ["element"], {sanitize: false, ctxName: this._ctxName});
        this.listenOnPath(value.properties, this._eventHandler);
        this.propertyChanged();
    }

    propertyChanged() {
        try {
            crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element));
        }
        catch {
            return;
        }
    }
}

function ForOnceProvider(element, context, property, value, ctxName = "context", parentId) {
    if (value.indexOf("$parent.") != -1) {
        value = value.split("$parent.").join("");
        context = parentId;
    }
    const parts = value.split("of");
    const singular = parts[0].trim();
    const plural = parts[1].trim();

    crsbinding.inflationManager.register("for-once", element, singular);

    const data = crsbinding.data.getValue(context, plural);

    const elements = crsbinding.inflationManager.get("for-once", data);
    element.parentElement.appendChild(elements);
    element.parentElement.removeChild(element);

    crsbinding.inflationManager.unregister("for-once");
}

class ForMapProvider extends RepeatBaseProvider {
    dispose() {
        super.dispose();
    }

    async _renderItems(array) {
        await super._renderItems();

        const fragment = document.createDocumentFragment();

        array.forEach((value, key) => {
            const element = this.createElement(value, key);
            value.__aId = key;

            fragment.appendChild(element);
        });

        this.positionStruct.addAction(fragment);

        if (this._container.__providers == null) {
            this._container.__providers = [];
        }

        if (this._container.__providers.indexOf(this.id) == -1) {
            this._container.__providers.push(this.id);
        }
    }
}

class EmitProvider extends CallProvider {
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
        if (parameters == null) return;
        const argParts = parameters.split(")").join("").split(",");

        for (let i = 0; i < argParts.length; i++) {
            const ap = argParts[i];
            const v = ap.trim();

            if (this[v] != null) {
                this[v](args);
            }
            else {
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
        if (value.indexOf("${") != -1)
        {
            return value.split("${").join("context.").split("}").join("");
        }

        return value;
    }
}

class PostProvider extends EmitProvider {
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
}

function getProperty(obj, property) {
    const field = `_${property}`;
    if (obj[field] != null) {
        return obj[field];
    }

    return crsbinding.data.getValue(obj._dataId, property);
}

function setProperty$1(obj, property, value) {
    let oldValue = getProperty(obj, property);

    if (Array.isArray(oldValue)) {
        crsbinding.data.array(obj, property).splice(0, oldValue.length);
    }
    if (value && value.__uid != null) {
        oldValue && crsbinding.data.unlinkArrayItem(oldValue);
    }

    crsbinding.data.setProperty(obj._dataId, property, value);

    if (Array.isArray(value)) {
        obj[`_${property}`] = crsbinding.data.array(obj._dataId, property);
    }

    if (value && value.__uid) {
        crsbinding.data.linkToArrayItem(obj._dataId, property, value.__uid);
    }
}

class SetValueProvider extends CallProvider {
    async initialize() {
        const parts = this._value.split("=");

        const value = this._processRightPart(parts[1].trim());
        const src = this._processLeftPart(parts[0].trim(), value);

        this._fn = new Function("context", "event", "setProperty", src);
    }

    _processRightPart(part) {
        return crsbinding.expression.sanitize(part, this._ctxName, true).expression;
    }

    _processLeftPart(part, value) {
        if (part.indexOf("$globals") != -1) {
            return this._getGlobalSetter(part, value);
        }
        else {
            return this._getContextSetter(part, value);
        }
    }

    _getGlobalSetter(part, value) {
        const path = part.replace("$globals.", "");
        return `setProperty({_dataId: crsbinding.$globals}, "${path}", ${value});`;
    }

    _getContextSetter(part, value) {
        part = part.replace("$context.", "");

        if (value.indexOf("context.") != -1) {
            const parts = value.split("context.");
            const property = parts[parts.length -1];
            let prefix = parts[0] == "!" ? "!" : "";
            value = `${prefix}crsbinding.data.getValue({_dataId: ${this._context}}, "${property}")`;
        }

        return `setProperty({_dataId: ${this._context}}, "${part}", ${value});`;
    }

    event(event) {
        const context = crsbinding.data.getContext(this._context);
        crsbinding.idleTaskManager.add(this._fn(context, event, this._setProperty));
        event.stopPropagation();
    }

    _setProperty(obj, property, value) {
        if (value !== undefined) {
            setProperty$1(obj, property, value);
        }
    }
}

class ProviderFactory {
    static "bind"(element, context, property, value, ctxName, attr, parentId) {
        if (["value", "checked"].indexOf(property) != -1) {
            return new BindProvider(element, context, property, value, ctxName, parentId);
        }
        else {
            return this["one-way"](element, context, property, value, ctxName, parentId);
        }
    }

    static "two-way"(element, context, property, value, ctxName, attr, parentId) {
        return new BindProvider(element, context, property, value, ctxName, parentId);
    }

    static "one-way"(element, context, property, value, ctxName, attr, parentId) {
        return new OneWayProvider(element, context, property, value, ctxName, parentId);
    }

    static "once"(element, context, property, value, ctxName, attr, parentId) {
        return OnceProvider(element, context, property, value, ctxName);
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

    static "if"(element, context, property, value, ctxName, attr,  parentId) {
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
}

const ignore$1 = ["STYLE"];

function parseElements(collection, context, ctxName = "context", parentId) {
    for (let element of collection || []) {
        if (ignore$1.indexOf(element.nodeName) == -1) {            
            parseElement(element, context, ctxName, parentId);
        }
    }
}

function parseElement(element, context, ctxName = "context", parentId) {
    parseElements(element.children, context, ctxName, parentId);

    const attributes = Array.from(element.attributes || []);
    const boundAttributes = attributes.filter(attr =>
        (attr.ownerElement.tagName == "TEMPLATE" && attr.name == "for") ||
        (attr.name.indexOf(".") != -1) ||
        ((attr.value || "").indexOf("${") == 0)
    );

    parseAttributes(boundAttributes, context, ctxName, parentId);

    if (element.children && element.children.length == 0 && (element.innerText || element.textContent || "").indexOf("${") != -1) {
        ProviderFactory["inner"](element, context, null, null, ctxName, null, parentId);
    }
}

function parseAttributes(collection, context, ctxName, parentId) {
    for (let attr of collection) {
        parseAttribute(attr, context, ctxName, parentId);
    }
}

function parseAttribute(attr, context, ctxName, parentId) {
    const parts = attr.name.split(".");
    let prop = parts.length == 2 ? parts[0] : parts.slice(0, parts.length -1).join(".");
    let prov = prop == "for" ? prop : parts[parts.length - 1];

    if (prop.length == 0 && attr.value[0] == "$") {
        prop = prov;
        prov = "attr";
    }

    const provider = ProviderFactory[prov](attr.ownerElement, context, prop, attr.value, ctxName, attr, parentId);

    if (provider == null || provider.constructor.name != "AttrProvider") {
        attr.ownerElement.removeAttribute(attr.nodeName);
    }

    return provider;
}

function releaseBinding(element) {
    crsbinding.providerManager.releaseElement(element);
}

function releaseChildBinding(element) {
    for (let child of element.children) {
        releaseBinding(child);
    }
}

class ProviderManager {
    constructor() {
        this._nextId = 0;
        this.items = new Map();
        this.providers = {
            for: {
                map: ForMapProvider,
                once: ForOnceProvider
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
        for (let child of element.children || []) {
            await this.releaseElement(child);
        }

        if (element.__providers == null) return;

        for (let id of element.__providers) {
            const provider = this.items.get(id);
            this.items.delete(id);
            provider && provider.dispose();
        }
        element.__providers = null;

        if (this.items.size == 0) {
            this._nextId = 0;
        }
    }
}

globalThis.requestIdleCallback =
    globalThis.requestIdleCallback ||
    function (cb) {
        const start = Date.now();
        return setTimeout(function () {
            cb({
                didTimeout: false,
                timeRemaining: function () {
                    return Math.max(0, 50 - (Date.now() - start));
                }
            });
        }, 1);
    };

globalThis.cancelIdleCallback =
    globalThis.cancelIdleCallback ||
    function (id) {
        clearTimeout(id);
    };

class IdleTaskManager {
    constructor() {
        this.processing = false;
        this._list = [];
    }

    dispose() {
        this._list = null;
    }

    /**
     * Add a function to the manager to call once the system is idle
     * @param fn {Function}
     */
    add(fn) {
        fn && this._list.push(fn);
        !this.processing && this._processQueue();
    }

    /**
     * Loop through the required functions and execute them in turn.
     * @private
     */
    _processQueue() {
        if (requestIdleCallback == null) return this._runNextFunction();

        this.processing = true;
        requestIdleCallback(deadline => {
            while((deadline.timeRemaining() > 0 || deadline.didTimeout) && this._list.length) {
                this._runNextFunction();
            }
            this.processing = false;
        }, {timeout: 1000});
    }

    /**
     * Shift the list and run the function
     * @private
     */
    _runNextFunction() {
        let fn = this._list.shift();
        fn && fn();
    }
}

function listenOnPath(context, value, callback) {
    const parts = value.split(".");
}

function listenOn(context, property, callback) {
    if (property.indexOf(".") == -1) {
        crsbinding.events.on(context, property.trim(), callback);
    }
    else {
        crsbinding.events.listenOnPath(context, property, callback);
    }
}

function domEnableEvents(element) {
    element._domEvents = [];
    element.registerEvent = registerEvent;
    element.unregisterEvent = unregisterEvent;
}

function domDisableEvents(element) {
    if (element._domEvents == null) return;
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

function registerEvent(element, event, callback) {
    element.addEventListener(event, callback);
    this._domEvents.push({
        element: element,
        event: event,
        callback: callback
    });
}

function unregisterEvent(element, event, callback) {
    const item = this._domEvents.find(item => item.element == element && item.event == event && item.callback == callback);
    if (item == null) return;

    element.removeEventListener(item.event, item.callback);

    this._domEvents.splice(this._domEvents.indexOf(item), 1);
    delete item.element;
    delete item.callback;
    delete item.event;
}

class InflationManager {
    constructor() {
        this._items = new Map();
    }

    dispose() {
        this._items.clear();
        this._items = null;
    }

    /**
     * This function registers a template for creating elements using the get function
     * @param id
     * @param template
     */
    register(id, template, ctxName = "context", measure = false) {
        const generator = new InflationCodeGenerator(ctxName);
        const result = generator.generateCodeFor(template);
        generator.dispose();

        crsbinding.elementStoreManager.register(id, template, measure);

        this._items.set(id, {
            inflate: result.inflate,
            deflate: result.deflate
        });
    }

    /**
     * Remove the template from the inflation manager as we are longer going to use it anymore
     * @param id
     */
    unregister(id) {
        const item = this._items.get(id);
        if (item != null) {
            item.inflate = null;
            item.defaulte = null;
            this._items.delete(id);
        }
        crsbinding.elementStoreManager.unregister(id);
    }

    /**
     * Get a element or elements and inflate it with the data
     * @param id
     * @param data
     */
    get(id, data) {
        const item = this._items.get(id);
        if (item == null) return null;

        const fragment = crsbinding.elementStoreManager.getElements(id, data.length);
        for (let i = 0; i < data.length; i++) {
            this.inflate(id, fragment.children[i], data[i], item.inflate);
        }

        return fragment;
    }

    /**
     * Inflate a element
     * @param id
     * @param element
     * @param data
     */
    inflate(id, element, data, inflate = null) {
        const fn = inflate || this._items.get(id).inflate;
        fn(element, data);

        const removedElements = element.querySelectorAll('[remove="true"]');
        for (let rel of removedElements) {
            rel.parentElement.removeChild(rel);
        }
    }

    /**
     * Deflate a element
     * @param id
     * @param element
     */
    deflate(id, elements) {
        const fn = this._items.get(id).deflate;

        if (Array.isArray(elements)) {
            for (let element of elements) {
                fn(element);
            }
        }
        else {
            fn(elements);
        }
    }

    /**
     * Return elements back to the store for use again later
     * @param id
     * @param elements
     * @param restore
     */
    returnElements(id, elements, restore = false) {
        crsbinding.elementStoreManager.returnElements(id, elements, restore);
    }
}

class InflationCodeGenerator {
    constructor(ctxName) {
        this.inflateSrc = [];
        this.deflateSrc = [];
        this._ctxName = ctxName;
    }

    dispose() {
        this.inflateSrc = null;
        this.deflateSrc = null;
    };

    generateCodeFor(template) {
        const element = template.content.children[0];
        this.path = "element";

        this._processElement(element);

        const inflateCode = this.inflateSrc.join("\n");
        const deflateCode = this.deflateSrc.join("\n");

        return {
            inflate: new Function("element", this._ctxName, inflateCode),
            deflate: new Function("element", this._ctxName, deflateCode)
        }
    }

    _processElement(element) {
        this._processInnerText(element);
        this._processAttributes(element);

        const path = this.path;
        for (let i = 0; i < element.children.length; i++) {
            this.path = `${path}.children[${i}]`;
            this._processElement(element.children[i]);
        }
    }

    _processInnerText(element) {
        const text = (element.innerHTML || "").trim();
        const target = element.textContent ? "textContent" : "innerText";
        
        if (text.indexOf("${") == 0) {
            let exp = text.substr(2, text.length - 3);
            exp = crsbinding.expression.sanitize(exp, this._ctxName).expression;
            this.inflateSrc.push(`${this.path}.${target} = ${exp};`);
            this.deflateSrc.push(`${this.path}.${target} = "";`);
        }
    }

    _processAttributes(element) {
        const attributes = Array.from(element.attributes).filter(attr => attr.value.indexOf("${") != -1 || attr.name.indexOf(".if") != -1);
        for (let attr of attributes) {
            if (attr.value.indexOf("${") != -1) {
                this._processAttrValue(attr);
            }
            else {
                this._processAttrCondition(attr);
            }
        }
    }

    _processAttrValue(attr) {
        const text = attr.value.trim();
        let exp = text.substr(2, text.length - 3);
        exp = crsbinding.expression.sanitize(exp, this._ctxName).expression;

        if (attr.name == "xlink:href") {
            this.inflateSrc.push(`${this.path}.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", ${exp});`);
        }
        else {
            const parts = exp.split("?");
            this.inflateSrc.push(`if (${parts[0].trim()} != null) {${this.path}.setAttribute("${attr.name}", ${exp});}`);
        }


        this.deflateSrc.push(`${this.path}.removeAttribute("${attr.name}");`);
        attr.ownerElement.removeAttribute(attr.name);
    }

    _processAttrCondition(attr) {
        if (attr.name.trim().indexOf("style") == 0) {
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
        const prop = parts[1];
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
        }
        else {
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
}

class ValueConverters {
    constructor() {
        this._converters = new Map();
    }

    dispose() {
        this._converters.clear();
        this._converters = null;
    }

    register(valueType, converter) {
        this._converters.set(valueType, converter);
    }

    unregister(valueType) {
        this._converters.delete(valueType);
    }

    convertTo(valueType, value) {
        const converter = this._converters.get(valueType);
        if (converter == null) return value;
        return converter.convertTo(value);
    }

    convertBack(valueType, value) {
        const converter = this._converters.get(valueType);
        if (converter == null) return value;
        return converter.convertBack(value);
    }
}

function clone(obj) {
    if (obj == null) return obj;
    const result = cleanClone(Object.assign({}, obj));
    return result;
}

function cleanClone(obj) {
    let properties = Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == 0);
    for (let property of properties) {
        delete obj[property];
    }

    properties =  Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == -1 && typeof obj[item] == "object");
    for (let property of properties) {
        cleanClone(obj[property]);
    }

    return obj;
}

function createArrayProxy(array, id, property) {
    if (array == null) return null;

    array.__id = id;
    array.__property = property;

    return new Proxy(array, {get: get});
}

const deleteFunctions = ["pop", "splice"];
const addFunctions = ["push"];

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
            }
            else if (addFunctions.indexOf(property) != -1) {
                itemsAdded(collection, args);
            }

            return result;
        }
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

/**
 * Binding data used for binding operations
 * @type {Map<any, any>}
 */
const data = new Map();

/**
 * Functions that trigger when properties change.
 * This updates the UI and performs binding operations as defined in the DOM
 * @type {Map<any, any>}
 */
const callbacks = new Map();

/**
 * When a object's value changes, copy that value to a update as defined in this map
 * @type {Map<any, any>}
 */
const updates = new Map();

/**
 * When this property changes, also update other UI by firing their triggers.
 * Items in the trigger array are related, if one changes, update the UI of all the triggers in the same group
 * @type {Map<any, any>}
 */
const triggers = new Map();

/**
 * Components and views need access to the actual class to execute delegates.
 * @type {Map<any, any>}
 */
const context = new Map();

const idStore = {
    nextId: 0,
    nextTriggerId: 0,
    nextArrayId: 0
};


function getNextId() {
    return nextId("nextId");
}

function getNextTriggerId() {
    return nextId("nextTriggerId");
}

function nextArrayId() {
    return nextId("nextArrayId");
}

function nextId(idVariable) {
    const id = idStore[idVariable];
    idStore[idVariable] += 1;
    return id;
}

function callFunctionsOnPath(id, path) {
    const obj = callbacks.get(id);
    const result =  getValueOnPath(obj, path);
    if (result != null) {
        callFunctionsOnObject(result, id, path);
    }
}

async function callFunctions(id, property) {
    if (typeof id == "object") {
        id = id.__uid || id._dataId;
    }

    const obj = callbacks.get(id);

    if (property == null) {
        const properties = getOwnProperties(obj);
        for (let prop of properties) {
            await callFunctionsOnObject(obj[prop], id, prop);
        }
    }
    else {
        if (property.indexOf(".") != -1) return callFunctionsOnPath(id, property);

        if (obj == null) return;
        if (obj[property] == null) return;
        await callFunctionsOnObject(obj[property], id, property);
    }
}

async function callFunctionsOnObject(obj, id, property) {
    const functions = obj.__functions;
    if (functions != null) {
        for(let fn of obj.__functions) {
            const value = bindingData.getValue(id, property);
            await fn(property, value);
        }
    }

    if (obj.__trigger != null) {
        const triggerObj = triggers.get(obj.__trigger);
        if (triggerObj.frozen != true) {
            triggerObj.frozen = true;
            for (let trigger of triggerObj.values) {
                if (trigger.id == id && trigger.path == property) continue;
                await crsbinding.data.updateUI(trigger.id, trigger.path);
            }
            delete triggerObj.frozen;
        }
    }

    const properties = getOwnProperties(obj);
    for (let prop of properties) {
        await callFunctionsOnObject(obj[prop], id, `${property}.${prop}`);
    }
}

function performUpdates(id, property, value) {
    const obj = updates.get(id);
    if (obj != null && obj[property] != null) {
        bindingData.setProperty(obj[property].originId, obj[property].originProperty, value);
    }

    const ctx = context.get(id);
    const fnName = `${property}Changed`;
    ctx && ctx[fnName] && ctx[fnName](value);
}

function addCallback(obj, property, callback) {
    obj[property] = obj[property] || {};
    obj[property].__functions = obj[property].__functions || [];
    obj[property].__functions.push(callback);
}

function removeCallback(id, path, callback) {
    const obj = callbacks.get(id);
    if (obj == null) return;

    const property = getValueOnPath(obj, path);

    if (property.__functions) {
        const index = property.__functions.indexOf(callback);
        if (index != -1) {
            property.__functions.splice(index, 1);

            if (property.__functions.length == 0) {
                delete property.__functions;
            }
        }
    }
}

function addCallbackPath(obj, path, callback) {
    ensurePath(obj, path, (obj, prop) => {
        addCallback(obj, prop, callback);
    });
}

function ensurePath(obj, path, callback) {
    let cobj = obj;
    const parts = path.split(".");

    for (let i = 0; i < parts.length -1; i++) {
        const part = parts[i];
        if (cobj[part] == null) {
            cobj[part] = {};
        }
        cobj = cobj[part];
    }

    callback && callback(cobj, parts[parts.length -1]);
}

function setProperty$2(obj, property, value) {
    if (obj[property] !== value) {
        obj[property] = value;
        return true;
    }
    return false;
}

function setPropertyPath(obj, path, value) {
    let result = true;
    ensurePath(obj, path, (obj,  prop) => result = setProperty$2(obj, prop, value));
    return result;
}

function getProperty$1(obj, property) {
    return obj[property]
}

function getPropertyPath(obj, path) {
    return getValueOnPath(obj, path);
}

function createReference(refId, name, path, index) {
    const id = getNextId();

    const ref = {
        id: id,
        name: name,
        type: "ref",
        refId: refId,
        path: path
    };

    if (index !== undefined) {
        ref.aId = index;
    }

    data.set(id, ref);
    callbacks.set(id, {});
    return id;
}

function addUpdateOrigin(sourceId, sourceProp, targetId, targetProp) {
    const update = updates.get(targetId) || {};
    const source = update[targetProp] || {};

    if (source.originId == sourceId && source.originProperty == sourceProp) return;

    source.originId = sourceId;
    source.originProperty = sourceProp;
    update[targetProp] = source;
    updates.set(targetId, update);
}

function link(sourceId, sourceProp, targetId, targetProp, value) {
    if (typeof value != "object" || value === null) {
        addUpdateOrigin(sourceId, sourceProp, targetId, targetProp);
        addUpdateOrigin(targetId, targetProp, sourceId, sourceProp);
        syncValueTrigger(sourceId, sourceProp, targetId, targetProp);
    }
    else {
        syncTriggers(sourceId, sourceProp, targetId, targetProp);
    }
}

function linkToArrayItem(id, path, itemId) {
    let sourceObj = getValueOnPath(callbacks.get(id), path);
    if (sourceObj == null) return;

    let targetObj = callbacks.get(itemId);

    const properties = getOwnProperties(sourceObj);
    for (let property of properties) {
        copyTriggers(sourceObj, property, targetObj, property, itemId, property);
    }
}

function unlinkArrayItem(object) {
    const clbObj = callbacks.get(object.__uid);
    removeTriggersOnCallbacks(clbObj, object.__uid);
}

function removeTriggersOnCallbacks(obj, id) {
    const properties = getOwnProperties(obj);
    for (let property of properties) {
        const trigger = obj[property].__trigger;
        if (trigger != null) {
            delete obj[property].__trigger;
            removeTriggersOnTriggers(id, trigger);
        }

        if (typeof obj[property] == "object") {
            removeTriggersOnCallbacks(obj[property]);
        }
    }
}

function removeTriggersOnTriggers(id, triggerId) {
    const obj = triggers.get(triggerId);
    const items = obj.values.filter(item => item.id == id);
    for (let item of items) {
        const index = obj.values.indexOf(item);
        obj.values.splice(index, 1);
    }
}

function syncValueTrigger(sourceId, sourceProp, targetId, targetProp) {
    let sourceObj = callbacks.get(sourceId);
    let targetObj = callbacks.get(targetId);

    const trigger = getValueOnPath(sourceObj, `${sourceProp}.__trigger`);
    if (trigger != null) {
        targetObj[targetProp] = targetObj[targetProp] || {};
        targetObj[targetProp].__trigger = trigger;

        const tr = triggers.get(trigger);
        tr.values.push({id: targetId, path: targetProp});
    }
}

function syncTriggers(sourceId, sourceProp, targetId, targetProp) {
    let sourceObj = callbacks.get(sourceId);
    let targetObj = callbacks.get(targetId);

    if (sourceProp.indexOf(".") == -1) {
        copyTriggers(sourceObj, sourceProp, targetObj, targetProp, targetId, targetProp);
    }
    else {
        ensurePath(targetObj, targetProp, (obj, prop) => {
            obj[prop] = obj[prop] || {};
            const parts = sourceProp.split(".");
            const sp = parts[parts.length -1];  // source property
            const np = parts.splice(0, parts.length -1).join(); // new Path
            const so = getValueOnPath(sourceObj, np); // source object
            copyTriggers(so, sp, obj, prop, targetId, targetProp);
        });
    }
}

function setArrayEvents(id, path, itemsAddedCallback, itemsDeletedCallback) {
    const cbObj = callbacks.get(id);

    ensurePath(cbObj, path, (obj, property) => {
        obj[property] = obj[property] || {};

        obj[property].__itemsAdded = obj[property].itemsAdded || [];
        obj[property].__itemsAdded.push(itemsAddedCallback);

        obj[property].__itemsDeleted = obj[property].itemsDeleted || [];
        obj[property].__itemsDeleted.push(itemsDeletedCallback);
    });
}

function copyTriggers(sourceObj, sourceProp, targetObj, targetProp, targetId, targetPath) {
    const source = sourceObj[sourceProp];
    const target = targetObj[targetProp] = targetObj[targetProp] || {};

    if (source.__trigger != null) {
        target.__trigger = source.__trigger;

        const tr = triggers.get(source.__trigger);
        tr.values.push({id: targetId, path: targetPath});
    }

    const properties = getOwnProperties(source);
    for (let property of properties) {
        copyTriggers(source, property, target, property, targetId, `${targetPath}.${property}`);
    }
}

function getOwnProperties(obj) {
    return Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == -1)
}

function makeShared(id, property, sharedItems) {
    if (typeof id == "object") {
        id = id.__uid || id._dataId;
    }

    const obj = callbacks.get(id);
    for (let prop of sharedItems) {
        const path = `${property}.${prop}`;
        ensurePath(obj, path, (tobj, tprop) => {
            if (tobj[tprop] == null) {
                tobj[tprop] = {};
            }

            const nextId = getNextTriggerId();
            triggers.set(nextId, { values: [{id: id, path: path}]});
            tobj[tprop].__trigger = nextId;
        });
    }
}

function notifyArrayItemsAdded(collection, items) {
    crsbinding.data.arrayItemsAdded(collection.__id, collection.__property, Array.isArray(items) ? items: [items], collection);
}

function notifyArrayItemsRemoved(collection, items) {
    crsbinding.data.arrayItemsRemoved(collection.__id, collection.__property, Array.isArray(items) ? items: [items], collection);
}


function arrayItemsAdded(id, prop, items, collection) {
    const obj = callbacks.get(id);
    const clbObj = getValueOnPath(obj, prop);

    for (let callback of clbObj.__itemsAdded || []) {
        callback(items, collection);
    }
}

function arrayItemsRemoved(id, prop, items, collection) {
    const obj = callbacks.get(id);
    const clbObj = getValueOnPath(obj, prop);
    for (let callback of clbObj.__itemsDeleted || []) {
        callback(items, collection);
    }
}

function removeObject(id) {
    context.delete(id);

    removeData(id);
    removeCallbacks(id);
    removeUpdates(id);
    removeTriggers(id);
}

function removeData(id) {
    removeReferences(id);
    data.delete(id);
    if (data.size == 0) {
        idStore.nextId = 0;
        idStore.nextArrayId = 0;
    }
}

function removeReferences(parentId) {
    const references = Array.from(data).filter(item => item[1].refId == parentId);
    for (let ref of references) {
        removeObject(ref[1].id);
    }
}

function removeCallbacks(id) {
    callbacks.delete(id);
}

function removeUpdates(id) {
    const remove = Array.from(updates).filter(item => item[0] == id || (item[1].value && item[1].value.originId == id));
    for (let rem of remove) {
        updates.delete(rem[0]);
    }
}

function removeTriggers(id) {
    const tr = Array.from(triggers);
    for (let trigger of tr) {
        const index = trigger[1].values.findIndex(item => item.id == id);
        if (index != -1) {
            trigger[1].values.splice(index, 1);

            if (trigger.values.length == 0) {
                triggers.delete(trigger[0]);
            }
        }
    }

    if (triggers.size == 0) {
        idStore.nextTriggerId = 0;
    }
}

const bindingData = {
    details: {data: data, callbacks: callbacks, updates: updates, triggers: triggers, context:  context},

    link: link,

    setName(id, name) {
        data.get(id).name = name;
    },

    addObject(name, type = {}) {
        const id = getNextId();
        data.set(id, {
            id: id,
            name: name,
            type: "data",
            data: type
        });

        callbacks.set(id, {});

        return id;
    },

    removeObject: removeObject,

    addContext(id, obj) {
        context.set(id, obj);
    },

    addCallback(id, property, callback) {
        const obj = callbacks.get(id);
        return property.indexOf(".") == -1 ? addCallback(obj, property, callback) : addCallbackPath(obj, property, callback);
    },

    setProperty(id, property, value, ctxName, dataType) {
        if (typeof id == "object") {
            id = id.__uid || id._dataId;
        }

        let obj = data.get(id);

        if (dataType == "boolean" || typeof value === "boolean") {
            value = Boolean(value);
        }
        else if (dataType == "number" || (dataType == null && typeof value !== "object" && isNaN(value) == false)) {
            value = Number(value);
        }

        if (obj.type == "data") {
            obj = data.get(id).data;
            const changed = property.indexOf(".") == -1 ? setProperty$2(obj, property, value) : setPropertyPath(obj, property, value);

            if (changed == true) {
                performUpdates(id, property, value);
                callFunctions(id, property);
            }
        }
        else {
            this.setReferenceValue(id, property, value, obj.refId, obj.path, obj.aId, ctxName);
        }
    },

    /**
     * Get either the value as defined by the property and id pair
     * or get the object by just defining the id.
     * @param id {number} id of the data object to use, see _dataId on component
     * @param property {string} optional - path to the property
     * @returns {value}
     */
    getValue(id, property) {
        if (id == "undefined" || id == null) return undefined;

        if (typeof id == "object") {
            id = id.__uid || id._dataId;
        }

        const obj = data.get(Number(id));

        if (obj.type == "data") {
            const data = obj.data;
            if (property == null) return data;
            return property.indexOf(".") == -1 ? getProperty$1(data, property) : getPropertyPath(data, property);
        }
        else {
            const refId = obj.refId;
            return this.getReferenceValue(refId, property, obj.path, obj.aId);
        }
    },

    getContext(id) {
        return context.get(id);
    },

    getReferenceValue(id, property, path, aId) {
        const obj = data.get(id);

        if (obj.type == "data") {
            if (aId === undefined) {
                const p = property == null ? path : `${path}.${property}`;
                return this.getValue(id, p);
            }
            else {
                const ar = this.getValue(id, path);

                let result;

                if (Array.isArray(ar)) {
                    result = ar.find(i => i.__aId == aId);
                }
                else {
                    const item = ar.get(aId);
                    result = {key: aId, value: item};
                }
                // TODO GM: Investigate why result empty. Fix in phase 7.
                return property == null || result == null ? result : getValueOnPath(result, property);
            }
        }
        else {
            let pString = `${obj.path}.${path}`; // subObj.field1
            return this.getReferenceValue(obj.refId, property, pString)
        }
    },

    setReferenceValue(id, property, value, refId, refPath, refaId, ctxName) {
        const obj = data.get(refId);

        if (obj.type == "data") {
            let v = getValueOnPath(obj.data, refPath);

            if (refaId != null) {
                v = v.find(i => i.__aId == refaId);
            }

            if (ctxName != "context") {
                property = property.split(`${ctxName}.`).join("");
            }

            setPropertyPath(v, property, value);
            callFunctionsOnPath(id, property);
        }
        else {
            let pString = `${obj.path}.${path}`; // subObj.field1
            return this.getReferenceValue(obj.refId, property, pString)
        }
    },

    createReferenceTo: createReference,

    clear() {
        data.forEach((value, key) => {
            delete value.data;
        });
        data.clear();
        idStore.nextId = 0;
        idStore.nextArrayId = 0;
    },

    makeShared: makeShared,

    updateUI: callFunctions,

    array(id, property) {
        if (typeof id == "object") {
            id = id._dataId;
        }

        const value = this.getValue(id, property);
        return createArrayProxy(value, id, property);
    },

    setArrayEvents: setArrayEvents,
    notifyArrayItemsAdded: notifyArrayItemsAdded,
    notifyArrayItemsRemoved: notifyArrayItemsRemoved,
    arrayItemsAdded: arrayItemsAdded,
    arrayItemsRemoved: arrayItemsRemoved,
    linkToArrayItem: linkToArrayItem,
    unlinkArrayItem: unlinkArrayItem,
    nextArrayId: nextArrayId,

    removeCallback: removeCallback
};

class EventEmitter {
    constructor() {
        this._events = new Map();
    }

    dispose() {
        this._events.clear();
    }

    on(event, callback) {
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

    emit(event, args) {
        if (this._events.has(event)) {
            const events = this._events.get(event);
            events.forEach(e => e(args));
        }
    }

    remove(event, callback) {
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

    postMessage(query, args, scope) {
        const element = scope || document;
        const items = Array.from(element.querySelectorAll(query));

        items.forEach(item => {
            if (item.onMessage != undefined) {
                item.onMessage.call(item, args);
            }
        });
    }
}

class BindableElement extends HTMLElement {
    constructor() {
        super();
        this._dataId = crsbinding.data.addObject(this.constructor.name);

        crsbinding.data.addContext(this._dataId, this);
        crsbinding.dom.enableEvents(this);

        this.__properties = new Map();
    }

    dispose() {
        this._disposing = true;
        crsbinding.dom.disableEvents(this);
    }

    async connectedCallback() {
        if(this.preLoad != null) {
            const setPropertyCallback = (path, value)=> {
                crsbinding.data.setProperty(this._dataId, path, value);
            };

            await this.preLoad(setPropertyCallback);
        }

        if (this.html != null) {
            this.innerHTML = await fetch(this.html).then(result => result.text());
            crsbinding.parsers.parseElements(this.children, this._dataId);
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
    }

    async disconnectedCallback() {
        this.dispose();

        crsbinding.utils.disposeProperties(this);
        crsbinding.observation.releaseBinding(this);
        crsbinding.data.removeObject(this._dataId);
    }

    getProperty(property) {
        return getProperty(this, property);
    }

    setProperty(property, value, once = false) {
        if (this.isReady != true && once === false && this.__properties) {
            return this.__properties.set(property, value);
        }

        setProperty$1(this, property, value);
    }
}

class ViewBase {
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
        if(this.preLoad != null) {
            const setPropertyCallback = (path, value)=> {
                crsbinding.data.setProperty(this._dataId, path, value);
            };

            await this.preLoad(setPropertyCallback);
        }

        crsbinding.parsers.parseElement(this.element, this._dataId);
        this.load();
    }

    async disconnectedCallback() {
        crsbinding.observation.releaseBinding(this.element);
        crsbinding.utils.disposeProperties(this);
        this.element = null;
        crsbinding.data.removeObject(this._dataId);
    }

    getProperty(property) {
        return getProperty(this, property);
    }

    setProperty(property, value) {
        setProperty$1(this, property,  value);
    }

    load() {
        this._element.style.visibility = "";
        this._loaded = true;
    }
}

class ElementStoreManager {
    constructor() {
        this._items = new Map();
    }

    dispose() {
        this._items.clear();
        this._items = null;
    }

    register(id, template, measure = false) {
        const instance = template.content.cloneNode(true);

        const result = {
            elements: [instance],
            template: template
        };

        if (measure === true) {
            crsbinding.utils.measureElement(instance).then(size => result.size = size);
        }

        this._items.set(id, result);
    }

    _getItemElement(item) {
        return item.elements.pop() || item.template.content.cloneNode(true);
    }

    getElement(id) {
        const item = this._items.get(id);
        return this._getItemElement(item);
    }

    getElements(id, quantity) {
        const item = this._items.get(id);
        const fragment = document.createDocumentFragment();

        while(fragment.children.length < quantity) {
            fragment.appendChild(this._getItemElement(item));
        }

        return fragment;
    }

    getBoundElement(id, context) {
        const item = this._items.get(id);
        const result = this._getItemElement(item);
        crsbinding.parsers.parseElement(result, context);
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
}

function fragmentToText(fragment) {
    const text = [];
    for (let child of fragment.children) {
        text.push(child.outerHTML);
    }
    return text.join("");
}

function measureElement(element) {
    return new Promise(resolve => {
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
        }
        else {
            result = el.getBoundingClientRect();
        }

        resolve(result);
    })
}

function disposeProperties(obj) {
    const properties = Object.getOwnPropertyNames(obj).filter(prop => obj[prop] && obj[prop].__isProxy == true);
    for (let property of properties) {
        const pObj = obj[property];
        if (Array.isArray(pObj) != true) {
            disposeProperties(pObj);
        }
        delete obj[property];
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
};

function capitalizePropertyPath(str) {
    const parts = str.split("-");
    for (let i = 1; i < parts.length; i++) {
        parts[i] = parts[i].capitalize();
    }
    return parts.join("");
}

const crsbinding$1 = {
    _expFn: new Map(),

    data: bindingData,
    idleTaskManager: new IdleTaskManager(),
    providerManager: new ProviderManager(),
    inflationManager: new InflationManager(),
    elementStoreManager: new ElementStoreManager(),
    valueConverters: new ValueConverters(),
    expression: {
        sanitize: sanitizeExp,
        compile: compileExp,
        release: releaseExp
    },

    observation: {
        releaseBinding: releaseBinding,
        releaseChildBinding: releaseChildBinding
    },

    parsers: {
        parseElement: parseElement,
        parseElements: parseElements,
    },

    classes: {
        BindableElement: BindableElement,
        ViewBase: ViewBase,
        RepeatBaseProvider: RepeatBaseProvider
    },

    events: {
        listenOn: listenOn,
        listenOnPath: listenOnPath,
        emitter: new EventEmitter()
    },

    dom: {
        enableEvents: domEnableEvents,
        disableEvents: domDisableEvents
    },

    utils: {
        capitalizePropertyPath: capitalizePropertyPath,
        clone: clone,
        disposeProperties: disposeProperties,
        fragmentToText: fragmentToText,
        measureElement: measureElement
    }
};

globalThis.crsbinding = crsbinding$1;
crsbinding$1.$globals = crsbinding$1.data.addObject("globals");
crsbinding$1.data.globals = crsbinding$1.data.getValue(crsbinding$1.$globals);
