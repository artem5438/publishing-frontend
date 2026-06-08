#!/usr/bin/env python3
"""Generate public/demo-stats/*.json for GitHub Pages statistics demo."""

from __future__ import annotations

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "demo-stats"

WORKS = [
    {"id": 1, "name": "Цифровая печать", "description": "", "price_rub": 5000, "work_type": "Печать", "unit": "экз."},
    {"id": 2, "name": "Офсетная печать", "description": "", "price_rub": 15000, "work_type": "Печать", "unit": "экз."},
    {"id": 3, "name": "Мягкий переплёт", "description": "", "price_rub": 800, "work_type": "Переплёт", "unit": "экз."},
    {"id": 4, "name": "Твёрдый переплёт", "description": "", "price_rub": 2500, "work_type": "Переплёт", "unit": "экз."},
    {"id": 5, "name": "Вёрстка", "description": "", "price_rub": 3000, "work_type": "Допечать", "unit": "стр."},
    {"id": 6, "name": "Корректура", "description": "", "price_rub": 1500, "work_type": "Допечать", "unit": "стр."},
    {"id": 7, "name": "Дизайн обложки", "description": "", "price_rub": 4000, "work_type": "Дизайн", "unit": "шт."},
    {"id": 8, "name": "Присвоение ISBN", "description": "", "price_rub": 1000, "work_type": "Оформление", "unit": "шт."},
    {"id": 9, "name": "Ризография", "description": "", "price_rub": 3500, "work_type": "Печать", "unit": "лист"},
]

WORK_BY_ID = {w["id"]: w for w in WORKS}

TARGET_TOTAL_ORDERS = 258
TARGET_FORMED = 50
TARGET_REJECTED = 43
TARGET_COMPLETED = TARGET_TOTAL_ORDERS - TARGET_FORMED - TARGET_REJECTED
TARGET_CIRCULATION = 478
TARGET_REVENUE = 7_351_000
MAX_ORDER_TOTAL = 120_000

BOOK_TITLES = [
    "Сибирские тетради", "Алгоритмы для гуманитариев", "Городские этюды",
    "Практикум по типографике", "Сборник рефератов", "Очерки о типографах",
]

CREATORS = [f"creator_demo_{i:02d}" for i in range(1, 51)]


def pick_lines(rng: random.Random) -> list[dict]:
    n = 1 + rng.randint(0, min(3, len(WORKS) - 1))
    picked = rng.sample(WORKS, n)
    lines = []
    for w in picked:
        qty = 1 + rng.randint(0, 2)
        lines.append({
            "work_id": w["id"],
            "work_name": w["name"],
            "price_rub": w["price_rub"],
            "quantity": qty,
            "comment": "",
        })
    return lines


def calc_total(lines: list[dict], circulation: int) -> int:
    return sum(l["price_rub"] * l["quantity"] for l in lines) * circulation


def build_completed_order(rng: random.Random, order_id: int, formed_at: datetime) -> dict:
    for _ in range(80):
        lines = pick_lines(rng)
        circulation = 2 + rng.randint(0, 2)
        total = calc_total(lines, circulation)
        if 0 < total <= MAX_ORDER_TOTAL:
            return {
                "id": order_id,
                "status": "completed",
                "creator_login": rng.choice(CREATORS),
                "book_title": rng.choice(BOOK_TITLES),
                "circulation": circulation,
                "total_price": total,
                "created_at": (formed_at - timedelta(hours=rng.randint(1, 48))).isoformat() + "Z",
                "formed_at": formed_at.isoformat() + "Z",
                "completed_at": (formed_at + timedelta(days=rng.randint(1, 14))).isoformat() + "Z",
                "works": lines,
                "filled_works_count": len(lines),
            }
    raise RuntimeError("failed to build order")


def random_formed_at(rng: random.Random) -> datetime:
    start = datetime(2026, 4, 1, 9, 0, 0)
    end = datetime(2026, 6, 7, 18, 0, 0)
    delta = int((end - start).total_seconds())
    t = start + timedelta(seconds=rng.randint(0, delta))
    return t.replace(hour=9 + rng.randint(0, 9), minute=rng.randint(0, 59))


