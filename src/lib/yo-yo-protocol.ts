import type { LevelData } from './types.js';

/**
 * Yo-Yo Intermittent Recovery Test Level 1 (YYIR1) protocol.
 *
 * - 20m shuttle (out and back = 40m per circuit)
 * - 10-second active recovery between each circuit
 * - Speed increases per stage
 * - Test ends after two consecutive missed lines
 *
 * Source: docs/yyir1-protocol.md
 */
export const YYIR1_LEVELS: LevelData[] = [
  { level: 1, shuttles: 1, speed: 10.0, shuttleTime: 14.40, shuttleDistance: 40, cumulativeDistance: 40 },
  { level: 2, shuttles: 1, speed: 12.0, shuttleTime: 12.00, shuttleDistance: 40, cumulativeDistance: 80 },
  { level: 3, shuttles: 2, speed: 13.0, shuttleTime: 11.08, shuttleDistance: 40, cumulativeDistance: 160 },
  { level: 4, shuttles: 3, speed: 13.5, shuttleTime: 10.67, shuttleDistance: 40, cumulativeDistance: 280 },
  { level: 5, shuttles: 4, speed: 14.0, shuttleTime: 10.29, shuttleDistance: 40, cumulativeDistance: 440 },
  { level: 6, shuttles: 8, speed: 14.5, shuttleTime: 9.93, shuttleDistance: 40, cumulativeDistance: 760 },
  { level: 7, shuttles: 8, speed: 15.0, shuttleTime: 9.60, shuttleDistance: 40, cumulativeDistance: 1080 },
  { level: 8, shuttles: 8, speed: 15.5, shuttleTime: 9.29, shuttleDistance: 40, cumulativeDistance: 1400 },
  { level: 9, shuttles: 8, speed: 16.0, shuttleTime: 9.00, shuttleDistance: 40, cumulativeDistance: 1720 },
  { level: 10, shuttles: 8, speed: 16.5, shuttleTime: 8.73, shuttleDistance: 40, cumulativeDistance: 2040 },
  { level: 11, shuttles: 8, speed: 17.0, shuttleTime: 8.47, shuttleDistance: 40, cumulativeDistance: 2360 },
  { level: 12, shuttles: 8, speed: 17.5, shuttleTime: 8.23, shuttleDistance: 40, cumulativeDistance: 2680 },
  { level: 13, shuttles: 8, speed: 18.0, shuttleTime: 8.00, shuttleDistance: 40, cumulativeDistance: 3000 },
  { level: 14, shuttles: 8, speed: 18.5, shuttleTime: 7.78, shuttleDistance: 40, cumulativeDistance: 3320 },
  { level: 15, shuttles: 8, speed: 19.0, shuttleTime: 7.58, shuttleDistance: 40, cumulativeDistance: 3640 },
];

/** 10-second active recovery between each circuit */
export const RECOVERY_SECONDS = 10;

/**
 * Calculate circuit time in seconds for a given speed.
 * Circuit = 40m (20m out + 20m back).
 */
export function circuitTime(speedKmh: number): number {
  const speedMs = speedKmh * 1000 / 3600;
  return 40 / speedMs;
}

/**
 * Estimate VO2max from YYIR1 final distance.
 * Formula: VO2max = distance × 0.0084 + 36.4
 * Source: Bangsbo et al. (2008)
 */
export function estimateVO2max(totalDistanceMeters: number): number {
  return totalDistanceMeters * 0.0084 + 36.4;
}
