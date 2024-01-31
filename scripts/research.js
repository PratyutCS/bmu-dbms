const puppeteer = require("puppeteer");

async function getdata(links, res, req) {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null,
    });
    const array = []; // Use const instead of let for the array

    for (const link of links) {

        const page = await browser.newPage();

        try {
            await page.goto(link, {
                waitUntil: "domcontentloaded",
            });

            const data = await page.evaluate(() => {
                const photo = document.getElementById("gsc_prf_pup-img").src;
                const name = document.getElementById("gsc_prf_in").innerHTML;
                const post = document.querySelector(".gsc_prf_il").innerHTML;
                const table = document.getElementById("gsc_rsb_st");
                const dataElements = table.querySelectorAll(".gsc_rsb_f");
                const quantElements = table.querySelectorAll(".gsc_rsb_std");
                const data1 = dataElements[0].innerHTML;
                const num1 = quantElements[0].innerHTML;
                const data2 = dataElements[1].innerHTML;
                const num2 = quantElements[2].innerHTML;
                const data3 = dataElements[2].innerHTML;
                const num3 = quantElements[4].innerHTML;

                return { photo, name, post, data1, num1, data2, num2, data3, num3 };
            });

            array.push(data);
        } catch (error) {
            console.error("Error navigating to the page:", error);
        } finally {
            await page.close(); // Close the page in the finally block to ensure it always gets closed
        }
    }
    await res.render("../partials/" + req.session.type + "/part2", {
        merch: array,
        type: req.session.type,
        csrfToken:req.csrfToken(),
    });

    await browser.close(); // Close the browser after rendering the page
}

module.exports = { getdata };
