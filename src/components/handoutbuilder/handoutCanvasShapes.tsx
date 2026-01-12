import type { ShadowEffect, ShapeKind } from "@/components/handoutbuilder/handoutCanvasTypes";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import { toSvgColor } from "@/components/handoutbuilder/handoutCanvasEffects";

export function renderShapeElement(
  kind: ShapeKind,
  cornerRadius: number,
  props: { className?: string; fill?: string; filterId?: string | null; style?: React.CSSProperties },
) {
  const radius = clamp(cornerRadius, 0, 50);
  const { className, fill = "currentColor", filterId, style } = props;
  const filter = filterId ? `url(#${filterId})` : undefined;

  switch (kind) {
    case "rect":
      return (
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx={radius}
          ry={radius}
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "ellipse":
      return (
        <ellipse
          cx="50"
          cy="50"
          rx="50"
          ry="50"
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "triangle":
      return <path d="M50 6 L96 94 L4 94 Z" className={className} fill={fill} style={style} filter={filter} />;
    case "diamond":
      return <path d="M50 4 L96 50 L50 96 L4 50 Z" className={className} fill={fill} style={style} filter={filter} />;
    case "hexagon":
      return (
        <path
          d="M24 6 L76 6 L96 50 L76 94 L24 94 L4 50 Z"
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "star":
      return (
        <path
          d="M50 6 L62 38 L96 38 L68 58 L78 92 L50 72 L22 92 L32 58 L4 38 L38 38 Z"
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    default:
      return null;
  }
}

export function renderInnerShadowFilter(id: string, shadow: ShadowEffect) {
  if (!shadow.enabled || shadow.opacity <= 0) return null;
  const spreadRadius = Math.max(0, Math.abs(shadow.spread));
  const spreadOperator = shadow.spread >= 0 ? "dilate" : "erode";
  const blur = Math.max(0, shadow.blur);
  const color = toSvgColor(shadow.color);
  const opacity = clamp(shadow.opacity, 0, 1);

  return (
    <svg className="handout-layer-filter" aria-hidden="true" focusable="false">
      <filter
        id={id}
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
        filterUnits="objectBoundingBox"
        primitiveUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feMorphology in="SourceAlpha" operator={spreadOperator} radius={spreadRadius} result="spread" />
        <feOffset in="spread" dx={shadow.x} dy={shadow.y} result="offset" />
        <feGaussianBlur in="offset" stdDeviation={blur} result="blur" />
        <feComposite in="blur" in2="spread" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
        <feFlood floodColor={color} floodOpacity={opacity} result="shadowColor" />
        <feComposite in="shadowColor" in2="innerShadow" operator="in" result="shadow" />
      </filter>
    </svg>
  );
}
