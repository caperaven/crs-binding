const pti = require('puppeteer-to-istanbul');
const puppeteer = require('puppeteer');

let browser;
let page;

async function navigateTo(hash) {
    return Promise.all([
        await page.goto(`http://127.0.0.1:8000/#${hash}`, {waitUntil: 'networkidle2'})
    ]).catch(e => console.log(e));
}

async function getTextContent(query) {
    const handle = await page.$(query);
    const value = await page.evaluate(element => element.textContent, handle);
    handle.dispose();
    return value;
}

async function getInnerText(query) {
    const handle = await page.$(query);
    const value = await page.evaluate(element => element.innerHTML, handle);
    handle.dispose();
    return value;
}

async function getValues(query) {
    const handles = await page.$$(query);
    const values = [];

    for (let handle of handles) {
        values.push(await page.evaluate(element => element.value == null ? element.textContent : element.value, handle));
    }

    return values;
}

async function getValue(query) {
    const handle = await page.$(query);
    const value = await page.evaluate(element => element.value, handle);
    return value;
}

async function setValue(query, value) {
    const handle = await page.$(query);
    await page.evaluate((element, value) => element.value = value, handle, value);
}

async function setInputText(query, value) {
    const handle = await page.$(query);

    await handle.click({clickCount: 3});
    await page.keyboard.type(value);
    await page.keyboard.press("Tab");
}

async function hasAttribute(query, attrName) {
    const attr = await page.evaluate(`document.querySelector("${query}").getAttribute("${attrName}")`);
    return attr != null;
}

async function click(query) {
    const handle = await page.$(query);
    await handle.click();
}

async function isHidden(query) {
    const handle = await page.$(query);
    const value = await page.evaluate(element => element.getAttribute("hidden") != null, handle);
    return value;
}

async function childCount(query) {
    const handle = await page.$(query);
    const value = await page.evaluate(element => element.children.length, handle);
    return value;
}

async function countElements(query) {
    return await page.$$eval(query, elements => elements.length);
}

async function getAttributeValue(query, attrName) {
    return await page.evaluate(`document.querySelector("${query}").getAttribute("${attrName}")`);
}

async function getBindingPropertyValue(contextId, property) {
    const result = await page.evaluate(`window.crsbinding.data.getValue(${Number(contextId)}, "${property}")`);
    return result;
}

async function getSVGElementStoreSize() {
    return await page.evaluate("window.crsbinding.svgCustomElements._tagMap.size");
}

async function svgElementStoreBusy() {
    let isBusy = true;
    while (isBusy == true) {
        isBusy = await page.evaluate("window.crsbinding.svgCustomElements._queue.length > 0");
    }
}

beforeAll(async () => {
    jest.setTimeout(100000);
    browser = await puppeteer.launch({headless: false, slowMo: 10, args: ['--disable-dev-shm-usage', '--start-maximized']});
    page = await browser.newPage();
    await page.setViewport({
        width: 1366,
        height: 1366,
    });

    await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage()
    ]);

    await page.goto('http://127.0.0.1:8000/#welcome', {waitUntil: 'networkidle2'});
});

afterAll(async () => {
    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);
    pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true , storagePath: './.nyc_output' });
    await page.close();
    browser.close();
});

test("welcome", async() => {
    const handle = await page.evaluateHandle(() => window);
    const crsbinding = await page.evaluate(e => e.crsbinding, handle);
    await page.goto('http://127.0.0.1:8000/#welcome', {waitUntil: 'networkidle2'});

    await page.goBack();
});

test("component", async() => {
    await navigateTo("component");

    const values = {
    };

    await setInputText('#edtFirstName', "input 1").catch(e => console.error(e));

    values["0"] = await getValue('#edtFirstName');
    values["1"] = await getValue('#edtInputFirstName');
    values["2"] = await getValue('#edtFirstNameFirstName');
    values["3"] = await getValue("#edtOldName");

    expect(values["0"]).toEqual("input 1");
    expect(values["1"]).toEqual("input 1");
    expect(values["2"]).toEqual("input 1");
    expect(values["3"]).toEqual("John");

    await setInputText('#edtFirstName', "input 2").catch(e => console.error(e));

    values["0"] = await getValue('#edtFirstName');
    values["1"] = await getValue('#edtInputFirstName');
    values["2"] = await getValue('#edtFirstNameFirstName');

    expect(values["0"]).toEqual("input 2");
    expect(values["1"]).toEqual("input 2");
    expect(values["2"]).toEqual("input 2");

    await setInputText('#edtFirstNameFirstName', "input 3").catch(e => console.error(e));

    values["0"] = await getValue('#edtFirstName');
    values["1"] = await getValue('#edtInputFirstName');
    values["2"] = await getValue('#edtFirstNameFirstName');

    expect(values["0"]).toEqual("input 3");
    expect(values["1"]).toEqual("input 3");
    expect(values["2"]).toEqual("input 3");

    await setInputText('#edtLand', "1").catch(e => console.error(e));
    await setInputText('#edtCell', "2").catch(e => console.error(e));
    await setInputText('#edtFax', "3").catch(e => console.error(e));

    values["0"] = await getInnerText('#lblLand');
    values["1"] = await getInnerText('#lblCell');
    values["2"] = await getInnerText('#lblFax');

    expect(values["0"]).toEqual("1");
    expect(values["1"]).toEqual("2");
    expect(values["2"]).toEqual("3");

    await page.goBack();
});

