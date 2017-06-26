@After=EmailChange
Feature: Name change
  As a user
  I should be able to edit my profile's firstname and lastname

  Background: Client defaults

    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Accept header
    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Content-Type header

  Scenario: Change first and last name

    Given "Bearer {token}" is the Authorization header
    When I GET {jwt.sub}
    Then the status code should be 200
    And I store the link to "update-firstname" as "firstnameChangeEndpoint"
    And I store the link to "update-lastname" as "lastnameChangeEndpoint"
    # Change the first name
    Given "4" is the If-Match header
    And this is the request body
    --------------
    "value": "Mike W."
    --------------
    When I PUT to {firstnameChangeEndpoint}
    Then the status code should be 204
    And the etag header should equal "5"
    And the Last-Modified header should be now
