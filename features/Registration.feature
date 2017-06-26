@After=Index
Feature: Registration

  Background: Client defaults

    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Accept header
    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Content-Type header

  Scenario: Create Mike's account

    Given this is the request body
    --------------
    "email": "mike.doe-{time}@example.com",
    "firstname": "Mike",
    "lastname": "Doe",
    "password": "i will change this later"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 201

  Scenario: Creating another account for the same email should not be possible

    Given this is the request body
    --------------
    "email": "mike.doe-{time}@example.com",
    "firstname": "Mike",
    "lastname": "Doe",
    "password": "i will change this later"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 409

  Scenario: Create Janes's account

    Given this is the request body
    --------------
    "email": "jane.doe-{time}@example.com",
    "firstname": "Jane",
    "lastname": "Doe",
    "password": "leg selection railroad wrapped"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 201

  Scenario: Create Tony's account

    Given this is the request body
    --------------
    "email": "tony.stark-{time}@example.com",
    "firstname": "Tony",
    "lastname": "Stark",
    "password": "ironmanrocks"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 201

  Scenario: All neccessary data must be provided

    Given this is the request body
    --------------
    "email": "jane.doe-{time}@example.com"
    --------------
    When I POST to {registrationEndpoint}
    Then the status code should be 400
