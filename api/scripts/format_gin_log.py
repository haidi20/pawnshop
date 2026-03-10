#!/usr/bin/env python3
"""
Format gin.log timestamps to Indonesian readable form.

Backup is created at the same folder as `gin.log.bak` before in-place replacement.

Usage:
  python scripts/format_gin_log.py
"""
import re
from datetime import datetime
from pathlib import Path


LOG_PATH = Path(__file__).resolve().parents[1] / 'storage' / 'logs' / 'gin.log'

DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]


def fmt_indonesia(dt: datetime) -> str:
    # dt is a timezone-aware or naive datetime
    weekday = DAY_NAMES[dt.weekday()]
    day = dt.day
    month = MONTH_NAMES[dt.month - 1]
    year = dt.year
    hour = dt.hour
    minute = dt.minute
    return f"{weekday}, {day} {month} {year} {hour:02d}:{minute:02d}"


ISO_RE = re.compile(r"\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[+\-]\d{2}:\d{2})?)\]")


def convert_line(line: str) -> str:
    def repl(m):
        s = m.group(1)
        try:
            # datetime.fromisoformat supports offsets like +08:00
            dt = datetime.fromisoformat(s)
        except Exception:
            # fallback: try parsing without timezone
            try:
                dt = datetime.strptime(s.split("+")[0].split("-")[0], "%Y-%m-%dT%H:%M:%S")
            except Exception:
                return m.group(0)
        return f"[{fmt_indonesia(dt)}]"

    return ISO_RE.sub(repl, line)


def main():
    if not LOG_PATH.exists():
        print(f"Log file not found: {LOG_PATH}")
        return

    bak = LOG_PATH.with_suffix('.log.bak')
    # create backup by copying to avoid accidental move/replace
    try:
        import shutil
        if not bak.exists():
            shutil.copy2(LOG_PATH, bak)
        else:
            # if bak exists, create numbered backup
            i = 1
            while True:
                alt = LOG_PATH.with_name(f"gin.log.bak.{i}")
                if not alt.exists():
                    shutil.copy2(LOG_PATH, alt)
                    bak = alt
                    break
                i += 1
    except Exception as e:
        print(f"Gagal membuat backup: {e}")
        return

    # Read, convert, write to temporary then replace
    try:
        text = LOG_PATH.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Gagal membaca file: {e}")
        return

    out_lines = []
    for line in text.splitlines():
        out_lines.append(convert_line(line))

    try:
        LOG_PATH.write_text('\n'.join(out_lines) + ('\n' if out_lines else ''), encoding='utf-8')
    except Exception as e:
        print(f"Gagal menulis file: {e}")
        return

    print(f"Format selesai. Backup dibuat: {bak}")


if __name__ == '__main__':
    main()
#!/usr/bin/env python3
"""
Format ulang timestamp di storage/logs/gin.log dari ISO8601 ke format
"Hari, DD NamaBulan YYYY HH:MM" (bahasa Indonesia). Membuat backup
`gin.log.bak` sebelum menimpa file asli.

Usage:
  python scripts/format_gin_log.py
"""
from datetime import datetime
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG_PATH = ROOT / 'storage' / 'logs' / 'gin.log'
BACKUP = ROOT / 'storage' / 'logs' / 'gin.log.bak'

WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
MONTHS = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

iso_re = re.compile(r"\[(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:([+\-])(\d{2}):(\d{2}))?\]")


def fmt_iso_to_id_from_groups(year, month, day, hour, minute, second, sign, off_h, off_m):
    try:
        y = int(year); mo = int(month); d = int(day)
        h = int(hour); mi = int(minute); s = int(second)
        # ignore timezone offset for display
        dt = datetime(y, mo, d, h, mi, s)
    except Exception:
        return f"{year}-{month}-{day}T{hour}:{minute}:{second}"
    wd = WEEKDAYS[dt.weekday()]
    return f"{wd}, {dt.day} {MONTHS[dt.month]} {dt.year} {dt.strftime('%H:%M')}"


def main():
    if not LOG_PATH.exists():
        print('Log file not found:', LOG_PATH)
        return
    # backup
    if not BACKUP.exists():
        LOG_PATH.replace(BACKUP)
        # restore backup path to original name for writing
        BACKUP.replace(LOG_PATH)

    text = LOG_PATH.read_text(encoding='utf-8')
    def repl(m):
        # groups: 1=year,2=month,3=day,4=hour,5=minute,6=second,7=sign,8=off_h,9=off_m
        nice = fmt_iso_to_id_from_groups(m.group(1), m.group(2), m.group(3), m.group(4), m.group(5), m.group(6), m.group(7), m.group(8), m.group(9))
        return f"[{nice}]"

    new_text = iso_re.sub(repl, text)
    LOG_PATH.write_text(new_text, encoding='utf-8')
    print('Formatted log written to', LOG_PATH)


if __name__ == '__main__':
    main()
