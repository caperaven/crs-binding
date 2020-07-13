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
        values.push(await page.evaluate(element => element.value, handle));
    }

    return values;
}

async function getValue(query) {
    const handle = await page.$(query);
    const value = await page.evaluate(element => element.value, handle);
    return value;
}

async function setInputText(query, value) {
    const handle = await page.$(query);
    await page.evaluate(element => element.value = "", handle);

    await handle.click();
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

beforeAll(async () => {
    jest.setTimeout(100000);
    browser = await puppeteer.launch({headless: false, slowMo: 50, args: ['--disable-dev-shm-usage']});
    page = await browser.newPage();

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
    pti.write([...jsCoverage, ...cssCoverage], { includeHostname: true , storagePath: './.nyc_output' })
    await page.close();
});

test("welcome", async() => {
    const handle = await page.evaluateHandle(() => window);
    const crsbinding = await page.evaluate(e => e.crsbinding, handle);
    await page.goto('http://127.0.0.1:8000/#welcome', {waitUntil: 'networkidle2'});

    await click('#btnI1');
    await click('#btnI2');
    await click('#btnI3');
    await click('#btnI4');
    await click('#btnI5');
});

test("component", async() => {
    await navigateTo("component");

    const values = {
    };

    await setInputText('#edtFirstName', "input 1").catch(e => console.error(e));

    values["0"] = await getValue('#edtFirstName');
    values["1"] = await getValue('#edtInputFirstName');
    values["2"] = await getValue('#edtFirstNameFirstName');

    expect(values["0"]).toEqual("input 1");
    expect(values["1"]).toEqual("input 1");
    expect(values["2"]).toEqual("input 1");

    await setInputText('#edtFirstName', "input 2").catch(e => console.error(e));

    values["0"] = await getValue('#edtFirstName');
    values["1"] = await getValue('#edtInputFirstName');
    values["2"] = await getValue('#edtFirstNameFirstName');

    expect(values["0"]).toEqual("input 2");
    expect(values["1"]).toEqual("input 2");
    expect(values["2"]).toEqual("input 2");

    return;
    await setInputText('#edtLand', "1").catch(e => console.error(e));
    await setInputText('#edtCell', "2").catch(e => console.error(e));
    await setInputText('#edtFax', "3").catch(e => console.error(e));

    values["0"] = await getInnerText('#lblLand');
    values["1"] = await getInnerText('#lblCell');
    values["2"] = await getInnerText('#lblFax');

    expect(values["0"]).toEqual("1");
    expect(values["1"]).toEqual("2");
    expect(values["2"]).toEqual("3");


    await click('#edtShowContacts');
    isHidden = await isHidden('input-contacts');
    expect(isHidden).toEqual(true);

    await page.goBack();
});

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
    await click("#btnToggle");
    expect(await hasAttribute("#container", "hidden")).toBeFalsy();

    await click("#btnToggle");
    expect(await hasAttribute("#container", "hidden")).toBeTruthy();
});