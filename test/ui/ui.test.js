const puppeteer = require('puppeteer');

let browser;
let page;

async function navigateTo(hash) {
    return Promise.all([
        page.click(`a[href="#${hash}"]`),
        page.waitForNavigation()
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
    await page.goto('http://127.0.0.1:8000/#welcome', {waitUntil: 'networkidle2'});
});

afterAll(async () => {
    await page.close();
});

test.skip("component", async() => {
    await navigateTo("component");

    const values = {
    };

    await setInputText('body > crs-router > label > input', "input 1").catch(e => console.error(e));

    values["0"] = await getValue('body > crs-router > label > input');
    values["1"] = await getValue('body > crs-router > input-form > label:nth-child(2) > input');
    values["2"] = await getValue('body > crs-router > first-name > label > input');

    expect(values["0"]).toEqual("input 1");
    expect(values["1"]).toEqual("input 1");
    expect(values["2"]).toEqual("input 1");

    await setInputText('body > crs-router > input-form > label:nth-child(2) > input', "input 2").catch(e => console.error(e));

    values["0"] = await getValue('body > crs-router > label > input');
    values["1"] = await getValue('body > crs-router > input-form > label:nth-child(2) > input');
    values["2"] = await getValue('body > crs-router > first-name > label > input');

    expect(values["0"]).toEqual("input 2");
    expect(values["1"]).toEqual("input 2");
    expect(values["2"]).toEqual("input 2");

    await setInputText('body > crs-router > first-name > label > input', "input 3").catch(e => console.error(e));

    values["0"] = await getValue('body > crs-router > label > input');
    values["1"] = await getValue('body > crs-router > input-form > label:nth-child(2) > input');
    values["2"] = await getValue('body > crs-router > first-name > label > input');

    expect(values["0"]).toEqual("input 3");
    expect(values["1"]).toEqual("input 3");
    expect(values["2"]).toEqual("input 3");

    await setInputText('crs-router > input-form > input-contacts > label:nth-child(2) > input', "1").catch(e => console.error(e));
    await setInputText('crs-router > input-form > input-contacts > label:nth-child(3) > input', "2").catch(e => console.error(e));
    await setInputText('crs-router > input-form > input-contacts > label:nth-child(4) > input', "3").catch(e => console.error(e));

    values["0"] = await getInnerText('body > crs-router > div:nth-child(7)');
    values["1"] = await getInnerText('body > crs-router > div:nth-child(8)');
    values["2"] = await getInnerText('body > crs-router > div:nth-child(9)');

    expect(values["0"]).toEqual("1");
    expect(values["1"]).toEqual("2");
    expect(values["2"]).toEqual("3");


    await click('body > crs-router > input-form > label:nth-child(6)');
    isHidden = await isHidden('body > crs-router > input-form > input-contacts');
    expect(isHidden).toEqual(true);

    await page.goBack();
});

test.skip("collections", async() => {
    await navigateTo("collections");
    await page.goBack();
});

test.skip("inflation", async() => {
    await navigateTo("inflation");

    const count = await childCount('body > crs-router > #container');
    expect(count).toEqual(16);

    await page.goBack();
});

test.skip("maps", async() => {
    await navigateTo("maps");

    const count = await countElements("[data-key]");
    expect(count).toEqual(4);

    await page.goBack();
});