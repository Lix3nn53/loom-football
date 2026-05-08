import type { CalendarDateProps, CalendarMonthProps, CalendarMultiProps, CalendarRangeProps } from "cally";

declare module "react" {
    interface CSSProperties {
        "anchor-name"?: string;
        anchorName?: string;
        positionAnchor?: string;
        "position-anchor"?: string;
        "--value"?: string | number;
        "--thickness"?: string | number;
        "--size"?: string | number;
    }
    namespace JSX {
        interface IntrinsicElements {
            "calendar-month": CalendarMonthProps &
                HTMLAttributes<HTMLElement> & { onchange?: FormEventHandler<HTMLInputElement> };
            "calendar-range": CalendarRangeProps &
                HTMLAttributes<HTMLElement> & { onchange?: FormEventHandler<HTMLInputElement> };
            "calendar-date": CalendarDateProps &
                HTMLAttributes<HTMLElement> & { onchange?: FormEventHandler<HTMLInputElement> };
            "calendar-multi": CalendarMultiProps &
                HTMLAttributes<HTMLElement> & { onchange?: FormEventHandler<HTMLInputElement> };
        }
    }
}
