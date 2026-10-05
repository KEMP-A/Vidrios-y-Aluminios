# make_crisp_favicon.ps1 - Favicons ultra nítidos con sharpening
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputDir = "imagenes\files",
    [int[]]$Sizes = @(16, 32, 48, 64, 128, 256)
)

if (-not (Test-Path $InputPath)) {
    Write-Error "No se encuentra $InputPath"
    exit 1
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($InputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

foreach ($size in $Sizes) {
    # Renderizar a 2x para supersampling
    $renderSize = $size * 2
    $render = New-Object System.Drawing.Bitmap($renderSize, $renderSize)
    $g = [System.Drawing.Graphics]::FromImage($render)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($bmp, 0, 0, $renderSize, $renderSize)
    
    # Reducir con alta calidad (downsampling = sharpening natural)
    $final = New-Object System.Drawing.Bitmap($size, $size)
    $g2 = [System.Drawing.Graphics]::FromImage($final)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($render, 0, 0, $size, $size)
    
    $outputFile = Join-Path $OutputDir "favicon-crisp-$size.png"
    $final.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $g2.Dispose()
    $render.Dispose()
    $final.Dispose()
    Write-Host "Generado crisp: $outputFile"
}

$bmp.Dispose()
$img.Dispose()
Write-Host "Favicons crisp generados en $OutputDir"