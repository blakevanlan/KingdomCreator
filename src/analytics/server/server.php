<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Dashboard-Token');
header('X-Content-Type-Options: nosniff');

function respond($status, $data) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function requireDashboardAuth($adminToken) {
    $providedToken = $_SERVER['HTTP_X_DASHBOARD_TOKEN'] ?? '';
    if (!$adminToken || !$providedToken || !hash_equals($adminToken, $providedToken)) {
        respond($adminToken ? 401 : 503, [
            'error' => $adminToken
                ? 'Jeton du tableau de bord invalide.'
                : 'Le serveur doit configurer ANALYTICS_DASHBOARD_TOKEN.',
        ]);
    }
}

function incrementAnalyticsCount(&$counts, $label) {
    if (is_bool($label)) {
        $label = $label ? 'Oui' : 'Non';
    } elseif (is_int($label) || is_float($label)) {
        $label = (string)$label;
    }

    if (!is_string($label) || $label === '') {
        return;
    }
    $counts[$label] = ($counts[$label] ?? 0) + 1;
}

function getRequestCountry() {
    $remoteAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    if (!is_string($remoteAddress) ||
        filter_var($remoteAddress, FILTER_VALIDATE_IP) === false) {
        return 'unknown';
    }

    $geoIpDirectory = dirname(__DIR__, 2) . '/geoip-reader';
    $autoloadPath = $geoIpDirectory . '/vendor/autoload.php';
    $databasePath = $geoIpDirectory . '/GeoLite2-Country.mmdb';
    if (!is_readable($autoloadPath) || !is_readable($databasePath)) {
        error_log('GeoIP lookup unavailable: reader autoload or country database is missing.');
        respond(500, ['error' => 'La base GeoIP ou son lecteur est inaccessible.']);
    }

    require_once $autoloadPath;
    static $reader = null;

    try {
        if ($reader === null) {
            $reader = new \GeoIp2\Database\Reader($databasePath);
        }
        $countryCode = $reader->country($remoteAddress)->country->isoCode;
    } catch (\GeoIp2\Exception\AddressNotFoundException $e) {
        return 'unknown';
    } catch (\MaxMind\Db\Reader\InvalidDatabaseException |
        \InvalidArgumentException |
        \RuntimeException |
        \UnexpectedValueException |
        \BadMethodCallException $e) {
        error_log('GeoIP lookup failed: ' . $e->getMessage());
        respond(500, ['error' => 'La recherche GeoIP a échoué.']);
    }

    return is_string($countryCode) && preg_match('/^[A-Z]{2}$/', $countryCode)
        ? $countryCode
        : 'unknown';
}

