<?php

require_once('../../common/php/environment.php');

// Get arguments
$args = Util::getArgs();

// Connect to database
$db = new Database();

// Create query
$query = "SELECT `id` FROM `user` WHERE `email` = ? LIMIT 1;";

// Execute query
$result = $db->execute($query, array($args["email"]));

// Check result
if (!is_null($result)) Util::setError('Az email cím már létezik!');

// Create query
$query = "INSERT INTO `user` (`name`, `gender`, `born`, `email`, `password`) 
          VALUES (:name, :gender, :born, :email, :password);";

// Execute query
$result = $db->execute($query, $args);

// Disconnect
$db = null;

Util::setResponse($result);
