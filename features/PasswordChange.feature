@After=Activation
Feature: Change password

  Background: Client defaults

    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Accept header
    And   "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Content-Type header

  Scenario: Request password change token

    And   this is the request body
    --------------
    "email": "mike.doe-{time}@example.com"
    --------------
    When I POST to {passwordChangeEndpoint}
    Then the status code should be 201

  Scenario: Lost password with unknown email should not work

    Given this is the request body
    --------------
    "email": "invalid.doe-{time}@example.com"
    --------------
    When I POST to {passwordChangeEndpoint}
    Then the status code should be 404

  Scenario: Confirm password change

    Given I have the lostPasswordToken for "mike.doe-{time}@example.com" in "confirmationToken"
    And "Bearer {confirmationToken}" is the Authorization header
    And this is the request body
    --------------
    "password": "serious garage excellent making"
    --------------
    When I POST to {passwordChangeConfirmEndpoint}
    Then the status code should be 204

  Scenario: Confirm password change with already used token should not work

    Given "Bearer {confirmationToken}" is the Authorization header
    And this is the request body
    --------------
    "password": "serious garage excellent making"
    --------------
    When I POST to {passwordChangeConfirmEndpoint}
    Then the status code should be 409

  Scenario: Confirm password change with an expired token should not work

    Given I have the expiredlostPasswordToken for "mike.doe-{time}@example.com" in "expiredConfirmationToken"
    And "Bearer {expiredConfirmationToken}" is the Authorization header
    And this is the request body
    --------------
    "password": "serious garage excellent making"
    --------------
    When I POST to {passwordChangeConfirmEndpoint}
    Then the status code should be 401