function decodeLegacyKingdom($serializedKingdom) {
    if (!is_array($serializedKingdom)) {
        return null;
    }

    $kingdom = [];
    foreach ([
        'supply', 'events', 'landmarks', 'projects', 'ways',
        'boons', 'traits', 'ally', 'prophecy',
    ] as $category) {
        $value = $serializedKingdom[$category] ?? '';
        $kingdom[$category] = is_string($value) && $value !== ''
            ? explode(',', $value)
            : [];
    }
    $kingdom['specialSupply'] = [];
    foreach (['bane', 'ferryman', 'riverboat'] as $category) {
        $value = $serializedKingdom[$category] ?? '';
        if (is_string($value) && $value !== '') {
            $kingdom['specialSupply'][$category] = explode(',', $value);
        }
    }
    return $kingdom;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$databaseDirectory = __DIR__ . '/databases';
if (!is_dir($databaseDirectory) && !mkdir($databaseDirectory, 0755, true) && !is_dir($databaseDirectory)) {
    respond(500, ['error' => 'Impossible de créer le répertoire des bases de données.']);
}

if (isset($_GET['listSources'])) {
    $sources = [];
    foreach (scandir($databaseDirectory) as $filename) {
        if (pathinfo($filename, PATHINFO_EXTENSION) === 'db' &&
            preg_match('/^[A-Za-z0-9._-]+\.db$/', $filename) &&
            is_file($databaseDirectory . '/' . $filename)) {
            $sources[] = pathinfo($filename, PATHINFO_FILENAME);
        }
    }
    respond(200, $sources);
}

$source = $_GET['source'] ?? '';
if (!is_string($source) || !preg_match('/^[A-Za-z0-9._-]{1,253}$/', $source) || $source === '.' || $source === '..') {
    respond(400, ['error' => 'Le paramètre "source" est invalide ou absent.']);
}

$adminToken = getenv('ANALYTICS_DASHBOARD_TOKEN');
if (!$adminToken && is_file(__DIR__ . '/server-config.php')) {
    $serverConfiguration = require __DIR__ . '/server-config.php';
    $adminToken = is_array($serverConfiguration)
        ? ($serverConfiguration['dashboardToken'] ?? '')
        : '';
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireDashboardAuth($adminToken);
}

try {
    $db = new PDO('sqlite:' . $databaseDirectory . '/' . $source . '.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("
        CREATE TABLE IF NOT EXISTS RequestLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            eventOrError TEXT NOT NULL,
            eventType TEXT NOT NULL,
            params TEXT,
            sessionId TEXT,
            clientContext TEXT
        )
    ");
    $columns = $db->query('PRAGMA table_info(RequestLog)')->fetchAll(PDO::FETCH_COLUMN, 1);
    if (!in_array('sessionId', $columns, true)) {
        $db->exec('ALTER TABLE RequestLog ADD COLUMN sessionId TEXT');
    }
    if (!in_array('clientContext', $columns, true)) {
        $db->exec('ALTER TABLE RequestLog ADD COLUMN clientContext TEXT');
    }
} catch (Exception $e) {
    error_log('Analytics database connection failed: ' . $e->getMessage());
    respond(500, ['error' => 'Erreur de connexion à la base de données.']);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (strlen($rawInput) > 65536) {
        respond(413, ['error' => 'La requête dépasse la taille maximale autorisée.']);
    }
    $input = json_decode($rawInput, true);
    if (is_array($input) && isset($input['action'])) {
        requireDashboardAuth($adminToken);

        try {
            if ($input['action'] === 'clear') {
                $deletedCount = $db->exec('DELETE FROM RequestLog');
                respond(200, [
                    'message' => 'Toutes les données de cette base ont été supprimées.',
                    'deletedCount' => $deletedCount,
                ]);
            }

            if ($input['action'] === 'purge-before') {
                $cutoffDate = $input['date'] ?? '';
                $date = is_string($cutoffDate)
                    ? DateTimeImmutable::createFromFormat('!Y-m-d', $cutoffDate)
                    : false;
                $dateErrors = DateTimeImmutable::getLastErrors();
                if (!$date ||
                    ($dateErrors !== false && ($dateErrors['warning_count'] || $dateErrors['error_count'])) ||
                    $date->format('Y-m-d') !== $cutoffDate) {
                    respond(400, ['error' => 'La date doit respecter le format AAAA-MM-JJ.']);
                }

                $endExclusive = $date->modify('+1 day')->format('Y-m-d') . ' 00:00:00';
                $stmt = $db->prepare('DELETE FROM RequestLog WHERE date < :endExclusive');
                $stmt->execute([':endExclusive' => $endExclusive]);
                respond(200, [
                    'message' => 'Les données jusqu’à cette date incluse ont été supprimées.',
                    'deletedCount' => $stmt->rowCount(),
                    'date' => $cutoffDate,
                ]);
            }

            if ($input['action'] === 'delete-logs') {
                $ids = $input['ids'] ?? null;
                if (!is_array($ids) || count($ids) < 1 || count($ids) > 1000) {
                    respond(400, ['error' => 'Sélectionnez entre 1 et 1000 lignes à supprimer.']);
                }
                foreach ($ids as $id) {
                    if (!is_int($id) || $id < 1) {
                        respond(400, ['error' => 'La sélection contient un identifiant invalide.']);
                    }
                }
                $ids = array_values(array_unique($ids));

                $deletedCount = 0;
                foreach (array_chunk($ids, 500) as $idBatch) {
                    $placeholders = implode(',', array_fill(0, count($idBatch), '?'));
                    $stmt = $db->prepare("DELETE FROM RequestLog WHERE id IN ($placeholders)");
                    $stmt->execute($idBatch);
                    $deletedCount += $stmt->rowCount();
                }
                respond(200, [
                    'message' => 'Les lignes sélectionnées ont été supprimées.',
                    'deletedCount' => $deletedCount,
                ]);
            }

            respond(400, ['error' => 'Action de maintenance inconnue.']);
        } catch (Exception $e) {
            error_log('Analytics data maintenance failed: ' . $e->getMessage());
            respond(500, ['error' => 'Erreur lors de la suppression des données.']);
        }
    }

    if (!is_array($input) ||
        !isset($input['eventOrError'], $input['eventType']) ||
        !array_key_exists('params', $input) ||
        !is_string($input['eventOrError']) ||
        !is_string($input['eventType']) ||
        (isset($input['sessionId']) &&
            (!is_string($input['sessionId']) ||
                strlen($input['sessionId']) > 64 ||
                !preg_match('/^[A-Fa-f0-9-]+$/', $input['sessionId']))) ||
        strlen($input['eventOrError']) > 32 ||
        strlen($input['eventType']) > 80) {
        respond(400, ['error' => 'Données d’événement invalides.']);
    }

    $paramsData = $input['params'];
    if (!is_array($paramsData)) {
        $paramsData = ['data' => $paramsData];
    }
    $clientContext = $input['clientContext'] ?? [];
    if (!is_array($clientContext)) {
        respond(400, ['error' => 'Le contexte client est invalide.']);
    }
    if (!array_key_exists('clientContext', $input)) {
        foreach (['browser', 'device'] as $contextKey) {
            if (isset($paramsData[$contextKey])) {
                $clientContext[$contextKey] = $paramsData[$contextKey];
            }
        }
    }
    foreach (['browser', 'device'] as $contextKey) {
        if (isset($clientContext[$contextKey]) &&
            (!is_string($clientContext[$contextKey]) || strlen($clientContext[$contextKey]) > 80)) {
            respond(400, ['error' => 'Le contexte client contient une valeur invalide.']);
        }
        unset($paramsData[$contextKey]);
    }
    unset($clientContext['country'], $clientContext['ip']);
    unset($paramsData['country'], $paramsData['ip']);
    $clientContext['country'] = getRequestCountry();

    $params = json_encode($paramsData);
    if ($params === false) {
        respond(400, ['error' => 'Les paramètres ne peuvent pas être encodés en JSON.']);
    }
    $clientContextJson = json_encode($clientContext);
    if ($clientContextJson === false || strlen($clientContextJson) > 8192) {
        respond(400, ['error' => 'Le contexte client ne peut pas être encodé ou dépasse la taille maximale.']);
    }

    try {
        $stmt = $db->prepare(
            'INSERT INTO RequestLog (date, eventOrError, eventType, params, sessionId, clientContext) ' .
            'VALUES (:date, :eventOrError, :eventType, :params, :sessionId, :clientContext)'
        );
        $stmt->execute([
            ':date' => (new DateTimeImmutable())->format('Y-m-d H:i:s.u'),
            ':eventOrError' => $input['eventOrError'],
            ':eventType' => $input['eventType'],
            ':params' => $params,
            ':sessionId' => $input['sessionId'] ?? null,
            ':clientContext' => $clientContextJson,
        ]);
        respond(200, ['message' => 'Requête enregistrée.']);
    } catch (Exception $e) {
        error_log('Analytics event insert failed: ' . $e->getMessage());
        respond(500, ['error' => 'Erreur lors de l’enregistrement des données.']);
    }
}

if ($method !== 'GET') {
    header('Allow: GET, POST, OPTIONS');
    respond(405, ['error' => 'Méthode HTTP non autorisée.']);
}

if (isset($_GET['analytics']) && $_GET['analytics'] === 'summary') {
    try {
        $summary = [
            'kingdomEvents' => 0,
            'playAgainEvents' => 0,
            'eventTypes' => [],
            'sources' => [],
            'sets' => [],
            'cards' => [],
            'settings' => [],
            'recentKingdoms' => [],
            'pages' => [],
            'pageLanguages' => [],
            'viewedSets' => [],
            'viewedBoxesSets' => [],
            'interactions' => [],
            'errors' => [],
            'randomizationEvents' => 0,
            'randomizationTypes' => [],
            'randomizationSets' => [],
            'randomizationConfiguration' => [],
            'randomizationAdjustedElements' => [],
            'randomizationSettings' => [],
        ];
        $eventTypeRows = $db->query(
            'SELECT eventType, COUNT(*) AS count FROM RequestLog GROUP BY eventType ORDER BY count DESC'
        );
        while ($row = $eventTypeRows->fetch(PDO::FETCH_ASSOC)) {
            $summary['eventTypes'][$row['eventType']] = (int)$row['count'];
        }

        $trackedRows = $db->query(
            "SELECT eventType, eventOrError, params FROM RequestLog WHERE eventType <> 'KINGDOM_ACTIVITY'"
        );
        $pageEventNames = [
            'RANDOMIZER_VIEW' => 'randomizer',
            'RULEBOOK_VIEW' => 'rulebooks',
            'SEARCH_CARDS_VIEW' => 'searchcards',
            'CARDS_VIEW' => 'cards',
            'SETTINGS_VIEW' => 'settings',
            'HELP_VIEW' => 'help',
            'HISTORY_VIEW' => 'history',
        ];
        while ($row = $trackedRows->fetch(PDO::FETCH_ASSOC)) {
            $eventType = $row['eventType'];
            $data = json_decode($row['params'], true);
            if (!is_array($data)) {
                $data = [];
            }

            if ($row['eventOrError'] === 'error') {
                incrementAnalyticsCount($summary['errors'], $eventType);
            }
            if ($row['eventOrError'] !== 'event') {
                continue;
            }

            if (isset($pageEventNames[$eventType])) {
                incrementAnalyticsCount($summary['pages'], $pageEventNames[$eventType]);
                if ($eventType === 'RULEBOOK_VIEW' && is_string($data['language'] ?? null)) {
                    incrementAnalyticsCount(
                        $summary['pageLanguages'],
                        'rulebooks — ' . $data['language']
                    );
                }
            }

            if ($eventType === 'PAGE_VIEW') {
                if (is_string($data['page'] ?? null) &&
                    !in_array($data['page'], ['boxes', 'sets'], true)) {
                    incrementAnalyticsCount($summary['pages'], $data['page']);
                }
                if (is_string($data['language'] ?? null)) {
                    incrementAnalyticsCount(
                        $summary['pageLanguages'],
                        (is_string($data['page'] ?? null) ? $data['page'] : 'page inconnue') .
                            ' — ' . $data['language']
                    );
                }
                if (($data['page'] ?? null) === 'sets' && is_string($data['setId'] ?? null)) {
                    incrementAnalyticsCount($summary['viewedSets'], $data['setId']);
                }
                if (($data['page'] ?? null) === 'boxes' && is_string($data['setId'] ?? null)) {
                    incrementAnalyticsCount($summary['viewedBoxesSets'], $data['setId']);
                }
            }
            if (in_array($eventType, ['BOXE_VIEW', 'SET_VIEW'], true) &&
                is_string($data['setId'] ?? null)) {
                $target = $eventType === 'BOXE_VIEW' ? 'viewedBoxesSets' : 'viewedSets';
                incrementAnalyticsCount($summary[$target], $data['setId']);
            }

            if (in_array($eventType, [
                'NEWS_MODAL_OPEN',
                'MARK_KINGDOM_PLAYED',
                'HISTORY_KINGDOM_REPLAY',
            ], true)) {
                incrementAnalyticsCount($summary['interactions'], $eventType);
            }

            $isRandomization = substr($eventType, 0, 9) === 'RANDOMIZE' ||
                $eventType === 'LOAD_INITIAL_RANDOMIZE';
            if (!$isRandomization) {
                continue;
            }

            $summary['randomizationEvents']++;
            incrementAnalyticsCount($summary['randomizationTypes'], $eventType);
            $selectedSets = $data['selectedSets'] ?? [];
            if (is_array($selectedSets)) {
                foreach ($selectedSets as $setId) {
                    incrementAnalyticsCount($summary['randomizationSets'], $setId);
                }
            }
            foreach (['configurationAdjusted', 'configurationSimplified', 'googleDriveConnected'] as $name) {
                if (array_key_exists($name, $data)) {
                    incrementAnalyticsCount($summary['randomizationConfiguration'][$name], $data[$name]);
                }
            }
            $adjustedElements = $data['adjustedElements'] ?? [];
            if (is_array($adjustedElements)) {
                foreach ($adjustedElements as $element) {
                    incrementAnalyticsCount($summary['randomizationAdjustedElements'], $element);
                }
            }
            foreach ([
                'randomizerSettings' => $data['randomizerSettings'] ?? [],
                'applicationSettings' => $data['applicationSettings'] ?? [],
            ] as $group => $settings) {
                if (!is_array($settings)) {
                    continue;
                }
                foreach ($settings as $name => $value) {
                    if (is_array($value) || is_object($value) || $value === null) {
                        continue;
                    }
                    incrementAnalyticsCount(
                        $summary['randomizationSettings'][$group][$name],
                        $value
                    );
                }
            }
        }

        $stmt = $db->query("SELECT params FROM RequestLog WHERE eventType = 'KINGDOM_ACTIVITY'");

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $activity = json_decode($row['params'], true);
            if (!is_array($activity)) {
                continue;
            }
            $summary['kingdomEvents']++;
            $sourceName = is_string($activity['source'] ?? null) ? $activity['source'] : 'unknown';
            $summary['sources'][$sourceName] = ($summary['sources'][$sourceName] ?? 0) + 1;
            if ($sourceName === 'play_again') {
                $summary['playAgainEvents']++;
            }

            $configuration = $activity['configuration'] ?? [];
            foreach (($configuration['selectedSets'] ?? []) as $setId) {
                if (is_string($setId)) {
                    $summary['sets'][$setId] = ($summary['sets'][$setId] ?? 0) + 1;
                }
            }
            foreach (['randomizerSettings', 'appSettings'] as $group) {
                foreach (($configuration[$group] ?? []) as $key => $value) {
                    if (is_array($value) || is_object($value) || $value === null) {
                        continue;
                    }
                    $label = is_bool($value) ? ($value ? 'true' : 'false') : (string)$value;
                    if (!isset($summary['settings'][$group][$key])) {
                        $summary['settings'][$group][$key] = [];
                    }
                    $summary['settings'][$group][$key][$label] =
                        ($summary['settings'][$group][$key][$label] ?? 0) + 1;
                }
            }

            $kingdom = $activity['kingdom'] ?? [];
            foreach (['supply', 'events', 'landmarks', 'projects', 'ways', 'boons', 'traits'] as $category) {
                foreach (($kingdom[$category] ?? []) as $cardId) {
                    if (is_string($cardId)) {
                        $summary['cards'][$cardId] = ($summary['cards'][$cardId] ?? 0) + 1;
                    }
                }
            }
            foreach (['ally', 'prophecy'] as $category) {
                $cardId = $kingdom[$category] ?? null;
                if (is_string($cardId)) {
                    $summary['cards'][$cardId] = ($summary['cards'][$cardId] ?? 0) + 1;
                }
            }
            foreach (($kingdom['specialSupply'] ?? []) as $specialCards) {
                $specialCardIds = is_array($specialCards) ? $specialCards : [$specialCards];
                foreach ($specialCardIds as $cardId) {
                    if (is_string($cardId)) {
                        $summary['cards'][$cardId] = ($summary['cards'][$cardId] ?? 0) + 1;
                    }
                }
            }
        }

        $activityEventCount = $summary['kingdomEvents'];
        $updateEventCount = (int)$db->query(
            "SELECT COUNT(*) FROM RequestLog WHERE eventType = 'UPDATE_KINGDOM'"
        )->fetchColumn();
        if ($updateEventCount > 0) {
            $summary['kingdomEvents'] = max($activityEventCount, $updateEventCount);
            if ($updateEventCount >= $activityEventCount) {
                $summary['cards'] = [];
                if ($updateEventCount > $activityEventCount) {
                    $summary['sources']['Origine inconnue'] =
                        ($summary['sources']['Origine inconnue'] ?? 0) +
                        $updateEventCount - $activityEventCount;
                }

                $kingdomRows = $db->query(
                    "SELECT params FROM RequestLog WHERE eventType = 'UPDATE_KINGDOM'"
                );
                while ($row = $kingdomRows->fetch(PDO::FETCH_ASSOC)) {
                    $kingdom = decodeLegacyKingdom(json_decode($row['params'], true));
                    if ($kingdom === null) {
                        continue;
                    }
                    foreach ([
                        'supply', 'events', 'landmarks', 'projects', 'ways',
                        'boons', 'traits', 'ally', 'prophecy',
                    ] as $category) {
                        foreach ($kingdom[$category] as $cardId) {
                            incrementAnalyticsCount($summary['cards'], $cardId);
                        }
                    }
                    foreach ($kingdom['specialSupply'] as $specialCards) {
                        foreach ($specialCards as $cardId) {
                            incrementAnalyticsCount($summary['cards'], $cardId);
                        }
                    }
                }
            }
        }

        arsort($summary['sets']);
        arsort($summary['cards']);
        arsort($summary['pages']);
        arsort($summary['pageLanguages']);
        arsort($summary['viewedSets']);
        arsort($summary['interactions']);
        arsort($summary['errors']);
        arsort($summary['randomizationTypes']);
        arsort($summary['randomizationSets']);
        arsort($summary['randomizationAdjustedElements']);
        $summary['topSets'] = array_slice($summary['sets'], 0, 15, true);
        $summary['topCards'] = array_slice($summary['cards'], 0, 20, true);

        $recent = $db->query(
            "SELECT date, params, sessionId FROM RequestLog WHERE eventType = 'KINGDOM_ACTIVITY' ORDER BY date DESC, id DESC LIMIT 50"
        );
        while ($row = $recent->fetch(PDO::FETCH_ASSOC)) {
            $activity = json_decode($row['params'], true);
            if (is_array($activity)) {
                $summary['recentKingdoms'][] = [
                    'date' => $row['date'],
                    'sessionId' => $row['sessionId'],
                    'source' => $activity['source'] ?? 'unknown',
                    'kingdom' => $activity['kingdom'] ?? [],
                    'configuration' => $activity['configuration'] ?? [],
                ];
            }
        }
        if (!$summary['recentKingdoms']) {
            $recentUpdates = $db->query(
                "SELECT date, params, sessionId FROM RequestLog WHERE eventType = 'UPDATE_KINGDOM' ORDER BY date DESC, id DESC LIMIT 50"
            );
            while ($row = $recentUpdates->fetch(PDO::FETCH_ASSOC)) {
                $kingdom = decodeLegacyKingdom(json_decode($row['params'], true));
                if ($kingdom !== null) {
                    $summary['recentKingdoms'][] = [
                        'date' => $row['date'],
                        'sessionId' => $row['sessionId'],
                        'source' => 'unknown',
                        'kingdom' => $kingdom,
                        'configuration' => [],
                    ];
                }
            }
        }
        respond(200, $summary);
    } catch (Exception $e) {
        respond(500, ['error' => 'Erreur lors de la préparation des statistiques.']);
    }
}

