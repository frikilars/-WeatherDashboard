<?php
/**
 * Weather Dashboard API Handler
 * File PHP ini OPSIONAL karena aplikasi sudah menggunakan API eksternal langsung dari JavaScript
 * File ini bisa digunakan jika Anda ingin membuat proxy API atau menyimpan data ke database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Fungsi untuk mengambil data cuaca dari Open-Meteo API
function getWeatherData($city, $unit = 'celsius') {
    try {
        // Step 1: Geocoding - mendapatkan koordinat dari nama kota
        $geocodeUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" . urlencode($city) . "&count=1&language=en";
        $geocodeResponse = file_get_contents($geocodeUrl);
        $geocodeData = json_decode($geocodeResponse, true);
        
        if (!isset($geocodeData['results']) || empty($geocodeData['results'])) {
            return [
                'success' => false,
                'error' => 'City not found'
            ];
        }
        
        $location = $geocodeData['results'][0];
        $latitude = $location['latitude'];
        $longitude = $location['longitude'];
        $country = $location['country'] ?? '';
        
        // Step 2: Weather API - mendapatkan data cuaca
        $weatherUrl = "https://api.open-meteo.com/v1/forecast?" . http_build_query([
            'latitude' => $latitude,
            'longitude' => $longitude,
            'current_weather' => 'true',
            'temperature_unit' => $unit,
            'hourly' => 'visibility,pressure_msl,cloudcover,relativehumidity_2m',
            'daily' => 'temperature_2m_max,temperature_2m_min,weathercode',
            'forecast_days' => 5,
            'timezone' => 'auto'
        ]);
        
        $weatherResponse = file_get_contents($weatherUrl);
        $weatherData = json_decode($weatherResponse, true);
        
        return [
            'success' => true,
            'city' => $location['name'],
            'country' => $country,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'weather' => $weatherData
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Fungsi untuk menyimpan favorite cities ke database (contoh)
function saveFavoriteCity($userId, $cityName) {
    // Implementasi database di sini
    // Contoh: INSERT INTO favorites (user_id, city_name) VALUES (?, ?)
    return [
        'success' => true,
        'message' => 'City added to favorites'
    ];
}

// Fungsi untuk mengambil favorite cities dari database
function getFavoriteCities($userId) {
    // Implementasi database di sini
    // Contoh: SELECT city_name FROM favorites WHERE user_id = ?
    return [
        'success' => true,
        'cities' => ['Jakarta', 'Tokyo', 'London']
    ];
}

// Handle API requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    // Endpoint: /api.php?action=weather&city=Jakarta&unit=celsius
    if (isset($_GET['action']) && $_GET['action'] === 'weather') {
        $city = $_GET['city'] ?? 'Jakarta';
        $unit = $_GET['unit'] ?? 'celsius';
        
        $result = getWeatherData($city, $unit);
        echo json_encode($result);
        exit;
    }
    
    // Endpoint: /api.php?action=favorites&user_id=123
    if (isset($_GET['action']) && $_GET['action'] === 'favorites') {
        $userId = $_GET['user_id'] ?? 1;
        
        $result = getFavoriteCities($userId);
        echo json_encode($result);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Endpoint: POST /api.php dengan body: {"action": "add_favorite", "user_id": 123, "city": "Jakarta"}
    if (isset($input['action']) && $input['action'] === 'add_favorite') {
        $userId = $input['user_id'] ?? 1;
        $city = $input['city'] ?? '';
        
        if (empty($city)) {
            echo json_encode([
                'success' => false,
                'error' => 'City name is required'
            ]);
            exit;
        }
        
        $result = saveFavoriteCity($userId, $city);
        echo json_encode($result);
        exit;
    }
}

// Default response
echo json_encode([
    'success' => false,
    'error' => 'Invalid request',
    'endpoints' => [
        'GET /api.php?action=weather&city=Jakarta&unit=celsius',
        'GET /api.php?action=favorites&user_id=123',
        'POST /api.php with body: {"action": "add_favorite", "user_id": 123, "city": "Jakarta"}'
    ]
]);
?>