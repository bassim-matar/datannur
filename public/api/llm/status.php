<?php
/**
 * LLM Status Endpoint
 * Returns public configuration (Turnstile siteKey) and service status
 * GET /api/llm/status.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$configFile = __DIR__ . '/../../data/llm-web.config.json';

if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'LLM config not found', 'enabled' => false]);
    exit;
}

$config = json_decode(file_get_contents($configFile), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid config file', 'enabled' => false]);
    exit;
}

$siteKey = $config['turnstile']['siteKey'] ?? null;
$hasInfomaniak = !empty($config['infomaniak']['apiKey']) && !empty($config['infomaniak']['productId']);

echo json_encode([
    'enabled' => $hasInfomaniak && !empty($siteKey),
    'siteKey' => $siteKey,
]);
