@After=PasswordChange
Feature: Login

  Background: Client defaults

    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Accept header
    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Content-Type header

  Scenario: Login as Mike

    Given this is the request body
    --------------
    "email": "mike.doe-{time}@example.com",
    "password": "serious garage excellent making"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201
    And the Content-Type header should equal "application/vnd.rheactorjs.core.v2+json; charset=utf-8"
    And "$context" should equal "https://tools.ietf.org/html/rfc7519"
    And "token" should exist
    And I store "token" as "token"
    And I store "sub" as "userressource"
    And I parse JWT token into "jwt"
    And JWT sub should exist
    And JWT iss should equal "login"
    And JWT exp should be 30 minutes in the future
    And I store the link to "token-verify" as "tokenVerifyEndpoint"
    And I store the link to "token-renew" as "tokenRenewEndpoint"

  Scenario: Login as Jane

    Given this is the request body
    --------------
    "email": "jane.doe-{time}@example.com",
    "password": "leg selection railroad wrapped"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201
    And I store "token" as "janesToken"
    And I parse JWT token into "janesJwt"

  Scenario: Login as Tony

    Given this is the request body
    --------------
    "email": "tony.stark-{time}@example.com",
    "password": "ironmanrocks"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201
    And I store "token" as "tonysToken"
    And I parse JWT token into "tonysJwt"

  Scenario: Login with invalid password should not work

    Given this is the request body
    --------------
    "email": "mike.doe-{time}@example.com",
    "password": "this is not my password"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 403

  Scenario: Email should be case-insensitive

    Given this is the request body
    --------------
    "email": "Mike.Doe-{time}@example.com",
    "password": "serious garage excellent making"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 201

  Scenario: Login with unknown email should not work

    Given this is the request body
    --------------
    "email": "invalid.doe-{time}@example.com",
    "password": "this is not my real password"
    --------------
    When I POST to {loginEndpoint}
    Then the status code should be 404
