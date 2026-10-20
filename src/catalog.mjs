// Only local browser/environment checks. IP reputation belongs to IPQuality.
// Each provider module owns its page flow, completion signal and parser.
import checkcc from './providers/checkcc.mjs';
import claudetest from './providers/claudetest.mjs';
import cleanip from './providers/cleanip.mjs';
import pingip from './providers/pingip.mjs';
import aizx from './providers/aizx.mjs';
import fuckclaude from './providers/fuckclaude.mjs';
import amichina from './providers/amichina.mjs';
import claudetester from './providers/claudetester.mjs';

export const SOURCES=Object.freeze([checkcc,claudetest,cleanip,pingip,aizx,fuckclaude,amichina,claudetester].map(Object.freeze));

export function selectSources(ids) {
  if (!ids || ids==='all') return [...SOURCES];
  const names=ids.split(',');
  if(names.some(id=>!SOURCES.some(s=>s.id===id))) throw Error('unknown_source');
  return [...new Set(names)].map(id=>SOURCES.find(s=>s.id===id));
}
