const { default: axios } = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const BASE_URL =
    "https://www.bi.go.id/id/statistik/informasi-kurs/transaksi-bi/default.aspx";

const extractTableWithCurrencyData = async () => {
    const response = await axios.get(BASE_URL);
    const $ = cheerio.load(response.data);
    const table = $(
        "div#ctl00_PlaceHolderMain_g_6c89d4ad_107f_437d_bd54_8fda17b556bf_ctl00_GridView1 table > tbody"
    );
    const result = [];
    table.find("tr").each((index, element) => {
        const row = $(element);
        const cells = row.find("td");
        const payload = {
            currency: $(cells[0]).text().trim(),
            value: +$(cells[1]).text(),
            sell: parseFloat(
                $(cells[2]).text().replace(".", "").replace(",", ".")
            ),
            buy: parseFloat(
                $(cells[3]).text().replace(".", "").replace(",", ".")
            ),
        };
        // normalize agar ke format 1 IDR
        if (payload.value > 1) {
            payload.sell = payload.sell / payload.value;
            payload.buy = payload.buy / payload.value;
            payload.value = 1;
        }
        result.push(payload);
    });
    return result;
};

(async () => {
    const currencies = await extractTableWithCurrencyData();
    console.log(currencies);
})();
