# 08_INTERFACE_STYLE split mirror

This directory stores the exact content of the verified `08_INTERFACE_STYLE.md` file as ordered parts for the GitHub connector-safe mirror.

Reason: the GitHub connector request body limit rejects the single 3.4 MB file, so the GitHub mirror stores the same content as ordered part files plus a small index at `../08_INTERFACE_STYLE.md`.

Reassembly contract:

```bash
python tools/reassemble_interface_style.py --repo-root . --check
```

Expected original file:

- bytes: `3400610`
- sha256: `eb256d82816d3fa6d8653b34bf36b1dcdbf2f39b3f563b0071cf85e8bc7f031b`
- parts: `5`

The split is a transport packaging detail, not a canon fork.
