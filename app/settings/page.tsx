//cloud storage
"use client";

import React, { useMemo, useRef, useState } from "react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import type { FullState } from "@/types/state";
import { Download, Upload, RotateCcw, Trash2, LogIn, LogOut, CloudDownload, CloudUpload } from "lucide-react";

function parseExportFile(text: string): FullState | null {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    if (parsed && Array.isArray(parsed.tasks)) {
      return {
        tasks: parsed.tasks as FullState["tasks"],
        visionTiles: (parsed.visionTiles ?? []) as FullState["visionTiles"],
        visionGoals: (parsed.visionGoals ?? []) as FullState["visionGoals"],
        books: (parsed.books ?? []) as FullState["books"],
        reviews: (parsed.reviews ?? []) as FullState["reviews"],
        purchaseItems: (parsed.purchaseItems ?? []) as FullState["purchaseItems"],
        fragrances: (parsed.fragrances ?? []) as FullState["fragrances"],
        packages: (parsed.packages ?? []) as FullState["packages"],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  // existing actions
  const resetToDemo = useStore((s) => s.resetToDemo);
  const importState = useStore((s) => s.importState);
  const clearAll = useStore((s) => s.clearAll);

  // new auth/sync actions (from updated store.ts)
  const authed = useStore((s) => s._authed);
  const syncing = useStore((s) => s._syncing);
  const signIn = useStore((s) => s.signIn);
  const signUp = useStore((s) => s.signUp);
  const signOut = useStore((s) => s.signOut);
  const pullFromCloud = useStore((s) => s.pullFromCloud);
  const pushToCloud = useStore((s) => s.pushToCloud);

  // local ui state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  const canAuth = useMemo(() => email.trim().length > 3 && password.length >= 6, [email, password]);

  const handleExport = () => {
    const s = useStore.getState();
    const state = {
      version: 1,
      tasks: s.tasks,
      visionTiles: s.visionTiles,
      visionGoals: s.visionGoals,
      books: s.books,
      reviews: s.reviews,
      purchaseItems: s.purchaseItems,
      fragrances: s.fragrances,
      packages: s.packages,
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doshi-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const state = parseExportFile(text);
      if (state) {
        importState(state);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetDemo = () => {
    if (typeof window !== "undefined" && window.confirm("Replace all data with demo data?")) {
      resetToDemo();
    }
  };

  const handleClearAll = () => {
    if (typeof window !== "undefined" && window.confirm("Permanently delete all data? This cannot be undone.")) {
      clearAll();
    }
  };

  async function doSignIn() {
    setAuthBusy(true);
    setAuthError(null);
    setAuthMsg(null);
    try {
      await signIn(email.trim(), password);
      setAuthMsg("Signed in. Synced from cloud.");
    } catch (e: any) {
      setAuthError(e?.message ?? "Failed to sign in.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function doSignUp() {
    setAuthBusy(true);
    setAuthError(null);
    setAuthMsg(null);
    try {
      await signUp(email.trim(), password);
      setAuthMsg("Account created. Your data was pushed to cloud.");
    } catch (e: any) {
      setAuthError(e?.message ?? "Failed to sign up.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function doSignOut() {
    setAuthBusy(true);
    setAuthError(null);
    setAuthMsg(null);
    try {
      await signOut();
      setAuthMsg("Signed out.");
    } catch (e: any) {
      setAuthError(e?.message ?? "Failed to sign out.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function doPull() {
    setAuthBusy(true);
    setAuthError(null);
    setAuthMsg(null);
    try {
      await pullFromCloud();
      setAuthMsg("Pulled latest state from cloud.");
    } catch (e: any) {
      setAuthError(e?.message ?? "Failed to pull from cloud.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function doPush() {
    setAuthBusy(true);
    setAuthError(null);
    setAuthMsg(null);
    try {
      await pushToCloud();
      setAuthMsg("Pushed current state to cloud.");
    } catch (e: any) {
      setAuthError(e?.message ?? "Failed to push to cloud.");
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <SectionHeader title="Settings" description="Cloud sync, data, and preferences" />

      {/* Cloud Sync / Auth */}
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>Cloud sync</span>
            <span
              className={[
                "text-xs px-2 py-1 rounded-full border",
                authed ? "border-emerald-500/30 text-emerald-300" : "border-border text-muted-foreground",
              ].join(" ")}
            >
              {authed ? "Signed in" : "Signed out"}{syncing ? " • Syncing…" : ""}
            </span>
          </CardTitle>
          <CardDescription>
            Sign in to sync your dashboard across devices. Your data is cached locally for fast load, then synced to Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!authed ? (
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="aurora-input"
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">Password</label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  type="password"
                  className="aurora-input"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={doSignIn}
                  disabled={!canAuth || authBusy}
                  className="aurora-btn gap-2 rounded-xl"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
                <Button
                  variant="outline"
                  onClick={doSignUp}
                  disabled={!canAuth || authBusy}
                  className="aurora-btn-secondary gap-2 rounded-xl"
                >
                  <LogIn className="h-4 w-4" />
                  Create account
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={doPull}
                  disabled={authBusy}
                  className="aurora-btn-secondary gap-2 rounded-xl"
                >
                  <CloudDownload className="h-4 w-4" />
                  Pull from cloud
                </Button>
                <Button
                  variant="outline"
                  onClick={doPush}
                  disabled={authBusy}
                  className="aurora-btn-secondary gap-2 rounded-xl"
                >
                  <CloudUpload className="h-4 w-4" />
                  Push to cloud
                </Button>
                <Button
                  variant="outline"
                  onClick={doSignOut}
                  disabled={authBusy}
                  className="gap-2 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: changes auto-sync in the background; these buttons are for manual control + debugging.
              </p>
            </div>
          )}

          {authError && (
            <div className="text-sm text-destructive border border-destructive/20 bg-destructive/5 rounded-lg p-3">
              {authError}
            </div>
          )}
          {authMsg && (
            <div className="text-sm border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3 text-emerald-200">
              {authMsg}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data tools */}
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>
            Data is cached locally in your browser for fast load. If signed in, it syncs to the cloud so it shows up on other devices.
            Export JSON to back up or move data manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport} className="gap-2 aurora-btn-secondary rounded-xl">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              className="gap-2 aurora-btn-secondary rounded-xl"
            >
              <Upload className="h-4 w-4" />
              Import JSON
            </Button>
            <Button variant="outline" onClick={handleResetDemo} className="gap-2 aurora-btn-secondary rounded-xl">
              <RotateCcw className="h-4 w-4" />
              Reset to demo data
            </Button>
            <Button variant="destructive" onClick={handleClearAll} className="gap-2 rounded-xl">
              <Trash2 className="h-4 w-4" />
              Clear all data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="aurora-card">
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Doshi&apos;s Dashboard — personal dashboard. Desktop-first, cloud-sync ready.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Local cache:</strong> stored in your browser so the dashboard loads instantly.
          </p>
          <p>
            <strong>Cloud sync:</strong> when signed in, your state is stored in Supabase so it syncs across devices.
          </p>
          <p>
            <strong>Export/Import:</strong> Export downloads a JSON backup. Import reads a previously exported file and replaces your current state.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



//local storage
// "use client";

// import { useRef } from "react";
// import { SectionHeader } from "@/components/shared/SectionHeader";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { useStore } from "@/lib/store";
// import type { FullState } from "@/types/state";
// import { Download, Upload, RotateCcw, Trash2 } from "lucide-react";

// function parseExportFile(text: string): FullState | null {
//   try {
//     const parsed = JSON.parse(text) as Record<string, unknown>;
//     if (parsed && Array.isArray(parsed.tasks)) {
//       return {
//         tasks: parsed.tasks as FullState["tasks"],
//         visionTiles: (parsed.visionTiles ?? []) as FullState["visionTiles"],
//         visionGoals: (parsed.visionGoals ?? []) as FullState["visionGoals"],
//         books: (parsed.books ?? []) as FullState["books"],
//         reviews: (parsed.reviews ?? []) as FullState["reviews"],
//         purchaseItems: (parsed.purchaseItems ?? []) as FullState["purchaseItems"],
//         fragrances: (parsed.fragrances ?? []) as FullState["fragrances"],
//         packages: (parsed.packages ?? []) as FullState["packages"],
//       };
//     }
//     return null;
//   } catch {
//     return null;
//   }
// }

// export default function SettingsPage() {
//   const fileRef = useRef<HTMLInputElement>(null);
//   const resetToDemo = useStore((s) => s.resetToDemo);
//   const importState = useStore((s) => s.importState);
//   const clearAll = useStore((s) => s.clearAll);

//   const handleExport = () => {
//     const s = useStore.getState();
//     const state = {
//       version: 1,
//       tasks: s.tasks,
//       visionTiles: s.visionTiles,
//       visionGoals: s.visionGoals,
//       books: s.books,
//       reviews: s.reviews,
//       purchaseItems: s.purchaseItems,
//       fragrances: s.fragrances,
//       packages: s.packages,
//     };
//     const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `doshi-dashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       const text = reader.result as string;
//       const state = parseExportFile(text);
//       if (state) {
//         importState(state);
//       }
//     };
//     reader.readAsText(file);
//     e.target.value = "";
//   };

//   const handleResetDemo = () => {
//     if (typeof window !== "undefined" && window.confirm("Replace all data with demo data?")) {
//       resetToDemo();
//     }
//   };

//   const handleClearAll = () => {
//     if (typeof window !== "undefined" && window.confirm("Permanently delete all data? This cannot be undone.")) {
//       clearAll();
//     }
//   };

//   return (
//     <div className="space-y-8 max-w-2xl">
//       <SectionHeader title="Settings" description="Data and preferences" />
//       <Card className="aurora-card">
//         <CardHeader>
//           <CardTitle>Data</CardTitle>
//           <CardDescription>
//             Data is stored in a local SQLite database (data/dashboard.sqlite). Export to back up or move to another device.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex flex-wrap gap-3">
//             <Button variant="outline" onClick={handleExport} className="gap-2 aurora-btn-secondary rounded-xl">
//               <Download className="h-4 w-4" />
//               Export JSON
//             </Button>
//             <input
//               ref={fileRef}
//               type="file"
//               accept=".json"
//               className="hidden"
//               onChange={handleImport}
//             />
//             <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2 aurora-btn-secondary rounded-xl">
//               <Upload className="h-4 w-4" />
//               Import JSON
//             </Button>
//             <Button variant="outline" onClick={handleResetDemo} className="gap-2 aurora-btn-secondary rounded-xl">
//               <RotateCcw className="h-4 w-4" />
//               Reset to demo data
//             </Button>
//             <Button variant="destructive" onClick={handleClearAll} className="gap-2 rounded-xl">
//               <Trash2 className="h-4 w-4" />
//               Clear all data
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//       <Card className="aurora-card">
//         <CardHeader>
//           <CardTitle>About</CardTitle>
//           <CardDescription>
//             Doshi&apos;s Dashboard — personal dashboard. Desktop-first, local-first. No authentication.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="text-sm text-muted-foreground">
//           <p><strong>Where data is stored:</strong> Local SQLite database at <code className="text-xs">data/dashboard.sqlite</code> in the project folder. Data persists when you stop and restart the app.</p>
//           <p className="mt-2"><strong>Export/Import:</strong> Export downloads a JSON backup. Import reads a previously exported file and replaces the database content.</p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
