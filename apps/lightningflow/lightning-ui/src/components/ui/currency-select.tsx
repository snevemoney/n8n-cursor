"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Currency, CURRENCIES } from "../../lib/currency"

interface CurrencySelectProps {
  value: Currency
  onValueChange: (value: Currency) => void
  disabled?: boolean
  className?: string
}

export function CurrencySelect({
  value,
  onValueChange,
  disabled,
  className,
}: CurrencySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onValueChange(val as Currency)}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[120px] ${className}`}>
        <SelectValue placeholder="BTC">
          <div className="flex items-center">
            <span className="mr-1">{CURRENCIES[value]?.symbol}</span>
            <span>{value}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Crypto</SelectLabel>
          <SelectItem value="BTC">
            <div className="flex items-center">
              <span className="mr-1">{CURRENCIES.BTC.symbol}</span>
              <span>{CURRENCIES.BTC.code}</span>
            </div>
          </SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Fiat</SelectLabel>
          <SelectItem value="USD">
            <div className="flex items-center">
              <span className="mr-1">{CURRENCIES.USD.symbol}</span>
              <span>{CURRENCIES.USD.code}</span>
            </div>
          </SelectItem>
          <SelectItem value="CAD">
            <div className="flex items-center">
              <span className="mr-1">{CURRENCIES.CAD.symbol}</span>
              <span>{CURRENCIES.CAD.code}</span>
            </div>
          </SelectItem>
          <SelectItem value="EUR">
            <div className="flex items-center">
              <span className="mr-1">{CURRENCIES.EUR.symbol}</span>
              <span>{CURRENCIES.EUR.code}</span>
            </div>
          </SelectItem>
          <SelectItem value="GBP">
            <div className="flex items-center">
              <span className="mr-1">{CURRENCIES.GBP.symbol}</span>
              <span>{CURRENCIES.GBP.code}</span>
            </div>
          </SelectItem>
          <SelectItem value="JPY">
            <div className="flex items-center">
              <span className="mr-1">{CURRENCIES.JPY.symbol}</span>
              <span>{CURRENCIES.JPY.code}</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
} 