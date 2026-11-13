@echo off
echo ========================================================
echo Pushing Prashanth Punna Portfolio to GitHub...
echo ========================================================

git remote remove origin 2>nul
git remote add origin https://github.com/prashanth-06/prashanth-portfolio.git
git branch -M main
git push -u origin main

echo.
echo ========================================================
echo Push complete! Enable GitHub Pages at:
echo https://github.com/prashanth-06/prashanth-portfolio/settings/pages
echo Live URL will be: https://prashanth-06.github.io/prashanth-portfolio/
echo ========================================================
pause
