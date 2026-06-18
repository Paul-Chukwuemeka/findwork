# FindWork API Functionality Documentation

This document provides a detailed explanation of the API functionality built into the FindWork application.

---

## 1. Overview
The FindWork API is designed to allow developers to retrieve job postings programmatically. 

- **Base URL for public resources**: `/api/v1`
- **Authentication**: All public API requests must include an active API Key passed via the standard HTTP `Authorization` header:
  ```http
  Authorization: Bearer <your_api_key>
  ```

---

## 2. API Authentication (`validateApiKey`)
The authentication mechanism is defined in the endpoints' route handlers (e.g., `app/api/v1/jobs/route.tsx`).
- It extracts the `Authorization` header.
- Validates that the header starts with `Bearer `.
- Queries the database for the matching `apiKey` record.
- If a valid key is found:
  - It returns the associated user object.
  - It updates the `lastUsed` timestamp of the API Key to the current date and time.
- If no valid key is found, the API returns a `401 Unauthorized` JSON response.

---

## 3. Endpoints Reference

### A. List Jobs (`GET /api/v1/jobs`)
Retrieves a paginated list of active jobs.

#### Query Parameters (All Optional):
| Parameter  | Type     | Description |
| :---       | :---     | :---        |
| `q`        | `string` | Search query matching either the job `title` (case-insensitive contains) or the `tags` list (array contains). |
| `type`     | `string` | Filters jobs by their employment type. Allowed values: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`. |
| `location` | `string` | Filters jobs by their location (case-insensitive contains). |
| `page`     | `number` | Page number for pagination (defaults to `1`). |
| `limit`    | `number` | Maximum number of results per page (defaults to `20`, maximum capped at `50`). |

#### Response Structure:
Returns a JSON object containing a `data` array of jobs and a `meta` object for pagination metadata.

```json
{
  "data": [
    {
      "id": "job_uuid_1",
      "title": "Senior Frontend Engineer",
      "description": "Job description here...",
      "type": "FULL_TIME",
      "location": "Lagos, Nigeria (Remote)",
      "salaryRange": "$3,000 - $5,000 / month",
      "tags": ["React", "TypeScript", "Next.js"],
      "isActive": true,
      "slug": "senior-frontend-engineer-lagos",
      "companyId": "company_uuid",
      "createdAt": "2026-06-15T12:00:00.000Z",
      "updatedAt": "2026-06-15T12:00:00.000Z",
      "company": {
        "name": "AfricaTech",
        "slug": "africatech",
        "website": "https://africatech.example.com",
        "location": "Lagos, Nigeria"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### B. Get Job Details (`GET /api/v1/jobs/[id]`)
Retrieves the details of a single active job using its unique ID.

#### Path Parameters:
- `id` (string, required): The UUID of the job.

#### Response Structure:
```json
{
  "data": {
    "id": "job_uuid_1",
    "title": "Senior Frontend Engineer",
    "description": "Job description here...",
    "type": "FULL_TIME",
    "location": "Lagos, Nigeria (Remote)",
    "salaryRange": "$3,000 - $5,000 / month",
    "tags": ["React", "TypeScript", "Next.js"],
    "isActive": true,
    "slug": "senior-frontend-engineer-lagos",
    "companyId": "company_uuid",
    "createdAt": "2026-06-15T12:00:00.000Z",
    "updatedAt": "2026-06-15T12:00:00.000Z",
    "company": {
      "id": "company_uuid",
      "name": "AfricaTech",
      "slug": "africatech",
      "website": "https://africatech.example.com",
      "location": "Lagos, Nigeria",
      "about": "About the company...",
      "logoUrl": "/uploads/logo.png",
      "createdAt": "2026-06-15T11:00:00.000Z",
      "updatedAt": "2026-06-15T11:00:00.000Z"
    }
  }
}
```

#### Error Responses:
- **401 Unauthorized**: If the `Authorization` header is invalid or missing.
- **404 Not Found**: If no active job matches the specified ID.

---

## 4. API Key Management (`/api/user/api-keys`)
Users manage their API keys through the developer dashboard. The dashboard interacts with `/api/user/api-keys` via three HTTP methods:

1. **`GET`**: Lists all active API keys associated with the logged-in user (includes columns: `id`, `label`, `lastUsed`, `createdAt`, and the obfuscated or full `key`).
2. **`POST`**: Generates a new API key for the authenticated user.
   - Generates a cryptographically secure key starting with the prefix `db_` (e.g., `db_d489...`).
   - Accepts a `label` (e.g., "Development Key") in the JSON request body.
3. **`DELETE`**: Revokes (deletes) the specified API key by ID, immediately blocking any future API requests using that key.

---

## 5. File Architecture
- **Public API routes**:
  - `app/api/v1/jobs/route.tsx`
  - `app/api/v1/jobs/[id]/route.tsx`
- **Internal API Key management**:
  - `app/api/user/api-keys/route.ts`
- **Database Schema**:
  - Defined in `prisma/schema.prisma` under the model `ApiKey`:
    ```prisma
    model ApiKey {
      id        String    @id @default(uuid())
      userId    String
      label     String?
      key       String    @unique
      lastUsed  DateTime?
      createdAt DateTime  @default(now())
      user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
    }
    ```
