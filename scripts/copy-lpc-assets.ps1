# ARX LPC Asset Selector
# Kopiert nur die benötigten Assets für den Avatar Creator
# Ausführen in PowerShell als: .\copy-lpc-assets.ps1

$ErrorActionPreference = "Stop"

# Pfade
$SOURCE = "C:\Devproject\ProjectArx\Universal-LPC-Spritesheet-Character-Generator\spritesheets"
$DEST = "C:\Devproject\ProjectArx\public\lpc"

# Farben die wir brauchen
$SKIN_COLORS = @("light", "olive", "brown", "bronze", "taupe", "black", "green", "blue", "lavender", "fur_brown", "fur_grey", "fur_white")
$HAIR_COLORS = @("black", "brunette", "brunette2", "blonde", "blonde2", "redhead", "redhead2", "gray", "white", "blue", "green", "purple", "pink")
$ARMOR_COLORS = @("brown", "black", "white", "red", "blue", "green", "gold", "silver")
$METAL_COLORS = @("wood", "iron", "steel", "gold", "silver", "bronze")

# Animationen die wir brauchen (idle für Preview, walk für Spieltisch)
$ANIMATIONS = @("idle", "walk")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ARX LPC Asset Selector" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Zielordner erstellen/leeren
if (Test-Path $DEST) {
    Write-Host "Lösche alten lpc Ordner..." -ForegroundColor Yellow
    # Prüfe ob es ein Symlink ist
    $item = Get-Item $DEST -Force
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        Write-Host "Entferne Symlink..." -ForegroundColor Yellow
        cmd /c rmdir $DEST
    } else {
        Remove-Item $DEST -Recurse -Force
    }
}

Write-Host "Erstelle neuen lpc Ordner..." -ForegroundColor Green
New-Item -ItemType Directory -Path $DEST -Force | Out-Null

# Counter
$copied = 0
$skipped = 0
$errors = 0

# Funktion zum Kopieren
function Copy-Asset {
    param($RelativePath)
    
    $src = Join-Path $SOURCE $RelativePath
    $dst = Join-Path $DEST $RelativePath
    
    if (Test-Path $src) {
        $dstDir = Split-Path $dst -Parent
        if (-not (Test-Path $dstDir)) {
            New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
        }
        Copy-Item $src $dst -Force
        $script:copied++
        return $true
    } else {
        $script:skipped++
        return $false
    }
}

# ============================================
# BODY - Körper
# ============================================
Write-Host ""
Write-Host "[1/10] Kopiere Bodies..." -ForegroundColor Cyan

$BODY_TYPES = @("male", "female", "muscular", "teen", "child")

foreach ($bodyType in $BODY_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($skin in $SKIN_COLORS) {
            Copy-Asset "body/bodies/$bodyType/$anim/$skin.png" | Out-Null
        }
    }
}
Write-Host "       Bodies: $copied Dateien" -ForegroundColor Gray

# ============================================
# HEAD - Köpfe
# ============================================
Write-Host "[2/10] Kopiere Heads..." -ForegroundColor Cyan
$headStart = $copied

$HEAD_TYPES = @("human/male", "human/female")

foreach ($headType in $HEAD_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($skin in $SKIN_COLORS) {
            Copy-Asset "head/heads/$headType/$anim/$skin.png" | Out-Null
        }
    }
}
Write-Host "       Heads: $($copied - $headStart) Dateien" -ForegroundColor Gray

# ============================================
# HAIR - Haare
# ============================================
Write-Host "[3/10] Kopiere Hair..." -ForegroundColor Cyan
$hairStart = $copied

$HAIR_STYLES = @(
    "afro", "bangs", "bob", "braid", "buzzcut", "curly_long", "curly_short",
    "dreadlocks_long", "long", "long_messy", "messy", "pixie", "pigtails",
    "ponytail", "princess", "plain", "shorthawk", "longhawk", "spiked", "wavy"
)

