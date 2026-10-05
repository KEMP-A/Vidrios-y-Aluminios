# make_round_favicon.ps1 - Favicon circular con fondo
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputDir = "imagenes\files",
    [int[]]$Sizes = @(16, 32, 48, 64, 96, 128, 192, 512),
    [string]$BgColor = "#111111"
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
$bgColorObj = [System.Drawing.ColorTranslator]::FromHtml($BgColor)

foreach ($size in $Sizes) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear($bgColorObj)
    
    # Recorte circular
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)
    $g.SetClip($path)
    
    $g.DrawImage($bmp, 0, 0, $size, $size)
    $g.ResetClip()
    
    $outputFile = Join-Path $OutputDir "favicon-round-$size.png"
    $resized.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $resized.Dispose()
    Write-Host "Generado: $outputFile"
}

$bmp.Dispose()
$img.Dispose()
Write-Host "Favicons circulares generados en $OutputDir"