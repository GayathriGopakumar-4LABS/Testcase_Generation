# QA Test Case Generator — User Manual

**Version 1.0 · May 2026**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
   - 2.1 [Creating an Account](#21-creating-an-account)
   - 2.2 [Signing In](#22-signing-in)
   - 2.3 [Signing Out](#23-signing-out)
3. [Dashboard](#3-dashboard)
4. [Projects](#4-projects)
   - 4.1 [Creating a Project](#41-creating-a-project)
   - 4.2 [Editing a Project](#42-editing-a-project)
   - 4.3 [Deleting a Project](#43-deleting-a-project)
5. [Generating Test Cases](#5-generating-test-cases)
   - 5.1 [Filling In the Generation Form](#51-filling-in-the-generation-form)
   - 5.2 [Uploading a Requirements File](#52-uploading-a-requirements-file)
   - 5.3 [Running the Generation](#53-running-the-generation)
   - 5.4 [Reading the Results](#54-reading-the-results)
6. [History](#6-history)
   - 6.1 [Browsing Past Generations](#61-browsing-past-generations)
   - 6.2 [Searching and Filtering](#62-searching-and-filtering)
   - 6.3 [Expanding a Generation](#63-expanding-a-generation)
   - 6.4 [Deleting a Generation](#64-deleting-a-generation)
7. [Exporting Test Cases](#7-exporting-test-cases)
8. [Navigation Reference](#8-navigation-reference)
9. [Field & Validation Reference](#9-field--validation-reference)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Introduction

**QA Test Case Generator** is an AI-powered web application that converts plain-English software requirements into structured, ready-to-use QA test cases. Instead of writing test cases manually, you describe what a feature should do and the application — using Google Gemini — produces 5–10 detailed test cases covering happy paths, edge cases, and error scenarios.

### Key capabilities

| Capability | Description |
|---|---|
| **AI Generation** | Paste or upload a requirement and receive structured test cases in seconds |
| **Projects** | Group related generations together for better organisation |
| **Multiple test types** | Functional, Integration, Regression, Performance, Security, UI/UX, API, and more |
| **Export** | Download any generation as JSON, CSV, or Markdown |
| **History** | Browse, search, filter, and re-read all past generations |
| **Secure accounts** | Each user's data is private and protected by JWT authentication |

---

## 2. Getting Started

### 2.1 Creating an Account

1. Open the application in your browser (default: `http://localhost:3000`).
2. You are automatically redirected to the **Dashboard** page. If you are not logged in, the application redirects you to the **Login** page.
3. Click **Create one** below the sign-in form, or navigate directly to `/register`.
4. Fill in the registration form:

   | Field | Required | Notes |
   |---|---|---|
   | Full name | No | Displayed in the sidebar and avatar initials |
   | Email | Yes | Used as your login identifier |
   | Password | Yes | Minimum 8 characters |
   | Confirm password | Yes | Must match the password field exactly |

5. Click **Create account**. On success you are logged in and taken to the Dashboard.

> **Tip:** Your name and email are shown in the bottom-left corner of the sidebar whenever you are logged in.

---

### 2.2 Signing In

1. Go to `/login` (or click **Sign in** on the registration page).
2. Enter your **Email** and **Password**.
3. Click **Sign in**.

Your session is stored securely in the browser and persists across page refreshes for up to 24 hours. You do not need to log in again unless the session expires or you sign out manually.

---

### 2.3 Signing Out

Click **Sign out** at the bottom of the left sidebar. You are immediately redirected to the login page and your local session is cleared.

---

## 3. Dashboard

The **Dashboard** (`/dashboard`) is the first page you see after logging in. It provides a high-level overview of your activity:

- **Stats tiles** — total number of projects, total generations, and total test cases produced.
- **Quick-action shortcuts** — buttons to jump directly to Projects or Generate pages.

Use the Dashboard as your home base for a quick status check before diving into work.

---

## 4. Projects

Projects are containers that group related test-case generations together. For example, you might create one project per product area, sprint, or feature epic.

Navigate to **Projects** (`/projects`) from the sidebar.

---

### 4.1 Creating a Project

1. Click **New project** in the top-right corner of the Projects page.
2. A dialog opens. Fill in:

   | Field | Required | Notes |
   |---|---|---|
   | Project name | Yes | Up to 100 characters |
   | Description | No | Up to 500 characters; brief summary of what the project covers |

3. Click **Create project**. The new project card appears in the grid immediately.

Each project card shows:
- The project name and creation date.
- The number of generations and total test cases produced within it.
- A **Generate tests** button that pre-selects this project on the Generate page.

---

### 4.2 Editing a Project

1. On any project card, click the **⋮** (three-dot menu) in the top-right corner.
2. Select **Edit**.
3. Update the name or description in the dialog.
4. Click **Save changes**.

---

### 4.3 Deleting a Project

1. On the project card, click **⋮ → Delete**.
2. The project is permanently removed.

> ⚠️ **Warning:** Deleting a project also permanently removes all generations and test cases belonging to it. This action cannot be undone.

---

## 5. Generating Test Cases

Navigate to **Generate** (`/generate`) from the sidebar, or click **Generate tests** on any project card.

---

### 5.1 Filling In the Generation Form

The generation form has four fields:

| Field | Required | Description |
|---|---|---|
| **Generation title** | Yes | A short label for this set of test cases (e.g. *"User login — happy path & edge cases"*). Max 120 characters. |
| **Project** | Yes | The project this generation belongs to. Select from your existing projects. |
| **Test type** | Yes | The category of tests to produce. See the list of test types below. |
| **Requirement** | Yes | The plain-English description of the feature or behaviour to test. Minimum 20 characters. |

#### Available test types

- Functional
- Integration
- Regression
- Performance
- Security
- UI/UX
- API
- Smoke
- Acceptance
- End-to-End

> **Tip:** Be specific in the Requirement field. Include user roles, expected behaviours, edge cases you already know about, boundary values, and any relevant constraints. The more context you provide, the more precise the generated test cases will be.

---

### 5.2 Uploading a Requirements File

Instead of typing the requirement manually, you can upload a document:

1. Click **Upload file** next to the Requirement label.
2. Select a file from your computer. Supported formats:

   | Format | Extension |
   |---|---|
   | Plain text | `.txt` |
   | Markdown | `.md` |
   | PDF | `.pdf` |
   | Word document | `.docx` |

3. The application extracts the text and populates the Requirement field automatically.
4. A badge showing the file name appears next to the label. Click **✕** on the badge to clear the content and remove the file.

> **Note:** PDF and DOCX parsing happens entirely in the browser — your file is never sent to any server during the extraction step.

---

### 5.3 Running the Generation

Click **Generate test cases** (the large button at the bottom of the form).

- The button shows a spinner and the label changes to **Generating test cases…** while the AI is working.
- Generation typically completes in 5–15 seconds, depending on the length of the requirement.
- When complete, the results panel appears immediately to the right of (or below, on smaller screens) the form.
- A success toast notification confirms that generation succeeded.

If generation fails (e.g. network error, invalid API key), an error toast is shown with a description. No partial results are saved.

---

### 5.4 Reading the Results

The **Results Panel** appears after a successful generation and contains:

**Header row**
- The generation title.
- A badge showing the test type.
- A count of how many test cases were produced (typically 5–10).
- Export buttons: **JSON**, **CSV**, **Markdown** (see [Section 7](#7-exporting-test-cases)).

**Test case cards** — each card represents one test case and shows:

| Section | Description |
|---|---|
| **ID** | The test case identifier (e.g. `TC-001`) |
| **Title** | A one-line summary of what is being tested |
| **Priority** | High / Medium / Low, colour-coded for quick scanning |
| **Test type** | The type label from the form |
| **Scenario** | A brief narrative description of the test scenario |
| **Preconditions** | Any setup required before executing the test |
| **Steps** | Numbered list of actions to perform |
| **Test data** | Specific input values or data sets to use (when applicable) |
| **Expected result** | The outcome that confirms the test passes (highlighted in green) |
| **Remarks** | Additional notes from the AI (when applicable) |

Click anywhere on a test case card header to **expand** or **collapse** its details. The first test case is expanded by default.

---

## 6. History

The **History** page (`/history`) shows every generation you have ever created, organised by project.

---

### 6.1 Browsing Past Generations

Each generation is shown as a card displaying:
- The generation title and test type badge.
- The project name, number of test cases, and creation date.
- A **download icon** (⬇) for export options.
- A **chevron** (∨/∧) indicating whether the card is expanded.

Generations are grouped under section headings by project name. The count of generations within each project is shown beside the heading.

---

### 6.2 Searching and Filtering

Three controls at the top of the History page let you narrow the list:

| Control | What it filters |
|---|---|
| **Search box** | Matches against generation title or requirement text |
| **Project dropdown** | Shows only generations belonging to the selected project |
| **Test type dropdown** | Shows only generations of the selected test type |

All three filters are active simultaneously. A **Clear** button appears whenever any filter is set; clicking it resets all filters at once.

---

### 6.3 Expanding a Generation

Click anywhere on a generation card to expand it. The full list of test cases loads on demand and is displayed using the same collapsible test case cards as the Generate page results panel.

Click the card header again to collapse it.

---

### 6.4 Deleting a Generation

1. Click the **⬇ (download/actions)** icon on any generation card.
2. Select **Delete** from the dropdown menu.
3. The generation and all its test cases are permanently removed.

> ⚠️ **Warning:** Deletion is immediate and cannot be undone.

---

## 7. Exporting Test Cases

You can export any generation in three formats. Export buttons are available in two places:
- The **Results Panel** immediately after generation (JSON / CSV / Markdown buttons).
- The **History page** via the ⬇ dropdown on each generation card.

| Format | Best for | File name |
|---|---|---|
| **JSON** | Programmatic processing, importing into other tools | `export.json` |
| **CSV** | Spreadsheet applications (Excel, Google Sheets) | `export.csv` |
| **Markdown** | Documentation, wikis, GitHub pull-request descriptions | `export.markdown` |

Clicking an export button immediately triggers a file download. No additional confirmation is required.

---

## 8. Navigation Reference

The left sidebar is visible on all dashboard pages after login.

| Sidebar item | URL | Purpose |
|---|---|---|
| **Dashboard** | `/dashboard` | Stats overview and quick actions |
| **Projects** | `/projects` | Create and manage projects |
| **Generate** | `/generate` | Generate new test cases |
| **History** | `/history` | Browse all past generations |
| **Sign out** | — | Ends the current session |

The page title and subtitle displayed in the top header change automatically to match the current page.

---

## 9. Field & Validation Reference

### Registration

| Field | Rule |
|---|---|
| Email | Must be a valid email format |
| Password | Minimum 8 characters |
| Confirm password | Must match the Password field |

### Project dialog

| Field | Rule |
|---|---|
| Project name | Required; 1–100 characters |
| Description | Optional; max 500 characters |

### Generation form

| Field | Rule |
|---|---|
| Generation title | Required; 1–120 characters |
| Project | Required; must select an existing project |
| Test type | Required; must select from the dropdown |
| Requirement | Required; minimum 20 characters |

Validation errors appear in red directly below the relevant field. The form cannot be submitted while any field is invalid.

---

## 10. Troubleshooting

### I am immediately redirected to the login page after opening the app

Your session may have expired (sessions last 24 hours). Sign in again to continue. If you were never logged in, this is expected behaviour — the dashboard is only accessible to authenticated users.

### Generation failed / "Generation failed" toast appeared

- Check that you have an active internet connection.
- Ensure the Requirement field has at least 20 characters of meaningful text.
- If the problem persists, ask your administrator to verify that the `GOOGLE_API_KEY` is valid and has not exceeded its quota.

### File upload shows an error

- Confirm the file is one of the supported formats: `.txt`, `.md`, `.pdf`, `.docx`.
- For PDF files, ensure the document contains selectable text (scanned image-only PDFs cannot be parsed).
- Try copying the text manually into the Requirement textarea as a fallback.

### A project card shows 0 generations even though I generated tests for it

This can happen if you created the generation while a filter was active on the History page. Navigate to **History**, clear all filters, and verify the generation appears. If the project ID was not set correctly during generation, the generation will appear under a different project.

### I cannot see the Export buttons

Export buttons appear in two places:
1. **Results Panel** — visible immediately after a generation completes on the Generate page.
2. **History page** — accessible via the **⬇** icon on each generation card.

If neither location shows export options, ensure you are logged in and that the generation has completed successfully.

### The sidebar shows my email instead of my name

The sidebar displays your **Full name** if one was provided at registration. If you registered without a full name, your email address is used as the display label. The avatar shows the first two letters of your name (or email) as initials.

---

*For technical setup, environment variables, API reference, and deployment instructions, refer to the [README.md](README.md).*
