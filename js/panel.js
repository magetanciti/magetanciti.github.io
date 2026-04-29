const panel = document.getElementById('customPanel');
const toggleBtn = document.getElementById('togglePanel');
let panelVisible = true;
toggleBtn.addEventListener('click', () => {
  panelVisible = !panelVisible;
  panel.style.display = panelVisible ? 'block' : 'none';
  toggleBtn.textContent = panelVisible ? '⮞' : '☰';
});

// --- Dropdown kecamatan ---
const kecamatanSelect = document.getElementById("filterKecamatan");
const kelurahanSelect = document.getElementById("filterKelurahan");
const kecamatanList = [...new Set(json_Petabatas_3.features.map(f => f.properties.WADMKC))];
kecamatanList.sort().forEach(kec => {
  const opt = document.createElement("option");
  opt.value = kec;
  opt.textContent = kec;
  kecamatanSelect.appendChild(opt);
});

// --- Filter Marker & Poligon ---
function filterKantorKelurahan(selectedKec, selectedKel) {
  cluster_Kantor_Kelurahan_4.clearLayers();
  let filteredMarkers = json_Kantor_Kelurahan_4.features;

  if (selectedKec !== "All") {
    const filteredKelurahan = json_Petabatas_3.features
      .filter(f => f.properties.WADMKC === selectedKec)
      .map(f => f.properties.KDEPUM);
    filteredMarkers = filteredMarkers.filter(m => filteredKelurahan.includes(m.properties.KDEPUM));
  }

  if (selectedKel !== "All") {
    const filteredKelurahan = json_Petabatas_3.features
      .filter(f => f.properties.NAMOBJ === selectedKel)
      .map(f => f.properties.KDEPUM);
    filteredMarkers = filteredMarkers.filter(m => filteredKelurahan.includes(m.properties.KDEPUM));
  }

  const newLayer = L.geoJson({ type: "FeatureCollection", features: filteredMarkers }, {
  onEachFeature: pop_Kantor_Kelurahan_4,
  pointToLayer: function (feature, latlng) {
    // 🔹 ambil nama kecamatan
    var kecamatan = feature.properties['WADMKC'];
    var iconUrl;

    // 🔹 kelompokkan sesuai logika ikon aslinya
    if (['Tugu', 'Gunungpati', 'Gayamsari', 'Ngaliyan'].includes(kecamatan)) {
        iconUrl = 'https://raw.githubusercontent.com/magetanciti/magetanciti.github.io/main/images/home_3367739.png';
    } 
    else if (['Mijen', 'Semarang Utara', 'Gajahmungkur', 'Genuk', 'Semarang Selatan', 'Semarang Timur', 'Semarang Barat'].includes(kecamatan)) {
        iconUrl = 'https://raw.githubusercontent.com/magetanciti/magetanciti.github.io/main/images/gps_13803263.png';
    } 
    else if (['Candisari', 'Tembalang', 'Banyumanik', 'Pedurungan', 'Semarang Tengah'].includes(kecamatan)) {
        iconUrl = 'https://raw.githubusercontent.com/magetanciti/magetanciti.github.io/main/images/navigator_13191947.png';
    } 
    else {
        iconUrl = 'https://raw.githubusercontent.com/magetanciti/magetanciti.github.io/main/images/navigator_13191947.png';
    }

    // 🔹 buat ikon sesuai kecamatan
    const customIcon = L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -28]
    });

    return L.marker(latlng, { icon: customIcon });
  }
});
  cluster_Kantor_Kelurahan_4.addLayers(newLayer.getLayers());
}

