# InnoPitch Registration Management System

This project implements a browser-only registration workflow for the InnoPitch club website.
Registrations are collected through `index.html`, stored in browser `localStorage`, and managed through `admin.html`.

## Project files
- `index.html` — public landing page with the registration form
- `admin.html` — admin login and registrations dashboard
- `style.css` — website styles and component layout
- `script.js` — frontend registration, validation, admin actions, and local storage persistence

## Local-only setup

### 1. Serve the frontend locally
To avoid `file://` issues, serve the site over HTTP:
```bash
python -m http.server 8000
```
Open:
- `http://localhost:8000/index.html`
- `http://localhost:8000/admin.html`

### 2. Use the registration form
1. Open `index.html`.
2. Fill in the application fields.
3. Submit the form.

Registrations are saved locally in your browser's storage. The data will remain available only in that browser/device unless the browser storage is cleared.

### 3. Open the admin dashboard
1. Open `admin.html`.
2. Enter the password `dkinnopitchclub`.
3. Click **Login**.
4. Use search, filters, refresh, export CSV, and print.

## Notes
- This mode does not require Google Apps Script or Google Sheets.
- The admin dashboard reads and manages registrations from browser `localStorage`.
- Local storage is browser-specific and may be lost if storage is cleared or a different browser/device is used.
- To change the admin password, update `ADMIN_PASSWORD` in `script.js`.

## Optional Apps Script backend
If you want to switch to a server-backed workflow later, you can use the provided `Code.gs` file.
That backend is optional and not required for the local-only registration mode.
