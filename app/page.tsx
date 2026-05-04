import AppShell from '@/components/AppShell'
import { getVerticalList } from '@/lib/kb-parser'

export default function Home() {
  const verticals = getVerticalList()
  return <AppShell verticals={verticals} />
}
