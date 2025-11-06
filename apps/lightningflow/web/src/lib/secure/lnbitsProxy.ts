export async function proxyLNbits(workspaceId: string, path: string, payload?: any, method = 'POST') {
  const key = process.env[`LNBITS_KEY_${workspaceId}`] || process.env.LNBITS_KEY_DEFAULT
  const base = process.env.LNBITS_URL || 'https://legend.lnbits.com'

  if (!key) {
    throw new Error('LNbits API key not configured for this workspace')
  }

  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      'X-Api-Key': key,
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`LNbits API error: ${error}`)
  }

  return res.json()
}

export async function createInvoice(workspaceId: string, amount: number, memo: string) {
  return proxyLNbits(workspaceId, 'api/v1/payments', {
    out: false,
    amount,
    memo,
  })
}

export async function payInvoice(workspaceId: string, bolt11: string) {
  return proxyLNbits(workspaceId, 'api/v1/payments', {
    out: true,
    bolt11,
  })
}

export async function getWalletBalance(workspaceId: string) {
  return proxyLNbits(workspaceId, 'api/v1/wallet', undefined, 'GET')
}

export async function getPayments(workspaceId: string) {
  return proxyLNbits(workspaceId, 'api/v1/payments', undefined, 'GET')
}

export async function checkPayment(workspaceId: string, paymentHash: string) {
  return proxyLNbits(workspaceId, `api/v1/payments/${paymentHash}`, undefined, 'GET')
}

// PSBT signing functionality
export async function signPSBT(workspaceId: string, psbt: string) {
  return proxyLNbits(workspaceId, 'api/v1/psbt/sign', { psbt })
}

// LNURL functionality
export async function createLNURLWithdraw(workspaceId: string, amount: number, memo: string) {
  return proxyLNbits(workspaceId, 'withdraw/api/v1/links', {
    title: memo,
    min_withdrawable: amount,
    max_withdrawable: amount,
    uses: 1,
    wait_time: 1,
    is_unique: true,
  })
}

export async function createLNURLPay(workspaceId: string, amount: number, description: string) {
  return proxyLNbits(workspaceId, 'lnurlp/api/v1/links', {
    description,
    amount,
    comment_chars: 0,
  })
} 