def tune_completed_totals(orders: list[dict]) -> None:
    completed = [o for o in orders if o["status"] == "completed"]
    circ_sum = sum(o["circulation"] for o in completed)
    rev_sum = sum(o["total_price"] for o in completed)

    if circ_sum != TARGET_CIRCULATION:
        diff = TARGET_CIRCULATION - circ_sum
        step = 1 if diff > 0 else -1
        idx = 0
        while diff != 0 and completed:
            o = completed[idx % len(completed)]
            new_circ = o["circulation"] + step
            if new_circ < 2:
                idx += 1
                continue
            old_total = o["total_price"]
            unit = old_total // o["circulation"]
            o["circulation"] = new_circ
            o["total_price"] = unit * new_circ
            diff -= step
            idx += 1

    completed = [o for o in orders if o["status"] == "completed"]
    rev_sum = sum(o["total_price"] for o in completed)
    if rev_sum != TARGET_REVENUE:
        diff = TARGET_REVENUE - rev_sum
        idx = 0
        while diff != 0 and completed:
            o = completed[idx % len(completed)]
            step = 1000 if abs(diff) >= 1000 else (100 if abs(diff) >= 100 else (1 if diff > 0 else -1))
            if diff < 0:
                step = -step
            new_price = o["total_price"] + step
            if new_price <= 0:
                idx += 1
                continue
            o["total_price"] = new_price
            diff -= step
            idx += 1


def main() -> None:
    rng = random.Random(42)
    orders: list[dict] = []
    order_id = 1

    for _ in range(TARGET_COMPLETED):
        formed_at = random_formed_at(rng)
        orders.append(build_completed_order(rng, order_id, formed_at))
        order_id += 1

    for _ in range(TARGET_FORMED):
        formed_at = random_formed_at(rng)
        lines = pick_lines(rng)
        circulation = 2 + rng.randint(0, 2)
        total = calc_total(lines, circulation)
        orders.append({
            "id": order_id,
            "status": "formed",
            "creator_login": rng.choice(CREATORS),
            "book_title": rng.choice(BOOK_TITLES),
            "circulation": circulation,
            "total_price": total,
            "created_at": (formed_at - timedelta(hours=rng.randint(1, 24))).isoformat() + "Z",
            "formed_at": formed_at.isoformat() + "Z",
            "works": lines,
            "filled_works_count": len(lines),
        })
        order_id += 1

    for _ in range(TARGET_REJECTED):
        formed_at = random_formed_at(rng)
        lines = pick_lines(rng)
        circulation = 2 + rng.randint(0, 2)
        total = calc_total(lines, circulation)
        orders.append({
            "id": order_id,
            "status": "rejected",
            "creator_login": rng.choice(CREATORS),
            "book_title": rng.choice(BOOK_TITLES),
            "circulation": circulation,
            "total_price": total,
            "created_at": (formed_at - timedelta(hours=rng.randint(1, 24))).isoformat() + "Z",
            "formed_at": formed_at.isoformat() + "Z",
            "completed_at": (formed_at + timedelta(days=rng.randint(1, 7))).isoformat() + "Z",
            "rejection_reason": "Уточните тираж и состав услуг",
            "works": lines,
            "filled_works_count": len(lines),
        })
        order_id += 1

    tune_completed_totals(orders)

    completed = [o for o in orders if o["status"] == "completed"]
    assert len(orders) == TARGET_TOTAL_ORDERS
    assert len(completed) == TARGET_COMPLETED
    assert sum(o["circulation"] for o in completed) == TARGET_CIRCULATION
    assert sum(o["total_price"] for o in completed) == TARGET_REVENUE

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "orders.json").write_text(
        json.dumps(orders, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUT_DIR / "works.json").write_text(
        json.dumps(WORKS, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Wrote {len(orders)} orders, {len(WORKS)} works -> {OUT_DIR}")
    print(f"KPI: circulation={sum(o['circulation'] for o in completed)}, revenue={sum(o['total_price'] for o in completed)}")


if __name__ == "__main__":
    main()
