import type { ShadowEffect, ShapeKind } from "@/components/handoutbuilder/handoutCanvasTypes";
import { clamp } from "@/components/handoutbuilder/handoutCanvasUtils";
import { toSvgColor } from "@/components/handoutbuilder/handoutCanvasEffects";

type ShapeSize = {
  width: number;
  height: number;
};

function scaleX(value: number, size: ShapeSize) {
  return (value / 100) * size.width;
}

function scaleY(value: number, size: ShapeSize) {
  return (value / 100) * size.height;
}

function pointsToPath(points: Array<[number, number]>, size: ShapeSize) {
  const segments = points.map(([x, y], index) => {
    const px = scaleX(x, size);
    const py = scaleY(y, size);
    return `${index === 0 ? "M" : "L"}${px} ${py}`;
  });
  return `${segments.join(" ")} Z`;
}

export function renderShapeElement(
  kind: ShapeKind,
  cornerRadius: number,
  size: ShapeSize,
  props: { className?: string; fill?: string; filterId?: string | null; style?: React.CSSProperties },
) {
  const radius = clamp(cornerRadius, 0, 50);
  const { className, fill = "currentColor", filterId, style } = props;
  const filter = filterId ? `url(#${filterId})` : undefined;
  const rectRadiusX = (radius / 100) * size.width;
  const rectRadiusY = (radius / 100) * size.height;

  switch (kind) {
    case "rect":
      return (
        <rect
          x="0"
          y="0"
          width={size.width}
          height={size.height}
          rx={rectRadiusX}
          ry={rectRadiusY}
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "ellipse":
      return (
        <ellipse
          cx={size.width / 2}
          cy={size.height / 2}
          rx={size.width / 2}
          ry={size.height / 2}
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "triangle":
      return (
        <path
          d={pointsToPath(
            [
              [50, 6],
              [96, 94],
              [4, 94],
            ],
            size,
          )}
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "diamond":
      return (
        <path
          d={pointsToPath(
            [
              [50, 4],
              [96, 50],
              [50, 96],
              [4, 50],
            ],
            size,
          )}
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "hexagon":
      return (
        <path
          d={pointsToPath(
            [
              [24, 6],
              [76, 6],
              [96, 50],
              [76, 94],
              [24, 94],
              [4, 50],
            ],
            size,
          )}
          className={className}
          fill={fill}
          style={style}
          filter={filter}
        />
      );
    case "star":
      return (
        <path
          d={pointsToPath(
            [
              [50, 6],
              [62, 38],
              [96, 38],
              [68, 58],
              [78, 92],
              [50, 72],
              [22, 92],
              [32, 58],
              [4, 38],
              [38, 38],
            ],
            size,
          )}
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
