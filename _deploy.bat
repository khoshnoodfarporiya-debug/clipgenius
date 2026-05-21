@echo off
set "PATH=C:\Program Files\Git\bin;C:\Program Files\GitHub CLI;C:\Program Files (x86)\GitHub CLI;%PATH%"
cd /d "C:\Users\khosh\.gemini\antigravity\scratch\clipgenius"
git add render.yaml
git commit -m "Add Render.com deployment config"
git push origin master
echo DONE