test("translations", async() => {
    await navigateTo("translations");
    await page.waitForSelector("#btnOne");

    expect(await getTextContent("#btnOne")).toEqual("Save");
    expect(await getTextContent("#btnTwo")).toEqual("Cancel");
    expect(await getTextContent("#btnThree")).toEqual("Save");
    expect(await getTextContent("#btnFour")).toEqual("Cancel");
    expect(await getTextContent("#btnFive")).toEqual("Save");
    expect(await getTextContent("#btnSix")).toEqual("Cancel");
    expect(await getTextContent("#btnSeven")).toEqual("Save");
    expect(await getTextContent("#btnEight")).toEqual("Cancel");

    expect(await getTextContent("#h2One")).toEqual("Translation Title");
    expect(await getTextContent("#h2Two")).toEqual("Translation Title");
    expect(await getTextContent("#h2Three")).toEqual("Translation Title");
    expect(await getTextContent("#h2Four")).toEqual("Translation Title");

    expect(await getAttributeValue("#btnThree", "data-title")).toEqual("Save");
    expect(await getAttributeValue("#btnFour", "data-title")).toEqual("Cancel");

    await page.goBack();
})

test("collections", async() => {
    await navigateTo("collections");

    let count = await countElements(".list-item");
    expect(count).toEqual(5);

    await click(".list-item[data-id='0'] div");
    const value = await getValue("#edtCode");
    expect(value).toEqual("Code 0");

    await click("#btnAdd");
    count = await countElements(".list-item");
    expect(count).toEqual(6);

    await click("#btnRemoveLast");
    count = await countElements(".list-item");
    expect(count).toEqual(5);

    await click("#btnRemoveLast");
    count = await countElements(".list-item");
    expect(count).toEqual(4);

    count = await countElements("#lstDone li");
    expect(count).toEqual(0);

    await click(".list-item[data-id='0'] button");
    count = await countElements("#lstDone li");
    expect(count).toEqual(1);

    await page.goBack();
});

test("inflation", async() => {
    await navigateTo("inflation");

    const count = await childCount('#container');
    expect(count).toEqual(16);

    expect(await countElements("#personContainer div")).toBe(4);
    expect(await countElements("#personContainer2 div")).toBe(3);
    expect(await countElements("#flat-once-container > *")).toBe(16);
    expect(await countElements("#container > *")).toBe(16);
    expect(await countElements("#parented-structure-container > *")).toBe(16);
    expect(await countElements("#standard-for-container > *")).toBe(17);

    await page.goBack();
});

test("maps", async() => {
    await navigateTo("maps");
    let count = await countElements("[data-key]");
    expect(count).toEqual(4);

    await click("#btnAdd");
    count = await countElements("[data-key]");
    expect(count).toEqual(5);

    await click("#btnRemove");
    count = await countElements("[data-key]");
    expect(count).toEqual(4);

    await click("#btnUpdate");
    expect(await getInnerText("[data-key='1']")).toEqual("Hello World");

    await page.goBack();
});

test("drawer", async() => {
    await navigateTo("drawer");

    expect(await isHidden("#lstContext")).toBe(true);
    expect(await isHidden("#lstGlobal")).toBe(true);

    await click("#btnContext");
    await click("#btnGlobal");

    expect(await isHidden("#lstContext")).toBe(false);
    expect(await isHidden("#lstGlobal")).toBe(false);

    await click("#btnContext");
    await click("#btnGlobal");

    expect(await isHidden("#lstContext")).toBe(true);
    expect(await isHidden("#lstGlobal")).toBe(true);

    await page.goBack();
});

test("pages", async() => {
    let handle;

    await navigateTo("pages");
    await click("#btnOverview");
    handle = await page.$("#tplOverview");
    expect(handle).not.toBeNull();

    await click("#btnDetails");
    handle = await page.$("#tplDetails");
    expect(handle).not.toBeNull();

    await click("#btnContent");
    handle = await page.$("#tplContent");
    expect(handle).not.toBeNull();

    await page.goBack();
});

test("list", async() => {
    await navigateTo("list");

    expect(await countElements(".container li")).toEqual(10);

    await click("#btnReturn");
    expect(await countElements(".container li")).toEqual(0);

    await click("#btnNextPage");
    expect(await countElements(".container li")).toEqual(10);

    await page.goBack();
});

