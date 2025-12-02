; ------------------------------
; <app-name> Scraper NSIS Installer
; ------------------------------

!define APP_NAME "{{your-app-name}}"
!define COMPANY_NAME "I27"
!define VERSION "1.0.2.15"
!define EXE_NAME "{{your-app-name}}.exe"
!define OUTPUT_NAME "{{your-app-name}} Installer ${VERSION}.exe"
!define INSTALL_DIR "C:\${COMPANY_NAME}\${APP_NAME}\"
!define FIREWALL_RULE_NAME "<app-name> Firewall Rule"
!define FIREWALL_PORT "{{port}}"

;--------------------------------
; Service Details
;--------------------------------
!define SERVICE_NAME "{{your-app-name}}ScraperService"
!define SERVICE_DISPLAY_NAME "${APP_NAME} Service (${VERSION})"
!define SERVICE_DESCRIPTION "${APP_NAME}: {{service-description}}"
!define SERVICE_EXE_PATH "$INSTDIR\${EXE_NAME}"
; !define SERVICE_ACCOUNT "NT AUTHORITY\LocalSystem"
; !define SERVICE_ARGS '--urls \"http://0.0.0.0:${PORT}\"'

; Installer
Name "${APP_NAME}"
OutFile ".\Installer\${OUTPUT_NAME}"
InstallDir "${INSTALL_DIR}"
InstallDirRegKey HKLM "Software\${COMPANY_NAME}\${APP_NAME}" "InstallPath"
RequestExecutionLevel admin

!include "MUI2.nsh"

; Version info
VIProductVersion "${VERSION}"
VIAddVersionKey "ProductName" "${APP_NAME}"
VIAddVersionKey "CompanyName" "${COMPANY_NAME}"
VIAddVersionKey "FileVersion" "${VERSION}"
VIAddVersionKey "FileDescription" "{{service-description}}"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "eula.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish page with Run and Docs checkboxes
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${APP_NAME} now"
!define MUI_FINISHPAGE_RUN_EXE "$INSTDIR\${EXE_NAME}"
!define MUI_FINISHPAGE_RUN_ARGS "-ui"
; !define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\<app-name>-Docs.pdf"
; !define MUI_FINISHPAGE_SHOWREADME_TEXT "Open Documentation (<app-name> Docs.pdf)"
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

; ------------------------------
; Install Section
; ------------------------------
Section "Install"
    SetShellVarContext all
    DetailPrint "Preparing ${SERVICE_NAME} for installation"
    ExecWait 'sc stop "${SERVICE_NAME}"'
    ExecWait 'sc delete "${SERVICE_NAME}"'
    Sleep 4000
    ; Copy files
    SetOutPath "$INSTDIR"
    File /r ".\bin\Release\net8.0\win-x64\publish\*.*"

    ; Create Start Menu folder and shortcuts
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "http://localhost:${FIREWALL_PORT}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "http://localhost:${FIREWALL_PORT}"

    ; Write uninstall entry for all users
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayName" "${APP_NAME} ${VERSION}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" "$INSTDIR\Uninstall.exe"

    
    

    DetailPrint "Installing Windows Service..."
   
    

    ExecWait 'sc create "${SERVICE_NAME}" binPath="\"$INSTDIR\${EXE_NAME}\"" start= auto DisplayName= "${SERVICE_DISPLAY_NAME}"'   ; obj= "${SERVICE_ACCOUNT}"'
    IfErrors 0 +2
        MessageBox MB_ICONSTOP "Failed to create Windows Service ${SERVICE_NAME}. You may need to install manually."

    ExecWait 'sc description "${SERVICE_NAME}" "${SERVICE_DESCRIPTION}"'

    ExecWait 'sc start "${SERVICE_NAME}"'
    IfErrors 0 +2
        MessageBox MB_ICONEXCLAMATION "Failed to start Windows Service ${SERVICE_NAME}. Please check manually."

    ; --- Firewall: replace rule (delete if exists, then add) ---
    DetailPrint "Opening firewall port ${FIREWALL_PORT}..."
    ; This next line is designed to fail on a fresh install and is intentionally not checked for errors.
    ExecWait 'netsh advfirewall firewall delete rule name="${FIREWALL_RULE_NAME}"'
    ExecWait 'netsh advfirewall firewall add rule name="${FIREWALL_RULE_NAME}" dir=in action=allow protocol=TCP localport=${FIREWALL_PORT}'
    IfErrors 0 +2
        MessageBox MB_ICONEXCLAMATION "Failed to add firewall rule. You may need to configure Windows Firewall manually."

SectionEnd

; ------------------------------
; Uninstall Section
; ------------------------------
Section "Uninstall"
    SetShellVarContext all
    ; --- Service: stop/delete with brief wait ---
    DetailPrint "Stopping and deleting service ${SERVICE_NAME}..."
    ExecWait 'sc stop "${SERVICE_NAME}"'
    Sleep 4000
    ExecWait 'sc delete "${SERVICE_NAME}"'

    ; --- Firewall: remove rule ---
    DetailPrint "Removing firewall rule..."
    ExecWait 'netsh advfirewall firewall delete rule name="${FIREWALL_RULE_NAME}"'

    SetOutPath "$INSTDIR"

    ; Fix for uninstaller deletion issue
    Delete "$INSTDIR\Uninstall.exe"

    ; Delete installed files
     RMDir /r /REBOOTOK "$INSTDIR"

    ; Delete shortcuts
    Delete "$DESKTOP\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"
    RMDir "$SMPROGRAMS\${APP_NAME}"

    ; Remove registry uninstall entry
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"

SectionEnd
