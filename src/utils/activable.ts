export class Activable<T> {
  value: T;
  isActive: boolean;
  constructor(value: T, isActive: boolean) {
    this.value = value;
    this.isActive = isActive;
  }
}