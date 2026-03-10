<#
Simple helper script to regenerate Swagger docs locally on Windows.
Usage: Open PowerShell in repo root and run: `.	emplates\update_docs.ps1` or set execution policy as needed.
#>

try {
    Write-Host "Regenerating Swagger docs..."
    swag init -g main.go -o docs
    if ($LASTEXITCODE -ne 0) {
        Write-Error "swag init failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
    Write-Host "Swagger docs regenerated: docs/swagger.json, docs/swagger.yaml"
    Write-Host "If you updated controllers, remember to update Postman: postman/pawnshop.postman_collection.json"
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
