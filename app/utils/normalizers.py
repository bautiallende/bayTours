import geonamescache
from fuzzywuzzy import process

gc = geonamescache.GeonamesCache()
_all_cities = gc.get_cities().values()

def normalize_city(raw_name: str, country_code: str | None = None, threshold: int = 80) -> dict | None:
    """
    Devuelve un dict con {'name', 'countrycode'} si la coincidencia es ≥ threshold,
    o None si no hay match fiable.
    """
    # 1) Filtrar ciudades por país (si se proporcionó)
    pool = (
        [c for c in _all_cities if c['countrycode'] == country_code]
        if country_code else
        list(_all_cities)
    )
    # 2) Extraer lista de nombres
    names = [c['name'] for c in pool]
    # 3) Buscar mejor coincidencia
    print(f"Normalizando ciudad: {raw_name} (names: {names})")
    match, score = process.extractOne(raw_name, names)
    if score < threshold:
        return None

    # 4) Devolver el registro completo
    for city in pool:
        if city['name'] == match:
            return {
                'name':        city['name'],
                'countrycode': city['countrycode']
            }
    return None