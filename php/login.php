<?php

require_once('../../common/php/environment.php');

// Get arguments
$args = Util::getArgs();

// Connect to database
$db = new Database();

$query = "SELECT *,
          CONCAT_WS(' ',`prefix_name`,`last_name`,`middle_name`,`first_name`,`suffix_name`) AS `name`
          FROM `user`
          WHERE `valid` = 1 AND `email` = :email AND BINARY `password` = :password
          LIMIT 1;";

// Execute query
$result = $db->execute($query, $args);

// Check/Convert result
if (!is_null($result)) $result = $result[0];

// Disconnect
$db = null;

Util::setResponse($result);