foreach ($style in $HAIR_STYLES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $HAIR_COLORS) {
            # Versuche adult Pfad
            Copy-Asset "hair/$style/adult/$anim/$color.png" | Out-Null
            # Manche haben anderen Pfad
            Copy-Asset "hair/$style/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Hair: $($copied - $hairStart) Dateien" -ForegroundColor Gray

# ============================================
# BEARDS - Bärte
# ============================================
Write-Host "[4/10] Kopiere Beards..." -ForegroundColor Cyan
$beardStart = $copied

$BEARD_STYLES = @("full", "goatee", "mustache", "stubble", "bigstache")

foreach ($style in $BEARD_STYLES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $HAIR_COLORS) {
            Copy-Asset "beards/$style/adult/$anim/$color.png" | Out-Null
            Copy-Asset "beards/$style/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Beards: $($copied - $beardStart) Dateien" -ForegroundColor Gray

# ============================================
# TORSO - Oberkörper
# ============================================
Write-Host "[5/10] Kopiere Torso..." -ForegroundColor Cyan
$torsoStart = $copied

$TORSO_TYPES = @(
    "leather/chest", "chain/chest_chain", "plate/chest", 
    "shirts/sleeveless", "shirts/longsleeve", "tunics/tunic"
)

foreach ($type in $TORSO_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $ARMOR_COLORS) {
            Copy-Asset "torso/$type/adult/$anim/$color.png" | Out-Null
            Copy-Asset "torso/$type/male/$anim/$color.png" | Out-Null
            Copy-Asset "torso/$type/female/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Torso: $($copied - $torsoStart) Dateien" -ForegroundColor Gray

# ============================================
# LEGS - Beine
# ============================================
Write-Host "[6/10] Kopiere Legs..." -ForegroundColor Cyan
$legsStart = $copied

$LEG_TYPES = @("pants/pants", "pants/legion", "skirt/skirt", "armor/leg_armor")

foreach ($type in $LEG_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $ARMOR_COLORS) {
            Copy-Asset "legs/$type/adult/$anim/$color.png" | Out-Null
            Copy-Asset "legs/$type/male/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Legs: $($copied - $legsStart) Dateien" -ForegroundColor Gray

# ============================================
# FEET - Füße
# ============================================
Write-Host "[7/10] Kopiere Feet..." -ForegroundColor Cyan
$feetStart = $copied

$FEET_TYPES = @("boots/boots", "shoes/shoes", "armor/plate")

foreach ($type in $FEET_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $ARMOR_COLORS) {
            Copy-Asset "feet/$type/adult/$anim/$color.png" | Out-Null
            Copy-Asset "feet/$type/male/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Feet: $($copied - $feetStart) Dateien" -ForegroundColor Gray

# ============================================
# HAT - Kopfbedeckung
# ============================================
Write-Host "[8/10] Kopiere Hats..." -ForegroundColor Cyan
$hatStart = $copied

$HAT_TYPES = @("helmet/plate", "helmet/chain", "hood/hood", "wizard/wizard", "bandana/bandana")

foreach ($type in $HAT_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $ARMOR_COLORS) {
            Copy-Asset "hat/$type/adult/$anim/$color.png" | Out-Null
            Copy-Asset "hat/$type/male/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Hats: $($copied - $hatStart) Dateien" -ForegroundColor Gray

# ============================================
# WEAPONS - Waffen
# ============================================
Write-Host "[9/10] Kopiere Weapons..." -ForegroundColor Cyan
$weaponStart = $copied

$WEAPON_TYPES = @(
    "right/melee/longsword", "right/melee/shortsword", "right/melee/dagger",
    "right/melee/axe", "right/melee/mace", "right/melee/spear",
    "right/melee/staff", "right/ranged/bow"
)

foreach ($type in $WEAPON_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $METAL_COLORS) {
            Copy-Asset "weapon/$type/adult/$anim/$color.png" | Out-Null
            Copy-Asset "weapon/$type/male/$anim/$color.png" | Out-Null
            Copy-Asset "weapon/$type/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Weapons: $($copied - $weaponStart) Dateien" -ForegroundColor Gray

# ============================================
# SHIELD - Schilde
# ============================================
Write-Host "[10/10] Kopiere Shields..." -ForegroundColor Cyan
$shieldStart = $copied

$SHIELD_TYPES = @("left/round", "left/kite", "left/buckler")

foreach ($type in $SHIELD_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $METAL_COLORS) {
            Copy-Asset "shield/$type/adult/$anim/$color.png" | Out-Null
            Copy-Asset "shield/$type/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Shields: $($copied - $shieldStart) Dateien" -ForegroundColor Gray

# ============================================
# CAPE - Umhänge
# ============================================
Write-Host "[BONUS] Kopiere Capes..." -ForegroundColor Cyan
$capeStart = $copied

$CAPE_TYPES = @("normal", "long", "tattered")

foreach ($type in $CAPE_TYPES) {
    foreach ($anim in $ANIMATIONS) {
        foreach ($color in $ARMOR_COLORS) {
            Copy-Asset "cape/$type/adult/$anim/$color.png" | Out-Null
            Copy-Asset "cape/$type/$anim/$color.png" | Out-Null
        }
    }
}
Write-Host "       Capes: $($copied - $capeStart) Dateien" -ForegroundColor Gray

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  FERTIG!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Kopiert:    $copied Dateien" -ForegroundColor White
Write-Host "  Übersprungen: $skipped (nicht gefunden)" -ForegroundColor Yellow
Write-Host ""

# Größe berechnen
$size = (Get-ChildItem $DEST -Recurse | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($size / 1MB, 2)
Write-Host "  Gesamtgröße: $sizeMB MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Pfad: $DEST" -ForegroundColor Gray
Write-Host ""
Write-Host "Fertig! Du kannst jetzt 'npm run dev' starten." -ForegroundColor Green
Write-Host ""
