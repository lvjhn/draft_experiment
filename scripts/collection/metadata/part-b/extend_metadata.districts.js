const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")
const normalize = require("_/scripts/helpers/normalize")

module.exports = async function extractDistrictsMetadata() {
    console.log("@ Extending districts metadata...")   
   
    const districtsFile = "_/data/metadata/part-a/philippines.districts.json"
    const articlesDir    = "./data/articles/districts"
    const data = []

    const catalog = require(districtsFile)
    
    let i = 0 
    let len = catalog.rows.length 

    for(let district of catalog.rows) {
        console.log(`\t@ Extracting district ${i + 1} of ${len}`)
        const link = district.district_link 
        const rowData = {} 

        const articleName = link.split("/").at(-1)
        const articleFile = articlesDir + "/" + articleName + ".html"
        const articleContent = (await fse.readFile(articleFile)).toString() 

        const $ = cheerio.load(articleContent);
        
        rowData["id"] = district["id"];
        rowData["district_name"] = district["district_name"];

        // extract province
        {
            const $province = 
                $("th:contains('Province')").eq(0)
                
            const province = 
                $province.parent().find("td").text().trim()

            rowData["province"] = normalize(province)
        }

        // extract region
        {
            const $region = 
                $("th:contains('Region')").eq(0)
                
            const region = 
                $region.parent().find("td").text().trim()

            rowData["region"] = normalize(region)
        };

        // major settlements
        {
            const $majorSettlements = 
                $("th:contains('Major settlements')").eq(0)
                
            const majorSettlements = 
                $majorSettlements.parent().find("td div").text().trim()

            rowData["major_settlement_count"] = 
                parseInt(majorSettlements.split(" LGUs")[0])

            const $settlements = 
                $majorSettlements.parent().find("ul li")

            const items = {
                "municipalities" : [],
                "cities" : [],
                "uncategorized" : []
            }

            let switcher = "uncategorized"

            $settlements.each((i, el) => {
                const text = $(el).text().trim()
                if(text == "Municipalities" || text == "Cities") {
                    switcher = text.toLowerCase()
                }
                else if(text.trim() == "") {
                    return
                }
                else {
                    items[switcher].push(normalize(text))
                }
            })

            rowData["major_settlements"] = items
        }

        // created
        {
            const $region = 
                $("th:contains('Created')").eq(0)
             
            const region = 
                $region.parent().find("td").text().trim()

            rowData["created"] = parseInt(region)
        }

        // created
        {
            const $table = 
                $("table:contains('Electoral history')").eq(0)
        
            const $rows = $table.find("tr") 
            const history = {}
            
            $rows.each((i, el) => {
                const $row = $(el); 
                const lastCol = $row.find("td").eq(-1).text().trim()
                const match = /[0-9]{4}–([0-9]{4}|present)/g.test(lastCol)
                if(match) {
                    const matched = 
                        /([0-9]{4}–([0-9]{4}|present))/g.exec(lastCol)[1]
                    const items = lastCol.split(matched)
                    let municities = items[1].split(", ")
                    municities = municities.map(
                        x => normalize((x.replaceAll(":", ""))
                    ))
                    history[matched] = municities
                }
            })

            rowData["district_history"] = history
        }

        data.push(rowData)

        // if(i > 5) {
        //     break
        // }

        i += 1
    }

    console.log(`\tThe are ${data.length} districts.`)

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-b/philippines.districts.json",
        stringified
    )
}