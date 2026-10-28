export type ThreeDeviceProfile = {
  webgl2: boolean;
  reducedMotion: boolean;
  saveData?: boolean;
  effectiveType?: string;
  hardwareConcurrency?: number;
  sessionDisabled?: boolean;
};

const SLOW_CONNECTIONS = new Set(["slow-2g", "2g", "3g"]);

export function shouldLoadThree(profile: ThreeDeviceProfile) {
  return profile.webgl2
    && !profile.reducedMotion
    && !profile.saveData
    && !profile.sessionDisabled
    && (!profile.effectiveType || !SLOW_CONNECTIONS.has(profile.effectiveType))
    && (profile.hardwareConcurrency === undefined || profile.hardwareConcurrency >= 4);
}
