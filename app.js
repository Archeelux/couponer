const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const url = "https://www.tesco.ie/groceries/SpecialOffers/SpecialOfferList/default.aspx?promoType=alloffers&=&Nao=";
let currPage = 100;
let previousCount = 100;
const tescoDeals = [];

async function start(page) {
    if (previousCount < 100 || page >= 200) {
        fs.writeFile("./tesco-scraped.json", JSON.stringify(tescoDeals), err => {
            console.log(err);
        });
        return;
    }

    await axios(`${url}${page}`).then(res => {
        const html = res.data;
        const $ = cheerio.load(html);
        const desc = $("#contentMain .productLists ul .desc");

        previousCount = desc.length;

        currPage += 100;

        desc.each((i, item) => {
            const productName = $(item)
                .find("h3 > a")
                .after("span")
                .text();
            const productPrice = $(item)
                .find(".quantity .content .price .linePrice")
                .text();

            const productPriceAbbrv = $(item)
                .find(".quantity .content .price .linePriceAbbr")
                .text();

            const productSaveAmountText = $(item)
                .find(".descContent .promo a em")
                .text();

            let tescoDeal = {
                productName,
                productPrice,
                productPriceAbbrv
            };

            tescoDeals.push(tescoDeal);
        });

        console.log(currPage);
        start(currPage);
    });
}

start(currPage);

// axios(`${url}`)
// .then(res => {
//     const html = res.data;
//     const $ = cheerio.load(html);
//     const desc = $("#contentMain .productLists ul .desc");

//     previousCount = desc.length;

//     desc.each((i, item) => {
//         const productName = $(item)
//             .find("h3 > a")
//             .after("span")
//             .text();

//         let tescoDeal = {
//             productName
//         };

//         tescoDeals.push(tescoDeal);
//     });

// })
// .catch(err => console.log(err));
