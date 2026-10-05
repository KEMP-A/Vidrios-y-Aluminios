# make_white_circle_max.ps1 - Logo en círculo blanco máximo
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputPath = "imagenes\logo-white-circle.png",
    [int]$Size = 512,
    [int]$PaddingPercent = 5
)

if (-not (Test-Path $InputPath)) {
    Write-Error "No se encuentra $InputPath"
    exit 1
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($InputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

$canvas = New-Object System.Drawing.Bitmap($Size, $Size)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear([System.Drawing.Color]::White)

# Fondo circular blanco
$circleRect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse($circleRect)
$g.SetClip($path)

# Dibujar logo centrado con padding
$pad = [math]::Floor($Size * $PaddingPercent / 100)
$drawSize = $Size - 2 * $pad
$g.DrawImage($bmp, $pad, $pad, $drawSize, $drawSize)
$g.ResetClip()

$canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$canvas.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Guardado: $OutputPath ($Size x $Size)"