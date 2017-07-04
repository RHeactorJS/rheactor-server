@After=User
Feature: User preferences
  User can store arbitrary preferences in their profile

  Background: Client defaults

    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Accept header
    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Content-Type header
    Given "Bearer {token}" is the Authorization header

  Scenario: Initially, a profile should not have preferences

    When I GET {jwt.sub}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.rheactorjs.core.v2+json; charset=utf-8"
    And "$context" should equal "https://github.com/RHeactorJS/models#User"
    And "$id" should equal "{jwt.sub}"
    And "preferences" should equal "{}"
    And I store the link to "update-preferences" as "updatePreferences"
    And I store "$version" as "version"

  Scenario: set new preferences
    Given this JSON is the request body
    ----------------------------
    "value": {
      "foo": "bar",
      "baz": [1, 2, 3]
    }
    ----------------------------
    And "{version}" is the If-Match header
    When I PUT to {updatePreferences}
    Then the status code should be 202
    # Fetch the profile
    Given the request body is empty
    When I GET {jwt.sub}
    Then the status code should be 200
    And "preferences" should exist
