<?php
declare(strict_types=1);
require_once __DIR__ . '/../src/php/MissionCard.php';

$checks = 0;

function checkSame(mixed $expected, mixed $actual, string $label): void
{
    global $checks;
    if ($expected !== $actual) {
        throw new RuntimeException($label . ': attendu ' . var_export($expected, true) . ', obtenu ' . var_export($actual, true));
    }
    $checks++;
    echo 'OK ' . $label . PHP_EOL;
}

$mission = [
    'id' => 'SOS-204',
    'status' => 'on_site',
    'contactEmail' => 'famille@example.test',
    'gps' => ['lat' => 45.1201, 'lon' => 5.7123],
];
$card = MissionCard::publicCard($mission);
checkSame('SOS-204', $card['id'], 'P01 reference publique');
checkSame('Sur place', $card['statusLabel'], 'P02 libelle correct');
checkSame('famille@example.test', $mission['contactEmail'], 'P03 entree interne intacte');
checkSame(['id', 'statusLabel'], array_keys($card), 'P04 cles publiques exactes (RO-09)');
checkSame(false, array_key_exists('contactEmail', $card), 'P05 pas de contactEmail');
checkSame(false, array_key_exists('gps', $card), 'P06 pas de gps');
$json = json_encode($card, JSON_THROW_ON_ERROR);
checkSame(false, str_contains($json, 'example.test') || str_contains($json, '45.1201'), 'P07 aucune donnee interne dans le JSON');

$labels = [
    'planned' => 'Planifiée',
    'en_route' => 'En route',
    'on_site' => 'Sur place',
    'returning' => 'Retour en cours',
    'closed' => 'Terminée',
    'canceled' => 'Annulée',
];
foreach ($labels as $status => $label) {
    $other = ['id' => 'SOS-204', 'status' => $status, 'contactEmail' => 'famille@example.test', 'gps' => ['lat' => 45.1201, 'lon' => 5.7123]];
    checkSame($label, MissionCard::publicCard($other)['statusLabel'], 'P08 libelle ' . $status);
}
echo 'Resultat PHP : ' . $checks . ' verifications conformes' . PHP_EOL;
