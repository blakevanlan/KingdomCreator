export interface DigitalCard {
    readonly id: string,
    readonly frenchName: string,
    readonly artwork: string,
    readonly text_html: string
  }

export interface IllustratorCard {
    readonly id: string,
    readonly illustrator: string
  }

export interface YearOfSet {
    readonly id: string,
    readonly year: number,
    readonly order: number
  }