"use client";

/**
 * Issue #220 – Stellar Trustline Check and Setup for USDC
 *
 * On wallet connect, checks whether the connected account has a USDC
 * trustline via Horizon `loadAccount`.  When it is missing a dismissible
 * banner is shown on the dashboard with a one-click "Add trustline"
 * transaction flow.
 *
 * Environment variables expected:
 *   NEXT_PUBLIC_HORIZON_URL            – e.g. https://horizon-testnet.stellar.org
 *   NEXT_PUBLIC_USDC_ASSET_CODE        – e.g. USDC
 *   NEXT_PUBLIC_USDC_ASSET_ISSUER      – Stellar account G…
 */

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, X, Loader2 } from "lucide-react";

const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

const USDC_CODE =
  process.env.NEXT_PUBLIC_USDC_ASSET_CODE ?? "USDC";

const USDC_ISSUER =
  process.env.NEXT_PUBLIC_USDC_ASSET_ISSUER ?? "";

// ---------------------------------------------------------------------------
// Horizon helpers (no SDK dependency – plain fetch)
// ---------------------------------------------------------------------------

interface HorizonBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

async function hasTrustline(address: string): Promise<boolean> {
  if (!address || !USDC_ISSUER) return true; // treat as ok when not configured
  try {
    const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
    if (!res.ok) return false;
    const data = await res.json();
    return (data.balances as HorizonBalance[]).some(
      (b) =>
        b.asset_type === "credit_alphanum4" &&
        b.asset_code === USDC_CODE &&
        b.asset_issuer === USDC_ISSUER
    );
  } catch {
    return true; // network error – don't block the user
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface TrustlineGuardState {
  checking: boolean;
  missing: boolean;
  adding: boolean;
  added: boolean;
  error: string | null;
  addTrustline: () => Promise<void>;
  dismiss: () => void;
}

export function useTrustlineGuard(address: string | null): TrustlineGuardState {
  const [checking, setChecking] = useState(false);
  const [missing, setMissing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setMissing(false);
      setAdded(false);
      setDismissed(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    hasTrustline(address).then((has) => {
      if (!cancelled) {
        setMissing(!has);
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [address]);

  const addTrustline = useCallback(async () => {
    if (!address) return;
    setAdding(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const freighter = (window as any).freighterApi;
      if (!freighter) throw new Error("Freighter extension not found.");

      // Build a minimal change-trust XDR using Stellar base primitives.
      // The actual XDR construction requires @stellar/stellar-base which may
      // not be installed.  We use a feature-detection approach: if the SDK is
      // present we build a real transaction; otherwise we instruct the user.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const StellarSdk: any =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).StellarSdk ?? null;

      if (!StellarSdk) {
        throw new Error(
          "Stellar SDK not loaded. Please add the USDC trustline manually in your wallet."
        );
      }

      const server = new StellarSdk.Horizon.Server(HORIZON_URL);
      const account = await server.loadAccount(address);
      const asset = new StellarSdk.Asset(USDC_CODE, USDC_ISSUER);
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase:
          process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
          StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.changeTrust({ asset }))
        .setTimeout(180)
        .build();

      const signedXdr = await freighter.signTransaction(tx.toXDR(), {
        networkPassphrase:
          process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
          StellarSdk.Networks.TESTNET,
      });
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
          StellarSdk.Networks.TESTNET
      );
      await server.submitTransaction(signedTx);
      setAdded(true);
      setMissing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setAdding(false);
    }
  }, [address]);

  const dismiss = useCallback(() => setDismissed(true), []);

  return {
    checking,
    missing: missing && !dismissed && !added,
    adding,
    added,
    error,
    addTrustline,
    dismiss,
  };
}

// ---------------------------------------------------------------------------
// Banner component
// ---------------------------------------------------------------------------

interface TrustlineBannerProps {
  address: string | null;
}

export default function TrustlineBanner({ address }: TrustlineBannerProps) {
  const { checking, missing, adding, added, error, addTrustline, dismiss } =
    useTrustlineGuard(address);

  if (checking || (!missing && !added)) return null;

  if (added) {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
      >
        <CheckCircle2 size={18} aria-hidden="true" className="flex-shrink-0" />
        <span>
          USDC trustline added successfully. You can now receive USDC payouts.
        </span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm"
    >
      <AlertCircle
        size={18}
        aria-hidden="true"
        className="mt-0.5 flex-shrink-0 text-amber-400"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-amber-200">USDC trustline missing</p>
        <p className="mt-0.5 text-amber-300/80 leading-relaxed">
          Your wallet doesn&apos;t have a {USDC_CODE} trustline, so you
          can&apos;t receive payouts yet. Adding it reserves{" "}
          <span className="font-semibold text-amber-200">0.5 XLM</span> as a
          base reserve on your account.
        </p>
        {error && (
          <p className="mt-1 text-rose-400 text-xs">{error}</p>
        )}
        <button
          type="button"
          onClick={addTrustline}
          disabled={adding}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {adding && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
          {adding ? "Adding trustline…" : `Add ${USDC_CODE} trustline`}
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss trustline banner"
        className="flex-shrink-0 rounded-full p-1 text-amber-400/60 hover:text-amber-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
