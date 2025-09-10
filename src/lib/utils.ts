import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export function createKnightUrl(knightId: string, knightName: string): string {
  const idPrefix = knightId.substring(0, 3)
  const slugName = slugify(knightName)
  return `knight=${idPrefix}-${slugName}`
}

export function createBattleUrl(winnerTeam: string[], loserTeam: string[], knights: any[]): string {
  const getKnightName = (id: string) => knights.find(k => k.id === id)?.name || 'unknown'
  
  const winnerNames = winnerTeam.map(id => slugify(getKnightName(id))).join('-')
  const loserNames = loserTeam.map(id => slugify(getKnightName(id))).join('-')
  
  return `${winnerNames}-x-${loserNames}`
}

export function parseKnightUrl(param: string): { idPrefix: string; slug: string } | null {
  const match = param.match(/^(\w{3})-(.+)$/)
  if (!match) return null
  return { idPrefix: match[1], slug: match[2] }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
