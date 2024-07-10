const extractRegionsMetadata = 
    require("./extract_metadata.regions");
const extractProvincesMetadata =
    require("./extract_metadata.provinces");

(async () => {
    // await extractRegionsMetadata()
    await extractProvincesMetadata()
})()