test("svg-for", async() => {
    await navigateTo("svg-for");

    expect(await countElements("#once rect")).toEqual(10);
    expect(await countElements("#bound rect")).toEqual(11);

    await page.goBack();
});

test("render-collection", async() => {
    await navigateTo("render-collection");

    await click("#btnRenderCollection");
    expect(await countElements("ul li")).toEqual(10);

    await click("#btnRenderMore");
    expect(await countElements("ul li")).toEqual(15);

    await click("#btnRenderLess");
    expect(await countElements("ul li")).toEqual(5);

    await click("#btnRenderCollection");
    expect(await countElements("ul li")).toEqual(10);

    await page.goBack();
});

test("array sync", async() => {
    await navigateTo("shared-context");

    // Test for error if you un-share something you have not shared yet.
    await click("#btnRemoveShare");
    await click("#btnShare");

    expect(await countElements("comp-one ul li")).toEqual(3);
    expect(await countElements("comp-two ul li")).toEqual(3);

    await setInputText("#c1Input", "value 1");
    expect(await getValue('#c1Input')).toEqual("value 1");
    expect(await getValue('#c2Input')).toEqual("value 1");

    await setInputText("#c2Input", "value 2");
    expect(await getValue('#c1Input')).toEqual("value 2");
    expect(await getValue('#c2Input')).toEqual("value 2");

    await setInputText("comp-one input[data-id='0']", "item 11");
    await setInputText("comp-one input[data-id='1']", "item 12");
    await setInputText("comp-one input[data-id='2']", "item 13");

    expect(await getTextContent("comp-two li[data-id='0']")).toEqual("item 11");
    expect(await getTextContent("comp-two li[data-id='1']")).toEqual("item 12");
    expect(await getTextContent("comp-two li[data-id='2']")).toEqual("item 13");

    await click("#btnRemoveShare");
    await setInputText("comp-one input[data-id='0']", "item 21");
    await setInputText("comp-one input[data-id='1']", "item 22");
    await setInputText("comp-one input[data-id='2']", "item 23");

    expect(await getTextContent("comp-two li[data-id='0']")).toEqual("item 11");
    expect(await getTextContent("comp-two li[data-id='1']")).toEqual("item 12");
    expect(await getTextContent("comp-two li[data-id='2']")).toEqual("item 13");

    await click("#btnShare");
    expect(await getTextContent("comp-two li[data-id='0']")).toEqual("item 21");
    expect(await getTextContent("comp-two li[data-id='1']")).toEqual("item 22");
    expect(await getTextContent("comp-two li[data-id='2']")).toEqual("item 23");

    await page.goBack();
});

test("array - values", async() => {
    await navigateTo("array-values");
    expect(await countElements("li")).toBe(3);

    await click("#btnSetValue");
    const contextId = await getAttributeValue("#btnSetValue", "data-context");
    const array = await getBindingPropertyValue(contextId, "oldArray");

    expect(array.length).toBe(1);

    await page.goBack();
})

test("html fragments", async() => {
    await navigateTo("html-fragments");

    await setInputText('[data-id="line1"]', "Value 1");
    await setInputText('[data-id="line2"]', "Value 2");
    await setInputText('[data-id="line3"]', "Value 3");

    const line1Values = await getValues('input[data-id="line1"]');
    const line2Values = await getValues('input[data-id="line2"]');
    const line3Values = await getValues('input[data-id="line3"]');

    expect(line1Values[0]).toBe("Value 1");
    expect(line1Values[1]).toBe("Value 1");
    expect(await getTextContent(`div[data-id="line1"]`)).toBe("Value 1");

    expect(line2Values[0]).toBe("Value 2");
    expect(line2Values[1]).toBe("Value 2");
    expect(await getTextContent(`div[data-id="line2"]`)).toBe("Value 2");

    expect(line3Values[0]).toBe("Value 3");
    expect(line3Values[1]).toBe("Value 3");
    expect(await getTextContent(`div[data-id="line3"]`)).toBe("Value 3");

    await page.goBack();
})

test("radio-group", async() => {
    await navigateTo("radio-group");

    const peopleCount = await countElements("#people input");
    expect(peopleCount).toEqual(4);
    expect(await getInnerText("#selectedPerson")).toBe("Selected Person Value: 2");

    const animalCount = await countElements("#animals input");
    expect(animalCount).toEqual(4);
    expect(await getInnerText("#selectedAnimal")).toBe("Selected Animal Value: 4");

    await click("[value='4'][name='people']");
    await click("[value='1'][name='animals']");

    expect(await getInnerText("#selectedPerson")).toBe("Selected Person Value: 4");
    expect(await getInnerText("#selectedAnimal")).toBe("Selected Animal Value: 1");

    await page.goBack();
})

