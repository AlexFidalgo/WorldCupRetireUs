from app.scrapers.betano import BetanoOddsProvider


provider = BetanoOddsProvider()
odds = provider.fetch_winner_odds()

for odd in odds:
    print(odd)

# python -m tests.scrapers.manual_test_betano