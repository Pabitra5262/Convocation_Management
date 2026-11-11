import { useId, useRef, type CSSProperties, type ReactNode } from 'react';
import { useMouseDepth } from '@/shared/hooks/useMouseDepth';

/* Ported from hims-ui-new pages/login/PlatformHub.tsx (labels are English; no translation layer in this project). */
const t = (s: string) => s;

/**
 * "Single Integrated Platform" hub for the login screen (design handoff: design_handoff_platform_hub_login),
 * drawn in isometric style to match the campus photo behind it: a round glass platform, a campus building as the
 * core, and the 8 stakeholder groups as blocks with their icons on the top face, joined to the core by data spokes.
 * Isometric drawings keep one scale everywhere (no perspective), so every block and label is the same size.
 * - `phase` follows sign-in: idle → verifying (faster inward traffic, ping round the core) → success (blocks, roof and
 *   spokes turn green and each block gets a check). Change the prop; never remount the hub, or the entrance replays.
 * - `motion="off"` stops the looping motion (pass it for Reduce motion). Keyframes live in login.css.
 */
export type HubPhase = 'idle' | 'verifying' | 'success';
export type HubMotion = 'calm' | 'standard' | 'lively' | 'off';

// Palette taken from the campus photo: brick facades, the sky, the trees and the sunrise.
const BRICK = '#C8643F';
const SKY = '#4F9FDB';
const LEAF = '#5F9E45';
const GOLD = '#E9A93B';
const GREEN = '#3E9B4F'; // success
const NAVY = '#0B1F4D';
const GLASS = '#8EC5EA';

// Isometric projection: world x runs down-right, y down-left, z up. Screen origin is the platform centre.
const CX = 410;
const CY = 295;
const COS = Math.cos(Math.PI / 6);
const P = (x: number, y: number, z = 0) => [CX + (x - y) * COS, CY + (x + y) * 0.5 - z] as const;
const pts = (list: readonly (readonly [number, number, number])[]) => list.map(([x, y, z]) => P(x, y, z).map((n) => n.toFixed(1)).join(',')).join(' ');
/** A world circle of radius r on the floor projects to this ellipse. */
const ell = (r: number) => ({ rx: r * COS * Math.SQRT2, ry: r * 0.5 * Math.SQRT2 });

const R = 240; // node ring radius
const DISC = 305; // platform radius
const NODE_A = 28; // half-width of a node block
const NODE_H = 34;
const PLINTH_A = 80;
const PLINTH_H = 18;
const CORE_A = 58;
const CORE_H = 80;

type IconKey = 'admin' | 'uni' | 'college' | 'pin' | 'dome' | 'cap' | 'users' | 'plug';
const NODES: readonly { name: string; sub: string; color: string; icon: IconKey }[] = [
  { name: 'Administrators (HED)', sub: 'Policy & planning', color: BRICK, icon: 'admin' },
  { name: 'Universities', sub: 'Academic ecosystem', color: SKY, icon: 'uni' },
  { name: 'Colleges', sub: 'College management', color: LEAF, icon: 'college' },
  { name: 'Regional Directorates', sub: 'Oversight & coordination', color: GOLD, icon: 'pin' },
  { name: 'Autonomous Bodies', sub: 'Data alignment', color: BRICK, icon: 'dome' },
  { name: 'Students & Parents', sub: 'Academic services', color: SKY, icon: 'cap' },
  { name: 'Public', sub: 'Transparent access', color: LEAF, icon: 'users' },
  { name: 'External Systems', sub: 'API integration', color: GOLD, icon: 'plug' },
];

