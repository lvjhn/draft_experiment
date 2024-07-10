const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")

module.exports = async function extractProvincesMetadata() {
    console.log("@ Extending provinces metadata...")   
   
    const provincesFile = "_/data/metadata/part-a/philippines.provinces.json"
    const articlesDir    = "./data/articles/provinces"
    const data = []

    const catalog = require(provincesFile)
    
    for(let province of catalog.rows) {
        const link = province.province_link 
        const rowData = {} 

        const articleName = link.split("/").at(-1)
        const articleFile = articlesDir + "/" + articleName + ".html"
        const articleContent = (await fse.readFile(articleFile)).toString() 

        const $ = cheerio.load(articleContent);
        
        rowData["id"] = province["id"];
        rowData["province_name"] = province["province_name"];

        // extract coordinates
        (() => {
            const $coordinates = $("span.geo-dms").eq(0)
            const text = $coordinates.text() 
            rowData["coordinates"] = text.trim().split(" ")
        })();

        // extract region
        (() => {
            const $region = 
                $("th:contains('Region')").eq(0)
                
            const region = 
                $region.parent().find("td").text().trim()

            rowData["region"] = region
        })();

        // extract founded date
        (() => {
            const $founded = 
                $("th:contains('Founded')").eq(0)
                
            const founded = 
                $founded.parent().find("td").text().trim()

            rowData["founded"] = founded
        })();

        // extract capital
        (() => {
            const $capital = 
                $("th:contains('Capital')").eq(0)
                
            const capital = 
                $capital.parent().find("td").text().trim()

            rowData["capital"] = capital
        })();

        // largest city
        (() => {
            const $largestCity = 
                $("th:contains('Largest city')").eq(0)
                
            const largestCity = 
                $largestCity.parent().find("td").text().trim()

            rowData["largest_city"] = largestCity
        })();

        // extract current governor
        (() => {
            const $governor = 
                $("th:contains('Governor')").eq(0)
                
            const governor = 
                $governor.parent().find("td").text().trim()

            const governor_name = governor.split(" (")[0]
            const governor_party = /\((.*)\)/g.exec(governor)

            rowData["governor_name"] = 
                governor_name
            rowData["governor_party"] = 
                governor_party ? governor_party[1] : null
        })();

        // extract current vice governor
        (() => {
            const $viceGovernor = 
                $("th:contains('Vice Governor')").eq(0)
                
            const viceGovernor = 
                $viceGovernor.parent().find("td").text().trim()

            const viceGovernor_name = viceGovernor.split(" (")[0]
            const viceGovernor_party = /\((.*)\)/g.exec(viceGovernor)

            rowData["vice_governor_name"] = 
                viceGovernor_name
            rowData["vice_governor_party"] = 
                viceGovernor_party ? viceGovernor_party[1] : null
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

          // extract independent cities counts
          (() => {
            const $independentCities = 
                $("th:contains('Independent')").eq(0)
                
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

        // extract languages
        (() => {
            const $languages = 
                $("th:contains('Spoken'), th:contains('Languages')").eq(0)
            
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


        data.push(rowData)
    }

    console.log(`\tThe are ${data.length} provinces.`)

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-b/philippines.provinces.json",
        stringified
    )
}