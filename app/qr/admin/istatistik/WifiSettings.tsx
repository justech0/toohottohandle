"use client";
import type { CatalogData } from "@/lib/admin/catalog";
import { ActionForm } from "../katalog/CatalogEditor";
import { saveWifiAction } from "./actions";
export function WifiSettings({ data }: { data: CatalogData }) {
 return <section id="settings" className="adm-card"><h2 className="adm-card__title">WiFi ve istatistik ayarları</h2><ActionForm action={saveWifiAction} testId="settings-form">          <div className="adm-row"><label className="adm-field">Ağ adı<input name="wifiSsid" defaultValue={data.settings.wifiSsid} maxLength={120} /></label><label className="adm-field">Kullanıcı adı<input name="wifiUsername" defaultValue={data.settings.wifiUsername} maxLength={120} /></label></div>
          <label className="adm-field">Yeni WiFi şifresi<input name="wifiPassword" type="password" maxLength={255} autoComplete="new-password" aria-describedby="wifi-password-note" /></label>
          <p id="wifi-password-note" className="adm-note">Değiştirmeyecekseniz boş bırakın. Mevcut şifre gösterilmez.</p>
          <label className="adm-field">WiFi yönergesi (TR)<textarea name="wifiNoteTr" defaultValue={data.settings.wifiNoteTr} maxLength={2000} rows={2} /></label>
          <div className="adm-row">
            <label className="adm-field">İngilizce WiFi yönergesi (EN)<textarea name="wifiNoteEn" defaultValue={data.settings.wifiNoteEn ?? ""} maxLength={2000} rows={2} placeholder="Boşsa TR gösterilir" /></label>
            <label className="adm-field">Arapça WiFi yönergesi (AR)<textarea name="wifiNoteAr" defaultValue={data.settings.wifiNoteAr ?? ""} maxLength={2000} rows={2} placeholder="Boşsa TR gösterilir" dir="auto" /></label>
          </div>
<div className="adm-checks"><label><input name="statsEnabled" type="checkbox" defaultChecked={data.settings.statsEnabled} /> İstatistik açık</label></div><button className="adm-btn adm-btn--main" type="submit">Ayarları kaydet</button></ActionForm></section>;
}
