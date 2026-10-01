param([Parameter(Mandatory=$true)][string]$Job)
$ErrorActionPreference='Stop'
$jobData=Get-Content -LiteralPath $Job -Raw | ConvertFrom-Json
$word=$null
try {
  $word=New-Object -ComObject Word.Application
  $word.Visible=$false
  $word.DisplayAlerts=0
  $word.AutomationSecurity=3
  $results=@()
  foreach($item in $jobData.documents) {
    $doc=$null
    try {
      $doc=$word.Documents.Open($item.docx,$false,$true,$false)
      $doc.Fields.Update() | Out-Null
      foreach($section in $doc.Sections) {
        foreach($footer in $section.Footers) { $footer.Range.Fields.Update() | Out-Null }
      }
      $doc.ExportAsFixedFormat($item.pdf,17,$false,0,0,1,1,0,$false,$false,1,$true,$false,$false)
      $results+=@{id=$item.id;pages=$doc.ComputeStatistics(2);renderer='Microsoft Word';version=$word.Version}
    } finally { if($null -ne $doc) { $doc.Close(0); [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null } }
  }
  ConvertTo-Json -InputObject @($results) -Depth 5 | Set-Content -LiteralPath $jobData.result -Encoding utf8
} finally {
  if($null -ne $word) { $word.Quit(); [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
}
