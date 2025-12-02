#!/bin/bash

# Color codes for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}--- Project Setup Script ---${NC}"
echo "This script will guide you through setting up the project placeholders."
echo

# --- 1. Discovery Phase ---
echo -e "${YELLOW}Discovering placeholders...${NC}"

# Declare associative arrays to store placeholder data
declare -A placeholder_map
declare -A placeholder_values
user_app_name=""
pascal_case_name=""
kebab_case_name=""

# Find all unique placeholders and store them. Exclude .git, node_modules, and this script itself.
placeholders=$(grep -r -o -E '{{[a-zA-Z0-9_-]+}}' . --exclude-dir={.git,node_modules,bin,obj} --exclude="setup.sh" | sort | uniq)

if [ -z "$placeholders" ]; then
    echo -e "${GREEN}No placeholders found. Project seems to be already set up.${NC}"
    exit 0
fi

# Map each placeholder to the files it appears in
for placeholder in $placeholders; do
    files=$(grep -r -l "$placeholder" . --exclude-dir={.git,node_modules,bin,obj} --exclude="setup.sh")
    placeholder_map["$placeholder"]="$files"
done

echo "Found the following unique placeholders:"
for placeholder in $placeholders; do
    echo -e "  - ${YELLOW}$placeholder${NC}"
done
echo

# --- 2. User Input Phase ---

# --- App Name (handled first as it can provide defaults for others) ---
app_name_placeholder="{{your-app-name}}"
if [[ ${placeholder_map[$app_name_placeholder]} ]]; then
    while true; do
        read -p "Enter your application name (e.g., My Awesome App): " app_name_input
        if [[ -z "$app_name_input" ]]; then
            echo -e "${RED}Application name cannot be empty.${NC}"
            continue
        fi
        user_app_name=$app_name_input

        # Generate different formats
        pascal_case_name=$(echo "$user_app_name" | sed -r 's/(^| )([a-z])/\U\2/g' | sed 's/ //g')
        kebab_case_name=$(echo "$user_app_name" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')

        # C# validation
        if ! [[ "$pascal_case_name" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
            echo -e "${RED}Invalid name for C# namespace: '${pascal_case_name}'. It must start with a letter or underscore, and contain only letters, numbers, or underscores.${NC}"
            continue
        fi

        # package.json validation
        if ! [[ "$kebab_case_name" =~ ^[a-z0-9_-]+$ ]]; then
            echo -e "${RED}Invalid name for package.json: '${kebab_case_name}'. It must be lowercase and contain only letters, numbers, hyphens, or underscores.${NC}"
            continue
        fi

        placeholder_values["$app_name_placeholder-csharp"]=$pascal_case_name
        placeholder_values["$app_name_placeholder-kebab"]=$kebab_case_name
        break
    done
    echo
fi

# --- Loop through all placeholders to get user values ---
for placeholder in $placeholders; do
    # Skip the main app-name placeholder as its values are derived
    if [ "$placeholder" == "$app_name_placeholder" ]; then
        continue
    fi

    echo -e "Placeholder ${YELLOW}${placeholder}${NC} was found in:"
    while IFS= read -r file; do
        echo "  - $file"
    done <<< "${placeholder_map[$placeholder]}"

    # --- Smart Defaults ---
    default_value=""
    # Default for port
    if [ "$placeholder" == "{{port}}" ]; then
        default_value="5000"
    # Default for uninstaller name
    elif [[ "$placeholder" == *"uninstallerName"* && -n "$user_app_name" ]]; then
        default_value="$user_app_name Uninstaller"
    # Default for other name/title variations
    elif [[ "$placeholder" == *"Name"* || "$placeholder" == *"title"* || "$placeholder" == *"product"* && -n "$user_app_name" ]]; then
        default_value="$user_app_name"
    fi

    prompt_text="What value should be used for ${placeholder}?"
    if [[ -n "$default_value" ]]; then
        prompt_text="What value should be used for ${placeholder}? [${YELLOW}${default_value}${NC}]: "
    fi

    read -p "$prompt_text" user_input
    final_value=${user_input:-$default_value}
    placeholder_values["$placeholder"]=$final_value
    echo
done

# --- 3. Confirmation Phase ---
echo -e "${GREEN}--- Summary of Changes ---${NC}"
echo "The following actions will be performed:"

# App name and project rename
if [[ -n "$pascal_case_name" ]]; then
    echo -e " - Rename ${YELLOW}backend/app.csproj${NC} to ${YELLOW}backend/${pascal_case_name}.csproj${NC}"
    echo -e " - Update ${YELLOW}NextCS.sln${NC} to reference the new project name."
    echo -e " - Replace ${YELLOW}${app_name_placeholder}${NC} with:"
    echo -e "   - '${GREEN}${pascal_case_name}${NC}' in C# files"
    echo -e "   - '${GREEN}${kebab_case_name}${NC}' in package.json"
fi

# Other replacements
for placeholder in $placeholders; do
    if [ "$placeholder" == "$app_name_placeholder" ]; then
        continue
    fi
    value=${placeholder_values[$placeholder]}
    echo -e " - Replace ${YELLOW}${placeholder}${NC} with '${GREEN}${value}${NC}'"
done
echo

read -p "Proceed with these changes? (y/n): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Aborted."
    exit 1
fi

# --- 4. Execution Phase ---
echo
echo -e "${YELLOW}Applying changes...${NC}"

# Function to safely replace content in a file
replace_in_file() {
    local placeholder=$1
    local value=$2
    local file=$3
    # Escape for sed
    local escaped_placeholder=$(sed -e 's/[\][/&]/\&/g' <<<"$placeholder")
    local escaped_value=$(sed -e 's/[\][/&]/\&/g' <<<"$value")
    sed -i "s/$escaped_placeholder/$escaped_value/g" "$file"
}

# Perform replacements
for placeholder in "${!placeholder_map[@]}"; do
    files=${placeholder_map[$placeholder]}
    
    if [ "$placeholder" == "$app_name_placeholder" ]; then
        # Special handling for app name
        for file in $files; do
            if [[ "$file" == *"package.json" ]]; then
                value=${placeholder_values["$app_name_placeholder-kebab"]}
            else # Assume C# and others
                value=${placeholder_values["$app_name_placeholder-csharp"]}
            fi
            replace_in_file "$placeholder" "$value" "$file"
            echo "  - Replaced '$placeholder' in $file"
        done
    else
        value=${placeholder_values[$placeholder]}
        if [[ -n "$value" || "$value" == "" ]]; then # Also replace if user wants an empty string
            for file in $files; do
                replace_in_file "$placeholder" "$value" "$file"
                echo "  - Replaced '$placeholder' in $file"
            done
        fi
    fi
done

# Rename csproj and update sln
if [[ -n "$pascal_case_name" ]]; then
    if [ -f "backend/app.csproj" ]; then
        mv "backend/app.csproj" "backend/${pascal_case_name}.csproj"
        echo "  - Renamed backend/app.csproj to backend/${pascal_case_name}.csproj"
    fi
    if [ -f "NextCS.sln" ]; then
        # This is a bit brittle, but should work for the current solution file format.
        # It replaces both the project name and the path.
        sed -i "s/app.csproj/${pascal_case_name}.csproj/g" "NextCS.sln"
        sed -i "s/\"app\",/\"${pascal_case_name}\",/g" "NextCS.sln"
        echo "  - Updated NextCS.sln"
    fi
fi

echo
echo -e "${GREEN}--- Setup Complete! ---${NC}"
echo "You can now delete this script if you wish."