# ERP Luca Project

A modern, cross-platform desktop Enterprise Resource Planning (ERP) system built with Rust, Tauri, and a React/Next.js frontend. This application is designed to be robust, secure, and scalable, starting with a modular architecture that is ready for future growth.

## ✨ Core Features

The application is designed to manage the entire business lifecycle through a series of integrated modules:

* **✅ Employee Management:** A single source of truth for all employee information.
* **✅ Payroll Management:** Manage salaries and financial information for each employee.
* **📝 Time and Attendance Management:** *(Planned for Sprint 5 & 6)* Track work hours and manage leave requests.
* **📝 Performance Management:** *(Future Sprint)* Set goals, conduct reviews, and manage employee performance.
* **📝 Reporting and Analytics:** *(Future Sprint)* Gain insights from your business data through dashboards and reports.

## 🏛️ Architectural Overview

This project is built using a **Modular Monolithic** architecture. This approach provides the simplicity of a single, deployable application while enforcing the strict boundaries and separation of concerns found in microservices.

* **Modules:** The backend is divided into independent modules based on business domains (`employee`, `payroll`, `attendance`, `inventory`, etc.).
* **Decoupling:** Modules do **not** communicate directly. Instead, they use an **event-driven** approach. For example, when the `employee` module creates a new employee, it publishes an `EmployeeCreatedEvent`. The `payroll` module listens for this event and automatically creates a default payroll profile, without the two modules ever knowing about each other's internal code.
* **Scalability:** This architecture makes it straightforward to extract a module into its own microservice in the future if the need arises, with minimal changes to the rest of the application.

## 🛠️ Tech Stack

### Backend (`src-tauri`)

* **Framework:** [Tauri](https://tauri.app/) (v2)
* **Language:** [Rust](https://www.rust-lang.org/)
* **Database:** [SQLite](https://www.sqlite.org/index.html)
* **ORM & Migrations:** [Diesel](https://diesel.rs/)
* **State Management:** Tauri Managed State

### Frontend (`src`)

* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** Headless UI principles

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running for development.

### Prerequisites

1.  **System Dependencies:** Follow the official [Tauri v2 prerequisites guide](https://tauri.app/v2/guides/getting-started/prerequisites) for your operating system.
2.  **Node.js & pnpm:** Ensure you have Node.js (LTS version recommended). We use `pnpm` as the package manager. If you don't have it, install it globally:
    ```
    npm install -g pnpm
    ```
3.  **Diesel CLI:** Install the command-line tool for interacting with the database:
    ```
    cargo install diesel_cli --no-default-features --features sqlite
    ```

### Installation & Setup

1.  **Clone the repository:**
    ```
    git clone <your-repository-url>
    cd luca_project
    ```
2.  **Install frontend dependencies:**
    ```
    pnpm install
    ```
3.  **Set up the database:**
    * Navigate to the backend directory: `cd src-tauri`
    * Run the Diesel setup command (only needs to be done once): `diesel setup`
    * Run all pending database migrations to create the tables: `diesel migration run`
    * Generate the `schema.rs` file so Rust can see your tables: `diesel print-schema > src/schema.rs`
    * Navigate back to the root directory: `cd ..`
4.  **Run the application in development mode:**
    ```
    pnpm tauri dev
    ```

## 🧪 Running Tests

The project has two sets of tests: backend integration tests for Rust and frontend end-to-end tests with Cypress.

### Backend Tests (Rust / Diesel)

These tests validate the database logic in the repositories. Because they use an in-memory database, they must be run serially to prevent race conditions.

### Navigate to the backend directory
```
cd src-tauri
```
### Run the tests with a single thread
```
cargo test -- --test-threads=1
```

### Frontend Tests (Cypress E2E)

These tests simulate user interactions in the live application.

1.  **Start the development server** in one terminal:
    ```
    pnpm tauri dev
    ```
2.  **Wait for the app to launch**, then open a **second terminal**.
3.  **Run Cypress:**
    ```
    pnpm cypress open
    ```