// --- Event kecamatan ---
kecamatanSelect.addEventListener("change", function(e){
  const selectedKec = e.target.value;
  layer_Petabatas_3.clearLayers();
  layer_kecamatan.clearLayers();
  if (selectedKec === "All") {
  layer_Petabatas_3.addData(json_Petabatas_3);
  layer_Petabatas_3.setStyle({opacity: currentOpacity, fillOpacity: currentOpacity});
  layer_kecamatan.addData(json_kecamatan);
  layer_kecamatan.setStyle({opacity: currentOpacity, fillOpacity: currentOpacity});
    map.fitBounds(layer_Petabatas_3.getBounds());
    kelurahanSelect.innerHTML = '<option value="All">Semua Kelurahan</option>';
    kelurahanSelect.disabled = true;
  } else {
    const filtered = json_Petabatas_3.features.filter(f => f.properties.WADMKC === selectedKec);
    layer_Petabatas_3.addData({type:"FeatureCollection", features:filtered});
    layer_Petabatas_3.setStyle({opacity: currentOpacity, fillOpacity: currentOpacity});
    const filteredKec = json_kecamatan.features.filter(f => f.properties.WADMKC === selectedKec);
    layer_kecamatan.addData({type:"FeatureCollection", features:filteredKec});
    layer_kecamatan.setStyle({opacity: currentOpacity, fillOpacity: currentOpacity});
    map.fitBounds(L.geoJson({type:"FeatureCollection", features:filtered}).getBounds());

    // Update dropdown kelurahan
    const kelurahanList = [...new Set(filtered.map(f => f.properties.NAMOBJ))];
    kelurahanSelect.innerHTML = '<option value="All">Semua Kelurahan</option>';
    kelurahanList.sort().forEach(kel => {
      const opt = document.createElement("option");
      opt.value = kel;
      opt.textContent = kel;
      kelurahanSelect.appendChild(opt);
    });
    kelurahanSelect.disabled = false;
  }
  
  // Sync radio state if we force show Batas Kelurahan/Kecamatan
  const activeBatas = document.querySelector('input[name="layerBatasGroup"]:checked');
  if (activeBatas) {
    if (activeBatas.value === 'kelurahan') {
      if (!map.hasLayer(layer_Petabatas_3)) map.addLayer(layer_Petabatas_3);
    } else if (activeBatas.value === 'kecamatan') {
      if (!map.hasLayer(layer_kecamatan)) map.addLayer(layer_kecamatan);
    }
  }
  
  filterKantorKelurahan(selectedKec, "All");
});

// --- Event kelurahan ---
kelurahanSelect.addEventListener("change", function(e){
  const selectedKec = kecamatanSelect.value;
  const selectedKel = e.target.value;
  layer_Petabatas_3.clearLayers();
  let filtered = json_Petabatas_3.features;
  if (selectedKec !== "All") filtered = filtered.filter(f => f.properties.WADMKC === selectedKec);
  if (selectedKel !== "All") filtered = filtered.filter(f => f.properties.NAMOBJ === selectedKel);
  layer_Petabatas_3.addData({type:"FeatureCollection", features:filtered});
  
  const activeBatas = document.querySelector('input[name="layerBatasGroup"]:checked');
  if (activeBatas) {
    if (activeBatas.value === 'kelurahan') {
      if (!map.hasLayer(layer_Petabatas_3)) map.addLayer(layer_Petabatas_3);
    } else if (activeBatas.value === 'kecamatan') {
      if (!map.hasLayer(layer_kecamatan)) map.addLayer(layer_kecamatan);
    }
  }
  
  map.fitBounds(L.geoJson({type:"FeatureCollection", features:filtered}).getBounds());
  filterKantorKelurahan(selectedKec, selectedKel);
});

// --- Layer toggle (Titik) ---
['layerKantor', 'layerTPS'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('change', function() {
      let layer;
      if (id === 'layerKantor') layer = cluster_Kantor_Kelurahan_4;
      else if (id === 'layerTPS') layer = cluster_TPS;

      if (layer) {
        if (this.checked) {
          if (!map.hasLayer(layer)) map.addLayer(layer);
        } else {
          if (map.hasLayer(layer)) map.removeLayer(layer);
        }
      }
    });
    // Trigger event on load to sync state
    el.dispatchEvent(new Event('change'));
  }
});