if (isset($_GET['logs']) && $_GET['logs'] === 'true') {
    $eventType = $_GET['eventType'] ?? '';
    if (!is_string($eventType) || strlen($eventType) > 80) {
        respond(400, ['error' => 'Le filtre EventType est invalide.']);
    }
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = $_GET['perPage'] ?? '50';
    if (!is_string($perPage) || !in_array($perPage, ['50', '100', '250', '500', '1000'], true)) {
        respond(400, ['error' => 'Le nombre de lignes par page est invalide.']);
    }
    $perPage = (int)$perPage;
    $sessionId = $_GET['sessionId'] ?? '';
    if (!is_string($sessionId) || strlen($sessionId) > 64 ||
        ($sessionId !== '' && !preg_match('/^[A-Fa-f0-9-]+$/', $sessionId))) {
        respond(400, ['error' => 'L’identifiant de session est invalide.']);
    }
    $paramsSearch = $_GET['paramsSearch'] ?? '';
    if (!is_string($paramsSearch) || strlen($paramsSearch) > 500) {
        respond(400, ['error' => 'Le filtre sur les paramètres est invalide.']);
    }
    $filters = [];
    if ($eventType !== '') {
        $filters[] = 'eventType = :eventType';
    }
    if ($sessionId !== '') {
        $filters[] = 'sessionId = :sessionId';
    }
    if ($paramsSearch !== '') {
        $filters[] = "instr(COALESCE(params, ''), :paramsSearch) > 0";
    }
    $where = $filters ? ' WHERE ' . implode(' AND ', $filters) : '';

    try {
        $eventTypes = $db->query(
            'SELECT DISTINCT eventType FROM RequestLog ORDER BY eventType'
        )->fetchAll(PDO::FETCH_COLUMN);
        $countStmt = $db->prepare('SELECT COUNT(*) FROM RequestLog' . $where);
        if ($eventType !== '') {
            $countStmt->bindValue(':eventType', $eventType);
        }
        if ($sessionId !== '') {
            $countStmt->bindValue(':sessionId', $sessionId);
        }
        if ($paramsSearch !== '') {
            $countStmt->bindValue(':paramsSearch', $paramsSearch);
        }
        $countStmt->execute();
        $totalCount = (int)$countStmt->fetchColumn();

        $stmt = $db->prepare(
            'SELECT id, date, eventOrError, eventType, params, sessionId, clientContext FROM RequestLog' . $where .
            ' ORDER BY date DESC, id DESC LIMIT :limit OFFSET :offset'
        );
        if ($eventType !== '') {
            $stmt->bindValue(':eventType', $eventType);
        }
        if ($sessionId !== '') {
            $stmt->bindValue(':sessionId', $sessionId);
        }
        if ($paramsSearch !== '') {
            $stmt->bindValue(':paramsSearch', $paramsSearch);
        }
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', ($page - 1) * $perPage, PDO::PARAM_INT);
        $stmt->execute();
        respond(200, [
            'logs' => $stmt->fetchAll(PDO::FETCH_ASSOC),
            'eventTypes' => $eventTypes,
            'page' => $page,
            'perPage' => $perPage,
            'totalCount' => $totalCount,
        ]);
    } catch (Exception $e) {
        error_log('Analytics logs retrieval failed: ' . $e->getMessage());
        respond(500, ['error' => 'Erreur lors de la récupération des journaux.']);
    }
}

