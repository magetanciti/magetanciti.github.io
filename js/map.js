var highlightLayer;
        var currentOpacity = 0.7;
        var pendudukKelurahan = {};
        var pendudukKelurahanByNama = {};
        
        if (typeof data_penduduk !== 'undefined' && data_penduduk.features) {
            for (var i = 0; i < data_penduduk.features.length; i++) {
                var f = data_penduduk.features[i];
                if (!f || !f.properties) continue;
                var props = f.properties;
                var nama = String(props.NAMOBJ || '').trim().toUpperCase();
                var kec = String(props.WADMKC || '').trim().toUpperCase();
                var key = nama + '|' + kec;
                var record = {
                    laki: props['Laki-laki'],
                    perempuan: props['Perempuan'],
                    total: props.Total,
                    luas: props.Luas_km2
                };
                pendudukKelurahan[key] = record;
                if (!pendudukKelurahanByNama[nama]) {
                    pendudukKelurahanByNama[nama] = record;
                }
            }
        }
        
        function highlightFeature(e) {
            highlightLayer = e.target;

            if (typeof highlightLayer.setStyle === 'function') {
              if (e.target.feature.geometry.type === 'LineString' || e.target.feature.geometry.type === 'MultiLineString') {
                highlightLayer.setStyle({
                  color: '#ffff00',
                  weight: 3
                });
              } else {
                highlightLayer.setStyle({
                  fillColor: '#ffff00',
                  fillOpacity: 1,
                  opacity: 1,
                  weight: 2
                });
              }
            }
        }
        var map = L.map('map', {
            zoomControl:false, maxZoom:28, minZoom:1
        })
        var hash = new L.Hash(map);
        map.attributionControl.setPrefix('<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
        var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});
        // remove popup's row if "visible-with-data"
        function removeEmptyRowsFromPopupContent(content, feature) {
         var tempDiv = document.createElement('div');
         tempDiv.innerHTML = content;
         var rows = tempDiv.querySelectorAll('tr');
         for (var i = 0; i < rows.length; i++) {
             var td = rows[i].querySelector('td.visible-with-data');
             var key = td ? td.id : '';
             if (td && td.classList.contains('visible-with-data') && feature.properties[key] == null) {
                 rows[i].parentNode.removeChild(rows[i]);
             }
         }
         return tempDiv.innerHTML;
        }
        // modify popup if contains media
        function addClassToPopupIfMedia(content, popup) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            var imgTd = tempDiv.querySelector('td img');
            if (imgTd) {
                var src = imgTd.getAttribute('src');
                if (/\.(jpg|jpeg|png|gif|bmp|webp|avif)$/i.test(src)) {
                    popup._contentNode.classList.add('media');
                    setTimeout(function() {
                        popup.update();
                    }, 10);
                } else if (/\.(mp3|wav|ogg|aac)$/i.test(src)) {
                    var audio = document.createElement('audio');
                    audio.controls = true;
                    audio.src = src;
                    imgTd.parentNode.replaceChild(audio, imgTd);
                    popup._contentNode.classList.add('media');
                    setTimeout(function() {
                        popup.setContent(tempDiv.innerHTML);
                        popup.update();
                    }, 10);
                } else if (/\.(mp4|webm|ogg|mov)$/i.test(src)) {
                    var video = document.createElement('video');
                    video.controls = true;
                    video.src = src;
                    video.style.width = "400px";
                    video.style.height = "300px";
                    video.style.maxHeight = "60vh";
                    video.style.maxWidth = "60vw";
                    imgTd.parentNode.replaceChild(video, imgTd);
                    popup._contentNode.classList.add('media');
                    // Aggiorna il popup quando il video carica i metadati
                    video.addEventListener('loadedmetadata', function() {
                        popup.update();
                    });
                    setTimeout(function() {
                        popup.setContent(tempDiv.innerHTML);
                        popup.update();
                    }, 10);
                } else {
                    popup._contentNode.classList.remove('media');
                }
            } else {
                popup._contentNode.classList.remove('media');
            }
        }
        var zoomControl = L.control.zoom({
            position: 'topleft'
        }).addTo(map);
        L.control.locate({locateOptions: {maxZoom: 19}}).addTo(map);
        var bounds_group = new L.featureGroup([]);
        function setBounds() {
            if (bounds_group.getLayers().length) {
                map.fitBounds(bounds_group.getBounds());
            }
        }
        map.createPane('pane_GoogleEarth_0');
        map.getPane('pane_GoogleEarth_0').style.zIndex = 400;
        var layer_GoogleEarth_0 = L.tileLayer('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}', {
            pane: 'pane_GoogleEarth_0',
            opacity: 1.0,
            attribution: '',
            minZoom: 1,
            maxZoom: 28,
            minNativeZoom: 0,
            maxNativeZoom: 18
        });
        layer_GoogleEarth_0;
        map.addLayer(layer_GoogleEarth_0);
        map.createPane('pane_EsriGrayWorldLightGrayBase_1');
        map.getPane('pane_EsriGrayWorldLightGrayBase_1').style.zIndex = 401;
        var layer_EsriGrayWorldLightGrayBase_1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
            pane: 'pane_EsriGrayWorldLightGrayBase_1',
            opacity: 1.0,
            attribution: '',
            minZoom: 1,
            maxZoom: 28,
            minNativeZoom: 0,
            maxNativeZoom: 18
        });
        layer_EsriGrayWorldLightGrayBase_1;
        map.addLayer(layer_EsriGrayWorldLightGrayBase_1);
        map.createPane('pane_OpenStreetMap_2');
        map.getPane('pane_OpenStreetMap_2').style.zIndex = 402;
        var layer_OpenStreetMap_2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            pane: 'pane_OpenStreetMap_2',
            opacity: 1.0,
            attribution: '',
            minZoom: 1,
            maxZoom: 28,
            minNativeZoom: 0,
            maxNativeZoom: 19
        });
        layer_OpenStreetMap_2;
        map.addLayer(layer_OpenStreetMap_2);
        function generatePopupContent_Petabatas_3(feature) {
            var namaPenduduk = String(feature.properties['NAMOBJ'] || '').trim().toUpperCase();
            var kecPenduduk = String(feature.properties['WADMKC'] || '').trim().toUpperCase();
            var keyPenduduk = namaPenduduk + '|' + kecPenduduk;
            var dataPenduduk = pendudukKelurahan[keyPenduduk] || pendudukKelurahanByNama[namaPenduduk] || null;
            var valLaki = dataPenduduk && typeof dataPenduduk.laki === 'number' ? dataPenduduk.laki.toLocaleString('id-ID') : (dataPenduduk && dataPenduduk.laki != null ? String(dataPenduduk.laki) : '-');
            var valPerempuan = dataPenduduk && typeof dataPenduduk.perempuan === 'number' ? dataPenduduk.perempuan.toLocaleString('id-ID') : (dataPenduduk && dataPenduduk.perempuan != null ? String(dataPenduduk.perempuan) : '-');
            var valTotal = dataPenduduk && typeof dataPenduduk.total === 'number' ? dataPenduduk.total.toLocaleString('id-ID') : (dataPenduduk && dataPenduduk.total != null ? String(dataPenduduk.total) : '-');
            var popupContent = `
  <div style="
    font-family: 'Segoe UI', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: #333;
    padding: 8px 4px;
  ">
    <div style="
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 10px 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    ">
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <th align="left" style="padding: 4px 6px; color:#444;">Kode Wilayah</th>
          <td style="padding: 4px 6px; font-weight:500;">${feature.properties['KDEPUM'] || '-'}</td>
        </tr>
        <tr>
          <th align="left" style="padding: 4px 6px; color:#444;">Kelurahan</th>
          <td style="padding: 4px 6px;">${feature.properties['NAMOBJ'] || '-'}</td>
        </tr>
        <tr>
          <th align="left" style="padding: 4px 6px; color:#444;">Kecamatan</th>
          <td style="padding: 4px 6px;">${feature.properties['WADMKC'] || '-'}</td>
        </tr>
        <tr>
          <th align="left" style="padding: 4px 6px; color:#444;">Luas (Km²)</th>
          <td style="padding: 4px 6px;">${feature.properties['Luas_km2'] || '-'}</td>
        </tr>
        <tr>
          <th align="left" style="padding: 4px 6px; color:#444;">Laki-laki</th>
          <td style="padding: 4px 6px;">${valLaki}</td>
        </tr>
        <tr>
          <th align="left" style="padding: 4px 6px; color:#444;">Perempuan</th>
          <td style="padding: 4px 6px;">${valPerempuan}</td>
        </tr>
        <tr>
          <th align="left" style="padding: 4px 6px; color:#444;">Total Penduduk (Des 2025)</th>
          <td style="padding: 4px 6px; font-weight:500;">${valTotal}</td>
        </tr>
      </table>
      <div style="margin-top:6px; font-size:12px; color:#666;">
        Data penduduk per kelurahan, Desember 2025.
      </div>
      <div style="margin-top:10px; text-align:center;">
        ${feature.properties['Link_peta']
          ? `<a href="${feature.properties['Link_peta']}" target="_blank"
                style="display:inline-flex; align-items:center; gap:6px;
                       background-color:#0078A8; color:white;
                       padding:8px 14px; border-radius:6px;
                       text-decoration:none; font-weight:600;
                       transition:background 0.2s;">
                <span style="font-size:16px;">📄</span> Lihat Peta PDF
             </a>`
          : `<span style="color:#888;">Tidak tersedia</span>`
        }
      </div>
    </div>
  </div>`;
            return removeEmptyRowsFromPopupContent(popupContent, feature);
        }

        function pop_Petabatas_3(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    e.target.setStyle(baseStyle_Petabatas(e.target.feature));
                },
                mouseover: highlightFeature,
            });
            
            // Gunakan fungsi untuk bindPopup agar konten selalu dievaluasi saat popup dibuka
            layer.bindPopup(function(layer) {
                return generatePopupContent_Petabatas_3(layer.feature);
            }, { maxHeight: 400 });

            layer.on('popupopen', function(e) {
                var currentContent = generatePopupContent_Petabatas_3(e.target.feature);
                addClassToPopupIfMedia(currentContent, e.popup);
            });
        }

        function baseStyle_Petabatas(feature) {
            var s = style_Petabatas_3_0(feature);
            s.opacity = currentOpacity;
            s.fillOpacity = currentOpacity;
            return s;
        }

        function style_Petabatas_3_0(feature) {
            switch(String(feature.properties['WADMKC'])) {
                case 'Banyumanik':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(158,125,216,1.0)',
                interactive: true,
            }
                    break;
                case 'Candisari':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(233,61,213,1.0)',
                interactive: true,
            }
                    break;
                case 'Gajahmungkur':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(133,200,111,1.0)',
                interactive: true,
            }
                    break;
                case 'Gayamsari':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(58,231,208,1.0)',
                interactive: true,
            }
                    break;
                case 'Genuk':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(204,156,79,1.0)',
                interactive: true,
            }
                    break;
                case 'Gunungpati':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(32,35,218,1.0)',
                interactive: true,
            }
                    break;
                case 'Mijen':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(175,232,76,1.0)',
                interactive: true,
            }
                    break;
                case 'Ngaliyan':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(230,45,41,1.0)',
                interactive: true,
            }
                    break;
                case 'Pedurungan':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(157,27,205,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Barat':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(255,240,74,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Selatan':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(182,114,18,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Tengah':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(254,176,40,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Timur':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(212,212,32,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Utara':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(65,149,73,1.0)',
                interactive: true,
            }
                    break;
                case 'Tembalang':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(241,62,79,1.0)',
                interactive: true,
            }
                    break;
                case 'Tugu':
                    return {
                pane: 'pane_Petabatas_3',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(18,92,213,1.0)',
                interactive: true,
            }
                    break;
            }
        }
        map.createPane('pane_Petabatas_3');
        map.getPane('pane_Petabatas_3').style.zIndex = 403;
        map.getPane('pane_Petabatas_3').style['mix-blend-mode'] = 'normal';
        var layer_Petabatas_3 = new L.geoJson(json_Petabatas_3, {
            attribution: '',
            interactive: true,
            dataVar: 'json_Petabatas_3',
            layerName: 'layer_Petabatas_3',
            pane: 'pane_Petabatas_3',
            onEachFeature: pop_Petabatas_3,
            style: style_Petabatas_3_0,
        });
        bounds_group.addLayer(layer_Petabatas_3);
        map.addLayer(layer_Petabatas_3);
        layer_Petabatas_3.setStyle({opacity: currentOpacity, fillOpacity: currentOpacity});
   function pop_Kantor_Kelurahan_4(feature, layer) {
    layer.on({
        mouseout: function(e) {
            if (typeof e.target.setStyle === 'function') {
                e.target.setStyle({ weight: 1 });
            }
        },
        mouseover: highlightFeature,
    });

    // Buat konten popup sederhana
    var popupContent = '<table>' +
        '<tr><td>' + 
        (feature.properties['Popup'] ? autolinker.link(String(feature.properties['Popup'])) : '') +
        '</td></tr>' +
        '</table>';

    // Lindungi dari nilai kosong agar tidak error
    if (popupContent.trim() === '') popupContent = '<i>Tidak ada data</i>';

    // Bind popup ke layer
    layer.bindPopup(popupContent, { maxHeight: 400 });
}

        function style_Kantor_Kelurahan_4_0(feature) {
            switch(String(feature.properties['WADMKC'])) {
                case 'Banyumanik':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(42,213,85,1.0)',
                interactive: true,
            }
                    break;
                case 'Candisari':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(92,25,215,1.0)',
                interactive: true,
            }
                    break;
                case 'Gajahmungkur':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(202,44,79,1.0)',
                interactive: true,
            }
                    break;
                case 'Gayamsari':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(230,142,128,1.0)',
                interactive: true,
            }
                    break;
                case 'Genuk':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(203,174,28,1.0)',
                interactive: true,
            }
                    break;
                case 'Gunungpati':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(226,57,153,1.0)',
                interactive: true,
            }
                    break;
                case 'Mijen':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(151,228,84,1.0)',
                interactive: true,
            }
                    break;
                case 'Ngaliyan':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(209,31,200,1.0)',
                interactive: true,
            }
                    break;
                case 'Pedurungan':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(119,152,213,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Barat':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(202,151,103,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Selatan':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(48,218,26,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Tengah':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(169,202,24,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Timur':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(56,232,223,1.0)',
                interactive: true,
            }
                    break;
                case 'Semarang Utara':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(32,173,234,1.0)',
                interactive: true,
            }
                    break;
                case 'Tembalang':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(26,211,137,1.0)',
                interactive: true,
            }
                    break;
                case 'Tugu':
                    return {
                pane: 'pane_Kantor_Kelurahan_4',
                radius: 4.0,
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 1,
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(206,133,238,1.0)',
                interactive: true,
            }
                    break;
            }
        }
        map.createPane('pane_Kantor_Kelurahan_4');
        map.getPane('pane_Kantor_Kelurahan_4').style.zIndex = 404;
        map.getPane('pane_Kantor_Kelurahan_4').style['mix-blend-mode'] = 'normal';
        var layer_Kantor_Kelurahan_4 = new L.geoJson(json_Kantor_Kelurahan_4, {
            attribution: '',
            interactive: true,
            dataVar: 'json_Kantor_Kelurahan_4',
            layerName: 'layer_Kantor_Kelurahan_4',
            pane: 'pane_Kantor_Kelurahan_4',
            onEachFeature: pop_Kantor_Kelurahan_4,
            pointToLayer: function (feature, latlng) {
    var kecamatan = feature.properties['WADMKC']; // nama kecamatan
    var iconUrl;
    // Kelompok 1: tugu, gunungpati, gayamsari, ngaliyan
    if (['Tugu', 'Gunungpati', 'Gayamsari', 'Ngaliyan'].includes(kecamatan)) {
        iconUrl = 'https://raw.githubusercontent.com/magetanciti/magetanciti.github.io/main/images/home_3367739.png';
    }
    // Kelompok 2: mijen, semarang utara, gajahmungkur, genuk, semarang selatan, semarang timur, semarang barat
    else if (['Mijen', 'Semarang Utara', 'Gajahmungkur', 'Genuk', 'Semarang Selatan', 'Semarang Timur', 'Semarang Barat'].includes(kecamatan)) {
        iconUrl = 'https://raw.githubusercontent.com/magetanciti/magetanciti.github.io/main/images/gps_13803263.png';
    }
    // Kelompok 3: candisari, tembalang, banyumanik, pedurungan, semarang tengah
    else if (['Candisari', 'Tembalang', 'Banyumanik', 'Pedurungan', 'Semarang Tengah'].includes(kecamatan)) {
        iconUrl = 'https://raw.githubusercontent.com/magetanciti/magetanciti.github.io/main/images/navigator_13191947.png';
    }
    // Default jika tidak cocok
    else {
        iconUrl = 'https://raw.githubusercontent.com/magetanciti/magetanciti.github.io/main/images/navigator_13191947.png';
    }

    // Buat ikon Leaflet
    var customIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [32, 32],      // sesuaikan ukuran sesuai kebutuhan
        iconAnchor: [16, 32],    // titik bawah tengah
        popupAnchor: [0, -28]    // posisi popup
    });

    // Gunakan marker dengan ikon
    return L.marker(latlng, { icon: customIcon });
},
        });
        var cluster_Kantor_Kelurahan_4 = new L.MarkerClusterGroup({showCoverageOnHover: false,
            spiderfyDistanceMultiplier: 2});
        cluster_Kantor_Kelurahan_4.addLayer(layer_Kantor_Kelurahan_4);

        bounds_group.addLayer(layer_Kantor_Kelurahan_4);

        // --- LAYER TPS ---
        function pop_TPS(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    if (typeof e.target.setStyle === 'function') {
                        e.target.setStyle({ weight: 1 });
                    }
                },
                mouseover: highlightFeature,
            });
            var popupContent = '<table>\
                <tr><th scope="row">Nama TPS</th><td>' + (feature.properties['Name'] !== null ? autolinker.link(String(feature.properties['Name'])) : '') + '</td></tr>\
                <tr><th scope="row">Kecamatan</th><td>' + (feature.properties['Kecamatan'] !== null ? autolinker.link(String(feature.properties['Kecamatan'])) : '') + '</td></tr>\
                <tr><th scope="row">Kelurahan</th><td>' + (feature.properties['Kelurahan'] !== null ? autolinker.link(String(feature.properties['Kelurahan'])) : '') + '</td></tr>\
                <tr><th scope="row">Alamat</th><td>' + (feature.properties['Alamat'] !== null ? autolinker.link(String(feature.properties['Alamat'])) : '') + '</td></tr>\
            </table>';
            layer.bindPopup(popupContent, { maxHeight: 400 });
        }

        map.createPane('pane_TPS');
        map.getPane('pane_TPS').style.zIndex = 405;
        map.getPane('pane_TPS').style['mix-blend-mode'] = 'normal';
        
        var layer_TPS = new L.geoJson(json_TPS_KOTA_SEMARANG_2026, {
            attribution: '',
            interactive: true,
            dataVar: 'json_TPS_KOTA_SEMARANG_2026',
            layerName: 'layer_TPS',
            pane: 'pane_TPS',
            onEachFeature: pop_TPS,
            pointToLayer: function (feature, latlng) {
                var customIcon = L.icon({
                    iconUrl: 'images/custom_icon/garbage-trash-svgrepo-com.svg',
                    iconSize: [28, 28],
                    iconAnchor: [14, 28],
                    popupAnchor: [0, -26]
                });
                return L.marker(latlng, { icon: customIcon });
            },
        });
        
        var cluster_TPS = new L.MarkerClusterGroup({showCoverageOnHover: false, spiderfyDistanceMultiplier: 2});
        cluster_TPS.addLayer(layer_TPS);
        map.addLayer(cluster_TPS);
        bounds_group.addLayer(layer_TPS);

        // --- LAYER BATAS KECAMATAN ---
        function generatePopupContent_kecamatan(feature) {
            var WADMKC = feature.properties['WADMKC'] !== null ? String(feature.properties['WADMKC']) : '';
            return '<div style="padding: 5px;">\
                <h4 style="margin: 0 0 5px 0;">Kecamatan</h4>\
                <b>' + WADMKC + '</b>\
            </div>';
        }

        function pop_kecamatan(feature, layer) {
            layer.on({
                mouseout: function(e) {
                    e.target.setStyle(style_kecamatan(e.target.feature));
                },
                mouseover: highlightFeature,
            });
            var popupContent = generatePopupContent_kecamatan(feature);
            layer.bindPopup(popupContent, { maxHeight: 400 });
        }

        function style_kecamatan(feature) {
            var baseStyle = style_Petabatas_3_0(feature);
            if (baseStyle) {
                var s = Object.assign({}, baseStyle);
                s.pane = 'pane_kecamatan';
                s.weight = 3.0; // thicker border for kecamatan
                return s;
            }
            return {
                pane: 'pane_kecamatan',
                opacity: 1,
                color: 'rgba(35,35,35,1.0)',
                dashArray: '',
                lineCap: 'butt',
                lineJoin: 'miter',
                weight: 3.0, 
                fill: true,
                fillOpacity: 1,
                fillColor: 'rgba(150,150,150,1.0)',
                interactive: true,
            };
        }

        map.createPane('pane_kecamatan');
        map.getPane('pane_kecamatan').style.zIndex = 402; // Underneath Kelurahan boundaries (403)
        map.getPane('pane_kecamatan').style['mix-blend-mode'] = 'normal';
        
        var layer_kecamatan = new L.geoJson(json_kecamatan, {
            attribution: '',
            interactive: true,
            dataVar: 'json_kecamatan',
            layerName: 'layer_kecamatan',
            pane: 'pane_kecamatan',
            onEachFeature: pop_kecamatan,
            style: style_kecamatan,
        });
        
        map.addLayer(layer_kecamatan);
        bounds_group.addLayer(layer_kecamatan);

        setBounds();
       var searchControl = new L.Control.Search({
    layer: cluster_Kantor_Kelurahan_4,
    propertyName: 'Search',
    initial: false,
    hideMarkerOnCollapse: true,
    moveToLocation: function(latlng, title, map) {
        // Zoom otomatis ke hasil pencarian
        map.flyTo(latlng, 15, { duration: 1 });

        // Hapus highlight sebelumnya jika ada
        if (typeof highlightCircle !== 'undefined') {
            map.removeLayer(highlightCircle);
        }

        // Tambahkan lingkaran highlight baru
        highlightCircle = L.circleMarker(latlng, {
            radius: 10,
            color: "#FF0000",
            weight: 3,
            fillOpacity: 0.4
        }).addTo(map);
    }
});

// tambahkan kontrol pencarian ke peta
map.addControl(searchControl);
        if (typeof url === 'undefined') {
            document.getElementsByClassName('search-button')[0].className += ' fa fa-binoculars';
        } else {
            document.getElementsByClassName('search-button')[1].className += ' fa fa-binoculars';
        }
        resetLabels([layer_Petabatas_3]);
        map.on("zoomend", function(){
            resetLabels([layer_Petabatas_3]);
        });
        map.on("layeradd", function(){
            resetLabels([layer_Petabatas_3]);
        });
        map.on("layerremove", function(){
            resetLabels([layer_Petabatas_3]);
        });