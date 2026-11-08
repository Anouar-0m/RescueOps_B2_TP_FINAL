<?php
declare(strict_types=1);
require_once __DIR__ . '/../src/php/MissionCard.php';

function checkSame(mixed $expected, mixed $actual, string $label): void
{
    if ($expected !== $actual) {
        throw new RuntimeException($label . ': attendu ' . var_export($expected, true) . ', obtenu ' . var_export($actual, true));
    }
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
echo 'Resultat PHP : 3 verifications conformes' . PHP_EOL;
