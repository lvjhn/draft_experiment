const cheerio = require("cheerio");
const axios = require("axios"); 
const fse = require("fs-extra")

async function scrapeContext(context, linkField, nameField) {
    console.log(`@ Scraping ${context}`)
    const listFile = `./data/metadata/part-a/philippines.${context}.json` 
    const content = (await fse.readFile(listFile)).toString()
    const data = JSON.parse(content) 
    const outDir = `./data/articles/${context}/`
    const nItems = data.rows.length 
    let i = 0 

    for(let item of data.rows) {
        console.log(`\tScraping ${i + 1} of ${nItems}`)
        let link = item[linkField] 
        let content = (await axios.get(link)).data
        const linkId = link.split("/").at(-1)
        const outFile = outDir + linkId + ".html"
        await fse.writeFileSync(outFile, content)
        i += 1
    }
}

(async () => {
    // await scrapeContext("regions", "region_link", "region_name")
    // await scrapeContext("provinces", "province_link", "province_name")
    // await scrapeContext("districts", "district_link", "district_name")
    // await scrapeContext("cities", "city_link", "city_name")
    await scrapeContext("municities", "municity_link", "municity_name")
})()