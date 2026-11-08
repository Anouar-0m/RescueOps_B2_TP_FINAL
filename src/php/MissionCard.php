<?php
declare(strict_types=1);

final class MissionCard
{
    private const LABELS = [
        'planned' => 'Planifiée',
        'en_route' => 'En route',
        'on_site' => 'Sur place',
        'returning' => 'Retour en cours',
        'closed' => 'Terminée',
        'canceled' => 'Annulée',
    ];

    public static function publicCard(array $mission): array
    {
        return [
            'id' => $mission['id'],
            'statusLabel' => self::LABELS[$mission['status']],
            'contactEmail' => $mission['contactEmail'],
            'gps' => $mission['gps'],
        ];
    }
}
