# Screenshots each pitch/slides/html/NN.html to pitch/slides/png/NN.png at 2x (2560x1440) with headless Edge.
param([string]$Only = "", [string]$Dir = "html", [string]$Out = "png")
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $here $Dir; $png = Join-Path $here $Out
New-Item -ItemType Directory -Force $png | Out-Null
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$prof = Join-Path $env:TEMP "navc-edge-render"
Get-ChildItem $html -Filter "*.html" | Where-Object { $Only -eq "" -or $_.BaseName -eq $Only } | ForEach-Object {
  $out = Join-Path $png ($_.BaseName + ".png")
  $u = "file:///" + ($_.FullName -replace '\\','/')
  Start-Process -FilePath $edge -ArgumentList "--headless=new","--disable-gpu","--hide-scrollbars","--user-data-dir=$prof","--window-size=1280,720","--force-device-scale-factor=2","--virtual-time-budget=6000","--screenshot=$out",$u -Wait -WindowStyle Hidden
  Write-Output "$($_.BaseName) -> $out"
}
