import { Suspense } from "react";
import { connection } from "next/server";
import { getMenu } from "@/lib/menu/getMenu";
import { MenuShell } from "./_components/MenuShell";

async function MenuContent() {
  await connection();
  const menu = await getMenu();
  return <MenuShell menu={menu} />;
}

export default function QrPage() {
  return (
    <Suspense fallback={<div className="menu-loading" aria-busy="true" />}>
      <MenuContent />
    </Suspense>
  );
}
