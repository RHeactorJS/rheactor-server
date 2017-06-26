@After=Index
Feature: /api/status

  Background: Client defaults

    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Accept header
    Given "application/vnd.rheactorjs.core.v2+json; charset=utf-8" is the Content-Type header

  Scenario: GET

    When I GET {statusEndpoint}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.rheactorjs.core.v2+json; charset=utf-8"
    And "$context" should equal "https://github.com/RHeactorJS/models#Status"
    And "time" should exist
    And "status" should equal "ok"
    And "version" should match ^0\.0\.0\+testing\.[0-9]+$
