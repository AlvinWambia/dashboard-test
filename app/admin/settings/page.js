import { getConsultationSettings } from "@/app/actions/settingsActions";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const initialSettings = await getConsultationSettings();
  return <SettingsClient initialSettings={initialSettings} />;
}
