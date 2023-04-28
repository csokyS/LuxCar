<?php

require_once('../../common/php/environment.php');

// Get arguments
$args = Util::getArgs();

// Connect to database
$db = new Database();

// Create query
$query = "INSERT INTO `user` (`type`,`prefix_name`,`first_name`,`middle_name`,`last_name`, 
                              `suffix_name`, `gender`, `born`, `email`, `password`) 
          VALUES ('U', :prefixName, :firstName, :middleName, :lastName, 
                       :postfixName, :gender, :born, :email, :password);";

// Execute query
$result = $db->execute($query, $args);

// Disconnect
$db = null;

Util::setResponse($result);