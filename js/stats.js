(function() {
  function parseKontainer(val) {
    if (!val || val === '-') return 0;
    var m = val.match(/^\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function buildStats() {
    var tps = json_tps_kota_semarang_mei_2026.features;
    var pop = data_penduduk.features;

    var tpsPerKec = {}, kontPerKec = {}, tpsPerKel = {};
    tps.forEach(function(f) {
      var kec = f.properties.Kecamatan;
      var kel = f.properties.Kelurahan;
      var k = parseKontainer(f.properties.Kontainer);
      tpsPerKec[kec] = (tpsPerKec[kec] || 0) + 1;
      kontPerKec[kec] = (kontPerKec[kec] || 0) + k;
      var key = kec + '|' + kel;
      tpsPerKel[key] = (tpsPerKel[key] || 0) + 1;
    });

    var popPerKec = {};
    pop.forEach(function(f) {
      var kec = f.properties.WADMKC;
      var total = f.properties.Total || 0;
      popPerKec[kec] = (popPerKec[kec] || 0) + total;
    });

    var kecList = Object.keys(tpsPerKec).sort();
    var maxTps = 0, maxKont = 0;
    kecList.forEach(function(k) {
      if (tpsPerKec[k] > maxTps) maxTps = tpsPerKec[k];
      if (kontPerKec[k] > maxKont) maxKont = kontPerKec[k];
    });

    var kelEntries = Object.keys(tpsPerKel).map(function(k) {
      var parts = k.split('|');
      return { kec: parts[0], kel: parts[1], count: tpsPerKel[k] };
    });
    kelEntries.sort(function(a, b) { return b.count - a.count; });

    var totalTps = tps.length;
    var totalKont = 0;
    tps.forEach(function(f) { totalKont += parseKontainer(f.properties.Kontainer); });

    function bar(pct) {
      return '<div class="bar-wrap"><div class="bar" style="width:' + Math.max(pct, 2) + '%"></div></div>';
    }

    function rows1() {
      var h = '';
      kecList.forEach(function(k) {
        var c = tpsPerKec[k];
        var pct = (c / totalTps) * 100;
        h += '<tr><td>' + k + '</td><td class="num-col">' + c + '</td><td><div class="bar-cell">' + bar(pct) + '<span class="bar-label">' + pct.toFixed(1) + '%</span></div></td></tr>';
      });
      return h;
    }

    function rows2() {
      var h = '';
      kecList.forEach(function(k) {
        var c = kontPerKec[k];
        var pct = totalKont > 0 ? (c / totalKont) * 100 : 0;
        h += '<tr><td>' + k + '</td><td class="num-col">' + c + '</td><td><div class="bar-cell">' + bar(pct) + '<span class="bar-label">' + pct.toFixed(1) + '%</span></div></td></tr>';
      });
      return h;
    }

    function rows3() {
      var h = '';
      kecList.forEach(function(k) {
        var t = tpsPerKec[k];
        var ktot = kontPerKec[k];
        var avg = t > 0 ? (ktot / t).toFixed(1) : '0';
        h += '<tr><td>' + k + '</td><td class="num-col">' + t + '</td><td class="num-col">' + ktot + '</td><td class="num-col">' + avg + '</td></tr>';
      });
      return h;
    }

    function rows4() {
      var h = '';
      var ratios = [];
      kecList.forEach(function(k) {
        var t = tpsPerKec[k];
        var p = popPerKec[k] || 0;
        var r = t > 0 ? p / t : 0;
        ratios.push({ kec: k, tps: t, pop: p, ratio: r });
      });
      var maxRatio = 0;
      ratios.forEach(function(r) { if (r.ratio > maxRatio) maxRatio = r.ratio; });
      ratios.forEach(function(r) {
        var pct = maxRatio > 0 ? (r.ratio / maxRatio) * 100 : 0;
        var ratioLabel = r.tps > 0 ? Math.round(r.ratio) : '-';
        h += '<tr><td>' + r.kec + '</td><td class="num-col">' + r.tps + '</td><td class="num-col">' + r.pop.toLocaleString() + '</td><td class="num-col">' + ratioLabel + '</td><td><div class="bar-cell">' + bar(pct) + '<span class="bar-label">' + ratioLabel + '</span></div></td></tr>';
      });
      return h;
    }

    function rows5() {
      var h = '';
      kelEntries.forEach(function(e) {
        var pct = (e.count / totalTps) * 100;
        h += '<tr><td>' + e.kec + '</td><td>' + e.kel + '</td><td class="num-col">' + e.count + '</td><td><div class="bar-cell">' + bar(pct) + '<span class="bar-label">' + pct.toFixed(1) + '%</span></div></td></tr>';
      });
      return h;
    }

    var html =
      '<div class="stats-summary">' +
        '<div class="stats-card"><div class="num">' + totalTps + '</div><div class="label">Total TPS</div></div>' +
        '<div class="stats-card"><div class="num">' + totalKont + '</div><div class="label">Total Kontainer</div></div>' +
        '<div class="stats-card"><div class="num">' + kecList.length + '</div><div class="label">Kecamatan</div></div>' +
        '<div class="stats-card"><div class="num">' + kelEntries.length + '</div><div class="label">Kelurahan</div></div>' +
      '</div>' +

      '<div class="stats-section">' +
        '<h3>1. Jumlah TPS per Kecamatan</h3>' +
        '<table class="stats-table"><thead><tr><th>Kecamatan</th><th>Jumlah TPS</th><th>Visual</th></tr></thead><tbody>' + rows1() + '</tbody></table>' +
      '</div>' +

      '<div class="stats-section">' +
        '<h3>2. Jumlah Kontainer per Kecamatan</h3>' +
        '<table class="stats-table"><thead><tr><th>Kecamatan</th><th>Total Kontainer</th><th>Visual</th></tr></thead><tbody>' + rows2() + '</tbody></table>' +
      '</div>' +

      '<div class="stats-section">' +
        '<h3>3. Rata-rata Kontainer per TPS</h3>' +
        '<table class="stats-table"><thead><tr><th>Kecamatan</th><th>Jumlah TPS</th><th>Total Kontainer</th><th>Rata-rata</th></tr></thead><tbody>' + rows3() + '</tbody></table>' +
      '</div>' +

      '<div class="stats-section">' +
        '<h3>4. Perbandingan TPS dengan Jumlah Penduduk</h3>' +
        '<table class="stats-table"><thead><tr><th>Kecamatan</th><th>TPS</th><th>Penduduk</th><th>Jiwa/TPS</th><th>Visual Rasio (&#8593; = lebih padat)</th></tr></thead><tbody>' + rows4() + '</tbody></table>' +
      '</div>' +

      '<div class="stats-section">' +
        '<h3>5. Sebaran TPS per Kelurahan</h3>' +
        '<div class="stats-scroll"><table class="stats-table"><thead><tr><th>Kecamatan</th><th>Kelurahan</th><th>TPS</th><th>% dari Total</th></tr></thead><tbody>' + rows5() + '</tbody></table></div>' +
      '</div>';

    document.getElementById('statsBody').innerHTML = html;
  }

  document.getElementById('btnStats').addEventListener('click', function() {
    document.getElementById('statsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    buildStats();
  });

  document.getElementById('statsClose').addEventListener('click', function() {
    document.getElementById('statsModal').style.display = 'none';
    document.body.style.overflow = '';
  });

  window.addEventListener('click', function(e) {
    if (e.target === document.getElementById('statsModal')) {
      document.getElementById('statsModal').style.display = 'none';
      document.body.style.overflow = '';
    }
  });
})();
