const extractRegionsMetadata = 
    require("./extract_metadata.regions");
const extractProvincesMetadata =
    require("./extract_metadata.provinces");
const extractDistrictsMetadata = 
    require("./extract_metadata.districts");

(async () => {
    // await extractRegionsMetadata()
    // await extractProvincesMetadata()
    await extractDistrictsMetadata()
})()
