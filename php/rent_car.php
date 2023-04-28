<?php

require_once('../../common/php/environment.php');

// Get arguments
$args = Util::getArgs();

// Connect to database
$db = new Database();

// Create query
$query = "INSERT INTO `user-rent` (`user_id`,`car_id`,`rent`,`start`,`end`,`total`) 
					VALUES (:user_id, :car_id, :rent, :start, :end, :total);";

// Execute query
$result = $db->execute($query, $args);

// Disconnect
$db = null;

Util::setResponse($result);