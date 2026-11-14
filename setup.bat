@echo off
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%APPDATA%\npm;%PATH%"
call pnpm.cmd install
call pnpm.cmd db:setup
echo Done! You can now run dev.bat or pnpm dev.
