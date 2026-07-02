$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

$out = 'C:\Projets\FormeducWeb\public\marketing\etape-4\social\facebook\2026-05-02_facebook_gratuit-vs-complet_premium_1200x630.png'
$w = 1200
$h = 630

$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

function New-Color([string]$hex) { [System.Drawing.ColorTranslator]::FromHtml($hex) }
function New-Brush([string]$hex) { New-Object System.Drawing.SolidBrush (New-Color $hex) }
function New-Pen([string]$hex, [float]$width = 1) { New-Object System.Drawing.Pen (New-Color $hex), $width }
function New-Font([float]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular) {
  New-Object System.Drawing.Font -ArgumentList 'Segoe UI', $size, $style, ([System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-RoundedRect($graphics, [System.Drawing.RectangleF]$rect, [float]$radius, $pen, $brush) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  if ($null -ne $brush) { $graphics.FillPath($brush, $path) }
  if ($null -ne $pen) { $graphics.DrawPath($pen, $path) }
  $path.Dispose()
}

function Draw-Text($text, $font, $brush, [float]$x, [float]$y, [float]$width, [float]$height, [string]$align = 'Near') {
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::$align
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Near
  $sf.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $rect = New-Object System.Drawing.RectangleF $x, $y, $width, $height
  $g.DrawString($text, $font, $brush, $rect, $sf)
  $sf.Dispose()
}

function Draw-Bullets($items, [float]$x, [float]$y, [string]$accent) {
  $checkFont = New-Font 20 ([System.Drawing.FontStyle]::Bold)
  $itemFont = New-Font 24
  for ($i = 0; $i -lt $items.Count; $i++) {
    $cy = $y + ($i * 41)
    $circleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(65, (New-Color $accent)))
    $g.FillEllipse($circleBrush, $x, ($cy + 2), 26, 26)
    $circleBrush.Dispose()
    $g.DrawEllipse((New-Pen $accent 1.5), $x, ($cy + 2), 26, 26)
    Draw-Text '+' $checkFont (New-Brush '#ffffff') ($x + 7) ($cy + 2) 22 22
    Draw-Text $items[$i] $itemFont (New-Brush '#f8fafc') ($x + 42) $cy 350 34
  }
  $checkFont.Dispose()
  $itemFont.Dispose()
}

$bgRect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $bgRect, (New-Color '#061122'), (New-Color '#071a32'), 20
$g.FillRectangle($bgBrush, $bgRect)
$bgBrush.Dispose()

foreach ($glow in @(
  @{ x = -120; y = 430; s = 360; c = '#0ea5e9'; a = 70 },
  @{ x = 920; y = -130; s = 390; c = '#06b6d4'; a = 75 },
  @{ x = 555; y = 465; s = 210; c = '#22c55e'; a = 42 },
  @{ x = 1010; y = 420; s = 260; c = '#8b5cf6'; a = 46 }
)) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse($glow.x, $glow.y, $glow.s, $glow.s)
  $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
  $pgb.CenterColor = [System.Drawing.Color]::FromArgb($glow.a, (New-Color $glow.c))
  $pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, (New-Color $glow.c)))
  $g.FillEllipse($pgb, $glow.x, $glow.y, $glow.s, $glow.s)
  $pgb.Dispose()
  $path.Dispose()
}

$dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(55, (New-Color '#38bdf8')))
for ($x = 26; $x -lt 250; $x += 14) {
  for ($y = 34; $y -lt 170; $y += 14) { $g.FillEllipse($dotBrush, $x, $y, 2, 2) }
}
for ($x = 970; $x -lt 1160; $x += 14) {
  for ($y = 390; $y -lt 565; $y += 14) { $g.FillEllipse($dotBrush, $x, $y, 2, 2) }
}
$dotBrush.Dispose()

$panel = New-Object System.Drawing.RectangleF 72, 48, 1056, 542
$panelBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(178, (New-Color '#09162b')))
Draw-RoundedRect $g $panel 26 (New-Pen '#2d5f88' 1.2) $panelBrush
$panelBrush.Dispose()

Draw-Text 'OFFRE LOI 25' (New-Font 21) (New-Brush '#67e8f9') 112 98 360 34
Draw-Text 'Gratuit ou complet?' (New-Font 54 ([System.Drawing.FontStyle]::Bold)) (New-Brush '#ffffff') 112 132 720 72
Draw-Text 'Commencez gratuit. Ajoutez le rapport complet au besoin.' (New-Font 23) (New-Brush '#cbd5e1') 114 204 780 40

$pill = New-Object System.Drawing.RectangleF 845, 130, 218, 52
$pillBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(215, (New-Color '#0e7490')))
Draw-RoundedRect $g $pill 22 (New-Pen '#67e8f9' 1) $pillBrush
$pillBrush.Dispose()
Draw-Text 'Rapport complet' (New-Font 22 ([System.Drawing.FontStyle]::Bold)) (New-Brush '#ecfeff') 845 143 218 36 'Center'

$left = New-Object System.Drawing.RectangleF 112, 260, 455, 255
$right = New-Object System.Drawing.RectangleF 633, 260, 455, 255
$leftBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Rectangle 112, 260, 455, 255), (New-Color '#083b5a'), (New-Color '#0c5a77'), 18
$rightBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Rectangle 633, 260, 455, 255), (New-Color '#221b35'), (New-Color '#7c3aed'), 12
Draw-RoundedRect $g $left 24 (New-Pen '#22d3ee' 2) $leftBrush
Draw-RoundedRect $g $right 24 (New-Pen '#f59e0b' 2) $rightBrush
$leftBrush.Dispose()
$rightBrush.Dispose()

Draw-Text 'Gratuit' (New-Font 41 ([System.Drawing.FontStyle]::Bold)) (New-Brush '#ffffff') 154 294 260 54
Draw-Text 'Complet' (New-Font 41 ([System.Drawing.FontStyle]::Bold)) (New-Brush '#fff7ed') 675 294 260 54

$priceRect = New-Object System.Drawing.RectangleF 936, 292, 96, 50
$priceBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, (New-Color '#f59e0b')))
Draw-RoundedRect $g $priceRect 22 $null $priceBrush
$priceBrush.Dispose()
Draw-Text '29 $' (New-Font 28 ([System.Drawing.FontStyle]::Bold)) (New-Brush '#111827') 936 301 96 36 'Center'

Draw-Bullets @('Score + niveau', '3 priorites', 'Plan 30 jours', 'Resume immediat') 154 358 '#22d3ee'
Draw-Bullets @('Top 5 detaille', 'Plan 90 jours', 'PDF telechargeable', 'Gabarits prets') 675 358 '#f59e0b'

$g.DrawLine((New-Pen '#164e63' 1), 112, 540, 1088, 540)
Draw-Text 'Auto-evaluation Loi 25' (New-Font 22 ([System.Drawing.FontStyle]::Bold)) (New-Brush '#e0f2fe') 112 553 320 34
Draw-Text 'Score | Priorites | Plan action' (New-Font 20) (New-Brush '#94a3b8') 410 555 360 32
Draw-Text 'FormeducWeb' (New-Font 22 ([System.Drawing.FontStyle]::Bold)) (New-Brush '#67e8f9') 922 553 166 34 'Far'

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Output $out