// --- Layer toggle (Batas Group) ---
const batasRadios = document.querySelectorAll('input[name="layerBatasGroup"]');
batasRadios.forEach(radio => {
  radio.addEventListener('change', function() {
    if (this.checked) {
      if (this.value === 'kecamatan') {
        if (!map.hasLayer(layer_kecamatan)) map.addLayer(layer_kecamatan);
        if (map.hasLayer(layer_Petabatas_3)) map.removeLayer(layer_Petabatas_3);
      } else if (this.value === 'kelurahan') {
        if (!map.hasLayer(layer_Petabatas_3)) map.addLayer(layer_Petabatas_3);
        if (map.hasLayer(layer_kecamatan)) map.removeLayer(layer_kecamatan);
      } else if (this.value === 'none') {
        if (map.hasLayer(layer_kecamatan)) map.removeLayer(layer_kecamatan);
        if (map.hasLayer(layer_Petabatas_3)) map.removeLayer(layer_Petabatas_3);
      }
    }
  });
});
// Trigger event on load to sync state for checked radio
const checkedBatasRadio = document.querySelector('input[name="layerBatasGroup"]:checked');
if (checkedBatasRadio) checkedBatasRadio.dispatchEvent(new Event('change'));

// --- Slider opacity ---
opacitySlider.addEventListener('input', function() {
  const opacityValue = parseFloat(this.value);
  currentOpacity = opacityValue;
  layer_Petabatas_3.setStyle({opacity:opacityValue, fillOpacity:opacityValue});
  layer_kecamatan.setStyle({opacity:opacityValue, fillOpacity:opacityValue});
});
opacitySlider.dispatchEvent(new Event('input'));

