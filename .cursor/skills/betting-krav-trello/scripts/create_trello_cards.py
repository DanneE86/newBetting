#!/usr/bin/env python3
"""Skapa Trello-kort från en JSON-backlog.

Kräver miljövariabler (eller .env i projektroten):
  TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_BOARD_ID, TRELLO_LIST_ID

Användning:
  python create_trello_cards.py path/to/backlog.json
  python create_trello_cards.py path/to/backlog.json --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

API = "https://api.trello.com/1"


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def require_env(*keys: str) -> dict[str, str]:
    missing = [k for k in keys if not os.environ.get(k)]
    if missing:
        raise SystemExit(
            "Saknar miljövariabler: "
            + ", ".join(missing)
            + "\nKopiera .env.example till .env och fyll i Trello-uppgifter."
        )
    return {k: os.environ[k] for k in keys}


def trello_request(method: str, path: str, params: dict[str, Any]) -> Any:
    query = urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
    url = f"{API}{path}?{query}"
    req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Trello API-fel {e.code}: {body}") from e


def get_or_create_labels(board_id: str, auth: dict[str, str], names: list[str]) -> list[str]:
    if not names:
        return []
    existing = trello_request("GET", f"/boards/{board_id}/labels", {**auth, "limit": 1000})
    by_name = { (l.get("name") or "").lower(): l["id"] for l in existing if l.get("id") }
    ids: list[str] = []
    for name in names:
        key = name.lower()
        if key in by_name:
            ids.append(by_name[key])
            continue
        created = trello_request(
            "POST",
            "/labels",
            {**auth, "idBoard": board_id, "name": name, "color": "blue"},
        )
        by_name[key] = created["id"]
        ids.append(created["id"])
    return ids


def create_card(
    auth: dict[str, str],
    list_id: str,
    board_id: str,
    card: dict[str, Any],
    dry_run: bool,
) -> dict[str, Any]:
    name = card.get("name")
    desc = card.get("desc") or ""
    if not name:
        raise SystemExit("Varje kort kräver 'name'")

    label_names = card.get("labels") or []
    id_list = card.get("idList") or list_id

    if dry_run:
        return {
            "name": name,
            "idList": id_list,
            "labels": label_names,
            "url": "(dry-run)",
            "desc_preview": desc[:120].replace("\n", " "),
        }

    id_labels = get_or_create_labels(board_id, auth, list(label_names))
    params: dict[str, Any] = {
        **auth,
        "idList": id_list,
        "name": name,
        "desc": desc,
        "pos": "bottom",
    }
    if id_labels:
        params["idLabels"] = ",".join(id_labels)
    return trello_request("POST", "/cards", params)


def main() -> None:
    parser = argparse.ArgumentParser(description="Skapa Trello-kort från JSON-backlog")
    parser.add_argument("json_path", type=Path, help="Sökväg till backlog JSON")
    parser.add_argument("--dry-run", action="store_true", help="Skriv ut utan API-anrop")
    parser.add_argument(
        "--env-file",
        type=Path,
        default=None,
        help="Sökväg till .env (default: projektrot/.env)",
    )
    args = parser.parse_args()

    # scripts -> skill -> skills -> .cursor -> project root
    project_root = Path(__file__).resolve().parents[4]
    env_path = args.env_file or (project_root / ".env")
    load_dotenv(env_path)

    if not args.json_path.is_file():
        raise SystemExit(f"Hittar inte fil: {args.json_path}")

    cards = json.loads(args.json_path.read_text(encoding="utf-8"))
    if not isinstance(cards, list):
        raise SystemExit("JSON måste vara en lista av kort")

    if args.dry_run:
        auth = {
            "key": os.environ.get("TRELLO_API_KEY", ""),
            "token": os.environ.get("TRELLO_TOKEN", ""),
        }
        board_id = os.environ.get("TRELLO_BOARD_ID", "")
        list_id = os.environ.get("TRELLO_LIST_ID", "DRY_RUN_LIST")
    else:
        env = require_env(
            "TRELLO_API_KEY", "TRELLO_TOKEN", "TRELLO_BOARD_ID", "TRELLO_LIST_ID"
        )
        auth = {"key": env["TRELLO_API_KEY"], "token": env["TRELLO_TOKEN"]}
        board_id = env["TRELLO_BOARD_ID"]
        list_id = env["TRELLO_LIST_ID"]

    created = []
    for card in cards:
        result = create_card(auth, list_id, board_id, card, args.dry_run)
        created.append(result)
        url = result.get("shortUrl") or result.get("url") or "(ingen url)"
        print(f"OK: {result.get('name')} -> {url}")

    out = args.json_path.with_suffix(".created.json")
    out.write_text(json.dumps(created, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n{len(created)} kort. Resultat sparat: {out}")


if __name__ == "__main__":
    main()