test("value conversion", async () => {
    await navigateTo("value-converters");
    await page.goBack();
})

test("value conversion", async () => {
    await navigateTo("innerHTML");

    expect(await getInnerText("#h1")).toBe("<h2>HTML Heading 2</h2>");
    expect(await childCount("#list1")).toBe(4);
    expect(await childCount("#list2")).toBe(3);
    expect(await getInnerText("#list1 li")).toBe("<h2>Item 1</h2>");
    expect(await getInnerText("#list2 li")).toBe("<h2>Item 1</h2>");
    await page.goBack();
})

test("expressions", async () => {
    await navigateTo("expressions");

    expect(await getTextContent("#expression")).toBe("Site A11");

    await setInputText("#siteCode", "A12");
    expect(await getTextContent("#expression")).toBe("Code1");

    await setInputText("#code", "Code2");
    expect(await getTextContent("#expression")).toBe("Code2");

    await setInputText("#siteCode", "A11");
    expect(await getTextContent("#expression")).toBe("Site A11");
    await page.goBack();
})

test("innerHTML", async () => {
    await navigateTo("innerHTML");

    expect(await getTextContent("#h1 h2")).toBe("HTML Heading 2");

    const list1Values = await getValues("#list1 h2");
    expect(list1Values[0]).toBe("Item 1");
    expect(list1Values[1]).toBe("Item 2");
    expect(list1Values[2]).toBe("Item 3");

    const list2Values = await getValues("#list2 h2");
    expect(list2Values[0]).toBe("Item 1");
    expect(list2Values[1]).toBe("Item 2");
    expect(list2Values[2]).toBe("Item 3");
    await page.goBack();
})

test("svg element", async() => {
    await navigateTo("svg-element");

    await page.waitForSelector("g[transform='translate(0, 16)']");

    const count = await page.evaluate("Array.from(crsbinding.svgCustomElements._observed)[0][1].children.size");
    expect(count).toBe(3);

    let color = await getAttributeValue("rect", "fill");
    expect(color).toBe("blue");

    await page.waitForSelector("rect[data-is-ready='true']");
    await page.evaluate('document.querySelector("rect").dispatchEvent(new CustomEvent("click"))');
    await page.waitForSelector("rect[fill='#ff0090']");

    color = await getAttributeValue("rect", "fill");
    expect(color).toBe("#ff0090");

    await page.goBack();
})

test("perspective-element", async ()=> {
    await navigateTo("perspective-element");
    await page.waitForSelector("button");
    await page.waitForSelector("#view-selection");

    expect(await page.evaluate('document.querySelector("#with-context").children.length')).toBe(5);
    expect(await page.evaluate('document.querySelector("#with-fragment").children.length')).toBe(3);
    expect(await page.evaluate('document.querySelectorAll("button").length')).toBe(4);

    await page.select('#view-selection', 'address');
    await page.waitForSelector("#end");

    expect(await page.evaluate('document.querySelector("#with-context").children.length')).toBe(6);
    expect(await page.evaluate('document.querySelector("#with-fragment").children.length')).toBe(6);
    expect(await page.evaluate('document.querySelectorAll("button").length')).toBe(8);

    await page.goBack();
})

test("nested for", async () => {
    await navigateTo("nested-for");

    async function getResults(query) {
        return await page.$eval(query, ul => {
            const result = [];
            result.push(ul.children.length);
            result.push(ul.children[0].children[1].children.length);
            result.push(ul.children[1].children[1].children.length);
            result.push(ul.children[2].children[1].children.length);
            return result;
        });
    }

    async function assert(results) {
        expect(results[0]).toBe(3);
        expect(results[1]).toBe(1);
        expect(results[2]).toBe(2);
        expect(results[3]).toBe(3);
    }

    const list1 = await getResults("#list1");
    // const list2 = await getResults("#list2");
    // const list3 = await getResults("#list3");
    // const list4 = await getResults("#list4");

    await assert(list1);
    // await assert(list2);
    // await assert(list3);
    // await assert(list4);
    await page.goBack();
})

test.skip("inflation - cells", async () => {
    await navigateTo("inflation-cells");
    await page.waitForSelector("#inflation-grid[data-loaded='true']");

    await click("#btnUpdate");
    let count = await childCount("#inflation-grid");
    expect(count).toEqual(30);

    await setInputText("#edtEnd", "4");
    await click("#btnUpdate");
    count = await childCount("#inflation-grid");
    await page.waitFor(1000);
    expect(count).toEqual(15);

    await setInputText("#edtStart", "10");
    await setInputText("#edtEnd", "19");
    await click("#btnUpdate");

    count = await childCount("#inflation-grid");
    await page.waitFor(1000);
    expect(count).toEqual(30);

})