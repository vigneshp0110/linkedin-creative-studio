export interface Angle {
  id: string
  description: string
  frequency: number
  quote?: string
}

export interface Theme {
  id: string
  name: string
  totalFrequency: number
  angles: Angle[]
}

export interface Campaign {
  id: string
  name: string
  themes: Theme[]
}

export interface KBVertical {
  id: string
  label: string
  campaigns: Campaign[]
}

export type LayoutTemplate = 'statement' | 'pain-story' | 'data-card' | 'testimonial'

export interface GenerateRequest {
  verticalLabel: string
  campaignName: string
  themeName: string
  angle: Angle
  layout: LayoutTemplate
  concept?: CreativeConcept
  implication?: Implication
  customContext?: string
  providedCopy?: AdCopy
}

export interface Implication {
  id: string
  label: string
  expansion: string
}

export interface AdCopy {
  headline: string
  subheadline: string
  body: string[]
  cta: string
}

export interface GenerateResponse {
  copy: AdCopy
  squareImage: string
  landscapeImage: string
}

export interface CreativeConcept {
  id: string
  conceptNumber: number
  hook: string
  visualDirection: string
  emotionalRegister: string
  narrativeStructure: string
  ctaDirection: string
  scrollStopper: string
}

export interface EducationalRequest {
  guideTitle: string
  bodyCopy: string
  cta: string
  format?: 'square' | 'landscape'
  visualDirections?: { id: string; name: string; description: string }[]
}

export interface EducationalVariation {
  id: string
  name: string
  visualDirection: string
  squareImage: string | null
  landscapeImage: string | null
}

export interface BadgeRequest {
  tagline: string
  cta: string
  badgeCount: number
}

export interface TestimonialRequest {
  quote: string
  name: string
  title: string
  company: string
  cta: string
  hasLogo: boolean
}
