$action = New-ScheduledTaskAction -Execute "c:\Users\EssaM\Documents\GitHub\koralegend\start-daemon.bat"
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit 0 -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName "KoraLegendScraper" -Action $action -Trigger $trigger -Settings $settings -Force
Write-Host "Task registered successfully!"
