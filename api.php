<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Ambil parameter dari request
$city = isset($_GET['city']) ? trim($_GET['city']) : '';
$lat  = isset($_GET['lat'])  ? trim($_GET['lat'])  : '';
$lon  = isset($_GET['lon'])  ? trim($_GET['lon'])  : '';

// Jika request menggunakan lat & lon → langsung panggil weather API
if (!empty($lat) && !empty($lon)) {
    echo json_encode(getWeatherData($lat, $lon));
    exit;
}

// Jika city tidak diisi
if (empty($city)) {
    echo json_encode(['error' => 'City not provided']);
    exit;
}

$cityLower = strtolower($city);

// ==== PANGGIL API GEOCODING ====
$geocodeUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" . urlencode($city) . "&count=10&language=id&format=json";
$geocodeJson = file_get_contents($geocodeUrl);
$geocodeData = json_decode($geocodeJson, true);

// Jika tidak ada hasil
if (!isset($geocodeData['results']) || count($geocodeData['results']) === 0) {
    echo json_encode(['error' => 'City not found']);
    exit;
}

// ==== FILTER AGAR "JAKARTA" TIDAK MENJADI SUNDA KELAPA ====
// feature_code untuk kota:
// PPLC = ibu kota negara
// PPLA = ibu kota provinsi / daerah administratif
// PPLA2/3/4 = kota besar & kecamatan

$preferredCodes = ['PPLC', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4'];

$chosen = null;

// Utamakan hasil dengan nama sama persis dan tipe kota
foreach ($geocodeData['results'] as $r) {
    if (strtolower($r['name']) === $cityLower) {
        if (isset($r['feature_code']) && in_array($r['feature_code'], $preferredCodes)) {
            $chosen = $r;
            break;
        }
    }
}

// Jika tidak ketemu match sempurna → cari kota terdekat
if (!$chosen) {
    foreach ($geocodeData['results'] as $r) {
        if (isset($r['feature_code']) && in_array($r['feature_code'], $preferredCodes)) {
            $chosen = $r;
            break;
        }
    }
}

// Kalau masih tidak ada (sangat jarang) → fallback index pertama
if (!$chosen) {
    $chosen = $geocodeData['results'][0];
}

// ==== Ambil latitude & longitude final ====
$lat = $chosen['latitude'];
$lon = $chosen['longitude'];

// Ambil data cuaca
$weather = getWeatherData($lat, $lon);

// Tambahkan info lokasi yang benar
$weather['location_name'] = $chosen['name'];
$weather['country'] = $chosen['country'];

echo json_encode($weather);


// ===========================
// FUNCTION AMBIL CUACA
// ===========================
function getWeatherData($lat, $lon) {
    $url = "https://api.open-meteo.com/v1/forecast?"
        . "latitude={$lat}&longitude={$lon}"
        . "&current=temperature_2m,wind_speed_10m,relative_humidity_2m"
        . "&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
        . "&daily=temperature_2m_max,temperature_2m_min"
        . "&timezone=auto";

    $json = file_get_contents($url);
    return json_decode($json, true);
}
?>
