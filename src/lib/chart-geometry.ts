// Arc geometry — pure spatial transform from schedule facts to SVG arc + label
// placement for the dual-ring 24-hour clock chart. No React. See CONTEXT.md.

import { ProcessedActivity } from './schedule';

// Clock-face layout, in SVG user units (the chart's viewBox is 0 0 500 500).
export const CENTER = 250;

interface RingRadii {
  outer: number;
  inner: number;
}

// Daytime activities sit on the inner ring (a filled pie), nighttime on the
// outer ring (a donut band).
const RING: Record<ProcessedActivity['zone'], RingRadii> = {
  inner: { outer: 120, inner: 0 },
  outer: { outer: 200, inner: 130 },
};

export interface ArcGeometry {
  pathData: string;
  label: { x: number; y: number; rotation: number };
}

// Minutes-since-midnight to an angle on a 12-hour clock face, rotated so 12
// sits at the top (SVG's 0° is at 3 o'clock). `hours % 12` means an overnight
// end time (e.g. 30:00) maps to the same angle as its in-day equivalent.
const timeToAngle = (timeMinutes: number): number => {
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  const h = hours % 12;
  const angle = h * 30 + (minutes / 60) * 30;
  return (angle - 90 + 360) % 360;
};

const polar = (radius: number, angleDeg: number): [number, number] => {
  const rad = (angleDeg * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
};

// Turn one Processed Activity into the SVG arc path and label placement for its
// ring. Owns the overnight wraparound: a non-positive angular span is the
// clockwise sweep through midnight, so 360° is added once.
export const activityArc = (activity: ProcessedActivity): ArcGeometry => {
  const { outer: outerRadius, inner: innerRadius } = RING[activity.zone];

  const startAngle = timeToAngle(activity.startMinutes);
  const endAngle = timeToAngle(activity.endMinutes);

  let angleWidth = endAngle - startAngle;
  if (angleWidth <= 0) angleWidth += 360;
  const sweepEndAngle = startAngle + angleWidth;

  const [x1, y1] = polar(outerRadius, startAngle);
  const [x2, y2] = polar(outerRadius, sweepEndAngle);
  const [x3, y3] = polar(innerRadius, sweepEndAngle);
  const [x4, y4] = polar(innerRadius, startAngle);

  const largeArcFlag = angleWidth > 180 ? 1 : 0;

  const pathData = [
    `M ${x1} ${y1}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');

  const midAngle = startAngle + angleWidth / 2;
  const textRadius = (outerRadius + innerRadius) / 2;
  const [labelX, labelY] = polar(textRadius, midAngle);

  // Flip text on the left half (90°–270°) so it stays upright.
  const isLeftHalf = midAngle > 90 && midAngle < 270;
  const rotation = isLeftHalf ? midAngle + 180 : midAngle;

  return {
    pathData,
    label: { x: labelX, y: labelY, rotation },
  };
};
