@echo off
REM gitPush.bat - Push changes to git repository

set /p commitMsg=Enter commit message:

git add .
git commit -m "%commitMsg%"
git push origin master
