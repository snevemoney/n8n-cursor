import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const checks = {
    hasGlobalsCss: false,
    hasSidebar: false,
    hasDashboard: false,
    hasBusinessSidebar: false,
    hasClientLayout: false,
    flags: {
      newDashboard: process.env.NEXT_PUBLIC_FF_NEW_DASHBOARD || null,
      aiSections: process.env.NEXT_PUBLIC_FF_AI_SECTIONS || null,
      maintenance: process.env.NEXT_PUBLIC_MAINTENANCE || null,
    }
  };

  const root = process.cwd();
  const expect = [
    "src/app/layout.tsx",
    "src/app/dashboard/page.tsx",
    "src/components/layout/business-sidebar.tsx",
    "src/components/layout/client-layout.tsx",
    "src/app/globals.css"
  ];
  const found: [string, boolean][] = expect.map(p => [p, fs.existsSync(path.join(root, p))]);

  checks.hasGlobalsCss = found.find(([p, ok]) => p.endsWith("globals.css") && ok)?.[1] || false;
  checks.hasSidebar = found.find(([p, ok]) => p.includes("business-sidebar") && ok)?.[1] || false;
  checks.hasBusinessSidebar = checks.hasSidebar;
  checks.hasDashboard = found.find(([p, ok]) => p.includes("/dashboard/page.tsx") && ok)?.[1] || false;
  checks.hasClientLayout = found.find(([p, ok]) => p.includes("client-layout") && ok)?.[1] || false;

  return NextResponse.json({ 
    found, 
    checks,
    timestamp: new Date().toISOString(),
    buildInfo: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || '3000'
    }
  }, { status: 200 });
}
