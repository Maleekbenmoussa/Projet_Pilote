$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Get-Python {
  if (Test-Path ".\\.venv\\Scripts\\python.exe") { return ".\\.venv\\Scripts\\python.exe" }
  if (Get-Command python -ErrorAction SilentlyContinue) { return "python" }
  if (Get-Command py -ErrorAction SilentlyContinue) { return "py" }
  return $null
}

$py = Get-Python
if (-not $py) {
  Write-Host "Python not found. Install Python 3.12+ (and 'Add to PATH'), then re-run this script."
  exit 1
}

if (-not (Test-Path ".\\.venv\\Scripts\\python.exe")) {
  & $py -m venv .venv
}

& ".\\.venv\\Scripts\\python.exe" -m pip install --upgrade pip
& ".\\.venv\\Scripts\\python.exe" -m pip install -r requirements.txt

& ".\\.venv\\Scripts\\python.exe" -m uvicorn main:app --reload --port 8000

