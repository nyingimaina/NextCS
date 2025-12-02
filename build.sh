#!/bin/bash

# Exit the script immediately if any command fails.
set -e

# Trap for errors: This function will run when the script exits due to a command failure.
function on_error {
    echo ""
    echo "🚨 ERROR: The script failed at a specific point. Exiting early." >&2
    echo "🚨 The last command to fail was: $(history 1 | sed 's/^ *[0-9]* *//')" >&2
}
trap on_error ERR

# --- Mandatory Git Operations (Always runs) ---
echo "--- Starting Mandatory Git Operations ---"

# Add all files to the staging area
git add .

# Check if there are any pending changes to commit
if git diff-index --quiet HEAD --; then
    echo "Working tree clean. Skipping 'Before build' commit."
else
    # Only commit if there are changes
    git commit -m "Before build at time `date`"
    echo "--- Git Operations Complete ---"
fi

echo ""

# --- Interactive Menu ---
echo "Please select the tasks you want to perform (e.g., 1, 3, 4):"
echo "  1) Build Frontend"
echo "  2) Build Backend"
echo "  3) Create Installer"
echo "  4) ALL (Build Frontend, Build Backend, and Create Installer)"
echo "  5) Exit"
echo ""

# Read user input
read -p "Enter your choice(s): " choices

# Process user input and set flags
build_frontend=0
build_backend=0
create_installer=0

# Use a loop to check each selected option
for choice in $choices; do
    case $choice in
        1) build_frontend=1 ;;
        2) build_backend=1 ;;
        3) create_installer=1 ;;
        4)
            build_frontend=1
            build_backend=1
            create_installer=1
            break # Exit the loop since 'ALL' is selected
            ;;
        5)
            echo "Exiting script as requested."
            exit 0
            ;;
        *)
            echo "Invalid choice: $choice. Skipping."
            ;;
    esac
done

# --- Execute selected work groups ---

# Work Group 2: Building Frontend
if [ $build_frontend -eq 1 ]; then
    echo ""
    echo "--- Starting Frontend Build ---"
    cd ./frontend
    npm run build
    cd ..
    echo "--- Frontend Build Complete ---"
fi

# Work Group 3: Building Backend
if [ $build_backend -eq 1 ]; then
    echo ""
    echo "--- Starting Backend Build ---"
    cd ./backend
    rm -rf ./obj
    rm -rf ./bin
    rm -rf ./logs
    dotnet publish
    cd ..
    echo "--- Backend Build Complete ---"
fi

# Work Group 4: Creating Installer
if [ $create_installer -eq 1 ]; then
    cd ./backend
    rm -rf ./Installer
    mkdir ./Installer
    echo ""
    echo "--- Starting Installer Creation ---"
    "C:\Program Files (x86)\NSIS\makensis.exe" installer.nsi
    echo "--- Installer Creation Complete ---"
    cd ..
fi

echo ""
echo "--- Starting Final Git Operations ---"
# Add all files (including built assets)
git add .
# Check if there are any new changes to commit before trying to commit.
if git diff-index --quiet HEAD --; then
    echo "No new changes to commit after build. Skipping final commit."
else
    git commit -m "After build at time `date`"
    echo "--- Final Git Operations Complete ---"
fi


echo ""
echo "Script finished successfully!"