<?php

// Require file
require_once('../../../common/php/Database.php');

// Set result
$result = null;

// Get arguments
$args = Util::getArgs();


// Connect to MySQL server
$db = new Database('luxcar');

// Convert date of born to date type
$args['born'] = substr($args['born'], 0, 10);

// Create query
$query = "INSERT INTO `user`(`type`, `prefix_name`, `first_name`, `middle_name`, `last_name`, `suffix_name`, `born`, `gender`, `email`, `password`) VALUES ('U', :prefixName, :firstName, :middleName, :lastName, :postfixName, :born, :gender, :email, :password);";

// Execute query
$db->execute($query, $args);

// Check is error
if (!$db->is_error()) {

  // Set result
  $result = $db->get_data();

  // Set error
} else  Util::setError($db->get_error(), false);

// Disconect
$db = null;

// Set response
Util::setResponse($result);