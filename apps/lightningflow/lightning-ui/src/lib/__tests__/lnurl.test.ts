import { describe, it, expect } from 'vitest'
import { encodeLnurl } from '../lnurl'

// Basic property test to ensure encoded string matches LNURL format

describe('encodeLnurl', () => {
  it('encodes a URL into a bech32 LNURL string', () => {
    const lnurl = encodeLnurl('https://example.com')
    expect(lnurl.startsWith('lnurl1')).toBe(true)
    expect(lnurl.length).toBeGreaterThan(10)
  })
})