$startDate = $_GET['startDate'] ?? null;
$endDate = $_GET['endDate'] ?? null;
$search = $_GET['search'] ?? null;
$eventOrError = $_GET['type'] ?? null;
$eventType = $_GET['eventType'] ?? null;
$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = 50;
$where = [];
$params = [];

if ($startDate) {
    $where[] = 'date >= :startDate';
    $params[':startDate'] = str_replace('T', ' ', $startDate);
}
if ($endDate) {
    $where[] = 'date <= :endDate';
    $params[':endDate'] = str_replace('T', ' ', $endDate);
}
if ($search) {
    $where[] = 'params LIKE :search';
    $params[':search'] = '%' . $search . '%';
}
if ($eventOrError) {
    $where[] = 'eventOrError = :eventOrError';
    $params[':eventOrError'] = $eventOrError;
}
if ($eventType) {
    $where[] = 'eventType = :eventType';
    $params[':eventType'] = $eventType;
}
$whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';

try {
    $countStmt = $db->prepare('SELECT COUNT(*) FROM RequestLog' . $whereSql);
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetchColumn();

    if (isset($_GET['download']) && $_GET['download'] === 'csv') {
        $stmt = $db->prepare(
            'SELECT date, eventOrError, eventType, params, sessionId, clientContext FROM RequestLog' . $whereSql .
            ' ORDER BY date DESC, id DESC'
        );
        $stmt->execute($params);
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="logs.csv"');
        $output = fopen('php://output', 'w');
        fputcsv($output, ['Date', 'Type', 'Event', 'Session ID', 'Paramètres', 'Contexte client']);
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            fputcsv($output, [
                $row['date'],
                $row['eventOrError'],
                $row['eventType'],
                $row['sessionId'],
                $row['params'],
                $row['clientContext'],
            ]);
        }
        fclose($output);
        exit;
    }

    $stmt = $db->prepare(
        'SELECT date, eventOrError, eventType, params, sessionId, clientContext FROM RequestLog' . $whereSql .
        ' ORDER BY date DESC, id DESC LIMIT :limit OFFSET :offset'
    );
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', ($page - 1) * $perPage, PDO::PARAM_INT);
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        respond(200, ['logs' => $logs, 'page' => $page, 'perPage' => $perPage, 'totalCount' => $totalCount]);
    }

    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width">';
    echo '<title>Logs de suivi</title><style>body{font:16px Arial;margin:2rem;color:#222}form{display:flex;gap:.7rem;flex-wrap:wrap}table{width:100%;border-collapse:collapse;margin-top:1rem}th,td{border:1px solid #ddd;padding:.6rem;text-align:left;vertical-align:top}pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0}</style>';
    echo '<h1>Logs de suivi</h1><form method="get"><input type="hidden" name="source" value="' . htmlspecialchars($source, ENT_QUOTES, 'UTF-8') . '">';
    foreach (['startDate' => 'Date de début', 'endDate' => 'Date de fin', 'search' => 'Recherche', 'type' => 'Type', 'eventType' => 'EventType'] as $name => $label) {
        $value = htmlspecialchars((string)($_GET[$name] ?? ''), ENT_QUOTES, 'UTF-8');
        echo '<label>' . $label . ' <input name="' . $name . '" value="' . $value . '"></label>';
    }
    echo '<button>Filtrer</button><button name="download" value="csv">CSV</button></form><table><thead><tr><th>Date</th><th>Type</th><th>Événement</th><th>Session ID</th><th>Pays</th><th>Appareil</th><th>Paramètres</th></tr></thead><tbody>';
    foreach ($logs as $log) {
        $context = json_decode($log['clientContext'] ?? '', true);
        $context = is_array($context) ? $context : [];
        echo '<tr><td>' . htmlspecialchars($log['date'], ENT_QUOTES, 'UTF-8') . '</td><td>' .
            htmlspecialchars($log['eventOrError'], ENT_QUOTES, 'UTF-8') . '</td><td>' .
            htmlspecialchars($log['eventType'], ENT_QUOTES, 'UTF-8') . '</td><td>' .
            htmlspecialchars($log['sessionId'] ?? '', ENT_QUOTES, 'UTF-8') . '</td><td>' .
            htmlspecialchars($context['country'] ?? '—', ENT_QUOTES, 'UTF-8') . '</td><td>' .
            htmlspecialchars($context['device'] ?? '—', ENT_QUOTES, 'UTF-8') . '</td><td><pre>' .
            htmlspecialchars($log['params'], ENT_QUOTES, 'UTF-8') . '</pre></td></tr>';
    }
    echo '</tbody></table><p>Page ' . $page . ' sur ' . max(1, (int)ceil($totalCount / $perPage)) . '</p></html>';
} catch (Exception $e) {
    respond(500, ['error' => 'Erreur lors de la récupération des journaux.']);
}
