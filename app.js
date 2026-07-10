// 1. Service Worker Registrierung für Offline-PWA-Funktionalität
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker erfolgreich registriert', reg))
            .catch(err => console.error('Service Worker Fehler', err));
    });
}

// 2. Deine bereitgestellten Beispieldaten (repariert und geschlossen)
const sampleData = {
    "phoneTimestamp": 1783672353329,
    "deviceId": "1534BD3C",
    "recordingName": "PolarRecording1_20260710_103224",
    "dataType": "ECG",
    "data": [
        {"voltage": -125, "timeStamp": 599623232451567616},
        {"voltage": -133, "timeStamp": 599623232459259904},
        {"voltage": -128, "timeStamp": 599623232466952192},
        {"voltage": -111, "timeStamp": 599623232474644480},
        {"voltage": -96,  "timeStamp": 599623232482336896},
        {"voltage": -89,  "timeStamp": 599623232490029184},
        {"voltage": -75,  "timeStamp": 599623232497721472},
        {"voltage": -77,  "timeStamp": 599623232505413760},
        {"voltage": -89,  "timeStamp": 599623232513106048},
        {"voltage": -79,  "timeStamp": 599623232520798336},
        {"voltage": -75,  "timeStamp": 599623232528490752},
        {"voltage": -82,  "timeStamp": 599623232536183040}
    ]
};

// 3. ECharts Instanz initialisieren
const chartDom = document.getElementById('chart-container');
const myChart = echarts.init(chartDom);

function renderECG(jsonData) {
    if (!jsonData || !jsonData.data || jsonData.data.length === 0) return;

    // Metadaten setzen
    document.getElementById('meta-device').textContent = jsonData.deviceId || 'Unbekannt';
    document.getElementById('meta-name').textContent = jsonData.recordingName || 'Unbekannt';
    document.getElementById('meta-type').textContent = jsonData.dataType || 'Unbekannt';
    
    const date = new Date(jsonData.phoneTimestamp);
    document.getElementById('meta-time').textContent = date.toLocaleString('de-DE');

    // Daten transformieren: Relative Millisekunden berechnen
    const firstTs = jsonData.data[0].timeStamp;
    const chartData = jsonData.data.map(item => {
        const relativeMs = (item.timeStamp - firstTs) / 1000000; // von Nanosekunden zu Millisekunden
        return [relativeMs, item.voltage];
    });

    // ECharts Optionen festlegen
    const option = {
        title: {
            text: 'EKG Signalverlauf',
            left: 'center',
            textStyle: { color: '#2c3e50', fontSize: 18 }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                let p = params[0];
                return `<b>Zeit:</b> ${p.value[0].toFixed(1)} ms<br/><b>Spannung:</b> ${p.value[1]} µV`;
            }
        },
        grid: {
            left: '7%',
            right: '5%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: 'Zeit (ms)',
            nameLocation: 'middle',
            nameGap: 30,
            splitLine: { show: true, lineStyle: { type: 'dashed', color: '#e0e0e0' } }
        },
        yAxis: {
            type: 'value',
            name: 'Spannung (µV)',
            splitLine: { show: true, lineStyle: { type: 'solid', color: '#e0e0e0' } }
        },
        dataZoom: [
            { type: 'inside', start: 0, end: 100 }, // Zoomen mit Mausrad/Touchgeste
            { type: 'slider', start: 0, end: 100, bottom: 10 } // Schieberegler unten
        ],
        series: [{
            name: 'Spannung',
            type: 'line',
            data: chartData,
            showSymbol: chartData.length < 50,
            smooth: true,
            itemStyle: { color: '#ff4d4f' },
            lineStyle: { width: 2 }
        }]
    };

    myChart.setOption(option);
}

// 4. Funktion zur Reparatur von abgeschnittenen JSON-Strings
function tryRepairJSON(rawText) {
    rawText = rawText.trim();
    
    // Falls das JSON nicht regulär schließt
    if (!rawText.endsWith('}')) {
        // 1. Suche das letzte valide, komplett abgeschlossene Daten-Objekt im Array
        let lastValidObjIndex = rawText.lastIndexOf('}');
        
        if (lastValidObjIndex !== -1) {
            // Schneide alles nach dem letzten gesunden Objekt-Ende ab
            rawText = rawText.substring(0, lastValidObjIndex + 1);
            // Schließe das Array und das Hauptobjekt sauber ab
            rawText += ']}';
        } else {
            // Falls gar kein Objekt schließt, versuchen wir zumindest die Klammern zu retten
            rawText += ']}';
        }
    }
    
    return JSON.parse(rawText);
}

            // Entferne eventuell übrig gebliebene Kommas am Ende
            rawText = rawText.replace(/,\s*$/, "");
            // Schließe das Array und das Hauptobjekt
            rawText += ']}';
        } else {
            rawText += '}';
        }
    }
    return JSON.parse(rawText);
}

// 5. Event Listener für Datei-Upload
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const parsedData = tryRepairJSON(evt.target.result);
            renderECG(parsedData);
        } catch (err) {
            alert('Fehler beim Parsen der JSON-Datei. Auch ein Reparaturversuch schlug fehl.');
            console.error(err);
        }
    };
    reader.readAsText(file);
});

// Event Listener für den Sample-Button
document.getElementById('btn-sample').addEventListener('click', () => {
    renderECG(sampleData);
});

// Direkt beim Start Beispieldaten laden
renderECG(sampleData);

// Responsive Anpassung bei Skalierung des Browserfensters
window.addEventListener('resize', () => {
    myChart.resize();
});
