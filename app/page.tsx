import AppShell from '@/components/AppShell'
import { getCampaignThemeList, getVerticalList } from '@/lib/kb-parser'

export default function Home() {
  const verticals = getVerticalList()
  const campaignThemes = getCampaignThemeList()
  return <AppShell verticals={verticals} campaignThemes={campaignThemes} />
}
