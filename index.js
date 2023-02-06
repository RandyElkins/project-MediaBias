const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const PORT = 8000;
const app = express();

url = 'https://mediabiasfactcheck.com/filtered-search/?factual_reporting=very_low&country=US';

axios(url)
    .then(res => {
        const html = res.data;
        const $ = cheerio.load(html);
        const tr = [];

        $('#mbfc-table tbody tr', html).each(function () {
            const source = $(this).find('a').text()
            tr.push(source);
        });
        console.log(tr);
    }).catch(err => console.log(err));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
})