@echo off
REM Revert Authentication Changes Script for Windows
REM This script reverts the authentication changes back to the original state

echo Reverting authentication changes...

REM Restore original auth-utils.ts
if exist "lib\auth-utils.backup.ts" (
    copy "lib\auth-utils.backup.ts" "lib\auth-utils.ts" >nul
    echo ✓ Restored lib\auth-utils.ts
) else (
    echo ✗ Backup file lib\auth-utils.backup.ts not found
)

REM Restore original transactions route
if exist "app\api\transactions\route.backup.ts" (
    copy "app\api\transactions\route.backup.ts" "app\api\transactions\route.ts" >nul
    echo ✓ Restored app\api\transactions\route.ts
) else (
    echo ✗ Backup file app\api\transactions\route.backup.ts not found
)

REM Remove backup files
del /f /q "lib\auth-utils.backup.ts" 2>nul
del /f /q "app\api\transactions\route.backup.ts" 2>nul

echo Authentication changes reverted successfully!
echo You may need to restart your development server.
pause
