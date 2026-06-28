# Artifact QC examples

Good receipt: path, bytes, sha256, item count, content_ok true, PASS.
Bad receipt: exists but empty, placeholder content, missing expected files, unreadable archive, or semantic check not performed.

Use Bridge+FAIL when an artifact was promised but could not be created or verified.
