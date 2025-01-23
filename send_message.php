<?php
// send_message.php
header('Content-Type: application/json');

$servername = "localhost"; // Your database server
$dbname = "MyTems"; // Your database name

$conn = new mysqli($servername, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sender_id = $_POST['sender_id'];
$receiver_id = $_POST['receiver_id'];
$message = $_POST['message'];

$sql = "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $sender_id, $receiver_id, $message);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>