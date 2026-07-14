export class FooterGenerator { create(value: string): string { if (!value.trim()) throw new Error("Footer cannot be empty"); return value; } }
