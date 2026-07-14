import type { ThemeName } from "../interfaces/StudioApplicationTypes";
export class ThemeManager { private theme: ThemeName = "light"; set(theme: ThemeName): void { this.theme = theme; } toggle(): ThemeName { this.theme = this.theme === "light" ? "dark" : "light"; return this.theme; } get(): ThemeName { return this.theme; } }
