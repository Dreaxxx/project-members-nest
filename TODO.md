Hi!

This is an off-site test for the Backend Developer position at Cloud Solutions (Wimi).

# Context

Wimi allows users to collaborate around projects.

To be able to interact with a project, users need to be explicit members of a project.

The given SQLite file `projects.db` contains three tables that captures those statements:

- `users`
- `projects`
- `projects_members`

# Exercise A: REST API Endpoints

## Requirements

- Use the given SQLite file as the database.
- Ensure proper error handling and return appropriate HTTP status codes.
- Validate input data and handle edge cases.
- Write tests for each endpoint.
- Follow RESTful principles and best practices.

## 1. GET /projects/:id/members

**Description:**
Retrieve a list of members for a specific project.

**Request:**

- Method: GET
- URL: `/projects/:id/members`
- URL Parameters:
  - `id` (integer): The ID of the project.

**Response:**

- Status: 200 OK
- Body: JSON array of members, each member containing:
  - `id` (integer): The ID of the member.
  - `name` (string): The full name of the member.

**Example:**

```json
[
  {
    "id": 1,
    "name": "John Doe"
  },
  {
    "id": 2,
    "name": "Jane Smith"
  }
]
```

## 2. POST /projects/:id/members

**Description:**
Add a new member to a specific project.

**Request:**

- Method: POST
- URL: `/projects/:id/members`
- URL Parameters:
  - `id` (integer): The ID of the project.
- Body: JSON object containing:
  - `user_ids` (array of integers): The IDs of users to be added as members.

**Response:**

- Status: 201 Created
- Body: JSON object of the newly added member, containing:
  - `id` (integer): The ID of the member.
  - `name` (string): The full name of the member.

**Example:**

```json
{
  "id": 3,
  "name": "Alice Johnson"
}
```

## 3. DELETE /projects/:projectId/members/:userId

**Description:**
Remove a member from a specific project.

**Request:**

- Method: DELETE
- URL: `/projects/:projectId/members/:userId`
- URL Parameters:
  - `projectId` (integer): The ID of the project.
  - `userId` (integer): The ID of the member to be removed.

**Response:**

- Status: 204 No Content

# Exercise B: Groups and Recursive Members

## Requirements

- Update the SQL schema to be able to reprensent groups and group members (which can be either user or groups).
- Updat ethe SQL schema to be able to add groups and users as project members
- A limit of 5 nested groups should be used.
- Update the `GET /projects/:id/members` API endpoint to fetch members recursively (flattened).
- Other endpoints can be ignored.

## GET /projects/:id/members API endpoint

**Description:**
Retrieve a list of members for a specific project, including members of groups recursively.

**Request:**

- Method: GET
- URL: `/projects/:id/members`
- URL Parameters:
  - `id` (integer): The ID of the project.

**Response:**

- Status: 200 OK
- Body: JSON array of members, each member containing:
  - `id` (integer): The ID of the member.
  - `name` (string): The full name of the member.
  - `groups` (array of string): The names of the groups from which the member was included.

**Example:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "groups": []
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "groups": ["A", "B"]
  },
  {
    "id": 3,
    "name": "Alice Johnson",
    "groups": ["B"]
  },
  {
    "id": 4,
    "name": "Ben Stevenson",
    "groups": ["A"]
  }
]
```

# Rules

- You can use any language or framework, but choosing a language we currently use in our stack is a plus (TypeScript | JavaScript | PHP).
- If you think something needs to be clarified, please contact romain.franceschini@wimi-teamwork.com.

# What we pay attention to

- Structure of the code
- Use of git
- Respect of KISS and DRY principles
- Tests
- API best practices

# How to

1. Do the exercise
2. Ping us when you're done
3. We will contact you to discuss your solution
