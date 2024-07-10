const extractRegionsMetadata = 
    require("./extract_metadata.regions");
const extractProvincesMetadata =
    require("./extract_metadata.provinces");
const extractDistrictsMetadata = 
    require("./extract_metadata.districts");
const extractMunicitiesMetadata = 
    require("./extract_metadata.municities");
const extractCitiesMetadata = 
    require("./extract_metadata.cities");

(async () => {
    // await extractRegionsMetadata()
    // await extractProvincesMetadata()
    // await extractDistrictsMetadata()
    // await extractMunicitiesMetadata()
    await extractCitiesMetadata()
})()