/** 24px line icons; `c x y r` entries are circles. */
const ICONS: Record<IconKey | 'core' | 'check', readonly string[]> = {
  admin: ['c 12 7 3.2', 'M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20', 'M3 20h18'],
  uni: ['M3 9.5l9-5.5 9 5.5', 'M5.5 10v7.5M9.8 10v7.5M14.2 10v7.5M18.5 10v7.5', 'M3 20h18'],
  college: ['M4 20v-9l8-5 8 5v9', 'M10 20v-4.5h4V20', 'M12 6V2.5l3.5 1.2L12 5', 'M3 20h18'],
  pin: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z', 'c 12 9.5 2.6'],
  dome: ['M3 20h18', 'M5.5 20v-8h13v8', 'M8 12a4 4 0 0 1 8 0', 'M12 8V4.5', 'M9 16h0M12 16h0M15 16h0'],
  cap: ['M2 9.5l10-5 10 5-10 5z', 'M6 11.5v4.5c3.5 2.6 8.5 2.6 12 0v-4.5', 'M22 9.5V15'],
  users: ['c 9 8 3', 'M3 20v-.5a6 6 0 0 1 12 0v.5', 'c 17.2 9 2.4', 'M16.5 14.2a4.8 4.8 0 0 1 4.8 4.8v1'],
  plug: ['M9 2.5v4.5M15 2.5v4.5', 'M6 7h12v3.5a6 6 0 0 1-12 0z', 'M12 16.5v5'],
  core: ['M3 9.5l9-5.5 9 5.5', 'M5.5 10v7.5M9.8 10v7.5M14.2 10v7.5M18.5 10v7.5', 'M3 20h18'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
};

/** Mixes a hex colour toward black (k > 0) or white (k < 0). */
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(k >= 0 ? c * (1 - k) : c + (255 - c) * -k);
  return `rgb(${mix(n >> 16)} ${mix((n >> 8) & 255)} ${mix(n & 255)})`;
}

/** A line icon laid flat on a top face at world (x, y, z), `size` world units across. */
function FlatIcon({ name, x, y, z, size, stroke, width = 2.2 }: { name: keyof typeof ICONS; x: number; y: number; z: number; size: number; stroke: string; width?: number }) {
  const [sx, sy] = P(x, y, z);
  const k = size / 24;
  return (
    <g transform={`matrix(${COS * k} ${0.5 * k} ${-COS * k} ${0.5 * k} ${sx.toFixed(1)} ${sy.toFixed(1)})`}>
      <g transform="translate(-12 -12)" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
        {ICONS[name].map((d, i) => {
          if (!d.startsWith('c ')) return <path key={i} d={d} />;
          const [cx, cy, r] = d.slice(2).split(' ').map(Number);
          return <circle key={i} cx={cx} cy={cy} r={r} />;
        })}
      </g>
    </g>
  );
}

/** Box with its three visible faces, lit from the left like the sunrise in the photo. */
function Block({ x, y, a, z0, h, top, left, right, stroke }: { x: number; y: number; a: number; z0: number; h: number; top: string; left: string; right: string; stroke?: string }) {
  const z1 = z0 + h;
  const s = { stroke: stroke ?? 'rgb(255 255 255 / .35)', strokeWidth: 1, strokeLinejoin: 'round' as const };
  return (
    <g>
      <polygon points={pts([[x - a, y + a, z0], [x + a, y + a, z0], [x + a, y + a, z1], [x - a, y + a, z1]])} fill={left} {...s} />
      <polygon points={pts([[x + a, y - a, z0], [x + a, y + a, z0], [x + a, y + a, z1], [x + a, y - a, z1]])} fill={right} {...s} />
      <polygon points={pts([[x - a, y - a, z1], [x + a, y - a, z1], [x + a, y + a, z1], [x - a, y + a, z1]])} fill={top} {...s} />
    </g>
  );
}

/** Small campus tree: trunk and a round canopy with a lit side. */
function Tree({ x, y }: { x: number; y: number }) {
  const [sx, sy] = P(x, y);
  const e = ell(9);
  return (
    <g>
      <ellipse cx={sx + 6} cy={sy + 2} rx={e.rx} ry={e.ry} fill="#2B4A2A" fillOpacity={0.18} />
      <rect x={sx - 1.6} y={sy - 18} width={3.2} height={18} rx={1.2} fill="#8A5A3A" />
      <circle cx={sx} cy={sy - 26} r={13} fill="#4F8F3A" />
      <circle cx={sx - 4} cy={sy - 30} r={7} fill="#78B65A" />
    </g>
  );
}

const ORIGIN = { transformBox: 'fill-box', transformOrigin: 'center' } as const;
const MULTIPLIER: Record<HubMotion, number> = { calm: 1.6, standard: 1, lively: 0.6, off: 0 };
const f1 = (n: number) => n.toFixed(1);

