"""app/utils/geo.py
================================

Funciones utilitarias para enriquecer la información geográfica de una ciudad
mediante *geonamescache* y para comparar nombres con *rapidfuzz*.

* **enrich_geo_data**: recibe `(name, country_code)` y devuelve región,
  continente, lat/lon y geonames_id.  
* **similar_names**: ratio de similitud (0‑100) entre dos strings.

Todas las llamadas están pensadas para uso síncrono; si en el futuro usamos
I/O de red se podrá convertir a async fácilmente.
"""
from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any, Dict, Optional, Tuple

import geonamescache
from rapidfuzz import fuzz

log = logging.getLogger(__name__)

_GC = geonamescache.GeonamesCache()
_COUNTRY_CONTINENT = {
    c["iso"]: c["continentcode"]  # e.g. {"ES": "EU", "GB": "EU"}
    for c in _GC.get_countries().values()
}

# --------------------------------------------------------------------------- #
# Utils
# --------------------------------------------------------------------------- #
def _continent_of_country(country_code: str) -> Optional[str]:
    """Return 2-letter continent code (EU, AS, AF, OC, AN, NA, SA)."""
    return _COUNTRY_CONTINENT.get(country_code.upper())


def _all_cities_in_country(country_code: str) -> list[dict[str, Any]]:
    """Return list of city dicts in the requested country."""
    cc = country_code.upper()
    return [
        c for c in _GC.get_cities().values() if c["countrycode"].upper() == cc
    ]


def _best_match(name: str, country: str) -> Optional[dict[str, Any]]:
    """
    Find the most likely city in GeoNames:
    1. Exact match ignoring case/accents.
    2. Fuzzy match (ratio >= 90) and pick the most populated.
    """
    name_norm = name.strip().lower()
    candidates = _all_cities_in_country(country)

    # First-pass exact comparison (case-insensitive)
    exact = [
        c for c in candidates if c["name"].strip().lower() == name_norm
    ]
    if exact:
        return max(exact, key=lambda x: int(x.get("population", 0) or 0))

    # Second-pass fuzzy search
    scored: list[Tuple[int, dict[str, Any]]] = []
    for c in candidates:
        score = fuzz.ratio(name_norm, c["name"].lower())
        if score >= 70:
            scored.append((score, c))

    if scored:
        # Pick highest score, then highest population
        scored.sort(key=lambda x: (x[0], int(x[1].get("population", 0) or 0)), reverse=True)
        return scored[0][1]

    return None


# --------------------------------------------------------------------------- #
# Public helpers
# --------------------------------------------------------------------------- #
def similar_names(a: str, b: str) -> int:
    """Return RapidFuzz ratio (0-100) after stripping whitespace."""
    return fuzz.ratio(a.strip().lower(), b.strip().lower())


@lru_cache(maxsize=2048)
def enrich_geo_data(name: str, country: str) -> Dict[str, Any]:
    """
    Given *name* + ISO country code, return a dict with extra geo data.
    Fields may be None if the city isn't found.
    """
    country = country.upper().strip()
    match = _best_match(name, country)

    if match is None:
        log.warning("enrich_geo_data: no candidates for city '%s' in %s", name, country)
        return {
            "region": None,
            "continent": _continent_of_country(country),
            "latitude": None,
            "longitude": None,
            "geonames_id": None,
        }

    return {
        "region": match.get("admin1"),
        "continent": _continent_of_country(country),
        "latitude": float(match["latitude"]),
        "longitude": float(match["longitude"]),
        "geonames_id": int(match["geonameid"]),
    }