const downloadSvgBtn = document.getElementById('downloadKecSvg');
downloadSvgBtn.addEventListener('click', function(){
  const selectedKec = kecamatanSelect.value;
  if (selectedKec === 'All') { alert('Pilih kecamatan terlebih dahulu.'); return; }
  const prevCenter = map.getCenter();
  const prevZoom = map.getZoom();
  const mainFeatures = json_Petabatas_3.features.filter(f => f.properties.WADMKC === selectedKec);
  const mainGeo = L.geoJson({type:'FeatureCollection', features: mainFeatures});
  const mainBounds = mainGeo.getBounds();
  map.fitBounds(mainBounds, { animate: false, padding: [10,10] });
  const expanded = mainBounds.pad(0.08);
  const neighborFeatures = json_Petabatas_3.features.filter(f => f.properties.WADMKC !== selectedKec && expanded.intersects(L.geoJson(f).getBounds()));
  const size = map.getSize();
  function polygonPath(rings){
    var d = '';
    for (var r=0;r<rings.length;r++){
      var ring = rings[r];
      for (var i=0;i<ring.length;i++){
        var p = map.latLngToContainerPoint([ring[i][1], ring[i][0]]);
        d += (i===0? 'M' : 'L') + p.x + ' ' + p.y;
      }
      d += 'Z';
    }
    return d;
  }
  function featurePath(feat){
    if (feat.geometry.type === 'Polygon') return polygonPath(feat.geometry.coordinates);
    var d = '';
    if (feat.geometry.type === 'MultiPolygon'){
      for (var k=0;k<feat.geometry.coordinates.length;k++){
        d += polygonPath(feat.geometry.coordinates[k]);
      }
    }
    return d;
  }
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+size.x+'" height="'+size.y+'" viewBox="0 0 '+size.x+' '+size.y+'">';
  svg += '<rect x="0" y="0" width="'+size.x+'" height="'+size.y+'" fill="#f3f3f3" />';
  svg += '<g id="neighbors">';
  for (var nf=0; nf<neighborFeatures.length; nf++){
    var nfeat = neighborFeatures[nf];
    var nd = featurePath(nfeat);
    svg += '<path d="'+nd+'" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" vector-effect="non-scaling-stroke" />';
  }
  svg += '</g>';
  svg += '<g id="main">';
  for (var f=0; f<mainFeatures.length; f++){
    var feat = mainFeatures[f];
    var s = style_Petabatas_3_0(feat);
    var d = featurePath(feat);
    var kid = String(feat.properties.NAMOBJ || '').replace(/[^A-Za-z0-9_\-]/g,'_');
    svg += '<g id="'+kid+'" data-kelurahan="'+String(feat.properties.NAMOBJ||'').replace(/"/g,'')+'">';
    svg += '<path d="'+d+'" fill="'+s.fillColor+'" stroke="'+s.color+'" stroke-width="'+(s.weight||1)+'" stroke-linecap="butt" stroke-linejoin="miter" vector-effect="non-scaling-stroke" />';
    var b = L.geoJson(feat).getBounds();
    var c = b.getCenter();
    var p = map.latLngToContainerPoint(c);
    var nw = map.latLngToContainerPoint(b.getNorthWest());
    var se = map.latLngToContainerPoint(b.getSouthEast());
    var w = Math.abs(se.x - nw.x);
    var h = Math.abs(se.y - nw.y);
    var dwh = Math.min(w,h);
    var fsK = Math.max(8, Math.min(12, Math.round(dwh/30)));
    var kelName = String(feat.properties.NAMOBJ || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    svg += '<text x="'+p.x+'" y="'+p.y+'" font-family="Sans-serif" font-size="'+fsK+'" fill="#000000" text-anchor="middle" dominant-baseline="middle">'+kelName+'</text>';
    svg += '</g>';
  }
  svg += '</g>';
  var placed = [];
  function placeLabel(x,y,text){
    var fs = 10;
    var w = Math.max(20, Math.round(text.length*fs*0.6));
    var h = fs;
    var px = x, py = y, tries = 0;
    function overlaps(a,b){ return !(a.x+w < b.x || b.x+b.w < a.x || a.y+h < b.y || b.y+b.h < a.y); }
    while (tries < 50){
      var box = {x:px-w/2, y:py-h/2, w:w, h:h};
      var ok = true;
      for (var i=0;i<placed.length;i++){ if (overlaps(box, placed[i])) { ok=false; break; } }
      if (ok){ placed.push(box); break; }
      py += fs + 2;
      tries++;
    }
    return {x:px, y:py, fs:fs};
  }
  var mainCenter = map.latLngToContainerPoint(mainBounds.getCenter());
  var mainLabel = placeLabel(mainCenter.x, mainCenter.y, selectedKec);
  svg += '<text x="'+mainLabel.x+'" y="'+mainLabel.y+'" font-family="Sans-serif" font-size="'+mainLabel.fs+'" fill="#000000" text-anchor="middle" dominant-baseline="middle">'+selectedKec+'</text>';
  var neighborKecs = {};
  for (var i=0;i<neighborFeatures.length;i++){
    var k = neighborFeatures[i].properties.WADMKC;
    if (!neighborKecs[k]) neighborKecs[k] = [];
    neighborKecs[k].push(neighborFeatures[i]);
  }
  for (var nk in neighborKecs){
    var ngeo = L.geoJson({type:'FeatureCollection', features: neighborKecs[nk]});
    var nb = ngeo.getBounds();
    var c = map.latLngToContainerPoint(nb.getCenter());
    var lbl = placeLabel(c.x, c.y, nk);
    svg += '<text x="'+lbl.x+'" y="'+lbl.y+'" font-family="Sans-serif" font-size="'+lbl.fs+'" fill="#000000" text-anchor="middle" dominant-baseline="middle">'+nk+'</text>';
  }
  svg += '</svg>';
  const blob = new Blob([svg], {type:'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kecamatan_'+selectedKec.replace(/\s+/g,'_')+'.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  map.setView(prevCenter, prevZoom);
});

// --- Basemap Control ---
const basemapRadios = document.querySelectorAll('input[name="basemap"]');

// Awal: hanya tampilkan OSM
map.removeLayer(layer_GoogleEarth_0);
map.removeLayer(layer_EsriGrayWorldLightGrayBase_1);
map.addLayer(layer_OpenStreetMap_2);

basemapRadios.forEach(radio => {
  radio.addEventListener('change', function() {
    switch (this.value) {
      case 'osm':
        map.addLayer(layer_OpenStreetMap_2);
        map.removeLayer(layer_GoogleEarth_0);
        map.removeLayer(layer_EsriGrayWorldLightGrayBase_1);
        break;
      case 'satellite':
        map.addLayer(layer_GoogleEarth_0);
        map.removeLayer(layer_OpenStreetMap_2);
        map.removeLayer(layer_EsriGrayWorldLightGrayBase_1);
        break;
      case 'gray':
        map.addLayer(layer_EsriGrayWorldLightGrayBase_1);
        map.removeLayer(layer_OpenStreetMap_2);
        map.removeLayer(layer_GoogleEarth_0);
        break;
    }
  });
});