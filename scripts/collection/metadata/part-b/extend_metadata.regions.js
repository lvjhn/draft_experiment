const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")

module.exports = async function extractRegionsMetadata() {
    console.log("@ Extending region metadata...")   
   
    const regionFile = "_/data/metadata/part-a/philippines.regions.json"
    const articlesDir    = "./data/articles/regions"
    const data = []

    const catalog = require(regionFile)
    
    for(let region of catalog.rows) {
        const link = region.region_link 
        const rowData = {} 

        const articleName = link.split("/").at(-1)
        const articleFile = articlesDir + "/" + articleName + ".html"
        const articleContent = (await fse.readFile(articleFile)).toString() 

        const $ = cheerio.load(articleContent);
        
        rowData["id"] = region["id"];
        rowData["region_name"] = region["region_name"];

        // extract coordinates
        (() => {
            const $coordinates = $("span.geo-dms").eq(0)
            const text = $coordinates.text() 
            rowData["coordinates"] = text.trim().split(" ")
        })();

        // extract highest elevation
        (() => {
            const $highestElevation = 
                $("th:contains('Highest')").eq(0)
                
            const highestBOL =  
                /\((.*)\)/g.exec($highestElevation.text())
                
            rowData["highest_bol"] = 
                highestBOL ? highestBOL[1] : null

            const peak = 
                $highestElevation.parent().find("td")
                    .text().split(" ")[0].split(" ")[0]
                    .replaceAll(",", "")

            rowData["highest_peak"] = parseFloat(peak)
        })();

        // extract province counts
        (() => {
            const $provinces = 
                $("th:contains('Provinces')").eq(0)
                
            const provinces = 
                $provinces.parent().find("td").text()
                    .replaceAll(",", "")

            rowData["provinces"] = parseInt(provinces)
        })();

        // extract independent cities counts
        (() => {
            const $independentCities = 
                $("th:contains('Independent cities')").eq(0)
                
            const independentCities = 
                $independentCities.parent().find("td").text()
                    .replaceAll(",", "")
                
            rowData["independent_cities"] = parseInt(independentCities)
        })();

        // extract independent cities counts
        (() => {
            const $componentCities = 
                $("th:contains('Component cities')").eq(0)
                
            const componentCities = 
                $componentCities.parent().find("td").text()
                    .replaceAll(",", "")


            rowData["component_cities"] = parseInt(componentCities)
        })();

        // extract municipalities counts
        (() => {
            const $municipalities = 
                $("th:contains('Municipalities')").eq(0)
                
            const municipalities = 
                $municipalities.parent().find("td").text()
                .replaceAll(",", "")

            rowData["municipalities"] = parseInt(municipalities)
        })();

        // extract barangays counts
        (() => {
            const $barangays = 
                $("th:contains('Barangays')").eq(0)
                
            const barangays = 
                $barangays.parent().find("td").text()
                    .replaceAll(",", "")

            rowData["barangays"] = parseInt(barangays)
        })();

        // extract cong. districts counts
        (() => {
            const $congDistricts = 
                $("th:contains('Cong. districts')").eq(0)
                
            const congDistricts = 
                $congDistricts.parent().find("td").text()
                    .replaceAll(",", "")

            rowData["cong_districts"] = parseInt(congDistricts)
        })();

        // extract languages
        (() => {
            const $languages = 
                $("th:contains('Languages')").eq(0)
            
            const $languagesValue = 
                $languages.parent().find("td")
            
            const $languageGroups = 
                $languagesValue.find("div > ul > li")
            
            rowData["languages"] = {}

            $languageGroups.each((j, el) => {
                const group = $(el).find("> a").eq(0).text().trim() 
                
                if(group == "") {
                    return 
                }

                const $subitems = $(el).find("> .hlist > ul > li > a") 
                const subitems = []
                $subitems.each((i, el) => {
                    let text = $(el).text().trim()
                   
                    subitems.push(text)
                })
                rowData["languages"][group] = 
                    subitems.length == 0 ? null : subitems
            })
        })();

        // extract gdp
        (() => {
            const $gdp = 
                $("th:contains('GDP')").eq(0)
            
            const gdp = 
                $gdp.parent().find("td").html()
            
            const gdpValue = 
                /<\/a>(.*)<br>/g.exec(gdp)

            rowData["gdp"] = gdpValue ? gdpValue[1] : null
        })();

        // extract growth rate
        (() => {
            const $growthRate = 
                $("th:contains('Growth')").eq(0)
            
            const growthRate = 
                $growthRate.parent().find("td").text()
            
            const growthRateValue = 
                /\((.*)\)/g.exec(growthRate)

            rowData["growth_rate_2019"] = 
                growthRateValue ? 
                    parseFloat(growthRateValue[1].replace("%", "")) / 100
                    : null
        })();

        // extract hdi rank
        (() => {
            const $hdi = 
                $("th:contains('HDI')").eq(0)

            const hdi = 
                $hdi.parent().find("td").text().trim()
            
            const hdiValue =
                parseFloat(hdi.split(" (")[0])

            const hdiLevel = 
                /\((.*)\)/g.exec(hdi)


            rowData["hdi_value_2019"] = hdiValue
            rowData["hdi_level_2019"] = 
                hdiLevel ? hdiLevel[1] : null
        })();

        // extract hdi rank
        (() => {
            const $hdiRank = 
                $("th:contains('HDI rank')").eq(0)
            
            const hdiRank = 
                $hdiRank.parent().find("td").text()
            
            const hdiRankValue = 
                /([0-9]+)/g.exec(hdiRank)

            rowData["hdi_rank"] = 
                hdiRankValue ? parseInt(hdiRankValue[1]) : null
        })();
        
        data.push(rowData)
    }

    console.log(`\tThe are ${data.length} regions.`)

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-b/philippines.regions.json",
        stringified
    )
}