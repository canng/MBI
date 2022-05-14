// This example demonstrates the use of the Landsat 8 Collection 2, Level 2
// QA_PIXEL band (CFMask) to mask unwanted pixels.
function maskL8sr(image) {
    // Bit 0 - Fill
    // Bit 1 - Dilated Cloud
    // Bit 2 - Cirrus
    // Bit 3 - Cloud
    // Bit 4 - Cloud Shadow
    var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
    var saturationMask = image.select('QA_RADSAT').eq(0);
    // Apply the scaling factors to the appropriate bands.
    var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
    var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
    // Replace the original bands with the scaled ones and apply the masks.
    return image.addBands(opticalBands, null, true)
        .addBands(thermalBands, null, true)
        .updateMask(qaMask)
        .updateMask(saturationMask);
  }
  
/////////////////////////////////////////////////////
var geometry = ee.Geometry.Polygon(
     [[[99.20015069239795, 15.676039888558511],
       [99.20015069239795, 8.852617303666488],
       [107.70356866114795, 8.852617303666488],
       [107.70356866114795, 15.676039888558511]]], null, false);
Map.centerObject(geometry, 6);
  
var BKK = maskL8sr(ee.Image('LANDSAT/LC08/C02/T1_L2/LC08_129050_20200219'));
var STG = maskL8sr(ee.Image('LANDSAT/LC08/C02/T1_L2/LC08_125053_20200223'));
  
var MBI = function(image){
var mbi = image.expression(
      '(swir1 - swir2 - nir)/(swir1 + swir2 + nir) + 0.5',{
          swir1: image.select('SR_B6'),
          swir2: image.select('SR_B7'),
          nir:   image.select('SR_B5'),
      }).rename('MBI')
      return mbi.set('system:time_start', image.get('system:time_start'))
}
  
var MBI_BKK = MBI(BKK);
var MBI_STG = MBI(STG);
  
///////////////////////////////////////////////////////////////////////////////
var palettes = require('users/gena/packages:palettes');
var palette = palettes.colorbrewer.BrBG[9].reverse();
  
Map.addLayer(BKK, {bands: ['SR_B7', 'SR_B5', 'SR_B3'], min: 0, max: 0.4}, 'FCC - Bangkok');
Map.addLayer(STG, {bands: ['SR_B7', 'SR_B5', 'SR_B3'], min: 0, max: 0.4}, 'FCC - Soc Trang');
  
/// MBI values are in range of [-0.5: 1.5]
  
Map.addLayer(MBI_BKK, {min: 0, max: 0.4, palette: palette}, "MBI - Bangkok");
Map.addLayer(MBI_STG, {min: 0, max: 0.4, palette: palette}, "MBI - Soc Trang");
  
  
////////////////////////////////////////////////////////////////////////////////////////