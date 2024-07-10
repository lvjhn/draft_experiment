const extendRegionsMetadata = 
    require("./extend_metadata.regions");
const extendProvincesMetadata =
    require("./extend_metadata.provinces");
const extendDistrictsMetadata = 
    require("./extend_metadata.districts");
// const extendMunicitiesMetadata = 
//     require("./extend_metadata.municities");
// const extendCitiesMetadata = 
//     require("./extend_metadata.cities");

(async () => {
    // await extendRegionsMetadata()
    // await extendProvincesMetadata()
    await extendDistrictsMetadata()
    // await extendMunicitiesMetadata()
    // await extendCitiesMetadata()
})()
