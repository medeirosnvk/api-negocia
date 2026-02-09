<?php
session_start();
require_once 'CalculadoraAcordo.php';
require_once 'ChatEngine.php';
header('Content-Type: application/json');

$apiKey = 's2_33e5d129dcd84178afca14a2f05f954a';
$jsonInput = '{
    "dividas": [{"vencimento": "2024-05-01", "valor": 100}, {"vencimento": "2024-06-01", "valor": 100}, {"vencimento": "2024-07-01", "valor": 100}, {"vencimento": "2024-08-01", "valor": 100}, {"vencimento": "2024-09-01", "valor": 100}],
    "parametros": [{"juros": 3, "multa": 2, "honorarios": 10, "plano_maximo": 10, "vencimento_maximo": "2026-04-17","dias_entrada": 5,"data_entrada_maxima": "2026-01-23"}],
    "ofertas": [{"tarifa_boleto": 11.90}]
}';

$engine = new ChatEngine($jsonInput, $apiKey);
if (isset($_SESSION['chat_history'])) $engine->setHistorico($_SESSION['chat_history']);

$input = json_decode(file_get_contents('php://input'), true);
$resultado = $engine->enviarMensagem($input['mensagem'] ?? '');
$_SESSION['chat_history'] = $engine->historico;

if (isset($_SESSION['cadencia'])) {
    $engine->setCadencia($_SESSION['cadencia']);
}
$_SESSION['cadencia'] = $engine->getCadencia();

echo json_encode($resultado);
