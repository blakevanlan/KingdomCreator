import type { SetId } from "./set-id"

export interface Card {
  readonly id: string;
  readonly shortId: string;
  readonly setId: SetId;
  readonly name: string;
  readonly orderstring: string;
}
export interface VisibleType<T> {
  type: T;
  name: string;
}