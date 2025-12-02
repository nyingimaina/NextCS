# NextCS - A Full-Stack Application Template

![NextCS Logo](https://via.placeholder.com/150/0000FF/FFFFFF?text=NextCS) <!-- Placeholder for a project logo -->

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Initial Project Setup](#initial-project-setup)
  - [Running the Application](#running-the-application)
  - [OpenAI API Key Configuration](#openai-api-key-configuration)
- [Project Structure](#project-structure)
- [Why NextCS?](#why-nextcs)
- [Contributing](#contributing)
- [License](#license)

## Introduction

NextCS is a robust and modern full-stack application template designed for rapid development of web applications. It combines the power of **Next.js** (React, TypeScript) for a dynamic and responsive frontend with **ASP.NET Core** (C#) for a scalable and performant backend. This template provides a solid foundation with clear separation of concerns, modular architecture, and essential features pre-configured, allowing developers to focus on building unique application logic.

## Features

-   **Modern Frontend:** Built with Next.js, React, and TypeScript for a cutting-edge user experience.
-   **Robust Backend:** Powered by ASP.NET Core, C#, offering high performance and scalability.
-   **Modular Architecture:** Clear separation between frontend and backend, and well-organized code within each.
-   **Type Safety:** End-to-end type safety with TypeScript on the frontend and C# on the backend.
-   **API Integration:** Pre-configured API services for seamless communication between frontend and backend.
-   **Configuration Management:** Centralized configuration for both application settings and external services.
-   **Emailing Capabilities:** Integrated email helper and notifier for sending automated communications.
-   **Persistence Layer:** Basic file-based persistence for easy data handling.
-   **Installer Generation:** Includes an NSIS script for generating a Windows installer for the backend application.
-   **Dynamic Setup Script:** An interactive `setup.sh` script to quickly configure project-specific details like application name and ports.

## Getting Started

Follow these instructions to get your NextCS project up and running.

### Prerequisites

Ensure you have the following installed on your development machine:

-   **[.NET SDK 8.0 or later](https://dotnet.microsoft.com/download)**
-   **[Node.js 18.x or later](https://nodejs.org/en/download/)**
-   **[npm](https://www.npmjs.com/get-npm) (comes with Node.js) or [Yarn](https://yarnpkg.com/getting-started/install)**
-   **[Git](https://git-scm.com/downloads)**
-   **[Perl](https://www.perl.org/get.html)** (required by the `setup.sh` script for cross-platform text replacement)

### Initial Project Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nyingimaina/NextCS.git
    cd NextCS
    ```

2.  **Run the interactive setup script:**
    This script will guide you through configuring your application name, backend port, and other placeholders. It will also rename the backend's `.csproj` file and update the solution file accordingly.
    ```bash
    bash setup.sh
    ```
    *Follow the prompts, providing your desired application name (e.g., "My Awesome App") and backend port (e.g., "5000").*

### Running the Application

After the initial setup, you can run the frontend and backend independently.

1.  **Start the Backend:**
    Navigate to the `backend` directory and run the .NET application.
    ```bash
    cd backend
    dotnet run
    ```
    The backend API will typically start on the port you configured (default: `http://localhost:5000`). You can access the Swagger UI for API documentation at `http://localhost:<your-port>/swagger`.

2.  **Start the Frontend:**
    Open a new terminal, navigate to the `frontend` directory, and start the Next.js development server.
    ```bash
    cd frontend
    npm install # or yarn install
    npm run dev # or yarn dev
    ```
    The frontend application will typically be accessible at `http://localhost:3000`.

### OpenAI API Key Configuration

This project is designed to integrate with LLM services. To configure your OpenAI API key:

1.  **Database Storage:** The application is configured to read and write the LLM API key from the database, not from a configuration file.
2.  **Frontend Configuration:** The frontend connection details are pre-configured in `front-end/.env.development`.
3.  **Initial Setup:** During the initial application run, you will be prompted or guided through the UI to enter your OpenAI API key, which will then be securely stored in the database.

## Project Structure

The project is organized into two main directories:

-   `backend/`: Contains the ASP.NET Core C# application.
    -   `Emailing/`: Email configuration and helper utilities.
    -   `Persistance/`: Data persistence logic (currently file-based).
    -   `Routing/`: API route definitions.
    -   `SymmetricPasswords/`: Utilities for symmetric password encryption.
    -   `Utils/`: General utility classes, including `EmailNotifier`.
    -   `app.csproj`: The main backend project file (renamed during setup).
    -   `appsettings.json`: Backend configuration files.
    -   `installer.nsi`: NSIS script for Windows installer.
-   `frontend/`: Contains the Next.js, React, TypeScript application.
    -   `public/`: Static assets.
    -   `src/`: Source code for the frontend.
        -   `ActionPanel/`: Reusable action panel components.
        -   `app/`: Next.js application pages and layout.
            -   `Configuration/`: UI and logic for application configuration.
            -   `Forms/`: Various reusable form components (buttons, textboxes, etc.).
            -   `IconsLibrary/`: Custom icon components.
        -   `DefaultLayout/`: Application-wide layout components.
        -   `musketeer/`: A collection of shared UI components and utilities (e.g., `ZestButton`, `ZestTextbox`, `ApiService`).
        -   `State/`: Base classes for state management logic.

## Why NextCS?

NextCS offers a powerful combination of modern technologies and thoughtful architecture, making it an excellent choice for:

-   **Rapid Prototyping:** Get a full-stack application scaffolded and running in minutes.
-   **Scalability:** Built on robust frameworks capable of handling growing user bases and complex features.
-   **Maintainability:** Clear separation of concerns and modular design lead to easier understanding and maintenance.
-   **Developer Experience:** Enjoy the benefits of TypeScript's type safety, React's component-based UI, and ASP.NET Core's mature ecosystem.
-   **Extensibility:** Easily add new features and integrate with other services thanks to its flexible design.

## Contributing

Contributions are welcome! Please feel free to fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---
*This README.md was generated by an AI assistant to help you get started with your NextCS project.*
