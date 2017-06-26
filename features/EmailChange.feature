@After=User
Feature: Email change
  As a user
  I should be able to edit my profile's email address

  Background: Client defaults

    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Accept header
    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Content-Type header

  Scenario: Change email address, which needs to be confirmed

    Given "Bearer {token}" is the Authorization header
    When I GET {jwt.sub}
    Then the status code should be 200
    And I store the link to "change-email" as "emailChangeEndpoint"
    And I store the link to "change-email-confirm" as "emailChangeConfirmEndpoint"
    # Request a token to change the email
    Given this is the request body
    --------------
    "value": "mike.w.doe-{time}@example.com"
    --------------
    When I PUT to {emailChangeEndpoint}
    Then the status code should be 201
    # Use the token to change the email
    Given I have the token that lets "mike.doe-{time}@example.com" change their email to "mike.w.doe-{time}@example.com" in "emailChangeConfirmationToken"
    And "Bearer {emailChangeConfirmationToken}" is the Authorization header
    And the request body is empty
    When I PUT to {emailChangeConfirmEndpoint}
    Then the status code should be 204
    And the etag header should equal "4"
    And the Last-Modified header should be now
    # The email is changed
    Given "Bearer {token}" is the Authorization header
    When I GET {jwt.sub}
    Then the status code should be 200
    And "email" should equal "mike.w.doe-{time}@example.com"

  Scenario: When changing  email addresses, the email must not exist

    Given "Bearer {token}" is the Authorization header
    When I GET {jwt.sub}
    Then the status code should be 200
    And I store the link to "change-email" as "emailChangeEndpoint"
    And I store the link to "change-email-confirm" as "emailChangeConfirmEndpoint"
    # Request a token to change the email
    Given this is the request body
    --------------
    "value": "jane.doe-{time}@example.com"
    --------------
    When I PUT to {emailChangeEndpoint}
    Then the status code should be 409
    And the Content-Type header should equal "application/vnd.rheactorjs.core.v2+json; charset=utf-8"
    And "$context" should equal "https://www.ietf.org/id/draft-ietf-appsawg-http-problem-01.txt"
    And "detail" should equal "ConflictError: Email address already in use: jane.doe-{time}@example.com"
