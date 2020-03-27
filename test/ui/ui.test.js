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

beforeAll(async () => {
    jest.setTimeout(100000);
    browser = await puppeteer.launch({headless: false, slowMo: 50, args: ['--disable-dev-shm-usage']});
    page = await browser.newPage();
    await page.goto('http://127.0.0.1:8000/#welcome', {waitUntil: 'networkidle2'});
});

afterAll(async () => {
    await page.close();
});

test("svg", async () => {
    await navigateTo("svg");

    const elementHandle = await page.$("text");
    const text = await page.evaluate(element => element.textContent, elementHandle);
    const fill = await page.evaluate(element => element.getAttribute("fill"), elementHandle);

    expect(text).toBe("SVG Test");
    expect(fill).toBe("green");

    elementHandle.dispose();

    await page.goBack();
});

test("complex-binding", async() => {
    await navigateTo("complex-binding");

    await page.click(".collection li");
    //await page.waitForSelector("person-details");
    await page.waitForFunction(() => document.querySelector("person-details h3").getAttribute("data-bid") != null);

    // 1. check for the heading
    const headingValue = await getTextContent("person-details h3");

    expect(headingValue).toEqual("First Name 0 - Last Name 0 - 20");

    // 2. change the first name
    let firstNames = await getValues('[data-path="person.firstName"]');

    expect(firstNames.length).toEqual(2);
    expect(firstNames[0]).toEqual("First Name 0");
    expect(firstNames[1]).toEqual("First Name 0");

    await setInputText("#edtFirstName", "Hello World").catch(e => console.error(e));

    // 3. check that all the relevant inputs have the same value as typed
    firstNames = await getValues('[data-path="person.firstName"]');
    expect(firstNames[0]).toEqual("Hello World");
    expect(firstNames[1]).toEqual("Hello World");

    // 4. check that the labels are also updated
    const label1 = await getTextContent('person-details > h3');
    const label2 = await getTextContent('person-summery > div');

    expect(label1).toEqual("Hello World - Last Name 0 - 20");
    expect(label2).toEqual("Hello World - Last Name 0 - 20");


    await page.click('body > crs-router > .container > div > button');

    await page.waitForSelector('.details > details-component > person-details > ul > li:nth-child(1)');
    const child1 = await getTextContent('.details > details-component > person-details > ul > li:nth-child(1)');
    expect(child1).toEqual("Debug World 1");

    await page.waitForSelector('.details > details-component > person-details > ul > li:nth-child(2)');
    const child2 = await getTextContent('.details > details-component > person-details > ul > li:nth-child(2)');
    expect(child2).toEqual("Debug World 2");

    await page.goBack();
});

test("form", async() => {
    await navigateTo("form");

    await page.waitForSelector('body > crs-router > form > label:nth-child(2) > input');
    await page.click('form > label:nth-child(2) > input');

    await setInputText("form > label:nth-child(2) > input", "name").catch(e => console.error(e));
    await setInputText("form > label:nth-child(3) > input", "lastname").catch(e => console.error(e));
    await setInputText("form > label:nth-child(4) > input", "30").catch(e => console.error(e));

    await page.waitForSelector('form > label:nth-child(5) > input');
    await page.click('form > label:nth-child(5) > input');

    const child1 = await getTextContent('body > crs-router > form > div');
    expect(child1).toEqual("name lastname is 30 old");

    await page.goBack();
});

test("clone", async() => {
    await navigateTo("clone");

    await page.waitForSelector('body > crs-router > .toolbar > button');
    await page.click('body > crs-router > .toolbar > button');

    const child1 = await getTextContent('body > crs-router > label:nth-child(9) > div:nth-child(1)');
    expect(child1).toEqual("Model2 Caption");

    await page.goBack();
});

test("calc", async() => {
    await navigateTo("calc");

    await page.waitForSelector('#edtStart');
    await setInputText("#edtStart", "00:10").catch(e => console.error(e));

    const child1 = await getValue('#edtDuration');
    expect(child1).toEqual("01.1666666666666667:68.83333333333333");

    await page.goBack();
});