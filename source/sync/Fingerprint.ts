import type { FingerprintSnapshot } from "./interfaces/SyncTypes";

export class Fingerprint {
  constructor(readonly value: string, readonly algorithm = "sha256" as const) {
    if (value.length === 0) throw new Error("Fingerprint value cannot be empty");
  }
  equals(other: Fingerprint): boolean {
    return this.algorithm === other.algorithm && this.value === other.value;
  }
  serialize(): string {
    return `${this.algorithm}:${this.value}`;
  }
  get(): FingerprintSnapshot {
    return { algorithm: this.algorithm, value: this.value };
  }
}
