const svgson = require("svgson");
const fse = require("fs-extra");
const cheerio = require("cheerio");


async function extractNoBorders() {
    console.log("@ Extracting `philippines.no-borders.json`")
    const file = "./data/maps/raw/svg/philippines.no-borders.svg" 
    const content = await fse.readFile(file)
    const $ = cheerio.load(content)
    
    const $philippines = $("path#philippines")
    const data = $philippines.attr() 
    const stringified = JSON.stringify(data, null, 4)
    
    await fse.writeFile(
        "./data/maps/raw/paths/philippines.no-border.json", 
        stringified
    )
}

async function extractSubpaths(context, filter = null) {
    console.log(`@ Extracting \`philippines.${context}.json\``)
    const file = `./data/maps/raw/svg/philippines.${context}.svg` 
    const content = await fse.readFile(file)
    const $ = cheerio.load(content)
    
    let selector = "path"; 

    if(filter) {
        selector += filter
    }
    
    const $subpaths = $(selector)
    const length = $subpaths.length

    const data = [] 
    
    $subpaths.each((i, el) => {
        console.log(`\tExtracting ${i} of ${length}`)

        let $el = $(el)
        let attrs = $el.attr() 

        if(context == "districts") {
            attrs["id"] = attrs["id"].replaceAll("-", "")
        }

        if(context == "municities") {
            attrs["id"] = attrs["id"].replaceAll("+", ".")
        }

        data.push(attrs)
    })
    
    const stringified = JSON.stringify(data, null, 4) 

    await fse.writeFile(
        `./data/maps/raw/paths/philippines.${context}.json`,
        stringified
    )
}

(async() => {
    await extractNoBorders()
    await extractSubpaths("regions")
    await extractSubpaths("provinces")
    await extractSubpaths("districts")
    await extractSubpaths("municities", "[data-municipality]")
})()