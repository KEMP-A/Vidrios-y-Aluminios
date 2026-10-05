# make_sharp_v2.ps1 - Favicon nítido v2 con más tamaños
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputDir = "imagenes\files",
    [int[]]$Sizes = @(16, 20, 24, 32, 40, 48, 64, 96, 128, 180, 192, 256, 512)
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
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    if ($size -le 64) {
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    } else {
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    }
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $g.DrawImage($bmp, 0, 0, $size, $size)
    
    $outputFile = Join-Path $OutputDir "favicon-v2-$size.png"
    $resized.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $resized.Dispose()
    Write-Host "Generado: $outputFile"
}

$bmp.Dispose()
$img.Dispose()
Write-Host "Favicons nítidos v2 generados en $OutputDir"