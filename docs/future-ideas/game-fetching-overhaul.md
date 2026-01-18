# Game Data Fetching Overhaul (Future Improvement)

> **Status:** Planned | **Priority:** Low  
> **Created:** 2026-01-18

## Summary

Switch from IGDB appid-based lookups to **name-based search** for better match rates on large libraries.

## Key Points

- IGDB rate limit: 4 req/sec, 500 results/query, supports multiquery
- Name search: `where name ~ "GameName*"` for fuzzy matching
- 1000-game library would take ~5-6 minutes at safe rate limits
- Would need progressive loading UI with real-time progress

## Implementation Notes

See full research in the original discussion: name matching strategies, caching by normalized name, multiquery batching.

## When to Implement

Consider this when:
- Users report missing metadata on many games
- Library sizes grow beyond current timeout limits
- Name-based matching becomes critical for accuracy
