<?php
// get_messages.php
header('Content-Type: application/json');

$servername = "localhost"; // Your database server
$dbname = "MyTems"; // Your database name

$conn = new mysqli($servername, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sender_id = $_GET['sender_id'];
$receiver_id = $_GET['receiver_id'];

$sql = "SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $sender_id, $receiver_id, $receiver_id, $sender_id);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode($messages);

$stmt->close();
$conn->close();
?>