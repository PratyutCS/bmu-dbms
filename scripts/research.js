const puppeteer = require("puppeteer");

async function getdata(links, res, req, parameter1) {
    const MAX_CONCURRENT_PAGES = 100;
    const BROWSER_PAGES_LIMIT = 100;

    const dataArray = [];
    let map1 = new Map();

    let browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null,
        args: ['--incognito'],
    });

    try {
        let pageCounter = 0;

        const fetchData = async (link) => {
            const context = await browser.createIncognitoBrowserContext(); // Create an incognito context
            const page = await context.newPage();
            await page.setRequestInterception(true);

            page.on('request', (req) => {
                if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font') {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            try {
                await page.goto(link, {
                    waitUntil: "domcontentloaded",
                });

                await page.waitForSelector("#gsc_bpf_more");
                const loginButton = await page.$("#gsc_bpf_more");

                let prevValue = "";
                let shouldContinue = false;

                while (!shouldContinue) {
                    shouldContinue = await page.evaluate((prev) => {
                        const button = document.getElementById("gsc_bpf_more");
                        const valueElement = document.getElementById("gsc_a_nn");

                        if (button.disabled && valueElement.innerText !== prev) {
                            return true;
                        } else {
                            console.log(valueElement.innerText + " ---- " + prev);
                            prev = valueElement.innerText;
                            return false;
                        }
                    }, prevValue);

                    if (!shouldContinue) {
                        // console.log("Clicking the button...");
                        await loginButton.click();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                // console.log("Data extraction checkpoint");

                const data = await page.evaluate(() => {
                    const photo = document.getElementById("gsc_prf_pup-img").src;
                    const name = document.getElementById("gsc_prf_in").innerText;
                    const post = document.querySelector(".gsc_prf_il").innerText;
                    const table = document.getElementById("gsc_rsb_st");
                    const dataElements = table.querySelectorAll(".gsc_rsb_f");
                    const quantElements = table.querySelectorAll(".gsc_rsb_std");
                    const papers = document.getElementById("gsc_a_nn").innerText.replace("1-", "");
                    const year = document.querySelectorAll(".gsc_a_hc");

                    let arr= [];
                    year.forEach(element => {
                        const data = element.innerHTML;
                        arr.push(data);
                    });

                    return {
                        photo,
                        name,
                        post,
                        data1: dataElements[0].innerText,
                        num1: quantElements[0].innerText,
                        data2: dataElements[1].innerText,
                        num2: quantElements[2].innerText,
                        data3: dataElements[2].innerText,
                        num3: quantElements[4].innerText,
                        papers,
                        arr,
                    };
                });

                dataArray.push(data);
                data.arr.forEach(element =>{
                    if (!map1.has(element)) {
                        if(element == "" || element == null){
                            console.log(data.name+" has no year with a publication");
                        }
                        else{
                            map1.set(element, 1);
                        }
                    } else {
                        map1.set(element, map1.get(element) + 1);
                    }
                });
                // console.log("Data Saved Successfully");
            } catch (error) {
                console.error("Error navigating to the page:", error);
            } finally {
                await page.close();
            }
        };

        for (let i = 0; i < links.length; i += MAX_CONCURRENT_PAGES) {
            const batch = links.slice(i, i + MAX_CONCURRENT_PAGES);
            await Promise.all(batch.map(link => fetchData(link)));
            pageCounter += batch.length;

            // Check if the page limit is reached, and close/reopen the browser if needed
            if (pageCounter >= BROWSER_PAGES_LIMIT) {
                await browser.close();
                browser = await puppeteer.launch({
                    headless: true,
                    defaultViewport: null,
                });
                pageCounter = 0;
            }
        }

        // console.log("Sending data to the next page");
        let params = parameter1.substr(4, 1);
        // console.log(params);
        const sortedByKey = new Map([...map1.entries()].sort());

        await res.render("../partials/" + req.session.type + "/part2", {
            merch: dataArray,
            type: req.session.type,
            params,
            csrfToken: req.csrfToken(),
            map1 : sortedByKey,
        });
    } catch (error) {
        console.error("Error in the scraping process:", error);
    } finally {
        await browser.close();
    }
}

module.exports = { getdata };
