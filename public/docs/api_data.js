define({ "api": [
  {
    "type": "POST",
    "url": "/auth/register",
    "title": "Register a new User to application",
    "name": "apiName",
    "group": "Authentication",
    "version": "1.0.0",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "nic",
            "description": "<p>NIC of the user to be registred</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the User</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"admin\"",
              "\"doctor\"",
              "\"nurse\""
            ],
            "optional": true,
            "field": "role",
            "defaultValue": "nurse",
            "description": "<p>role Role of the user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "password",
            "description": "<p>password Password of user, auto generated if not present</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    property : value\n}",
          "type": "type"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    property : value\n}",
          "type": "type"
        }
      ]
    },
    "filename": "src/routes/api/auth.route.js",
    "groupTitle": "Authentication"
  },
  {
    "type": "GET",
    "url": "/api/status",
    "title": "Check status of API",
    "name": "apiName",
    "group": "Status",
    "version": "1.0.0",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>Status description</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   \"status\" : \"ok\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "src/routes/api/index.js",
    "groupTitle": "Status"
  }
] });
