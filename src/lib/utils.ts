import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const WHITESPACE_REGEX = /\s/

type PrevCharInfo = {
  char: string
  distance: number
} | null

const findPrevNonWhitespace = (expression: string, index: number): PrevCharInfo => {
  let distance = 0

  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const current = expression[cursor]
    if (WHITESPACE_REGEX.test(current)) {
      distance += 1
      continue
    }
    return { char: current, distance }
  }

  return null
}

const findNextNonWhitespaceChar = (expression: string, index: number): string | null => {
  for (let cursor = index + 1; cursor < expression.length; cursor += 1) {
    const current = expression[cursor]
    if (WHITESPACE_REGEX.test(current)) {
      continue
    }
    return current
  }
  return null
}

export function normalizeSingleEquals(expression: string): string {
  let result = ""

  for (let cursor = 0; cursor < expression.length; cursor += 1) {
    const char = expression[cursor]

    if (char !== "=") {
      result += char
      continue
    }

    const prevInfo = findPrevNonWhitespace(expression, cursor)
    const nextChar = findNextNonWhitespaceChar(expression, cursor)

    const isDoubleEquals = nextChar === "="
    const isComparator =
      prevInfo !== null &&
      "!<>=".includes(prevInfo.char) &&
      prevInfo.distance === 0
    const isAssignmentAlias =
      prevInfo !== null &&
      prevInfo.char === ":" &&
      prevInfo.distance === 0

    if (!isDoubleEquals && !isComparator && !isAssignmentAlias) {
      result += "=="
    } else {
      result += "="
    }
  }

  return result
}
