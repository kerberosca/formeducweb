param(
  [string]$HostName = "127.0.0.1",
  [int]$Port = 3050
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $repoRoot

$dateTag = Get-Date -Format "yyyy-MM-dd"
$baseUrl = "http://$HostName`:$Port"

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
  throw "Edge introuvable: $edgePath"
}

$dirs = @(
  "public/marketing/etape-4/captures/web",
  "public/marketing/etape-4/captures/resultats",
  "public/marketing/etape-4/captures/pdf",
  "public/marketing/etape-4/social/facebook",
  "public/marketing/etape-4/social/linkedin",
  "public/marketing/etape-4/email",
  ".tmp/edge-profile-marketing"
)

foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$edgeProfile = Join-Path $repoRoot ".tmp/edge-profile-marketing"

function Take-Screenshot {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$OutputRelative,
    [int]$Width = 1600,
    [int]$Height = 2200
  )

  $outputPath = Join-Path $repoRoot $OutputRelative
  $parent = Split-Path -Parent $outputPath
  if (-not (Test-Path $parent)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }

  $args = @(
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--user-data-dir=$edgeProfile",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=$Width,$Height",
    "--screenshot=$outputPath",
    "$Url"
  )

  & $edgePath @args | Out-Null

  if (-not (Test-Path $outputPath)) {
    throw "Capture echec: $OutputRelative"
  }
}

$devJob = $null

try {
  $devJob = Start-Job -ScriptBlock {
    param($rootPath, $hostArg, $portArg)
    Set-Location $rootPath
    npm run dev -- --hostname $hostArg --port $portArg
  } -ArgumentList $repoRoot, $HostName, $Port

  $ready = $false
  for ($i = 0; $i -lt 120; $i++) {
    try {
      $response = Invoke-WebRequest -Uri "$baseUrl/loi-25/wizard" -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -ge 200) {
        $ready = $true
        break
      }
    }
    catch {
      Start-Sleep -Milliseconds 1000
    }
  }

  if (-not $ready) {
    throw "Serveur Next indisponible sur $baseUrl"
  }
  $wizardPath = Join-Path $repoRoot "data/loi25_questions.fr-ca.json"
  $wizardData = Get-Content $wizardPath -Raw | ConvertFrom-Json
  $requiredQuestions = @($wizardData.questions | Where-Object { $_.required -eq $true })

  if ($requiredQuestions.Count -eq 0) {
    throw "Aucune question obligatoire trouvee dans data/loi25_questions.fr-ca.json"
  }

  $answers = @{}
  foreach ($question in $requiredQuestions) {
    if ($question.options -and $question.options.Count -gt 0) {
      $answers[$question.id] = [string]$question.options[0].value
    }
    else {
      $answers[$question.id] = "na"
    }
  }

  $leadCapture = @{
    contactName = "Demo Marketing"
    companyName = "FormeducWeb Demo"
    email = "demo-marketing+step4@formeducweb.local"
    phone = "514-555-0101"
    consentMarketing = $true
  }

  $assessmentPayload = @{ leadCapture = $leadCapture; answers = $answers } | ConvertTo-Json -Depth 20
  $assessment = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/assessment" -ContentType "application/json" -Body $assessmentPayload

  if (-not $assessment.accessToken) {
    throw "Aucun accessToken retourne par /api/assessment"
  }

  $token = $assessment.accessToken
  $reportUrl = "$baseUrl/loi-25/rapport/$token"

  Take-Screenshot -Url "$baseUrl/" -OutputRelative "public/marketing/etape-4/captures/web/${dateTag}_web_home_desktop.png" -Width 1600 -Height 3000
  Take-Screenshot -Url "$baseUrl/loi-25" -OutputRelative "public/marketing/etape-4/captures/web/${dateTag}_web_loi25_desktop.png" -Width 1600 -Height 3000
  Take-Screenshot -Url "$baseUrl/loi-25/wizard" -OutputRelative "public/marketing/etape-4/captures/web/${dateTag}_web_wizard_desktop.png" -Width 1600 -Height 3000

  Take-Screenshot -Url $reportUrl -OutputRelative "public/marketing/etape-4/captures/resultats/${dateTag}_resultat-gratuit_desktop.png" -Width 1600 -Height 3600
  Take-Screenshot -Url $reportUrl -OutputRelative "public/marketing/etape-4/email/${dateTag}_email_resultat-gratuit_1200x900.png" -Width 1200 -Height 900

  $markPaidScriptPath = Join-Path $repoRoot ".tmp/mark-paid.cjs"
  @'
const path = require("path");
const Database = require("better-sqlite3");

function getDbPath() {
  const url = process.env.DATABASE_URL;
  if (url && url.startsWith("file:")) {
    return path.resolve(process.cwd(), url.slice(5));
  }
  return path.resolve(process.cwd(), "prisma", "dev.db");
}

