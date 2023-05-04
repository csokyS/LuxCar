<?php

require_once('../../common/php/environment.php');

// Get arguments
$args = Util::getArgs();

// Connect to database
$db = new Database();

// Create query
$query = "INSERT INTO `user-rent` (`user_id`, `car_id`, `date`, `start`, `end`, `day`, `tariff`, `total`) 
					VALUES (:user_id, :car_id, :date, :start, :end, :day, :tariff, :total);";

// Execute query
$result = $db->execute($query, $args);

// Check result
if ($result["affectedRows"] !== 1)
  Util::setError('Az autó bérlése nem sikerült!');

// Set query
$query = "SELECT  `user-rent`.`id` AS `id`,
									`car`.`name` AS `car_name`,
									`user-rent`.`date` AS `date`, 
									`user-rent`.`start` AS `start`, 
									`user-rent`.`end` AS `end`, 
									`user-rent`.`day` AS `day`, 
									`user-rent`.`tariff` AS `tariff`, 
									`user-rent`.`total` AS `total`
					FROM `user-rent`
					INNER JOIN `car` ON `car`.`id` = `user-rent`.`car_id`
					WHERE `user-rent`.`user_id` = :user_id AND 
								`user-rent`.`valid` = 1
					ORDER BY `user-rent`.`start`;";

// Execute query
$result = $db->execute($query, array(
						'user_id' => $args['user_id']
					));

// Disconnect
$db = null;

Util::setResponse($result);
