import type { IconName } from "./icons";

// Was die Shell des internen Bereichs zeigt. Die Zahlen lädt das Layout auf dem Server.
export type ShellDaten = {
  name: string;
  email: string;
  offeneBelege: number;
  neueAntraege: number;
};

export type BereichKey = "antraege" | "mitglieder" | "spenden" | "foerderprojekte";

export const BEREICHE: readonly { key: BereichKey; href: string; label: string; icon: IconName }[] = [
  { key: "antraege", href: "/admin", label: "Mitgliedsanträge", icon: "antraege" },
  { key: "mitglieder", href: "/admin/mitglieder", label: "Mitglieder", icon: "mitglieder" },
  { key: "spenden", href: "/admin/spenden", label: "Spendenbelege", icon: "spenden" },
  {
    key: "foerderprojekte",
    href: "/admin/foerderprojekte",
    label: "Förderprojekte",
    icon: "foerderprojekte",
  },
];

export const SCHNELLAKTIONEN = [
  { href: "/admin/spenden/neu", label: "Spende erfassen" },
  { href: "/admin/mitglieder/neu", label: "Mitglied anlegen" },
  { href: "/admin/foerderprojekte?neu", label: "Förderprojekt anlegen" },
] as const;

export function aktiverBereich(pfad: string): BereichKey {
  if (pfad.startsWith("/admin/mitglieder")) return "mitglieder";
  if (pfad.startsWith("/admin/spenden")) return "spenden";
  if (pfad.startsWith("/admin/foerderprojekte")) return "foerderprojekte";
  return "antraege";
}
