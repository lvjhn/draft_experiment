const cheerio = require("cheerio");
const fse = require("fs-extra")
const headerMap = require("_/scripts/helpers/headerMap.js")
const axios = require("axios")
const normalize = require("_/scripts/helpers/normalize")

module.exports = async function extractMunicitiesMetadata() {
    console.log("@ Extending municities metadata...")   
   
    const municitiesFile = "_/data/metadata/part-a/philippines.municities.json"
    const articlesDir    = "./data/articles/municities"
    const data = []

    const catalog = require(municitiesFile)
    
    let i = 0 
    let len = catalog.rows.length 

    for(let municity of catalog.rows) {
        console.log(`\t@ Extracting municity ${i + 1} of ${len}`)
        const link = municity.municity_link 
        const rowData = {} 

        const articleName = link.split("/").at(-1)
        const articleFile = articlesDir + "/" + articleName + ".html"
        const articleContent = (await fse.readFile(articleFile)).toString() 

        const $ = cheerio.load(articleContent);
        
        rowData["id"] = municity["id"];
        rowData["province_name"] = municity["province_name"];
        rowData["municity_name"] = municity["municity_name"];

        // extract coordinates
        {
            const $coordinates = $("span.geo-dms").eq(0)
            const text = $coordinates.text() 
            rowData["coordinates"] = text.trim().split(" ")
        }

        // extract region
        {
            const $region = 
                $("th:contains('Region')").eq(0)
                
            const region = 
                $region.parent().find("td").text().trim()

            rowData["region_name"] = normalize(region)
        }

        // extract district
        {
            const $district = 
                $("th:contains('District')").eq(0)
                
            const district = 
                $district.parent().find("td").text().trim()

            let districtValue;

            if(normalize(district) == "Lone district") {
                districtValue = "lone"
            } else {
                districtValue = district.split(" ")[0].slice(0, -2)
                if(districtValue == null) {
                    console.log(rowData["province_name"])
                    console.log(rowData["municity_name"])
                    return
                }
            }

            rowData["district"] = districtValue
        }

        // extract founded
        {
            const $founded = 
                $("th:contains('Founded')").eq(0)
                
            const founded = 
                $founded.parent().find("td").text().trim()

            rowData["founded"] = 
                founded != "" ? normalize(founded): null
        }

        // extract cityhood
        {
            const $cityhood = 
                $("th:contains('Cityhood')").eq(0)
                
            const cityhood = 
                $cityhood.parent().find("td").text().trim()

            rowData["cityhood"] = 
                cityhood != "" ? normalize(cityhood) : null
        }

        // extract royal city charter
        {
            const $royal_city_charter = 
                $("th:contains('Royal City-Charter')").eq(0)
                
            const royal_city_charter = 
                $royal_city_charter.parent().find("td").text().trim()

            rowData["royal_city_charter"] = 
                royal_city_charter != "" ? normalize(royal_city_charter) : null 
        }

        // barangays
        {
            const $barangays = 
                $("th:contains('Barangays')").eq(0)
                
            const barangays = 
                $barangays.parent().find("td").text().trim().split("\n ")[0]

            rowData["barangays"] = 
                barangays != "" ? parseInt(barangays) : null 
        }

        // government type
        {
            const $govtType = 
                $("th:contains('Type')").eq(0)
                
            const govtType = 
                $govtType.parent().find("td").text().trim()

            rowData["government_type"] = normalize(govtType) 
        }

        // government type
        {
            const $mayor = 
                $("th:contains('Mayor')").eq(0)
                
            const mayor = 
                $mayor.parent().find("td").text().trim()
                    .replaceAll(/\[.*\]/g, "")

            rowData["mayor"] = normalize(mayor) 
        }

        // vice mayor
        {
            const $viceMayor = 
                $("th:contains('Vice Mayor')").eq(0)
                
            const viceMayor = 
                $viceMayor.parent().find("td").text().trim()
                    .replaceAll(/\[.*\]/g, "")

            rowData["vice_mayor"] = normalize(viceMayor)
        }

        // representative
        {
            const $representative = 
                $("th:contains('Representative')").eq(0)
                
            const representative = 
                $representative.parent().find("td").text().trim()
                    .replaceAll(/\[.*\]/g, "")

            rowData["representative"] = normalize(representative)
        }


        // city councilors
        {
            const $cityCouncil = 
                $("th:contains('City Council')").eq(0)
                
            const $cityCouncilors = 
                $cityCouncil.parent().find("td li")
            
            const cityCouncilors = []
            $cityCouncilors.each((k, el) => {
                let councilor = $(el).text() 
                councilor = councilor.replaceAll(/\[.*\]/g, "")
                cityCouncilors.push(normalize(councilor))
            })
            
            rowData["city_councilors"] = cityCouncilors
        }

        // municipal councilors
        {
            const $municipalCouncil = 
                $("th:contains('Municipal Council')").eq(0)
                
            const $municipalCouncilors = 
                $municipalCouncil.parent().find("td li")
            
            const municipalCouncilors = []
            $municipalCouncilors.each((k, el) => {
                let councilor = $(el).text() 
                councilor = councilor.replaceAll(/\[.*\]/g, "")
                municipalCouncilors.push(normalize(councilor))
            })
            
            rowData["municipal_councilors"] = municipalCouncilors
        }

        // area
        {
            let $area = 
                $("th:contains('Area')").eq(0).parent().next()
            
            let subareas = {}

            while(
                !$area.hasClass('mergedtoprow') &&
                $area.length != 0
            ) {
                const text = $area.text() 
                
                let field = $area.find('th').text().trim()
                field = field.slice(2).trim().toLowerCase().replace(" ", "_") 
                field = normalize(field)

                let value = $area.find('td').text().trim()
                value = parseFloat(
                    value.split(" ")[0].replaceAll(",", "").slice(0, -3)
                ) 

                subareas[field] = value

                $area = $area.next()
            }
            
            rowData["areas"] = subareas
        }

        // elevation
        {
            const $elevation = 
                $("th:contains('Elevation')").eq(0)
                
            const elevation = 
                $elevation.parent().find("td").text().trim()

            rowData["elevation"] = 
                parseInt(elevation.split(" ")[0].slice(0, -2))
        }

        // highest elevation
        {
            const $highestElevation = 
                $("th:contains('Highest')")
                    .filter((i, el) => $(el).text().indexOf("elevation") != -1)
                    .eq(0)
                

            const highestElevation = 
                $highestElevation.parent().find("td").text().trim()

            rowData["highest_elevation"] = 
                parseInt(highestElevation.split(" ")[0].slice(0, -2))
        }

        // lowest elevation
        (
            const $lowestElevation = 
                $("th:contains('Lowest')")
                    .filter((i, el) => $(el).text().indexOf("elevation") != -1)
                    .eq(0)

                
            const lowestElevation = 
                $lowestElevation.parent().find("td").text().trim()

            rowData["lowest_elevation"] = 
                parseInt(lowestElevation.split(" ")[0].slice(0, -2))
        }

        // population
        {
            let $population = 
                $("th:contains('Population')").eq(0).parent().next()
            
            let subpopulations = {}

            while(
                !$population.hasClass('mergedtoprow') &&
                 $population.length != 0
            ) {
                const text = $population.text() 
                
                let field = $population.find('th').text().trim()
                field = field.slice(2).trim().toLowerCase().replace(" ", "_") 

                let value = $population.find('td').text().trim()
                value = parseFloat(
                    value.split(" ")[0].replaceAll(",", "")
                ) 

                subpopulations[field] = value

                $population = $population.next()
            }
            
            rowData["population"] = subpopulations
        }

        // economy
        {
            let $economy = 
                $("th:contains('Economy')").eq(0).parent().next()
            
            let aspects = {}

            while(
                !$economy.hasClass('mergedtoprow') &&
                $economy.length != 0
            ) {
                const text = $economy.text() 
                
                let field = $economy.find('th').text().trim()
                field = field.slice(2).trim().toLowerCase().replace(" ", "_") 

                let value;

                if(field == "income_class") {
                    value = normalize($economy.find('td').html())
                }
                else if(field == "poverty_incidence") {
                    value = parseFloat(
                        $economy.find("td div").eq(0).text()
                    ) / 100
                }
                else {
                    value = $economy.find('td').text()
                    value = value.slice(2, -7)
                    tokens = value.split(" ")
                    head = tokens[0]
                    tail = tokens[1] 
                    
                    if(tail == "million") {
                        tail = 1e6
                    }
                    else if(tail == "billion") {
                        tail = 1e9
                    }
                    else if(tail == "trillion") {
                        tail = 1e12
                    }
                    value = head * tail
                }
 
                aspects[field] = value

                $economy = $economy.next()
            }
            
            rowData["economy"] = aspects
        }

        // native language
        {
            let $languages = 
                $("th:contains('languages')").eq(0)

            let languages = 
                $languages.parent().find("td").html() 
          
                rowData["native_languages"] =
                    languages ? 
                        languages.split("<br>").map(x => normalize(x.trim())) 
                        : 
                        null
        }

        data.push(rowData)

        i += 1
    }

    console.log(`\tThe are ${data.length} municities.`)

    // write data 
    const stringified = JSON.stringify(data, null, 4) 
    await fse.writeFile(
        "./data/metadata/part-b/philippines.municities.json",
        stringified
    )
}