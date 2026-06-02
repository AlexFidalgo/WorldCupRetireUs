from app.config import get_platform_priority


def select_best_platform_from_dict(team_odds: dict[str, float]) -> tuple[str | None, float]:
    if not team_odds:
        return None, 0

    best_platform = min(
        team_odds,
        key=lambda platform: (-team_odds[platform], get_platform_priority(platform), platform),
    )

    return best_platform, team_odds[best_platform]


def is_better_odd_candidate(
    candidate_odd: float,
    candidate_platform: str,
    current_odd: float,
    current_platform: str,
) -> bool:
    if candidate_odd > current_odd:
        return True

    if candidate_odd < current_odd:
        return False

    return get_platform_priority(candidate_platform) < get_platform_priority(current_platform)