function main() {
  const token = process.argv[2];
  if (!token) {
    throw new Error("Missing token argument");
  }

  const db = new Database(getDbPath());
  try {
    const result = db
      .prepare("UPDATE Assessment SET paymentStatus = 'paid' WHERE accessToken = ?")
      .run(token);

    if (result.changes !== 1) {
      throw new Error("Assessment token not found for payment update");
    }
  } finally {
    db.close();
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
'@ | Set-Content -Encoding UTF8 $markPaidScriptPath
  node $markPaidScriptPath $token | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Impossible de marquer l'evaluation comme payee."
  }

  Take-Screenshot -Url $reportUrl -OutputRelative "public/marketing/etape-4/captures/resultats/${dateTag}_rapport-complet_desktop.png" -Width 1600 -Height 4400

  Invoke-WebRequest -Uri "$baseUrl/api/pdf?token=$token" -OutFile "public/marketing/etape-4/captures/pdf/${dateTag}_rapport-exemple.pdf"

  Take-Screenshot -Url "$baseUrl/marketing/etape-4/visuels/ce-que-vous-obtenez.svg" -OutputRelative "public/marketing/etape-4/social/facebook/${dateTag}_facebook_ce-que-vous-obtenez_1200x630.png" -Width 1200 -Height 630
  Take-Screenshot -Url "$baseUrl/marketing/etape-4/visuels/gratuit-vs-complet.svg" -OutputRelative "public/marketing/etape-4/social/facebook/${dateTag}_facebook_gratuit-vs-complet_1200x630.png" -Width 1200 -Height 630
  Take-Screenshot -Url "$baseUrl/marketing/etape-4/visuels/parcours-3-etapes.svg" -OutputRelative "public/marketing/etape-4/social/facebook/${dateTag}_facebook_parcours-3-etapes_1200x630.png" -Width 1200 -Height 630

  Take-Screenshot -Url "$baseUrl/loi-25" -OutputRelative "public/marketing/etape-4/social/linkedin/${dateTag}_linkedin_page-loi25_1200x627.png" -Width 1200 -Height 627
  Take-Screenshot -Url "$baseUrl/loi-25/rapport/$token" -OutputRelative "public/marketing/etape-4/social/linkedin/${dateTag}_linkedin_rapport-complet_1200x627.png" -Width 1200 -Height 627
  Take-Screenshot -Url "$baseUrl/marketing/etape-4/visuels/gratuit-vs-complet.svg" -OutputRelative "public/marketing/etape-4/social/linkedin/${dateTag}_linkedin_gratuit-vs-complet_1200x627.png" -Width 1200 -Height 627

  Take-Screenshot -Url "$baseUrl/marketing/etape-4/visuels/ce-que-vous-obtenez.svg" -OutputRelative "public/marketing/etape-4/email/${dateTag}_email_ce-que-vous-obtenez_1200x900.png" -Width 1200 -Height 900
  $manifest = [ordered]@{
    generatedAt = (Get-Date).ToString("s")
    baseUrl = $baseUrl
    reportToken = $token
    files = @(
      "public/marketing/etape-4/captures/web/${dateTag}_web_home_desktop.png",
      "public/marketing/etape-4/captures/web/${dateTag}_web_loi25_desktop.png",
      "public/marketing/etape-4/captures/web/${dateTag}_web_wizard_desktop.png",
      "public/marketing/etape-4/captures/resultats/${dateTag}_resultat-gratuit_desktop.png",
      "public/marketing/etape-4/captures/resultats/${dateTag}_rapport-complet_desktop.png",
      "public/marketing/etape-4/captures/pdf/${dateTag}_rapport-exemple.pdf",
      "public/marketing/etape-4/social/facebook/${dateTag}_facebook_ce-que-vous-obtenez_1200x630.png",
      "public/marketing/etape-4/social/facebook/${dateTag}_facebook_gratuit-vs-complet_1200x630.png",
      "public/marketing/etape-4/social/facebook/${dateTag}_facebook_parcours-3-etapes_1200x630.png",
      "public/marketing/etape-4/social/linkedin/${dateTag}_linkedin_page-loi25_1200x627.png",
      "public/marketing/etape-4/social/linkedin/${dateTag}_linkedin_rapport-complet_1200x627.png",
      "public/marketing/etape-4/social/linkedin/${dateTag}_linkedin_gratuit-vs-complet_1200x627.png",
      "public/marketing/etape-4/email/${dateTag}_email_resultat-gratuit_1200x900.png",
      "public/marketing/etape-4/email/${dateTag}_email_ce-que-vous-obtenez_1200x900.png"
    )
  }

  $manifest | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 "public/marketing/etape-4/generated-assets.json"
  Write-Host "OK - assets Step 4 generes"
}
finally {
  if ($devJob) {
    Stop-Job $devJob -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $devJob -Force -ErrorAction SilentlyContinue | Out-Null
  }
}


