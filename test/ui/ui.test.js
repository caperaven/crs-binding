const puppeteer = require('puppeteer');

let browser;
let page;

async function navigateTo(hash) {
    return Promise.all([
        page.click(`a[href="#${hash}"]`),
        page.waitForNavigation()
    ]).catch(e => console.log(e));
}

beforeAll(async () => {
    browser = await puppeteer.launch({headless: false, slowMo: 100});
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
    await page.waitForFunction(() => document.querySelector("person-details h3").getAttribute("data-bid") != null);

    // 1. check for the heading
    const headingHandle = await page.$("person-details h3");
    const headingValue = await page.evaluate(element => element.textContent, headingHandle);

    expect(headingValue).toEqual("First Name 0 - Last Name 0 - 20");

    // 2. change the first name
    const firstNamesHandle = await page.$$('[data-path="person.firstName"]');

    // 3.clean up
    headingHandle.dispose();

    await page.goBack();
});