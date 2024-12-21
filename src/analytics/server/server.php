<?php
// En-têtes CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Gérer les requêtes OPTIONS (prévol CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Vérifier si l'utilisateur veut la liste des sources
if (isset($_GET['listSources'])) {
    $directory = __DIR__ . '/databases';
    $sources = array_diff(scandir($directory), ['.', '..']);

    // Renvoyer uniquement les fichiers avec extension .db
    $sources = array_filter($sources, function ($file) use ($directory) {
        return is_file("$directory/$file") && pathinfo($file, PATHINFO_EXTENSION) === 'db';
    });

    // Extraire les noms sans extension
    $sources = array_map(function ($filename) {
        return pathinfo($filename, PATHINFO_FILENAME);
    }, $sources);

    // Retourner les sources en JSON
    header('Content-Type: application/json');
    echo json_encode(array_values($sources)); // Réindexation pour éviter les clés non numériques
    exit;
}

// Vérifier si une source est fournie
$source = $_GET['source'] ?? null;
if (!$source) {
    http_response_code(400);
    echo json_encode(['error' => 'Le paramètre "source" est obligatoire.']);
    exit;
}

// Nom du fichier SQLite basé sur la source
$dbFile = __DIR__ . "/databases/{$source}.db";

// Création du répertoire pour stocker les bases de données
if (!file_exists(__DIR__ . '/databases')) {
    mkdir(__DIR__ . '/databases', 0755, true);
}

// Initialiser la base de données SQLite
try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Créer la table si elle n'existe pas
    $db->exec("
        CREATE TABLE IF NOT EXISTS RequestLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            url TEXT NOT NULL,
            params TEXT
        )
    ");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données pour la source donnée.']);
    exit;
}

// Déterminer la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Lire les données POST
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['url']) || !isset($input['params'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Données manquantes : "url" ou "params".']);
        exit;
    }

    $url = $input['url'];
    $params = json_encode($input['params']);
    $date = date('Y-m-d H:i:s');

    try {
        $stmt = $db->prepare("INSERT INTO RequestLog (date, url, params) VALUES (:date, :url, :params)");
        $stmt->execute([
            ':date' => $date,
            ':url' => $url,
            ':params' => $params
        ]);
        echo json_encode(['message' => 'Requête enregistrée avec succès.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de l\'enregistrement des données.']);
    }
} elseif ($method === 'GET') {
    // Récupération des filtres
    $startDate = $_GET['startDate'] ?? null; // Date de début
    $endDate = $_GET['endDate'] ?? null;     // Date de fin
    $search = $_GET['search'] ?? null;       // Mot-clé pour les paramètres
    $page = $_GET['page'] ?? 1;              // Numéro de la page
    $perPage = 10;                           // Nombre de résultats par page

    // Conversion des dates au format attendu par SQLite
    if ($startDate) $startDate = str_replace('T', ' ', $startDate); // Remplacer "T" par espace
    if ($endDate) $endDate = str_replace('T', ' ', $endDate); // Remplacer "T" par espace
    // Construction de la requête SQL
    $query = "SELECT date, url, params FROM RequestLog WHERE 1=1";
    $params = [];

    // Ajouter les filtres de date et heure
    if ($startDate) {
        $query .= " AND date >= :startDate";
        $params[':startDate'] = $startDate;
    }
    if ($endDate) {
        $query .= " AND date <= :endDate";
        $params[':endDate'] = $endDate;
    }

    // Ajouter le filtre de recherche dans les paramètres
    if ($search) {
        $query .= " AND params LIKE :search";
        $params[':search'] = '%' . $search . '%';
    }

    // Ajouter la pagination
    $offset = ($page - 1) * $perPage;
    $query .= " ORDER BY date DESC LIMIT :perPage OFFSET :offset";

    try {
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Total des résultats pour le compteur
        $countQuery = "SELECT COUNT(*) as count FROM RequestLog WHERE 1=1";
        if ($startDate) {
            $countQuery .= " AND date >= :startDate";
        }
        if ($endDate) {
            $countQuery .= " AND date <= :endDate";
        }
        if ($search) {
            $countQuery .= " AND params LIKE :search";
        }
        $countStmt = $db->prepare($countQuery);
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute();
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Vérifier si téléchargement demandé
        if (isset($_GET['download']) && $_GET['download'] === 'csv') {
            // Générer le fichier CSV
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="logs.csv"');

            $output = fopen('php://output', 'w');
            fputcsv($output, ['Date', 'URL', 'Params']); // En-têtes du CSV
            foreach ($logs as $log) {
                fputcsv($output, [$log['date'], $log['url'], $log['params']]);
            }
            fclose($output);
            exit;
        }

        // Vérifier si navigateur pour affichage HTML
        $acceptHeader = $_SERVER['HTTP_ACCEPT'] ?? '';
        if (strpos($acceptHeader, 'text/html') !== false) {
            // Générer une table HTML
            echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Logs de suivi</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { height: 20px; border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .pagination { margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Logs de suivi</h1>
    <form method='get'>
        <input type='hidden' name='source' value='" . htmlspecialchars($source) . "'>
        <label for='startDate'>Date de début : </label>
        <input type='datetime-local' name='startDate' value='" . htmlspecialchars($startDate) . "'>
        <label for='endDate'>Date de fin : </label>
        <input type='datetime-local' name='endDate' value='" . htmlspecialchars($endDate) . "'>
        <label for='search'>Recherche : </label>
        <input type='text' name='search' placeholder='Mot-clé' value='" . htmlspecialchars($search) . "'>
        <button type='submit'>Filtrer</button>
        <button type='submit' name='download' value='csv'>Télécharger</button>
    </form>
    <table>
        <thead>
            <tr>
                <th style='width:20%;'>Date</th>
                <th style='width:20%;'>URL</th>
                <th>Paramètres</th>
            </tr>
        </thead>
        <tbody>";
            
            foreach ($logs as $log) {
                echo "            <tr>
                <td>{$log['date']}</td>
                <td>{$log['url']}</td>
                <td><pre>{$log['params']}</pre></td>
            </tr>";
            }

    echo "        </tbody>
    </table>
    <div class='pagination'>
        <p>Page $page sur " . ceil($totalCount / $perPage) . "</p>
        <a href='?page=" . max(1, $page - 1) . "&source=$source&startDate=$startDate&endDate=$endDate&search=$search'>Précédent</a>
        <a href='?page=" . min(ceil($totalCount / $perPage), $page + 1) . "&source=$source&startDate=$startDate&endDate=$endDate&search=$search'>Suivant</a>
    </div>
</body>
</html>";
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la récupération des logs.']);
    }
} else {
    // Méthode HTTP non prise en charge
    http_response_code(405);
    echo json_encode(['error' => 'Méthode HTTP non autorisée.']);
}
