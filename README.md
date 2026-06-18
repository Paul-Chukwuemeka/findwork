# FindWork 🚀

**FindWork** is a developer-focused job board and hiring platform tailored for the African tech ecosystem. It connects developers with top-tier companies in tech hubs like Lagos, Nairobi, Accra, Cape Town, and remote opportunities.

Built on Next.js 16 (App Router) and powered by PostgreSQL, Prisma, and NextAuth.js, FindWork features role-based user flows, application tracking, job alert subscriptions, and a developer-facing REST API secured via client API keys.

---

## 📌 Table of Contents
1. [Key Features](#-key-features)
   - [For Developers](#-for-developers)
   - [For Employers](#-for-employers)
2. [Tech Stack](#-tech-stack)
3. [Database Schema (Prisma)](#-database-schema-prisma)
4. [Getting Started](#-getting-started)
   - [Prerequisites](#1-prerequisites)
   - [Environment Variables](#2-environment-variables)
   - [Installation](#3-installation)
   - [Database Setup & Seeding](#4-database-setup--seeding)
   - [Running the Development Server](#5-running-the-development-server)
5. [Seeding Details & Test Accounts](#-seeding-details--test-accounts)
6. [API Reference](#-api-reference)
   - [List Active Jobs](#get-active-jobs-get-apiv1jobs)
   - [Get Single Job Details](#get-job-details-get-apiv1jobsid)

---

## 🌟 Key Features

### 💻 For Developers
* **Onboarding Flow:** A multi-step wizard (`/onboarding`) after registration to select user role (Developer vs Employer) and collect developer profiles (bio, skills list, GitHub, LinkedIn, portfolio, and primary resume upload).
* **Developer Workspace Navigation:** A unified navigation tab bar (`DeveloperNav`) separating dashboard views, profile settings, resume uploads, alert subscriptions, and API key generation.
* **Developer Profile:** Manage personal info, social links, bio, and technical skills under `/developer/profile`.
* **Resume & CV Management:** Dedicated dashboard section (`/developer/resumes`) to upload multiple PDF/Word resumes, set a default/primary resume for applications, and remove old CVs.
* **Job Discovery & Search & Saved Jobs:** Filter by type, location, tags, and keywords. Save/bookmark roles to review later from the dashboard.
* **Job Alert Subscriptions:** Create customized alerts based on keywords and location. Receive alerts instantly when a newly posted job matches your criteria.
* **One-Click Applications:** Apply to jobs with custom cover letters and tracked application statuses (`PENDING`, `REVIEWED`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`).
* **Developer REST API:** Generate, view, and revoke personal API keys (`/developer/api-keys`) to query the platform's job directory programmatically.

### 🏢 For Employers
* **Onboarding & Profile Setup:** Post-registration setup flow to complete employer company details (name, website, location, logo, and about description) before publishing job listings.
* **Company Profiles & Settings:** Manage company pages (`/employer/company/[id]`) complete with logo uploads, websites, location details, and active postings management (toggle job status between Active/Closed).
* **Job Listing Lifecycle:** Publish, edit, activate, or close positions dynamically.
* **Applicant Pipeline:** Track applicant lists, review cover letters, download resumes, and update application statuses (`PENDING`, `REVIEWING`, `SHORTLISTED`, `REJECTED`, `ACCEPTED`) in real time via an interactive dropdown pipeline.

---

## ⚡ Tech Stack

* **Framework:** Next.js 16 (App Router) & React 19
* **Database:** PostgreSQL
* **ORM:** Prisma ORM
* **Authentication:** NextAuth.js (v5 Beta)
* **Styling:** Tailwind CSS v4 + Vanilla CSS Design Tokens
* **Storage:** AWS S3 / Cloudflare R2 (for Resumes and Assets)
* **Language:** TypeScript

---

## 🗄️ Database Schema (Prisma)

FindWork runs on a PostgreSQL database with the following models:
* `User`: Stores developer/employer accounts, roles, profiles (bio, skills, githubUrl, linkedinUrl, portfolioUrl), and onboarding state.
* `Company`: Managed by employers, hosts job listings.
* `Job`: Job details including tags, location, salary range, and employment type.
* `Application`: Links users (developers) to jobs with cover letters, resumes, and status flows.
* `SavedJob`: Simple relation tracking bookmarked jobs.
* `AlertSub`: Job alert preferences for users based on keywords and locations.
* `ApiKey`: Personal authentication tokens for querying the public API.
* `Resume`: References to uploaded files on S3.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* Node.js (v18.x or v20.x recommended)
* PostgreSQL database instance
* AWS S3 / Cloudflare R2 Bucket (for resume storage)

### 2. Environment Variables
Create a `.env.local` (or copy `.env`) in the root of the project:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/findwork?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 / Cloudflare R2 Storage Config
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="findwork"
R2_PUBLIC_URL="https://pub-your-bucket-id.r2.dev"
NEXT_PUBLIC_R2_PUBLIC_URL="https://pub-your-bucket-id.r2.dev"
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

## 👤 Seeding Details & Test Accounts

The database seed script (`prisma/seed.mjs`) creates three default accounts (password is `password123` for all):
* **Employer:** `amina@findwork.dev` (Owner of *Kora Labs* and *Kora Studio*)
* **Developer:** `tunde@findwork.dev` (Active applicant with pre-filled applications)
* **New Developer:** `aisha@findwork.dev` (Un-onboarded account to test onboarding steps)
* **Default API Key:** `db_dev_tunde_local_key`

---

## 🔌 API Reference

For detailed documentation, endpoints response payloads, and usage, please refer to [API_EXPLANATION.md](./API_EXPLANATION.md).

### Get Active Jobs (`GET /api/v1/jobs`)
Fetch a paginated list of all active jobs on the platform.

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

### Get Job Details (`GET /api/v1/jobs/[id]`)
Retrieve details for a single active job using its unique ID.

* **Headers:**
  ```http
  Authorization: Bearer <your_api_key>
  ```
* **Path Parameters:**
  * `id` (string, required): The job's unique identifier.

---

## 📄 License
This project is proprietary.
