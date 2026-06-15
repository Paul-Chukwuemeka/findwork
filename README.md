# FindWork 🚀

**FindWork** is a developer-focused job board and hiring platform tailored for the African tech ecosystem. It connects developers with top-tier companies in tech hubs like Lagos, Nairobi, Accra, Cape Town, and remote opportunities.

Built on Next.js 16 (App Router) and powered by PostgreSQL, Prisma, and NextAuth.js, FindWork features role-based user flows, application tracking, job alert subscriptions, and a developer-facing REST API secured via client API keys.

---

## Key Features

### 💻 For Developers
* **Job Discovery:** Filter by type (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`), location, tags, and keywords.
* **Resume Management:** Safe resume uploads powered by AWS S3 integration.
* **One-Click Applications:** Apply to jobs with custom cover letters and tracked application statuses (`PENDING`, `REVIEWED`, `SHORTLISTED`, `REJECTED`).
* **Saved Jobs & Alerts:** Save jobs to apply later and set up customized alert subscriptions.
* **Developer REST API:** Generate and manage personal API keys to query the platform's job directory programmatically.

### 🏢 For Employers
* **Company Profiles:** Create and manage company pages complete with logos, descriptions, and verified status tags.
* **Job Listing Lifecycle:** Publish, edit, and archive active positions.
* **Applicant Pipeline:** Track applicant lists, review cover letters, download resumes, and update application statuses in real time.

### 🔌 Developer REST API
* **Bearer Token Auth:** Secured endpoints requiring `Authorization: Bearer <key>`.
* **Flexible Querying:** Search and paginated endpoints to fetch active job postings.

---

## Tech Stack

* **Framework:** Next.js 16 (App Router) & React 19
* **Database:** PostgreSQL
* **ORM:** Prisma ORM
* **Authentication:** NextAuth.js (v5 Beta)
* **Styling:** Tailwind CSS v4 + Vanilla CSS Design Tokens
* **Storage:** AWS S3 (for Resumes and Assets)
* **Language:** TypeScript

---

## Database Schema (Prisma)

FindWork runs on a PostgreSQL database with the following models:
* `User`: Stores developer/employer accounts, roles, and profiles.
* `Company`: Managed by employers, hosts job listings.
* `Job`: Job details including tags, location, salary range, and expiry date.
* `Application`: Links users (developers) to jobs with cover letters, resumes, and status flows.
* `SavedJob`: Simple relation tracking bookmarked jobs.
* `AlertSub`: Job alert preferences for users based on keywords and locations.
* `ApiKey`: Personal authentication tokens for querying the public API.
* `Resume`: References to uploaded files on S3.

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* Node.js (v18.x or v20.x recommended)
* PostgreSQL database instance
* AWS S3 Bucket (for resume storage)

### 2. Environment Variables
Create a `.env.local` (or copy `.env`) in the root of the project:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/findwork?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 Storage Config
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="findwork-resumes"
```

### 3. Installation
Install project dependencies:
```bash
npm install
```

### 4. Database Setup & Seeding
Deploy Prisma migrations and seed the database with initial developer accounts, companies, and job listings:
```bash
npx prisma db push
npm run seed
```

### 5. Running the Development Server
Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Seeding Details & Test Accounts
The database seed script (`prisma/seed.mjs`) creates three default accounts (password is `password123` for all):
* **Employer:** `amina@findwork.dev` (Owner of *Kora Labs* and *Kora Studio*)
* **Developer:** `tunde@findwork.dev` (Active applicant with pre-filled applications)
* **New Developer:** `aisha@findwork.dev` (Un-onboarded account to test onboarding steps)
* **Default API Key:** `db_dev_tunde_local_key`

---

## API Reference

### Get Active Jobs
Fetch a paginated list of all active jobs on the platform.

* **Endpoint:** `GET /api/v1/jobs`
* **Headers:**
  ```http
  Authorization: Bearer <your_api_key>
  ```
* **Query Parameters:**
  * `q` (string, optional): Search query matching job titles or tags.
  * `type` (string, optional): Filter by job type (`FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`).
  * `location` (string, optional): Case-insensitive location filter (e.g. `remote` or `Lagos`).
  * `page` (number, optional): Page number (default: `1`).
  * `limit` (number, optional): Page size (default: `20`, max: `50`).

* **Example Response:**
  ```json
  {
    "data": [
      {
        "id": "cm123abc...",
        "title": "Frontend Engineer",
        "slug": "frontend-engineer-kora-labs",
        "description": "Own the core product experience...",
        "type": "FULL_TIME",
        "location": "Lagos, Nigeria",
        "salaryRange": "$55k - $85k",
        "tags": ["React", "Next.js", "TypeScript"],
        "isActive": true,
        "createdAt": "2026-06-01T10:00:00.000Z",
        "company": {
          "name": "Kora Labs",
          "slug": "kora-labs",
          "website": "https://koralabs.dev",
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

## License
This project is proprietary.
