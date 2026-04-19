"use client";

import { useState } from "react";
import clsx from "clsx";

/**
 * ChainIcon — small circular icon for a chain. Renders remote <img> when
 * logoUrl is provided; falls back to a solid-color disc with the chain's
 * shortCode when the image is missing or fails to load.
 */
interface ChainIconProps {
  logoUrl?: string;
  fallbackLabel: string; // shortCode, e.g. "ETH"
  fallbackColor: string; // chain color, e.g. "#627EEA"
  size?: number;
  className?: string;
  title?: string;
}

export function ChainIcon({
  logoUrl,
  fallbackLabel,
  fallbackColor,
  size = 20,
  className,
  title,
}: ChainIconProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !logoUrl || errored;

  const style: React.CSSProperties = {
    width: size,
    height: size,
  };

  if (showFallback) {
    return (
      <span
        className={clsx(
          "inline-flex items-center justify-center rounded-full border border-white/20 font-mono font-bold",
          className,
        )}
        style={{
          ...style,
          backgroundColor: fallbackColor,
          fontSize: Math.max(8, Math.round(size * 0.42)),
          color: "#0F172A",
        }}
        aria-hidden
        title={title}
      >
        {fallbackLabel.slice(0, 3)}
      </span>
    );
  }

  return (
    // Remote logo URL varies (LI.FI / Trust Wallet / Zapper / Debank / IPFS /
    // Arweave); using plain <img> keeps next/image out of the critical path
    // and avoids having to maintain an image-domains allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      role="presentation"
      onError={() => setErrored(true)}
      className={clsx(
        "inline-block rounded-full border border-white/20 bg-white/[0.04] object-cover",
        className,
      )}
      style={style}
      title={title}
    />
  );
}

/**
 * TokenIcon — circular icon for a token. Same remote/fallback strategy as
 * ChainIcon, but the fallback colour tends to be the asset-class color and
 * the label is the symbol abbreviation.
 */
interface TokenIconProps {
  logoUrl?: string;
  symbol: string;
  tintColor: string; // asset class color
  size?: number;
  className?: string;
  title?: string;
}

export function TokenIcon({
  logoUrl,
  symbol,
  tintColor,
  size = 24,
  className,
  title,
}: TokenIconProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !logoUrl || errored;

  const style: React.CSSProperties = {
    width: size,
    height: size,
  };

  if (showFallback) {
    return (
      <span
        className={clsx(
          "inline-flex items-center justify-center rounded-full border border-white/20 font-mono font-bold",
          className,
        )}
        style={{
          ...style,
          backgroundColor: tintColor + "30",
          color: tintColor,
          fontSize: Math.max(8, Math.round(size * 0.42)),
        }}
        aria-hidden
        title={title ?? symbol}
      >
        {symbol.slice(0, 2)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      role="presentation"
      onError={() => setErrored(true)}
      className={clsx(
        "inline-block rounded-full border border-white/20 bg-white/[0.06] object-cover",
        className,
      )}
      style={style}
      title={title ?? symbol}
    />
  );
}
