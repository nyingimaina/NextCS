#!/bin/bash

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}--- Dependency Upgrade Script ---${NC}"
echo "This script will attempt to upgrade dependencies for both frontend (JavaScript) and backend (C#) projects."
echo "For C# projects, it will list outdated packages and provide instructions for manual review and upgrade, as fully automated upgrades can sometimes introduce breaking changes."
echo

# --- Frontend (JavaScript) Dependencies ---
echo -e "${BLUE}>>> Upgrading Frontend Dependencies (Next.js/React)...${NC}"
if [ -d "frontend" ]; then
    cd frontend || { echo -e "${RED}Error: Could not navigate to frontend directory.${NC}"; exit 1; }

    if [ -f "yarn.lock" ]; then
        echo -e "${YELLOW}Yarn lock file found. Using Yarn for upgrade.${NC}"
        yarn upgrade
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Frontend Yarn dependencies upgraded successfully.${NC}"
        else
            echo -e "${RED}Error: Frontend Yarn dependency upgrade failed.${NC}"
        fi
    elif [ -f "package.json" ]; then
        echo -e "${YELLOW}package.json found. Using npm for upgrade.${NC}"
        npm update
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Frontend npm dependencies upgraded successfully.${NC}"
        else
            echo -e "${RED}Error: Frontend npm dependency upgrade failed.${NC}"
        fi
    else
        echo -e "${YELLOW}No package.json or yarn.lock found in frontend directory. Skipping frontend upgrade.${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}Frontend directory not found. Skipping frontend upgrade.${NC}"
fi
echo

# --- Backend (C#) Dependencies ---
echo -e "${BLUE}>>> Checking Backend Dependencies (ASP.NET Core/NuGet)...${NC}"
if [ -d "backend" ]; then
    cd backend || { echo -e "${RED}Error: Could not navigate to backend directory.${NC}"; exit 1; }

    if ls *.csproj &> /dev/null; then
        echo -e "${YELLOW}Listing outdated NuGet packages:${NC}"
        dotnet list package --outdated
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Outdated NuGet packages listed. Please review them.${NC}"
            echo -e "${YELLOW}To upgrade a specific package, use: dotnet add package <PackageName> --version <NewVersion>${NC}"
            echo -e "${YELLOW}Example: dotnet add package Microsoft.AspNetCore.OpenApi --version 8.0.19${NC}"
        else
            echo -e "${RED}Error: Failed to list outdated NuGet packages.${NC}"
        fi
    else
        echo -e "${YELLOW}No .csproj files found in backend directory. Skipping backend check.${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}Backend directory not found. Skipping backend check.${NC}"
fi
echo

echo -e "${GREEN}--- Dependency Upgrade Script Finished ---${NC}"
echo "Remember to test your application thoroughly after upgrading dependencies."
