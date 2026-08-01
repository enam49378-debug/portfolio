$port = 58647
$root = $PSScriptRoot

$tcp = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$tcp.Start()

Write-Host "================================="
Write-Host "  PORTAFOLIO - Servidor Seguro"
Write-Host "  http://localhost:$port/"
Write-Host "  http://127.0.0.1:$port/"
Write-Host "================================="

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".css" = "text/css"
    ".js" = "application/javascript"
    ".png" = "image/png"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif" = "image/gif"
    ".svg" = "image/svg+xml"
    ".ico" = "image/x-icon"
    ".json" = "application/json"
    ".mp3" = "audio/mpeg"
    ".wav" = "audio/wav"
    ".webp" = "image/webp"
}

$rateLimit = @{}
$rateLimitMax = 500
$rateLimitWindow = 60

while ($true) {
    try {
        $client = $tcp.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)

        $requestLine = $reader.ReadLine()
        if (-not $requestLine) { $client.Close(); continue }
        $parts = $requestLine.Split(' ')
        $rawUrl = if ($parts.Length -gt 1) { $parts[1] } else { "/" }

        while (($h = $reader.ReadLine()) -ne $null) {
            if ($h -eq "") { break }
        }

        # Ruta
        $path = $rawUrl.TrimStart('/').Split('?')[0]
        if ([string]::IsNullOrEmpty($path)) { $path = "index.html" }
        $filePath = Join-Path -Path $root -ChildPath $path

        # Rate limiting
        $ip = $client.Client.RemoteEndPoint.Address
        $now = [DateTime]::UtcNow
        $rc = 1
        if ($rateLimit.ContainsKey($ip)) {
            $e = $rateLimit[$ip]
            if (($now - $e.Time).TotalSeconds -le $rateLimitWindow) {
                $rc = $e.Count + 1
            } else { $rateLimit.Remove($ip) }
        }
        $rateLimit[$ip] = @{ Count = $rc; Time = $now }

        if ($rc -gt $rateLimitMax) {
            $body = [System.Text.Encoding]::UTF8.GetBytes("Too Many Requests")
            $resp = [System.Text.Encoding]::UTF8.GetBytes("HTTP/1.1 429 Too Many Requests`r`nContent-Length: " + $body.Length + "`r`nContent-Type: text/plain`r`nConnection: close`r`n`r`n")
            $stream.Write($resp, 0, $resp.Length)
            $stream.Write($body, 0, $body.Length)
            $client.Close()
            continue
        }

        if (Test-Path -LiteralPath $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $bl = $bytes.Length

            $csp = "default-src 'self'; img-src 'self' https://cdn.discordapp.com https://i.scdn.co https://yt3.googleusercontent.com https://i.ytimg.com data: blob:; connect-src 'self' https://api.lanyard.rest wss://api.lanyard.rest https://fonts.googleapis.com https://images.weserv.nl; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; media-src 'self'; script-src 'self'"

            $headerText = "HTTP/1.1 200 OK`r`nContent-Type: " + $ct + "`r`nContent-Length: " + $bl + "`r`nX-Content-Type-Options: nosniff`r`nX-Frame-Options: DENY`r`nReferrer-Policy: no-referrer`r`nPermissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`r`nContent-Security-Policy: " + $csp + "`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($headerText)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $body = [System.Text.Encoding]::UTF8.GetBytes("404 - No encontrado")
            $resp = [System.Text.Encoding]::UTF8.GetBytes("HTTP/1.1 404 Not Found`r`nContent-Length: " + $body.Length + "`r`nContent-Type: text/plain`r`nConnection: close`r`n`r`n")
            $stream.Write($resp, 0, $resp.Length)
            $stream.Write($body, 0, $body.Length)
        }

        $client.Close()
    } catch {
        # Error silencioso
    }
}

$tcp.Stop()
