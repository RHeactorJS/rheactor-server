@After=NameChange
Feature: Avatar change
  As a user
  I should be able to edit my profile's avatar

  Background: Client defaults

    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Accept header
    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Content-Type header
    Given "Bearer {token}" is the Authorization header

  Scenario: Change avatar

    When I GET {jwt.sub}
    Then the status code should be 200
    And I store the link to "update-avatar" as "avatarChangeEndpoint"
    Given "5" is the If-Match header
    And this is the request body
    --------------
    "value": "https://example.com/example.jpg"
    --------------
    When I PUT to {avatarChangeEndpoint}
    Then the status code should be 204
    And the etag header should equal "6"
    And the Last-Modified header should be now
    Given the request body is empty
    When I GET {jwt.sub}
    Then the status code should be 200
    And "avatar" should equal "https://example.com/example.jpg"

  Scenario: only trused URLs should be allowed to be used as avatars
    Given "6" is the If-Match header
    And this is the request body
    --------------
    "value": "https://foo.com/example.jpg"
    --------------
    When I PUT to {avatarChangeEndpoint}
    Then the status code should be 400
