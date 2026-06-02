from playwright.sync_api import TimeoutError, sync_playwright

from app.config import TARGET_TEAMS, resolve_team_name
from app.schemas import OddCreateRequest
from app.scrapers.base import OddsProvider


BETANO_WINNER_URL = "https://www.betano.bet.br/sport/futebol/competicoes/copa-do-mundo/189813/?bt=winner"


class BetanoOddsProvider(OddsProvider):
    platform_name = "Betano"

    def fetch_winner_odds(self) -> list[OddCreateRequest]:
        results = []

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=False)
            page = browser.new_page()

            page.goto(BETANO_WINNER_URL, wait_until="networkidle")
            #page.pause()

            page.goto(BETANO_WINNER_URL, wait_until="domcontentloaded")

            try:
                # Betano may show a consent popup before the odds table is accessible.
                accept_button = page.get_by_role("button", name="Sim", exact=True)
                accept_button.wait_for(timeout=10000)
                accept_button.click()
            except TimeoutError:
                pass

            page.wait_for_selector(".row-info", timeout=15000)

            page.wait_for_selector(".row-info", timeout=15000)

            row_infos = page.locator(".row-info")
            total_rows = row_infos.count()

            for index in range(total_rows):
                row_info = row_infos.nth(index)

                raw_team_name = row_info.locator(".row-title__text").inner_text().strip()

                canonical_team = resolve_team_name(raw_team_name)

                if canonical_team is None:
                    continue

                if canonical_team not in TARGET_TEAMS:
                    continue

                row_container = row_info.locator("xpath=ancestor::div[contains(@class, 'table-list-row')]").first

                odd_text = row_container.locator(
                    "[data-qa='event-selection'] .tw-text-sem-color-text-highlight"
                ).inner_text().strip()

                odd_value = float(odd_text.replace(",", "."))

                results.append(
                    OddCreateRequest(
                        team=canonical_team,
                        platform=self.platform_name,
                        market="winner",
                        odd=odd_value,
                        source_url=BETANO_WINNER_URL,
                    )
                )

            browser.close()

        return results