@echo off
set "PATH=C:\Program Files\Git\bin;C:\Program Files\GitHub CLI;%PATH%"
cd /d "C:\Users\khosh\.gemini\antigravity\scratch\clipgenius"
git init
git add -A
git config user.email "clipgenius@app.com"
git config user.name "ClipGenius"
git commit -m "Initial commit: ClipGenius AI Content Engine with iOS PWA support"
echo DONE
