import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { createLnurlPay } from '../pay'

// Mock the supabase client before importing pay module
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

const originalFetch = global.fetch

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  global.fetch = originalFetch
  vi.restoreAllMocks()
})

describe('createLnurlPay', () => {
  it('returns lnurl from API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ lnurl: 'lnurl1test' }),
    } as Response)
    
    const result = await createLnurlPay('1')
    expect(result).toBe('lnurl1test')
    
    expect(global.fetch).toHaveBeenCalledWith('/api/lnurl-pay?invoice_id=1')
  })

  it('throws error when API call fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    } as Response)
    
    await expect(createLnurlPay('1')).rejects.toThrow('Failed to create LNURL')
  })
})
