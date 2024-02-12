const puppeteer = require("puppeteer");

async function getdata(links, res, req) {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null,
    });

    const dataArray = [];

    try {
        for (const link of links) {
            const page = await browser.newPage();

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
                        console.log("Clicking the button...");
                        await loginButton.click();
                        await page.waitForTimeout(1000);
                    }
                }
                console.log("Data extraction checkpoint");

                const data = await page.evaluate(() => {
                    const photo = document.getElementById("gsc_prf_pup-img").src;
                    const name = document.getElementById("gsc_prf_in").innerText;
                    const post = document.querySelector(".gsc_prf_il").innerText;
                    const table = document.getElementById("gsc_rsb_st");
                    const dataElements = table.querySelectorAll(".gsc_rsb_f");
                    const quantElements = table.querySelectorAll(".gsc_rsb_std");
                    const papers = document.getElementById("gsc_a_nn").innerText.replace("1-","");

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
                    };
                });

                dataArray.push(data);
                console.log("Data Saved Successfully");
            } catch (error) {
                console.error("Error navigating to the page:", error);
            } finally {
                await page.close();
            }
        }
        console.log("Sending data to the next page");

        await res.render("../partials/" + req.session.type + "/part2", {
            merch: dataArray,
            type: req.session.type,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        console.error("Error in the scraping process:", error);
    } finally {
        await browser.close();
    }
}

module.exports = { getdata };
