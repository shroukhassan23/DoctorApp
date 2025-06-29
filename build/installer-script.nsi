; Doctor App Windows Installer Script
!include MUI2.nsh
!include WinMessages.nsh

; Installer configuration
Name "Doctor App"
OutFile "DoctorApp-Setup.exe"
InstallDir "$PROGRAMFILES\Doctor App"
RequestExecutionLevel admin

; Interface settings
!define MUI_ABORTWARNING
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "license.txt"
Page custom InstallTypePageCreate InstallTypePageLeave
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
Page custom SetupPageCreate SetupPageLeave
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Variables
Var InstallationType
Var ServerIP
Var DatabasePort
Var DatabaseUser
Var DatabasePassword
Var SharedFolder
Var LicenseKey

; Custom page for installation type
Function InstallTypePageCreate
  !insertmacro MUI_HEADER_TEXT "Installation Type" "Choose your installation type"
  
  nsDialogs::Create 1018
  Pop $0
  
  ${NSD_CreateLabel} 0 0 100% 20u "Select installation type:"
  
  ${NSD_CreateRadioButton} 10 30 100% 15u "Master Installation (Database Server)"
  Pop $1
  ${NSD_SetState} $1 ${BST_CHECKED}
  
  ${NSD_CreateRadioButton} 10 50 100% 15u "Client Installation (Connect to existing server)"
  Pop $2
  
  ${NSD_CreateLabel} 10 80 100% 40u "Master Installation: Installs MySQL database and file storage on this machine.$\r$\nClient Installation: Connects to an existing master installation."
  
  nsDialogs::Show
FunctionEnd

Function InstallTypePageLeave
  ${NSD_GetState} $1 $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $InstallationType "master"
  ${Else}
    StrCpy $InstallationType "client"
  ${EndIf}
FunctionEnd

; Custom page for setup configuration
Function SetupPageCreate
  !insertmacro MUI_HEADER_TEXT "Setup Configuration" "Configure your installation"
  
  nsDialogs::Create 1018
  Pop $0
  
  ${If} $InstallationType == "client"
    ${NSD_CreateLabel} 0 0 100% 15u "Enter server connection details:"
    
    ${NSD_CreateLabel} 10 25 80u 15u "Server IP:"
    ${NSD_CreateText} 100 22 150u 15u ""
    Pop $3
    
    ${NSD_CreateLabel} 10 45 80u 15u "Database Port:"
    ${NSD_CreateText} 100 42 150u 15u "3306"
    Pop $4
    
    ${NSD_CreateLabel} 10 65 80u 15u "Database User:"
    ${NSD_CreateText} 100 62 150u 15u "root"
    Pop $5
    
    ${NSD_CreateLabel} 10 85 80u 15u "Database Password:"
    ${NSD_CreatePassword} 100 82 150u 15u ""
    Pop $6
    
    ${NSD_CreateLabel} 10 105 80u 15u "Shared Folder:"
    ${NSD_CreateText} 100 102 200u 15u ""
    Pop $7
  ${Else}
    ${NSD_CreateLabel} 0 0 100% 15u "Master installation will set up MySQL automatically."
    
    ${NSD_CreateLabel} 10 25 80u 15u "MySQL Port:"
    ${NSD_CreateText} 100 22 150u 15u "3306"
    Pop $4
    
    ${NSD_CreateLabel} 10 45 80u 15u "Shared Folder:"
    ${NSD_CreateText} 100 42 200u 15u "$DOCUMENTS\DoctorApp\SharedFiles"
    Pop $7
  ${EndIf}
  
  ${NSD_CreateLabel} 10 130 100% 15u "License Key (leave empty for trial):"
  ${NSD_CreatePassword} 10 147 200u 15u ""
  Pop $8
  
  nsDialogs::Show
FunctionEnd

Function SetupPageLeave
  ${If} $InstallationType == "client"
    ${NSD_GetText} $3 $ServerIP
    ${NSD_GetText} $4 $DatabasePort
    ${NSD_GetText} $5 $DatabaseUser
    ${NSD_GetText} $6 $DatabasePassword
    ${NSD_GetText} $7 $SharedFolder
  ${Else}
    ${NSD_GetText} $4 $DatabasePort
    ${NSD_GetText} $7 $SharedFolder
  ${EndIf}
  ${NSD_GetText} $8 $LicenseKey
FunctionEnd

; Main installation section
Section "Doctor App" SecMain
  SetOutPath "$INSTDIR"
  
  ; Install application files
  File /r "*.*"
  
  ; Create configuration file
  FileOpen $9 "$INSTDIR\config.json" w
  ${If} $InstallationType == "master"
    FileWrite $9 '{"installationType":"master","setupComplete":true,"database":{"host":"localhost","port":$DatabasePort,"user":"root","password":"","database":"doctor"},"sharedFolderPath":"$SharedFolder","mysqlPort":$DatabasePort}'
  ${Else}
    FileWrite $9 '{"installationType":"client","setupComplete":true,"database":{"host":"$ServerIP","port":$DatabasePort,"user":"$DatabaseUser","password":"$DatabasePassword","database":"doctor"},"sharedFolderPath":"$SharedFolder"}'
  ${EndIf}
  FileClose $9
  
  ; Set license key if provided
  ${If} $LicenseKey != ""
    ExecWait '"$INSTDIR\Doctor App.exe" --set-license "$LicenseKey"'
  ${EndIf}
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\Doctor App"
  CreateShortCut "$SMPROGRAMS\Doctor App\Doctor App.lnk" "$INSTDIR\Doctor App.exe"
  CreateShortCut "$DESKTOP\Doctor App.lnk" "$INSTDIR\Doctor App.exe"
  
  ; Register for auto-start
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "DoctorApp" "$INSTDIR\Doctor App.exe"
  
  ; Write uninstall information
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DoctorApp" "DisplayName" "Doctor App"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DoctorApp" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

; Uninstaller
Section "Uninstall"
  ; Remove application files
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$DESKTOP\Doctor App.lnk"
  RMDir /r "$SMPROGRAMS\Doctor App"
  
  ; Remove auto-start
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "DoctorApp"
  
  ; Remove uninstall information
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DoctorApp"
SectionEnd