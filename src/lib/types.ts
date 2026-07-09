export type TestType = 'yo-yo-ir1' | 'yo-yo-ir2' | 'yo-yo-endurance';

export interface TestSession {
  id: string;
  date: string;
  testType: TestType;
  currentLevel: number;
  currentShuttle: number;
  status: 'idle' | 'running' | 'paused' | 'complete';
  /** Total distance covered in meters */
  totalDistance: number;
  /** Estimated VO2max based on final level */
  vo2max: number | null;
}

export interface LevelData {
  level: number;
  shuttles: number;
  speed: number;
  /** Time per shuttle in seconds */
  shuttleTime: number;
  /** Distance per shuttle in meters (always 20m for Yo-Yo IR) */
  shuttleDistance: number;
  /** Cumulative distance at end of this level */
  cumulativeDistance: number;
}
