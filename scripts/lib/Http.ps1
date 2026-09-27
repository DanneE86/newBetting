<#
.SYNOPSIS
  HTTP-hjalp som alltid avkodar svar som UTF-8.
  Windows PowerShell 5.1 tolkar svar utan charset i Content-Type som ISO-8859-1, vilket
  gor "MilenkoviÄ" av "Milenković". Dot-sourca: . (Join-Path $PSScriptRoot "lib\Http.ps1")
#>

function Get-Utf8Text {
    param(
        [Parameter(Mandatory = $true)][string]$Uri,
        [hashtable]$Headers = @{},
        [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession = $null,
        [int]$TimeoutSec = 60
    )
    $params = @{ Uri = $Uri; Headers = $Headers; UseBasicParsing = $true; TimeoutSec = $TimeoutSec; ErrorAction = 'Stop' }
    if ($WebSession) { $params.WebSession = $WebSession }
    try {
        $resp = Invoke-WebRequest @params
    } catch {
        throw "HTTP-fel for $($Uri -replace 'apiKey=[^&]+', 'apiKey=***'): $($_.Exception.Message)"
    }
    $ms = New-Object System.IO.MemoryStream
    $resp.RawContentStream.Position = 0
    $resp.RawContentStream.CopyTo($ms)
    return [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
}

function Get-Utf8Json {
    param(
        [Parameter(Mandatory = $true)][string]$Uri,
        [hashtable]$Headers = @{},
        [Microsoft.PowerShell.Commands.WebRequestSession]$WebSession = $null,
        [int]$TimeoutSec = 60
    )
    return (Get-Utf8Text -Uri $Uri -Headers $Headers -WebSession $WebSession -TimeoutSec $TimeoutSec) | ConvertFrom-Json
}
