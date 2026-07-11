# Yo-Yo Intermittent Recovery Test Level 1 (YYIR1) — Speed/Stage Table

Reference table for building a custom timer/audio app for the YYIR1 test.

## Protocol
- Set up two cones 20m apart (start cone + far cone), plus a recovery cone 5m behind the start
- 20m shuttle (out and back = 40m per circuit)
- 10-second active recovery between each circuit (walk/jog around recovery cone)
- Speed increases progressively per the table below
- Test ends after two consecutive missed lines (failure to reach the line in time)
- Score = level/shuttle reached, or total cumulative distance

## Speed/Stage Table

| Stage | Speed (km/h) | # of shuttles at this speed | Cumulative distance at end of stage |
|---|---|---|---|
| 1 | 10.0 | 1 | 40m |
| 2 | 12.0 | 1 | 80m |
| 3 | 13.0 | 2 | 160m |
| 4 | 13.5 | 3 | 280m |
| 5 | 14.0 | 4 | 440m |
| 6 | 14.5 | 8 | 760m |
| 7 | 15.0 | 8 | 1080m |
| 8 | 15.5 | 8 | 1400m |
| 9 | 16.0 | 8 | 1720m |
| 10 | 16.5 | 8 | 2040m |
| 11 | 17.0 | 8 | 2360m |
| 12 | 17.5 | 8 | 2680m |
| 13 | 18.0 | 8 | 3000m |
| 14 | 18.5 | 8 | 3320m |
| 15 | 19.0 | 8 | 3640m (end of test) |

*Source: Bangsbo, Iaia & Krustrup (2008), "The Yo-Yo Intermittent Recovery Test: A Useful Tool for Evaluation of Physical Performance in Intermittent Sports," Sports Med 38(1):37-51. Cross-checked against theyoyotest.com/table-YYIR1.htm.*

## Formulas

**Circuit time (seconds of running per 40m circuit):**
```
time = 40 / (speed_km/h × 1000 / 3600)
```
Then add 10 seconds recovery per circuit for total cycle time.

Example at 14.5 km/h: 40 / 4.028 m/s ≈ 9.93 sec running + 10 sec recovery ≈ 19.93 sec per circuit.

**Level number shortcut** (derivable directly from speed, holds across Yo-Yo test versions):
```
Level = (speed_km/h − 7.5) × 2
```

## Build Notes
Core loop: play a beep → run 20m out → beep → run 20m back → 10 sec recovery tone/silence → next beep pair, with per-circuit time shrinking according to the table above. Track cumulative distance and current stage/shuttle; end test and log final score after two consecutive failures to reach the line in time.