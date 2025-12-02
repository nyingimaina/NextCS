#!/bin/bash

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}--- Dependency Upgrade Script ---${NC}"
echo "This script will attempt to upgrade dependencies for both frontend (JavaScript) and backend (C#) projects."
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
        # Get outdated packages
        outdated_packages_output=$(dotnet list package --outdated)
        echo "$outdated_packages_output"

        # Parse outdated packages
        # Extracts lines starting with '   > ' and then gets PackageName, CurrentVersion, LatestVersion
        upgradable_packages=$(echo "$outdated_packages_output" | grep '^   > ' | awk '{print $2, $4, $5}')

        if [ -z "$upgradable_packages" ]; then
            echo -e "${GREEN}All backend NuGet packages are up to date.${NC}"
        else
            echo -e "${YELLOW}The following backend NuGet packages are outdated:${NC}"
            echo "$upgradable_packages" | while read -r package_name current_version latest_version; do
                echo -e "  - ${package_name} (Current: ${current_version}, Latest: ${latest_version})"
            done
            echo

            read -p "Do you want to automatically upgrade all listed backend packages to their latest stable versions? (y/n): " confirm_upgrade
            if [[ "$confirm_upgrade" == "y" || "$confirm_upgrade" == "Y" ]]; then
                echo -e "${YELLOW}Proceeding with automatic upgrade. Please note this might include major version upgrades which could introduce breaking changes. Test your application thoroughly.${NC}"
                echo "$upgradable_packages" | while read -r package_name current_version latest_version; do
                    echo -e "${BLUE}Upgrading ${package_name} from ${current_version} to ${latest_version}...${NC}"
                    dotnet add package "$package_name"
                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}Successfully upgraded ${package_name}.${NC}"
                    else
                        echo -e "${RED}Failed to upgrade ${package_name}.${NC}"
                    fi
                done
                echo -e "${GREEN}Automatic backend package upgrade process completed.${NC}"
            else
                echo -e "${YELLOW}Automatic upgrade skipped.${NC}"
                echo -e "${YELLOW}To manually upgrade a specific package, use: dotnet add package <PackageName> --version <NewVersion>${NC}"
                echo -e "${YELLOW}Example: dotnet add package Microsoft.AspNetCore.OpenApi --version 8.0.20${NC}"
            fi
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