const axios = require("axios");
const cheerio = require("cheerio");
const dayjs = require("dayjs");

async function getTescoJSON() {
    const data = await getTescoPages();
    return data;
}

async function getTescoPages() {
    const url = "https://www.tesco.ie/groceries/SpecialOffers/SpecialOfferList/default.aspx?promoType=alloffers&=&Nao=";

    let currentPage = 100;
    let previousPageCount = 100;

    // Deals Object
    const deals = [
        {
            shopName: "tesco",
            shopDeals: []
        }
    ];

    while (previousPageCount === 100) {
        const res = await axios(`${url}${currentPage}`);

        const html = res.data;
        const $ = cheerio.load(html);
        const mainWrapper = $("#contentMain"); // Everything Located in this wrapper
        const productRows = mainWrapper.find(".productLists ul .desc"); // Getting count of all products per page

        // Send page section off the extract data function
        deals[0].shopDeals.push(extractData($, mainWrapper));

        previousPageCount = productRows.length;
        currentPage += 100;
    }

    return deals;
}

function extractData($, mainWrapper) {
    const groups = mainWrapper.find(".productGroup");

    const dealTypes = ["2for", "4for", "6for", "halfprice", "save"];

    const shopDeals = [];

    groups.each(function() {
        // Get Category
        const productCategory = $(this)
            .text()
            .trim();

        // Get Product Rows
        const rows = $(this)
            .next(".productLists")
            .find(".desc");

        let products = [];

        rows.each(function() {
            const productName = $(this)
                .find("h3 > a")
                .after("span")
                .text()
                .trim();

            const isInStock = $(this)
                .find(".quantity .content .noStockTxtCentered")
                .html()
                ? false
                : true;

            const promoElement = $(this).find(".descContent .promo");

            // Promo Text
            const rawTextPromoPrice = promoElement
                .find("a em")
                .text()
                .replace(/\s/g, "")
                .trim();

            const rawTextPromoDates = promoElement
                .find("span")
                .text()
                .replace(/\s/g, "")
                .trim();

            // Promo Deal Type
            const dealType = isInStock
                ? promoElement
                      .find("a .promoImgBox img")
                      .attr("src")
                      .replace("/Groceries/UIAssets/I/Sites/Retail/Superstore/Online/Product/pos/", "")
                      .replace(".png", "")
                : null;

            // Quantity Price
            const rawQuantityPrice = $(this)
                .find(".quantity .content .price .linePrice")
                .text()
                .replace(/\s/g, "")
                .trim();

            products.push(
                createProductObject(
                    productName,
                    isInStock,
                    rawTextPromoPrice,
                    rawTextPromoDates,
                    dealType,
                    rawQuantityPrice
                )
            );
        });

        shopDeals.push({
            productCategory,
            products
        });
    });

    return shopDeals;
}

function createProductObject(productName, isInStock, rawTextPromoPrice, rawTextPromoDates, dealType, rawQuantityPrice) {
    let productOriginalPrice = null,
        productDiscountedPrice = null,
        productSavingAmount = null,
        productDealStartDate = null,
        productDealExpiryDate = null;

    const regex = /\d+(?:\.\d+)?/g;

    const promoPricesArr = rawTextPromoPrice.match(regex);
    const promoDatesArr = rawTextPromoDates.match(regex);
    const quantityPrice = rawQuantityPrice.match(regex);

    const dealConversion = {
        "2for": 2,
        "4for": 4,
        "6for": 6
    };

    if (isInStock) {
        if (["2for", "4for", "6for"].includes(dealType)) {
            const dealTimes = dealConversion[dealType];
            productOriginalPrice = Number(quantityPrice);
            productSavingAmount = ((Number(promoPricesArr[1]) - productOriginalPrice * dealTimes) / 2) * -1;
            productDiscountedPrice = productOriginalPrice - productSavingAmount;
        } else if (dealType === "halfprice") {
            productOriginalPrice = Number(promoPricesArr[0]);
            productDiscountedPrice = Number(quantityPrice);
            productSavingAmount = productOriginalPrice - productDiscountedPrice;
        } else {
            productOriginalPrice = Number(promoPricesArr[1]);
            productDiscountedPrice = Number(promoPricesArr[2]);
            productSavingAmount = Number(promoPricesArr[0]);
        }

        productDealStartDate = dayjs(`${promoDatesArr[2]}-${promoDatesArr[1]}-${promoDatesArr[0]}`).format();
        productDealExpiryDate = dayjs(`${promoDatesArr[5]}-${promoDatesArr[4]}-${promoDatesArr[3]}`).format();
    }

    return {
        productName,
        productOriginalPrice,
        productDiscountedPrice,
        productSavingAmount,
        productDealStartDate,
        productDealExpiryDate
    };
}

module.exports = getTescoJSON;
