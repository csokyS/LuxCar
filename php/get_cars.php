<?php

require_once('../../common/php/environment.php');

// Get arguments
$args = Util::getArgs();

// Connect to database
$db = new Database();

// Set query
$query = "SELECT  `car`.`id`,
                  `car`.`name`,
                  `car`.`nameID`,
                  `car`.`year`,
                  `color`.`name` AS `color`,
                  `car`.`engine`,
                  `fuel`.`name` AS `fuel`,
                  `car`.`horsepower`,
                  `car`.`torque`,
                  `car`.`acceleration`,
                  `car`.`topspeed`,
                  `car`.`price`,
                  `car`.`manufactured`,
                  `car`.`km`, 
                  `car_tariff`.`tariff` 
          FROM `car` 
          INNER JOIN  `car_tariff` ON  `car`.`id` = `car_tariff`.`carID` AND 
                      `car_tariff`.`valid` = (
                        SELECT Max(`car_tariff`.`valid`) 
                        FROM `car_tariff` 
                        WHERE `car`.`id` = `car_tariff`.`carID` AND 
                              `car_tariff`.`valid` <= :dateNow
                      ) 
          INNER JOIN `fuel` ON  `car`.`fuelID` = `fuel`.`id` 
          INNER JOIN `color` ON  `car`.`colorID` = `color`.`id` 
          WHERE `car`.`valid` = :valid 
          GROUP BY `car`.`id`;";

// Execute query
$result = $db->execute($query, $args);

// Disconnect
$db = null;

Util::setResponse($result);
