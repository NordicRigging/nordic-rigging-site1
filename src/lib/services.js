/**
 * The three service lines. Images live at these exact public paths — drop the
 * real photos in and the designed solid-colour fallbacks step aside with no
 * code changes.
 */
export const SERVICES = [
  {
    slug: 'mast-work',
    label: 'Mast Work',
    sub: '01 · Stepping · standing rigging · tune',
    image: '/images/mast-work.jpg',
    fallback: '#152431',
    blurb:
      'Stepping and unstepping, standing rigging replacement, spreader and fitting work, and a proper tune before you sail away.',
    points: [
      'Mast stepping & unstepping',
      'Standing rigging replacement',
      'Spreaders, tangs & terminals',
      'Rig tune, documented with Rig-Sense'
    ]
  },
  {
    slug: 'rope-stock',
    label: 'Rope Stock',
    sub: '02 · Running rigging · splicing · hardware',
    image: '/images/rope-stock.jpg',
    fallback: '#2b241d',
    blurb:
      'Running rigging cut to length from stock, spliced and finished in-house, with the blocks and clutches to match.',
    points: [
      'Halyards & sheets from stock',
      'Splicing & whipping in-house',
      'Blocks, clutches & deck hardware',
      'Advice matched to your boat, not the catalogue'
    ]
  },
  {
    slug: 'maintenance',
    label: 'Maintenance',
    sub: '03 · Inspections · winch service · season prep',
    image: '/images/maintenance.jpg',
    fallback: '#1b2a25',
    blurb:
      'Rig inspections, winch service and seasonal preparation — the quiet work that keeps the loud failures from happening.',
    points: [
      'Rig inspections aloft & on deck',
      'Winch strip-down & service',
      'Season prep & lay-up checks',
      'Reports you can hand to your insurer'
    ]
  }
];

export const serviceBySlug = slug => SERVICES.find(s => s.slug === slug);