/** Success: the green line to stakeholder i starts drawing from the building at spread(i) seconds and reaches the block 0.3 s later. */
const spread = (i: number) => 0.1 + i * 0.035;
const arrive = (i: number) => spread(i) + 0.3;
const vars = (v: Record<string, string>) => v as CSSProperties;

/** Mouse depth: how far each layer moves toward the pointer, as a share of the full 20px shift (login.css). */
const DEPTH = { trees: 0.4, blocks: 0.6, core: 1 } as const;
const layer = (k: number) => ({ '--k': k }) as CSSProperties;

export function PlatformHub({ phase = 'idle', motion = 'standard', showLabels = true, className }: { phase?: HubPhase; motion?: HubMotion; showLabels?: boolean; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const m = MULTIPLIER[motion];
  const loops = m > 0;
  const perSpoke = motion === 'lively' ? 3 : motion === 'calm' ? 1 : 2;
  const ok = phase === 'success';
  const svgRef = useRef<SVGSVGElement>(null);
  useMouseDepth(svgRef, loops, phase !== 'idle');
  const busy = phase === 'verifying';

  // Screen angle -90° (back) clockwise in 45° steps; the world angle is 45° less under the isometric turn.
  const nodes = NODES.map((n, i) => {
    const phi = ((-135 + i * 45) * Math.PI) / 180;
    const x = R * Math.cos(phi);
    const y = R * Math.sin(phi);
    const [sx, sy] = P(x, y);
    return { ...n, i, phi, x, y, sx, sy, depth: x + y };
  });
  const trees = [22.5, 112.5, 202.5, 292.5].map((deg) => {
    const phi = ((deg - 45) * Math.PI) / 180;
    return { x: 150 * Math.cos(phi), y: 150 * Math.sin(phi) };
  });

  const spoke = (p: (typeof nodes)[number]) => {
    const c = Math.cos(p.phi);
    const s = Math.sin(p.phi);
    const out = R - NODE_A / Math.max(Math.abs(c), Math.abs(s)) - 4;
    const inn = (PLINTH_A + 8) / Math.max(Math.abs(c), Math.abs(s));
    const [x1, y1] = P(out * c, out * s);
    const [x2, y2] = P(inn * c, inn * s);
    const d = `M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)}`;
    const n = busy ? 3 : perSpoke;
    const dur = (busy ? 0.9 : 2.6) * m;
    return (
      <g key={p.i}>
        <path d={d} pathLength={1} strokeDasharray={1} stroke="#9FBAD6" strokeWidth={2.5} strokeLinecap="round" fill="none"
          style={{ animation: `hubDraw .9s ease ${0.5 + p.i * 0.07}s both` }} />
        {/* the path runs block → building, so a negative offset reveals it from the building outward */}
        <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={ok ? 0 : -1} stroke={GREEN} strokeWidth={4} strokeLinecap="round" fill="none"
          style={{ transition: ok ? `stroke-dashoffset .3s ease-out ${spread(p.i)}s` : 'none' }} />
        <path d={d} stroke={p.color} strokeOpacity={ok ? 0 : 0.8} strokeWidth={2} strokeDasharray="4 7" fill="none" style={{ animation: 'hubFade .6s ease 1.4s both', transition: 'stroke-opacity .4s' }}>
          {loops && <animate attributeName="stroke-dashoffset" from={0} to={-22} dur={`${1.1 * m}s`} repeatCount="indefinite" />}
        </path>
        {loops &&
          Array.from({ length: n }, (_, k) => {
            // Odd packets travel outward, except while verifying when everything flows to the core.
            const outward = !busy && k % 2 === 1;
            const begin = `${-((k * dur) / n + p.i * 0.33)}s`;
            return (
              <circle key={`${busy ? 'b' : 'p'}${k}`} r={busy ? 4.5 : 5} fill={outward ? '#FFFFFF' : ok ? GREEN : p.color} stroke={outward ? p.color : '#FFFFFF'} strokeWidth={2} style={{ animation: 'hubFade .4s ease 1.6s both' }}>
                <animateMotion path={d} dur={`${dur}s`} begin={begin} repeatCount="indefinite" {...(outward ? { keyPoints: '1;0', keyTimes: '0;1', calcMode: 'linear' } : {})} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur={`${dur}s`} begin={begin} repeatCount="indefinite" />
              </circle>
            );
          })}
      </g>
    );
  };

  const node = (p: (typeof nodes)[number]) => {
    const color = ok ? GREEN : p.color;
    const halo = ell(50);
    const ring = ell(46);
    const shadow = ell(30);
    const bob = `${-p.i * 0.55}s`;
    const bobDur = `${4.2 * m}s`;
    // Back and side blocks are labelled above; the side ones nudge outward so they clear the blocks behind them.
    const above = p.depth < 1;
    const side = Math.abs(p.depth) < 1;
    const lx = p.sx + (side ? Math.sign(p.sx - CX) * 30 : 0);
    const topY = p.sy - NODE_A - NODE_H;
    const bottomY = p.sy + NODE_A;
    const nameY = above ? topY - 36 : bottomY + 30;
    const subY = nameY + 19;
    const [bx, by] = P(p.x + NODE_A * 0.2, p.y - NODE_A, NODE_H); // check badge near the block's right top corner
    return (
      <g key={`n${p.i}`} style={{ ...ORIGIN, animation: `hubPop .7s cubic-bezier(.2,.9,.3,1.25) ${0.25 + p.i * 0.07}s both` }}>
        <ellipse cx={p.sx} cy={p.sy} rx={halo.rx} ry={halo.ry} fill={color} fillOpacity={0.16} style={{ transition: `fill .3s ${arrive(p.i)}s` }}>
          {loops && <animate attributeName="rx" values={`${halo.rx * 0.85};${halo.rx * 1.1};${halo.rx * 0.85}`} dur={`${3.2 * m}s`} begin={`${-p.i * 0.4}s`} repeatCount="indefinite" />}
          {loops && <animate attributeName="ry" values={`${halo.ry * 0.85};${halo.ry * 1.1};${halo.ry * 0.85}`} dur={`${3.2 * m}s`} begin={`${-p.i * 0.4}s`} repeatCount="indefinite" />}
        </ellipse>
        <ellipse cx={p.sx} cy={p.sy} rx={ring.rx} ry={ring.ry} fill="none" stroke={GREEN} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={ok ? 0 : 1}
          style={{ transition: `stroke-dashoffset .35s ease ${arrive(p.i)}s` }} />
        <ellipse cx={p.sx + 4} cy={p.sy + 3} rx={shadow.rx} ry={shadow.ry} fill="#1E2F4A" fillOpacity={0.2} filter={`url(#${id('soft')})`}>
          {loops && <animate attributeName="rx" values={`${shadow.rx};${shadow.rx * 0.85};${shadow.rx}`} dur={bobDur} begin={bob} repeatCount="indefinite" />}
        </ellipse>

        <g>
          {loops && <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur={bobDur} begin={bob} repeatCount="indefinite" />}
          {/* turns green, bumps and gets its badge as the green line arrives (login.css .hub-node) */}
          <g className={ok ? 'hub-node is-ok' : 'hub-node'} style={vars({ '--arrive': `${arrive(p.i)}s` })}>
            <Block x={p.x} y={p.y} a={NODE_A} z0={2} h={NODE_H} top={color} left={shade(color, 0.12)} right={shade(color, 0.3)} />
            <FlatIcon name={p.icon} x={p.x} y={p.y} z={NODE_H + 2} size={34} stroke="#FFFFFF" />
            <g style={{ opacity: ok ? 1 : 0, transition: `opacity .25s ${arrive(p.i) + 0.08}s` }}>
              <circle cx={bx + 18} cy={by - 4} r={11} fill={GREEN} stroke="#fff" strokeWidth={2.5} />
              <path d={`M${f1(bx + 13)} ${f1(by - 4)} l3.6 3.6 l6.4 -6.4`} stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </g>

        {showLabels && (
          <g textAnchor="middle">
            <text x={lx} y={nameY} fontSize={20} fontWeight={800} letterSpacing="-.01em" className="hub-label">{t(p.name)}</text>
            <text x={lx} y={subY} fontSize={14.5} fontWeight={700} className="hub-sub">{t(p.sub)}</text>
          </g>
        )}
      </g>
    );
  };

  // Core building: a plinth, then a block with lettering on its left wall, windows on its right wall and the emblem on the roof.
  const zb = PLINTH_H;
  const zt = PLINTH_H + CORE_H;
  const zm = (zb + zt) / 2;
  const [lx, ly] = P(0, CORE_A, zm); // centre of the left wall
  const [rx, ry] = P(CORE_A, 0, zm); // centre of the right wall
  const wall = (face: 'left' | 'right', children: ReactNode) => (
    <g transform={face === 'left' ? `matrix(${COS} 0.5 0 1 ${f1(lx)} ${f1(ly)})` : `matrix(${-COS} 0.5 0 1 ${f1(rx)} ${f1(ry)})`}>{children}</g>
  );
  const windows: ReactNode[] = [];
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 4; col++)
      windows.push(<rect key={`${row}-${col}`} x={-CORE_A + 10 + col * 25} y={-24 + row * 20} width={16} height={13} rx={1.5} fill={GLASS} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={1} />);

  const back = nodes.filter((p) => p.depth < -1);
  const front = nodes.filter((p) => p.depth >= -1);
  const backTrees = trees.filter((tr) => tr.x + tr.y < 0);
  const frontTrees = trees.filter((tr) => tr.x + tr.y >= 0);
  const disc = ell(DISC);
  const orbit = ell(R);
  const inner = ell(R * 0.62);
  const ping = ell(PLINTH_A * 1.35);

  return (
    <svg ref={svgRef} viewBox="0 0 820 550" width="100%" height="100%" role="img" aria-label={t('Single Integrated Platform connecting eight stakeholder groups')}
      className={className} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={id('disc')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#EAF4FC" stopOpacity={0.6} />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#D7E8F7" />
          <stop offset="55%" stopColor="#B9D4EE" />
          <stop offset="100%" stopColor="#9EC0E3" />
        </linearGradient>
        <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={4} />
        </filter>
      </defs>

      {/* Platform: a glass disc with a sky-blue rim, the orbit and an inner ring */}
      <g style={{ animation: 'hubFade 1s ease .1s both' }}>
        <ellipse cx={CX + 8} cy={CY + 26} rx={disc.rx} ry={disc.ry} fill="#1E2F4A" fillOpacity={0.12} filter={`url(#${id('soft')})`} />
        <path d={`M${f1(CX - disc.rx)} ${CY} A${f1(disc.rx)} ${f1(disc.ry)} 0 0 0 ${f1(CX + disc.rx)} ${CY} L${f1(CX + disc.rx)} ${CY + 16} A${f1(disc.rx)} ${f1(disc.ry)} 0 0 1 ${f1(CX - disc.rx)} ${CY + 16} Z`} fill={`url(#${id('rim')})`} />
        <ellipse cx={CX} cy={CY} rx={disc.rx} ry={disc.ry} fill={`url(#${id('disc')})`} stroke="#FFFFFF" strokeWidth={2} />
        <ellipse cx={CX} cy={CY} rx={orbit.rx} ry={orbit.ry} fill="none" stroke="#9FBAD6" strokeWidth={1.5} strokeDasharray="3 9" pathLength={1000}>
          {loops && <animate attributeName="stroke-dashoffset" from={0} to={1000} dur={`${120 * m}s`} repeatCount="indefinite" />}
        </ellipse>
        <ellipse cx={CX} cy={CY} rx={inner.rx} ry={inner.ry} fill="none" stroke={ok ? GREEN : SKY} strokeOpacity={0.45} strokeWidth={2.5} strokeLinecap="round"
          strokeDasharray="150 40 70 40 90 50" pathLength={1000} style={{ transition: 'stroke .5s' }}>
          {loops && <animate attributeName="stroke-dashoffset" from={0} to={1000} dur={`${(busy ? 3 : 26) * m}s`} repeatCount="indefinite" />}
        </ellipse>
      </g>

      {/* Spokes lie on the floor under everything; back blocks and trees are drawn before the core so it hides them.
          The floor stays still; trees, blocks and the building sit in layers that drift toward the mouse by different amounts. */}
      {nodes.map(spoke)}
      <g className="hub-layer" style={layer(DEPTH.trees)}>{backTrees.map((tr, i) => <Tree key={`bt${i}`} {...tr} />)}</g>
      <g className="hub-layer" style={layer(DEPTH.blocks)}>{back.map(node)}</g>

      {/* Core building */}
      <g className="hub-layer" style={layer(DEPTH.core)}>
      <g style={{ ...ORIGIN, animation: 'hubPop .8s cubic-bezier(.2,.9,.3,1.2) 0s both' }}>
        {ok && <ellipse className="hub-wave" cx={CX} cy={CY} rx={ping.rx * 1.6} ry={ping.ry * 1.6} fill="none" stroke={GREEN} strokeWidth={4} />}
        {busy && <ellipse cx={CX} cy={CY} rx={ping.rx} ry={ping.ry} fill="none" stroke={SKY} strokeWidth={3} style={{ ...ORIGIN, animation: 'hubPing 1.1s ease-out infinite' }} />}
        <ellipse cx={CX + 10} cy={CY + 10} rx={ell(PLINTH_A * 1.3).rx} ry={ell(PLINTH_A * 1.3).ry} fill="#1E2F4A" fillOpacity={0.16} filter={`url(#${id('soft')})`} />
        <Block x={0} y={0} a={PLINTH_A} z0={0} h={PLINTH_H} top="#FBF6EC" left="#E9DCC6" right="#D6C3A4" />
        <Block x={0} y={0} a={CORE_A} z0={zb} h={CORE_H} top="#FFFFFF" left="#F7F1E6" right="#E4D7C0" />
        {/* brick bands along the top of both walls, like the campus facades */}
        {wall('left', <rect x={-CORE_A} y={-CORE_H / 2} width={CORE_A * 2} height={7} fill={ok ? GREEN : BRICK} style={{ transition: 'fill .3s' }} />)}
        {wall('right', <rect x={-CORE_A} y={-CORE_H / 2} width={CORE_A * 2} height={7} fill={ok ? GREEN : BRICK} style={{ transition: 'fill .3s' }} />)}
        {wall('right', <g>{windows}</g>)}
        {wall('left', (
          <g textAnchor="middle" fontWeight={800} fill={NAVY} letterSpacing=".04em">
            <g style={{ opacity: ok ? 0 : 1, transition: 'opacity .2s' }}>
              <text x={0} y={-6} fontSize={13}>SINGLE</text>
              <text x={0} y={11} fontSize={13}>INTEGRATED</text>
              <text x={0} y={28} fontSize={13}>PLATFORM</text>
            </g>
            <g style={{ opacity: ok ? 1 : 0, transition: 'opacity .25s .15s' }} fill={GREEN}>
              <text x={0} y={3} fontSize={14}>ACCESS</text>
              <text x={0} y={21} fontSize={14}>GRANTED</text>
            </g>
          </g>
        ))}
        {/* roof: parapet, a raised panel and the emblem (a check once access is granted) */}
        <polygon points={pts([[-CORE_A + 9, -CORE_A + 9, zt], [CORE_A - 9, -CORE_A + 9, zt], [CORE_A - 9, CORE_A - 9, zt], [-CORE_A + 9, CORE_A - 9, zt]])}
          fill={ok ? '#E3F3E6' : '#EDF5FC'} stroke={ok ? GREEN : SKY} strokeOpacity={0.4} style={{ transition: 'fill .3s' }} />
        <g style={{ opacity: ok ? 0 : 1, transition: 'opacity .2s' }}>
          <FlatIcon name="core" x={0} y={0} z={zt} size={52} stroke={BRICK} width={2} />
        </g>
        {/* on success the roof shows an upright green check badge (a flat check reads as an "L") */}
        {ok && (() => {
          const [rx, ry] = P(0, 0, zt + 4);
          return (
            <g className="hub-roof-ok">
              <circle cx={rx} cy={ry - 10} r={22} fill={GREEN} stroke="#FFFFFF" strokeWidth={3} />
              <path d={`M${f1(rx - 9)} ${f1(ry - 10)} l6 6 l12 -12`} stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })()}
      </g>
      </g>

      <g className="hub-layer" style={layer(DEPTH.trees)}>{frontTrees.map((tr, i) => <Tree key={`ft${i}`} {...tr} />)}</g>
      <g className="hub-layer" style={layer(DEPTH.blocks)}>{front.map(node)}</g>
    </svg>
  );
}
