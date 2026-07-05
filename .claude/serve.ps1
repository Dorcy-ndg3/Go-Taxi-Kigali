# Minimal static file server for local preview (no Node/Python required)
# Handles requests concurrently so large files (e.g. the hero video) don't block other assets.
param([int]$Port = 8321)
$root = Split-Path -Parent $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Serving $root at http://localhost:$Port/"

$mime = @{
  ".html"="text/html"; ".css"="text/css"; ".js"="application/javascript";
  ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".png"="image/png"; ".webp"="image/webp";
  ".mp4"="video/mp4"; ".svg"="image/svg+xml"; ".ico"="image/x-icon"; ".woff2"="font/woff2"
}

$handler = {
  param($ctx, $root, $mime)
  try {
    $reqPath = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($reqPath -eq "/") { $reqPath = "/index.html" }
    $file = Join-Path $root ($reqPath -replace "/", "\").TrimStart("\")
    if ((Test-Path $file -PathType Leaf) -and ([System.IO.Path]::GetFullPath($file)).StartsWith($root)) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $type = $mime[$ext]; if (-not $type) { $type = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = $type
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
  } catch {
    try { $ctx.Response.StatusCode = 500 } catch {}
  }
  try { $ctx.Response.Close() } catch {}
}

$pool = [runspacefactory]::CreateRunspacePool(1, 16)
$pool.Open()

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $ps = [powershell]::Create()
  $ps.RunspacePool = $pool
  [void]$ps.AddScript($handler.ToString()).AddArgument($ctx).AddArgument($root).AddArgument($mime)
  [void]$ps.BeginInvoke()
}
