# Add Dark Mode to All HTML Files in Deploy Folder

$deployPath = Get-Location
$htmlFiles = Get-ChildItem -Path $deployPath -Filter "*.html" -Recurse | Where-Object { $_.Directory.Name -notmatch "css|js" }

Write-Host "Found $($htmlFiles.Count) HTML files" -ForegroundColor Cyan

$updated = 0
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Check if already has dark mode
    if ($content -like "*dark-mode.css*") {
        Write-Host "SKIP: $($file.Name)" -ForegroundColor Green
        continue
    }
    
    # Determine correct path
    if ($file.DirectoryName -eq $deployPath) {
        $cssPath = "./css/dark-mode.css"
        $jsPath = "./js/dark-mode.js"
    } else {
        $cssPath = "../css/dark-mode.css"
        $jsPath = "../js/dark-mode.js"
    }
    
    # Add CSS link before </head>
    if ($content -like "*</head>*") {
        $cssLink = "`n    <link rel=""stylesheet"" href=""$cssPath"">"
        $content = $content -replace "</head>", $cssLink + "`n    </head>"
    }
    
    # Add JS script before </body>
    if ($content -like "*</body>*") {
        $jsScript = "`n    <script src=""$jsPath""></script>"
        $content = $content -replace "</body>", $jsScript + "`n</body>"
    }
    
    # Save the file
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -Force
    Write-Host "UPDATE: $($file.Name)" -ForegroundColor Yellow
    $updated++
}

Write-Host "`nUpdated $updated files!" -ForegroundColor Green
